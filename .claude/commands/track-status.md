---
name: track-status
description: Show status of all tracks and their tasks
---

# Track Status Report

## Your Task

Generate a status report for all tracks, or specific track **$ARGUMENTS**.

## Execution

### 1. Read TASKS.md
```
Parse all track sections and their task statuses
```

### 2. Calculate Progress
```
For each track section (T1.1, T1.2, etc.):
- Count total tasks
- Count completed [x]
- Count in progress [~]
- Count blocked [!]
```

### 3. Check Dependencies
```
- Which tracks are blocked?
- Which tracks can proceed?
```

### 4. Generate Report

## Output Format

```markdown
# 📊 Chat2Poster Track Status

**Last Updated:** {timestamp}

## Overview

| Track | Owner | Progress | Status |
|-------|-------|----------|--------|
| T1 Infrastructure | AI-1 | ████████░░ 80% | 🔵 In Progress |
| T2 Adapters | AI-2 | ██░░░░░░░░ 20% | 🔵 In Progress |
| T3 Renderer | AI-3 | ░░░░░░░░░░ 0% | ⚪ Waiting (T1) |
| T4 Export | AI-4 | ░░░░░░░░░░ 0% | ⚪ Not Started |
| T5 Apps | AI-5 | ░░░░░░░░░░ 0% | ⚪ Not Started |

## Track Details

### T1: Infrastructure & Schema
**Owner:** AI-1 | **Branch:** `track-1-infra`

| Section | Status | Progress |
|---------|--------|----------|
| T1.1 Monorepo Setup | ✅ Done | 5/5 |
| T1.2 Core Schema | 🔵 Active | 8/12 |
| T1.3 Shared Utils | ⚪ Pending | 0/4 |

**Blockers:** None
**Next:** Complete T1.2 validators

---

### T2: Adapters
**Owner:** AI-2 | **Branch:** `track-2-adapters`

| Section | Status | Progress |
|---------|--------|----------|
| T2.1 Adapter Infra | 🔵 Active | 3/5 |
| T2.2 ChatGPT DOM | ⚪ Pending | 0/7 |
| ... | | |

**Blockers:** Waiting for `Message` type from T1
**Next:** Implement registry

---

## Milestone Progress

### M1: Extension MVP
```
Required: T1.2 ✅, T2.1 ⚪, T2.2 ⚪, T3.2-T3.5 ⚪, T4.2-T4.3 ⚪, T5.1-T5.4 ⚪
Progress: 1/6 tracks ready
ETA: Blocked on T1, T2, T3, T4, T5
```

### M2: Selection & Decoration
```
Required: M1 + T3.1 ⚪, T5.3 ⚪
Progress: 0/2 additional tracks
```

## Dependency Graph

```
T1 (Schema) ──┬──> T2 (Adapters)
              ├──> T3 (Renderer)
              ├──> T4 (Export)
              └──> T5 (Apps)

T2 ──> T5.2 (Extension Entry)
T3 ──> T5.3 (Editor UI)
T4 ──> T5.3 (Export Controls)
```

## Action Items

1. 🔴 **T1 Priority:** Publish interfaces for T2-T5 to unblock
2. 🟡 **T2 can start:** Use interface stubs, implement registry
3. 🟡 **T3 can start:** Use interface stubs, implement MessageItem
4. ⚪ **T4 waiting:** Need height estimation approach from T3
5. ⚪ **T5 waiting:** Need all core packages for integration

## Notes
- {Any coordination notes between AIs}
```

## Specific Track Query

If `$ARGUMENTS` specifies a track (e.g., "T2"):

```markdown
# 📊 Track T2: Adapters - Detailed Status

**Owner:** AI-2
**Branch:** `track-2-adapters`
**Started:** 2024-01-31

## Section Breakdown

### T2.1 - Adapter Infrastructure
| Task | Status | Notes |
|------|--------|-------|
| Create package.json | ✅ | |
| Define Adapter interface | ✅ | |
| Implement registry | 🔵 | 50% done |
| Implement parseWithAdapters | ⚪ | |
| Write registry tests | ⚪ | |

### T2.2 - ChatGPT DOM Adapter
| Task | Status | Notes |
|------|--------|-------|
| Create chatgpt-dom.ts | ⚪ | |
| DOM selectors | ⚪ | |
| ... | | |

## Files Modified
- `packages/core-adapters/package.json`
- `packages/core-adapters/src/types.ts`
- `packages/core-adapters/src/registry.ts`

## Commits
- `abc1234` feat(adapters): add Adapter interface
- `def5678` feat(adapters): implement registry

## Blockers
- None currently

## Questions for Human
- Should adapters be async generators for streaming?
```
