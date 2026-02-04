# Project Configuration

## Basic Info

- **Project Name**: chat2poster
- **Repo Name**: chat2poster
- **Slogan (EN)**: Turn AI chats into share-worthy posters.
- **Slogan (ZH)**: 把 AI 聊天变成能直接发的海报图。
- **Domain**: chat2poster.xiaominglab.com

## GitHub

- **Username**: nicepkg
- **Repo**: https://github.com/nicepkg/chat2poster

## Author

- **Name**: Jinming Yang
- **Website**: https://github.com/2214962083
- **Email**: 2214962083@qq.com

## Social Links (leave empty to hide)

- **Twitter**: jinmingyang666
- **Bilibili UID**: 83540912
- **Douyin UID**: 79841360454
- **Douyin Nickname**: 葬爱非主流小明

## Theme Colors

- **Primary Color**: Indigo (#6366F1) / hsl(239.76, 84.21%, 67.45%) / oklch(0.619 0.202 268.7)
- **Secondary Color**: Violet (#818CF8) / hsl(234.94, 89.47%, 73.92%) / oklch(0.685 0.17 277)

## Notes

chat2poster converts AI chat sessions (ChatGPT / Claude / Gemini) into beautiful, export-ready images.

Core objects:

- Conversation
- Message
- Selection
- Theme
- ExportJob
- Adapter

Default behavior:

- Default select all messages
- Export format: PNG only (1x / 2x / 3x), default 2x
- Default device type: tablet (768px), configurable via deviceType (mobile: 390px, tablet: 768px, desktop: 1200px)
- Allow long conversations; show pagination hint when estimated height > 6000px
- Pagination via page-break markers inserted between message items
- Auto pagination available (default max page height = 4096px, range 2000–10000px)
- Multi-page export is zipped (page_001.png, page_002.png, ...)
- Export engine: SnapDOM primary
- Web fallback: share link import when supported; manual message list builder and paste text always available

Adapters (implemented):

| Adapter | Type | Version | URL Pattern / Notes |
|---------|------|---------|---------------------|
| ChatGPT ext | extension | 1.0.0 | `chatgpt.com/c/*` - API-based parsing |
| ChatGPT share-link | web | 2.0.0 | `chatgpt.com/share/*`, `chatgpt.com/s/*` - React Flight decoder |
| Claude ext | extension | 1.0.0 | `claude.ai/chat/*` - Cookie-based auth |
| Claude share-link | web | 2.0.0 | `claude.ai/share/*` - Public API |
| Gemini ext | extension | 1.0.0 | `gemini.google.com/app/*` - batchexecute RPC |
| Gemini share-link | web | 1.0.0 | `gemini.google.com/share/*`, `g.co/gemini/share/*` |
| Manual builder | web | - | User creates messages manually |
| Paste text import | web | - | Parses User:/Assistant: prefixes |

Non-goals (MVP):

- No login / account system
- No cloud storage of chat content
- No team collaboration
- No annotation tools (arrows/blur/markup)
- No video/GIF export
- No freeform drag-and-drop layout editor
