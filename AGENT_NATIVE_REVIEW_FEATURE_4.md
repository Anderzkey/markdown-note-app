# Agent-Native Accessibility Review: Feature 4 - Edit & Save Mode

## Executive Summary

**Current Status: PARTIAL COMPLIANCE**

Feature 4 (Edit & Save Mode) has **significant agent-native gaps**. While users have comprehensive UI-based access to all editing capabilities, agents currently **cannot programmatically access or control the editing system** without direct DOM manipulation.

**Agent Accessibility Score: 2/8 (25%)**

---

## New Capabilities Identified

Feature 4 introduces the following user-facing capabilities:

1. **Enter edit mode** - Click "Edit" button or press Ctrl+E
2. **Type/modify content** - Edit textarea with live character/word count
3. **View rendered preview** - Click "Preview" button while editing
4. **Save changes** - Click "Save" button or press Ctrl+S
5. **Discard changes** - Click "Cancel" button or press Escape
6. **Switch files while editing** - Select different file (with unsaved changes warning)
7. **Auto-save functionality** - Changes persist after 500ms of inactivity
8. **Keyboard shortcuts** - Ctrl+E, Ctrl+S, Escape, Tab, Ctrl+F
9. **Unsaved changes tracking** - Visual warning prevents data loss
10. **Editor statistics** - Real-time word and character count

---

## Agent Accessibility Check

| Capability | User Access | Agent Access | Gap? | Severity |
|------------|-------------|--------------|------|----------|
| Enter edit mode | UI button + Ctrl+E | DOM manipulation only | YES | HIGH |
| Read file content | UI display | `appState.currentFile.content` | NO | LOW |
| Modify file content | Textarea input | None without DOM tricks | YES | CRITICAL |
| Save changes | UI button + Ctrl+S | None programmatic | YES | CRITICAL |
| Discard changes | UI button + Escape | None programmatic | YES | HIGH |
| Preview toggle | UI button | None programmatic | YES | MEDIUM |
| Check unsaved changes | UI warning | `appState.edit.hasUnsavedChanges` | NO | LOW |
| Auto-save trigger | Automatic (500ms) | None programmatic | YES | MEDIUM |
| Switch files | Sidebar click | `selectFile(fileId)` | NO | LOW |
| Keyboard shortcuts | Native keyboard | `event.isTrusted` check blocks | YES | CRITICAL |

---

## Critical Gaps Analysis

### Gap 1: No Programmatic API to Enter/Exit Edit Mode

**Current Implementation:**
```javascript
// Lines 228-256, 262-294 (app.js)
function enterEditMode() {
  if (!appState.currentFile) return;
  appState.edit.isActive = true;
  // ... UI state changes
}

function exitEditMode(saveChanges) {
  // ... exits edit mode
}
```

**User Access:** ✅ Click button or press Ctrl+E
**Agent Access:** ❌ NO public API - must call internal functions or manipulate DOM

**Impact:** Agents cannot programmatically enter or exit edit mode without knowledge of internal state management. This violates action parity.

**Recommendation:**
```javascript
// PROPOSED: Add public API functions
function apiEnterEditMode() {
  if (!appState.currentFile) {
    return { success: false, error: 'No file loaded' };
  }
  enterEditMode();
  return { success: true, isActive: appState.edit.isActive };
}

function apiExitEditMode(saveChanges = false) {
  if (!appState.edit.isActive) {
    return { success: false, error: 'Not in edit mode' };
  }
  exitEditMode(saveChanges);
  return { success: true, isActive: appState.edit.isActive };
}

// Expose via window.markdownApp for agent access
window.markdownApp = window.markdownApp || {};
window.markdownApp.enterEditMode = apiEnterEditMode;
window.markdownApp.exitEditMode = apiExitEditMode;
```

---

### Gap 2: No Programmatic API to Save Changes

**Current Implementation:**
```javascript
// Lines 320-332 (app.js)
function saveEdit() {
  if (!appState.edit.isActive || !appState.currentFile) return;
  clearTimeout(editSaveTimeout);
  appState.currentFile.content = editorTextarea.value;
  saveToStorage();
  appState.edit.hasUnsavedChanges = false;
  clearError();
}
```

**User Access:** ✅ Click "Save" button or press Ctrl+S
**Agent Access:** ❌ NO public API - function is internal only

**Impact:** Agents cannot trigger saves programmatically. Auto-save is automatic but agents have no way to request immediate save.

**Recommendation:**
```javascript
// PROPOSED: Public API for saving
function apiSaveEdit() {
  if (!appState.edit.isActive) {
    return {
      success: false,
      error: 'Not in edit mode',
      hasUnsavedChanges: appState.edit.hasUnsavedChanges
    };
  }

  const oldContent = appState.currentFile.content;
  const newContent = editorTextarea.value;

  saveEdit();

  return {
    success: true,
    fileId: appState.currentFile.id,
    fileName: appState.currentFile.name,
    contentLength: newContent.length,
    contentChanged: oldContent !== newContent,
    autoSavePending: false
  };
}

window.markdownApp.saveEdit = apiSaveEdit;
```

---

### Gap 3: No Programmatic Content Modification API

**Current Implementation:**
```javascript
// Lines 215-220 (index.html)
<textarea
  id="editor-textarea"
  class="editor-textarea"
  placeholder="Edit your markdown here..."
  aria-label="Markdown editor textarea"
></textarea>

// Lines 1219-1224 (app.js)
editorTextarea.addEventListener("input", () => {
  const currentContent = editorTextarea.value;
  appState.edit.hasUnsavedChanges = currentContent !== appState.edit.originalContent;
  updateEditorStats();
  autoSaveEdit();
});
```

**User Access:** ✅ Type directly into textarea
**Agent Access:** ❌ Must manipulate DOM directly (no clean API)

**Impact:** Agents would need to directly modify the textarea and trigger events, which is brittle and unreliable.

**Recommendation:**
```javascript
// PROPOSED: API to modify content while editing
function apiSetEditContent(newContent) {
  if (!appState.edit.isActive) {
    return {
      success: false,
      error: 'Not in edit mode',
      reason: 'Must enter edit mode first'
    };
  }

  if (typeof newContent !== 'string') {
    return {
      success: false,
      error: 'Content must be a string'
    };
  }

  // Validate content size
  if (newContent.length > appState.currentFile.size * 2) {
    return {
      success: false,
      error: 'New content exceeds reasonable size limits',
      maxBytes: appState.currentFile.size * 2,
      proposedBytes: newContent.length
    };
  }

  // Update textarea
  editorTextarea.value = newContent;
  appState.edit.hasUnsavedChanges =
    newContent !== appState.edit.originalContent;

  // Update UI
  updateEditorStats();

  // Trigger auto-save
  autoSaveEdit();

  return {
    success: true,
    contentLength: newContent.length,
    hasUnsavedChanges: appState.edit.hasUnsavedChanges,
    wordCount: newContent.trim() === '' ? 0 :
      newContent.trim().split(/\s+/).length
  };
}

window.markdownApp.setEditContent = apiSetEditContent;
```

---

### Gap 4: No Programmatic Preview Toggle API

**Current Implementation:**
```javascript
// Lines 337-356 (app.js)
function togglePreview() {
  if (!appState.edit.isActive) return;

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

**User Access:** ✅ Click "Preview" button
**Agent Access:** ❌ NO public API

**Impact:** Agents cannot inspect whether preview is showing or request preview mode.

**Recommendation:**
```javascript
// PROPOSED: API for preview control
function apiTogglePreview() {
  if (!appState.edit.isActive) {
    return {
      success: false,
      error: 'Not in edit mode'
    };
  }

  const isEditorVisible = editorEl.style.display !== "none";
  togglePreview();

  return {
    success: true,
    now: isEditorVisible ? 'preview' : 'editor',
    content: editorTextarea.value.substring(0, 100) // First 100 chars
  };
}

function apiGetPreviewState() {
  const isEditorVisible = editorEl.style.display !== "none";
  return {
    isEditing: appState.edit.isActive,
    currentView: isEditorVisible ? 'editor' : 'preview',
    hasUnsavedChanges: appState.edit.hasUnsavedChanges
  };
}

window.markdownApp.togglePreview = apiTogglePreview;
window.markdownApp.getPreviewState = apiGetPreviewState;
```

---

### Gap 5: No Programmatic Unsaved Changes Check API

**Current Implementation:**
```javascript
// Lines 20-24 (app.js) - Internal state only
edit: {
  isActive: false,
  originalContent: "",
  hasUnsavedChanges: false,
}

// Lines 383-389 (app.js) - Manual confirm dialog
function confirmDiscardChanges() {
  if (!appState.edit.hasUnsavedChanges) return true;
  return confirm("You have unsaved changes. Do you want to discard them?");
}
```

**User Access:** ✅ See warning dialog when trying to exit/switch
**Agent Access:** ⚠️ PARTIAL - Can read state but no API method

**Impact:** Agents must access internal `appState` directly. Better to provide a proper API function.

**Recommendation:**
```javascript
// PROPOSED: API to check unsaved changes
function apiGetEditState() {
  return {
    isActive: appState.edit.isActive,
    hasUnsavedChanges: appState.edit.hasUnsavedChanges,
    contentDifference: appState.edit.isActive ? {
      originalLength: appState.edit.originalContent.length,
      currentLength: editorTextarea.value.length,
      changed: editorTextarea.value !== appState.edit.originalContent,
      summary: editorTextarea.value.substring(0, 50) + '...'
    } : null
  };
}

function apiCheckUnsavedChanges() {
  const hasUnsaved = appState.edit.hasUnsavedChanges;
  return {
    hasUnsavedChanges: hasUnsaved,
    canDiscard: !hasUnsaved,
    willPrompt: hasUnsaved
  };
}

window.markdownApp.getEditState = apiGetEditState;
window.markdownApp.checkUnsavedChanges = apiCheckUnsavedChanges;
```

---

### Gap 6: Keyboard Shortcuts Blocked from Agents

**Current Implementation:**
```javascript
// Lines 1241-1293 (app.js)
document.addEventListener("keydown", (event) => {
  // Security: Only respond to genuine user keyboard events
  if (!event.isTrusted) return;

  // Ctrl+E or Cmd+E: Toggle edit mode
  if ((event.ctrlKey || event.metaKey) && event.key === "e") {
    // ... code
  }
  // ... more shortcuts
});
```

**User Access:** ✅ Ctrl+E, Ctrl+S, Escape work
**Agent Access:** ❌ BLOCKED - `event.isTrusted` filter prevents synthetic events

**Impact:** Agents cannot use keyboard shortcuts because they create synthetic events that fail the `isTrusted` check.

**Recommendation:**
This is a **security-vs-capability tradeoff**. Options:

**Option A: Keep isTrusted but add public APIs (RECOMMENDED)**
- Deprecate shortcut reliance for agents
- Agents use new `apiEnterEditMode()`, `apiSaveEdit()`, etc.
- Keep `isTrusted` for human-level security

**Option B: Add agent-callable shortcut handler**
```javascript
// PROPOSED: Internal shortcut router
function _handleEditModeShortcuts(action) {
  // Validate action type
  const validActions = ['toggle-edit', 'save', 'exit', 'preview', 'search'];
  if (!validActions.includes(action)) {
    return { success: false, error: `Unknown action: ${action}` };
  }

  try {
    switch(action) {
      case 'toggle-edit':
        return apiToggleEditMode();
      case 'save':
        return apiSaveEdit();
      case 'exit':
        return apiExitEditMode(false);
      case 'preview':
        return apiTogglePreview();
      case 'search':
        return { success: true, message: 'Search focus handled' };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
}

window.markdownApp.handleShortcut = _handleEditModeShortcuts;
```

---

### Gap 7: No State Inspection API

**Current Implementation:**
```javascript
// Entire appState is global but undocumented for agent access
const appState = {
  files: [],
  currentFileId: null,
  currentFile: null,
  edit: {
    isActive: false,
    originalContent: "",
    hasUnsavedChanges: false,
  },
  // ... more state
};
```

**User Access:** ✅ See everything in UI
**Agent Access:** ⚠️ CAN READ but no documented API contract

**Impact:** Agents must reverse-engineer internal state structure. No guarantees about what will be stable.

**Recommendation:**
```javascript
// PROPOSED: Public API for state inspection
function apiGetAppState() {
  return {
    file: appState.currentFile ? {
      id: appState.currentFile.id,
      name: appState.currentFile.name,
      size: appState.currentFile.size,
      type: appState.currentFile.type,
      contentLength: appState.currentFile.content.length,
      tags: Array.from(appState.currentFile.tags),
      lastViewed: appState.currentFile.lastViewed
    } : null,
    edit: {
      isActive: appState.edit.isActive,
      hasUnsavedChanges: appState.edit.hasUnsavedChanges,
      contentLength: appState.edit.isActive ?
        editorTextarea.value.length : null
    },
    files: {
      total: appState.files.length,
      current: appState.currentFileId
    },
    search: {
      query: appState.search.query,
      matchCount: appState.search.matches.length,
      currentMatch: appState.search.currentMatchIndex
    }
  };
}

window.markdownApp.getAppState = apiGetAppState;
```

---

### Gap 8: No Agent-Callable File Switch Confirmation

**Current Implementation:**
```javascript
// Lines 447-476 (app.js)
function selectFile(fileId) {
  // Check for unsaved changes in edit mode
  if (appState.edit.isActive && appState.edit.hasUnsavedChanges) {
    if (!confirmDiscardChanges()) {
      return; // User cancelled
    }
    exitEditMode(false);
  }

  const file = appState.files.find(f => f.id === fileId);
  if (!file) return;

  // ... select file
}
```

**User Access:** ✅ See dialog when switching
**Agent Access:** ❌ NO programmatic way to request switch with confirmation

**Impact:** Agents cannot cleanly switch files while handling unsaved changes.

**Recommendation:**
```javascript
// PROPOSED: API for safe file switching
function apiSelectFile(fileId, options = {}) {
  const {
    saveChanges = false,
    discardChanges = false,
    forceOverwrite = false
  } = options;

  const targetFile = appState.files.find(f => f.id === fileId);
  if (!targetFile) {
    return {
      success: false,
      error: `File not found: ${fileId}`
    };
  }

  // Handle unsaved changes
  if (appState.edit.isActive && appState.edit.hasUnsavedChanges) {
    if (!saveChanges && !discardChanges && !forceOverwrite) {
      return {
        success: false,
        error: 'Unsaved changes detected',
        requiresConfirmation: true,
        options: ['saveChanges: true', 'discardChanges: true', 'forceOverwrite: true']
      };
    }

    if (saveChanges) {
      saveEdit();
    }
    if (discardChanges || forceOverwrite) {
      exitEditMode(false);
    }
  }

  selectFile(fileId);

  return {
    success: true,
    fileId: targetFile.id,
    fileName: targetFile.name,
    contentLength: targetFile.content.length
  };
}

window.markdownApp.selectFile = apiSelectFile;
```

---

## UI-Only Features (Features Inaccessible to Agents)

1. **Edit button visual state** - Users see it toggle visible/hidden, but only via UI
2. **Save/Cancel/Preview button visibility** - Controlled purely by DOM display property
3. **Confirmation dialog** - Uses native `confirm()` which is modal and blocks agent execution
4. **Textarea focus** - Users can focus textarea, agents cannot meaningfully interact
5. **Word/character count display** - UI-only, no API to query directly

---

## Behavioral Lock-Ins (Features Hardcoded in Event Handlers)

1. **Auto-save timing** - Fixed at 500ms debounce (hardcoded constant, no agent control)
2. **Unsaved changes confirmation** - Always uses `confirm()` dialog (can't be overridden)
3. **Tab key behavior** - Inserts literal tab character (hardcoded, no agent control)
4. **Preview rendering** - Uses internal `renderMarkdown()` (no agent hook)

**Recommendation:** Expose configurable options:
```javascript
// PROPOSED: Configuration API
const EDIT_CONFIG = {
  AUTO_SAVE_DEBOUNCE_MS: 500,
  ALLOW_TAB_INSERTION: true,
  REQUIRE_CONFIRMATION_ON_DISCARD: true,
  AUTO_SAVE_ENABLED: true
};

function apiConfigureEdit(config) {
  Object.assign(EDIT_CONFIG, config);
  return { success: true, config: EDIT_CONFIG };
}

window.markdownApp.configureEdit = apiConfigureEdit;
```

---

## Missing State Guarantees

Agents cannot verify:
- Whether current textarea value is the "true" state (or if auto-save missed it)
- Whether a save actually succeeded or just attempted
- What the original content was before editing started
- Whether a file ID is valid without trying to select it

---

## Comprehensive Recommendations Summary

### Priority 1: CRITICAL - Core Edit Operations

| Issue | Fix | Impact |
|-------|-----|--------|
| No enter/exit edit mode API | Add `apiEnterEditMode()`, `apiExitEditMode()` | Agents can control edit flow |
| No save API | Add `apiSaveEdit()` | Agents can persist changes |
| No content modification API | Add `apiSetEditContent()` | Agents can modify files |
| Shortcuts blocked by isTrusted | Add `apiHandleShortcut()` or use new APIs | Agents can use all features |

### Priority 2: HIGH - State & Inspection

| Issue | Fix | Impact |
|-------|-----|--------|
| No state inspection | Add `apiGetAppState()`, `apiGetEditState()` | Agents can read all state |
| No unsaved changes API | Add `apiCheckUnsavedChanges()` | Agents handle data safety |
| No file switch API | Add `apiSelectFile(fileId, options)` | Agents control workflow |

### Priority 3: MEDIUM - Feature Control

| Issue | Fix | Impact |
|-------|-----|--------|
| No preview toggle API | Add `apiTogglePreview()`, `apiGetPreviewState()` | Agents can verify content |
| No configuration API | Add `apiConfigureEdit()` | Agents can customize behavior |

### Priority 4: LOW - Nice-to-Have

| Issue | Fix | Impact |
|-------|-----|--------|
| Word/char count not queryable | Expose as part of `apiGetEditState()` | Agents can read stats |
| Original content not retrievable | Store in state object, return in API | Agents verify changes |

---

## Implementation Roadmap

**Phase 1: Create Public API Namespace**
```javascript
// At top of app.js, after appState definition
window.markdownApp = {
  version: '1.0',
  capabilities: {
    edit: true,
    search: true,
    tags: true,
    pdf: true
  },
  apiVersion: '1'
};
```

**Phase 2: Expose Core Edit Functions**
- `apiEnterEditMode()`
- `apiExitEditMode(saveChanges)`
- `apiSaveEdit()`
- `apiSetEditContent(content)`

**Phase 3: Add State APIs**
- `apiGetAppState()`
- `apiGetEditState()`
- `apiCheckUnsavedChanges()`

**Phase 4: Add Feature Control**
- `apiTogglePreview()`
- `apiSelectFile(fileId, options)`
- `apiHandleShortcut(action)`

**Phase 5: Add Configuration**
- `apiConfigureEdit(config)`

---

## Testing Checklist for Agent-Native Compliance

- [ ] Can agent enter edit mode without UI interaction
- [ ] Can agent modify content and trigger auto-save
- [ ] Can agent save changes explicitly
- [ ] Can agent exit edit mode with confirmation handling
- [ ] Can agent query edit state before operations
- [ ] Can agent switch files with unsaved changes handling
- [ ] Can agent read and write file content via API
- [ ] Can agent check if operations succeeded
- [ ] Can agent toggle preview and check state
- [ ] Can agent programmatically use all keyboard shortcuts
- [ ] Can agent configure edit behavior
- [ ] Does API provide proper error responses
- [ ] Are error messages informative to agents
- [ ] Can agent recover from failed operations

---

## Architecture Violations

### Violation: Hidden State in Event Handlers

**Problem:**
```javascript
editorTextarea.addEventListener("input", () => {
  const currentContent = editorTextarea.value;
  appState.edit.hasUnsavedChanges = currentContent !== appState.edit.originalContent;
  updateEditorStats();
  autoSaveEdit();  // <- Debounced save triggered by event handler
});
```

Agents cannot control when auto-save happens, and the debounce timing is hardcoded.

**Violation:** Behavior is defined in event handler, not in controlled API.

### Violation: UI State Drives Business Logic

**Problem:**
```javascript
const isEditorVisible = editorEl.style.display !== "none";
if (isEditorVisible) {
  // Switch to preview
}
```

The code checks DOM display property to determine state, instead of checking `appState.edit.isActive`.

**Violation:** DOM is source of truth for edit mode, not state object.

### Violation: Confirmation Blocking

**Problem:**
```javascript
function confirmDiscardChanges() {
  if (!appState.edit.hasUnsavedChanges) return true;
  return confirm("You have unsaved changes. Do you want to discard them?");
}
```

Agents cannot handle confirmation flow - `confirm()` is modal and blocks execution.

**Violation:** Agent workflow requires ability to skip or programmatically answer prompts.

---

## Security Considerations

**Current Protection: isTrusted check**
```javascript
if (!event.isTrusted) return;
```

This blocks synthetic keyboard events from scripts. When implementing agent APIs:

1. Keep `isTrusted` check for keyboard listeners
2. Agents use direct function calls (not simulated events)
3. No new security risks introduced by API functions
4. All APIs validate inputs and check preconditions

**Recommended API Validation Pattern:**
```javascript
function apiOperation(params) {
  // 1. Validate input types
  if (typeof params !== 'object') {
    return { success: false, error: 'Invalid parameters' };
  }

  // 2. Check preconditions
  if (!appState.currentFile) {
    return { success: false, error: 'No file loaded' };
  }

  // 3. Check state requirements
  if (params.requireEditMode && !appState.edit.isActive) {
    return { success: false, error: 'Not in edit mode' };
  }

  // 4. Perform operation with error handling
  try {
    // ... operation code ...
    return { success: true, result: value };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
```

---

## Conclusion

Feature 4 (Edit & Save Mode) provides a rich user interface for markdown editing but **completely lacks agent-native APIs**. The implementation is UI-first with event handlers controlling business logic.

### Key Findings

| Category | Status | Evidence |
|----------|--------|----------|
| Action Parity | ❌ NO | No APIs to enter edit mode, save, or modify content |
| Context Parity | ⚠️ PARTIAL | State exists but no documented API contract |
| Tool Design | ❌ NO | Behavior hardcoded in handlers, no configuration |
| API Surface | ❌ NO | Zero public APIs for edit operations |

### Severity Assessment

**CRITICAL ISSUES:**
1. No way to enter/exit edit mode programmatically
2. No way to save changes from agent code
3. No way to modify file content from agent code
4. Keyboard shortcuts blocked by `isTrusted` filter

**HIGH PRIORITY:**
1. No unsaved changes checking API
2. No file switching confirmation handling
3. No state inspection functions

### Estimated Effort to Fix

- **Phase 1-3 (Core APIs):** ~200-300 lines of new code
- **Phase 4-5 (Enhancement):** ~100-150 lines
- **Testing & Documentation:** ~500 lines
- **Total:** ~1000 lines added to make Feature 4 fully agent-native

### Impact of Current Gaps

Agents currently **cannot meaningfully use Feature 4** for automated tasks such as:
- Batch editing multiple files
- Programmatic content transformation
- Automated file updates based on external systems
- Testing edit functionality
- Building editing workflows
- Creating editor extensions

---

## Next Steps

1. **Priority:** Review this assessment with team
2. **Decision:** Accept gaps or implement Phase 1-3 APIs
3. **Planning:** Schedule implementation sprint
4. **Coding:** Add public APIs to `app.js`
5. **Testing:** Verify agent access with test scripts
6. **Documentation:** Update FEATURE_4_QUICK_START.md with API examples

---

**Generated:** 2026-02-06
**Reviewer:** Agent-Native Architecture Review System
**Feature:** Edit & Save Mode (Feature 4)
**Status:** NEEDS WORK - Requires API layer for agent compliance
