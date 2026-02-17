---
status: pending
priority: p1
issue_id: 001
tags: [code-review, bug, ui, quality]
---

# Fix Stats Display Plural/Singular Bug

## Problem Statement

The word and character count statistics display grammar errors due to comparing DOM elements instead of count values. Users see incorrect pluralization:
- "0 character" (should be "0 characters")
- "1 words" (should be "1 word")
- "42 character" (should be "42 characters")

This occurs because the ternary operator compares the DOM element object to the number 1, which is always truthy.

## Findings

**Location:** `app.js` lines 369 and 375 in `updateEditorStats()` function

**Current Code (WRONG):**
```javascript
// Line 369
charCountEl.textContent = `${charCount} character${charCountEl !== 1 ? 's' : ''}`;
//                                                      ^^^^^^^^^ - DOM element, not count!

// Line 375
wordCountEl.textContent = `${wordCount} word${wordCountEl !== 1 ? 's' : ''}`;
//                                                ^^^^^^^^^ - DOM element, not count!
```

**Impact:**
- Always shows plural form for characters (element is truthy)
- Always shows plural form for words (element is truthy)
- Grammatically incorrect user interface
- Low severity but affects every keystroke in edit mode

**Root Cause:**
Copy-paste error or variable name similarity confusion. The comparison should use the count variables, not the DOM element references.

## Proposed Solutions

### Solution 1: Fix Variable Names (RECOMMENDED)
**Effort:** Small (5 minutes) | **Risk:** None | **Complexity:** Trivial

Fix the ternary conditions to use count values instead of elements:

```javascript
// Line 369 - CHANGE THIS:
charCountEl.textContent = `${charCount} character${charCount !== 1 ? 's' : ''}`;

// Line 375 - CHANGE THIS:
wordCountEl.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
```

**Pros:**
- Minimal change (2 characters each)
- No performance impact
- Trivial to verify
- Zero breaking changes

**Cons:**
- None

### Solution 2: Extract Pluralize Helper
**Effort:** Small (10 minutes) | **Risk:** None | **Complexity:** Low

Create a reusable utility function:

```javascript
function pluralize(count, word) {
  return `${count} ${word}${count !== 1 ? 's' : ''}`;
}

// Then use:
charCountEl.textContent = pluralize(charCount, 'character');
wordCountEl.textContent = pluralize(wordCount, 'word');
```

**Pros:**
- Reusable for other pluralization
- Clearer intent
- Easier to test

**Cons:**
- Slightly more code
- Overkill for just 2 uses

## Recommended Action

**Implement Solution 1** - Simply fix the variable names. This is the minimal change that solves the problem.

## Acceptance Criteria

- [ ] Word count shows "1 word" (singular) when count is 1
- [ ] Word count shows "2 words" (plural) when count > 1
- [ ] Character count shows "1 character" (singular) when count is 1
- [ ] Character count shows "2 characters" (plural) when count > 1
- [ ] No console errors
- [ ] Stats update correctly on every keystroke
- [ ] Works with 0, 1, and 100+ word/character counts

## Work Log

- **2026-02-06**: Issue discovered during code review by kieran-rails-reviewer
  - Located incorrect variable comparisons in updateEditorStats()
  - Verified impact on every keystroke in edit mode
  - Confirmed fix is trivial (2-character change)

## Technical Details

**File:** `/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App/app.js`

**Lines:** 369, 375

**Function:** `updateEditorStats()`

**Variables involved:**
- `charCount` - integer value (correct variable to use)
- `charCountEl` - DOM element (incorrect variable in condition)
- `wordCount` - integer value (correct variable to use)
- `wordCountEl` - DOM element (incorrect variable in condition)

**Browser impact:**
- Affects all modern browsers identically
- JavaScript type coercion makes element truthy
- No polyfills needed

## Resources

- Review: Feature 4 Code Quality Review by kieran-rails-reviewer
- File: `app.js` lines 361-377
- Test: Load test.md, enter edit mode, type text and observe stats
