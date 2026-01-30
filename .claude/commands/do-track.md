---
name: do-track
description: Execute tasks from your claimed track
---

# Execute Track Tasks

## Your Task

Execute tasks from track **$ARGUMENTS** in `TASKS.md`.

## Pre-flight Checks

### 1. Confirm Ownership
```
Verify in TASKS.md:
- You have claimed this track
- No conflicts with other AIs
```

### 2. Check Dependencies
```
If T2-T5:
- Are T1 interfaces published?
- If not, use interface stubs and continue
```

### 3. Read Context
```
- CLAUDE.md (conventions)
- docs/architecture.md
- docs/data-model.md (for schema work)
- docs/ui-spec.md (for UI work)
- docs/acceptance.md (for test criteria)
```

## Execution Pattern

### For Each Task Section (e.g., T1.1, T1.2):

#### Step 1: Mark In Progress
Update TASKS.md:
```markdown
### T1.1 - Monorepo Setup 🔵
- [~] Initialize pnpm workspace  ← Mark current task
- [ ] Configure TypeScript
```

#### Step 2: Implement
```
- Write code
- Follow project conventions
- Add JSDoc comments for public APIs
```

#### Step 3: Test
```
- Write unit tests
- Run: pnpm test
- Run: pnpm lint
- Run: pnpm typecheck
```

#### Step 4: Mark Complete
Update TASKS.md:
```markdown
### T1.1 - Monorepo Setup ✅
- [x] Initialize pnpm workspace
- [x] Configure TypeScript
```

#### Step 5: Commit
```bash
git add .
git commit -m "feat(core-schema): implement Conversation and Message types"
```

## Task Status Markers

| Marker | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Completed |
| `[!]` | Blocked / Needs decision |
| `[-]` | Skipped / Deferred |

## Output Format

After completing a task section:

```markdown
## ✅ {Track}.{Section} Complete

### Completed Tasks
- [x] Task 1
- [x] Task 2

### Files Created/Modified
- `packages/core-schema/src/types.ts` - Added types
- `packages/core-schema/src/validators.ts` - Added Zod schemas

### Tests Added
- `packages/core-schema/src/__tests__/types.test.ts`

### Exported APIs
```typescript
// What other tracks can now import
export { Conversation, Message, Selection }
export { conversationSchema, messageSchema }
```

### Ready for Integration
- T2 can now import: `Message`, `Conversation` types
- T3 can now import: `Theme`, `Decoration` types

### Blockers (if any)
- [!] Need decision: Should Selection allow empty array?
```

## Error Handling

### Dependency Not Ready
```
1. Create interface stub in your package
2. Add TODO comment: "// TODO: Import from core-schema when ready"
3. Continue with implementation
4. Update when real dependency is available
```

### Test Failure
```
1. Fix the issue
2. Re-run tests
3. Don't mark complete until tests pass
```

### Unclear Requirements
```
1. Mark task as [!]
2. List options
3. Make reasonable default choice
4. Document decision
5. Continue (don't block on every detail)
```

## Best Practices

1. **Small commits** - One logical change per commit
2. **Run tests often** - Before marking anything complete
3. **Update TASKS.md** - Keep status accurate for other AIs
4. **Export early** - Publish interfaces before implementations
5. **Document decisions** - In code comments or CLAUDE.md
