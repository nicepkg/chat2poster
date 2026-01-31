---
description: Create GitHub Pull Request following Angular commit convention
argument-hint: [optional description]
---

# Create Pull Request

Create a GitHub Pull Request following the project's Angular commit convention.

## Context

- Current branch: !`git branch --show-current`
- Base branch: main
- Git status: !`git status --short`
- Changed files: !`git diff --name-only origin/main`
- Diff stat: !`git diff --stat origin/main`
- Recent commits on branch: !`git log origin/main..HEAD --oneline`

## Prerequisites

1. Check if `gh` CLI is available and authenticated:
   ```bash
   gh auth status
   ```

2. Ensure all changes are committed:
   ```bash
   git status
   ```

## PR Title Format (Angular Convention)

**IMPORTANT**: PR titles MUST follow Angular commit convention. This is enforced by GitHub Action.

```
<type>(<scope>): <subject>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect the meaning of the code |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `test` | Adding missing tests or correcting existing tests |
| `build` | Changes that affect the build system or external dependencies |
| `ci` | Changes to CI configuration files and scripts |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Reverts a previous commit |

### Scopes (optional)

- `web` - Changes to the web-nextjs package
- `docs` - Documentation changes
- `deps` - Dependency updates

### Examples

```
feat(web): add dark mode toggle
fix(web): resolve hydration mismatch on mobile
docs: update README with installation steps
chore(deps): update dependencies
refactor: simplify authentication logic
```

### Rules

- Subject must NOT be empty
- Subject must NOT end with a period
- Subject should NOT start with uppercase
- Header (type + scope + subject) max 100 characters

## Creating a Pull Request

### Basic Command

```bash
gh pr create \
  --title "feat(web): your descriptive title" \
  --body "## Description

Brief summary of changes.

Fixes #123

## Type of Change

- [x] New feature

## Checklist

- [x] Code follows style guidelines
- [x] Self-review completed
- [x] No new warnings" \
  --base main
```

### Using HEREDOC for Complex Descriptions

```bash
gh pr create --title "feat(web): add new feature" --body "$(cat <<'EOF'
## Description

Brief summary of the changes and the motivation behind them.

Fixes #123

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [x] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Checklist

- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings

## Screenshots (if applicable)

N/A
EOF
)" --base main
```

### Create as Draft

Add `--draft` flag for work in progress:

```bash
gh pr create --title "feat: wip feature" --body "..." --base main --draft
```

## Useful Commands

```bash
# List your open PRs
gh pr list --author "@me"

# Check PR status
gh pr status

# View a specific PR
gh pr view <PR-NUMBER>

# Convert draft to ready for review
gh pr ready <PR-NUMBER>

# Add reviewers
gh pr edit <PR-NUMBER> --add-reviewer username1,username2

# Merge PR (squash recommended)
gh pr merge <PR-NUMBER> --squash --delete-branch
```

## Common Mistakes to Avoid

1. **Wrong title format**: Always use `type(scope): subject` format
2. **Starting subject with uppercase**: Use lowercase (e.g., `add` not `Add`)
3. **Ending with period**: No period at the end of subject
4. **Missing type**: Always include type prefix
5. **Using emoji in title**: No emoji in PR titles (Angular convention)

## Related Documentation

- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Commit convention details
- [PR Template](../../.github/PULL_REQUEST_TEMPLATE.example.md) - PR description template
- [Angular Commit Convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [GitHub CLI Manual](https://cli.github.com/manual/)
