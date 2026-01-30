# Chat2Poster - Task Board

> 5 AI Assistants can work in parallel on different tracks without conflicts.
> Each track is independent with well-defined interfaces.

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

### T1.1 - Monorepo Setup
- [ ] Initialize pnpm workspace monorepo structure
- [ ] Configure TypeScript project references
- [ ] Setup shared tsconfig, eslint, prettier configs
- [ ] Configure build pipeline (tsup or unbuild)
- [ ] Setup Vitest for unit testing

**Files to create:**
```
/package.json (workspace root)
/pnpm-workspace.yaml
/tsconfig.json (base)
/eslint.config.js
/.prettierrc
/vitest.config.ts
```

### T1.2 - Core Schema Package
- [ ] Create `packages/core-schema/package.json`
- [ ] Define Conversation type with Zod validation
- [ ] Define Message type (role: user/assistant/system)
- [ ] Define Selection type (selectedMessageIds, pageBreaks)
- [ ] Define PageBreak type
- [ ] Define Theme type and tokens structure
- [ ] Define Decoration type (radius, padding, shadow, background, macosBar)
- [ ] Define ExportJob type and status enum
- [ ] Define ExportParams type (scale, canvasPreset, maxPageHeight)
- [ ] Define error types and codes (E-PARSE-*, E-EXPORT-*)
- [ ] Export all types and validators
- [ ] Write unit tests for validators

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

### T1.3 - Shared Utilities
- [ ] Create `packages/shared-utils/package.json`
- [ ] UUID generation utility
- [ ] Date formatting utility
- [ ] File naming utility (for exports)
- [ ] Height estimation helpers (stub, actual impl in T4)

---

## Track 2: Adapters (AI-2)

> Parsing layer. Converts various inputs to Conversation schema.
> Can work immediately using T1 interfaces as stubs.

### T2.1 - Adapter Infrastructure
- [ ] Create `packages/core-adapters/package.json`
- [ ] Define Adapter interface:
  ```typescript
  interface Adapter {
    id: string
    version: string
    canHandle(input: AdapterInput): boolean
    parse(input: AdapterInput): Promise<Conversation>
  }
  ```
- [ ] Implement adapter registry (registerAdapter, getAdapters)
- [ ] Implement parseWithAdapters() function
- [ ] Define input types: DOMInput, ShareLinkInput, ManualInput, PasteTextInput
- [ ] Write registry tests

### T2.2 - ChatGPT DOM Adapter (Extension)
- [ ] Create `adapters/chatgpt-dom.ts`
- [ ] Implement DOM selectors for ChatGPT conversation page
- [ ] Extract messages from DOM structure
- [ ] Handle code blocks, images, markdown content
- [ ] Implement canHandle() for ChatGPT page detection
- [ ] Write fixture-based tests (mock DOM)
- [ ] Document known DOM structure patterns

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

### T3.1 - Theme System
- [ ] Create `packages/themes/package.json`
- [ ] Define theme token structure (colors, fonts, spacing)
- [ ] Create Light theme preset
- [ ] Create Dark theme preset
- [ ] Create 2-3 additional presets (optional)
- [ ] Implement theme CSS variable injection
- [ ] Export theme utilities

### T3.2 - Core Renderer Setup
- [ ] Create `packages/core-renderer/package.json`
- [ ] Setup React with TypeScript
- [ ] Configure react-markdown with remark/rehype plugins
- [ ] Configure Shiki for code highlighting
- [ ] Setup CSS-in-JS or Tailwind (scoped styles)

### T3.3 - Message Components
- [ ] Create `MessageItem` component
  - [ ] Handle user/assistant/system role styling
  - [ ] Render markdown content
  - [ ] Render code blocks with Shiki highlighting
  - [ ] Handle inline code
  - [ ] Handle images (with loading state)
  - [ ] Implement React.memo for performance
- [ ] Create `MessageAvatar` component
- [ ] Create `CodeBlock` component with copy button

### T3.4 - Conversation Components
- [ ] Create `ConversationView` component
  - [ ] Accept messages, theme, decoration, selection props
  - [ ] Render selected messages in order
  - [ ] Handle page break indicators
  - [ ] Implement virtual scrolling for long lists (optional)
- [ ] Create `ConversationHeader` component (optional title)

### T3.5 - Decoration Components
- [ ] Create `DecorationFrame` component
  - [ ] Apply border radius
  - [ ] Apply padding
  - [ ] Apply shadow (multiple levels)
  - [ ] Apply background (solid/gradient)
  - [ ] Render macOS traffic light bar
- [ ] Create `MacOSBar` component
- [ ] Create `CanvasContainer` component (wrapper for export)

### T3.6 - Preview Components
- [ ] Create `PreviewPanel` component
  - [ ] Combine DecorationFrame + ConversationView
  - [ ] Handle zoom/scale for preview
  - [ ] Show height estimation
  - [ ] Show pagination warning when > 6000px
- [ ] Create `PageIndicator` component

---

## Track 4: Pagination & Export (AI-4)

> Export layer. Handles splitting and image generation.
> Can work immediately using T1 interfaces as stubs.

### T4.1 - Pagination Logic
- [ ] Create `packages/core-pagination/package.json`
- [ ] Implement height estimation for messages
  - [ ] Estimate based on character count
  - [ ] Account for code blocks
  - [ ] Account for images
- [ ] Implement manual pagination (respect PageBreaks)
- [ ] Implement auto pagination algorithm
  - [ ] Greedy bin-packing approach
  - [ ] Respect maxPageHeightPx constraint
  - [ ] Generate PageBreaks at optimal positions
- [ ] Implement page generation: `(selection, params) => messageIds[][]`
- [ ] Ensure deterministic output (same input = same pages)
- [ ] Write comprehensive unit tests

### T4.2 - Export Engine Setup
- [ ] Create `packages/core-export/package.json`
- [ ] Setup @zumer/snapdom integration
- [ ] Implement font loading wait (`document.fonts.ready`)
- [ ] Implement image loading check
- [ ] Define export options interface

### T4.3 - Single Page Export
- [ ] Implement `exportToPng(element, options)` function
- [ ] Apply scale factor (1x/2x/3x)
- [ ] Handle SnapDOM errors
- [ ] Implement SVG fallback path
- [ ] Return Blob or data URL

### T4.4 - Multi-Page Export
- [ ] Implement `exportPages(pages, options)` function
- [ ] Iterate through pages and export each
- [ ] Track progress for UI feedback
- [ ] Handle partial failures

### T4.5 - ZIP Packaging
- [ ] Integrate fflate or jszip
- [ ] Implement `packageAsZip(blobs, options)` function
- [ ] File naming: `001.png`, `002.png`, etc.
- [ ] Optional: Include metadata.json
- [ ] Trigger browser download

### T4.6 - Export Job Manager
- [ ] Implement ExportJob state machine
  - [ ] draft → rendering → success/failed
- [ ] Track job progress
- [ ] Handle cancellation
- [ ] Preserve state on failure (for retry)
- [ ] Emit events for UI updates

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
