---
title: Git PR Workflow - Quick Reference Card
category: workflow-issues
tags: [git, github, workflow, quick-reference, cheat-sheet]
---

# Git PR Workflow - Quick Reference Card

## One-Minute Summary

Feature branch → Push → PR → Review → Merge → Update local main

## Command Cheatsheet

### Start a Feature

```bash
# Update main first
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/descriptive-name
```

### Work & Commit

```bash
# Make changes, then:
git add file1.js file2.css
git commit -m "Add feature description"

# Push to GitHub
git push -u origin feature/descriptive-name  # First time
git push                                      # Subsequent times
```

### Create Pull Request

```bash
# Interactive PR creation
gh pr create

# Or with options
gh pr create --title "Feature Title" \
  --body "Description of changes"
```

### Merge (After Review)

```bash
# List open PRs
gh pr list

# Merge a PR
gh pr merge <number> --merge

# Go back to main
git checkout main
git pull origin main
git branch -d feature/descriptive-name
```

## Process Diagram

```
┌─────────────────────────────────────────┐
│  Start: Update local main branch        │
│  git checkout main                      │
│  git pull origin main                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Create feature branch                  │
│  git checkout -b feature/name           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Make changes & commits                 │
│  git add files                          │
│  git commit -m "description"            │
│  (repeat as needed)                     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Push to GitHub                         │
│  git push -u origin feature/name        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Create Pull Request                    │
│  gh pr create                           │
│  (or use GitHub web UI)                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Code Review                            │
│  - Check changes on GitHub              │
│  - Run tests locally                    │
│  - Request changes if needed            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Merge Pull Request                     │
│  gh pr merge <number> --merge           │
│  (or use GitHub web UI)                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Clean Up                               │
│  git checkout main                      │
│  git pull origin main                   │
│  git branch -d feature/name             │
└─────────────────────────────────────────┘
```

## Branch Naming Conventions

| Type | Example | Usage |
|------|---------|-------|
| Feature | `feature/tags-filtering` | New features |
| Bug Fix | `fix/search-bug` | Bug fixes |
| Docs | `docs/readme-update` | Documentation |
| Refactor | `refactor/app-structure` | Code improvements |

## Commit Message Checklist

- [ ] Start with imperative verb (Add, Fix, Update, Remove)
- [ ] Under 50 characters for subject line
- [ ] First letter capitalized
- [ ] No period at end of subject
- [ ] Be specific (not "fix stuff", but "fix tag filtering")

### Examples

**Good:**
- `Add tag filtering UI component`
- `Fix markdown code block rendering`
- `Update project documentation`

**Bad:**
- `fixes stuff` (vague, lowercase)
- `Added tag feature to the system` (too long)
- `tag filtering.` (period at end)

## PR Description Template

Copy and fill in for each PR:

```markdown
## Summary
One sentence: what does this PR do?

## Changes
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] Mobile responsive
- [ ] Accessibility checked

## Related
Relates to: plans/feature-N-<name>.md
```

## Common Issues & Fixes

### Issue: "origin doesn't have feature/X"

**Cause:** Haven't pushed yet
```bash
git push -u origin feature/your-branch-name
```

### Issue: "Your branch has diverged"

**Cause:** Commits on local and remote differ
```bash
git pull origin feature/your-branch-name
# Resolve conflicts if any
git push origin feature/your-branch-name
```

### Issue: "I committed to main by mistake"

**Fix:** Move commits to a new branch
```bash
git checkout -b feature/name           # Create branch from current state
git checkout main
git reset --hard HEAD~<number>         # Undo commits on main
git push -f origin main                # Force push (only if alone on main)
git checkout feature/name
git push -u origin feature/name
gh pr create                           # Create PR as normal
```

### Issue: "PR has merge conflicts"

**Fix:** Resolve on local, push updated branch
```bash
git pull origin feature/your-branch-name
git pull origin main                   # Get latest main
# Fix conflicts in editor
git add .
git commit -m "Resolve merge conflicts"
git push origin feature/your-branch-name
```

## Do's and Don'ts

### DO ✓

- Create a feature branch for each feature
- Push early, push often
- Make small, logical commits
- Write clear commit messages
- Create a PR before merging to main
- Review your own PR first
- Test before requesting review

### DON'T ✗

- Commit directly to main branch
- Mix multiple features in one branch
- Make huge commits with unrelated changes
- Write vague commit messages ("fix" or "update")
- Merge PRs without review
- Force push to main branch
- Ignore merge conflicts

## Tools

| Task | Tool | Command |
|------|------|---------|
| Create PR | gh CLI | `gh pr create` |
| View PR | GitHub web | Open PR page |
| Merge PR | gh CLI | `gh pr merge <num>` |
| List PRs | gh CLI | `gh pr list` |
| Code review | GitHub web | "Files changed" tab |
| Revert | Git | `git revert <commit>` |

## Key Takeaway

**Always use this workflow:**

```
Feature Branch → Push → PR → Review → Merge → Update Main
```

Never merge directly to main without a PR.

---

For full details, see: `git-pr-workflow-best-practices.md`
