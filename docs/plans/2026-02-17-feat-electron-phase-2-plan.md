---
title: "feat: Electron macOS App - Phase 2"
type: feat
date: 2026-02-17
phase: 2
estimated_effort: 1-2 weeks
priority: medium
---

# Electron macOS App - Phase 2 Plan

## Overview

Phase 2 enhances the editing experience with professional markdown editor features:
- **Syntax highlighting** — colored markdown syntax while editing
- **Line numbers** — professional editor feel
- **Real-time preview** — see markdown rendered in real-time as you type

No separate panels or split views — editing stays inline, but with visual enhancements.

**Goal:** Create a professional-grade markdown editor with syntax awareness, while keeping the simple single-view experience.

---

## Problem Statement

Currently, editing is plain text without visual feedback:
- No syntax highlighting (can't distinguish `# header` from regular text)
- No line numbers (hard to navigate larger documents)
- No real-time preview (must exit edit mode to see rendered result)

This feels less professional and harder to use for serious markdown editing.

---

## Proposed Solution

Enhance the contentEditable editor with:
- **Syntax highlighting** via Prism.js or similar (color markdown syntax)
- **Line numbers** — auto-generated counter on left side
- **Real-time rendering** — show live preview of markdown changes as you type (below or in background)

**Key constraints:**
- ✅ Single view (no side-by-side split)
- ✅ Inline editing (contentEditable, not separate textarea)
- ✅ Professional UX (like VSCode, but simpler)
- ✅ Preserves Turndown.js saving

---

## MVP Phase 2: Professional Markdown Editor

### Week 1: Syntax Highlighting & Line Numbers

#### Task 1.1: Add syntax highlighting to editor
- [ ] Integrate Prism.js for markdown syntax coloring
- [ ] Highlight markdown syntax while typing:
  - `#` headers (cyan/blue)
  - `**bold**` markers (orange)
  - `*italic*` markers (green)
  - `` `code` `` (gray)
  - `> quotes` (muted)
  - `- lists` (purple)
- [ ] Apply colors without breaking contentEditable functionality

**Files to modify:**
- `index.html` - Add Prism.js CDN
- `app.js` - Add syntax highlighting logic (~100 lines)
- `styles.css` - Add color scheme for markdown syntax

**Test Case:**
```
1. Enter edit mode
2. Type: # Hello
3. Verify: # appears in header color
4. Type: **bold text**
5. Verify: ** appears in marker color
6. Type: `code`
7. Verify: backticks appear in code color
```

#### Task 1.2: Add line numbers
- [ ] Display line number counter on left side of editor
- [ ] Auto-update line numbers as text is added/removed
- [ ] Match editor font and height
- [ ] Non-selectable (don't get copied)

**Files to modify:**
- `index.html` - Add line number div
- `app.js` - Add line counter logic (~50 lines)
- `styles.css` - Style line numbers

**Test Case:**
```
1. Enter edit mode
2. Verify line numbers appear (1, 2, 3...)
3. Press Enter multiple times
4. Verify line numbers update correctly
5. Delete lines
6. Verify line numbers adjust
7. Copy text
8. Verify line numbers NOT included in copy
```

### Week 2: Real-Time Preview

#### Task 2.1: Add live preview rendering
- [ ] Show markdown rendered preview below or overlaid
- [ ] Update preview in real-time as user types
- [ ] Keep same styling as normal preview
- [ ] Use marked.js for rendering

**Files to modify:**
- `app.js` - Add real-time render function (~60 lines)
- `styles.css` - Add preview area styling

**Test Case:**
```
1. Enter edit mode
2. See live preview below/in editor
3. Type: # Hello
4. Verify: Preview shows large "Hello" header
5. Type: **bold**
6. Verify: Preview shows bold text
7. Changes appear immediately as you type
```

---

## Success Criteria - Phase 2

- ✅ Markdown syntax highlighted with colors in editor
- ✅ Line numbers visible and update correctly
- ✅ Real-time preview renders as you type
- ✅ Markdown syntax preserved when saving
- ✅ Professional editor UX
- ✅ Single view (no side-by-side split)
- ✅ contentEditable still works for typing

---

## Non-Goals for Phase 2

- ❌ CodeMirror (too heavy for our use case)
- ❌ Live preview panel (no split view)
- ❌ Formatting buttons/toolbar
- ❌ Code block syntax highlighting (markdown level only)
- ❌ Advanced editor features (folding, etc.)

---

## Timeline & Milestones

| Week | Milestone | Status |
|------|-----------|--------|
| Week 1 | Syntax highlighting + line numbers | Not Started |
| Week 2 | Real-time preview rendering | Not Started |

**Expected Completion:** End of Week 2 (10-14 days)

---

## Next Steps (Phase 3+)

- Search within folder
- Tags and filtering
- Dark mode
- PDF export (Phase 3)
- Code signing and .dmg installer (Phase 4)

---

**Plan created:** 2026-02-17
**Status:** Ready for Planning
**Next Step:** Review and approve before implementation
