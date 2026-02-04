# Search Feature Implementation Plan

## Overview
Add search functionality to the Markdown Note Taking App that allows users to search within loaded markdown notes and navigate through highlighted matches.

## Git Worktree Setup
Create a new worktree for isolated development:
```bash
git worktree add ../markdown-app-search search-feature
cd ../markdown-app-search
```

## Requirements
- Search input field in the UI (accessible via keyboard shortcut)
- Real-time search through the currently loaded markdown content
- Highlight all matches with visual indicators
- Navigate between matches (previous/next)
- Display match counter ("3 of 12 matches")
- Case-insensitive search by default
- Clear search and remove highlights

## Critical Files to Modify

### 1. `index.html` (lines 35-56)
**Add search bar in `.app-controls` section:**
- Search input field with placeholder "Search in note..."
- Search info display (match counter)
- Previous/Next navigation buttons
- Clear search button (X icon)

**Location:** Between theme toggle and "Open File" button, or as a separate row below the header

### 2. `app.js` (entire file)
**Add to `appState` object (lines 2-4):**
```javascript
search: {
  query: "",
  matches: [],
  currentMatchIndex: -1,
  isActive: false
}
```

**New functions to add:**
- `performSearch(query)` - Find all matches in the rendered preview HTML
- `highlightMatches()` - Apply highlight styling to all matches
- `navigateToMatch(direction)` - Jump to previous/next match
- `clearSearch()` - Remove all highlights and reset search state
- `updateSearchInfo()` - Update the match counter display

**Event handlers:**
- Search input `input` event → trigger search
- Previous/Next buttons `click` events → navigate matches
- Clear button `click` event → clear search
- Keyboard shortcut (Ctrl/Cmd+F) → focus search input
- ESC key → clear search

### 3. `styles.css`
**New CSS classes:**
- `.search-container` - Container for search UI elements
- `.search-input` - Styled search input field
- `.search-info` - Match counter styling
- `.search-nav` - Navigation buttons container
- `.search-highlight` - Yellow/orange background for matches
- `.search-highlight--active` - Distinct color for current match (e.g., orange)
- Responsive adjustments for mobile

## Implementation Details

### Search Algorithm
1. **Search in rendered HTML** (not raw markdown) for better UX
2. Use `TreeWalker` or recursive DOM traversal to find text nodes
3. Wrap matches in `<mark class="search-highlight">` elements
4. Keep track of match positions for navigation

### Highlighting Strategy
- Use `<mark>` elements with custom CSS classes
- Current match gets additional `.search-highlight--active` class
- Scroll active match into view when navigating

### Navigation Logic
- Previous button: Move to previous match (wrap to last if at first)
- Next button: Move to next match (wrap to first if at last)
- Update match counter: "X of Y matches"

### Edge Cases
- Empty search query → remove all highlights
- No matches found → show "No matches" message
- File not loaded → disable search
- Search while scrolled → scroll to first match

### Keyboard Shortcuts
- `Ctrl/Cmd+F`: Focus search input
- `Enter`: Navigate to next match
- `Shift+Enter`: Navigate to previous match
- `Escape`: Clear search and unfocus

## UI Placement Decision

**Recommended:** Add search bar in the header controls area (`.app-controls`)

**Layout:**
```
[App Title]                    [Search Input] [Prev] [Next] [Clear] [Theme] [Open File]
```

Or on mobile, wrap to a second row:
```
[App Title]                    [Theme] [Open File]
[Search Input with controls]
```

## Verification Steps

### Testing Checklist
1. **Basic Search:**
   - [ ] Open a markdown file
   - [ ] Type a search query
   - [ ] Verify all matches are highlighted
   - [ ] Verify match counter shows correct count

2. **Navigation:**
   - [ ] Click "Next" button → moves to next match
   - [ ] Click "Previous" button → moves to previous match
   - [ ] Verify current match has distinct highlighting
   - [ ] Verify page scrolls to show active match

3. **Keyboard Shortcuts:**
   - [ ] Press Ctrl/Cmd+F → search input gets focus
   - [ ] Type query and press Enter → navigates to next match
   - [ ] Press Shift+Enter → navigates to previous match
   - [ ] Press Escape → clears search

4. **Edge Cases:**
   - [ ] Search with no file loaded → search is disabled
   - [ ] Search query with no matches → shows "No matches"
   - [ ] Clear search → all highlights removed
   - [ ] Load new file while search active → search resets

5. **Responsive Design:**
   - [ ] Test on mobile (< 720px width)
   - [ ] Verify search UI adapts properly
   - [ ] Verify buttons are touch-friendly

6. **Performance:**
   - [ ] Test with large markdown file (close to 5MB)
   - [ ] Search should feel responsive (< 100ms)

## Dependencies
No new dependencies required. Uses vanilla JavaScript with existing libraries (marked.js, highlight.js).

## Success Criteria
- User can search within any loaded markdown note
- All matches are visually highlighted
- User can navigate between matches easily
- Search is keyboard-accessible
- Clean, minimal UI that matches existing design
- Works on desktop and mobile
