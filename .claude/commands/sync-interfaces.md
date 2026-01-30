---
name: sync-interfaces
description: Sync/publish interfaces from T1 for other tracks to use
---

# Sync Interfaces

## Your Task

Publish or sync interfaces from track **$ARGUMENTS** (default: T1).

## Context

T1 (core-schema) defines interfaces that T2-T5 depend on.
This command ensures all tracks have access to latest interfaces.

## Execution Flow

### 1. Check T1 Status
```
Read TASKS.md T1.2 (Core Schema):
- Which types are implemented?
- Which are still pending?
```

### 2. Generate Interface Summary

Read `packages/core-schema/src/index.ts` and extract exports.

### 3. Create Interface Document

## Output Format

```markdown
# 📤 Interface Sync Report

**Source:** packages/core-schema
**Version:** 0.1.0
**Updated:** {timestamp}

## Available Interfaces

### Core Types (Ready ✅)

```typescript
// Conversation & Message
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  contentMarkdown: string
  order: number
  contentMeta?: {
    containsCodeBlock?: boolean
    containsImage?: boolean
    approxHeightPx?: number
  }
}

export interface Conversation {
  id: string
  sourceType: 'extension-current' | 'web-share-link' | 'web-manual' | 'web-paste'
  messages: Message[]
  sourceMeta?: SourceMeta
  createdAt: string
  updatedAt: string
}

// Selection & Pagination
export interface Selection {
  selectedMessageIds: string[]
  pageBreaks: PageBreak[]
}

export interface PageBreak {
  id: string
  afterMessageId: string
  label?: string
}
```

### Theme Types (Ready ✅)

```typescript
export interface Theme {
  id: string
  name: string
  mode: 'light' | 'dark'
  tokens: ThemeTokens
  decorationDefaults: DecorationDefaults
}

export interface Decoration {
  canvasPaddingPx: number
  canvasRadiusPx: number
  shadowLevel: 0 | 1 | 2 | 3
  backgroundType: 'solid' | 'gradient'
  backgroundValue: string
  macosBarEnabled: boolean
}
```

### Export Types (Ready ✅)

```typescript
export interface ExportParams {
  scale: 1 | 2 | 3
  maxPageHeightPx: number
  canvasWidthPx: number
  outputMode: 'single' | 'multi-zip'
}

export interface ExportJob {
  id: string
  status: 'draft' | 'rendering' | 'success' | 'failed'
  params: ExportParams
  error?: ExportError
}

export type ExportErrorCode =
  | 'E-EXPORT-SNAPDOM'
  | 'E-EXPORT-SVG'
  | 'E-EXPORT-RESOURCE'
  | 'E-EXPORT-ZIP'
```

### Pending Types (Not Ready ⚪)

- `AdapterInput` - T2 should define this
- `PaginationResult` - T4 should define this

## Import Instructions

### For T2 (Adapters)
```typescript
import type { Conversation, Message, SourceMeta } from '@chat2poster/core-schema'
```

### For T3 (Renderer)
```typescript
import type { Message, Theme, Decoration, Selection } from '@chat2poster/core-schema'
```

### For T4 (Export)
```typescript
import type { Selection, PageBreak, ExportParams, ExportJob } from '@chat2poster/core-schema'
```

### For T5 (Apps)
```typescript
import type {
  Conversation, Message, Selection,
  Theme, Decoration, ExportJob
} from '@chat2poster/core-schema'
```

## Stub Template (If T1 Not Ready)

If you need to start before T1 publishes, use this stub:

```typescript
// packages/{your-package}/src/types-stub.ts
// TODO: Replace with import from @chat2poster/core-schema

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  contentMarkdown: string
  order: number
}

export interface Conversation {
  id: string
  sourceType: string
  messages: Message[]
}

// ... add what you need
```

## Breaking Changes

| Change | Affected Tracks | Migration |
|--------|-----------------|-----------|
| None yet | - | - |

## Notes
- All types use `string` for IDs (UUID format recommended)
- Dates are ISO 8601 strings
- Zod validators available: `messageSchema`, `conversationSchema`, etc.
```

## For Non-T1 Tracks

If called from T2-T5, show what interfaces are needed and their status:

```markdown
# 📥 Interface Requirements for T{N}

## Required from T1

| Interface | Status | Workaround |
|-----------|--------|------------|
| Message | ✅ Ready | Can import |
| Conversation | ✅ Ready | Can import |
| Theme | 🔵 In Progress | Use stub |
| ExportParams | ⚪ Pending | Use stub |

## Action

1. Import ready interfaces from `@chat2poster/core-schema`
2. Use stubs for pending interfaces
3. Re-sync when T1 publishes updates
```
