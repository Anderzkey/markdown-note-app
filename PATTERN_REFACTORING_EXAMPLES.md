# Feature 4: Pattern Refactoring Examples

## Before & After Code Comparisons

---

## Issue 1: Inline Styles → CSS Classes

### BEFORE: Inline Style Manipulation (11 instances)

**File:** `app.js` Lines 236-287

```javascript
function enterEditMode() {
  if (!appState.currentFile) return;

  appState.edit.isActive = true;
  appState.edit.originalContent = appState.currentFile.content;
  appState.edit.hasUnsavedChanges = false;

  // Hide preview, show editor
  if (previewEl) previewEl.style.display = "none";        // ❌ Inline
  if (editorEl) editorEl.style.display = "flex";          // ❌ Inline
  if (editorTextarea) {
    editorTextarea.value = appState.currentFile.content;
    editorTextarea.focus();
  }

  // Update button visibility
  if (editBtn) editBtn.style.display = "none";            // ❌ Inline
  if (saveEditBtn) saveEditBtn.style.display = "inline-block";  // ❌ Inline
  if (cancelEditBtn) cancelEditBtn.style.display = "inline-block";  // ❌ Inline
  if (previewEditBtn) previewEditBtn.style.display = "inline-block";  // ❌ Inline
  if (exportPdfBtn) exportPdfBtn.disabled = true;

  clearSearch();
  if (searchInput) searchInput.disabled = true;

  updateEditorStats();
  clearError();
}

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
  if (editorEl) editorEl.style.display = "none";          // ❌ Inline
  if (previewEl) previewEl.style.display = "block";       // ❌ Inline

  if (saveChanges && appState.currentFile) {
    renderMarkdown(appState.currentFile.content);
  }

  // Update button visibility
  if (editBtn) editBtn.style.display = "inline-block";    // ❌ Inline
  if (saveEditBtn) saveEditBtn.style.display = "none";    // ❌ Inline
  if (cancelEditBtn) cancelEditBtn.style.display = "none";  // ❌ Inline
  if (previewEditBtn) previewEditBtn.style.display = "none";  // ❌ Inline
  if (exportPdfBtn) exportPdfBtn.disabled = false;

  if (searchInput && appState.currentFile) searchInput.disabled = false;

  clearError();
}

function togglePreview() {
  if (!appState.edit.isActive) return;

  const isEditorVisible = editorEl.style.display !== "none";  // ❌ Reading from DOM!

  if (isEditorVisible) {
    // Switch to preview
    if (editorEl) editorEl.style.display = "none";        // ❌ Inline
    if (previewEl) previewEl.style.display = "block";     // ❌ Inline

    const currentContent = editorTextarea.value;
    renderMarkdown(currentContent);
  } else {
    // Switch to editor
    if (editorEl) editorEl.style.display = "flex";        // ❌ Inline
    if (previewEl) previewEl.style.display = "none";      // ❌ Inline
    if (editorTextarea) editorTextarea.focus();
  }
}
```

**Problems:**
- 11 inline style assignments scattered across 3 functions
- Reading DOM state instead of appState
- Duplicated button visibility logic
- Difficult to test
- Violates separation of concerns

---

### AFTER: CSS Class Approach

**File:** `app.js` (Refactored)

```javascript
function enterEditMode() {
  if (!appState.currentFile) {
    showError("No file loaded. Cannot edit.");
    return;
  }

  appState.edit.isActive = true;
  appState.edit.showEditor = true;
  appState.edit.originalContent = appState.currentFile.content;
  appState.edit.hasUnsavedChanges = false;

  // ✅ Single class toggle handles all visibility
  document.body.classList.add('edit-mode');

  if (editorTextarea) {
    editorTextarea.value = appState.currentFile.content;
    editorTextarea.focus();
  }

  if (exportPdfBtn) exportPdfBtn.disabled = true;

  clearSearch();
  if (searchInput) searchInput.disabled = true;

  updateEditorStats();
  clearError();
}

function exitEditMode(saveChanges) {
  if (!appState.edit.isActive) return;

  if (saveChanges && appState.edit.hasUnsavedChanges) {
    syncEditorToFile();  // ✅ Extracted helper
    saveToStorage();
  }

  appState.edit.isActive = false;
  appState.edit.showEditor = false;
  appState.edit.hasUnsavedChanges = false;
  appState.edit.originalContent = "";

  // ✅ Single class toggle handles all visibility
  document.body.classList.remove('edit-mode');

  if (saveChanges && appState.currentFile) {
    renderMarkdown(appState.currentFile.content);
  }

  if (exportPdfBtn) exportPdfBtn.disabled = false;

  if (searchInput && appState.currentFile) searchInput.disabled = false;

  clearError();
}

function togglePreview() {
  if (!appState.edit.isActive) return;

  // ✅ Use appState, not DOM
  appState.edit.showEditor = !appState.edit.showEditor;

  if (appState.edit.showEditor) {
    // Switch to editor
    // ✅ CSS handles visibility, JS just toggles class
    document.body.classList.add('edit-mode--editor');
    if (editorTextarea) editorTextarea.focus();
  } else {
    // Switch to preview
    // ✅ CSS handles visibility, JS just toggles class
    document.body.classList.remove('edit-mode--editor');
    const currentContent = editorTextarea.value;
    renderMarkdown(currentContent);
  }
}

// ✅ NEW HELPER FUNCTION
function syncEditorToFile() {
  if (appState.currentFile && editorTextarea) {
    appState.currentFile.content = editorTextarea.value;
  }
}
```

**File:** `styles.css` (Add these rules)

```css
/* Edit Mode Default State */
.editor { display: none; }
#save-edit-btn { display: none; }
#cancel-edit-btn { display: none; }
#preview-edit-btn { display: none; }
#export-pdf-btn { opacity: 1; pointer-events: auto; }
#search-input { opacity: 1; pointer-events: auto; }

/* Edit Mode Active */
.edit-mode .editor { display: flex; }
.edit-mode #preview { display: none; }
.edit-mode #edit-btn { display: none; }
.edit-mode #save-edit-btn { display: inline-block; }
.edit-mode #cancel-edit-btn { display: inline-block; }
.edit-mode #preview-edit-btn { display: inline-block; }
.edit-mode #export-pdf-btn { opacity: 0.5; pointer-events: none; }
.edit-mode #search-input { opacity: 0.6; pointer-events: none; }

/* Preview Toggle Within Edit Mode */
.edit-mode--editor .editor { display: flex; }
.edit-mode--editor #preview { display: none; }

.edit-mode:not(.edit-mode--editor) .editor { display: none; }
.edit-mode:not(.edit-mode--editor) #preview { display: block; }
```

**File:** `index.html` (Remove inline styles)

```html
<!-- BEFORE -->
<button id="save-edit-btn" style="display: none;">💾 Save</button>
<button id="cancel-edit-btn" style="display: none;">✕ Cancel</button>
<button id="preview-edit-btn" style="display: none;">👁️ Preview</button>

<!-- AFTER -->
<button id="save-edit-btn">💾 Save</button>
<button id="cancel-edit-btn">✕ Cancel</button>
<button id="preview-edit-btn">👁️ Preview</button>
```

**Benefits:**
- ✅ Reduced JavaScript from 35 lines to 20 lines (-43%)
- ✅ All visibility logic in one place (CSS)
- ✅ No DOM state reading
- ✅ Easier to test
- ✅ Better performance (batched reflows)
- ✅ Separation of concerns

---

## Issue 2: Button Visibility Duplication

### BEFORE: Repeated Logic

**File:** `app.js` Lines 244-247 and 284-287

```javascript
// ❌ enterEditMode - Lines 244-247
if (editBtn) editBtn.style.display = "none";
if (saveEditBtn) saveEditBtn.style.display = "inline-block";
if (cancelEditBtn) cancelEditBtn.style.display = "inline-block";
if (previewEditBtn) previewEditBtn.style.display = "inline-block";

// ... 40 lines later ...

// ❌ exitEditMode - Lines 284-287 - SAME STRUCTURE, OPPOSITE VALUES
if (editBtn) editBtn.style.display = "inline-block";
if (saveEditBtn) saveEditBtn.style.display = "none";
if (cancelEditBtn) cancelEditBtn.style.display = "none";
if (previewEditBtn) previewEditBtn.style.display = "none";
```

**Problem:** If button behavior changes, must update in 2 places. Risk of inconsistency.

---

### AFTER: Extract Helper Function

**Option 1: With CSS Classes (RECOMMENDED)**

```javascript
// ✅ No separate helper needed - CSS handles it
function enterEditMode() {
  document.body.classList.add('edit-mode');
}

function exitEditMode() {
  document.body.classList.remove('edit-mode');
}

// All button visibility in CSS - single source of truth
```

**Option 2: With Inline Styles (If CSS classes not used)**

```javascript
// ✅ NEW HELPER FUNCTION
function setEditModeButtons(isActive) {
  const buttons = [editBtn, saveEditBtn, cancelEditBtn, previewEditBtn];
  const displays = isActive
    ? ['none', 'inline-block', 'inline-block', 'inline-block']
    : ['inline-block', 'none', 'none', 'none'];

  buttons.forEach((btn, idx) => {
    if (btn) btn.style.display = displays[idx];
  });
}

// Usage:
function enterEditMode() {
  // ...
  setEditModeButtons(true);  // ✅ One call instead of 4 assignments
  // ...
}

function exitEditMode() {
  // ...
  setEditModeButtons(false);  // ✅ One call instead of 4 assignments
  // ...
}
```

**Advantage:**
- ✅ Single source of truth
- ✅ DRY principle (Don't Repeat Yourself)
- ✅ Easier to maintain
- ✅ If button list changes, update in one place

---

## Issue 3: Content Sync Duplication

### BEFORE: Repeated 3 Times

**File:** `app.js`

```javascript
// Line 266 - exitEditMode
if (saveChanges && appState.edit.hasUnsavedChanges) {
  appState.currentFile.content = editorTextarea.value;  // ❌ Assignment #1
  saveToStorage();
}

// Line 309 - autoSaveEdit
if (appState.edit.isActive && appState.edit.hasUnsavedChanges) {
  appState.currentFile.content = editorTextarea.value;  // ❌ Assignment #2
  saveToStorage();
  appState.edit.hasUnsavedChanges = false;
}

// Line 327 - saveEdit
appState.currentFile.content = editorTextarea.value;    // ❌ Assignment #3
saveToStorage();
```

**Problem:** Same assignment in 3 locations - if sync logic changes, update in 3 places.

---

### AFTER: Extract Function

```javascript
// ✅ NEW HELPER - Single source of truth
function syncEditorToFile() {
  if (appState.currentFile && editorTextarea) {
    appState.currentFile.content = editorTextarea.value;
  }
}

// Usage becomes cleaner:

function exitEditMode(saveChanges) {
  if (!appState.edit.isActive) return;

  if (saveChanges && appState.edit.hasUnsavedChanges) {
    syncEditorToFile();        // ✅ One call
    saveToStorage();
  }
  // ...
}

function autoSaveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;

  clearTimeout(editSaveTimeout);

  editSaveTimeout = setTimeout(() => {
    if (appState.edit.isActive && appState.edit.hasUnsavedChanges) {
      syncEditorToFile();      // ✅ One call
      saveToStorage();
      appState.edit.hasUnsavedChanges = false;
    }
  }, EDIT_SAVE_DEBOUNCE_MS);
}

function saveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;

  clearTimeout(editSaveTimeout);

  syncEditorToFile();          // ✅ One call
  saveToStorage();
  appState.edit.hasUnsavedChanges = false;

  clearError();
}
```

**Benefit:**
- ✅ DRY principle
- ✅ Fewer lines of code
- ✅ Easier to understand intent
- ✅ Single place to update if logic changes

---

## Issue 4: Silent Error Handling

### BEFORE: No Error Messages

**File:** `app.js`

```javascript
function enterEditMode() {
  if (!appState.currentFile) return;  // ❌ Silent failure
  // ...
}

function exitEditMode(saveChanges) {
  if (!appState.edit.isActive) return;  // ❌ Silent failure
  // ...
}

function autoSaveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;  // ❌ Silent failure
  // ...
}

function saveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;  // ❌ Silent failure
  // ...
}
```

**Problem:** User clicks "Edit" but nothing happens - no feedback why.

---

### AFTER: Add Error Messages

```javascript
function enterEditMode() {
  if (!appState.currentFile) {
    showError("No file loaded. Cannot edit.");  // ✅ User gets feedback
    return;
  }

  if (appState.edit.isActive) {
    showError("Already in edit mode.");  // ✅ Additional guard
    return;
  }
  // ...
}

function exitEditMode(saveChanges) {
  if (!appState.edit.isActive) {
    showError("Not in edit mode.");  // ✅ User gets feedback
    return;
  }
  // ...
}

function autoSaveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) {
    // Silent OK here - called frequently, only saves if safe
    return;
  }
  // ...
}

function saveEdit() {
  if (!appState.edit.isActive) {
    showError("Not in edit mode. Cannot save.");  // ✅ User gets feedback
    return;
  }

  if (!appState.currentFile) {
    showError("No file loaded. Cannot save.");  // ✅ User gets feedback
    return;
  }
  // ...
}
```

**Matches Pattern:** PDF Export Feature uses explicit error messages - we should too!

```javascript
// From PDF export (GOOD PATTERN)
function exportToPDF() {
  if (!appState.currentFile) {
    showError("No file loaded to export.");  // ✅ Explicit error
    return;
  }

  if (!window.html2pdf) {
    showError("PDF export library not loaded. Please refresh and try again.");  // ✅ Explicit error
    return;
  }
  // ...
}
```

**Benefit:**
- ✅ Consistent with PDF export pattern
- ✅ Users understand why actions fail
- ✅ Better user experience
- ✅ Easier to debug issues

---

## Issue 5: DOM State Querying (Anti-pattern)

### BEFORE: Reading from DOM

**File:** `app.js` Line 340

```javascript
function togglePreview() {
  if (!appState.edit.isActive) return;

  // ❌ BAD: Reading state from DOM instead of appState
  const isEditorVisible = editorEl.style.display !== "none";

  if (isEditorVisible) {
    // Switch to preview
    if (editorEl) editorEl.style.display = "none";
    if (previewEl) previewEl.style.display = "block";
    const currentContent = editorTextarea.value;
    renderMarkdown(currentContent);
  } else {
    // Switch to editor
    if (editorEl) editorEl.style.display = "flex";
    if (previewEl) previewEl.style.display = "none";
    if (editorTextarea) editorTextarea.focus();
  }
}
```

**Problem:**
- Two sources of truth (DOM and appState)
- Potential for desynchronization
- Harder to test
- Relies on implementation detail (display value)

---

### AFTER: Use appState

```javascript
function togglePreview() {
  if (!appState.edit.isActive) return;

  // ✅ GOOD: Use appState as single source of truth
  appState.edit.showEditor = !appState.edit.showEditor;

  // With CSS classes:
  if (appState.edit.showEditor) {
    document.body.classList.add('edit-mode--editor');
    if (editorTextarea) editorTextarea.focus();
  } else {
    document.body.classList.remove('edit-mode--editor');
    const currentContent = editorTextarea.value;
    renderMarkdown(currentContent);
  }
}

// Or with inline styles (less good but better than reading DOM):
function togglePreview() {
  if (!appState.edit.isActive) return;

  // ✅ Use appState
  appState.edit.showEditor = !appState.edit.showEditor;

  if (appState.edit.showEditor) {
    editorEl.style.display = "flex";
    previewEl.style.display = "none";
    if (editorTextarea) editorTextarea.focus();
  } else {
    editorEl.style.display = "none";
    previewEl.style.display = "block";
    const currentContent = editorTextarea.value;
    renderMarkdown(currentContent);
  }
}
```

**Benefit:**
- ✅ Single source of truth
- ✅ Easier to test
- ✅ No assumption about DOM structure
- ✅ Better state management

---

## Issue 6: Naming Inconsistency

### BEFORE: Inconsistent Suffixes

**File:** `app.js` Lines 51-56

```javascript
// ❌ INCONSISTENT NAMING
const editBtn = document.getElementById("edit-btn");           // "Btn"
const saveEditBtn = document.getElementById("save-edit-btn");  // "Btn"
const cancelEditBtn = document.getElementById("cancel-edit-btn");  // "Btn"
const previewEditBtn = document.getElementById("preview-edit-btn");  // "Btn"
const editorEl = document.getElementById("editor");            // "El"
const editorTextarea = document.getElementById("editor-textarea");  // Full name
const wordCountEl = document.getElementById("word-count");     // "El"
const charCountEl = document.getElementById("char-count");     // "El"
```

**Pattern Inconsistency:**
- Buttons use "Btn" suffix
- Some elements use "El" suffix
- Some use full descriptive names
- No clear convention

---

### AFTER: Consistent Naming

**Option A: BEM-style with "El" suffix**
```javascript
// ✅ CONSISTENT NAMING - All elements use "El"
const editBtn = document.getElementById("edit-btn");
const saveEditBtn = document.getElementById("save-edit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const previewEditBtn = document.getElementById("preview-edit-btn");
const editorContainerEl = document.getElementById("editor");          // Changed from "El"
const editorTextareaEl = document.getElementById("editor-textarea");  // Added "El"
const wordCountEl = document.getElementById("word-count");
const charCountEl = document.getElementById("char-count");
```

**Option B: Descriptive full names**
```javascript
// ✅ CONSISTENT NAMING - All descriptive
const editButton = document.getElementById("edit-btn");
const saveEditButton = document.getElementById("save-edit-btn");
const cancelEditButton = document.getElementById("cancel-edit-btn");
const previewEditButton = document.getElementById("preview-edit-btn");
const editorContainer = document.getElementById("editor");
const editorTextarea = document.getElementById("editor-textarea");
const wordCount = document.getElementById("word-count");
const charCount = document.getElementById("char-count");
```

**Option C: Hybrid (Recommended - matches codebase)**
```javascript
// ✅ CONSISTENT NAMING - Matches existing pattern
const editBtn = document.getElementById("edit-btn");
const saveEditBtn = document.getElementById("save-edit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const previewEditBtn = document.getElementById("preview-edit-btn");
const editorEl = document.getElementById("editor");              // Keep "El"
const editorTextarea = document.getElementById("editor-textarea");  // Keep full name
const wordCountEl = document.getElementById("word-count");      // Keep "El"
const charCountEl = document.getElementById("char-count");       // Keep "El"

// Or change buttons to match:
const editBtnEl = document.getElementById("edit-btn");
const saveEditBtnEl = document.getElementById("save-edit-btn");
// etc.
```

**Current Codebase Pattern:**
- Buttons throughout use `-Btn` suffix (file-button, export-button, search-nav-btn)
- Elements throughout use `-El` suffix (previewEl, fileInputEl)

**Best Fix:** Make buttons consistent with codebase
```javascript
// Match search feature pattern
const searchInput = document.getElementById("search-input");     // Not "searchInputEl"
const searchPrevBtn = document.getElementById("search-prev-btn");
const searchNextBtn = document.getElementById("search-next-btn");

// Keep consistent with this pattern
const editBtn = document.getElementById("edit-btn");
const saveEditBtn = document.getElementById("save-edit-btn");
const editorEl = document.getElementById("editor");
const editorTextarea = document.getElementById("editor-textarea");
```

**Benefit:**
- ✅ Consistency across codebase
- ✅ Easier to onboard new developers
- ✅ Reduces cognitive load

---

## Summary of Changes

| Issue | Lines Changed | Type | Complexity |
|-------|---|---|---|
| **Inline Styles** | 35 | Refactor | HIGH |
| **Button Duplication** | 8 | Refactor | MEDIUM |
| **Content Sync** | 3 | Extract | LOW |
| **DOM State Query** | 1 | Fix | LOW |
| **Error Messages** | 4 | Enhancement | LOW |
| **Naming** | 8 | Consistency | LOW |
| **Total** | ~59 lines | Mixed | MEDIUM |

---

## Implementation Order

1. **Phase 1 (30 min)** - Quick wins
   - Add error messages (4 functions)
   - Fix DOM state query
   - Extract content sync

2. **Phase 2 (2 hours)** - Main refactoring
   - Add CSS classes for edit mode
   - Replace inline styles with class toggles
   - Extract button visibility helper

3. **Phase 3 (30 min)** - Polish
   - Fix naming consistency
   - Add JSDoc comments
   - Update tests

---

**Generated:** 2026-02-06
**Status:** Ready for implementation
