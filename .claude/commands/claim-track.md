---
name: claim-track
description: Claim a track (T1-T5) and start working on it
---

# Claim Track

## Your Task

Claim track **$ARGUMENTS** (T1/T2/T3/T4/T5) and prepare to work on it.

## Track Reference

| Track | Focus | Packages |
|-------|-------|----------|
| T1 | Infrastructure & Schema | `core-schema`, `shared-utils` |
| T2 | Adapters | `core-adapters` |
| T3 | Renderer | `core-renderer`, `themes` |
| T4 | Pagination & Export | `core-pagination`, `core-export` |
| T5 | Apps & UI | `extension-wxt`, `web-nextjs` |

## Execution Flow

### 1. Validate Track

```
Check TASKS.md:
- Is track already claimed by another AI?
- Are dependencies ready? (T2-T5 need T1 interfaces)
```

### 2. Mark Ownership

Update TASKS.md header section:

```markdown
## Track Status

| Track | Owner | Status | Started |
|-------|-------|--------|---------|
| T1 | AI-1 | 🔵 In Progress | 2024-01-31 |
| T2 | - | ⚪ Not Started | - |
```

### 3. Create Working Branch

```bash
git checkout -b track-{N}-{short-description}
# Example: track-1-core-schema
```

### 4. Understand Scope

Read thoroughly:
- TASKS.md - Your track section
- docs/architecture.md - Technical decisions
- docs/data-model.md - Schema definitions (for T1)
- docs/prd.md - Requirements

### 5. Setup Package Structure

Create initial directories based on your track:

**T1:**
```bash
mkdir -p packages/core-schema/src
mkdir -p packages/shared-utils/src
```

**T2:**
```bash
mkdir -p packages/core-adapters/src/adapters
```

**T3:**
```bash
mkdir -p packages/core-renderer/src/components
mkdir -p packages/themes/src/presets
```

**T4:**
```bash
mkdir -p packages/core-pagination/src
mkdir -p packages/core-export/src
```

**T5:**
```bash
mkdir -p apps/extension-wxt/src
mkdir -p apps/web-nextjs/src/app
```

### 6. Report Ready

Output:

```markdown
## 🎯 Track {N} Claimed

**Owner:** AI-{N}
**Branch:** `track-{n}-xxx`
**Focus:** {description}

### Packages to Implement
- `packages/xxx`

### First Tasks
1. [ ] Task 1
2. [ ] Task 2

### Dependencies
- Waiting for: {none / T1 interfaces}
- Can start immediately: {yes/no}

### Questions for Human (if any)
- ...
```

## Conflict Resolution

If track is already claimed:
```
1. Report conflict
2. Suggest alternative track
3. Or offer to assist current owner
```

## Notes

- T1 should be claimed first (defines interfaces for others)
- T2-T5 can work in parallel after T1 publishes interfaces
- Use mock data if waiting for dependencies
