# 技术架构与目录约定（可落地）

## 范围

- 扩展（WXT）+ 官网（Next.js）双端架构。
- 统一 schema、渲染导出核心包、适配器机制。
- 错误处理、状态管理（hooks+context）、测试与 CI 建议。

## 非范围

- 多租户、账号系统、支付系统。
- 云端存储与队列渲染（MVP 不做）。

## 假设

- 代码库为 monorepo 或至少支持共享 package（建议）。
- 扩展与官网复用同一套渲染组件与导出逻辑。

## 依赖

- WXT、Next.js、React、shadcn/ui、Tailwind（或同类）。
- react-markdown + remark/rehype、Shiki。
- SnapDOM + SVG fallback、zip 打包库。

---

## 1) 总体架构原则（对应你的偏好）

- DRY：核心逻辑只实现一次（schema、分页、导出、主题 tokens）。
- 高内聚低耦合：按领域拆分（import/adapters/render/export/ui），避免横向穿透。
- 不碎：模块拆到“能独立测试/替换”为止，不搞过度微文件化。
- 新增 Adapter 不应修改多处：采用注册表/插件式注入。

---

## 2) 推荐目录结构（示例）

apps/
  browser-extension/
    src/
      entrypoints/ (content script + styles)
      components/
      background/
      popup/
      assets/
  web/
    src/
      app/ (Next App Router)
        [locale]/
          page.tsx
          docs/**
          import/**
          manual/**
          paste/**
          editor/**
          api/**
      components/
      styles/
packages/
  core-schema/        (Conversation/Message/Selection/Theme/ExportJob types + validators)
  core-pagination/    (height estimation + manual breaks + auto pagination)
  core-export/        (SnapDOM export, SVG fallback, zip packaging, file naming)
  core-adapters/      (adapter interface + registry + share-link/DOM adapters)
  shared-ui/          (Radix/Shadcn UI, EditorContext, editor, renderer, themes, utils)
configs/
  eslint/             (shared flat config helpers)

说明：

- packages/core-\* 为跨端复用的“真核心”。
- apps 只做宿主差异：如何拿到输入、如何展示 UI、如何触发下载。

### 文件命名与 i18n 约定（必须遵守）

- **文件命名**：所有 `*.ts` / `*.tsx` / `*.js` / `*.jsx` / `*.d.ts` 使用 **kebab-case**（例如 `editor-panel.tsx`）。禁止 PascalCase 文件名。`index.ts` 允许保留。
- **i18n 单一真源**：统一放在 `packages/shared-ui/src/i18n/`。
  - `locales/en.ts` 为基准语言；其他语言文件必须严格对齐 key（由类型 `LocaleMessages` 强制）。
  - React 组件使用 `useI18n()`；服务端组件/路由使用 `createTranslator(locale)`。
  - 不允许硬编码 `"en" | "zh"`；统一从 shared-ui 的 `Locale` 类型和工具函数取。
  - Web 端 App Router 使用 `app/[locale]/...`，API 同样挂在 `app/[locale]/api/**`。

---

## 3) 关键模块设计

### 3.1 Schema（packages/core-schema）

- TypeScript 类型 + 运行时校验（建议 zod 或轻量自写校验）。
- 统一输入输出：任何来源最终都转成 Conversation + Messages。
- schema 变更必须向后兼容或有 version 字段（可选）。

### 3.2 Adapter 机制（packages/core-adapters）

接口：

- id: string
- version: string
- canHandle(input): boolean
- parse(input): Promise<ConversationDTO>

输入类型：

- DOMInput（扩展端）
- ShareLinkInput（官网端）
- ManualInput（官网端）
- PasteTextInput（官网端）

注册表：

- registerAdapter(adapter)
- parseWithAdapters(input): 选择第一个 canHandle 的 adapter
  约束（验收可通过代码审查）：
- 新增 adapter 只需新增文件并 register 一次；不允许在多处 switch-case 修改。

### 3.3 渲染（packages/shared-ui/components/renderer）

- React 组件化：ConversationView 接受 messages + theme + decoration + selection。
- 使用 react-markdown + plugins 渲染 markdown。
- 代码高亮：Shiki（建议在导出前确保高亮资源就绪，避免导出时闪烁）。
- 注：渲染组件已合并到 shared-ui 包中，便于 web 和 extension 复用。

性能建议（长对话）：

- message 级别 memo：每条 MessageItem 对 contentMarkdown 做 memo，避免无关 re-render。
- 列表虚拟化（可选但强烈建议）：消息缩略列表与预览列表可用虚拟滚动（实现可在 apps 层决定）。
- 高度估算缓存：Message.contentMeta.approxHeightPx 用于分页估算。

### 3.4 导出（packages/core-export）

主路径：

- SnapDOM：对“预览容器根节点”导出 PNG（按倍率）。
  兜底路径：
- 若 SnapDOM 失败或产物异常：使用 SVG 渲染路径（实现形式由工程选型确定，但对外接口保持一致）。
  多张/zip：
- pages -> 多次导出 -> zip 打包 -> 下载
  文件命名规则：
- {conversationTitle?}_{date}_{pageIndex}.png（MVP 可简化为 001.png…，但必须稳定）

资源就绪：

- 字体加载：document.fonts.ready（或等价）后再导出。
- 图片加载：导出前检查预览容器内 img complete 状态；失败则走提示与重试。

### 3.5 Pagination（packages/core-pagination）

输入：

- selectedMessageIds + manual pageBreaks + maxPageHeightPx
  输出：
- pages: messageIds[][]
  行为：
- manual breaks 优先。
- auto pagination 用贪心装箱，保证稳定、可预测（相同输入必得相同输出）。

---

## 4) 状态管理（hooks + context）

- 建议分 2 个 context：
  - EditorContext：selection/theme/decoration/export params
  - RuntimeContext：loading/error/exportJob status
- 不要把 adapter/导出实现塞进 context：只放“状态与动作接口”，具体实现由依赖注入（参数传入）或模块 import 提供。

---

## 5) 错误处理与错误码

- 统一错误结构：
  - code（机器可读）
  - userMessage（用户可执行）
  - detail（debug）
- UI 显示 userMessage + 主动作按钮（重试/兜底入口）。
- 错误码建议：
  - E-PARSE-UNSUPPORTED
  - E-PARSE-CHANGED
  - E-PARSE-NETWORK
  - E-EXPORT-SNAPDOM
  - E-EXPORT-SVG
  - E-EXPORT-RESOURCE
  - E-EXPORT-ZIP

---

## 6) 测试与 CI 建议

单元测试：

- core-pagination：分页线/自动分页/最大高度约束
- core-adapters：canHandle 与 parse 的契约测试（用 fixture）
- core-export：文件命名、zip 内容结构（不做像素级对比也行）

集成测试（最小）：

- 官网：share link 输入 -> 解析 -> 进入 Editor -> 导出触发（mock 导出）
- 扩展：解析 DOM -> 生成消息列表 -> 选择 -> 导出（mock）

CI：

- lint/typecheck/test 必跑
- 适配器契约测试必须跑（防止新增 adapter 破坏 registry）

---

## 7) 安全与隐私（工程硬约束）

- 官网后端解析不得落库消息正文。
- 日志不得记录正文内容；仅记录长度/耗时/adapter/version/错误码。
- 任何“上传导出图片到服务器”的能力都不在 MVP 范围内（禁止默认上传）。
