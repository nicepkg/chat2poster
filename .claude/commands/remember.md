---
name: remember
description: Save current session's key learnings to memory
---

# Remember Session

## Your Task

Save the current session's important context to `memories/` folder.

Optional title: **$ARGUMENTS**

## What to Remember

### Always Include
- Key decisions made this session
- Problems solved and how
- User preferences discovered
- Code patterns established
- Blockers encountered

### Skip
- Trivial changes (typo fixes, formatting)
- Standard operations (git commits, installs)
- Things already in long-term-memory.md

## Execution Flow

### 1. Generate Filename

```
Format: YYYY-MM-DD-NNN-{title}.md

Examples:
- 2024-01-31-001-core-schema-setup.md
- 2024-01-31-002-chatgpt-adapter.md
```

Count existing files for today to get NNN.

### 2. Analyze Session

Review the conversation and extract:
- What was the goal?
- What was accomplished?
- What decisions were made?
- What problems were solved?
- What's next?

### 3. Write Memory File

```markdown
# Session: {Title}

**Date:** YYYY-MM-DD
**Track:** T{N} (if applicable)
**Duration:** ~{X} turns

## 🎯 Goal

{What we set out to do}

## ✅ Accomplished

- {Thing 1}
- {Thing 2}

## 🧠 Decisions Made

### {Decision 1}
- **Choice:** {what was chosen}
- **Rationale:** {why}
- **Alternatives:** {what was rejected}

## 🐛 Problems Solved

### {Problem 1}
- **Symptom:** {what went wrong}
- **Cause:** {root cause}
- **Fix:** {solution}

## 💡 Learnings

- {Insight 1}
- {Insight 2}

## 📁 Files Changed

- `path/to/file` - {what changed}

## ⏭️ Next Steps

- [ ] {Next task 1}
- [ ] {Next task 2}

## 🔗 Related

- Previous session: `memories/YYYY-MM-DD-NNN-xxx.md`
- Long-term memory: Updated {section} (if applicable)
```

### 4. Update Long-Term Memory (If Needed)

If session discovered something important:
- New architecture decision → Add to AD-XXX
- User preference → Add to UP-XXX
- PRD conflict → Add to Conflicts section
- Gotcha/bug → Add to G-XXX

### 5. Confirm

```markdown
## 💾 Memory Saved

**File:** `memories/2024-01-31-001-core-schema-setup.md`

**Summary:**
- Implemented core-schema types
- Decided on Zod for validation
- Next: T2 can start using interfaces

**Long-term memory updated:** Yes (AD-005 added)
```

## Output Format

Show the user:
1. Memory file path
2. Brief summary of what was saved
3. Whether long-term memory was updated

## Tips

- Be concise but complete
- Focus on *why* not just *what*
- Link related sessions
- Flag things that might matter later
