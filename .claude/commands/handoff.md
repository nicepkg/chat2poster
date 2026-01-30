---
name: handoff
description: Complete track work and handoff for integration
---

# Track Handoff

## Your Task

Complete work on track **$ARGUMENTS** and prepare for integration.

## Pre-Handoff Checklist

### 1. Code Complete
```
- [ ] All tasks in track marked [x]
- [ ] No [~] (in progress) tasks remaining
- [ ] No [!] (blocked) tasks unresolved
```

### 2. Quality Gates
```bash
# Run all checks
pnpm lint
pnpm typecheck
pnpm test

# All must pass
```

### 3. Documentation
```
- [ ] JSDoc comments on all public APIs
- [ ] README.md in package (if applicable)
- [ ] CLAUDE.md updated with any new conventions
```

### 4. Exports Verified
```
- [ ] All intended public APIs exported from index.ts
- [ ] No internal types accidentally exported
- [ ] Types are importable by other packages
```

## Handoff Process

### Step 1: Final Status Update

Update TASKS.md:

```markdown
## Track Status

| Track | Owner | Status | Completed |
|-------|-------|--------|-----------|
| T1 | AI-1 | ✅ Complete | 2024-01-31 |
```

### Step 2: Create Summary PR

```bash
# Ensure all changes committed
git add .
git commit -m "feat(track-1): complete core-schema implementation"

# Push branch
git push -u origin track-1-core-schema

# Create PR (or prepare PR description)
```

### Step 3: Generate Handoff Document

## Output Format

```markdown
# 🎉 Track {N} Handoff Complete

**Track:** T{N} - {Name}
**Owner:** AI-{N}
**Branch:** `track-{n}-xxx`
**Completed:** {timestamp}

## Summary

{One paragraph describing what was built}

## Packages Delivered

### `@chat2poster/core-schema`

**Purpose:** Defines all shared TypeScript types and Zod validators

**Exports:**
```typescript
// Types
export type { Message, Conversation, Selection, PageBreak }
export type { Theme, Decoration, ThemeTokens }
export type { ExportJob, ExportParams, ExportError }

// Validators
export { messageSchema, conversationSchema, selectionSchema }
export { themeSchema, decorationSchema }
export { exportJobSchema, exportParamsSchema }

// Utilities
export { createMessage, createConversation }
export { validateMessage, validateConversation }
```

**Usage Example:**
```typescript
import { Message, messageSchema } from '@chat2poster/core-schema'

const msg: Message = {
  id: 'uuid',
  role: 'user',
  contentMarkdown: 'Hello!',
  order: 0
}

const result = messageSchema.safeParse(msg)
```

## Test Coverage

| Package | Statements | Branches | Functions | Lines |
|---------|------------|----------|-----------|-------|
| core-schema | 95% | 90% | 100% | 95% |

## Files Created

```
packages/core-schema/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           # Main exports
│   ├── types/
│   │   ├── message.ts
│   │   ├── conversation.ts
│   │   ├── selection.ts
│   │   ├── theme.ts
│   │   └── export.ts
│   ├── validators/
│   │   ├── message.ts
│   │   └── ...
│   └── utils/
│       ├── create.ts
│       └── validate.ts
└── __tests__/
    ├── message.test.ts
    └── ...
```

## Integration Notes

### For T2 (Adapters)
- Import `Conversation`, `Message` types
- Use `createConversation()` to build result
- Adapter should return `Promise<Conversation>`

### For T3 (Renderer)
- Import `Message`, `Theme`, `Decoration`
- `Message.contentMarkdown` contains raw markdown
- `Theme.tokens` has all styling values

### For T4 (Export)
- Import `Selection`, `PageBreak`, `ExportJob`
- `Selection.pageBreaks` contains manual breaks
- `ExportJob.status` is the state machine state

### For T5 (Apps)
- Import everything needed from core-schema
- Use validators for runtime checks
- Use utility functions for creating entities

## Known Limitations

1. {Any known issues or limitations}
2. {Things that might need revisiting}

## Decisions Made

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Used Zod for validation | Runtime safety + TypeScript inference | io-ts, yup |
| UUID strings for IDs | Simpler than branded types | Branded types, nanoid |

## Questions for Integration

1. {Any questions that came up during implementation}
2. {Suggestions for other tracks}

## Next Steps

After this handoff:
1. T2-T5 can remove interface stubs
2. T2-T5 should `pnpm install` to get new package
3. Integration tests can begin at milestone checkpoints

---

**Handoff complete. Track T{N} is ready for integration.**
```

## Post-Handoff

### Update Dependency Status

Notify other tracks that interfaces are ready:

```markdown
## 📢 T1 Interfaces Published

T2, T3, T4, T5 can now:
1. Remove stub types
2. Import from `@chat2poster/core-schema`
3. Run `pnpm install` to get latest

Available types:
- ✅ Message, Conversation
- ✅ Selection, PageBreak
- ✅ Theme, Decoration
- ✅ ExportJob, ExportParams
```

### Milestone Check

If this handoff completes a milestone requirement:

```markdown
## 🏁 Milestone Progress

**M1 Requirements:**
- [x] T1.2 Core Schema ← Just completed
- [ ] T2.1 Adapter Infra
- [ ] T2.2 ChatGPT DOM
- ...

**M1 Status:** 1/6 requirements met
```
