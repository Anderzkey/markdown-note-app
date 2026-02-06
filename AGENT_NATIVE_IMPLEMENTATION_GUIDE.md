# Agent-Native Implementation Guide - Feature 4 Edit Mode

## Quick Reference: From Agent Perspective

### Current State (BLOCKED)
```javascript
// Agents CANNOT do this today:
await app.enterEditMode();        // ❌ No API
await app.modifyContent(newText); // ❌ No API
await app.saveFile();             // ❌ No API
await app.exitEditMode();         // ❌ No API
```

### Proposed State (AFTER FIX)
```javascript
// Agents WILL be able to do this:
const result = await window.markdownApp.enterEditMode();
const result = await window.markdownApp.setEditContent(newText);
const result = await window.markdownApp.saveEdit();
const result = await window.markdownApp.exitEditMode(true);
```

---

## Implementation: Step-by-Step

### Step 1: Create API Namespace (Add to app.js after line 58)

```javascript
// ============================================================================
// AGENT-NATIVE API LAYER
// ============================================================================
// This namespace provides programmatic access to edit mode for agents/scripts
// All functions return structured responses: { success: boolean, ... }

window.markdownApp = window.markdownApp || {};

// API version for compatibility checking
window.markdownApp.apiVersion = '1.0.0';
window.markdownApp.capabilities = {
  editMode: true,
  contentModification: true,
  fileSwitching: true,
  unsavedChangesTracking: true,
  autoSave: true,
  preview: true
};
```

### Step 2: Add Edit Mode Control APIs (Add to app.js after line 395)

```javascript
/**
 * API: Enters edit mode for the current file
 * @returns {Object} Response with success status and current state
 * @example
 *   const result = await window.markdownApp.enterEditMode();
 *   if (result.success) {
 *     console.log('Edit mode active:', result.isActive);
 *   }
 */
window.markdownApp.enterEditMode = function() {
  if (!appState.currentFile) {
    return {
      success: false,
      error: 'No file loaded',
      reason: 'Select a file before entering edit mode'
    };
  }

  if (appState.edit.isActive) {
    return {
      success: true,
      message: 'Already in edit mode',
      isActive: true
    };
  }

  enterEditMode();

  return {
    success: true,
    isActive: appState.edit.isActive,
    fileId: appState.currentFile.id,
    fileName: appState.currentFile.name,
    contentLength: appState.currentFile.content.length
  };
};

/**
 * API: Exits edit mode with optional save
 * @param {boolean} saveChanges - Whether to save before exiting (default: false)
 * @returns {Object} Response with success status and changes info
 * @example
 *   // Exit and discard changes
 *   const result = await window.markdownApp.exitEditMode(false);
 *
 *   // Exit and save changes
 *   const result = await window.markdownApp.exitEditMode(true);
 */
window.markdownApp.exitEditMode = function(saveChanges = false) {
  if (!appState.edit.isActive) {
    return {
      success: true,
      message: 'Already out of edit mode',
      isActive: false
    };
  }

  // Check for unsaved changes
  if (appState.edit.hasUnsavedChanges && !saveChanges) {
    return {
      success: false,
      error: 'Unsaved changes detected',
      hasUnsavedChanges: true,
      contentDifference: {
        originalLength: appState.edit.originalContent.length,
        currentLength: editorTextarea.value.length,
        recommendation: 'Set saveChanges: true to save before exiting'
      }
    };
  }

  exitEditMode(saveChanges);

  return {
    success: true,
    isActive: appState.edit.isActive,
    changesSaved: saveChanges && appState.edit.hasUnsavedChanges,
    fileId: appState.currentFile?.id
  };
};

/**
 * API: Gets current edit mode state
 * @returns {Object} Complete edit state information
 * @example
 *   const state = window.markdownApp.getEditState();
 *   console.log(state);
 *   // {
 *   //   isActive: true,
 *   //   hasUnsavedChanges: false,
 *   //   fileId: "file_1234_xyz",
 *   //   contentLength: 512,
 *   //   wordCount: 42
 *   // }
 */
window.markdownApp.getEditState = function() {
  const wordCount = editorTextarea
    ? (editorTextarea.value.trim() === '' ? 0 :
       editorTextarea.value.trim().split(/\s+/).length)
    : 0;

  return {
    isActive: appState.edit.isActive,
    hasUnsavedChanges: appState.edit.hasUnsavedChanges,
    fileId: appState.currentFile?.id,
    fileName: appState.currentFile?.name,
    contentLength: editorTextarea?.value.length || 0,
    wordCount: wordCount,
    originalContentLength: appState.edit.originalContent.length,
    previewVisible: editorEl.style.display === "none",
    autoSaveEnabled: true,
    autoSaveDebounceMs: EDIT_SAVE_DEBOUNCE_MS
  };
};
```

### Step 3: Add Content Modification API (Add to app.js after Step 2)

```javascript
/**
 * API: Modifies content while in edit mode
 * @param {string} newContent - The new markdown content
 * @param {Object} options - Optional configuration
 * @returns {Object} Response with success status and new state
 * @example
 *   const result = await window.markdownApp.setEditContent('# New Title\n\nContent here');
 *   if (result.success) {
 *     console.log('Content updated:', result.contentLength, 'bytes');
 *   }
 */
window.markdownApp.setEditContent = function(newContent, options = {}) {
  // Validate preconditions
  if (!appState.edit.isActive) {
    return {
      success: false,
      error: 'Not in edit mode',
      fix: 'Call enterEditMode() first'
    };
  }

  // Validate input type
  if (typeof newContent !== 'string') {
    return {
      success: false,
      error: 'Content must be a string',
      receivedType: typeof newContent
    };
  }

  // Validate content size (don't allow doubling size)
  const MAX_GROWTH = options.maxBytes || (appState.currentFile.size * 3);
  if (newContent.length > MAX_GROWTH) {
    return {
      success: false,
      error: 'Content exceeds maximum allowed size',
      maxBytes: MAX_GROWTH,
      proposedBytes: newContent.length,
      currentBytes: editorTextarea.value.length
    };
  }

  // Update textarea
  editorTextarea.value = newContent;

  // Track changes
  appState.edit.hasUnsavedChanges =
    newContent !== appState.edit.originalContent;

  // Update statistics
  updateEditorStats();

  // Trigger auto-save if configured
  if (options.autoSave !== false) {
    autoSaveEdit();
  }

  return {
    success: true,
    contentLength: newContent.length,
    hasUnsavedChanges: appState.edit.hasUnsavedChanges,
    wordCount: newContent.trim() === '' ? 0 :
      newContent.trim().split(/\s+/).length,
    characterCount: newContent.length,
    timestamp: Date.now(),
    autoSavePending: !options.autoSave === false
  };
};

/**
 * API: Gets current editor content (whether saved or not)
 * @returns {Object} Current content and metadata
 * @example
 *   const content = window.markdownApp.getEditContent();
 *   console.log(content.text);  // Current text in editor
 *   console.log(content.saved); // Content from last save
 */
window.markdownApp.getEditContent = function() {
  const current = editorTextarea?.value || '';
  const saved = appState.currentFile?.content || '';

  return {
    current: current,
    saved: saved,
    hasChanges: current !== saved,
    currentLength: current.length,
    savedLength: saved.length,
    currentPreview: current.substring(0, 200) + (current.length > 200 ? '...' : ''),
    savedPreview: saved.substring(0, 200) + (saved.length > 200 ? '...' : '')
  };
};
```

### Step 4: Add Save & Persistence APIs (Add to app.js after Step 3)

```javascript
/**
 * API: Explicitly saves current changes without debounce
 * @param {Object} options - Optional configuration
 * @returns {Object} Response with save result
 * @example
 *   const result = await window.markdownApp.saveEdit();
 *   if (result.success) {
 *     console.log(`Saved ${result.contentLength} bytes`);
 *   }
 */
window.markdownApp.saveEdit = function(options = {}) {
  // Validate state
  if (!appState.edit.isActive) {
    return {
      success: false,
      error: 'Not in edit mode',
      currentState: appState.edit.isActive ? 'editing' : 'viewing'
    };
  }

  if (!appState.currentFile) {
    return {
      success: false,
      error: 'No file to save'
    };
  }

  // Store previous content for comparison
  const previousContent = appState.currentFile.content;
  const newContent = editorTextarea.value;

  // Save immediately (cancels any pending auto-save)
  saveEdit();

  return {
    success: true,
    fileId: appState.currentFile.id,
    fileName: appState.currentFile.name,
    contentLength: newContent.length,
    contentChanged: previousContent !== newContent,
    bytesChanged: newContent.length - previousContent.length,
    timestamp: Date.now(),
    stored: true,
    reason: options.reason || 'agent-save'
  };
};

/**
 * API: Checks for unsaved changes
 * @returns {Object} Unsaved changes status
 * @example
 *   const status = window.markdownApp.checkUnsavedChanges();
 *   if (status.hasUnsavedChanges) {
 *     console.log('Changes pending:', status.changesSummary);
 *   }
 */
window.markdownApp.checkUnsavedChanges = function() {
  if (!appState.edit.isActive) {
    return {
      hasUnsavedChanges: false,
      isEditing: false,
      reason: 'Not in edit mode'
    };
  }

  const hasChanges = appState.edit.hasUnsavedChanges;
  const changeCount = editorTextarea.value.length -
    appState.edit.originalContent.length;

  return {
    hasUnsavedChanges: hasChanges,
    isEditing: true,
    changesSummary: hasChanges ? `${Math.abs(changeCount)} bytes ${changeCount > 0 ? 'added' : 'removed'}` : 'No changes',
    originalLength: appState.edit.originalContent.length,
    currentLength: editorTextarea.value.length,
    changeSizeBytes: changeCount,
    recommendation: hasChanges ? 'Call saveEdit() or exitEditMode(true)' : 'No action needed'
  };
};

/**
 * API: Discards changes and exits edit mode
 * @param {Object} options - Optional configuration
 * @returns {Object} Response with discard result
 * @example
 *   const result = await window.markdownApp.discardChanges();
 *   if (result.success) {
 *     console.log('Changes discarded');
 *   }
 */
window.markdownApp.discardChanges = function(options = {}) {
  if (!appState.edit.isActive) {
    return {
      success: true,
      message: 'Not in edit mode',
      noChangesToDiscard: true
    };
  }

  const hadChanges = appState.edit.hasUnsavedChanges;
  const discardedBytes = editorTextarea.value.length -
    appState.edit.originalContent.length;

  exitEditMode(false);

  return {
    success: true,
    changesDiscarded: hadChanges,
    discardedBytes: Math.abs(discardedBytes),
    timestamp: Date.now(),
    restored: appState.edit.originalContent
  };
};
```

### Step 5: Add Preview & Navigation APIs (Add to app.js after Step 4)

```javascript
/**
 * API: Toggles between editor and preview view
 * @returns {Object} New view state
 * @example
 *   const result = window.markdownApp.togglePreview();
 *   console.log(result.currentView); // 'editor' or 'preview'
 */
window.markdownApp.togglePreview = function() {
  if (!appState.edit.isActive) {
    return {
      success: false,
      error: 'Not in edit mode'
    };
  }

  const wasEditorVisible = editorEl.style.display !== "none";
  togglePreview();

  return {
    success: true,
    currentView: wasEditorVisible ? 'preview' : 'editor',
    contentPreview: editorTextarea.value.substring(0, 100)
  };
};

/**
 * API: Gets current preview state
 * @returns {Object} Preview configuration and state
 * @example
 *   const state = window.markdownApp.getPreviewState();
 *   console.log(state.currentView); // Which view is active
 */
window.markdownApp.getPreviewState = function() {
  const isEditorVisible = editorEl.style.display !== "none";

  return {
    isEditing: appState.edit.isActive,
    currentView: isEditorVisible ? 'editor' : 'preview',
    editorVisible: isEditorVisible,
    previewVisible: !isEditorVisible,
    contentPreview: editorTextarea?.value.substring(0, 200) || ''
  };
};

/**
 * API: Safely switches to a different file
 * @param {string} fileId - Target file ID
 * @param {Object} options - Switch behavior options
 * @returns {Object} Switch result
 * @example
 *   // Switch with confirmation prompt
 *   const result = await window.markdownApp.switchFile(fileId, {
 *     saveChanges: true
 *   });
 *
 *   // Force switch without prompting
 *   const result = await window.markdownApp.switchFile(fileId, {
 *     forceOverwrite: true
 *   });
 */
window.markdownApp.switchFile = function(fileId, options = {}) {
  const {
    saveChanges = false,
    discardChanges = false,
    forceOverwrite = false
  } = options;

  const targetFile = appState.files.find(f => f.id === fileId);
  if (!targetFile) {
    return {
      success: false,
      error: 'File not found',
      fileId: fileId
    };
  }

  // Handle unsaved changes
  if (appState.edit.isActive && appState.edit.hasUnsavedChanges) {
    if (!saveChanges && !discardChanges && !forceOverwrite) {
      return {
        success: false,
        error: 'Unsaved changes detected',
        requiresConfirmation: true,
        options: {
          'saveChanges: true': 'Save before switching',
          'discardChanges: true': 'Discard and switch',
          'forceOverwrite: true': 'Force switch (same as discard)'
        }
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
    contentLength: targetFile.content.length,
    timestamp: Date.now()
  };
};
```

### Step 6: Add Full State Inspection API (Add to app.js after Step 5)

```javascript
/**
 * API: Gets complete application state
 * @returns {Object} Full state snapshot for inspection
 * @example
 *   const state = window.markdownApp.getAppState();
 *   console.log(state.files.length); // Total files loaded
 */
window.markdownApp.getAppState = function() {
  return {
    files: {
      total: appState.files.length,
      currentId: appState.currentFileId,
      current: appState.currentFile ? {
        id: appState.currentFile.id,
        name: appState.currentFile.name,
        size: appState.currentFile.size,
        tags: Array.from(appState.currentFile.tags || []),
        contentLength: appState.currentFile.content.length
      } : null
    },
    edit: {
      isActive: appState.edit.isActive,
      hasUnsavedChanges: appState.edit.hasUnsavedChanges,
      contentLength: editorTextarea?.value.length || 0,
      originalLength: appState.edit.originalContent.length
    },
    search: {
      active: appState.search.query.length > 0,
      query: appState.search.query,
      matches: appState.search.matches.length,
      currentMatch: appState.search.currentMatchIndex
    },
    ui: {
      sidebarExpanded: appState.sidebarExpanded,
      sortBy: appState.sortBy
    }
  };
};
```

### Step 7: Add Error Handler Wrapper (Add to app.js after Step 6)

```javascript
/**
 * INTERNAL: Wraps async API calls with error handling
 * @private
 */
function _wrapApiCall(apiFunction) {
  return async function(...args) {
    try {
      const result = apiFunction(...args);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  };
}

// Make all API calls return promises for consistency
const originalApi = { ...window.markdownApp };
Object.keys(originalApi).forEach(key => {
  if (typeof originalApi[key] === 'function') {
    window.markdownApp[key] = async function(...args) {
      return originalApi[key](...args);
    };
  }
});
```

---

## Usage Examples for Agents

### Example 1: Complete Editing Workflow

```javascript
// Agent automation script
async function automatedEdit(fileId, newContent) {
  // Step 1: Verify file exists
  const state = window.markdownApp.getAppState();
  if (!state.files.current || state.files.current.id !== fileId) {
    await window.markdownApp.switchFile(fileId);
  }

  // Step 2: Enter edit mode
  const enterResult = await window.markdownApp.enterEditMode();
  if (!enterResult.success) {
    console.error('Failed to enter edit mode:', enterResult.error);
    return;
  }

  // Step 3: Replace content
  const setResult = await window.markdownApp.setEditContent(newContent);
  if (!setResult.success) {
    console.error('Failed to set content:', setResult.error);
    return;
  }

  // Step 4: Save changes
  const saveResult = await window.markdownApp.saveEdit();
  if (!saveResult.success) {
    console.error('Failed to save:', saveResult.error);
    return;
  }

  // Step 5: Exit edit mode
  const exitResult = await window.markdownApp.exitEditMode(true);
  if (!exitResult.success) {
    console.error('Failed to exit:', exitResult.error);
    return;
  }

  console.log('✅ Edit workflow complete');
  console.log('Saved:', saveResult.contentLength, 'bytes');
}
```

### Example 2: Batch File Updates

```javascript
// Update all files matching criteria
async function batchUpdate(fileIds, transformFn) {
  const results = [];

  for (const fileId of fileIds) {
    try {
      // Switch to file
      await window.markdownApp.switchFile(fileId, {
        saveChanges: true,
        forceOverwrite: true
      });

      // Get current content
      const content = await window.markdownApp.getEditContent();

      // Enter edit mode
      await window.markdownApp.enterEditMode();

      // Transform content
      const transformed = transformFn(content.current);

      // Update
      const result = await window.markdownApp.setEditContent(transformed);

      // Save
      const saved = await window.markdownApp.saveEdit();

      // Exit
      await window.markdownApp.exitEditMode(true);

      results.push({
        fileId,
        success: true,
        bytesChanged: saved.bytesChanged
      });
    } catch (error) {
      results.push({
        fileId,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}
```

### Example 3: Safe Editing with Rollback

```javascript
// Edit with automatic rollback on error
async function safeEdit(fileId, updateFn) {
  // Backup original
  const original = await window.markdownApp.getEditContent();

  try {
    await window.markdownApp.enterEditMode();
    const current = original.current;

    // Apply transformation
    const updated = await updateFn(current);

    // Set and verify
    const result = await window.markdownApp.setEditContent(updated);
    if (!result.success) throw new Error(result.error);

    // Save
    await window.markdownApp.saveEdit();

    return { success: true, result };
  } catch (error) {
    // Rollback on error
    await window.markdownApp.setEditContent(original.current);
    await window.markdownApp.discardChanges();

    return {
      success: false,
      error: error.message,
      rolledBack: true
    };
  }
}
```

### Example 4: Preview Without Saving

```javascript
// Check preview before committing to save
async function previewThenSave(newContent) {
  // Enter edit mode
  await window.markdownApp.enterEditMode();

  // Set content
  await window.markdownApp.setEditContent(newContent, {
    autoSave: false  // Don't auto-save yet
  });

  // Switch to preview
  await window.markdownApp.togglePreview();

  // In real scenario, would verify rendering...
  const state = await window.markdownApp.getPreviewState();
  console.log('Preview visible:', state.previewVisible);

  // Switch back to editor
  await window.markdownApp.togglePreview();

  // Now save
  const result = await window.markdownApp.saveEdit();

  // Exit
  await window.markdownApp.exitEditMode(true);

  return result;
}
```

---

## Testing the APIs

### Unit Test Example

```javascript
// Test script to verify API availability
async function testAgentAPIs() {
  const tests = [];

  // Test 1: API namespace exists
  tests.push({
    name: 'API namespace exists',
    pass: !!window.markdownApp,
    required: true
  });

  // Test 2: All functions exposed
  const requiredFunctions = [
    'enterEditMode',
    'exitEditMode',
    'getEditState',
    'setEditContent',
    'getEditContent',
    'saveEdit',
    'checkUnsavedChanges',
    'discardChanges',
    'togglePreview',
    'getPreviewState',
    'switchFile',
    'getAppState'
  ];

  requiredFunctions.forEach(fn => {
    tests.push({
      name: `API function: ${fn}`,
      pass: typeof window.markdownApp[fn] === 'function',
      required: true
    });
  });

  // Test 3: API returns proper structure
  if (tests.every(t => t.pass)) {
    const result = await window.markdownApp.getAppState();
    tests.push({
      name: 'API returns structured response',
      pass: result.files && result.edit && result.search,
      required: true
    });
  }

  // Report results
  const passed = tests.filter(t => t.pass).length;
  const required = tests.filter(t => t.required).length;

  console.log(`\n✅ API Tests: ${passed}/${tests.length} passed`);
  if (passed === required) {
    console.log('✅ All required APIs available for agents!');
  } else {
    console.log('❌ Some required APIs missing');
    tests.filter(t => !t.pass && t.required).forEach(t => {
      console.log(`  - ${t.name}`);
    });
  }

  return tests;
}

// Run tests
await testAgentAPIs();
```

---

## Integration Checklist

- [ ] Copy all 7 steps into app.js
- [ ] Verify no naming conflicts with existing functions
- [ ] Test that all APIs are accessible via window.markdownApp
- [ ] Verify each API returns proper response structure
- [ ] Test edit mode workflow end-to-end
- [ ] Test error cases (missing file, invalid input, etc.)
- [ ] Add JSDoc comments for IDE autocomplete
- [ ] Update FEATURE_4_QUICK_START.md with API examples
- [ ] Create agent-native test file for CI/CD

---

## Estimated Code Addition

| Component | Lines | Effort |
|-----------|-------|--------|
| API namespace + setup | 25 | 10 min |
| Edit mode control APIs | 85 | 20 min |
| Content modification APIs | 65 | 15 min |
| Save & persistence APIs | 95 | 20 min |
| Preview & navigation APIs | 70 | 15 min |
| State inspection API | 45 | 10 min |
| Error wrapper | 20 | 5 min |
| Documentation | 200 | 30 min |
| **TOTAL** | **605** | **125 min** |

---

## Next: Backward Compatibility

These new APIs don't change existing UI behavior:
- All new functions are in `window.markdownApp` namespace
- Original internal functions unchanged
- UI event handlers still work as before
- No breaking changes to existing code

---

**Ready to implement? Start with Step 1 and work through to Step 7.**
