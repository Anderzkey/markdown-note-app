# CLAUDE.md

This file provides guidance to Claude Code when working with the Markdown Note Taking App project.

## 📋 Project Overview

**Markdown Note Taking App** - A beautiful, minimalist web application for reading and viewing Markdown files with elegant typography and formatting.

### Purpose
- Open and read Markdown files with a beautiful, distraction-free interface
- Display Markdown with proper formatting (headers, bold, italics, code blocks, etc.)
- Provide pleasant reading experience with nice fonts and typography
- View-focused (read-only for now, editing can be added later)

### Target Users
- Note-takers who want to read their Markdown files beautifully
- People who find plain text editors hard to read
- Anyone wanting a simple, elegant Markdown viewer

---

## 🛠 Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Markdown Parser:** marked.js (lightweight, reliable)
- **Code Highlighting:** highlight.js (syntax highlighting for code blocks)
- **Typography:** Custom CSS with system fonts or web fonts (Inter, Merriweather, etc.)
- **File Handling:** HTML5 File API (drag & drop, file picker)
- **Styling:** Tailwind CSS (optional, or custom CSS)

---

## 🎨 Key Features

1. **File Input**
   - Drag & drop markdown files
   - Click to select file via file picker
   - Support multiple files (sequential viewing)

2. **Rendering**
   - Convert Markdown to styled HTML
   - Syntax highlighting for code blocks
   - Proper typography hierarchy
   - Dark/Light mode support (optional)

3. **UX**
   - Clean, minimal interface
   - Large, readable fonts
   - Proper spacing and line-height
   - No auto-save needed (read-only)

---

## 📁 Project Structure

```
Markdown Note Taking App/
├── CLAUDE.md                              # This file (AI guidelines)
├── PLAN.md                                # Main development plan
├── README.md                              # Project documentation
├── index.html                             # Main HTML file
├── styles.css                             # Custom styling
├── app.js                                 # Main JavaScript logic
├── plans/                                 # Feature plans (git-tracked)
│   ├── feature-1-search.md               # Search functionality
│   ├── feature-2-tags.md                 # Tags and filtering
│   ├── feature-3-pdf-export.md           # PDF export
│   ├── markdown-note-app.md              # Original project plan
│   └── wip-research-markdown-app.md      # Research notes
└── .worktrees/                            # Git worktrees for features
```

---

## 🚀 Development Guidelines

### Before Starting
- Run `git init` to initialize repository
- Create README.md with project description
- Create PLAN.md with feature roadmap

### Code Quality
- Keep code simple and readable
- Use semantic HTML
- Mobile-responsive design
- Accessibility considerations (alt text, ARIA labels, semantic HTML)

### File Size Limits
- Keep app.js under 500 lines (refactor if needed)
- Minimize dependencies
- Keep styles modular

### Testing Checklist
- [ ] Drag & drop functionality works
- [ ] File picker works across browsers
- [ ] Markdown renders correctly
- [ ] Code blocks display with syntax highlighting
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark mode toggle works (if implemented)
- [ ] Headers, lists, tables, blockquotes render properly

---

## 📚 Dependencies

Will use these libraries (via CDN):
- **marked.js:** Markdown parsing
- **highlight.js:** Code syntax highlighting
- **Tailwind CSS (optional):** Styling framework

All should be loaded from CDN to keep deployment simple.

---

## 🔄 Session Persistence & Planning Workflow

**CRITICAL:** All plans and documentation must be saved to the git repository, not local conversation context.

### Where to Save Plans

**Feature Plans** → `plans/feature-N-<name>.md`
- Example: `plans/feature-1-search.md`
- Each feature gets one file
- Commit to git immediately after creation
- Format: Include requirements, implementation steps, testing checklist

**Research/Analysis** → `plans/wip-<topic>.md`
- Work-in-progress notes during investigation
- Convert to feature plan once finalized
- Delete after converting to feature plan

**Main Development Plan** → `PLAN.md` (root directory)
- Overall project roadmap
- Phase breakdown
- Architecture decisions

### Workflow for New Features

1. **Planning Phase**
   - Create `plans/feature-N-<name>.md`
   - Include: overview, requirements, implementation steps, testing checklist
   - Add to git immediately: `git add plans/feature-*.md`

2. **Development Phase**
   - Create git worktree for isolated development
   - Reference feature plan throughout implementation
   - Test against acceptance criteria

3. **Review Phase**
   - Commit changes with clear messages
   - Merge worktree back to main
   - Update main PLAN.md if needed

4. **Persistence**
   - All plans stay in git repository
   - Accessible across all sessions
   - Searchable in code editor

---

## 🎯 Next Steps

1. Create initial plan for features and UI
2. Set up git repository
3. Create basic HTML structure
4. Integrate marked.js for Markdown parsing
5. Add file input (drag & drop + file picker)
6. Style with beautiful typography
7. Add code highlighting
8. Test across devices
9. Deploy or package as needed

---

## 💡 Design Philosophy

- **Simplicity:** Do one thing well (display Markdown beautifully)
- **Performance:** Fast loading, no unnecessary features
- **Beauty:** Typography-first design
- **Accessibility:** Works for everyone
- **Minimal Dependencies:** Keep it lightweight
