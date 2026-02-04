# Feature 3: PDF Export Implementation Plan

## Overview
Add PDF export functionality to the Markdown Note Taking App using the native browser print API. Users will be able to export their currently displayed markdown note as a PDF with preserved formatting and typography.

## Approach
**Native Browser Print API** (`window.print()`)
- Zero dependencies (keeps app lightweight)
- Perfect CSS preservation
- Searchable, selectable text in PDFs
- User controls page settings via print dialog

## Worktree Setup

Create a new git worktree for isolated development:

```bash
# Create worktree in .worktrees directory with feature branch
git worktree add .worktrees/feature-3-pdf-export -b feature-3-pdf-export
cd .worktrees/feature-3-pdf-export
```

## Implementation Steps

### 1. Add Export Button to UI (index.html)

**Location:** Between theme toggle and "Open File" button in `.app-controls` section (around line 35-56)

**HTML to add:**
```html
<button
  id="export-pdf-btn"
  type="button"
  class="export-button"
  aria-label="Export to PDF"
  title="Export current document to PDF"
  disabled
>
  📄 Export PDF
</button>
```

**Key attributes:**
- Initially `disabled` (no file loaded yet)
- `id` for JavaScript reference
- ARIA labels for accessibility

### 2. Style Export Button (styles.css)

**Location:** Add after existing button styles (around line 100-140)

**CSS to add:**
```css
.export-button {
  border-radius: 999px;
  padding: 8px 16px;
  border: 1px solid var(--color-border-subtle);
  background: #f4f4f5;
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.export-button:hover:not(:disabled) {
  background: #e4e4e7;
  border-color: #d4d4d8;
  transform: translateY(-1px);
}

.export-button:active:not(:disabled) {
  transform: translateY(0);
}

.export-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 3. Add Print-Optimized CSS (styles.css)

**Location:** End of file (after line 382)

**CSS to add:**
```css
/* ===== Print Styles for PDF Export ===== */
@media print {
  /* Hide UI chrome - only show content */
  body {
    margin: 0;
    padding: 0;
    background: white;
  }

  .app-header,
  .app-controls,
  .theme-toggle,
  .file-button,
  .export-button,
  .drop-zone,
  .file-meta,
  .file-info,
  .file-error {
    display: none !important;
  }

  /* Full-width content for print */
  .app {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    box-shadow: none;
    border-radius: 0;
  }

  .app-main {
    margin: 0;
    gap: 0;
  }

  /* Optimize preview for printing */
  .preview {
    max-width: 100%;
    margin: 0;
    padding: 40px 60px;
    border: none;
    border-radius: 0;
    box-shadow: none;
    background: white;
  }

  /* Improve page breaks */
  .preview h1,
  .preview h2,
  .preview h3 {
    page-break-after: avoid;
    break-after: avoid;
  }

  .preview pre,
  .preview blockquote,
  .preview table {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .preview img {
    max-width: 100%;
    page-break-inside: avoid;
  }

  /* Ensure links are visible in print */
  .preview a {
    color: #0066cc;
    text-decoration: underline;
  }

  /* Adjust code blocks for print */
  .preview pre {
    background-color: #f8f8f8;
    border: 1px solid #ddd;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  /* Page margins */
  @page {
    margin: 0.75in;
    size: letter;
  }
}
```

### 4. Implement Export Logic (app.js)

**Changes needed:**

#### A. Add DOM reference (around line 10-15)
```javascript
const exportPdfBtn = document.getElementById("export-pdf-btn");
```

#### B. Create export function (around line 95, after renderMarkdown)
```javascript
function exportToPDF() {
  // Guard: Ensure file is loaded
  if (!appState.currentFile) {
    showError("No file loaded to export.");
    return;
  }

  try {
    // Derive PDF filename from markdown filename
    const pdfFilename = appState.currentFile.name.replace(/\.(md|markdown|txt)$/i, '.pdf');

    // Set document title (used as default filename in print dialog)
    const originalTitle = document.title;
    document.title = pdfFilename;

    // Trigger print dialog
    window.print();

    // Restore original title after print
    document.title = originalTitle;
    clearError();

  } catch (err) {
    showError("Failed to open print dialog. Please try again.");
    console.error("PDF export error:", err);
  }
}
```

#### C. Wire up button event (around line 148, after fileInput event)
```javascript
if (exportPdfBtn) {
  exportPdfBtn.addEventListener("click", exportToPDF);
}
```

#### D. Update state management (modify updateFileInfo function around line 55-68)
```javascript
function updateFileInfo(file) {
  if (!file) {
    fileInfoEl.textContent = "No file loaded.";
    fileInfoEl.classList.add("file-info--empty");
    // Disable export button
    if (exportPdfBtn) exportPdfBtn.disabled = true;
    return;
  }

  fileInfoEl.classList.remove("file-info--empty");
  fileInfoEl.innerHTML = `
    <strong>${file.name}</strong>
    &nbsp;·&nbsp;
    ${formatFileSize(file.size)}
  `;

  // Enable export button
  if (exportPdfBtn) exportPdfBtn.disabled = false;
}
```

## Critical Files to Modify

1. **index.html** (line 35-56): Add export button in `.app-controls` section
2. **styles.css** (lines 100-140 and end of file): Add `.export-button` styles and `@media print` block
3. **app.js** (lines 10-15, 55-68, 95, 148): Add DOM ref, export function, event wiring, state management

## Verification & Testing

### Manual Testing Steps

1. **Initial state (no file loaded)**:
   - Export button should be disabled
   - Clicking should do nothing

2. **Load a simple markdown file**:
   - Export button becomes enabled
   - Click export button
   - Print dialog opens with filename matching markdown file (e.g., `notes.md` → `notes.pdf`)
   - Print preview shows only content (no header, buttons, drop zone)

3. **Test with complex markdown**:
   - Create/load markdown with:
     - Headers (h1-h6)
     - Bold, italic, code inline
     - Code blocks with syntax highlighting
     - Lists (ordered and unordered)
     - Tables
     - Blockquotes
     - Links
   - Verify all elements render correctly in print preview
   - Save as PDF and check output quality

4. **Cross-browser testing**:
   - Chrome/Edge: Verify print dialog and PDF output
   - Firefox: Verify print preview
   - Safari: Verify macOS print system integration

5. **Accessibility**:
   - Tab to export button using keyboard
   - Press Enter to trigger export
   - Verify button has proper ARIA labels
   - Screen reader announces button correctly

6. **Edge cases**:
   - Very long documents (pagination)
   - Special characters in filename
   - Load different file after export (button stays enabled)

### Expected Behavior

- ✅ Button disabled when no file loaded
- ✅ Button enabled when file is displayed
- ✅ Print dialog opens with correct filename suggestion
- ✅ Print preview shows only markdown content (no UI chrome)
- ✅ Typography and formatting preserved in PDF
- ✅ Code blocks maintain syntax highlighting
- ✅ Page breaks don't split headers or code blocks awkwardly
- ✅ Generated PDF has searchable, selectable text

## Rollback Plan

If issues arise, rollback is simple:
```bash
# From main worktree
cd /Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App
git worktree remove .worktrees/feature-3-pdf-export
git branch -D feature-3-pdf-export
```

## Future Enhancements (Optional)

- Add html2pdf.js for one-click automated download
- Custom print settings modal (page size, margins)
- In-app print preview mode
- Batch export multiple files
- Custom filename with timestamp option

---

**Implementation Time Estimate:** ~45-60 minutes for full implementation and testing
