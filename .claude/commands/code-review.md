---
description: Review code changes for quality, security, and best practices
argument-hint: [file path or glob pattern]
---

# Code Review

Review the code changes for: $ARGUMENTS

## Context

- Current branch: !`git branch --show-current`
- Git status: !`git status --short`
- Recent changes: !`git diff --stat HEAD~1 2>/dev/null || git diff --stat`

## Review Checklist

### 1. Code Quality

- [ ] **Readability**: Is the code easy to understand?
- [ ] **Simplicity**: Is this the simplest solution? Any over-engineering?
- [ ] **DRY**: Is there duplicated code that should be abstracted?
- [ ] **Naming**: Are variables, functions, and files named clearly?
- [ ] **Comments**: Are complex sections documented? (No obvious comments)

### 2. Logic & Correctness

- [ ] **Edge cases**: Are edge cases handled (null, empty, bounds)?
- [ ] **Error handling**: Are errors caught and handled appropriately?
- [ ] **Type safety**: Are TypeScript types used correctly?
- [ ] **Async/await**: Are promises handled correctly? No unhandled rejections?

### 3. Security (OWASP Top 10)

- [ ] **Injection**: No SQL/command injection vulnerabilities?
- [ ] **XSS**: User input properly sanitized for display?
- [ ] **Sensitive data**: No secrets, tokens, or PII in code?
- [ ] **Dependencies**: No known vulnerable dependencies?

### 4. Performance

- [ ] **Unnecessary renders**: React components optimized (memo, useMemo, useCallback)?
- [ ] **Bundle size**: No large unnecessary imports?
- [ ] **N+1 queries**: No inefficient data fetching patterns?
- [ ] **Memory leaks**: Event listeners and subscriptions cleaned up?

### 5. Project Conventions

- [ ] **File structure**: Files in correct directories?
- [ ] **Import paths**: Using `~/` alias correctly?
- [ ] **Config values**: Using `site-info.ts` instead of hardcoding?
- [ ] **UI components**: Not modifying `components/ui/` (shadcn managed)?

## Review Format

Provide feedback in this format:

### Summary

Brief overall assessment (1-2 sentences).

### Issues Found

#### 🔴 Critical (Must Fix)

```
File: path/to/file.ts:123
Issue: [Description]
Suggestion: [How to fix]
```

#### 🟡 Warning (Should Fix)

```
File: path/to/file.ts:456
Issue: [Description]
Suggestion: [How to fix]
```

#### 🔵 Suggestion (Nice to Have)

```
File: path/to/file.ts:789
Suggestion: [Improvement idea]
```

### Positive Highlights

- What was done well (acknowledge good patterns)

## Severity Levels

| Level | Icon | Description |
|-------|------|-------------|
| Critical | 🔴 | Security issues, bugs, breaking changes |
| Warning | 🟡 | Code smells, performance issues, maintainability |
| Suggestion | 🔵 | Style improvements, optional optimizations |
| Praise | ✅ | Good patterns worth highlighting |

## Commands to Help Review

```bash
# View changes in specific file
git diff path/to/file.ts

# View staged changes
git diff --cached

# Check for TypeScript errors
pnpm typecheck

# Check for lint issues
pnpm lint

# Search for patterns
grep -r "pattern" --include="*.ts" --include="*.tsx"
```

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Project conventions
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Code standards
