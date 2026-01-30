# Chat2Poster

> Turn AI chats into share-worthy posters.
> 把 AI 聊天变成能直接发的海报图。

---

## 🎯 Project Overview

**Chat2Poster** converts AI chat sessions (ChatGPT / Claude / Gemini) into beautiful, export-ready PNG images.

### Core Features (MVP)
- Parse conversations from ChatGPT/Claude/Gemini pages
- Select messages to export (all or specific)
- Apply themes & decorations (radius, shadow, background, macOS bar)
- Auto/manual pagination for long conversations
- Export as PNG (1x/2x/3x) or ZIP for multi-page

### Dual Platform
- **Browser Extension:** WXT + Shadow DOM, works on AI chat pages
- **Web App:** Next.js, supports share links + manual input

---

## 👤 Owner & Preferences

| Key | Value |
|-----|-------|
| **Name** | Jinming Yang |
| **GitHub** | `2214962083` (personal), `nicepkg` (org) |
| **Domain** | `chat2poster.xiaominglab.com` |

### Communication Rules
- **Respond in Chinese** (Jinming prefers it)
- **Code/docs in English**
- **Be concise** - No bullshit, no unnecessary verbosity

### Automation Rules
- **DO automatically:** lint, typecheck, commits, PRs, deploys
- **ASK before:** force push, delete branches, production deploys

### Available CLI Tools
| Tool | Usage |
|------|-------|
| `gh` | GitHub operations |
| `wrangler` | Cloudflare deployment |
| `pnpm` | Package management |

---

## 🏗️ Architecture

### Monorepo Structure

```
chat2poster/
├── packages/
│   ├── core-schema/       # Types + Zod validators
│   ├── core-adapters/     # Parsing adapters (ChatGPT/Claude/Gemini)
│   ├── core-renderer/     # React components for rendering
│   ├── core-pagination/   # Height estimation + page splitting
│   ├── core-export/       # SnapDOM export + ZIP packaging
│   └── themes/            # Preset themes (light/dark/custom)
├── apps/
│   ├── extension-wxt/     # Browser extension
│   └── web-nextjs/        # Website
├── docs/                  # PRD, architecture, specs
├── memories/              # Session & long-term memory
└── TASKS.md               # Task board for parallel AI work
```

### Key Principles
- **DRY:** Core logic implemented once, shared across platforms
- **Adapters:** Plugin-style, new adapters don't modify existing code
- **Privacy:** Never persist user conversations to database
- **Fallback:** SnapDOM primary, SVG fallback for export

---

## 📚 Documentation

| Doc | Purpose |
|-----|---------|
| `docs/prd.md` | Product requirements, user stories, business rules |
| `docs/architecture.md` | Technical architecture, directory structure |
| `docs/data-model.md` | TypeScript types, entity relationships |
| `docs/ui-spec.md` | UI components, states, responsive rules |
| `docs/flows.md` | User flows, state machines, error handling |
| `docs/acceptance.md` | Test cases (Given/When/Then) |
| `docs/config.md` | Project configuration values |

**Read these before making significant changes.**

---

## 🧠 Memory System

### Three-Tier Architecture

```
┌─────────────────────────────────────────────┐
│  Tier 1: CLAUDE.md (this file)              │
│  - Always loaded automatically              │
│  - Project identity & commands              │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│  Tier 2: Long-Term Memory                   │
│  - memories/long-term-memory.md             │
│  - Architecture decisions, user prefs       │
│  - AI can READ/WRITE autonomously           │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│  Tier 3: Session Memories                   │
│  - memories/YYYY-MM-DD-NNN-*.md             │
│  - Per-session context & decisions          │
│  - Explicit save/load via commands          │
└─────────────────────────────────────────────┘
```

### Memory Commands

| Command | Purpose |
|---------|---------|
| `/remember` | Save current session to memory file |
| `/remember "title"` | Save with custom title |
| `/recall` | Load most recent session |
| `/recall last 3` | Load last 3 sessions |
| `/recall "keyword"` | Search by keyword |
| `/recall --list` | List all available memories |
| `/recall --long-term` | Load long-term memory |

### When to Update Long-Term Memory
- New architecture decision made
- User preference discovered
- PRD/doc conflict found
- Important gotcha encountered

---

## 🤖 Multi-AI Collaboration (Track System)

This project supports **5 AI assistants working in parallel**.

### Track Overview

| Track | Focus | Packages | Owner |
|-------|-------|----------|-------|
| **T1** | Infrastructure & Schema | `core-schema`, `shared-utils` | AI-1 |
| **T2** | Adapters | `core-adapters` | AI-2 |
| **T3** | Renderer | `core-renderer`, `themes` | AI-3 |
| **T4** | Pagination & Export | `core-pagination`, `core-export` | AI-4 |
| **T5** | Apps & UI | `extension-wxt`, `web-nextjs` | AI-5 |

### Track Commands

| Command | Purpose |
|---------|---------|
| `/claim-track T1` | Claim a track to work on |
| `/do-track T2` | Execute tasks in your track |
| `/track-status` | View all tracks progress |
| `/sync-interfaces` | Get latest T1 interfaces |
| `/handoff T1` | Complete track & handoff |
| `/resolve-conflict` | Resolve cross-track conflicts |
| `/milestone-check M1` | Check milestone progress |

### Milestones

| Milestone | Description |
|-----------|-------------|
| **M1** | Extension MVP - ChatGPT parsing + single PNG export |
| **M2** | Selection & Decoration - Full theme controls |
| **M3** | Pagination - Auto/manual page breaks + ZIP |
| **M4** | Web App - Share link + manual builder |

### Collaboration Rules
1. **One AI per track** - No cross-track file modifications
2. **Interfaces first** - T1 publishes types, others use them
3. **Mock dependencies** - Use stubs if waiting for other tracks
4. **Update TASKS.md** - Keep status accurate for coordination

---

## ⚡ All Commands

### Task Management
| Command | Description |
|---------|-------------|
| `/claim-track` | Claim a track (T1-T5) |
| `/do-track` | Execute track tasks |
| `/track-status` | View progress |
| `/sync-interfaces` | Sync T1 interfaces |
| `/handoff` | Complete & handoff track |
| `/resolve-conflict` | Resolve conflicts |
| `/milestone-check` | Check milestone status |

### Memory
| Command | Description |
|---------|-------------|
| `/remember` | Save session to memory |
| `/recall` | Load previous sessions |

### Development
| Command | Description |
|---------|-------------|
| `/commit` | Commit with Angular convention |
| `/create-pr` | Create pull request |
| `/review-pr` | Review a pull request |
| `/code-review` | Review code changes |
| `/fix-github-issue` | Fix a GitHub issue |

---

## 🔧 Development Workflow

### Setup
```bash
pnpm install
```

### Common Tasks
```bash
pnpm dev:extension    # Run extension in dev mode
pnpm dev:web          # Run web app in dev mode
pnpm build            # Build all packages
pnpm test             # Run tests
pnpm lint             # Lint code
pnpm typecheck        # Type check
```

### Commit Convention
Angular convention enforced by commitlint:
```
feat(core-schema): add Message type
fix(adapters): handle ChatGPT DOM change
docs: update architecture diagram
```

---

## 🚨 Critical Rules

### DO
- ✅ Read relevant docs before making changes
- ✅ Run lint/typecheck after code changes
- ✅ Update TASKS.md when completing tasks
- ✅ Update long-term memory for important decisions
- ✅ Use interfaces from `core-schema`
- ✅ Write tests for new functionality

### DON'T
- ❌ Modify files outside your track (multi-AI mode)
- ❌ Store user conversations to database
- ❌ Skip lint/typecheck errors
- ❌ Make breaking interface changes without coordination
- ❌ Force push or delete branches without asking
- ❌ Add dependencies without justification

---

## 📊 Key Data Types

```typescript
// Message
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  contentMarkdown: string
  order: number
}

// Conversation
interface Conversation {
  id: string
  sourceType: 'extension-current' | 'web-share-link' | 'web-manual' | 'web-paste'
  messages: Message[]
}

// Selection
interface Selection {
  selectedMessageIds: string[]
  pageBreaks: PageBreak[]
}

// Export
interface ExportParams {
  scale: 1 | 2 | 3
  maxPageHeightPx: number  // default 4096
  canvasWidthPx: number
}
```

See `docs/data-model.md` for complete type definitions.

---

## 🐛 Known Gotchas

1. **ChatGPT DOM changes** - Structure changes frequently, adapters need fallback selectors
2. **Font loading** - Always await `document.fonts.ready` before export
3. **Shadow DOM styling** - Must inject Tailwind into shadow root
4. **Large conversations** - Use virtual scrolling for performance

---

## 🎯 Quick Start for AI

### Starting New Work
```
1. /recall --long-term          # Check persistent knowledge
2. /recall last 2               # Get recent context
3. /track-status                # See what's happening
4. /claim-track T{N}            # Claim your track
5. /do-track T{N}               # Start working
```

### Ending Session
```
1. Update TASKS.md with progress
2. /remember "what you did"     # Save session memory
3. Update long-term memory if needed
4. /handoff T{N}                # If track complete
```

### When Stuck
```
1. Check docs/ for requirements
2. /recall "keyword"            # Search past decisions
3. Check memories/long-term-memory.md
4. Ask user for clarification
```

---

## 📁 File Ownership (Multi-AI Mode)

```
AI-1 (T1):
  packages/core-schema/**
  packages/shared-utils/**
  Root config files

AI-2 (T2):
  packages/core-adapters/**

AI-3 (T3):
  packages/core-renderer/**
  packages/themes/**

AI-4 (T4):
  packages/core-pagination/**
  packages/core-export/**

AI-5 (T5):
  apps/extension-wxt/**
  apps/web-nextjs/**
```

**Shared (coordinate changes):**
- TASKS.md
- memories/long-term-memory.md
- docs/*.md

---

*Last updated: 2024-01-31*
