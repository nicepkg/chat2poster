# Chat2Poster - Task Board

> 5 AI Assistants can work in parallel on different tracks without conflicts.
> Each track is independent with well-defined interfaces.

## Track Status

| Track | Owner | Status | Branch | Started |
|-------|-------|--------|--------|---------|
| T1 | AI-1 | 🟢 Complete | `track-1-infra-schema` | 2025-01-31 |
| T2 | AI-2 | 🟡 Partial Complete | `track-2-core-adapters` | 2025-01-31 |
| T3 | AI-3 | 🟢 Complete | `track-3-renderer-themes` | 2025-01-31 |
| T4 | AI-4 | 🟢 Complete | `track-4-pagination-export` | 2025-01-31 |
| T5 | AI-5 | 🔵 In Progress | `track-5-apps-ui` | 2025-01-31 |

## Track Overview

| Track | Focus Area | Packages/Apps | Dependencies |
|-------|------------|---------------|--------------|
| **T1** | Infrastructure & Schema | `monorepo`, `core-schema` | None |
| **T2** | Adapters | `core-adapters` | T1 (interfaces only) |
| **T3** | Renderer | `core-renderer`, `themes` | T1 (interfaces only) |
| **T4** | Pagination & Export | `core-pagination`, `core-export` | T1 (interfaces only) |
| **T5** | Apps & Integration | `extension-wxt`, `web-nextjs` | T1 (interfaces only) |

---

## Track 1: Infrastructure & Schema (AI-1)

> Foundation layer. Defines all shared types and contracts.
> Other tracks can start immediately using interface stubs.

### T1.1 - Monorepo Setup ✅
- [x] Initialize pnpm workspace monorepo structure
- [x] Configure TypeScript project references
- [x] Setup shared tsconfig, eslint, prettier configs
- [x] Configure build pipeline (tsup)
- [x] Setup Vitest for unit testing

**Files created:**
```
/pnpm-workspace.yaml (updated)
/tsconfig.json (updated)
/tsconfig.base.json (new)
/vitest.workspace.ts (new)
/packages/*/package.json
/packages/*/tsconfig.json
/packages/*/tsconfig.build.json
/packages/*/tsup.config.ts
/packages/*/vitest.config.ts
```

### T1.2 - Core Schema Package ✅
- [x] Create `packages/core-schema/package.json`
- [x] Define Conversation type with Zod validation
- [x] Define Message type (role: user/assistant/system)
- [x] Define Selection type (selectedMessageIds, pageBreaks)
- [x] Define PageBreak type
- [x] Define Theme type and tokens structure
- [x] Define Decoration type (radius, padding, shadow, background, macosBar)
- [x] Define ExportJob type and status enum
- [x] Define ExportParams type (scale, canvasPreset, maxPageHeight)
- [x] Define error types and codes (E-PARSE-*, E-EXPORT-*)
- [x] Define Adapter interface
- [x] Export all types and validators
- [ ] Write unit tests for validators (deferred)

**Key interfaces (for other tracks to use immediately):**
```typescript
// packages/core-schema/src/index.ts
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  contentMarkdown: string
  order: number
}

export interface Conversation {
  id: string
  sourceType: 'extension-current' | 'web-share-link' | 'web-manual' | 'web-paste'
  messages: Message[]
  sourceMeta?: SourceMeta
}

export interface Selection {
  selectedMessageIds: string[]
  pageBreaks: PageBreak[]
}

export interface ExportParams {
  scale: 1 | 2 | 3
  maxPageHeightPx: number
  canvasWidthPx: number
}
```

### T1.3 - Shared Utilities ✅
- [x] Create `packages/shared-utils/package.json`
- [x] UUID generation utility
- [x] Date formatting utility
- [x] File naming utility (for exports)
- [ ] Height estimation helpers (stub, actual impl in T4) - deferred to T4

---

## Track 2: Adapters (AI-2)

> Parsing layer. Converts various inputs to Conversation schema.
> Can work immediately using T1 interfaces as stubs.

### T2.1 - Adapter Infrastructure ✅
- [x] Create `packages/core-adapters/package.json`
- [x] Define Adapter interface (using core-schema's Adapter interface)
- [x] Implement adapter registry (registerAdapter, getAdapters, unregisterAdapter)
- [x] Implement parseWithAdapters() function
- [x] Input types defined in core-schema: DOMInput, ShareLinkInput, ManualInput, PasteTextInput
- [x] Write registry tests (14 tests passing)

**Files created:**
```
packages/core-adapters/package.json
packages/core-adapters/tsconfig.json
packages/core-adapters/tsconfig.build.json
packages/core-adapters/tsup.config.ts
packages/core-adapters/vitest.config.ts
packages/core-adapters/src/index.ts
packages/core-adapters/src/registry.ts
packages/core-adapters/src/base.ts
packages/core-adapters/src/adapters/index.ts
packages/core-adapters/src/__tests__/registry.test.ts
```

### T2.2 - ChatGPT DOM Adapter (Extension) ✅
- [x] Create `adapters/chatgpt-dom.ts`
- [x] Implement DOM selectors for ChatGPT conversation page
- [x] Extract messages from DOM structure
- [x] Handle code blocks, images, markdown content (HTML to Markdown conversion)
- [x] Implement canHandle() for ChatGPT page detection
- [x] Write fixture-based tests (mock DOM with jsdom, 15 tests passing)
- [x] Document known DOM structure patterns (in code comments)

**Files created:**
```
packages/core-adapters/src/adapters/chatgpt-dom.ts
packages/core-adapters/src/__tests__/chatgpt-dom.test.ts
```

### T2.3 - Claude DOM Adapter (Extension)
- [ ] Create `adapters/claude-dom.ts`
- [ ] Implement DOM selectors for Claude conversation page
- [ ] Handle Claude-specific message structure
- [ ] Write fixture-based tests

### T2.4 - Gemini DOM Adapter (Extension)
- [ ] Create `adapters/gemini-dom.ts`
- [ ] Implement DOM selectors for Gemini conversation page
- [ ] Write fixture-based tests

### T2.5 - ChatGPT Share Link Adapter (Web)
- [ ] Create `adapters/chatgpt-share-link.ts`
- [ ] Implement share link URL validation
- [ ] Fetch and parse share page content
- [ ] Extract messages from share page structure
- [ ] Handle rate limiting and errors
- [ ] Write tests with mock responses

### T2.6 - Manual Input Adapter (Web)
- [ ] Create `adapters/manual-input.ts`
- [ ] Simple pass-through adapter
- [ ] Validate manual input structure

### T2.7 - Paste Text Adapter (Web)
- [ ] Create `adapters/paste-text.ts`
- [ ] Parse plain text into messages (detect role patterns)
- [ ] Parse markdown into messages
- [ ] Handle common paste formats

---

## Track 3: Renderer (AI-3)

> Rendering layer. React components for displaying conversations.
> Can work immediately using T1 interfaces as stubs.

### T3.1 - Theme System ✅
- [x] Create `packages/themes/package.json`
- [x] Define theme token structure (colors, fonts, spacing)
- [x] Create Light theme preset
- [x] Create Dark theme preset
- [ ] Create 2-3 additional presets (optional)
- [x] Implement theme CSS variable injection
- [x] Export theme utilities

**Files created:**
```
packages/themes/package.json
packages/themes/tsconfig.json
packages/themes/tsconfig.build.json
packages/themes/tsup.config.ts
packages/themes/vitest.config.ts
packages/themes/src/index.ts
packages/themes/src/registry.ts
packages/themes/src/css-variables.ts
packages/themes/src/presets/index.ts
packages/themes/src/presets/light.ts
packages/themes/src/presets/dark.ts
```

### T3.2 - Core Renderer Setup ✅
- [x] Create `packages/core-renderer/package.json`
- [x] Setup React with TypeScript
- [x] Configure react-markdown with remark/rehype plugins
- [x] Configure Shiki for code highlighting
- [x] Setup CSS-in-JS (inline styles + CSS variables for Shadow DOM compatibility)

**Files created:**
```
packages/core-renderer/package.json
packages/core-renderer/tsconfig.json
packages/core-renderer/tsconfig.build.json
packages/core-renderer/tsup.config.ts
packages/core-renderer/vitest.config.ts
packages/core-renderer/src/index.ts
packages/core-renderer/src/utils/index.ts
packages/core-renderer/src/utils/shiki.ts
```

### T3.3 - Message Components ✅
- [x] Create `MessageItem` component
  - [x] Handle user/assistant/system role styling
  - [x] Render markdown content
  - [x] Render code blocks with Shiki highlighting
  - [x] Handle inline code
  - [x] Handle images (with loading state)
  - [x] Implement React.memo for performance
- [x] Create `MessageAvatar` component
- [x] Create `CodeBlock` component with copy button

**Files created:**
```
packages/core-renderer/src/components/index.ts
packages/core-renderer/src/components/MessageItem.tsx
packages/core-renderer/src/components/MessageAvatar.tsx
packages/core-renderer/src/components/CodeBlock.tsx
```

### T3.4 - Conversation Components ✅
- [x] Create `ConversationView` component
  - [x] Accept messages, theme, decoration, selection props
  - [x] Render selected messages in order
  - [x] Handle page break indicators
  - [ ] Implement virtual scrolling for long lists (optional, deferred)
- [x] Create `ConversationHeader` component (optional title)
- [x] Create `PageBreakIndicator` component

**Files created:**
```
packages/core-renderer/src/components/ConversationView.tsx
packages/core-renderer/src/components/ConversationHeader.tsx
packages/core-renderer/src/components/PageBreakIndicator.tsx
```

### T3.5 - Decoration Components ✅
- [x] Create `DecorationFrame` component
  - [x] Apply border radius
  - [x] Apply padding
  - [x] Apply shadow (multiple levels)
  - [x] Apply background (solid/gradient/image)
  - [x] Render macOS traffic light bar
- [x] Create `MacOSBar` component
- [x] Create `CanvasContainer` component (wrapper for export)

**Files created:**
```
packages/core-renderer/src/components/DecorationFrame.tsx
packages/core-renderer/src/components/MacOSBar.tsx
packages/core-renderer/src/components/CanvasContainer.tsx
```

### T3.6 - Preview Components ✅
- [x] Create `PreviewPanel` component
  - [x] Combine DecorationFrame + ConversationView
  - [x] Handle zoom/scale for preview
  - [x] Show height estimation
  - [x] Show pagination warning when > 6000px
- [x] Create `PageIndicator` component

**Files created:**
```
packages/core-renderer/src/components/PreviewPanel.tsx
packages/core-renderer/src/components/PageIndicator.tsx
```

---

## Track 4: Pagination & Export (AI-4)

> Export layer. Handles splitting and image generation.
> Can work immediately using T1 interfaces as stubs.

### T4.1 - Pagination Logic ✅
- [x] Create `packages/core-pagination/package.json`
- [x] Implement height estimation for messages
  - [x] Estimate based on character count
  - [x] Account for code blocks
  - [x] Account for images
- [x] Implement manual pagination (respect PageBreaks)
- [x] Implement auto pagination algorithm
  - [x] Greedy bin-packing approach
  - [x] Respect maxPageHeightPx constraint
  - [x] Generate PageBreaks at optimal positions
- [x] Implement page generation: `(selection, params) => messageIds[][]`
- [x] Ensure deterministic output (same input = same pages)
- [x] Write comprehensive unit tests (31 tests)

**Files created:**
```
packages/core-pagination/package.json
packages/core-pagination/tsconfig.json
packages/core-pagination/tsconfig.build.json
packages/core-pagination/tsup.config.ts
packages/core-pagination/vitest.config.ts
packages/core-pagination/src/index.ts
packages/core-pagination/src/height-estimation.ts
packages/core-pagination/src/paginator.ts
packages/core-pagination/src/height-estimation.test.ts
packages/core-pagination/src/paginator.test.ts
```

### T4.2 - Export Engine Setup ✅
- [x] Create `packages/core-export/package.json`
- [x] Setup @zumer/snapdom integration
- [x] Implement font loading wait (`document.fonts.ready`)
- [x] Implement image loading check
- [x] Define export options interface

**Files created:**
```
packages/core-export/package.json
packages/core-export/tsconfig.json
packages/core-export/tsconfig.build.json
packages/core-export/tsup.config.ts
packages/core-export/vitest.config.ts
packages/core-export/src/index.ts
packages/core-export/src/resource-loader.ts
packages/core-export/src/exporter.ts
```

### T4.3 - Single Page Export ✅
- [x] Implement `exportToPng(element, options)` function
- [x] Apply scale factor (1x/2x/3x)
- [x] Handle SnapDOM errors
- [ ] Implement SVG fallback path (deferred - SnapDOM handles fallback internally)
- [x] Return Blob or data URL

### T4.4 - Multi-Page Export ✅
- [x] Implement `exportPages(pages, options)` function
- [x] Iterate through pages and export each
- [x] Track progress for UI feedback
- [x] Handle partial failures

**Files created:**
```
packages/core-export/src/multi-page-exporter.ts
```

### T4.5 - ZIP Packaging ✅
- [x] Integrate fflate
- [x] Implement `packageAsZip(blobs, options)` function
- [x] File naming: `page_001.png`, `page_002.png`, etc.
- [x] Include metadata.json
- [x] Trigger browser download

**Files created:**
```
packages/core-export/src/zip-packager.ts
packages/core-export/src/zip-packager.test.ts
```

### T4.6 - Export Job Manager ✅
- [x] Implement ExportJob state machine
  - [x] draft → rendering → success/failed
- [x] Track job progress
- [x] Handle cancellation
- [x] Preserve state on failure (for retry)
- [x] Emit events for UI updates (38 tests)

**Files created:**
```
packages/core-export/src/export-job-manager.ts
packages/core-export/src/export-job-manager.test.ts
```

---

## Track 5: Apps & UI (AI-5)

> Application layer. User-facing interfaces.
> Can work immediately using mock data and T1 interfaces.

### T5.1 - Extension Setup
- [ ] Create `apps/extension-wxt/package.json`
- [ ] Configure WXT for Chrome/Firefox/Edge
- [ ] Setup Shadow DOM injection
- [ ] Configure content script for ChatGPT/Claude/Gemini pages
- [ ] Setup extension icons and manifest

### T5.2 - Extension Entry Point
- [ ] Create floating action button on AI chat pages
- [ ] Create side panel trigger
- [ ] Implement content script activation logic
- [ ] Handle multiple conversation detection

### T5.3 - Editor UI Components
- [ ] Create `EditorPanel` main container
- [ ] Create `MessageList` with checkboxes
  - [ ] Message preview (truncated)
  - [ ] Select/deselect functionality
  - [ ] "Insert page break here" button
  - [ ] Page break line display
- [ ] Create `SelectionControls` (Select All / Deselect All)
- [ ] Create `ThemeSelector` dropdown/grid
- [ ] Create `DecorationControls` form
  - [ ] Border radius slider
  - [ ] Padding slider
  - [ ] Shadow level selector
  - [ ] Background picker
  - [ ] macOS bar toggle
- [ ] Create `ExportControls`
  - [ ] Scale selector (1x/2x/3x)
  - [ ] Max page height input
  - [ ] Auto pagination toggle
  - [ ] Export button with status

### T5.4 - Extension State Management
- [ ] Setup EditorContext (selection, theme, decoration)
- [ ] Setup RuntimeContext (loading, error, exportJob)
- [ ] Implement state persistence (localStorage for preferences)
- [ ] Wire up adapter parsing on panel open

### T5.5 - Web App Setup
- [ ] Create `apps/web-nextjs/package.json`
- [ ] Setup Next.js with App Router
- [ ] Configure Tailwind + shadcn/ui
- [ ] Create basic layout and navigation
- [ ] Setup API routes structure

### T5.6 - Web Import Page
- [ ] Create `/` or `/import` page
- [ ] Share link input field
- [ ] Parse button with loading state
- [ ] Error display with fallback options
- [ ] Links to Manual Builder and Paste Import

### T5.7 - Web Manual Builder
- [ ] Create `/manual` page
- [ ] Message list form (add/remove/reorder)
- [ ] Role selector (defaults to alternating)
- [ ] Markdown input per message
- [ ] Live preview (optional)
- [ ] Continue to Editor button

### T5.8 - Web Editor Page
- [ ] Create `/editor` page
- [ ] Reuse Editor UI components from extension
- [ ] Responsive layout (narrow/wide)
- [ ] Back to Import link

### T5.9 - API Routes (Web)
- [ ] Create `/api/parse-share-link` route
- [ ] Implement adapter invocation
- [ ] Ensure no data persistence (privacy)
- [ ] Log only: error codes, timing, adapter version
- [ ] Rate limiting (optional)

---

## Integration Milestones

### M1: Extension MVP (Single Export)
**Requires:** T1.2, T2.1, T2.2, T3.2-T3.5, T4.2-T4.3, T5.1-T5.4
- ChatGPT DOM parsing works
- Basic theme (light/dark)
- Single PNG export at 2x
- No pagination yet

### M2: Selection & Decoration
**Requires:** M1 + T3.1, T5.3 (full)
- Message selection works
- All decoration controls work
- Theme switching works
- Height warning shows

### M3: Pagination & Multi-Export
**Requires:** M2 + T4.1, T4.4, T4.5, T5.3 (pagination UI)
- Manual page breaks work
- Auto pagination works
- ZIP export works

### M4: Web App Complete
**Requires:** M3 + T2.5-T2.7, T5.5-T5.9
- Share link parsing works
- Manual builder works
- Paste import works
- Full editor on web

---

## Task Assignment Rules

1. **Each AI works on ONE track** - No cross-track work to avoid conflicts
2. **Use interfaces as contracts** - T1 publishes interfaces first, others use them
3. **Mock dependencies** - Use stubs/mocks for cross-track dependencies
4. **Test in isolation** - Each package has its own tests
5. **Document APIs** - Export JSDoc comments for all public APIs

## File Ownership

```
AI-1 owns:
  /packages/core-schema/**
  /packages/shared-utils/**
  /package.json, /pnpm-workspace.yaml, /tsconfig.json, etc.

AI-2 owns:
  /packages/core-adapters/**

AI-3 owns:
  /packages/core-renderer/**
  /packages/themes/**

AI-4 owns:
  /packages/core-pagination/**
  /packages/core-export/**

AI-5 owns:
  /apps/extension-wxt/**
  /apps/web-nextjs/**
```

## Communication Protocol

When a track needs something from another track:
1. Check if interface is defined in `core-schema`
2. If not, request interface definition from AI-1
3. Use mock implementation until real one is ready
4. Integration happens at milestones, not during track work

---

## Quick Start for Each AI

### AI-1 Start Command
```bash
# Initialize monorepo, then implement core-schema
pnpm init && mkdir -p packages/core-schema/src
```

### AI-2 Start Command
```bash
# Create adapters package, define interface, implement ChatGPT adapter
mkdir -p packages/core-adapters/src/adapters
```

### AI-3 Start Command
```bash
# Create renderer and themes packages
mkdir -p packages/core-renderer/src/components
mkdir -p packages/themes/src/presets
```

### AI-4 Start Command
```bash
# Create pagination and export packages
mkdir -p packages/core-pagination/src
mkdir -p packages/core-export/src
```

### AI-5 Start Command
```bash
# Create extension and web app
mkdir -p apps/extension-wxt/src
mkdir -p apps/web-nextjs/src/app
```
