# Implementation Plan: Tags Feature for Markdown Note Taking App

## Overview

Add tagging functionality to the Markdown Note Taking App, allowing users to:
- Assign multiple tags to each note
- Filter notes by selecting one or more tags
- Organize their note library using tags

**Key Insight:** This feature requires a fundamental architectural shift from single-file viewer to multi-file library manager. Can't filter by tags with only one file loaded at a time!

**Complexity:** High (~400-500 LOC addition, ~60% of app rewritten)

---

## Architecture Changes

### Data Model Transformation

**Current (Single File):**
```javascript
appState = {
  currentFile: null  // Only one file
}
```

**New (Multi-File Library):**
```javascript
appState = {
  files: [],              // Array of all loaded files
  currentFileId: null,    // ID of currently viewed file
  tags: Map<tagName, Set<fileIds>>,  // Bidirectional tag index
  activeFilters: Set<tagName>,       // Active tag filters
  currentFile: null       // Keep for compatibility
}

// Enhanced file object
{
  id: string,              // Hash: `${name}_${lastModified}_${size}`
  name: string,
  size: number,
  type: string,
  lastModified: number,
  content: string,
  tags: Set<string>,       // Tags for this file
  addedAt: timestamp,
  lastViewed: timestamp
}
```

### Persistence Strategy

**LocalStorage Structure:**
```javascript
// Key: 'markdown-app-library'
{
  version: 1,
  files: [
    {
      id: "notes.md_1234567890_1024",
      name: "notes.md",
      tags: ["work", "important"],  // Set → Array for JSON
      // ... other fields
    }
  ],
  settings: {
    sidebarExpanded: true,
    sortBy: "recent"
  }
}
```

**Functions:**
- `saveToStorage()` - Persist appState to localStorage
- `loadFromStorage()` - Restore appState on init
- `generateFileId(file)` - Create unique ID from file metadata

---

## UI/UX Changes

### New Layout

```
┌──────────────────────────────────────────┐
│ Header (+ Sidebar Toggle, Filter Toggle) │
├──────────┬───────────────────────────────┤
│          │                               │
│ Sidebar  │     Preview Area              │
│          │                               │
│ Files    │  (Rendered markdown)          │
│ (280px)  │                               │
│          │  Tags: [work] [important]     │
│ Tags     │  + Add tag...                 │
│          │                               │
└──────────┴───────────────────────────────┘
```

### New Components

1. **Sidebar** (`<aside class="sidebar">`)
   - File library section (file list with tag badges)
   - Tag cloud section (all tags with counts, clickable filters)
   - Collapsible on mobile

2. **Tag Input** (below file-meta)
   - Chip-style tag display with remove buttons
   - Text input with autocomplete
   - Enter to add, click × to remove

3. **Tag Filter** (in sidebar)
   - Show all tags with file counts
   - Click to toggle active filter
   - "Clear filters" button
   - AND logic: file must have ALL selected tags

4. **File List**
   - Click to view file
   - Show tags as badges
   - Delete button per file
   - Active state highlight
   - Sort by: recent (default), name, size

---

## Implementation Steps

### Phase 1: Foundation (New File)
**Create:** `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App/storage.js`

```javascript
// Core persistence functions
function generateFileId(file) {
  return `${file.name}_${file.lastModified}_${file.size}`;
}

function saveToStorage() {
  const data = {
    version: 1,
    files: appState.files.map(f => ({
      ...f,
      tags: Array.from(f.tags)  // Convert Set → Array
    })),
    settings: { /* ... */ }
  };
  localStorage.setItem('markdown-app-library', JSON.stringify(data));
}

function loadFromStorage() {
  const raw = localStorage.getItem('markdown-app-library');
  if (!raw) return null;
  const data = JSON.parse(raw);
  // Reconstruct Sets from Arrays
  data.files.forEach(f => f.tags = new Set(f.tags));
  return data;
}
```

### Phase 2: Data Model Update
**Modify:** `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App/app.js:2-4`

```javascript
const appState = {
  files: [],
  currentFileId: null,
  tags: new Map(),
  activeFilters: new Set(),
  currentFile: null  // Legacy compatibility
};
```

### Phase 3: Multi-File Support
**Modify:** `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App/app.js:112-138` (handleFile function)

**Changes:**
- Don't replace `currentFile`, add to `files` array
- Generate file ID and check for duplicates
- Update existing file if duplicate, otherwise add new
- Set as `currentFileId`
- Save to localStorage
- Render file list

**New Functions to Add:**
```javascript
function selectFile(fileId) {
  // Switch to different file in library
  const file = appState.files.find(f => f.id === fileId);
  file.lastViewed = Date.now();
  appState.currentFileId = fileId;
  appState.currentFile = file;
  saveToStorage();
  renderCurrentFile();
  renderFileList();
}

function deleteFile(fileId) {
  // Remove from files array
  // Clean up tags index
  // If was current file, clear preview
  // Save and re-render
}

function renderFileList() {
  // Get filtered files
  // Sort by recent/name/size
  // Render file items with tags badges
  // Wire up click handlers
}

function getFilteredFiles() {
  if (appState.activeFilters.size === 0) return appState.files;

  return appState.files.filter(file => {
    // AND logic: file must have ALL active tags
    for (const tag of appState.activeFilters) {
      if (!file.tags.has(tag)) return false;
    }
    return true;
  });
}
```

### Phase 4: Tag Management
**Add to:** `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App/app.js`

```javascript
function addTagToCurrentFile(tagName) {
  const normalized = tagName.trim().toLowerCase();

  // Validation
  if (!normalized || normalized.length > 20) return;
  if (!/^[a-z0-9-_]+$/.test(normalized)) {
    showError("Tags: letters, numbers, hyphens, underscores only");
    return;
  }

  // Add to file
  appState.currentFile.tags.add(normalized);

  // Update tags index
  if (!appState.tags.has(normalized)) {
    appState.tags.set(normalized, new Set());
  }
  appState.tags.get(normalized).add(appState.currentFile.id);

  saveToStorage();
  renderTagInput();
  renderFileList();
  renderTagCloud();
}

function removeTagFromCurrentFile(tagName) {
  const normalized = tagName.trim().toLowerCase();
  appState.currentFile.tags.delete(normalized);

  // Update tags index
  const tagFiles = appState.tags.get(normalized);
  if (tagFiles) {
    tagFiles.delete(appState.currentFile.id);
    if (tagFiles.size === 0) appState.tags.delete(normalized);
  }

  saveToStorage();
  renderTagInput();
  renderFileList();
  renderTagCloud();
}

function rebuildTagsIndex() {
  // Called on app init to rebuild tags Map from files
  appState.tags.clear();
  appState.files.forEach(file => {
    file.tags.forEach(tag => {
      if (!appState.tags.has(tag)) {
        appState.tags.set(tag, new Set());
      }
      appState.tags.get(tag).add(file.id);
    });
  });
}

function toggleTagFilter(tagName) {
  if (appState.activeFilters.has(tagName)) {
    appState.activeFilters.delete(tagName);
  } else {
    appState.activeFilters.add(tagName);
  }

  renderFileList();
  renderTagCloud();

  // If current file filtered out, clear preview
  const filteredFiles = getFilteredFiles();
  if (!filteredFiles.some(f => f.id === appState.currentFileId)) {
    appState.currentFileId = null;
    appState.currentFile = null;
    showDropZone();
  }
}
```

### Phase 5: Tag UI Rendering
**Add to:** `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App/app.js`

```javascript
function renderTagInput() {
  // Show current file's tags as chips with × buttons
  // Show input field for adding new tags
  // Wire up autocomplete on input
}

function renderTagCloud() {
  // Get all tags sorted by usage count
  // Render as clickable filters with counts
  // Highlight active filters
}

function getTagSuggestions(input) {
  // Return top 5 tags matching input prefix
  // For autocomplete dropdown
}
```

### Phase 6: HTML Structure
**Modify:** `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App/index.html`

**Add after `<header class="app-header">`:**
```html
<div class="app-body">
  <aside class="sidebar">
    <section class="file-library">
      <h3>Files <span class="count">(0)</span></h3>
      <div class="file-list"></div>
    </section>

    <section class="tag-cloud">
      <h3>Tags</h3>
      <div class="tag-list"></div>
      <button class="clear-filters">Clear filters</button>
    </section>
  </aside>

  <main class="app-main">
    <!-- Existing drop-zone, file-meta, preview -->

    <!-- NEW: Add before file-meta -->
    <section class="tag-input">
      <div class="tags-display"></div>
      <input type="text" placeholder="Add tag..." />
    </section>
  </main>
</div>
```

**Update header controls:**
```html
<div class="app-controls">
  <button class="sidebar-toggle">☰</button>
  <button class="filter-toggle">🏷️ Filters</button>
  <label class="file-button">📁 Add File</label>
</div>
```

### Phase 7: CSS Styling
**Add to:** `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App/styles.css`

**Key additions (~300 lines):**

```css
/* Layout */
.app-body {
  display: flex;
  gap: 16px;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  padding: 16px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.sidebar--collapsed {
  display: none;
}

/* File list item */
.file-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}

.file-item:hover {
  background: var(--color-bg-elevated);
}

.file-item--active {
  background: var(--color-accent-soft);
  border: 1px solid var(--color-accent);
}

.file-item__name {
  font-weight: 500;
  margin-bottom: 4px;
}

.file-item__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.file-item__delete {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.15s;
}

.file-item:hover .file-item__delete {
  opacity: 1;
}

/* Tag chips */
.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--color-accent-soft);
  border: 1px solid rgba(0, 102, 204, 0.2);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-accent);
}

.tag-chip__remove {
  cursor: pointer;
  font-weight: bold;
  padding: 0 2px;
}

.tag-chip__remove:hover {
  color: var(--color-error);
}

/* Tag input */
.tag-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--color-bg-elevated);
  border-radius: 8px;
  margin-bottom: 16px;
}

.tag-input input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  outline: none;
}

/* Tag filter (sidebar) */
.tag-filter-item {
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  transition: background 0.15s;
}

.tag-filter-item:hover {
  background: var(--color-bg-elevated);
}

.tag-filter-item--active {
  background: var(--color-accent-soft);
  border: 1px solid var(--color-accent);
}

.tag-filter-item__count {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  }

  .sidebar--collapsed {
    transform: translateX(-100%);
  }
}
```

### Phase 8: Event Wiring & Initialization
**Add to:** `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App/app.js`

```javascript
function initApp() {
  // Load from storage
  const savedData = loadFromStorage();
  if (savedData) {
    appState.files = savedData.files;
    rebuildTagsIndex();
  }

  // Render initial state
  renderFileList();
  renderTagCloud();

  if (appState.files.length > 0) {
    // Select most recent file
    const sorted = [...appState.files].sort((a, b) =>
      b.lastViewed - a.lastViewed
    );
    selectFile(sorted[0].id);
  }

  wireUpEvents();
}

function wireUpEvents() {
  // Existing: file input, drag & drop

  // NEW: Event delegation for dynamic elements
  document.addEventListener('click', (e) => {
    // File item click → selectFile()
    // Delete button → deleteFile()
    // Tag filter → toggleTagFilter()
    // Tag remove (×) → removeTagFromCurrentFile()
    // Clear filters → clearAllFilters()
  });

  // Tag input: Enter key → addTagToCurrentFile()
  // Tag input: typing → show autocomplete

  // Sidebar toggle (mobile)
}

// Call on load
document.addEventListener('DOMContentLoaded', initApp);
```

### Phase 9: Utility Functions
**Add to:** `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App/app.js`

```javascript
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return new Date(timestamp).toLocaleDateString();
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
```

---

## Critical Files

### Files to Create
1. **`storage.js`** - Persistence layer (new file)

### Files to Modify
1. **`app.js`** - Core logic (~400 LOC addition)
   - Lines 2-4: Update appState structure
   - Lines 112-138: Modify handleFile() for multi-file
   - Add: All tag management, filtering, rendering functions

2. **`index.html`** - UI structure (~50 LOC addition)
   - Add sidebar structure
   - Add tag input component
   - Update header controls

3. **`styles.css`** - Styling (~300 LOC addition)
   - Add sidebar, file list, tag chip styles
   - Add responsive layout for mobile
   - Update app-body layout (flexbox)

4. **`README.md`** - Documentation update
   - Add tags feature description
   - Update usage instructions
   - Note localStorage limitations

---

## Testing & Verification

### Manual Test Checklist

**Multi-File Support:**
- [ ] Add first file → appears in sidebar
- [ ] Add second file → both visible in sidebar
- [ ] Click file in sidebar → preview switches
- [ ] Delete file → removed from list
- [ ] Refresh page → files persist

**Tags:**
- [ ] Add tag to file → appears as chip
- [ ] Add multiple tags → all visible
- [ ] Remove tag (click ×) → tag removed
- [ ] Tag autocomplete shows suggestions
- [ ] Tag validation rejects invalid names (spaces, special chars)

**Filtering:**
- [ ] Click tag in sidebar → file list filters
- [ ] Select multiple tags → AND logic (only files with ALL tags)
- [ ] Click "Clear filters" → all files visible
- [ ] Filter while viewing file → preview updates if filtered out

**Persistence:**
- [ ] Add files + tags → close app → reopen → data intact
- [ ] Filtered state NOT persisted (starts with no filters on load)

**Responsive:**
- [ ] Desktop (>1024px): Sidebar always visible
- [ ] Mobile (<768px): Sidebar collapsible with toggle button

**Edge Cases:**
- [ ] No files: Drop zone visible, "Add your first file" message
- [ ] No tags: Empty state in tag cloud
- [ ] No files match filter: "No files with selected tags" message
- [ ] Very long filename: Truncates nicely
- [ ] 20+ files: Performance acceptable, scrolling works

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)

### Performance Targets
- File list render: <50ms for 50 files
- Tag filter apply: <100ms for 50 files
- App initialization: <500ms with 50 files

---

## Git Worktree Setup

**Before implementation, create a new worktree:**

```bash
# Create new worktree for tags feature
git worktree add ../markdown-app-tags-feature tags-feature

# Switch to new worktree
cd ../markdown-app-tags-feature

# Create feature branch
git checkout -b feature/tags

# Start implementation
```

**After implementation:**
```bash
# Commit changes
git add .
git commit -m "Add tags and filtering functionality"

# Merge to main
git checkout main
git merge feature/tags

# Remove worktree
cd ../Markdown\ Note\ Taking\ App
git worktree remove ../markdown-app-tags-feature
```

---

## Risk Mitigation

### LocalStorage Limitations
- Max size: 5-10MB depending on browser
- **Mitigation:** Warn at 80% capacity, provide export/import feature

### Data Loss on Browser Clear
- **Mitigation:** Add "Export Library" button (download JSON backup)
- Show prominent warning: "Data stored locally, clear browser data = lost notes"

### File ID Collisions
- **Mitigation:** Hash-based IDs include name + lastModified + size
- Extremely unlikely collision with normal usage

### Performance with Large Libraries
- **Mitigation:** Test with 100+ files, optimize rendering
- Future: Virtual scrolling for 500+ files

---

## Future Enhancements (Post-MVP)

- Full-text search across all files
- Nested tags (e.g., `project/work`)
- Tag colors (user-assigned)
- Export/import library as JSON
- Bulk file upload
- Keyboard shortcuts (j/k navigation)
- OR logic option for tag filtering (show files with ANY selected tag)
- IndexedDB migration for better performance with large libraries
