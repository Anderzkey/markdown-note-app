# Plan: Markdown Note Taking App - MVP

**Goal:** Build a beautiful, minimalist web application for reading and viewing Markdown files with elegant typography and syntax highlighting.

**Location:** `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App/`

---

## Overview

The Markdown Note Taking App is a view-focused, distraction-free interface for reading Markdown files. Users can open files via drag & drop or file picker, and content is rendered with beautiful typography, proper formatting, and syntax highlighting for code blocks.

### Core Purpose
- Display Markdown files beautifully with readable fonts and proper spacing
- Make markdown easier to read than plain text editors
- Provide an elegant, minimal interface without distractions
- Support code syntax highlighting for technical notes

---

## Requirements

### Core Features (MVP)
1. ✅ **File Input** - Drag & drop and file picker support
2. ✅ **Markdown Rendering** - Convert Markdown to styled HTML
3. ✅ **Code Highlighting** - Syntax highlighting for code blocks
4. ✅ **Typography** - Beautiful, readable fonts and spacing
5. ✅ **Responsive Design** - Works on desktop, tablet, mobile
6. ⭐ **Dark Mode** (Optional) - Light/dark theme toggle

### Non-Core (Future)
- File editing capability
- Multiple file management
- Auto-save functionality
- Cloud sync

---

## Tech Stack

### Frontend
- **HTML5** - Semantic markup with File API
- **CSS3** - Custom styling with system fonts or web fonts
- **Vanilla JavaScript** - No frameworks

### Libraries (CDN)
- **marked.js** (v4.0.x+) - Markdown parsing
  - CDN: `https://cdn.jsdelivr.net/npm/marked/marked.min.js`
  - Quality: 94.2/100
  - Config: GitHub Flavored Markdown enabled

- **highlight.js** (v11.8.0+) - Code syntax highlighting
  - CDN: `https://cdn.jsdelivr.net/npm/highlight.js/build/highlight.min.js`
  - Quality: 87.7/100
  - Themes: atom-one-dark, dracula, nord, github-light available
  - 190+ languages supported

### Styling
- **Option A:** Tailwind CSS CDN (already used in To-Do App)
- **Option B:** Custom CSS with modern features (clamp, CSS variables)
- **Recommended:** Custom CSS for simplicity and learning

---

## Data Structure

### Application State
```javascript
{
  currentFile: {
    name: "my-notes.md",
    content: "# Markdown content...",
    size: 1024,
    type: "text/markdown",
    lastModified: 1707123456000
  },
  settings: {
    theme: "light", // or "dark"
    fontSize: "16px",
    fontFamily: "system" // system fonts or web font
  }
}
```

### Supported File Types
- `.md` - Markdown
- `.markdown` - Markdown variant
- `.txt` - Plain text (treated as markdown)

### File Validation
- Maximum size: 5MB
- Accepted MIME types: `text/plain`, `text/markdown`
- File extension whitelist: `.md`, `.markdown`, `.txt`

---

## UI Layout Design

```
┌─────────────────────────────────────────────┐
│  📖 Markdown Note Reader                    │
│  [Light] [Dark]              [📁 Open File] │
├─────────────────────────────────────────────┤
│  Drag markdown file here or click to open   │
│  Max file size: 5MB                         │
└─────────────────────────────────────────────┘

After file is loaded:

┌─────────────────────────────────────────────┐
│  📖 Markdown Note Reader  | document.md     │
│  [Light] [Dark]              [📁 Open File] │
├─────────────────────────────────────────────┤
│                                             │
│  # Document Title                           │
│                                             │
│  This is a paragraph with **bold** text     │
│  and *italic* text.                         │
│                                             │
│  ## Section Heading                         │
│                                             │
│  - List item 1                              │
│  - List item 2                              │
│                                             │
│  ```javascript                              │
│  const hello = "world";                     │
│  console.log(hello);                        │
│  ```                                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Visual Elements
- **Header:** App title, theme toggle, file open button
- **Drop zone:** Large, clear area for drag & drop with visual feedback
- **Content area:** Main markdown display with generous spacing
- **Code blocks:** Highlighted syntax with background color
- **Typography:** Large, readable fonts with proper line-height

---

## Implementation Plan

### Phase 1: Project Setup

**Files to Create:**
- `index.html` - Main HTML structure
- `app.js` - Core application logic (~300 lines)
- `styles.css` - Styling (~150 lines)
- `README.md` - Project documentation
- `.gitignore` - Git configuration

**Tasks:**
1. Initialize git repository: `git init`
2. Create HTML structure with semantic markup
3. Set up CSS with system font stack and variables
4. Load marked.js and highlight.js from CDN
5. Create basic DOM elements and selectors

**Deliverable:** Basic scaffold with file input working

---

### Phase 2: File Handling

**Features:**
- Drag & drop file upload
- Click-to-select file picker
- File validation (type, size)
- Error messages for invalid files
- Display file name and size

**Tasks:**
1. Implement drag & drop event handlers
2. Add file input element with accept filter
3. Validate file type and size (max 5MB)
4. Read file using FileReader API
5. Handle errors gracefully (show user-friendly messages)
6. Store current file in state

**Deliverable:** Users can open markdown files

---

### Phase 3: Markdown Rendering

**Features:**
- Parse markdown to HTML using marked.js
- Render all common markdown elements:
  - Headers (h1-h6)
  - Bold, italic, strikethrough
  - Lists (ordered, unordered)
  - Code blocks (inline and block)
  - Blockquotes
  - Links and images
  - Tables
  - Horizontal rules
- Sanitize HTML for security

**Tasks:**
1. Configure marked.js with GFM options
2. Implement render function that converts markdown to HTML
3. Inject rendered HTML into DOM safely
4. Test with various markdown samples
5. Handle parsing errors

**Deliverable:** Markdown files display as styled HTML

---

### Phase 4: Code Highlighting

**Features:**
- Auto-detect programming language
- Highlight syntax in code blocks
- Support 190+ languages
- Apply theme colors

**Tasks:**
1. Load highlight.js and a theme (recommend: atom-one-dark)
2. Hook highlight.js into marked.js rendering
3. Configure language detection
4. Style code blocks with padding, background, line-height
5. Test with various code languages

**Deliverable:** Code blocks have syntax highlighting

---

### Phase 5: Typography & Styling

**Features:**
- Beautiful, readable typography
- Proper spacing and line-height
- System font stack for performance
- Responsive design (mobile-first)
- Consistent color scheme

**Tasks:**
1. Set up CSS variables for colors, fonts, spacing
2. Create typography hierarchy:
   - Body text: 16px, line-height 1.6
   - Headings: Scaled sizes with proper margins
   - Code: Monospace font, smaller size
3. Add responsive design with CSS clamp()
4. Test on mobile, tablet, desktop
5. Ensure WCAG AA contrast ratios

**Deliverable:** App looks polished and professional

---

### Phase 6: Dark Mode (Optional)

**Features:**
- Toggle between light and dark themes
- Persist theme preference
- Respect system preference (`prefers-color-scheme`)
- Different colors for code blocks in each theme

**Tasks:**
1. Define CSS variables for both themes
2. Create theme toggle button in header
3. Implement theme switching logic
4. Save preference to localStorage
5. Load saved preference on page load
6. Change highlight.js theme dynamically

**Deliverable:** Users can toggle between light/dark modes

---

## Acceptance Criteria

### File Input
- [ ] Drag & drop markdown files onto the app
- [ ] Click "Open File" button to select file via file picker
- [ ] Display file name and size after loading
- [ ] Show error message for invalid file types
- [ ] Show error message for files > 5MB
- [ ] Support `.md`, `.markdown`, `.txt` files

### Markdown Rendering
- [ ] Headers (h1-h6) render with proper sizes
- [ ] Bold (**text**) renders correctly
- [ ] Italic (*text*) renders correctly
- [ ] Lists (ordered and unordered) render correctly
- [ ] Code blocks render with background color
- [ ] Blockquotes render with left border
- [ ] Links render as clickable `<a>` tags
- [ ] Tables render (if GFM enabled)
- [ ] Horizontal rules render

### Code Highlighting
- [ ] JavaScript code blocks highlighted
- [ ] Python code blocks highlighted
- [ ] HTML/CSS code blocks highlighted
- [ ] Code blocks styled with monospace font
- [ ] Language auto-detection works

### Typography & Layout
- [ ] Text is readable (16px minimum)
- [ ] Line height is comfortable (1.6)
- [ ] Line length is optimal (45-75 characters)
- [ ] Margins between sections are consistent
- [ ] App looks good on mobile (< 768px)
- [ ] App looks good on tablet (768-1024px)
- [ ] App looks good on desktop (> 1024px)

### Dark Mode (if implemented)
- [ ] Toggle button works
- [ ] Dark theme readable and comfortable
- [ ] Code block theme changes with mode
- [ ] Preference persists across sessions
- [ ] System preference respected on first load

### Accessibility & Quality
- [ ] All text meets WCAG AA contrast (4.5:1)
- [ ] Semantic HTML used throughout
- [ ] No JavaScript errors in console
- [ ] Page loads in < 2 seconds
- [ ] Works in Chrome, Firefox, Safari, Edge

---

## File Structure

```
Markdown Note Taking App/
├── CLAUDE.md                    # AI guidelines
├── README.md                    # Project documentation (to create)
├── index.html                   # Main HTML (~80 lines)
├── app.js                       # Application logic (~300 lines)
├── styles.css                   # Styling (~150 lines)
├── .gitignore                   # Git config
└── plans/
    └── markdown-note-app.md     # This plan
```

---

## Technical Decisions

### Why marked.js?
- 94.2/100 quality score, widely used
- Supports GitHub Flavored Markdown
- Lightweight (~30KB minified)
- Simple, predictable API

### Why highlight.js?
- 87.7/100 quality score
- 190+ languages supported
- Auto language detection
- Works with marked.js seamlessly

### Why Vanilla JavaScript?
- No build tools required
- Simple to understand and maintain
- Fast loading
- Follows To-Do App precedent

### Why Custom CSS over Tailwind?
- Smaller CSS bundle
- Better learning opportunity
- Simpler for a reading-focused interface
- More control over typography details

### Why Not Include Editing?
- Simplifies initial scope
- Can be added later (Phase 7+)
- Keeps interface focused on reading
- Better user experience when focused on single task

---

## Success Metrics

1. ✅ **Functionality:** All acceptance criteria met
2. ✅ **Performance:** Page loads in < 2 seconds
3. ✅ **Accessibility:** WCAG AA compliant
4. ✅ **Cross-browser:** Works on 4+ major browsers
5. ✅ **User Experience:** Files display beautifully and are easy to read
6. ✅ **Code Quality:** < 500 lines app.js, < 200 lines CSS

---

## Dependencies & Risks

### Dependencies
- HTML5 FileReader API (supported in all modern browsers)
- Drag & Drop API (supported in all modern browsers)
- LocalStorage (for theme preference)
- No build tools or package managers required

### Risks & Mitigation
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Markdown parsing edge cases | Medium | Low | Use established library (marked.js), test thoroughly |
| Large file performance | Low | Medium | Implement file size validation (5MB limit) |
| Code highlighting not working | Low | Low | Test with multiple languages during development |
| Cross-browser compatibility | Low | Medium | Test on Chrome, Firefox, Safari, Edge |
| Accessibility issues | Medium | Low | Follow WCAG AA guidelines, test with screen readers |

---

## Future Enhancements (Post-MVP)

1. **Editing Mode** - Allow users to edit markdown in the app
2. **Multiple Files** - Tab system for switching between files
3. **Auto-save** - Save changes to local files
4. **Cloud Sync** - Sync with cloud storage (Google Drive, Dropbox)
5. **Search** - Find text within document
6. **Export** - Export to PDF or HTML
7. **Settings** - Font size, font family, theme customization
8. **Desktop App** - Electron wrapper for native app experience

---

## References & Research

### Tools & Libraries
- **marked.js:** https://github.com/markedjs/marked
- **highlight.js:** https://github.com/highlightjs/highlight.js
- **HTML5 FileReader API:** https://developer.mozilla.org/en-US/docs/Web/API/FileReader
- **Drag & Drop API:** https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

### Typography & Accessibility
- **WCAG 2.2 Standards:** https://www.w3.org/WAI/standards-guidelines/wcag/
- **Modern Typography Practices:** System fonts + clamp() for responsiveness
- **Contrast Ratios:** 4.5:1 for normal text (WCAG AA)

### Similar Projects
- **Obsidian:** Note-taking with markdown rendering
- **Typora:** Markdown editor with live preview
- **To-Do App (sibling):** Vanilla JS pattern reference

---

## Implementation Notes

### File Size Budgets
- `app.js`: Target < 300 lines
- `styles.css`: Target < 150 lines
- `index.html`: ~80 lines
- **Total unpacked:** ~530 lines
- **CDN dependencies:** ~50KB (marked.js + highlight.js)

### Color Scheme (Light Theme)
- Background: `#ffffff` (white)
- Text: `#1a1a1a` (near black)
- Accents: `#0066cc` (blue for links)
- Code background: `#f5f5f5` (light gray)

### Color Scheme (Dark Theme)
- Background: `#121212` (dark gray)
- Text: `#e3e3e3` (light gray)
- Accents: `#66b3ff` (light blue)
- Code background: `#1e1e1e` (darker gray)

---

## Testing Plan

### Manual Testing
1. Open various markdown files (sizes: 1KB to 5MB)
2. Test all markdown syntax elements
3. Resize window to test responsiveness
4. Toggle dark mode and verify persistence
5. Test on multiple browsers
6. Test on mobile devices

### Edge Cases
- Very large files (close to 5MB limit)
- Files with invalid markdown syntax
- Files with special characters
- Files with mixed languages in code blocks
- Files with no extension (plain `.txt`)
- Drag & drop with non-markdown files

---

## Deployment

### Local Testing
```bash
# Initialize git
git init

# Open in browser (use live server or python http.server)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### Production Deployment
- No build step required
- All files can be served statically
- CDN handles marked.js and highlight.js
- Works on GitHub Pages, Netlify, Vercel, or any static host

---

## Definition of Done

The MVP is complete when:

1. ✅ All acceptance criteria met
2. ✅ Code reviewed and approved
3. ✅ All test scenarios pass
4. ✅ No console errors or warnings
5. ✅ Deployed and working
6. ✅ README complete with usage instructions
7. ✅ Committed to git with clean commit history
