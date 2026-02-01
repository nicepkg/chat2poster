# Chat2Poster - Task Board

> 5 AI Assistants can work in parallel on different tracks without conflicts.
> Each track is independent with well-defined interfaces.

## Track Status

| Track | Owner | Status | Branch | Started |
|-------|-------|--------|--------|---------|
| T1 | AI-1 | 🟢 Complete | `track-1-infra-schema` | 2025-01-31 |
| T2 | AI-2 | 🟢 Mostly Complete | `track-2-core-adapters` | 2025-01-31 |
| T3 | AI-3 | 🟢 Complete | `track-3-renderer-themes` | 2025-01-31 |
| T4 | AI-4 | 🟢 Complete | `track-4-pagination-export` | 2025-01-31 |
| T5 | AI-5 | 🟢 Complete | `track-5-apps-ui` | 2025-01-31 |

## Track Overview

| Track | Focus Area | Packages/Apps | Dependencies |
|-------|------------|---------------|--------------|
| **T1** | Infrastructure & Schema | `monorepo`, `core-schema` | None |
| **T2** | Adapters | `core-adapters` | T1 (interfaces only) |
| **T3** | Renderer | `shared-ui/components/renderer`, `shared-ui/themes` | T1 (interfaces only) |
| **T4** | Pagination & Export | `core-pagination`, `core-export` | T1 (interfaces only) |
| **T5** | Apps & Integration | `browser-extension`, `web`, `shared-ui` | T1 (interfaces only) |

---

## Track 1: Infrastructure & Schema (AI-1)

> Foundation layer. Defines all shared types and contracts.
> Other tracks can start immediately using interface stubs.
>
> **Note:** `shared-utils` has been merged into `shared-ui/utils` for better code organization.

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
/packages/*/tsup.config.ts
/packages/*/vitest.config.ts
/configs/eslint/shared.mjs
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
// Note: All types use Zod schemas with z.infer<> for type inference

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string  // UUID
  role: MessageRole
  contentMarkdown: string
  order: number
  contentMeta?: ContentMeta  // Optional metadata
}

export type SourceType = 'extension-current' | 'web-share-link' | 'web-manual' | 'web-paste'

export interface Conversation {
  id: string  // UUID
  sourceType: SourceType
  messages: Message[]
  sourceMeta?: SourceMeta
}

export interface Selection {
  conversationId: string
  selectedMessageIds: string[]
  pageBreaks: PageBreak[]
}

// Default values defined in EXPORT_DEFAULTS constant
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

// Device widths: mobile=390px, tablet=768px, desktop=1200px
export const DEVICE_WIDTHS: Record<DeviceType, number>

export interface ExportParams {
  scale: 1 | 2 | 3  // Default: 2
  deviceType: DeviceType  // Default: 'tablet'
  maxPageHeightPx: number  // Default: 4096
  outputMode: 'single' | 'multi-zip'
}

// Note: Window width = DEVICE_WIDTHS[deviceType] - (canvasPaddingPx × 2)
```

### T1.3 - Shared Utilities ✅
- [x] Move utilities into `packages/shared-ui/src/utils`
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

### T2.5 - Share Link Adapters (Web) ✅
- [x] Create `adapters/chatgpt-share-link.ts`
  - [x] Implement share link URL validation (chatgpt.com/share/*, chatgpt.com/s/*)
  - [x] Multiple extraction strategies (HTML parsing, API fallback)
  - [x] Handle __NEXT_DATA__, React streaming, embedded JSON
  - [x] Parse mapping tree and linear_conversation formats
- [x] Create `adapters/claude-share-link.ts`
  - [x] Implement share link URL validation (claude.ai/share/*)
  - [x] Handle Cloudflare protection detection
  - [x] Multiple extraction strategies
  - [x] Parse chat_messages and messages formats
- [x] Create `adapters/gemini-share-link.ts`
  - [x] Implement share link URL validation (gemini.google.com/share/*)
  - [x] Handle WIZ framework data patterns
  - [x] Parse AF_initDataCallback and proto-style data
- [x] Register all adapters in registerBuiltinAdapters()
- [x] Write comprehensive tests (24 tests passing)
- [x] Integrate with web app API route

**Note:** Share link pages use dynamic JavaScript loading. Adapters attempt
multiple extraction strategies but may require browser-based parsing for
some pages. Full conversation extraction may require headless browser support.

**Files created:**
```
packages/core-adapters/src/adapters/chatgpt-share-link.ts
packages/core-adapters/src/adapters/claude-share-link.ts
packages/core-adapters/src/adapters/gemini-share-link.ts
packages/core-adapters/src/__tests__/share-link-adapters.test.ts
```

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
>
> **Note:** `core-renderer` has been merged into `shared-ui/components/renderer` and `themes` has been merged into `shared-ui/themes` for better code reuse.

### T3.1 - Theme System ✅
- [x] Define theme token structure (colors, fonts, spacing) in `shared-ui`
- [x] Create Light theme preset
- [x] Create Dark theme preset
- [x] Create Sunset gradient theme preset
- [x] Implement theme CSS variable injection
- [x] Export theme utilities
- [x] Unified BACKGROUND_PRESETS with 12 preset options

**Files created:**
```
packages/shared-ui/src/themes/index.ts
packages/shared-ui/src/themes/registry.ts
packages/shared-ui/src/themes/css-variables.ts
packages/shared-ui/src/themes/shadows.ts
packages/shared-ui/src/themes/backgrounds.ts
packages/shared-ui/src/themes/presets/index.ts
packages/shared-ui/src/themes/presets/light.ts
packages/shared-ui/src/themes/presets/dark.ts
packages/shared-ui/src/themes/presets/sunset.ts
```

### T3.2 - Core Renderer Setup ✅
- [x] Setup renderer in `packages/shared-ui/src/components/renderer`
- [x] Configure react-markdown with remark/rehype plugins
- [x] Configure Shiki for code highlighting
- [x] Ensure Shadow DOM-compatible styling

**Files created:**
```
packages/shared-ui/src/components/renderer/index.ts
packages/shared-ui/src/components/renderer/ConversationView.tsx
packages/shared-ui/src/components/renderer/MessageItem.tsx
packages/shared-ui/src/components/renderer/CodeBlock.tsx
packages/shared-ui/src/utils/shiki.ts
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
packages/shared-ui/src/components/renderer/index.ts
packages/shared-ui/src/components/renderer/MessageItem.tsx
packages/shared-ui/src/components/renderer/MessageAvatar.tsx
packages/shared-ui/src/components/renderer/CodeBlock.tsx
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
packages/shared-ui/src/components/renderer/ConversationView.tsx
packages/shared-ui/src/components/renderer/ConversationHeader.tsx
packages/shared-ui/src/components/renderer/PageBreakIndicator.tsx
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
packages/shared-ui/src/components/renderer/DecorationFrame.tsx
packages/shared-ui/src/components/renderer/RendererMacOSBar.tsx
packages/shared-ui/src/components/renderer/CanvasContainer.tsx
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
packages/shared-ui/src/components/renderer/PreviewPanel.tsx
packages/shared-ui/src/components/renderer/PageIndicator.tsx
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

### T5.1 - Extension Setup ✅
- [x] Create `apps/browser-extension/package.json`
- [x] Configure WXT for Chrome/Firefox/Edge
- [x] Setup Shadow DOM injection
- [x] Configure content script for ChatGPT/Claude/Gemini pages
- [x] Setup extension icons and manifest

**Files created:**
```
apps/browser-extension/package.json
apps/browser-extension/tsconfig.json
apps/browser-extension/wxt.config.ts
apps/browser-extension/tailwind.config.ts
apps/browser-extension/postcss.config.cjs
apps/browser-extension/eslint.config.mjs
apps/browser-extension/src/entrypoints/content.tsx
apps/browser-extension/src/entrypoints/styles/globals.css
apps/browser-extension/src/components/app.tsx
apps/browser-extension/public/icon-*.svg
```

### T5.2 - Extension Entry Point ✅
- [x] Create floating action button on AI chat pages
- [x] Create side panel trigger
- [x] Implement content script activation logic
- [ ] Handle multiple conversation detection (deferred to integration)

### T5.3 - Editor UI Components ✅
- [x] Create `EditorPanel` main container
- [x] Create `MessageList` with checkboxes
  - [x] Message preview (truncated)
  - [x] Select/deselect functionality
  - [x] "Insert page break here" button
  - [x] Page break line display
- [x] Create `SelectionControls` (Select All / Deselect All)
- [x] Create `ThemeSelector` dropdown/grid
- [x] Create `DecorationControls` form
  - [x] Border radius slider
  - [x] Padding slider
  - [x] Shadow level selector
  - [x] Background picker
  - [x] macOS bar toggle
- [x] Create `ExportControls`
  - [x] Scale selector (1x/2x/3x)
  - [x] Max page height input
  - [x] Auto pagination toggle
  - [x] Export button with status

**Files created:**
```
packages/shared-ui/src/contexts/editor-context.tsx
packages/shared-ui/src/constants/storage-keys.ts
packages/shared-ui/src/components/editor/messages-tab.tsx
packages/shared-ui/src/components/editor/theme-tab.tsx
packages/shared-ui/src/components/editor/export-tab.tsx
packages/shared-ui/src/components/editor/editor-panel.tsx
packages/shared-ui/src/components/editor/editor-tabs.tsx
packages/shared-ui/src/components/editor/editor-header.tsx
packages/shared-ui/src/components/editor/editor-preview.tsx
packages/shared-ui/src/components/editor/export-button.tsx
```

### T5.4 - Extension State Management ✅
- [x] Setup EditorContext (selection, theme, decoration)
- [x] Setup RuntimeContext (loading, error, exportJob)
- [x] Implement state persistence (localStorage for preferences)
- [x] Wire up adapter parsing on panel open (mock data, ready for integration)

### T5.5 - Web App Setup ✅
- [x] Create `apps/web/package.json`
- [x] Setup Next.js with App Router
- [x] Configure Tailwind + PostCSS
- [x] Create basic layout and navigation
- [ ] Setup API routes structure (deferred)

**Files created:**
```
apps/web/package.json
apps/web/tsconfig.json
apps/web/next.config.mjs
apps/web/postcss.config.cjs
apps/web/eslint.config.mjs
apps/web/src/app/layout.tsx
apps/web/src/app/layout-client.tsx
apps/web/src/app/[locale]/layout.tsx
apps/web/src/app/[locale]/page.tsx
apps/web/src/app/[locale]/import/page.tsx
apps/web/src/app/[locale]/manual/page.tsx
apps/web/src/app/[locale]/paste/page.tsx
apps/web/src/app/[locale]/editor/page.tsx
apps/web/src/app/[locale]/api/parse-share-link/route.ts
```

### T5.6 - Web Import Page ✅
- [x] Create `/<locale>/import` page
- [x] Share link input field
- [x] Parse button with loading state
- [x] Error display with fallback options
- [x] Links to Manual Builder and Paste Import

### T5.7 - Web Manual Builder ✅
- [x] Create `/<locale>/manual` page
- [x] Message list form (add/remove/reorder)
- [x] Role selector (defaults to alternating)
- [x] Markdown input per message
- [ ] Live preview (optional, deferred)
- [x] Continue to Editor button

### T5.8 - Web Editor Page ✅
- [x] Create `/<locale>/editor` page
- [x] Message selection & page breaks
- [x] Theme/decoration controls
- [x] Export controls
- [x] Responsive layout (narrow/wide)
- [x] Back to Import link

### T5.9 - API Routes (Web) ✅
- [x] Create `/<locale>/api/parse-share-link` route
- [x] URL validation and error handling
- [x] No data persistence (privacy)
- [x] Logging: error codes, timing, provider
- [x] Rate limiting (10 req/min per IP)
- [x] Implement actual adapter invocation (uses T2.5 share link adapters)

**Files created:**
```
apps/web/src/app/[locale]/api/parse-share-link/route.ts
```

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
  /package.json, /pnpm-workspace.yaml, /tsconfig.json, etc.

AI-2 owns:
  /packages/core-adapters/**

AI-3 owns:
  /packages/shared-ui/src/components/renderer/**
  /packages/shared-ui/src/themes/**

AI-4 owns:
  /packages/core-pagination/**
  /packages/core-export/**

AI-5 owns:
  /apps/browser-extension/**
  /apps/web/**
  /packages/shared-ui/**
```

## Communication Protocol

When a track needs something from another track:
1. Check if interface is defined in `core-schema`
2. If not, request interface definition from AI-1
3. Use mock implementation until real one is ready
4. Integration happens at milestones, not during track work

---

## Build Toolchain

This monorepo uses **pnpm + Turborepo** for package management and task orchestration.

### Common Commands

```bash
# Development
pnpm dev:web            # Start web dev server
pnpm dev:extension      # Start extension dev server
pnpm dev:packages       # Watch mode for all packages

# Building (Turbo manages dependency order and caching)
pnpm build              # Build everything
pnpm build:packages     # Build packages only
pnpm build:web          # Build web app
pnpm build:extension    # Build browser extension

# Quality
pnpm lint               # Lint all packages
pnpm typecheck          # Type check all packages
pnpm test               # Run all tests
```

### Turborepo Benefits

- **Parallel execution**: Independent tasks run concurrently
- **Caching**: Repeat builds skip unchanged packages (shows "FULL TURBO")
- **Task graph**: Packages build before apps automatically

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
# Create shared renderer/themes inside shared-ui
mkdir -p packages/shared-ui/src/components/renderer
mkdir -p packages/shared-ui/src/themes/presets
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
mkdir -p apps/browser-extension/src
mkdir -p apps/web/src/app
```
