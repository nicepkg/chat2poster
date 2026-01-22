---
description: Review a GitHub Pull Request for quality and conventions
argument-hint: <PR number or URL>
---

# Review Pull Request

Review the GitHub Pull Request: $ARGUMENTS

## Context

- Current branch: !`git branch --show-current`
- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown"`

## Step 1: Fetch PR Details

```bash
gh pr view $ARGUMENTS
```

Extract and understand:
- **Title**: Does it follow Angular convention?
- **Description**: Is the change clearly explained?
- **Files changed**: What's the scope of changes?
- **Linked issues**: What problem does this solve?

## Step 2: Check PR Title Format

**Required format**: `<type>(<scope>): <subject>`

### Valid Examples
```
feat(website): add dark mode toggle
fix(website): resolve hydration mismatch
docs: update installation guide
chore(deps): update dependencies
```

### Common Issues
- ❌ Missing type prefix
- ❌ Subject starts with uppercase
- ❌ Subject ends with period
- ❌ Using emoji in title
- ❌ Title too long (>100 chars)

## Step 3: Review the Diff

```bash
# View PR diff
gh pr diff $ARGUMENTS

# View files changed
gh pr view $ARGUMENTS --json files -q '.files[].path'

# Check out PR locally for deeper review
gh pr checkout $ARGUMENTS
```

## Step 4: Review Checklist

### PR Meta

- [ ] **Title**: Follows Angular convention (`type(scope): subject`)
- [ ] **Description**: Clearly explains what and why
- [ ] **Issue link**: References related issue (`Fixes #123`)
- [ ] **Scope**: Changes are focused, not mixing concerns

### Code Quality

- [ ] **Logic**: Changes are correct and handle edge cases
- [ ] **Types**: TypeScript types are accurate
- [ ] **Style**: Follows project conventions
- [ ] **No debug code**: No console.log, commented code, TODOs

### Security

- [ ] **No secrets**: No API keys, tokens, or credentials
- [ ] **Input validation**: User inputs are sanitized
- [ ] **No vulnerabilities**: No obvious security issues

### Project Conventions

- [ ] **Config**: Uses `site-info.ts` for configurable values
- [ ] **Imports**: Uses `~/` path alias
- [ ] **UI components**: Doesn't modify `components/ui/`
- [ ] **Commit messages**: All commits follow Angular convention

### Tests & Verification

- [ ] **TypeScript**: `pnpm typecheck` passes
- [ ] **Lint**: `pnpm lint` passes
- [ ] **Builds**: `pnpm build:website` succeeds

## Step 5: Provide Feedback

### Approve ✅

If PR is good:
```bash
gh pr review $ARGUMENTS --approve --body "LGTM! Clean implementation."
```

### Request Changes 🔄

If changes needed:
```bash
gh pr review $ARGUMENTS --request-changes --body "Please address the following:

## Issues

### 🔴 Critical
- [Issue description]

### 🟡 Suggestions
- [Suggestion description]
"
```

### Comment 💬

For questions or discussion:
```bash
gh pr review $ARGUMENTS --comment --body "Question: [Your question]"
```

## Review Comment Format

Use this format for inline comments:

```markdown
**🔴 Critical**: [Issue that must be fixed]

**🟡 Suggestion**: [Improvement recommendation]

**❓ Question**: [Clarification needed]

**✅ Nice**: [Positive feedback]
```

## Severity Guide

| Icon | Level | Action |
|------|-------|--------|
| 🔴 | Critical | Must fix before merge |
| 🟡 | Warning | Should fix, but not blocking |
| 🔵 | Suggestion | Nice to have, optional |
| ❓ | Question | Need clarification |
| ✅ | Praise | Good pattern, well done |

## Useful Commands

```bash
# List open PRs
gh pr list

# View PR checks status
gh pr checks $ARGUMENTS

# View PR comments
gh pr view $ARGUMENTS --comments

# Add single comment
gh pr comment $ARGUMENTS --body "Your comment"

# Merge PR (after approval)
gh pr merge $ARGUMENTS --squash --delete-branch
```

## Related Documentation

- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guidelines
- [Code Review Command](./code-review.md) - Detailed code review checklist
- [Create PR Command](./create-pr.md) - PR conventions
