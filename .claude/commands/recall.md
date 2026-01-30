---
name: recall
description: Load previous session memories into context
---

# Recall Memory

## Your Task

Load previous session memories based on **$ARGUMENTS**.

## Query Types

### No Arguments → Load Most Recent
```
/recall
→ Load the most recent session memory
```

### "last N" → Load Last N Sessions
```
/recall last 3
→ Load the 3 most recent session memories
```

### "keyword" → Search by Keyword
```
/recall adapter
→ Search memory files for "adapter", load matching ones
```

### "--list" → List Available Memories
```
/recall --list
→ Show all available memory files without loading
```

### "--long-term" → Load Long-Term Memory
```
/recall --long-term
→ Explicitly load and display long-term-memory.md
```

### Specific File
```
/recall 2024-01-31-001
→ Load specific memory file
```

## Execution Flow

### 1. Parse Query

Determine query type from $ARGUMENTS.

### 2. Find Files

```bash
# List all memory files
ls -la memories/*.md

# Search by keyword
grep -l "keyword" memories/*.md
```

### 3. Load and Summarize

For each memory file:
- Read content
- Extract key points
- Present to user

## Output Formats

### List Mode (--list)

```markdown
## 📚 Available Memories

### Long-Term Memory
- `memories/long-term-memory.md` - Persistent project knowledge

### Session Memories (5 files)

| Date | # | Title | Track |
|------|---|-------|-------|
| 2024-01-31 | 003 | export-engine | T4 |
| 2024-01-31 | 002 | chatgpt-adapter | T2 |
| 2024-01-31 | 001 | core-schema-setup | T1 |
| 2024-01-30 | 002 | project-setup | - |
| 2024-01-30 | 001 | initial-planning | - |

**Usage:**
- `/recall` - Load most recent
- `/recall last 3` - Load last 3
- `/recall adapter` - Search by keyword
- `/recall 2024-01-31-001` - Load specific file
```

### Single Memory Load

```markdown
## 📖 Loaded: 2024-01-31-001-core-schema-setup.md

### Goal
Implement core-schema package with all shared types

### Key Decisions
1. **Zod for validation** - Runtime safety + TS inference
2. **UUID strings for IDs** - Simpler than branded types

### Problems Solved
- TypeScript strict mode issues with optional fields

### Relevant to Current Work
- Types are ready: `Message`, `Conversation`, `Selection`
- T2-T5 can now import from `@chat2poster/core-schema`

### Next Steps from This Session
- [ ] T2 implement adapter registry
- [ ] T3 create MessageItem component

---

**Continue from here?** This session left off at T1.2 completion.
```

### Multiple Memories Load

```markdown
## 📖 Loaded 3 Memories

### 1. 2024-01-31-003-export-engine (T4)
- Implemented SnapDOM export
- Font loading issue resolved
- **Key:** Always use `document.fonts.ready`

### 2. 2024-01-31-002-chatgpt-adapter (T2)
- ChatGPT DOM selectors implemented
- **Gotcha:** DOM structure changes frequently

### 3. 2024-01-31-001-core-schema-setup (T1)
- All types implemented with Zod
- **Decision:** UUID strings for IDs

---

### Patterns Across Sessions
- Font/resource loading is a recurring theme
- ChatGPT DOM instability is a known risk

### Suggested Focus
Based on these sessions, priority is:
1. Complete T4 export reliability
2. Add fallback selectors for T2
```

### Search Results

```markdown
## 🔍 Search Results for "adapter"

Found 2 matching memories:

### 1. 2024-01-31-002-chatgpt-adapter.md
> "Implemented ChatGPT DOM **adapter** with selector fallbacks..."

### 2. 2024-01-30-001-initial-planning.md
> "Discussed **adapter** architecture, decided on registry pattern..."

---

Load these? (Showing summaries above)
```

## Integration with Long-Term Memory

When loading session memories, also check:
- Are there related entries in long-term-memory.md?
- Should any session learnings be promoted to long-term?

```markdown
## 💡 Related Long-Term Memory

From `long-term-memory.md`:

**G-001: ChatGPT DOM Structure**
> ChatGPT frequently changes DOM structure
> Workaround: Adapter versioning, fallback selectors

This relates to session 2024-01-31-002.
```

## Tips

- Load relevant memories before starting complex work
- Use search to find specific decisions
- Promote recurring patterns to long-term memory
- Link sessions that build on each other
