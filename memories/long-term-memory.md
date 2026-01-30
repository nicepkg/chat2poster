# Chat2Poster - Long-Term Memory

> Persistent important information that should never be forgotten.
> AI assistants should CHECK this before major decisions and UPDATE it when discovering important patterns.

---

## 🎯 Project Identity

- **Name:** Chat2Poster
- **Mission:** Turn AI chats into share-worthy posters
- **Owner:** Jinming Yang (@2214962083)
- **Org:** nicepkg
- **Domain:** chat2poster.xiaominglab.com

---

## 🏗️ Architecture Decisions

### AD-001: Monorepo Structure
**Decision:** Use pnpm workspace monorepo
**Rationale:** Share code between extension and web app
**Date:** 2024-01-31

### AD-002: Export Engine
**Decision:** SnapDOM primary, SVG fallback
**Rationale:** SnapDOM is faster and more accurate for most cases
**Date:** 2024-01-31

### AD-003: No Backend Storage
**Decision:** Never persist user conversations to database
**Rationale:** Privacy-first approach, user data stays local
**Date:** 2024-01-31

### AD-004: Shadow DOM for Extension
**Decision:** Use Shadow DOM for extension UI
**Rationale:** Style isolation from host page (ChatGPT/Claude/Gemini)
**Date:** 2024-01-31

---

## 👤 User Preferences

### UP-001: Chinese Communication
**Preference:** Respond in Chinese, code/docs in English
**Context:** Jinming prefers Chinese for discussions

### UP-002: Automation First
**Preference:** Automate everything, minimize manual steps
**Context:** Execute directly instead of providing instructions

### UP-003: No Bullshit
**Preference:** Be concise, direct, no unnecessary verbosity
**Context:** Value efficiency over politeness

---

## ⚠️ PRD/Doc Conflicts

> Record when implementation differs from original PRD

*None recorded yet*

---

## 🐛 Known Gotchas

### G-001: ChatGPT DOM Structure
**Issue:** ChatGPT frequently changes DOM structure
**Workaround:** Adapter versioning, fallback selectors
**Date:** 2024-01-31

### G-002: Font Loading Race Condition
**Issue:** Fonts may not be ready when export starts
**Workaround:** Always await `document.fonts.ready`
**Date:** 2024-01-31

---

## 📊 Project Constraints

### C-001: No Login System (MVP)
**Constraint:** No user accounts, no cloud sync
**Scope:** MVP only, may change post-launch

### C-002: PNG Only
**Constraint:** Export format is PNG only (no JPEG, WebP, PDF)
**Scope:** MVP only

### C-003: Browser Support
**Constraint:** Chrome, Firefox, Edge (latest 2 versions)
**Scope:** Extension

---

## 🔄 Cross-Session Decisions

> Important decisions that should persist across sessions

### D-001: Track System
**Decision:** 5 parallel tracks (T1-T5) for AI collaboration
**Context:** Multiple AIs work simultaneously without conflicts
**Date:** 2024-01-31

---

## 📝 Session Changelog

| Date | Session | Summary |
|------|---------|---------|
| 2024-01-31 | Initial Setup | Created TASKS.md, commands, memory system |

---

## 🔗 Quick References

- **PRD:** `docs/prd.md`
- **Architecture:** `docs/architecture.md`
- **Data Model:** `docs/data-model.md`
- **UI Spec:** `docs/ui-spec.md`
- **Acceptance:** `docs/acceptance.md`
- **Tasks:** `TASKS.md`
