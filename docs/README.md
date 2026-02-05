---
title: Documentation Index
description: Complete guide to Markdown Note Taking App documentation
---

# Documentation Index

Welcome to the Markdown Note Taking App documentation. This folder contains guides, references, and solutions for the project.

## Quick Start

**New to the project?**
1. Read: [`CLAUDE.md`](../CLAUDE.md) - Project overview and guidelines
2. Read: [`README.md`](../README.md) - Feature overview
3. Read: [`PLAN.md`](../PLAN.md) - Development roadmap

**Starting development?**
1. Check: [`solutions/workflow-issues/QUICK-REFERENCE.md`](./solutions/workflow-issues/QUICK-REFERENCE.md) - Git commands
2. Review: [`solutions/workflow-issues/git-pr-workflow-best-practices.md`](./solutions/workflow-issues/git-pr-workflow-best-practices.md) - Workflow guidelines
3. Read: [`plans/feature-*.md`](../plans/) - Feature specifications

## Folder Structure

```
docs/
├── README.md                           # This file
└── solutions/                          # Solved issues & best practices
    ├── README.md                       # Solutions index
    └── workflow-issues/                # Workflow & Git documentation
        ├── git-pr-workflow-best-practices.md
        └── QUICK-REFERENCE.md
```

## Documentation by Topic

### Project Overview
- [`CLAUDE.md`](../CLAUDE.md) - Project guidelines, tech stack, structure
- [`README.md`](../README.md) - Project description and features
- [`PLAN.md`](../PLAN.md) - Development roadmap and phases

### Development Guides
- [Git PR Workflow Best Practices](./solutions/workflow-issues/git-pr-workflow-best-practices.md)
- [Git PR Workflow Quick Reference](./solutions/workflow-issues/QUICK-REFERENCE.md)

### Feature Plans
Located in `plans/` folder:
- `feature-1-search.md` - Search functionality
- `feature-2-tags.md` - Tags & filtering
- `feature-3-pdf-export.md` - PDF export
- `markdown-note-app.md` - Original project plan

### Solutions & Lessons Learned
- [`solutions/README.md`](./solutions/README.md) - Index of all solutions
- [`solutions/workflow-issues/`](./solutions/workflow-issues/) - Workflow solutions

## Common Tasks

### I want to start a new feature
1. Create feature plan in `plans/feature-N-<name>.md`
2. Add and commit to git
3. Follow workflow from `solutions/workflow-issues/QUICK-REFERENCE.md`

### I'm stuck on a Git problem
1. Check `solutions/workflow-issues/QUICK-REFERENCE.md` for commands
2. See troubleshooting in `solutions/workflow-issues/git-pr-workflow-best-practices.md`

### I need to understand the project
1. Read `CLAUDE.md` for overview
2. Read `PLAN.md` for roadmap
3. Check `README.md` for feature list

### I want to review code
1. Follow proper PR workflow from `solutions/workflow-issues/`
2. Use GitHub PR tools or gh CLI

## File Legend

| Symbol | Meaning |
|--------|---------|
| `.md` | Markdown documentation |
| `PLAN.md` | Development plan/roadmap |
| `README.md` | Project or folder description |
| `CLAUDE.md` | AI-specific guidelines |
| `feature-*.md` | Feature specification |
| `QUICK-REFERENCE.md` | Cheatsheet for quick lookup |

## Last Updated

This documentation index was created on 2026-02-05 as part of establishing proper Git workflow and documentation practices for the Markdown Note Taking App project.

## Questions or Suggestions?

If you find documentation gaps or have suggestions:

1. File an issue describing what's missing
2. Create or update documentation
3. Commit with clear message
4. Update this README with new content

Keep documentation up-to-date as the project evolves.
