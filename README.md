<div align="center">

<img src="website/public/icon.svg" width="120" height="120" />

# chat2poster

### **Turn AI chats into share-worthy posters.**

[![GitHub stars](https://img.shields.io/github/stars/nicepkg/chat2poster?style=social)](https://github.com/nicepkg/chat2poster)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/nicepkg/chat2poster/pulls)

[简体中文](./README_cn.md) | English

<img src="https://img.shields.io/badge/Chrome-Extension-blue?style=for-the-badge&logo=googlechrome" />
<img src="https://img.shields.io/badge/Next.js-Web_App-black?style=for-the-badge&logo=next.js" />

---

**Export ChatGPT, Claude, Gemini conversations as beautiful PNG images.**

One click. Beautiful themes. Smart pagination for long chats.

[Get Started](#-quick-start) · [Features](#-features) · [Documentation](https://chat2poster.xiaominglab.com)

</div>

---

## Why chat2poster?

> **Sharing AI conversations shouldn't be this hard.**
>
> Screenshots look ugly. Long chats don't fit. Code blocks lose formatting. chat2poster solves all of this.

### The Problem We Solve

| Without chat2poster | With chat2poster |
|:--------------------------|:-----------------------|
| Ugly screenshots with inconsistent styles | Beautiful posters with unified themes |
| Long conversations can't fit in one image | Smart auto-pagination, zip export |
| Code blocks lose syntax highlighting | Shiki-powered perfect code rendering |
| Manual cropping for different platforms | 1x/2x/3x export for any use case |

### Key Benefits

```
Beautiful Themes  → Dark, light, and custom styles
Smart Pagination  → Auto-split long chats into pages
One-Click Export  → PNG at 1x/2x/3x DPI
Multi-Platform    → ChatGPT, Claude, Gemini support
```

---

## Who Is This For?

<table>
<tr>
<td width="50%">

**Content Creators**
Share AI conversations on Twitter, WeChat, blogs with consistent beautiful formatting.

**Developers**
Export code discussions with perfect syntax highlighting preserved.

</td>
<td width="50%">

**Researchers**
Document AI interactions for papers, reports, and presentations.

**Educators**
Create teaching materials from AI conversation examples.

</td>
</tr>
</table>

---

## Features

| Feature | Description | Details |
|:--------|:------------|:--------|
| **Beautiful Themes** | Dark, light, and custom color schemes | Consistent aesthetics |
| **Smart Pagination** | Auto-split when > 6000px, manual page breaks | Configurable max height |
| **One-Click Export** | PNG export at 1x/2x/3x resolution | Multi-page zip for long chats |
| **Multi-Platform** | ChatGPT, Claude, Gemini adapters | Share link & manual input fallback |
| **Browser Extension** | Export directly from chat pages | Shadow DOM isolation |
| **Web App** | Paste share links or create manually | No installation required |

---

## Quick Start

### Browser Extension

1. Install from Chrome Web Store (coming soon)
2. Open any ChatGPT / Claude / Gemini conversation
3. Click the chat2poster icon
4. Select messages, choose theme, export!

### Web App

1. Visit [chat2poster.xiaominglab.com](https://chat2poster.xiaominglab.com)
2. Paste a share link or create messages manually
3. Customize theme and pagination
4. Download your beautiful poster

### Development

```bash
# Clone the repository
git clone https://github.com/nicepkg/chat2poster.git
cd chat2poster

# Install dependencies
pnpm install

# Start development server
pnpm dev:website
```

---

## Configuration

### Theme Options

- **Corner Radius**: 0-32px
- **Padding**: 16-64px
- **Shadow**: None / Light / Medium / Strong
- **Background**: Solid colors or gradients
- **macOS Title Bar**: Toggle on/off

### Pagination Settings

- **Max Page Height**: 2000-10000px (default: 4096px)
- **Auto Pagination**: Smart split at message boundaries
- **Manual Page Breaks**: Insert between any messages

---

## Star History

<a href="https://star-history.com/#nicepkg/chat2poster&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=nicepkg/chat2poster&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=nicepkg/chat2poster&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=nicepkg/chat2poster&type=Date" />
 </picture>
</a>

---

## Contributing

Contributions are welcome! Here's how you can help:

- Star this repo - It helps others discover this project
- Report bugs - Open an issue if something isn't working
- Suggest features - What would make this better for you?
- Submit PRs - Improve code, docs, or add features

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Contributors

<a href="https://github.com/nicepkg/chat2poster/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=nicepkg/chat2poster" />
</a>

---

## Credits & Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [WXT](https://wxt.dev/) - Browser extension framework
- [Shiki](https://shiki.style/) - Syntax highlighting
- [SnapDOM](https://github.com/nicepkg/snapdom) - DOM to image export
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

## License

MIT © [nicepkg](https://github.com/nicepkg)

---

<div align="center">

**If this project helped you, please consider giving it a star**

<a href="https://github.com/nicepkg/chat2poster">
  <img src="https://img.shields.io/github/stars/nicepkg/chat2poster?style=for-the-badge&logo=github&color=yellow" alt="GitHub stars" />
</a>

Made with love by [nicepkg](https://github.com/nicepkg)

</div>
