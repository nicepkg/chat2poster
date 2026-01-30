---
name: resolve-conflict
description: Resolve conflicts between tracks or with documentation
---

# Resolve Conflict

## Your Task

Resolve the conflict described in **$ARGUMENTS**.

## Conflict Types

### Type 1: Track Ownership Conflict

Two AIs claiming same files or functionality.

**Resolution:**
```markdown
1. Check TASKS.md for file ownership
2. The track that owns the package keeps the file
3. Other track creates interface/abstraction instead
4. Update TASKS.md to clarify boundaries
```

### Type 2: Interface Mismatch

T1 published interface doesn't match what T2-T5 need.

**Resolution:**
```markdown
1. Document the mismatch
2. Options:
   a) T1 updates interface (preferred if reasonable)
   b) Consuming track adapts (if T1 change is breaking)
   c) Create adapter layer in consuming track
3. Update both TASKS.md and code
```

### Type 3: Docs vs Implementation

Code doesn't match documentation (PRD, architecture, etc.)

**Resolution:**
```markdown
1. Determine source of truth:
   - PRD is product intent
   - Architecture doc is technical design
   - Code is current reality

2. If PRD is right: Update code
3. If code is right: Update docs + note why
4. If neither is clearly right: Escalate to human
```

### Type 4: Merge Conflict

Git conflicts between track branches.

**Resolution:**
```markdown
1. Identify conflicting files
2. Check file ownership in TASKS.md
3. Owner's version takes precedence
4. Non-owner should rebase and adapt
```

## Execution Flow

### 1. Identify Conflict

```markdown
## Conflict Report

**Type:** {Interface Mismatch / Ownership / Docs / Merge}
**Tracks Involved:** T{X}, T{Y}
**Files/Interfaces:** {list}

**Description:**
{What's the conflict?}

**Impact:**
{What's blocked?}
```

### 2. Gather Context

```
Read:
- TASKS.md (ownership)
- Relevant docs
- Both implementations
```

### 3. Propose Resolution

```markdown
## Resolution Options

### Option A: {description}
- Pros: ...
- Cons: ...
- Effort: Low/Medium/High

### Option B: {description}
- Pros: ...
- Cons: ...
- Effort: Low/Medium/High

### Recommended: Option {X}
**Rationale:** {why}
```

### 4. Implement Resolution

```
1. Make code changes
2. Update TASKS.md if ownership clarified
3. Update docs if needed
4. Notify affected tracks
```

### 5. Document Resolution

```markdown
## Resolution Applied

**Date:** {timestamp}
**Decision:** {what was decided}
**Changes Made:**
- {file}: {change}
- TASKS.md: {update}

**Tracks Notified:** T{X}, T{Y}
```

## Output Format

```markdown
# 🔧 Conflict Resolution

## Conflict Summary

**Type:** Interface Mismatch
**Between:** T1 (core-schema) ↔ T3 (renderer)
**Issue:** `Theme.tokens` structure doesn't include `codeBlockBackground`

## Analysis

T1 defined:
```typescript
interface ThemeTokens {
  colors: {
    background: string
    text: string
  }
}
```

T3 needs:
```typescript
interface ThemeTokens {
  colors: {
    background: string
    text: string
    codeBlockBackground: string  // Missing!
  }
}
```

## Resolution

**Decision:** Extend T1 interface (non-breaking addition)

**Changes:**

1. **T1 Update** (`packages/core-schema/src/types/theme.ts`):
```typescript
interface ThemeTokens {
  colors: {
    background: string
    text: string
    codeBlockBackground: string  // Added
    codeBlockText: string        // Added
  }
}
```

2. **T3 Update:** Remove local extension, use T1 type directly

3. **Docs Update:** None needed (interface addition is minor)

## Verification

- [ ] T1 types updated
- [ ] T1 tests pass
- [ ] T3 can import updated type
- [ ] T3 tests pass

## Lessons Learned

> For future: When T3 needs new theme properties, request via issue before implementing workaround.

---

**Conflict resolved. Both tracks can proceed.**
```

## Escalation

If conflict cannot be resolved between AIs:

```markdown
## ⚠️ Escalation Required

**Conflict:** {description}
**Tracks:** T{X}, T{Y}
**Attempts:** {what was tried}

**Options for Human:**
1. {Option A}
2. {Option B}

**Recommendation:** {if any}

**Blocking:** {what's blocked until resolved}
```
