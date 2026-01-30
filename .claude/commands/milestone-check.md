---
name: milestone-check
description: Check progress towards a milestone (M1/M2/M3/M4)
---

# Milestone Check

## Your Task

Check progress towards milestone **$ARGUMENTS** (M1/M2/M3/M4).

## Milestone Definitions

### M1: Extension MVP (Single Export)
```
Core capability: ChatGPT DOM parsing + single PNG export

Required:
- T1.2 Core Schema (types + validators)
- T2.1 Adapter Infrastructure
- T2.2 ChatGPT DOM Adapter
- T3.2 Core Renderer Setup
- T3.3 Message Components
- T3.4 Conversation Components
- T3.5 Decoration Components
- T4.2 Export Engine Setup
- T4.3 Single Page Export
- T5.1 Extension Setup
- T5.2 Extension Entry Point
- T5.3 Editor UI (basic)
- T5.4 Extension State Management
```

### M2: Selection & Decoration
```
Core capability: Full theme/decoration controls + message selection

Required: M1 +
- T3.1 Theme System (full)
- T5.3 Editor UI (complete with all controls)
```

### M3: Pagination & Multi-Export
```
Core capability: Auto/manual pagination + ZIP export

Required: M2 +
- T4.1 Pagination Logic
- T4.4 Multi-Page Export
- T4.5 ZIP Packaging
- T4.6 Export Job Manager
```

### M4: Web App Complete
```
Core capability: Full web app with share link + manual builder

Required: M3 +
- T2.5 ChatGPT Share Link Adapter
- T2.6 Manual Input Adapter
- T2.7 Paste Text Adapter
- T5.5 Web App Setup
- T5.6 Web Import Page
- T5.7 Web Manual Builder
- T5.8 Web Editor Page
- T5.9 API Routes
```

## Execution

### 1. Read TASKS.md
Parse all required tasks for the milestone.

### 2. Check Each Requirement
```
For each required task:
- Is it marked [x]?
- Are tests passing?
- Is it integrated?
```

### 3. Calculate Readiness

## Output Format

```markdown
# 🏁 Milestone {N} Status

**Milestone:** M{N} - {Name}
**Target:** {description}
**Status:** {Ready / Not Ready / Blocked}

## Requirements Checklist

### T1: Infrastructure (Required: 1 section)
| Section | Status | Blocker |
|---------|--------|---------|
| T1.2 Core Schema | ✅ Complete | - |

### T2: Adapters (Required: 2 sections)
| Section | Status | Blocker |
|---------|--------|---------|
| T2.1 Adapter Infra | ✅ Complete | - |
| T2.2 ChatGPT DOM | 🔵 80% | DOM selector for images |

### T3: Renderer (Required: 4 sections)
| Section | Status | Blocker |
|---------|--------|---------|
| T3.2 Setup | ✅ Complete | - |
| T3.3 Message | 🔵 90% | Shiki async loading |
| T3.4 Conversation | ⚪ 0% | Waiting on T3.3 |
| T3.5 Decoration | ✅ Complete | - |

### T4: Export (Required: 2 sections)
| Section | Status | Blocker |
|---------|--------|---------|
| T4.2 Setup | ✅ Complete | - |
| T4.3 Single Export | 🔵 70% | Font loading issue |

### T5: Apps (Required: 4 sections)
| Section | Status | Blocker |
|---------|--------|---------|
| T5.1 Extension Setup | ✅ Complete | - |
| T5.2 Entry Point | 🔵 50% | - |
| T5.3 Editor UI | 🔵 40% | - |
| T5.4 State Mgmt | ⚪ 0% | - |

## Summary

```
Total Requirements: 13 sections
Completed: 6 (46%)
In Progress: 5 (38%)
Not Started: 2 (15%)
Blocked: 2
```

## Critical Path

```
T3.3 (Message) ──blocks──> T3.4 (Conversation)
                          ↓
T4.3 (Export) ──blocks──> Integration Test
                          ↓
                        M1 Ready
```

## Blockers to Resolve

1. **T2.2 - DOM selector for images**
   - Issue: ChatGPT changed image container structure
   - Owner: AI-2
   - Severity: Medium

2. **T4.3 - Font loading**
   - Issue: Fonts not ready before export
   - Owner: AI-4
   - Severity: High (affects output quality)

## Actions Needed

| Priority | Action | Owner | Deadline |
|----------|--------|-------|----------|
| 🔴 High | Fix font loading in T4.3 | AI-4 | ASAP |
| 🟡 Medium | Complete T3.3 Shiki setup | AI-3 | Before T3.4 |
| 🟡 Medium | Update ChatGPT DOM selectors | AI-2 | This week |
| 🟢 Low | Start T5.4 state management | AI-5 | After T5.3 |

## Integration Test Plan

When all requirements are complete:

```bash
# 1. Build all packages
pnpm build

# 2. Run unit tests
pnpm test

# 3. Manual integration test
- Load extension in Chrome
- Navigate to ChatGPT
- Parse conversation
- Verify message list
- Export single PNG
- Verify output quality
```

## Estimated Completion

Based on current velocity:
- Remaining work: ~{X} tasks
- Blockers resolution: ~{Y} days
- Integration testing: ~{Z} days

**Estimated M{N} ready:** {date estimate}

---

**Next milestone check:** After T{X}.{Y} completes
```

## Quick Check Mode

If just need summary:

```markdown
# M{N} Quick Status

✅ 6/13 requirements complete (46%)
🔵 5 in progress
⚪ 2 not started
🔴 2 blockers

**Not ready.** Critical: Fix T4.3 font loading.
```
