---
description: Create conventional commit following Angular format
argument-hint: [optional message]
---

# Create Git Commit

Create a git commit following Angular/Conventional Commits format.

## Context

- Current branch: !`git branch --show-current`
- Git status: !`git status --short`
- Staged diff: !`git diff --cached --stat`
- Unstaged diff: !`git diff --stat`
- Recent commits: !`git log --oneline -5`

## Instructions

Based on the changes above, create a single git commit.

### Commit Format (Angular/Conventional)

```
type(scope): subject
```

**Rules:**

- Subject must be max 100 characters
- Use lowercase for type and scope
- No period at the end of subject
- Use imperative mood: "add feature" not "added feature"

### Commit Types

| Type       | Description                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature                                             |
| `fix`      | Bug fix                                                 |
| `docs`     | Documentation only                                      |
| `style`    | Code style (formatting, semicolons, etc.)               |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or updating tests                                |
| `build`    | Build system or dependencies                            |
| `ci`       | CI configuration                                        |
| `chore`    | Other changes (maintenance)                             |
| `revert`   | Revert a previous commit                                |

### Scope (optional)

Common scopes in this project:

- `web` - web folder changes
- `deps` - Dependencies

### Examples

```
feat(web): add hotel card component
chore(deps): update React to v19
docs: update README with new setup instructions
style: format code with prettier
```

## Task

1. If $ARGUMENTS provided, use as commit message hint
2. Analyze the staged/unstaged changes
3. Stage relevant files with `git add`
4. Create commit with appropriate type, scope (if applicable), and subject
5. Keep subject concise (max 100 chars), focus on "what" changed
