---
description: Analyze and fix a GitHub issue following project conventions
argument-hint: <issue number or URL>
---

# Fix GitHub Issue

Analyze and fix the GitHub issue: $ARGUMENTS

## Context

- Current branch: !`git branch --show-current`
- Git status: !`git status --short`
- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown"`

## Step 1: Fetch Issue Details

```bash
gh issue view $ARGUMENTS
```

Extract and understand:
- **Title**: What is the issue about?
- **Description**: What is the expected vs actual behavior?
- **Labels**: Is it a bug, feature, or documentation issue?
- **Reproduction steps**: How to reproduce the problem?

## Step 2: Create a Feature Branch

Branch naming convention:
```bash
# For bugs
git checkout -b fix/<issue-number>-brief-description

# For features
git checkout -b feat/<issue-number>-brief-description

# For docs
git checkout -b docs/<issue-number>-brief-description
```

Example:
```bash
git checkout -b fix/123-hydration-mismatch
```

## Step 3: Investigate the Codebase

1. Search for relevant files based on issue description
2. Understand the existing code structure
3. Identify the root cause (for bugs) or implementation location (for features)

## Step 4: Implement the Fix

1. Make minimal, focused changes
2. Follow existing code patterns and style
3. Add comments only where logic isn't self-evident
4. Don't introduce unrelated changes

## Step 5: Verify Changes

Run these commands to ensure quality:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Fix lint issues if any
pnpm lint:fix

# Preview the site (for web changes)
pnpm dev:web
```

## Step 6: Commit with Angular Convention

**IMPORTANT**: All commits must follow Angular commit convention.

### Format
```
<type>(<scope>): <subject>

<body>

Fixes #<issue-number>
```

### Types

| Type | When to use |
|------|-------------|
| `fix` | Bug fixes |
| `feat` | New features |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting) |
| `refactor` | Code changes that neither fix bugs nor add features |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Example Commits

```bash
# Bug fix
git commit -m "fix(web): resolve hydration mismatch on mobile

The issue was caused by SSR rendering different content than client.
Added useEffect to handle client-only rendering.

Fixes #123"

# Feature
git commit -m "feat(web): add dark mode toggle

Implements dark mode using CSS variables and localStorage persistence.

Fixes #456"

# Documentation
git commit -m "docs: update installation guide

Added troubleshooting section for common pnpm issues.

Fixes #789"
```

### Commit Rules

- Subject must NOT be empty
- Subject must NOT end with a period
- Subject should NOT start with uppercase
- Use imperative mood ("add" not "added")
- Reference issue number with `Fixes #<number>`

## Step 7: Push and Create PR (Optional)

If ready to submit:

```bash
# Push branch
git push -u origin HEAD

# Create PR (will use create-pr command conventions)
gh pr create --title "fix(web): brief description" --body "Fixes #$ARGUMENTS" --base main
```

## Checklist Before Completing

- [ ] Issue is fully understood
- [ ] Root cause identified (for bugs)
- [ ] Changes are minimal and focused
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Commit message follows Angular convention
- [ ] Issue number referenced in commit

## Related Documentation

- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guidelines
- [CLAUDE.md](../../CLAUDE.md) - Project conventions
- [Create PR Command](./create-pr.md) - PR creation guide
