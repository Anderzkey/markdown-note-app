# Feature 4: Data Integrity Fixes - Implementation Guide

**Date:** 2026-02-06
**Fixes for:** 5 critical and major data integrity issues
**Estimated Duration:** 8-10 hours (implementation + testing)

---

## Overview

This document provides complete, production-ready code fixes for the data integrity issues identified in Feature 4: Edit & Save Mode. Each fix is standalone and can be implemented independently, but should follow the suggested order for validation.

---

## Fix #1: Storage Success Verification (CRITICAL)

**Impact:** Prevents silent data loss when storage fails
**Files to Modify:** `app.js`
**Lines to Change:** 267, 310, 328, 429, 475, 511

### Step 1: Update saveEdit() Function

**Current Code (Lines 320-332):**
```javascript
function saveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;

  // Clear any pending auto-save
  clearTimeout(editSaveTimeout);

  // Save immediately
  appState.currentFile.content = editorTextarea.value;
  saveToStorage();
  appState.edit.hasUnsavedChanges = false;

  clearError();
}
```

**Fixed Code:**
```javascript
function saveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;

  // Clear any pending auto-save
  clearTimeout(editSaveTimeout);

  // Save immediately
  appState.currentFile.content = editorTextarea.value;

  // Verify storage succeeded before marking as saved
  const saveSuccess = saveToStorage();

  if (saveSuccess) {
    appState.edit.hasUnsavedChanges = false;
    clearError();
  } else {
    // Keep unsaved flag true and show error
    showError("Failed to save changes. Check storage quota.");
  }
}
```

### Step 2: Update exitEditMode() Function

**Current Code (Lines 262-294):**
```javascript
function exitEditMode(saveChanges) {
  if (!appState.edit.isActive) return;

  if (saveChanges && appState.edit.hasUnsavedChanges) {
    appState.currentFile.content = editorTextarea.value;
    saveToStorage();
  }

  appState.edit.isActive = false;
  appState.edit.hasUnsavedChanges = false;
  appState.edit.originalContent = "";

  // Show preview, hide editor
  if (editorEl) editorEl.style.display = "none";
  if (previewEl) previewEl.style.display = "block";

  // Render updated markdown if changes were saved
  if (saveChanges && appState.currentFile) {
    renderMarkdown(appState.currentFile.content);
  }

  // Update button visibility
  if (editBtn) editBtn.style.display = "inline-block";
  if (saveEditBtn) saveEditBtn.style.display = "none";
  if (cancelEditBtn) cancelEditBtn.style.display = "none";
  if (previewEditBtn) previewEditBtn.style.display = "none";
  if (exportPdfBtn) exportPdfBtn.disabled = false;

  // Re-enable search
  if (searchInput && appState.currentFile) searchInput.disabled = false;

  clearError();
}
```

**Fixed Code:**
```javascript
/**
 * Exits edit mode
 * @param {boolean} saveChanges - Whether to save changes before exiting
 */
function exitEditMode(saveChanges) {
  if (!appState.edit.isActive) return;

  // Save original content backup in case we need recovery
  const savedBackup = appState.edit.originalContent;

  if (saveChanges && appState.edit.hasUnsavedChanges) {
    appState.currentFile.content = editorTextarea.value;

    // Verify storage succeeded
    const saveSuccess = saveToStorage();

    if (!saveSuccess) {
      // Restore backup and don't exit edit mode
      appState.edit.originalContent = savedBackup;
      showError("Failed to save changes. Remaining in edit mode.");
      return;
    }
  }

  // Safe to clear state after successful save (or discard confirmed)
  appState.edit.isActive = false;
  appState.edit.hasUnsavedChanges = false;
  appState.edit.originalContent = "";

  // Show preview, hide editor
  if (editorEl) editorEl.style.display = "none";
  if (previewEl) previewEl.style.display = "block";

  // Render updated markdown if changes were saved
  if (saveChanges && appState.currentFile) {
    renderMarkdown(appState.currentFile.content);
  }

  // Update button visibility
  if (editBtn) editBtn.style.display = "inline-block";
  if (saveEditBtn) saveEditBtn.style.display = "none";
  if (cancelEditBtn) cancelEditBtn.style.display = "none";
  if (previewEditBtn) previewEditBtn.style.display = "none";
  if (exportPdfBtn) exportPdfBtn.disabled = false;

  // Re-enable search
  if (searchInput && appState.currentFile) searchInput.disabled = false;

  clearError();
}
```

### Step 3: Update autoSaveEdit() Function

**Current Code (Lines 300-314):**
```javascript
function autoSaveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;

  // Clear any pending auto-save
  clearTimeout(editSaveTimeout);

  // Schedule new auto-save
  editSaveTimeout = setTimeout(() => {
    if (appState.edit.isActive && appState.edit.hasUnsavedChanges) {
      appState.currentFile.content = editorTextarea.value;
      saveToStorage();
      appState.edit.hasUnsavedChanges = false;
    }
  }, EDIT_SAVE_DEBOUNCE_MS);
}
```

**Fixed Code:**
```javascript
/**
 * Auto-saves changes after a debounce period
 * Debounce prevents excessive saves during rapid typing
 */
function autoSaveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;

  // Clear any pending auto-save
  clearTimeout(editSaveTimeout);

  // Schedule new auto-save
  editSaveTimeout = setTimeout(() => {
    if (appState.edit.isActive && appState.edit.hasUnsavedChanges) {
      appState.currentFile.content = editorTextarea.value;

      // Only clear unsaved flag if save succeeded
      const saveSuccess = saveToStorage();

      if (saveSuccess) {
        appState.edit.hasUnsavedChanges = false;
      } else {
        // Keep flag true and log for debugging
        console.warn("Auto-save failed, will retry on next change");
      }
    }
  }, EDIT_SAVE_DEBOUNCE_MS);
}
```

### Step 4: Update Other Locations

Also apply storage verification to:

**Line 429 in handleFile():**
```javascript
// Before: saveToStorage();
// After:
const saved = saveToStorage();
if (!saved) {
  showError("File added to memory but failed to persist. Check storage quota.");
}
```

**Line 475 in selectFile():**
```javascript
// Before: saveToStorage();
// After:
const saved = saveToStorage();
if (!saved) {
  showError("File selected but failed to persist. Check storage quota.");
}
```

**Line 511 in deleteFile():**
```javascript
// Before: saveToStorage();
// After:
const saved = saveToStorage();
if (!saved) {
  showError("File deletion failed to persist. Check storage quota.");
  // Optionally: restore the file to appState.files
}
```

---

## Fix #2: Prevent Race Conditions (CRITICAL)

**Impact:** Prevents overlapping save operations that could lose data
**Files to Modify:** `app.js`
**Lines to Change:** Add new global variable, modify saveEdit(), autoSaveEdit()

### Step 1: Add Serialization Flag

**Add after line 62 (after searchTimeout declaration):**
```javascript
// Debounce timers
let searchTimeout;
let editSaveTimeout;
let isSavingInProgress = false;  // ← NEW: Prevent concurrent saves
```

### Step 2: Update saveEdit() with Lock

**Current Code:**
```javascript
function saveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;

  clearTimeout(editSaveTimeout);

  appState.currentFile.content = editorTextarea.value;
  const saveSuccess = saveToStorage();

  if (saveSuccess) {
    appState.edit.hasUnsavedChanges = false;
    clearError();
  } else {
    showError("Failed to save changes. Check storage quota.");
  }
}
```

**Fixed Code:**
```javascript
/**
 * Explicitly saves changes without debounce
 * Called when user clicks Save button
 * Prevents concurrent saves from racing each other
 */
function saveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;

  // Prevent concurrent saves if one is already in progress
  if (isSavingInProgress) {
    showError("Save in progress. Please wait.");
    return;
  }

  clearTimeout(editSaveTimeout);

  isSavingInProgress = true;
  try {
    appState.currentFile.content = editorTextarea.value;

    const saveSuccess = saveToStorage();

    if (saveSuccess) {
      appState.edit.hasUnsavedChanges = false;
      clearError();
    } else {
      showError("Failed to save changes. Check storage quota.");
    }
  } finally {
    isSavingInProgress = false;
  }
}
```

### Step 3: Update autoSaveEdit() with Lock

**Current Code:**
```javascript
function autoSaveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;

  clearTimeout(editSaveTimeout);

  editSaveTimeout = setTimeout(() => {
    if (appState.edit.isActive && appState.edit.hasUnsavedChanges) {
      appState.currentFile.content = editorTextarea.value;

      const saveSuccess = saveToStorage();

      if (saveSuccess) {
        appState.edit.hasUnsavedChanges = false;
      } else {
        console.warn("Auto-save failed, will retry on next change");
      }
    }
  }, EDIT_SAVE_DEBOUNCE_MS);
}
```

**Fixed Code:**
```javascript
/**
 * Auto-saves changes after a debounce period
 * Debounce prevents excessive saves during rapid typing
 * Serialization prevents concurrent saves from racing
 */
function autoSaveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;

  // Clear any pending auto-save
  clearTimeout(editSaveTimeout);

  // Schedule new auto-save, but don't overlap with manual saves
  editSaveTimeout = setTimeout(() => {
    // Don't auto-save if a manual save is in progress
    if (isSavingInProgress) {
      // Re-schedule for later instead of losing the save
      editSaveTimeout = setTimeout(() => {
        if (appState.edit.isActive && appState.edit.hasUnsavedChanges) {
          performAutoSave();
        }
      }, EDIT_SAVE_DEBOUNCE_MS);
      return;
    }

    if (appState.edit.isActive && appState.edit.hasUnsavedChanges) {
      performAutoSave();
    }
  }, EDIT_SAVE_DEBOUNCE_MS);
}

/**
 * Performs the actual auto-save operation
 * Separated for reusability and clarity
 * @private
 */
function performAutoSave() {
  isSavingInProgress = true;
  try {
    appState.currentFile.content = editorTextarea.value;

    const saveSuccess = saveToStorage();

    if (saveSuccess) {
      appState.edit.hasUnsavedChanges = false;
    } else {
      console.warn("Auto-save failed, will retry on next change");
    }
  } finally {
    isSavingInProgress = false;
  }
}
```

---

## Fix #3: Protect Original Content Backup (CRITICAL)

**Impact:** Prevents backup corruption during state transitions
**Files to Modify:** `app.js`
**Lines to Change:** 228-256 (enterEditMode), 262-294 (exitEditMode)

### Step 1: Guard Against Duplicate Entry

**Current Code (Lines 228-256):**
```javascript
function enterEditMode() {
  if (!appState.currentFile) return;

  appState.edit.isActive = true;
  appState.edit.originalContent = appState.currentFile.content;
  appState.edit.hasUnsavedChanges = false;

  // ... rest of function ...
}
```

**Fixed Code:**
```javascript
/**
 * Enters edit mode for the current file
 * Backs up content and shows the editor textarea
 * Guards against re-entrance to prevent backup corruption
 */
function enterEditMode() {
  if (!appState.currentFile) return;

  // Guard: Prevent entering edit mode while already editing
  if (appState.edit.isActive) {
    console.warn("Already in edit mode for current file");
    if (editorTextarea) editorTextarea.focus();
    return;
  }

  appState.edit.isActive = true;
  // Verify content exists before backing up
  appState.edit.originalContent = appState.currentFile.content || "";
  appState.edit.hasUnsavedChanges = false;

  // Hide preview, show editor
  if (previewEl) previewEl.style.display = "none";
  if (editorEl) editorEl.style.display = "flex";
  if (editorTextarea) {
    editorTextarea.value = appState.currentFile.content || "";
    editorTextarea.focus();
  }

  // Update button visibility
  if (editBtn) editBtn.style.display = "none";
  if (saveEditBtn) saveEditBtn.style.display = "inline-block";
  if (cancelEditBtn) cancelEditBtn.style.display = "inline-block";
  if (previewEditBtn) previewEditBtn.style.display = "inline-block";
  if (exportPdfBtn) exportPdfBtn.disabled = true;

  // Clear search when entering edit mode
  clearSearch();
  if (searchInput) searchInput.disabled = true;

  updateEditorStats();
  clearError();
}
```

### Step 2: Safer Backup Handling in exitEditMode()

This was already addressed in Fix #1, but here's the complete safe version:

```javascript
/**
 * Exits edit mode
 * @param {boolean} saveChanges - Whether to save changes before exiting
 */
function exitEditMode(saveChanges) {
  if (!appState.edit.isActive) return;

  // Protect backup: Save a copy in case recovery is needed
  const backupForRecovery = appState.edit.originalContent;

  if (saveChanges && appState.edit.hasUnsavedChanges) {
    appState.currentFile.content = editorTextarea.value;

    // Verify storage succeeded
    const saveSuccess = saveToStorage();

    if (!saveSuccess) {
      // Restore backup for recovery if save failed
      appState.edit.originalContent = backupForRecovery;
      showError("Failed to save changes. Remaining in edit mode.");
      return;  // Critical: Don't clear edit mode state
    }
  }

  // Clear state only after confirming safety
  appState.edit.isActive = false;
  appState.edit.hasUnsavedChanges = false;
  appState.edit.originalContent = "";  // Safe to clear now

  // Show preview, hide editor
  if (editorEl) editorEl.style.display = "none";
  if (previewEl) previewEl.style.display = "block";

  // Render updated markdown if changes were saved
  if (saveChanges && appState.currentFile) {
    renderMarkdown(appState.currentFile.content);
  }

  // Update button visibility
  if (editBtn) editBtn.style.display = "inline-block";
  if (saveEditBtn) saveEditBtn.style.display = "none";
  if (cancelEditBtn) cancelEditBtn.style.display = "none";
  if (previewEditBtn) previewEditBtn.style.display = "none";
  if (exportPdfBtn) exportPdfBtn.disabled = false;

  // Re-enable search
  if (searchInput && appState.currentFile) searchInput.disabled = false;

  clearError();
}
```

---

## Fix #4: Guard Against Duplicate Edit Mode Entry (HIGH)

Already covered in Fix #3, Step 1. The key addition is:

```javascript
if (appState.edit.isActive) {
  console.warn("Already in edit mode for current file");
  if (editorTextarea) editorTextarea.focus();
  return;
}
```

---

## Fix #5: Quota Pressure Warnings (HIGH)

**Impact:** Warns users before auto-save fails due to quota
**Files to Modify:** `app.js`
**Lines to Change:** 1217-1239 (editor event listener)

### Current Code:
```javascript
if (editorTextarea) {
  editorTextarea.addEventListener("input", () => {
    const currentContent = editorTextarea.value;
    appState.edit.hasUnsavedChanges = currentContent !== appState.edit.originalContent;
    updateEditorStats();
    autoSaveEdit();
  });
}
```

### Fixed Code:
```javascript
if (editorTextarea) {
  editorTextarea.addEventListener("input", () => {
    const currentContent = editorTextarea.value;
    appState.edit.hasUnsavedChanges = currentContent !== appState.edit.originalContent;

    // Warn if storage pressure is high
    const usage = getStorageUsagePercent();
    if (usage > 75 && usage % 5 === 0) {
      // Log warning every 5% increase to avoid spam
      console.warn(`Storage ${usage}% full. Auto-save may fail. Consider exporting library.`);
    }

    updateEditorStats();
    autoSaveEdit();
  });

  // Also add warning when user enters edit mode
  const originalEnterEdit = enterEditMode;
  window.enterEditMode = function() {
    originalEnterEdit.call(this);

    // Check quota on entry
    const usage = getStorageUsagePercent();
    if (usage > 70) {
      showError(`Warning: Storage ${usage}% full. Large edits may not save.`);
    }
  };
}
```

**Alternative: Proactive Check in enterEditMode()**

Add to the end of `enterEditMode()` function:

```javascript
  // Check storage quota before allowing editing
  const usage = getStorageUsagePercent();
  if (usage > 75) {
    showError(`⚠️ Storage ${usage}% full. Consider exporting to free space before editing.`);
  }

  updateEditorStats();
  clearError();
}
```

---

## Fix #6: Line Ending Normalization (MINOR)

**Impact:** Prevents false "unsaved changes" warnings for line ending differences
**Files to Modify:** `app.js`
**Lines to Change:** 1221 (change detection), 232 (backup)

### Current Code:
```javascript
appState.edit.hasUnsavedChanges = currentContent !== appState.edit.originalContent;
```

### Fixed Code:
```javascript
// Normalize line endings for comparison (CRLF -> LF)
const normalizeLineEndings = (text) => text.replace(/\r\n/g, '\n');

appState.edit.hasUnsavedChanges =
  normalizeLineEndings(currentContent) !== normalizeLineEndings(appState.edit.originalContent);
```

Also update line 232:
```javascript
// Normalize line endings in backup
appState.edit.originalContent = (appState.currentFile.content || "").replace(/\r\n/g, '\n');
```

---

## Implementation Checklist

### Phase 1: Storage Verification (Most Critical)
- [ ] Update `saveEdit()` with return value check
- [ ] Update `exitEditMode()` with return value check
- [ ] Update `autoSaveEdit()` with return value check
- [ ] Update `handleFile()` with return value check
- [ ] Update `selectFile()` with return value check
- [ ] Update `deleteFile()` with return value check
- [ ] Test all paths: manual save, auto-save, file switch, delete
- [ ] Test with storage disabled to verify error handling

### Phase 2: Race Condition Prevention
- [ ] Add `isSavingInProgress` flag
- [ ] Update `saveEdit()` to check flag
- [ ] Update `autoSaveEdit()` to check flag
- [ ] Add `performAutoSave()` helper function
- [ ] Test rapid save + type sequences
- [ ] Test simultaneous manual and auto-save

### Phase 3: Backup Protection
- [ ] Add re-entrance guard to `enterEditMode()`
- [ ] Update backup handling in `exitEditMode()`
- [ ] Test entering edit mode while already editing
- [ ] Test file switch with pending save
- [ ] Test storage failure recovery

### Phase 4: User Warnings
- [ ] Add storage quota check in `enterEditMode()`
- [ ] Add storage quota check in editor input listener
- [ ] Test with 70%, 80%, 90% storage usage

### Phase 5: Edge Case Handling
- [ ] Normalize line endings in comparison
- [ ] Test with CRLF files
- [ ] Test with LF files
- [ ] Test mixed line endings

---

## Testing Script

```javascript
// Paste in console to test fixes:

// Test 1: Force storage failure
Object.defineProperty(Storage.prototype, 'setItem', {
  value: () => { throw new Error('QuotaExceededError'); }
});
// Now try to save - should keep unsaved flag true

// Test 2: Rapid saves
for (let i = 0; i < 10; i++) {
  setTimeout(() => saveEdit(), i * 100);
}
// Should serialize, not race

// Test 3: Storage recovery
Object.defineProperty(Storage.prototype, 'setItem', {
  value: Storage.prototype.setItem.restore
});
// Now saves should work again

// Test 4: Check backup
console.log("Original content:", appState.edit.originalContent);
console.log("Current content:", appState.currentFile.content);
console.log("Unsaved changes:", appState.edit.hasUnsavedChanges);
```

---

## Validation Criteria

After implementing all fixes:

- [ ] Storage errors don't lose content
- [ ] `hasUnsavedChanges` flag is always truthful
- [ ] File switches don't corrupt data
- [ ] Concurrent saves don't race
- [ ] Backup is never lost
- [ ] Quota warnings appear before save failures
- [ ] Line ending differences don't cause false changes
- [ ] Storage recovery works after quota is freed

---

## Rollback Plan

If issues arise during implementation:

1. Keep current code in a branch: `git branch backup-before-fixes`
2. Test each fix independently
3. If fix #1 causes issues: Revert with `git revert <commit>`
4. If fix #2 causes issues: Check `isSavingInProgress` flag initialization
5. If fix #3 causes issues: Check all code paths setting `originalContent`

---

## Documentation Updates

After implementing fixes, update:

1. Code comments explaining the serialization mechanism
2. README with storage quota information
3. User documentation about recovery procedures
4. Architecture documentation for edit mode flow

