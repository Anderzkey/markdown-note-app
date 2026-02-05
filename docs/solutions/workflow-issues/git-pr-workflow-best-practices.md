---
title: Proper Git Workflow with Pull Requests
category: workflow-issues
tags: [git, github, workflow, pull-requests, best-practices]
related: [feature-2-tags.md]
created: 2026-02-05
status: approved
---

# Proper Git Workflow with Pull Requests

## Overview

This document explains the correct Git and GitHub workflow for the Markdown Note Taking App project. It serves as a reference for team members and future sessions to prevent workflow mistakes and maintain a clean, reviewable git history.

## What Happened: The Mistake

**Feature 2 (Tags & Filtering)** was developed directly on the `main` branch and committed without creating a Pull Request.

```bash
# WHAT WE DID (incorrect):
main branch
  ├── Work on tags feature
  ├── Commit: "Add tags feature"
  ├── Merge directly to main (no PR)
  └── Push to GitHub
```

**Problems with this approach:**
- No code review trail
- No documentation of why changes were made
- Difficult to track what changed and when
- No opportunity to discuss implementation details
- Clean history on main, but no PR record on GitHub
- Hard to revert or investigate issues later

## The Correct Workflow

### Step 1: Create a Feature Branch

```bash
cd "/Users/andrejzadoroznyj/Downloads/Go_practice/Cursor + CC/Markdown Note Taking App"
git checkout -b feature/tags-and-filtering
```

**Naming convention:** `feature/<feature-name>` or `fix/<fix-name>`

### Step 2: Develop the Feature

Make commits on your feature branch as you develop. Keep commits small and logical.

```bash
# Make changes to files
git add app.js styles.css
git commit -m "Add tag system to note structure"

git add app.js
git commit -m "Implement tag filtering UI"

git add app.js tests/
git commit -m "Add unit tests for tag filtering"
```

**Commit message style:** Imperative, clear, under 50 characters for subject line.

### Step 3: Push to GitHub

```bash
# First push: set upstream branch
git push -u origin feature/tags-and-filtering

# Subsequent pushes:
git push
```

This creates the feature branch on GitHub and makes it available for collaboration.

### Step 4: Create a Pull Request

#### Option A: Using GitHub Web UI

1. Go to your GitHub repository
2. Click "Pull requests" tab
3. Click "New pull request" button
4. Select `feature/tags-and-filtering` as source branch
5. Select `main` as target branch
6. Add title and description
7. Click "Create pull request"

#### Option B: Using GitHub CLI (`gh` command)

```bash
# Create PR interactively
gh pr create --title "Add Tags & Filtering Feature" \
  --body "$(cat <<'EOF'
## Summary
Adds tag system to notes with filtering capabilities.

## Changes
- New tag structure in note model
- Tag filtering UI component
- Unit tests for tag operations

## Testing
- [ ] Manual testing on all notes
- [ ] Filter by single tag works
- [ ] Filter by multiple tags works
- [ ] Creating new tags works
- [ ] Deleting tags works
EOF
)"
```

### Step 5: Code Review

**For yourself or team:**
1. Review the PR changes on GitHub
2. Check the "Files changed" tab
3. Add comments on specific lines if needed
4. Verify all commits are related to the feature
5. Ensure tests pass (if CI is set up)

### Step 6: Merge the PR

#### Option A: Using GitHub Web UI

1. Go to the PR page
2. Review "Conversation" tab for all comments
3. Ensure CI checks pass (if configured)
4. Click "Merge pull request" button
5. Select merge strategy (usually "Create a merge commit")
6. Confirm merge
7. Delete the feature branch

#### Option B: Using GitHub CLI

```bash
# List your open PRs
gh pr list

# View a specific PR
gh pr view <number>

# Merge a PR
gh pr merge <number> --merge

# Delete the branch after merging (happens automatically with gh)
```

### Step 7: Update Local Main Branch

```bash
# Switch back to main
git checkout main

# Fetch latest changes from GitHub
git fetch origin

# Update local main with remote main
git pull origin main

# Delete local feature branch
git branch -d feature/tags-and-filtering
```

## Complete Workflow Example

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/tags-and-filtering

# 2. Make changes and commit (repeat as needed)
echo "Add tags feature" > tags.md
git add tags.md
git commit -m "Add tag system implementation"

# 3. Push to GitHub
git push -u origin feature/tags-and-filtering

# 4. Create PR using gh
gh pr create --title "Add Tags & Filtering" \
  --body "Implements tag system for notes with filtering UI"

# 5. Review (on GitHub website)
# - Check files changed
# - Review code
# - Run tests manually
# - Request changes if needed

# 6. Merge the PR
gh pr merge <PR_NUMBER> --merge

# 7. Update local main
git checkout main
git pull origin main
git branch -d feature/tags-and-filtering
```

## Why PRs Matter

### Code Review
- Another person (or your future self) reviews changes
- Catch bugs, security issues, or design problems
- Suggest improvements before merging

### Documentation Trail
- Each PR is a record of what changed and why
- Future developers understand design decisions
- Easy to find when a feature was added or a bug fixed

### Testing & CI/CD
- Run automated tests before merging
- Ensure code quality standards are met
- Prevent breaking changes to main

### Collaboration
- Team members can comment on specific lines
- Discuss implementation approaches
- Share knowledge about the codebase

### Git History
- Main branch stays clean with merge commits
- Each PR is a logical unit of work
- Easy to revert entire features if needed

```bash
# Clean history with PRs:
main
  ├── Merge pull request #5: Add Tags & Filtering
  │   ├── Add tag system implementation
  │   ├── Implement tag filtering UI
  │   └── Add tests for tag operations
  ├── Merge pull request #4: Add Search Feature
  │   ├── Add search index
  │   └── Add search UI
  └── Initial commit
```

## GitHub CLI (`gh`) vs Web UI

### Using `gh` (Command Line)

**Advantages:**
- Faster for experienced developers
- Can script workflows
- No need to leave terminal
- Works with git hooks

**Commands:**
```bash
gh pr create              # Create new PR
gh pr list               # List all PRs
gh pr view <number>      # View PR details
gh pr merge <number>     # Merge PR
gh pr review <number>    # Review PR
```

### Using GitHub Web UI

**Advantages:**
- Visual overview of changes
- Easy to see diffs side-by-side
- Better for complex reviews
- No terminal needed

**Steps:**
1. Open repository on GitHub
2. Click "Pull requests" tab
3. Create, review, or merge from web interface

### Recommendation

- Use `gh` for creating and merging PRs (faster)
- Use web UI for detailed code review (clearer diffs)
- Combine both as needed

## Best Practices for Future Features

### Before Starting Development

1. Create feature plan: `plans/feature-N-<name>.md`
2. Add to git: `git add plans/feature-N-<name>.md`
3. Commit: `git commit -m "docs: Add feature N plan"`

### During Development

1. Create feature branch immediately
2. Push to GitHub early (even if incomplete)
3. Keep commits small and logical
4. Write clear commit messages
5. Test locally before pushing

### Before Creating PR

1. Ensure all tests pass
2. Verify code follows project style
3. Check that all changes are related to the feature
4. Update relevant documentation
5. Self-review the entire PR

### PR Description Template

```markdown
## Summary
[One sentence description of what this PR does]

## Changes
- Change 1
- Change 2
- Change 3

## Testing
- [x] Manual testing complete
- [x] All tests pass
- [x] Tested on mobile/desktop
- [x] Accessibility checked

## Related Issues
Fixes #<issue_number> (if applicable)
Relates to plans/feature-N-<name>.md
```

## Troubleshooting

### "I already merged to main without a PR. How do I fix it?"

```bash
# Option 1: Create a documentation PR anyway
git checkout -b docs/feature-2-retrospective
git commit --allow-empty -m "docs: Document Feature 2 implementation"
git push -u origin docs/feature-2-retrospective
gh pr create --title "Document Feature 2 (Tags & Filtering)"

# Option 2: Reset and redo properly
git reset --soft HEAD~<number_of_commits>
git checkout -b feature/tags-and-filtering
git push -u origin feature/tags-and-filtering
gh pr create --title "Add Tags & Filtering Feature"
```

### "I want to add more commits to my existing PR"

```bash
# Make changes on your feature branch
git add files
git commit -m "Fix: Address review feedback"

# Push to same branch (updates existing PR)
git push origin feature/tags-and-filtering
```

### "I want to close a PR without merging"

```bash
# Close on GitHub web UI:
# - Go to PR page
# - Click "Close pull request" button

# Or use gh:
gh pr close <number>
```

## Resources

- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Git Commit Messages Guide](https://chris.beams.io/posts/git-commit/)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Atlassian Git Workflows](https://www.atlassian.com/git/tutorials/comparing-workflows)

## Summary

**The proper workflow is:**

1. **Create branch** → `git checkout -b feature/name`
2. **Develop** → Make commits on feature branch
3. **Push** → `git push -u origin feature/name`
4. **Create PR** → `gh pr create` or use GitHub web UI
5. **Review** → Check changes and discuss
6. **Merge** → `gh pr merge <number>` or merge on GitHub
7. **Clean up** → `git checkout main && git pull && git branch -d`

**This gives you:** Clear PR history, code review trail, documentation, clean commits, and a professional workflow.

**For the Markdown Note Taking App:** Going forward, all features must follow this workflow before merging to main.
