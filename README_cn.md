<div align="center">

<img src="website/public/icon.svg" width="120" height="120" />

# chat2poster

### **把 AI 聊天变成能直接发的海报图**

[![GitHub stars](https://img.shields.io/github/stars/nicepkg/chat2poster?style=social)](https://github.com/nicepkg/chat2poster)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/nicepkg/chat2poster/pulls)

简体中文 | [English](./README.md)

<img src="https://img.shields.io/badge/Chrome-浏览器扩展-blue?style=for-the-badge&logo=googlechrome" />
<img src="https://img.shields.io/badge/Next.js-网页版-black?style=for-the-badge&logo=next.js" />

---

**将 ChatGPT、Claude、Gemini 对话导出为精美的 PNG 图片**

一键导出。精美主题。超长对话智能分页。

[立即开始](#-快速开始) · [功能特性](#-功能特性) · [文档](https://chat2poster.xiaominglab.com)

</div>

---

## 为什么选择 chat2poster？

> **分享 AI 对话不应该这么难。**
>
> 截图丑、长对话截不全、代码块格式丢失。chat2poster 一站式解决。

### 我们解决的痛点

| 没有 chat2poster | 有了 chat2poster |
|:-----------------------|:-----------------------|
| 截图样式不统一，很丑 | 统一主题的精美海报 |
| 长对话一张图放不下 | 智能自动分页，zip 打包下载 |
| 代码块语法高亮丢失 | Shiki 驱动的完美代码渲染 |
| 不同平台需要手动裁剪 | 1x/2x/3x 倍率适配任意场景 |

### 核心优势

```
精美主题   → 暗色、亮色、自定义样式
智能分页   → 自动拆分超长对话
一键导出   → 1x/2x/3x 倍率 PNG
多平台     → ChatGPT、Claude、Gemini 支持
```

---

## 适合谁用？

<table>
<tr>
<td width="50%">

**内容创作者**
在推特、微信、博客分享 AI 对话，保持统一的精美格式。

**开发者**
导出代码讨论，完美保留语法高亮。

</td>
<td width="50%">

**研究人员**
为论文、报告、演示文稿记录 AI 交互。

**教育工作者**
用 AI 对话示例制作教学材料。

</td>
</tr>
</table>

---

## 功能特性

| 功能 | 描述 | 详情 |
|:-----|:-----|:-----|
| **精美主题** | 暗色、亮色、自定义配色 | 统一审美 |
| **智能分页** | 超过 6000px 自动拆分，支持手动分页线 | 可配置最大高度 |
| **一键导出** | 1x/2x/3x 分辨率 PNG 导出 | 多页 zip 打包 |
| **多平台适配** | ChatGPT、Claude、Gemini 适配器 | 分享链接 & 手动输入兜底 |
| **浏览器扩展** | 直接从对话页面导出 | Shadow DOM 隔离 |
| **网页版** | 粘贴分享链接或手动创建 | 无需安装 |

---

## 快速开始

### 浏览器扩展

1. 从 Chrome 应用商店安装（即将上线）
2. 打开任意 ChatGPT / Claude / Gemini 对话
3. 点击 chat2poster 图标
4. 选择消息、选择主题、导出！

### 网页版

1. 访问 [chat2poster.xiaominglab.com](https://chat2poster.xiaominglab.com)
2. 粘贴分享链接或手动创建消息
3. 自定义主题和分页
4. 下载你的精美海报

### 开发环境

```bash
# 克隆仓库
git clone https://github.com/nicepkg/chat2poster.git
cd chat2poster

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev:website
```

---

## 配置选项

### 主题设置

- **圆角**: 0-32px
- **内边距**: 16-64px
- **阴影**: 无 / 轻 / 中 / 重
- **背景**: 纯色或渐变
- **macOS 标题栏**: 开关控制

### 分页设置

- **每页最大高度**: 2000-10000px（默认: 4096px）
- **自动分页**: 在消息边界智能拆分
- **手动分页线**: 可在任意消息之间插入

---

## Star 趋势

<a href="https://star-history.com/#nicepkg/chat2poster&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=nicepkg/chat2poster&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=nicepkg/chat2poster&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=nicepkg/chat2poster&type=Date" />
 </picture>
</a>

---

## 参与贡献

欢迎贡献！你可以这样参与：

- 给项目点 Star - 帮助更多人发现这个项目
- 报告 Bug - 发现问题请提 Issue
- 建议功能 - 告诉我们什么能让这个项目更好
- 提交 PR - 改进代码、文档或添加功能

查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解贡献指南。

### 贡献者

<a href="https://github.com/nicepkg/chat2poster/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=nicepkg/chat2poster" />
</a>

---

## 致谢

基于以下技术构建：
- [Next.js](https://nextjs.org/) - React 框架
- [WXT](https://wxt.dev/) - 浏览器扩展框架
- [Shiki](https://shiki.style/) - 语法高亮
- [SnapDOM](https://github.com/nicepkg/snapdom) - DOM 转图片导出
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库

---

## 开源协议

MIT © [nicepkg](https://github.com/nicepkg)

---

<div align="center">

**如果这个项目对你有帮助，请给它一个 Star**

<a href="https://github.com/nicepkg/chat2poster">
  <img src="https://img.shields.io/github/stars/nicepkg/chat2poster?style=for-the-badge&logo=github&color=yellow" alt="GitHub stars" />
</a>

用爱打造 by [nicepkg](https://github.com/nicepkg)

</div>
