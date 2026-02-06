# Feature 4: Critical Data Integrity Issues - Quick Reference

**Last Updated:** 2026-02-06
**Risk Level:** HIGH - 3 Critical, 3 Moderate findings
**Action Required:** YES - Before production deployment

---

## Critical Issues at a Glance

### Issue #1: Race Condition Between Auto-Save & Manual Save

**File:** `app.js` lines 300-332
**Problem:** Multiple overlapping storage operations can cause data loss
**Risk:** CRITICAL

```javascript
// CURRENT (BROKEN):
function saveEdit() {
  appState.currentFile.content = editorTextarea.value;
  saveToStorage();  // No return value check
  appState.edit.hasUnsavedChanges = false;  // Set BEFORE verifying success
}

function autoSaveEdit() {
  editSaveTimeout = setTimeout(() => {
    appState.currentFile.content = editorTextarea.value;  // Might race with saveEdit()
    saveToStorage();
  }, EDIT_SAVE_DEBOUNCE_MS);
}
```

**What Can Go Wrong:**
```
Time 100ms:  User clicks Save
              └─> saveToStorage() call #1 starts
Time 200ms:  User types more content
              └─> Auto-save fires
              └─> saveToStorage() call #2 starts (overlapping!)
Result:      Last write wins, but first write is lost
```

**Quick Fix:** Add serialization flag
```javascript
let isSavingInProgress = false;

function autoSaveEdit() {
  if (isSavingInProgress) {
    clearTimeout(editSaveTimeout);
    editSaveTimeout = setTimeout(autoSaveEdit, EDIT_SAVE_DEBOUNCE_MS);
    return;
  }
  // ... schedule save ...
}
```

---

### Issue #2: Storage Failures Not Checked

**File:** `app.js` lines 267, 310, 328, 429, 475, 511
**Problem:** `saveToStorage()` return value is never checked
**Risk:** CRITICAL

```javascript
// CURRENT (BROKEN):
function exitEditMode(saveChanges) {
  if (saveChanges && appState.edit.hasUnsavedChanges) {
    appState.currentFile.content = editorTextarea.value;
    saveToStorage();  // ← Return value ignored!
  }
  appState.edit.hasUnsavedChanges = false;  // ← Lies to user if save failed
}

// SAME PATTERN IN:
// - saveEdit() line 328
// - autoSaveEdit() line 310
// - handleFile() line 429
// - selectFile() line 475
// - deleteFile() line 511
```

**What Can Go Wrong:**
```
1. User edits file, hits Save button
2. Browser storage quota exceeded
3. saveToStorage() returns false
4. But app sets hasUnsavedChanges = false anyway
5. User closes tab, believing content is saved
6. Content is lost
```

**Quick Fix:** Check return value everywhere
```javascript
function saveEdit() {
  appState.currentFile.content = editorTextarea.value;

  const saved = saveToStorage();

  if (saved) {
    appState.edit.hasUnsavedChanges = false;
    clearError();
  } else {
    // Keep flag true and show error
    showError("Failed to save. Check storage quota.");
  }
}
```

---

### Issue #3: Original Content Backup Lost on File Switch

**File:** `app.js` lines 272, 447-455
**Problem:** `originalContent` cleared before verifying changes were saved
**Risk:** CRITICAL

```javascript
// CURRENT (BROKEN):
function selectFile(fileId) {
  if (appState.edit.isActive && appState.edit.hasUnsavedChanges) {
    if (!confirmDiscardChanges()) {
      return;  // User cancels, stays in edit mode
    }
    exitEditMode(false);  // Exit without saving
  }
  // Switch to new file
  appState.currentFileId = fileId;
  appState.currentFile = file;
}

function exitEditMode(saveChanges) {
  appState.edit.originalContent = "";  // ← Backup lost here
  appState.edit.hasUnsavedChanges = false;
}
```

**What Can Go Wrong:**
```
1. Load File A, enter edit mode, make changes
2. Click File B to switch
3. Confirm discard (user agrees changes are lost)
4. exitEditMode(false) clears originalContent backup
5. If storage error occurred during cleanup, no recovery path exists
```

**Quick Fix:** Verify before clearing backup
```javascript
function exitEditMode(saveChanges) {
  const savedContent = appState.edit.originalContent;  // Backup the backup

  if (saveChanges && appState.edit.hasUnsavedChanges) {
    appState.currentFile.content = editorTextarea.value;
    const saved = saveToStorage();
    if (!saved) {
      appState.edit.originalContent = savedContent;
      return;  // Don't exit, save failed
    }
  }

  appState.edit.isActive = false;
  appState.edit.hasUnsavedChanges = false;
  appState.edit.originalContent = "";  // Safe to clear
}
```

---

## Secondary Issues Summary

### Issue #4: Duplicate Edit Mode Entry Corrupts Backup

**File:** `app.js` lines 228-232
**Problem:** No guard against entering edit mode while already editing

```javascript
// CURRENT (BROKEN):
if (editBtn) {
  editBtn.addEventListener("click", enterEditMode);  // No re-entrance check
}

function enterEditMode() {
  if (!appState.currentFile) return;

  appState.edit.isActive = true;
  appState.edit.originalContent = appState.currentFile.content;
  // If user modifies content object elsewhere, backup is now wrong!
}
```

**Fix:**
```javascript
function enterEditMode() {
  if (!appState.currentFile) return;
  if (appState.edit.isActive) {  // Already editing
    console.warn("Already in edit mode");
    return;
  }
  appState.edit.isActive = true;
  appState.edit.originalContent = appState.currentFile.content;
}
```

---

### Issue #5: Missing localStorage Quota Checks During Editing

**File:** `app.js` lines 1219-1224
**Problem:** User can type indefinitely without knowing if save will succeed

```javascript
// CURRENT (BROKEN):
if (editorTextarea) {
  editorTextarea.addEventListener("input", () => {
    appState.edit.hasUnsavedChanges = currentContent !== appState.edit.originalContent;
    updateEditorStats();
    autoSaveEdit();  // ← Can fail silently
  });
}
```

**What Can Go Wrong:**
```
1. Storage at 80% (4MB of 5MB)
2. User loads 2MB file
3. User adds 1.5MB of content
4. Total = 5.5MB > quota
5. Auto-save fails (returns false)
6. But user sees text in editor, assumes saved
7. User closes tab: content lost
```

**Fix:**
```javascript
if (editorTextarea) {
  editorTextarea.addEventListener("input", (event) => {
    const currentContent = event.target.value;
    appState.edit.hasUnsavedChanges = currentContent !== appState.edit.originalContent;

    // Warn if storage pressure is high
    const usage = getStorageUsagePercent();
    if (usage > 70) {
      console.warn(`Storage ${usage}% full, auto-save may fail`);
    }

    updateEditorStats();
    autoSaveEdit();
  });
}
```

---

## Impact Matrix

| Issue | Type | Likelihood | Severity | User Impact |
|-------|------|------------|----------|------------|
| #1: Race condition | Concurrency | MEDIUM | HIGH | Lost edits, corrupted files |
| #2: Storage not checked | Logic | HIGH | CRITICAL | Silent data loss |
| #3: Backup lost | State | MEDIUM | HIGH | Unrecoverable edits |
| #4: Duplicate entry | Logic | LOW | MEDIUM | Data corruption if combined |
| #5: No quota check | UX | HIGH | MEDIUM | Silent data loss risk |

---

## Reproduction Steps

### Reproduce Issue #2 (Most Common)

1. Open developer tools (F12)
2. Paste into console: `Object.defineProperty(Storage.prototype, 'setItem', { value: () => { throw new Error('QuotaExceededError'); } })`
3. Load a markdown file
4. Click "Edit" button
5. Type some content
6. Click "Save" button
7. Check console: error should show
8. Check UI: App will claim save succeeded, but it failed
9. Close browser
10. Reopen: Content is lost

### Reproduce Issue #1 (Race Condition)

1. Open markdown file
2. Click "Edit"
3. Type character
4. Immediately (within 500ms): Click "Save"
5. Before save completes: Type more characters
6. Result: Auto-save and manual save race, one might lose data

---

## Fix Priority & Effort

| Issue | Priority | Effort | Status |
|-------|----------|--------|--------|
| #2: Storage checks | CRITICAL | 2 hours | Not fixed |
| #1: Race condition | CRITICAL | 3 hours | Not fixed |
| #3: Backup safety | CRITICAL | 2 hours | Not fixed |
| #4: Duplicate entry | HIGH | 30 mins | Not fixed |
| #5: Quota warning | HIGH | 1 hour | Not fixed |
| **TOTAL** | - | **8.5 hours** | Not started |

---

## Files Requiring Changes

- `app.js`: Lines 228, 232, 262-272, 300-314, 320-332, 429, 475, 511, 1219-1224
- `storage.js`: Optional - add more detailed logging (recommended)

---

## Testing Before/After

**Before Fixes:**
- Create file, edit, force storage failure → App lies about success
- Edit file, switch while saving → Possible corruption
- Rapid save + switch + save → Race condition possible

**After Fixes:**
- Create file, edit, force storage failure → Error shown, content not lost
- Edit file, switch while saving → Proper serialization prevents races
- Rapid operations → Atomic transitions, no race conditions

---

## Next Steps

1. **Implement fixes** in order: #2 → #1 → #3 → #4 → #5
2. **Test recovery scenarios** - simulate storage failures
3. **Load test** - add 4MB+ of content and verify quota handling
4. **Create integration tests** for race conditions
5. **Update documentation** about storage limits and recovery

**Reference:** See full analysis in `plans/feature-4-edit-save-data-integrity-review.md`

