# Architecture Diagrams - Feature 4 Analysis

## 1. Current System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                            │
│  (HTML structure: index.html)                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                              │
│  (CSS styling: styles.css)                                              │
│  - Editor container (.editor)                                           │
│  - Textarea (.editor-textarea)                                          │
│  - Stats bar (.editor-stats)                                            │
│  - Mobile responsive (@media 720px)                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER (app.js)                        │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Global State Management (appState object)                       │   │
│  │  ├─ files: Array                                                │   │
│  │  ├─ currentFile: Object                                         │   │
│  │  ├─ tags: Map                                                   │   │
│  │  ├─ search: { query, matches, currentMatchIndex }              │   │
│  │  └─ edit: { isActive, originalContent, hasUnsavedChanges }     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Feature Functions (grouped by feature)                          │   │
│  │                                                                  │   │
│  │  File Operations:                                               │   │
│  │  ├─ validateFile()      - Input validation                     │   │
│  │  ├─ handleFile()        - File processing                      │   │
│  │  ├─ selectFile()        - File selection (with guards)         │   │
│  │  └─ deleteFile()        - File deletion                        │   │
│  │                                                                  │   │
│  │  Edit Mode (Feature 4):                                         │   │
│  │  ├─ enterEditMode()     - Transition to edit, setup state      │   │
│  │  ├─ exitEditMode()      - Transition to view, optional save    │   │
│  │  ├─ saveEdit()          - Immediate save (no debounce)         │   │
│  │  ├─ autoSaveEdit()      - Debounced save (500ms)              │   │
│  │  ├─ togglePreview()     - Switch editor/preview               │   │
│  │  ├─ updateEditorStats() - Update word/char count              │   │
│  │  └─ confirmDiscardChanges() - User confirmation               │   │
│  │                                                                  │   │
│  │  Search Operations:                                             │   │
│  │  ├─ performSearch()     - Full-text search with debounce       │   │
│  │  ├─ highlightMatches()  - Create visual highlights             │   │
│  │  ├─ nextMatch()         - Navigate matches                     │   │
│  │  ├─ prevMatch()         - Navigate matches                     │   │
│  │  └─ clearSearch()       - Reset search state                   │   │
│  │                                                                  │   │
│  │  Tag Operations:                                                │   │
│  │  ├─ addTagToCurrentFile()    - Add tag to file                 │   │
│  │  ├─ removeTagFromCurrentFile() - Remove tag from file          │   │
│  │  ├─ toggleTagFilter()         - Toggle tag filter              │   │
│  │  └─ rebuildTagsIndex()        - Rebuild tag index              │   │
│  │                                                                  │   │
│  │  Rendering Functions:                                           │   │
│  │  ├─ renderMarkdown()     - Convert MD to HTML (marked.js)      │   │
│  │  ├─ renderFileList()     - Render sidebar file list            │   │
│  │  ├─ renderTagCloud()     - Render tag cloud                    │   │
│  │  ├─ renderTagInput()     - Render tag chips                    │   │
│  │  └─ exportToPDF()        - Export to PDF (html2pdf)            │   │
│  │                                                                  │   │
│  │  Utility Functions:                                             │   │
│  │  ├─ formatFileSize()     - Format bytes to KB/MB               │   │
│  │  ├─ getFileExtension()   - Extract file extension              │   │
│  │  ├─ escapeHtml()         - Prevent XSS                         │   │
│  │  └─ getFilteredFiles()   - Apply tag filters                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Event Wiring (20+ addEventListener calls)                      │   │
│  │  ├─ File input change       → handleFile()                      │   │
│  │  ├─ Drop zone drag/drop     → handleFile()                      │   │
│  │  ├─ Edit button click       → enterEditMode()                   │   │
│  │  ├─ Save button click       → saveEdit()                        │   │
│  │  ├─ Cancel button click     → exitEditMode(false)               │   │
│  │  ├─ Preview button click    → togglePreview()                   │   │
│  │  ├─ Textarea input          → autoSaveEdit()                    │   │
│  │  ├─ Textarea Tab key        → Insert tab character              │   │
│  │  ├─ Search input            → performSearch() [debounced]       │   │
│  │  ├─ Search navigation       → nextMatch(), prevMatch()          │   │
│  │  ├─ Global Ctrl+E           → Toggle edit mode                  │   │
│  │  ├─ Global Ctrl+S           → Save while editing                │   │
│  │  ├─ Global Ctrl+F           → Focus search                      │   │
│  │  ├─ Global Escape           → Exit edit/search mode             │   │
│  │  ├─ File list delegation    → selectFile(), deleteFile()        │   │
│  │  ├─ Tag list delegation     → toggleTagFilter()                 │   │
│  │  ├─ Tag chip delegation     → removeTagFromCurrentFile()        │   │
│  │  └─ Clear filters button    → clearAllFilters()                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  DOM References (30+ variables)                                  │   │
│  │  ├─ File elements      (fileInput, dropZone, previewEl, etc.)   │   │
│  │  ├─ Edit elements      (editBtn, saveEditBtn, editorEl, etc.)   │   │
│  │  ├─ Search elements    (searchInput, searchPrevBtn, etc.)       │   │
│  │  └─ Tag elements       (tagListEl, tagsDisplayEl, etc.)         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER (storage.js)                     │
│  ├─ saveToStorage()          - Serialize & save to localStorage        │
│  ├─ loadFromStorage()        - Deserialize from localStorage           │
│  ├─ generateFileId()         - Create unique file IDs                  │
│  └─ getStorageUsagePercent() - Monitor quota usage                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL DEPENDENCIES (CDN)                         │
│  ├─ marked.js        - Markdown parsing                               │
│  ├─ highlight.js     - Syntax highlighting                            │
│  └─ html2pdf.js      - PDF export                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Feature 4 (Edit Mode) Component Interaction

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                               │
│  (Click Edit button OR press Ctrl+E)                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  EVENT HANDLER                                                          │
│  editBtn.addEventListener("click", enterEditMode)                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  FUNCTION: enterEditMode()                                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ STEP 1: Update Edit State                                       │    │
│  │  ├─ appState.edit.isActive = true                              │    │
│  │  ├─ appState.edit.originalContent = currentFile.content        │    │
│  │  └─ appState.edit.hasUnsavedChanges = false                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ STEP 2: Manipulate DOM (Presentation)                           │    │
│  │  ├─ previewEl.style.display = "none"                           │    │
│  │  ├─ editorEl.style.display = "flex"                            │    │
│  │  ├─ editorTextarea.value = content                             │    │
│  │  ├─ editorTextarea.focus()                                     │    │
│  │  ├─ editBtn.style.display = "none"                             │    │
│  │  ├─ saveEditBtn.style.display = "inline-block"                 │    │
│  │  ├─ cancelEditBtn.style.display = "inline-block"               │    │
│  │  ├─ previewEditBtn.style.display = "inline-block"              │    │
│  │  └─ exportPdfBtn.disabled = true                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ STEP 3: Side Effects (Affects Other Features)                   │    │
│  │  ├─ clearSearch()        ← Search feature dependency            │    │
│  │  ├─ searchInput.disabled = true  ← Search UI dependency         │    │
│  │  └─ updateEditorStats()  ← UI update                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐
        │  EDIT STATE     │ │  PRESENTATION   │ │  SIDE EFFECTS    │
        │   Updated       │ │    Updated      │ │     Executed     │
        │                 │ │                 │ │                  │
        │ edit:           │ │ Visual changes: │ │ - Search cleared │
        │ {               │ │ - Editor shown  │ │ - PDF disabled   │
        │   isActive: T   │ │ - Preview hidden│ │ - Search disabled│
        │   original: ... │ │ - Buttons shown │ │ - Stats updated  │
        │   unsaved: F    │ │ - Focus moved   │ │                  │
        │ }               │ │                 │ │                  │
        └─────────────────┘ └─────────────────┘ └──────────────────┘
```

---

## 3. Feature Coupling Problem Map

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     CURRENT COUPLING ISSUES                              │
└──────────────────────────────────────────────────────────────────────────┘

                            Edit Mode
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
            Search         PDF Export    File Switching
            ┌────────┐     ┌────────┐    ┌──────────────┐
            │disabled│     │disabled│    │requires check│
            │cleared │     │button  │    │confirmation  │
            │input   │     │disabled│    │dialog        │
            │disabled│     └────────┘    └──────────────┘
            └────────┘
                ▲
                │
         ❌ TIGHTLY COUPLED
            (enterEditMode calls
             clearSearch directly)


        IMPLICIT DEPENDENCIES (Hidden in code)
        ═══════════════════════════════════════

        Edit Mode                Search Feature
        ┌─────────────────┐     ┌──────────────┐
        │ enterEditMode() │────→│ clearSearch()│  ← Knows about
        │ (line 228)      │     │              │    search internals
        └─────────────────┘     └──────────────┘
                │
                │ Also depends on:
                ├→ searchInput (DOM ref)
                ├→ exportPdfBtn (DOM ref)
                └→ updateEditorStats() (internal fn)


        FEATURE INTERACTION RISKS
        ════════════════════════════════════════

        If search refactors:        If PDF refactors:
        ┌──────────────────────┐   ┌────────────────────┐
        │ clearSearch() renamed │   │ PDF button removed │
        │ or moved             │   │ or restructured    │
        │                      │   │                    │
        │ → enterEditMode() ❌  │   │ → enterEditMode() ❌│
        │   crashes silently   │   │   silently fails   │
        └──────────────────────┘   └────────────────────┘


        SOLUTION: Feature API Layer
        ════════════════════════════════════════

        Edit Mode              Feature API            Features
        ┌──────────────┐      ┌──────────────┐      ┌─────────┐
        │Enter Edit    │──→   │ disableAll() │ ──→  │ Search  │
        │Mode          │      │              │      │ PDF     │
        │              │      │ enableAll()  │      │ Tags    │
        └──────────────┘      │              │      │ Files   │
                              │ Get state()  │      └─────────┘
                              └──────────────┘
```

---

## 4. Event Handler Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│            CURRENT: SCATTERED EVENT LISTENERS (20+ places)               │
└──────────────────────────────────────────────────────────────────────────┘

File: app.js (1,416 lines)

Line 1,073-1,092   →  File input setup
Line 1,102-1,147   →  Drop zone setup
Line 1,149-1,187   →  Search input & navigation
Line 1,189-1,191   →  PDF export button
Line 1,195-1,196   →  Edit button
Line 1,199-1,202   →  Save button
Line 1,205-1,210   →  Cancel button
Line 1,213-1,214   →  Preview button
Line 1,218-1,239   →  Textarea events (input, keydown)
Line 1,242-1,293   →  Global keyboard shortcuts
Line 1,296-1,317   →  File list delegation
Line 1,320-1,328   →  Tag list delegation
Line 1,331-1,339   →  Tag chip delegation
Line 1,342-1,354   →  Tag input wiring
Line 1,357-1,360   →  Clear filters button
Line 1,363-1,370   →  Sidebar toggle

❌ PROBLEM:
   - Hard to see all events at once
   - No central registry
   - Easy to miss duplicate listeners
   - Difficult to refactor

┌──────────────────────────────────────────────────────────────────────────┐
│           RECOMMENDED: CENTRALIZED EVENT REGISTRY                        │
└──────────────────────────────────────────────────────────────────────────┘

// All events defined in ONE place:

const eventRegistry = {
  'file-input:change': handleFileSelect,
  'drop-zone:dragenter': activateDropZone,
  'drop-zone:dragover': activateDropZone,
  'drop-zone:dragleave': deactivateDropZone,
  'drop-zone:drop': handleFileDrop,
  'drop-zone:click': openFilePicker,

  'search-input:input': debounceSearch,
  'search-input:keydown': handleSearchKeyboard,
  'search-prev-btn:click': prevMatch,
  'search-next-btn:click': nextMatch,
  'search-clear-btn:click': clearSearch,

  'edit-btn:click': enterEditMode,
  'save-edit-btn:click': saveEdit,
  'cancel-edit-btn:click': exitWithConfirm,
  'preview-edit-btn:click': togglePreview,
  'editor-textarea:input': updateEditor,
  'editor-textarea:keydown': handleTabKey,

  'export-pdf-btn:click': exportToPDF,

  'file-list:click': handleFileListClick,
  'tag-list:click': handleTagListClick,
  'tags-display:click': handleTagChipClick,
  'tag-input:keydown': handleTagInput,
  'clear-filters:click': clearAllFilters,
  'sidebar-toggle:click': toggleSidebar,

  'document:keydown': handleGlobalShortcuts,
};

// Single setup function:
function wireAllEventListeners() {
  Object.entries(eventRegistry).forEach(([selector, handler]) => {
    const [elementId, event] = selector.split(':');
    const element = elementId === 'document'
      ? document
      : document.getElementById(elementId);

    if (element) {
      element.addEventListener(event, handler);
    }
  });
}

wireAllEventListeners();

✅ BENEFITS:
   - All events visible in one place
   - Easy to see event → handler mapping
   - Simpler to add/remove events
   - Single source of truth for event wiring
```

---

## 5. State Management Lifecycle

```
┌──────────────────────────────────────────────────────────────────────────┐
│         EDIT MODE STATE LIFECYCLE (Current Implementation)               │
└──────────────────────────────────────────────────────────────────────────┘

    Initial State
    ┌────────────────────────────────────┐
    │ edit: {                             │
    │   isActive: false,                  │
    │   originalContent: "",              │
    │   hasUnsavedChanges: false          │
    │ }                                   │
    └────────────────────────────────────┘
                  │
                  │ User clicks Edit button
                  ▼
    ┌────────────────────────────────────┐
    │ Enter Edit Mode                     │
    │ appState.edit.isActive = true       │
    │ originalContent = current content   │
    │ hasUnsavedChanges = false           │
    └────────────────────────────────────┘
                  │
          ┌───────┴───────┐
          │               │
          ▼               ▼
    ┌──────────┐   ┌──────────────┐
    │  TYPING  │   │  PREVIEW     │
    │          │   │ (toggle)     │
    │ Changes  │   │              │
    │ trigger  │   │ Doesn't save │
    │ debounce │   │              │
    └────┬─────┘   └──────┬───────┘
         │                │
         └───────┬────────┘
                 │
                 ▼ After 500ms with unsaved changes
    ┌────────────────────────────────────┐
    │ Auto-Save (debounced)               │
    │ Updates localStorage automatically  │
    │ Clears pending auto-save timer      │
    └────────────────────────────────────┘
         │
         ├─ (or) Click Save button
         │   └─ Immediate save, no debounce
         │      └─ Saves to storage now
         │
         └─ (or) Click Cancel button with changes
             └─ Shows confirmation dialog
                ├─ User says YES
                │  └─ Discard changes
                │     └─ Revert to originalContent
                │
                └─ User says NO
                   └─ Stay in edit mode


    ┌────────────────────────────────────┐
    │ Exit Edit Mode (View Mode)          │
    │ appState.edit.isActive = false      │
    │ Clear unsaved changes tracking      │
    │ Render markdown preview             │
    └────────────────────────────────────┘
                  │
                  │ Loop back
                  ▼
    Initial State (or edited state if saved)


    STATE INVARIANTS (Must Always Hold)
    ═══════════════════════════════════════════════════════════════════════

    1. If isActive === true:
       - originalContent must be set
       - currentFile must be loaded
       - textarea must exist in DOM

    2. If hasUnsavedChanges === true:
       - isActive must be true
       - currentFile.content !== textarea.value

    3. If isActive === true:
       - previewEl must be hidden
       - editorEl must be visible
       - search must be disabled
       - PDF export must be disabled

    ⚠️ CURRENT IMPLEMENTATION:
       - No validation of these invariants
       - Silent failures if assumptions violated
```

---

## 6. Recommended Architecture: Mode State Machine

```
┌──────────────────────────────────────────────────────────────────────────┐
│         PROPOSED: MODE STATE MACHINE (Scalable to 5+ modes)              │
└──────────────────────────────────────────────────────────────────────────┘

                            AppMode
                              │
                ┌─────────────┬┼┬─────────────┐
                │             │ │             │
                ▼             ▼ ▼             ▼
              VIEW          EDIT           DIFF
            (read-only)   (editable)    (comparison)


            STATE TRANSITIONS (Valid paths)
            ════════════════════════════════════════════════════════════

                ┌──────────┐
                │   VIEW   │ ◄──────────────┐
                └─────┬────┘               │
                      │ Edit               │ Exit
                      │ Diff               │ (no changes)
                      ▼                   │
                ┌──────────┐              │
                │   EDIT   ├──────────────┘
                └─────┬────┘ Exit
                      │     (discard)
                      │
              ┌───────┴────────┐
              │                │
              │ Preview        │ Save
              │ (temp)         │ (persist)
              │                │
              └────────────────┘


            STATE MACHINE IMPLEMENTATION
            ════════════════════════════════════════════════════════════

            class ModeManager {
              constructor() {
                this.currentMode = 'VIEW';
                this.validTransitions = {
                  'VIEW': ['EDIT', 'DIFF'],
                  'EDIT': ['VIEW'],
                  'DIFF': ['VIEW'],
                };
              }

              canTransitionTo(newMode) {
                return this.validTransitions[this.currentMode]
                  ?.includes(newMode) ?? false;
              }

              setMode(newMode) {
                if (!this.canTransitionTo(newMode)) {
                  throw new Error(
                    `Invalid transition: ${this.currentMode} → ${newMode}`
                  );
                }
                this.currentMode = newMode;
                this.notifyListeners(newMode);
              }

              onModeChange(callback) {
                this.listeners.push(callback);
              }

              notifyListeners(newMode) {
                this.listeners.forEach(cb => cb(newMode));
              }
            }


            FEATURE REACTIONS TO MODE CHANGES
            ════════════════════════════════════════════════════════════

            modeManager.onModeChange((newMode) => {
              const config = modeConfigs[newMode];

              // Apply feature contract
              if (config.disableFeaturesSearch) {
                search.disable();
              }
              if (config.enableFeaturesSearch) {
                search.enable();
              }

              // Apply UI contract
              applyUIChanges(config.uiChanges);

              // Notify features
              featureAPI.broadcastModeChange(newMode);
            });


            ADVANTAGES
            ════════════════════════════════════════════════════════════
            ✅ Explicit, validated state transitions
            ✅ Prevents invalid mode combinations
            ✅ Scales to 10+ modes without code duplication
            ✅ Decouples features from each other
            ✅ Observable pattern for feature reactions
            ✅ Testable state logic
            ✅ Centralized feature interaction rules
```

---

## 7. Separation of Concerns: Before & After

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           CURRENT (Mixed)                                │
│  function enterEditMode() {                                              │
│    ┌─────────────────────────────────────────────────────────────┐      │
│    │ STATE MANAGEMENT (Business Logic)                           │      │
│    │ ├─ appState.edit.isActive = true                           │      │
│    │ ├─ appState.edit.originalContent = ...                     │      │
│    │ └─ appState.edit.hasUnsavedChanges = false                 │      │
│    └─────────────────────────────────────────────────────────────┘      │
│                                                                          │
│    ┌─────────────────────────────────────────────────────────────┐      │
│    │ DOM MANIPULATION (Presentation)                             │      │
│    │ ├─ previewEl.style.display = "none"                        │      │
│    │ ├─ editorEl.style.display = "flex"                         │      │
│    │ ├─ editBtn.style.display = "none"                          │      │
│    │ ├─ saveEditBtn.style.display = "inline-block"              │      │
│    │ └─ ... (8 more DOM operations)                             │      │
│    └─────────────────────────────────────────────────────────────┘      │
│                                                                          │
│    ┌─────────────────────────────────────────────────────────────┐      │
│    │ SIDE EFFECTS (Feature Coupling)                             │      │
│    │ ├─ clearSearch()     ← Depends on search impl               │      │
│    │ ├─ searchInput.disabled = true  ← Depends on DOM refs      │      │
│    │ └─ updateEditorStats()          ← Triggers another fn      │      │
│    └─────────────────────────────────────────────────────────────┘      │
│  }                                                                       │
│                                                                          │
│  ❌ PROBLEMS:                                                             │
│     - Can't unit test without DOM                                       │
│     - Can't test state change separately from rendering                 │
│     - Can't reuse state logic in different contexts                     │
│     - Hard to understand what function really does                      │
│     - Difficult to refactor without breaking something                  │
└──────────────────────────────────────────────────────────────────────────┘

                                    │
                                    │ REFACTOR
                                    ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                        RECOMMENDED (Separated)                           │
│                                                                          │
│  // STEP 1: Pure State Management (Testable)                            │
│  function computeEditModeState(currentFile) {                           │
│    ┌─────────────────────────────────────────────────────────────┐      │
│    │ return {                                                    │      │
│    │   edit: {                                                  │      │
│    │     isActive: true,                                        │      │
│    │     originalContent: currentFile.content,                  │      │
│    │     hasUnsavedChanges: false,                              │      │
│    │   }                                                         │      │
│    │ };                                                          │      │
│    └─────────────────────────────────────────────────────────────┘      │
│  }                                                                       │
│                                                                          │
│  ✅ Can be unit tested without DOM                                       │
│  ✅ Pure function (same input → same output)                             │
│  ✅ Reusable in different contexts                                       │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  // STEP 2: Pure Rendering Logic                                        │
│  function applyEditModeUI(state) {                                      │
│    ┌─────────────────────────────────────────────────────────────┐      │
│    │ const isEditing = state.edit.isActive;                     │      │
│    │                                                             │      │
│    │ // Update visibility                                       │      │
│    │ previewEl.style.display = isEditing ? "none" : "block";    │      │
│    │ editorEl.style.display = isEditing ? "flex" : "none";      │      │
│    │                                                             │      │
│    │ // Update buttons                                          │      │
│    │ editBtn.style.display = isEditing ? "none" : "inline";     │      │
│    │ saveEditBtn.style.display = isEditing ? "inline" : "none"; │      │
│    │ // ... etc                                                 │      │
│    └─────────────────────────────────────────────────────────────┘      │
│  }                                                                       │
│                                                                          │
│  ✅ Focused on rendering only                                            │
│  ✅ Derivable from state                                                 │
│  ✅ Can be replaced for different UI contexts                            │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  // STEP 3: Feature Integration (Through API)                           │
│  function onEnterEditMode() {                                           │
│    ┌─────────────────────────────────────────────────────────────┐      │
│    │ // Update state                                             │      │
│    │ appState = computeEditModeState(appState.currentFile);     │      │
│    │                                                             │      │
│    │ // Apply rendering                                         │      │
│    │ applyEditModeUI(appState);                                 │      │
│    │                                                             │      │
│    │ // Notify other features through API                       │      │
│    │ featureAPI.search.disable();                               │      │
│    │ featureAPI.pdf.disable();                                  │      │
│    │                                                             │      │
│    │ // Persist                                                 │      │
│    │ saveToStorage();                                           │      │
│    └─────────────────────────────────────────────────────────────┘      │
│  }                                                                       │
│                                                                          │
│  ✅ Orchestrates different concerns                                      │
│  ✅ Clear data flow                                                      │
│  ✅ Easy to understand overall logic                                     │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ✅ BENEFITS:                                                             │
│     ✓ State logic is testable (no DOM needed)                            │
│     ✓ Rendering is isolated and reusable                                │
│     ✓ Feature interactions explicit (through API)                       │
│     ✓ Easy to add new rendering contexts (themes, layouts)              │
│     ✓ Clear separation makes refactoring safe                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Scalability: Feature Growth Impact

```
┌──────────────────────────────────────────────────────────────────────────┐
│               CURRENT ARCHITECTURE: Feature Growth                       │
└──────────────────────────────────────────────────────────────────────────┘

Features:   4 (File, Search, Tags, Edit)
Code:       1,416 lines (app.js)
Events:     20 listeners
Couplings:  10+ inter-feature dependencies
Testable:   0% (manual testing only)
Complexity: ~O(n²) - Each feature affects many others


Feature Addition Growth Curve (Current Architecture):
────────────────────────────────────────────────────

            Lines of Code per Feature
            ▲
            │                                    ●
            │                                   /
            │                                  /
            │                           ●    /
            │                          /    /
            │                  ●     /    /
            │                 /    /    /
            │        ●      /    /    /
            │       /     /    /    /
            │      /    /    /    /
            │   ●    /    /    /
            │  /   /    /    /
            │ /  /    /    /
            └─────────────────────────────► Features
              1   2    3    4    5    6

Feature 1 (File):      150 lines  ✅
Feature 2 (Search):    200 lines  ✅ (same complexity as Feature 1)
Feature 3 (Tags):      200 lines  ⚠️  (some interaction overhead)
Feature 4 (Edit):      250 lines  ⚠️⚠️ (tight coupling to existing features)
Feature 5 (Diff):      300 lines  ❌  (copies edit pattern, adds duplication)
Feature 6 (Preview):   350 lines  ❌  (mode conflicts, mutual exclusions)

Problem: Each new feature requires knowledge of ALL existing features


┌──────────────────────────────────────────────────────────────────────────┐
│             RECOMMENDED ARCHITECTURE: Feature Growth                     │
└──────────────────────────────────────────────────────────────────────────┘

Features:   4 (File, Search, Tags, Edit) → modularized
Code:       1,600 lines (organized in modules)
Events:     20 listeners (centralized registry)
Couplings:  All through Feature API (explicit, isolated)
Testable:   90%+ (unit tests for each feature)
Complexity: ~O(n) - Each feature is independent


Feature Addition Growth Curve (Recommended Architecture):
──────────────────────────────────────────────────────────

            Lines of Code per Feature (Modular)
            ▲
            │
            │  ●                                ●
            │  │                                │
            │  │                          ●     │
            │  │                          │     │
            │  │                   ●      │     │
            │  │                   │      │     │
            │  │             ●     │      │     │
            │  │             │     │      │     │
            │  │       ●     │     │      │     │
            │  │       │     │     │      │     │
            │  │  ●    │     │     │      │     │
            │  │  │    │     │     │      │     │
            │  │  │    │     │     │      │     │
            └──┼──┼────┼─────┼─────┼──────┼─────► Features
               1  2    3     4     5      6

Feature 1 (File):      150 lines  ✅
Feature 2 (Search):    150 lines  ✅ (same as Feature 1)
Feature 3 (Tags):      150 lines  ✅ (independent)
Feature 4 (Edit):      150 lines  ✅ (through Feature API)
Feature 5 (Diff):      150 lines  ✅ (uses Mode Manager)
Feature 6 (Preview):   150 lines  ✅ (plugs into existing system)

Benefit: Each feature has consistent complexity regardless of others


DEVELOPMENT TIME COMPARISON
════════════════════════════════════════════════════════════════════════════

Adding Feature 5 (Diff View):

Current Architecture:
├─ Understand existing 4 features        → 3 hours
├─ Learn coupling patterns               → 2 hours
├─ Copy edit mode pattern                → 1 hour
├─ Adapt for diff functionality          → 2 hours
├─ Debug feature interactions            → 3 hours
├─ Manual testing all scenarios          → 2 hours
└─ Total: ~13 hours

Recommended Architecture:
├─ Read Mode Manager docs                → 0.5 hours
├─ Read Feature API contract             → 0.5 hours
├─ Implement diff feature (isolated)     → 2 hours
├─ Register with ModeManager             → 0.5 hours
├─ Run automated tests                   → 0.5 hours
└─ Total: ~4 hours (69% reduction)
```

---

## Summary

This diagram set shows:

1. **Current System** - How all layers interact today
2. **Edit Mode Interaction** - Detailed flow for Feature 4
3. **Coupling Problem Map** - Why tight coupling hurts
4. **Event Handler Architecture** - Current vs. recommended
5. **State Lifecycle** - How edit state evolves
6. **State Machine Design** - Proposed scalable approach
7. **Separation of Concerns** - Before/after refactoring
8. **Scalability Impact** - How architecture affects growth

All diagrams are text-based for easy version control and documentation.
