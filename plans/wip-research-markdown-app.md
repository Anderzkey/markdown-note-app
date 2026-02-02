# WIP Research: Markdown Note Taking App

## Project Analysis

This document captures research findings about the Markdown Note Taking App project structure, conventions, and alignment with similar projects in the workspace.

---

## 1. Project Directory Structure

### Current State (Markdown Note Taking App)
```
Markdown Note Taking App/
├── CLAUDE.md                 # Project guidelines for Claude Code
└── (in progress...)
```

**Status:** Early-stage project with only CLAUDE.md created. No other project files exist yet.

### To-Do App Reference Structure (Established Pattern)
```
To-Do App. CC/
├── CLAUDE.md                 # Project guidelines
├── README.md                 # Project documentation (minimal)
├── PLAN.md                   # Detailed development plan
├── index.html                # Main HTML structure
├── styles.css                # CSS styling
├── app.js                    # JavaScript application logic
├── .git/                     # Git repository
└── .worktrees/               # Git worktrees for branches
    ├── feature-todo-app/     # Feature branch worktree
    ├── fix-immediate-issues/ # Bug fix branch worktree
    └── (future branches)
```

### Recommended Structure for Markdown App
Based on To-Do App conventions:
```
Markdown Note Taking App/
├── .git/                     # Initialize git repository
├── CLAUDE.md                 # Project guidelines (EXISTS)
├── README.md                 # Project overview and setup
├── PLAN.md                   # Development roadmap and implementation details
├── index.html                # Main HTML file
├── styles.css                # Custom CSS styling
├── app.js                     # Main JavaScript application
├── .gitignore                # Git ignore rules
├── .worktrees/               # Feature/bug fix branches (as needed)
└── plans/                    # Research and planning documents (like this one)
```

---

## 2. CLAUDE.md Conventions and Guidelines

### Markdown App's CLAUDE.md

**Key Sections Defined:**
1. **Project Overview** - Clear purpose and target users
2. **Tech Stack** - Frontend libraries and dependencies
3. **Key Features** - Core functionality breakdown
4. **Project Structure** - Expected file layout
5. **Development Guidelines** - Code quality standards
6. **Dependencies** - All loaded via CDN
7. **Session Persistence** - Where to save research findings
8. **Next Steps** - Sequential development roadmap

**Technology Choices (per CLAUDE.md):**
- **Frontend:** Vanilla HTML/CSS/JavaScript (no build tools)
- **Markdown Parser:** marked.js (from CDN)
- **Code Highlighting:** highlight.js (from CDN)
- **Styling:** Custom CSS or optional Tailwind CSS
- **File Handling:** HTML5 File API (drag & drop, file picker)

**File Size Constraints:**
- Keep app.js under 500 lines (refactor if needed)
- Minimize dependencies
- Keep styles modular

**Testing Checklist** (defined in CLAUDE.md):
- Drag & drop functionality
- File picker browser support
- Markdown rendering accuracy
- Code block syntax highlighting
- Responsive design (mobile/tablet/desktop)
- Dark mode toggle (if implemented)
- Various markdown elements (headers, lists, tables, blockquotes)

---

## 3. To-Do App Development Conventions

### Git Workflow Pattern
- **Main branch** - Stable, production-ready code
- **Worktrees** - Used for feature development and bug fixes
  - `.worktrees/feature-todo-app/` - Feature development branch
  - `.worktrees/fix-immediate-issues/` - Bug fix branch
- **Pull Requests** - Used for merging worktree changes to main
- **Commit Messages** - Follow conventional patterns
  - Example: `feat: add category and due date support`
  - Example: `fix: improve subtitle text contrast`
  - Example: `docs: mark custom templates as 90% complete`

### Documentation Pattern
**Three-tier documentation approach:**
1. **README.md** - Minimal project overview (often just title)
2. **PLAN.md** - Detailed development plan with:
   - Requirements and goals
   - Implementation phases
   - Specific file structures
   - Code examples and patterns
   - Testing/verification steps
   - Future enhancements (explicitly deferred)
3. **CLAUDE.md** - AI assistant guidelines

### Code Organization (To-Do App Pattern)
- **app.js** - Core business logic (~150-300 lines)
  - Global state management (tasks array)
  - Core functions (load, save, add, delete, toggle, render)
  - Event listeners
  - Initialization logic
- **index.html** - Semantic HTML structure (~50 lines)
  - Proper head section with CDN links
  - Centered container with max-width
  - Element IDs for JavaScript targeting
  - External stylesheet and script references
- **styles.css** - Custom styling (~20-50 lines)
  - Enhancement of semantic HTML
  - Smooth transitions
  - Custom form element styling
  - Responsive utilities

### Testing/Verification Pattern
To-Do App uses checklist-based verification:
- Add task functionality
- Complete task functionality
- Delete task functionality
- Persistence (refresh page test)
- Edge cases (empty input, multiple items)
- LocalStorage verification via DevTools
- Advanced features (categories, dates, filtering)

---

## 4. Tech Stack Comparison

### Markdown App (Planned)
| Category | Choice | Notes |
|----------|--------|-------|
| Frontend | Vanilla HTML/CSS/JS | Simple, lightweight |
| Markdown | marked.js (CDN) | Reliable parser |
| Highlighting | highlight.js (CDN) | Syntax highlighting |
| Styling | Custom CSS + optional Tailwind | Flexibility |
| File API | HTML5 File API | Native browser support |
| Deployment | Static files | No build step |

### To-Do App (Actual)
| Category | Choice | Notes |
|----------|--------|-------|
| Frontend | Vanilla HTML/CSS/JS | Simple, lightweight |
| Storage | LocalStorage API | Browser persistence |
| Styling | Tailwind CSS (CDN) + custom CSS | Utility-first approach |
| Build Tools | None | Pure HTML/CSS/JS |
| Deployment | Static files | No build step |

**Alignment:** Both projects follow identical foundational approach - vanilla JavaScript with CDN dependencies and no build tooling.

---

## 5. File Format and Naming Conventions

### Markdown Documentation Files
- **CLAUDE.md** - Project guidelines for AI assistants (exists in both)
- **README.md** - Project overview and basic info
- **PLAN.md** - Detailed implementation plan with requirements
- **wip-*.md** (in plans/ directory) - Work-in-progress research and exploration

### Code Files
- **index.html** - Main entry point (lowercase, standard name)
- **app.js** - Main application logic (lowercase, singular)
- **styles.css** - Application styling (lowercase, plural)

### Git and Infrastructure
- **.git/** - Git repository
- **.gitignore** - Git ignore patterns (not present in To-Do app yet)
- **.worktrees/** - Git worktree directories for parallel development

---

## 6. Implementation Pattern for Markdown App

### Phase-Based Development (Following To-Do App Model)

**Phase 1: Project Setup**
- Initialize git repository
- Create README.md with project description
- Create PLAN.md with detailed feature roadmap
- Add .gitignore for common files

**Phase 2: HTML Structure**
- Create index.html with semantic markup
- Include marked.js and highlight.js from CDN
- Set up file input (drag & drop + file picker)
- Basic page layout and structure

**Phase 3: CSS Styling**
- Create styles.css for custom enhancements
- Typography-focused design
- Dark/light mode support (if planned)
- Responsive design

**Phase 4: JavaScript Logic**
- Core functions: load file, parse markdown, highlight code, handle input
- Event listeners for file upload and mode switching
- DOM rendering for markdown content
- Error handling

**Phase 5: Testing and Refinement**
- Test across browsers and devices
- Verify markdown rendering accuracy
- Test code highlighting
- Mobile responsiveness
- Accessibility review

**Phase 6: Deployment**
- Static file hosting
- No build process needed

---

## 7. Session Persistence and Planning

### Documentation Requirements for Markdown App
As per CLAUDE.md:
- **plan.md** - Final development plan (should expand from CLAUDE.md)
- **research/** folder - Any research findings (optional)
- **wip-*.md** files - Work-in-progress notes (like this document)

### Versioning and Branching
Following To-Do App pattern:
- Use git worktrees for feature development
- Create PLAN.md and README.md in worktree branches
- Merge via pull requests to main branch
- Keep .worktrees/ organized by purpose

---

## 8. Key Architectural Decisions

### Design Philosophy (from Markdown App CLAUDE.md)
1. **Simplicity** - Do one thing well (display Markdown beautifully)
2. **Performance** - Fast loading, no unnecessary features
3. **Beauty** - Typography-first design
4. **Accessibility** - Works for everyone
5. **Minimal Dependencies** - Keep it lightweight

### Technology Choices Rationale
- **Vanilla JavaScript** - No framework overhead, better performance
- **CDN Libraries** - No build step, instant deployment
- **LocalStorage** (for future editing) - Browser persistence without server
- **marked.js** - Lightweight, well-maintained, feature-rich
- **highlight.js** - Industry standard code syntax highlighting

---

## 9. Git Workflow and Conventions

### Branching Strategy (To-Do App Pattern)
- **main** - Production-ready code
- **feature/** branches - New features developed in worktrees
- **fix/** branches - Bug fixes developed in worktrees

### Commit Message Format
Based on To-Do App observed patterns:
- `feat: <description>` - New features
- `fix: <description>` - Bug fixes
- `docs: <description>` - Documentation updates
- `refactor: <description>` - Code refactoring
- `style: <description>` - Code style changes (formatting, etc.)

### Pull Request Pattern
- Create PR from worktree branch to main
- Include summary of changes
- Reference issue if applicable
- Ensure all checks pass before merging

---

## 10. Testing and Quality Standards

### Code Quality Guidelines (from Markdown App CLAUDE.md)
- Keep code simple and readable
- Use semantic HTML
- Mobile-responsive design
- Accessibility considerations
  - Alt text for images
  - ARIA labels where needed
  - Semantic HTML structure

### Verification Checklist for Markdown App
From CLAUDE.md, must verify:
- [ ] Drag & drop file upload works
- [ ] File picker works across browsers
- [ ] Markdown renders with proper formatting
  - Headers, lists, bold, italics, code blocks
- [ ] Code blocks display with syntax highlighting
- [ ] Responsive on mobile, tablet, and desktop
- [ ] Dark mode toggle functions (if implemented)
- [ ] Tables, blockquotes, and other elements render correctly
- [ ] Large files handle gracefully
- [ ] Multiple file viewing works

---

## 11. Recommended Next Steps for Markdown App

### Immediate Actions (Before Code)
1. Initialize git repository in Markdown Note Taking App directory
2. Create README.md with:
   - Project title and description
   - Features overview
   - Quick start instructions
3. Create expanded PLAN.md based on CLAUDE.md content
4. Add .gitignore with standard web project patterns

### Development Setup
1. Create basic HTML structure (index.html)
2. Add marked.js and highlight.js via CDN
3. Implement file input handling (drag & drop)
4. Build markdown rendering logic
5. Add syntax highlighting for code blocks
6. Style with CSS for beautiful typography
7. Test across browsers and devices

### Worktree Strategy
- Use worktrees for major features (dark mode, advanced editing, etc.)
- Keep main branch deployable at all times
- Create feature branches for experimental features

---

## 12. Project-Specific Conventions Summary

### Markdown Note Taking App Should Follow:
1. **File Structure** - Match To-Do App layout (index.html, styles.css, app.js)
2. **Documentation** - Three-tier approach (README, PLAN, CLAUDE)
3. **Git Workflow** - Use main + worktrees pattern
4. **Code Quality** - Simple, readable, semantic
5. **Styling** - Custom CSS with optional Tailwind
6. **Dependencies** - CDN-based only, no build tools
7. **Testing** - Comprehensive verification checklist
8. **Commit Messages** - Conventional format (feat:, fix:, docs:)
9. **Planning** - Document decisions in PLAN.md upfront
10. **Persistence** - Save research to wip- files incrementally

---

## Research Metadata

- **Research Date:** 2026-02-02
- **Analyzed Projects:** Markdown Note Taking App, To-Do App
- **Key Files Reviewed:**
  - `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App/CLAUDE.md`
  - `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/To-Do App. CC/PLAN.md`
  - `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/To-Do App. CC/README.md`
  - `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/To-Do App. CC/app.js` (sample)
- **Git Workflow Patterns:** Confirmed via commit history analysis
- **Status:** Complete - Ready for implementation reference
