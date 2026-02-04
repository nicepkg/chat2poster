# UI 规格（信息架构 / 页面清单 / 交互与状态 / 响应式）

## 范围

- 扩展端（Shadow DOM）与官网端的页面/模块清单与交互细节。
- 明确 loading/empty/error/no-permission/retry 等状态。
- 明确分页线插入、自动分页、导出参数、导出反馈。

## 非范围

- 设计稿像素级视觉（由主题 tokens 与组件库实现）。
- 标注编辑器与复杂裁剪（MVP 不做）。

## 假设

- 扩展 UI 能在窄侧栏与宽面板两种布局工作（响应式）。
- 同一套 React 组件可在扩展与官网复用。

## 依赖

- shadcn/ui（或等价）用于表单、列表、按钮、弹窗。
- Shadow DOM 样式隔离方案已确定（注入 Tailwind/shadcn 样式到 shadow root）。

---

## 1) 信息架构（IA）

- 扩展入口
  - 导出面板（Editor）
- 官网
  - 导入页（Import）
  - 导出编辑器（Editor，与扩展同构）
  - 兜底：手动创建（Manual Builder）

---

## 2) 页面/模块清单

### 2.1 扩展：Editor（核心）

**组件入口选择：**

| 组件 | 使用场景 | 特点 |
|------|---------|------|
| `EditorWorkspace` | Web 主页面 | 响应式两栏布局 |
| `EditorPanel` | 扩展侧边栏 | 固定宽度 (w-96)，自带解析/导出逻辑 |
| `EditorModal` | 快速导出对话框 | 包装 EditorWorkspace |

**布局（响应式）：**

- **桌面端 (≥ lg)：** 左侧固定设置栏 (w-80) + 右侧弹性预览区
- **移动端 (< lg)：** 预览全宽 + 底部浮动按钮触发设置抽屉

区块：

1. 左侧设置面板（EditorTabs）
   - **消息 Tab (MessagesTab)**：
     - 顶部全选 checkbox + 已选数量统计
     - 消息列表（可滚动，使用 Set 实现 O(1) 查找）
       - 每条：checkbox + role badge + 内容摘要
       - 选中状态：100% 不透明
       - 未选中状态：50% 透明度
       - Hover 显示剪刀图标（插入分页线）
     - 分页线：渐变分隔条 + X 按钮删除
   - **主题 Tab (ThemeTab)**（默认显示）：
     - 主题选择网格（2列，带颜色预览点）
     - BackgroundPicker（4列预设网格）
     - 装饰参数滑块：圆角 (0-40px) / padding (0-32px) / 阴影 (none/sm/md/lg/xl)
     - macOS 条开关
   - **导出 Tab (ExportTab)**：
     - 倍率按钮组 1x/2x/3x（默认 2x）
     - 自动分页开关
     - 最大页高滑块（2000-8000px，仅开启自动分页时可编辑）
     - 导出信息预览文本
2. 右侧预览区（EditorPreview）
   - **预览头部**（控件集中在此）：
     - 左侧：DeviceSelector（手机/平板/电脑图标按钮）
     - 中间：PageNavigation（点状指示器 + 左右箭头 + 页码，仅多页时显示）
     - 右侧：ExportButton（带 loading → success → default 动画状态）
   - **预览内容**（CleanShot X 风格层级）：
     - `c2p-desktop`：桌面画布（渐变背景，宽度由 DEVICE_WIDTHS[deviceType] 决定）
     - `c2p-window`：窗口（宽度 = desktop - padding×2，应用 contentBg）
     - `c2p-window-bar`：MacOSBar 组件（可选）
     - `c2p-window-content`：消息内容区域 + MarkdownRenderer
   - 棋盘格背景（base64 SVG）
   - 内部滚动（overflow-auto）

设备尺寸预设：

- mobile: 390px（手机）
- tablet: 768px（平板，默认）
- desktop: 1200px（桌面）

状态要求：

- Loading（解析中）：显示 skeleton/转圈，不可导出。
- Empty（无消息）：显示空态与重试解析入口。
- Error（解析失败）：显示原因 + 兜底入口（官网/粘贴/手动创建）——扩展端至少提示刷新与重试。
- No-permission：若无法访问 DOM（极少见）显示权限提示与解决方案。

### 2.2 官网：Import（导入页）

输入区：

- share link 输入框 + 解析按钮
- 解析失败时提示 + 两个按钮：
  - 手动创建消息列表
  - 粘贴文本/Markdown 导入

状态：

- Loading：解析中
- Error：不支持/链接失效/网络错误（文案区分）
- Success：进入 Editor

### 2.3 官网：Manual Builder（手动创建）

核心交互（低认知负荷）：

- 列表式表单：
  - 每条：role 下拉 + markdown 文本框 + 删除
  - 底部：新增下一条（默认 role 交替）
- 提供预览切换（可选）：右侧/下方显示实时预览
- 继续：进入 Editor（或直接在此页导出，二选一；推荐进入 Editor 复用所有功能）

状态：

- Empty：初始提示（添加第一条消息）
- Validation：无消息时导出禁用

### 2.4 Editor（官网与扩展复用）

- UI 与行为同扩展 Editor。
- 差异：官网多一个“返回导入页”入口。

---

## 3) 关键交互细节（可测试）

### 3.1 分页线插入

- 每条消息右侧按钮文案：在此后插入分页线
- 点击后：
  - UI 插入分页线组件
  - 页序号重新计算并显示（若启用显示）
- 分页线支持删除（MVP）

### 3.2 自动分页

- 入口：
  - 超长提示条上的“自动分页”按钮
  - 设置面板内的自动分页开关
- 执行后：
  - 自动插入分页线
  - 每页标注“第 X 张”
- 用户修改 maxPageHeightPx 后再次执行会刷新分页线（旧的被替换或按策略更新，需在实现里固定一条规则并保持一致）

### 3.3 导出与反馈

- rendering：按钮禁用 + spinner
- success：toast 提示（包含页数与倍率）
- failed：错误卡片（错误码可隐藏）+ 重试按钮

---

## 4) 响应式规则

- 窄宽阈值建议：< 520px 进入单列模式（预览在上、面板在下）。
- 消息列表在窄屏默认折叠为抽屉或 tab。
- 预览宽度与画布 preset 解耦：UI 预览可缩放，但导出尺寸由 preset+倍率决定。
