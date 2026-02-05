---
title: Solutions & Lessons Learned
description: Documentation of issues solved and best practices learned during development
---

# Solutions & Lessons Learned

This folder contains documentation of workflow issues, development challenges, and lessons learned during the Markdown Note Taking App development.

## Purpose

- Document workflow mistakes and how to avoid them
- Record solutions to common development problems
- Capture best practices for the team
- Serve as a reference guide for future sessions

## Categories

### Workflow Issues

| Document | Topic | Status |
|----------|-------|--------|
| [Git PR Workflow Best Practices](./workflow-issues/git-pr-workflow-best-practices.md) | Why PRs matter, correct workflow, GitHub CLI usage | Complete |
| [Quick Reference Card](./workflow-issues/QUICK-REFERENCE.md) | Cheatsheet for quick lookup during development | Complete |

## How to Use This Folder

### For Current Developers

1. **Stuck on a problem?** Search this folder first
2. **Starting a feature?** Review the workflow documents
3. **Making a common mistake?** Check the troubleshooting sections

### For Future Sessions

1. **Reading unfamiliar code?** Check lessons learned
2. **Getting back up to speed?** Review workflow documents
3. **Planning next feature?** Follow the established workflow

## Key Lessons from Feature 2

### The Problem
Feature 2 (Tags & Filtering) was merged directly to main without creating a Pull Request, skipping code review and documentation.

### The Solution
Established proper Git workflow with Pull Requests:
1. Create feature branch
2. Develop and commit
3. Push to GitHub
4. Create PR
5. Review and merge
6. Update local main

### The Benefit
- Clear history of all changes
- Code review trail for all features
- Easy to find when features were added
- Professional development workflow
- Better team collaboration

## Related Files

- **Feature Plans:** `plans/feature-*.md`
- **Main Project Plan:** `PLAN.md`
- **Project Guidelines:** `CLAUDE.md`

## Adding New Solutions

When you solve a workflow issue or discover a best practice:

1. Create a new markdown file in this folder
2. Add YAML frontmatter (title, category, tags, status)
3. Write clear, actionable documentation
4. Link to related documents
5. Commit to git with descriptive message
6. Update this README

### Example Frontmatter

```yaml
---
title: Solution Title
category: category-name
tags: [tag1, tag2, tag3]
related: [related-file.md]
created: YYYY-MM-DD
status: draft|approved|deprecated
---
```

## Questions?

Refer to the specific document or check the main project guidelines in `CLAUDE.md`.
