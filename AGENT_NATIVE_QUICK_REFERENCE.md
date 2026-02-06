# Agent-Native Quick Reference - Feature 4

## At a Glance

```
Feature:           Edit & Save Mode (Feature 4)
Status:            NOT agent-native
Compliance:        2/8 (25%)
Verdict:           CRITICAL GAPS
Effort to Fix:     2-3 hours (605 lines)
Blocking Issues:   7 of 8 capabilities inaccessible
```

---

## User vs Agent Capability Matrix

### ✅ = User can, ✅ = Agent can | ❌ = Cannot

| Capability | User | Agent | Status |
|------------|:----:|:-----:|--------|
| Enter edit mode | ✅ | ❌ | BLOCKED |
| Type/modify content | ✅ | ❌ | BLOCKED |
| Save changes | ✅ | ❌ | BLOCKED |
| Toggle preview | ✅ | ❌ | BLOCKED |
| Exit edit mode | ✅ | ❌ | BLOCKED |
| Discard changes | ✅ | ❌ | BLOCKED |
| Switch files | ✅ | ⚠️ | UNSAFE |
| Check unsaved changes | ✅ | ⚠️ | UNDOCUMENTED |
| Keyboard shortcuts | ✅ | ❌ | BLOCKED |
| Auto-save | ✅ | ✅ | OK |

**Legend:** ✅ = Full access | ⚠️ = Partial/unsafe | ❌ = No access

---

## The 8 Critical Gaps (Ranked by Severity)

### Gap 1: No Edit Mode Entry API
**Severity:** CRITICAL
**Current:** Click button or Ctrl+E
**Agent:** ❌ BLOCKED
**Fix:** Add `window.markdownApp.enterEditMode()`

### Gap 2: No Content Modification API
**Severity:** CRITICAL
**Current:** Type in textarea
**Agent:** ❌ Must manipulate DOM
**Fix:** Add `window.markdownApp.setEditContent(text)`

### Gap 3: No Save API
**Severity:** CRITICAL
**Current:** Click button or Ctrl+S
**Agent:** ❌ BLOCKED
**Fix:** Add `window.markdownApp.saveEdit()`

### Gap 4: Keyboard Shortcuts Blocked
**Severity:** CRITICAL
**Current:** Press Ctrl+E, Ctrl+S, Escape
**Agent:** ❌ Blocked by `event.isTrusted`
**Fix:** Add `window.markdownApp.handleShortcut(action)`

### Gap 5: No Unsaved Changes Check API
**Severity:** HIGH
**Current:** See warning dialog
**Agent:** ⚠️ Must read `appState.edit.hasUnsavedChanges`
**Fix:** Add `window.markdownApp.checkUnsavedChanges()`

### Gap 6: No File Switch Confirmation
**Severity:** HIGH
**Current:** Dialog prompts before switch
**Agent:** ❌ Can't handle confirmation
**Fix:** Add `window.markdownApp.switchFile(id, options)`

### Gap 7: No Preview Toggle API
**Severity:** MEDIUM
**Current:** Click Preview button
**Agent:** ❌ BLOCKED
**Fix:** Add `window.markdownApp.togglePreview()`

### Gap 8: No State Inspection API
**Severity:** MEDIUM
**Current:** See everything in UI
**Agent:** ⚠️ Must access internal appState
**Fix:** Add `window.markdownApp.getEditState()`

---

## Current Architecture Problems

### Problem 1: Event Handlers Control Behavior
```javascript
// ❌ BAD
editorTextarea.addEventListener("input", () => {
  autoSaveEdit();  // Auto-save hardcoded in handler
});

// ✅ GOOD
window.markdownApp.setEditContent = function(content) {
  // ... set content ...
  if (config.autoSave) autoSaveEdit();
  return { success: true };
};
```

### Problem 2: DOM is Source of Truth
```javascript
// ❌ BAD
const isEditorVisible = editorEl.style.display !== "none";

// ✅ GOOD
return {
  editorVisible: appState.edit.isActive && !previewMode,
  ...
};
```

### Problem 3: Confirmation Blocks Agents
```javascript
// ❌ BAD
if (!confirmDiscardChanges()) return;

// ✅ GOOD
if (options.requiresConfirmation && !options.confirmed) {
  return {
    success: false,
    requiresConfirmation: true,
    options: ['saveChanges: true', 'discardChanges: true']
  };
}
```

### Problem 4: No Public API Contract
```javascript
// ❌ BAD
function enterEditMode() { ... }  // Internal only

// ✅ GOOD
window.markdownApp.enterEditMode = function() {
  // ... with full JSDoc and error handling
  return { success: true, isActive: true };
};
```

---

## What Agents Need to Do (Now vs Later)

### NOW (TODAY - BROKEN)
```javascript
// Agents cannot:
✗ Enter edit mode programmatically
✗ Modify content programmatically
✗ Save changes programmatically
✗ Check unsaved changes safely
✗ Switch files with confirmation
✗ Control preview rendering
✗ Use keyboard shortcuts
✗ Get reliable state information
```

### LATER (AFTER FIX)
```javascript
// Agents will be able to:
✓ window.markdownApp.enterEditMode()
✓ window.markdownApp.setEditContent(text)
✓ window.markdownApp.saveEdit()
✓ window.markdownApp.checkUnsavedChanges()
✓ window.markdownApp.switchFile(id, options)
✓ window.markdownApp.togglePreview()
✓ window.markdownApp.handleShortcut(action)
✓ window.markdownApp.getEditState()
```

---

## Implementation Phases (In Order)

| Phase | APIs Added | Effort | Impact |
|-------|-----------|--------|--------|
| 1 | namespace + enterEditMode, exitEditMode, getEditState | 30 min | Critical |
| 2 | setEditContent, getEditContent, saveEdit, checkUnsavedChanges | 40 min | Critical |
| 3 | discardChanges, togglePreview, getPreviewState, switchFile | 30 min | High |
| 4 | getAppState, handleShortcut | 15 min | Medium |
| 5 | Error handling wrapper | 10 min | Polish |
| **TOTAL** | **12 functions** | **125 min** | **COMPLETE** |

---

## Code Size Impact

```
Current app.js:        ~1400 lines
New API code:          ~600 lines (7 steps)
Estimated final size:  ~2000 lines

Other changes:
- FEATURE_4_QUICK_START.md: +100 lines (API examples)
- New test file: +200 lines (test suite)
- Total documentation: ~100 lines
```

---

## Use Cases Enabled After Fix

### 1. Automated Batch Editing
```javascript
// Apply same transform to 10 files
for (const fileId of files) {
  await app.switchFile(fileId, { saveChanges: true });
  await app.enterEditMode();
  const { current } = await app.getEditContent();
  const transformed = myTransform(current);
  await app.setEditContent(transformed);
  await app.saveEdit();
}
```

### 2. Programmatic Content Generation
```javascript
// Generate markdown from data
const markdown = generateMarkdown(data);
await app.enterEditMode();
await app.setEditContent(markdown);
await app.saveEdit();
```

### 3. Testing Edit Functionality
```javascript
// Test that auto-save works
await app.setEditContent('new content', { autoSave: false });
await wait(500);
const { hasUnsavedChanges } = await app.checkUnsavedChanges();
assert(hasUnsavedChanges === false);
```

### 4. Automated Formatting
```javascript
// Run linter on all files
for (const file of files) {
  const { current } = await app.getEditContent();
  const formatted = linter.format(current);
  if (formatted !== current) {
    await app.setEditContent(formatted);
    await app.saveEdit();
  }
}
```

### 5. Safe File Operations
```javascript
// Switch with explicit confirmation handling
const result = await app.switchFile(newFile, {});
if (result.requiresConfirmation) {
  // Ask user or use default
  const confirmed = await askUser("Save changes?");
  return await app.switchFile(newFile, {
    saveChanges: confirmed
  });
}
```

---

## Testing Checklist

Before marking as "agent-native", verify:

```
API Availability:
- [ ] window.markdownApp namespace exists
- [ ] All 12 functions are present
- [ ] Functions are callable (typeof === 'function')

Basic Operations:
- [ ] Can enter edit mode
- [ ] Can set content
- [ ] Can save changes
- [ ] Can exit edit mode
- [ ] Can switch files

Safety:
- [ ] Unsaved changes detected
- [ ] File switch requires confirmation
- [ ] Content size validated
- [ ] Errors return structured responses

State:
- [ ] getEditState() returns correct data
- [ ] getAppState() returns correct data
- [ ] State matches UI display

Workflows:
- [ ] Can do complete edit → save → exit workflow
- [ ] Can batch update multiple files
- [ ] Can handle unsaved changes safely
- [ ] Can preview without saving

Documentation:
- [ ] All APIs have JSDoc comments
- [ ] Examples work as written
- [ ] Error cases documented
- [ ] Agent access documented
```

---

## Success Criteria

Feature 4 is "agent-native" when:

1. **Parity:** ✓ Every UI action has an equivalent API
2. **Accessibility:** ✓ Agents can trigger all functionality
3. **Safety:** ✓ All operations return structured responses
4. **State:** ✓ Agents can read all state users see
5. **Documentation:** ✓ APIs documented with examples
6. **Testing:** ✓ Agent workflows verified in tests

---

## FAQ

**Q: Why is this a problem?**
A: Agents can only automate via UI manipulation (clicking, typing). Without APIs, batch editing, testing, and automation are impossible.

**Q: Why not just use UI automation?**
A: Brittle, slow, requires headless browser, fails on UI changes, can't verify state before actions.

**Q: How long to fix?**
A: 2-3 hours development + 1 hour testing. Code is straightforward wrapper around existing functions.

**Q: Will this break existing code?**
A: No. All new APIs go in window.markdownApp namespace. Existing UI code unchanged.

**Q: Should we do this?**
A: Yes. Required for agents to use the app. Makes app more testable and composable.

**Q: What comes after?**
A: Consider MCP tool definitions for Claude, CLI tools using the APIs, configuration API.

---

## Quick Decision Matrix

| Question | Answer | Action |
|----------|--------|--------|
| Is Feature 4 agent-native? | NO | Read full review |
| Are there critical gaps? | YES (7) | Implement all phases |
| How much work? | 2-3 hrs | Schedule sprint |
| Will it break things? | NO | Safe to do |
| Is this high priority? | YES | Do soon |

---

## Reading Order

1. **This document** (you are here) - 5 min
2. **AGENT_NATIVE_SUMMARY.md** - 10 min overview
3. **AGENT_NATIVE_REVIEW_FEATURE_4.md** - 30 min deep dive
4. **AGENT_NATIVE_IMPLEMENTATION_GUIDE.md** - 30 min coding guide
5. **Start implementing** following the guide - 120 min development

**Total time to complete:** ~195 minutes (3.25 hours)

---

## Related Documents

- **AGENT_NATIVE_REVIEW_FEATURE_4.md** - Complete technical analysis
- **AGENT_NATIVE_IMPLEMENTATION_GUIDE.md** - Step-by-step implementation with code
- **AGENT_NATIVE_SUMMARY.md** - Executive summary with impact assessment
- **FEATURE_4_QUICK_START.md** - User documentation (will need API updates)
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details

---

**Last Updated:** 2026-02-06
**Status:** Ready for implementation
**Next Action:** Review with team and schedule sprint
**Estimated Timeline:** 2-3 hours to implementation + 1 hour testing = 4 hours total
