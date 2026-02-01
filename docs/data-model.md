# 数据模型（实体/关系/字段/约束/索引/审计/软删）

## 范围

- 定义前端本地与官网临时处理所需的数据结构（以 TypeScript 结构体为主的概念模型）。
- 定义官网后端解析接口的请求/响应契约（不落库前提下）。

## 非范围

- 用户账户、团队、多租户权限模型（MVP 不做）。
- 持久化数据库表设计（MVP 不落库）。

## 假设

- 扩展端主要在内存中维护编辑状态，可选 localStorage 保存“最近主题/参数”。
- 官网后端只做解析与返回，不持久化消息正文。

## 依赖

- 所有输入源（share link / DOM / 手动创建 / 粘贴文本）均转换为统一 Conversation schema。
- Adapter 机制可新增而不影响核心渲染导出模块。

---

## 1) 实体概览与关系

- Conversation 1..\* Message
- Conversation 1..1 Selection
- Conversation 1..1 Theme（或 ThemeRef）
- Conversation 1..\* ExportJob（可选：仅保留最近一次）
- Pagination（PageBreak）属于 Selection（因为它依赖选中消息序列）

---

## 2) 字段字典（建议）

### 2.1 Conversation

- id: string（uuid）
- sourceType: enum
  - extension-current
  - web-share-link
  - web-manual
  - web-paste
- sourceMeta: object（可选）
  - provider: chatgpt | claude | gemini | unknown
  - shareUrl?: string
  - parsedAt?: ISO string
  - adapterId?: string
  - adapterVersion?: string
- messageIds: string[]（有序）
- createdAt: ISO string
- updatedAt: ISO string

约束：

- CONV-001：messageIds 顺序必须与原对话顺序一致。
- CONV-002：sourceType=web-share-link 时必须包含 sourceMeta.shareUrl。

索引（若有本地存储需求）：

- idx_conversation_updatedAt（用于最近记录）

### 2.2 Message

- id: string（uuid）
- conversationId: string
- order: number（从 0 开始递增）
- role: enum（user|assistant|system）
- contentMarkdown: string
- contentMeta（可选，派生/缓存）
  - containsCodeBlock?: boolean
  - containsImage?: boolean
  - approxHeightPx?: number（用于快速估算分页）
- createdAt, updatedAt: ISO string

约束：

- MSG-001：order 必须与 Conversation.messageIds 索引一致（或可从 messageIds 推导，二者保持一致）。
- MSG-002：role 必须是枚举值之一。

### 2.3 Selection

- conversationId: string
- selectedMessageIds: string[]（有序，必须是 Conversation.messageIds 的子序列）
- pageBreaks: PageBreak[]（按 position 升序）
- updatedAt: ISO string

约束：

- SEL-001：selectedMessageIds 为空时禁止导出。
- SEL-002：selectedMessageIds 必须保持原顺序，不允许重排（MVP）。
- SEL-003：pageBreaks 的位置只能位于 selectedMessageIds 的相邻边界之间。

### 2.4 PageBreak

- id: string
- afterMessageId: string（分页线插在该消息之后）
- label?: string（例如“第 2 张开始”）
- createdAt: ISO string

约束：

- PB-001：afterMessageId 必须存在于 selectedMessageIds。
- PB-002：同一 afterMessageId 不得重复插入分页线。

### 2.5 Theme

- id: string（theme key）
- name: string
- mode: enum（light|dark）
- tokens: ThemeTokens（可序列化）
  - fontFamily: string
  - baseFontSizePx: number
  - colors: ThemeColors
    - background: string
    - foreground: string
    - userBubble: string
    - assistantBubble: string
    - border: string
    - codeBlockBackground: string
  - codeTheme: string（shiki theme id）
- decorationDefaults: DecorationDefaults
  - canvasPaddingPx: number
  - canvasRadiusPx: number
  - shadowLevel: enum（none|xs|sm|md|lg|xl）
  - backgroundType: enum（solid|gradient|image）
  - backgroundValue: string
  - macosBarEnabled: boolean

约束：

- THEME-001：tokens 必须可 JSON 序列化（用于跨端复用）。

### 2.6 ExportJob

- id: string
- conversationId: string
- params: ExportParams
  - scale: 1|2|3（默认 2）
  - deviceType: enum（mobile|tablet|desktop）（默认 tablet）
    - mobile: 390px（手机尺寸）
    - tablet: 768px（平板尺寸）
    - desktop: 1200px（桌面尺寸）
  - maxPageHeightPx: number（默认 4096，范围 2000-10000）
  - outputMode: enum（single|multi-zip）
- paginationResult（可选缓存）
  - pages: string[][]（每页 messageIds）
- status: draft|rendering|success|failed
- error?:
  - code: string
  - message: string（面向用户）
  - detail?: string（面向调试）
- createdAt, updatedAt: ISO string

约束：

- JOB-001：multi-zip 时 pages.length 必须 > 1。
- JOB-002：失败时必须保留 params 与 selection（用于重试）。

注意：

- Desktop 宽度由 deviceType 决定
- Window 宽度 = Desktop 宽度 - (canvasPaddingPx × 2)

---

## 3) 审计字段与软删

- MVP 默认不做软删与审计日志（不落库）。
- 若本地持久化最近配置：
  - createdAt/updatedAt 作为审计字段。
  - 删除仅清除本地缓存即可（不需要软删策略）。
