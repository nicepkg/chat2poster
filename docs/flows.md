# 核心流程、状态机与错误恢复

## 范围

- 描述扩展端与官网端核心用户流程。
- 描述关键对象状态机（ExportJob、Adapter 解析、Pagination）。
- 描述错误分类、提示策略与恢复路径。

## 非范围

- 登录与权限系统（MVP 不做）。
- 团队协作与云存储（MVP 不做）。

## 假设

- UI 能显示明确的状态（loading/empty/error/success）。
- 导出为前端本地生成文件并下载。

## 依赖

- Adapter 机制可插拔（新增适配器不改多处）。
- 导出引擎具备主/兜底路径。

---

## 1) 扩展端核心流程（主路径）

1. 用户在对话页点击扩展入口（toolbar/浮层按钮）。
2. 系统解析当前会话 DOM → 生成 Conversation + Messages。
3. 进入编辑器：
   - 默认全选
   - 主题与装饰可调
   - 预览实时更新
4. 系统估算画布高度：
   - > 6000px → 显示分页提示
5. 用户可选择分页方式：
   - 手动：在缩略列表插分页线
   - 自动：设置每张最大高度（默认 4096）→ 自动插分页线并标注页序号
6. 用户点击导出：
   - 生成单张 PNG 或多张 zip
   - 导出结束后保持当前编辑状态，支持再次导出

---

## 2) 官网核心流程

### 2.1 share link 导入

1. 用户粘贴 share link → 点击解析
2. 服务端 adapter 解析 → 返回结构化 Messages
3. 前端进入与扩展一致的编辑器与导出流程

### 2.2 兜底：手动创建 message list

1. 用户进入手动创建
2. 逐条添加 Message：
   - role 下拉（user/assistant/system）
   - markdown 输入框
   - 默认 role 交替（user → assistant → user…）
3. 进入导出编辑器（同一套组件）

---

## 3) 关键对象状态机

### 3.1 ExportJob 状态机

- draft：参数可编辑（selection/theme/pagination/export settings）
- rendering：导出进行中（禁用重复导出按钮或显示队列）
- success：导出成功（提供下载反馈）
- failed：导出失败（提供重试/降级）
  状态转换：
- draft -> rendering：点击导出
- rendering -> success：文件生成并触发下载
- rendering -> failed：SnapDOM/SVG 失败、资源错误、未知错误
- failed -> rendering：点击重试
  约束：
- 失败后必须回到 failed，不清空 draft 配置（selection/pagination/theme 必须保留）。

### 3.2 Adapter 解析状态机（扩展/官网共用）

- idle
- parsing
- parsed
- unsupported（链接/页面不支持）
- error（网络/结构变化/异常）
  转换：
- idle -> parsing：用户触发解析
- parsing -> parsed：成功返回 Messages
- parsing -> unsupported：识别为不支持
- parsing -> error：异常/失败
  恢复策略：
- unsupported/error：必须提供兜底入口（手动创建、粘贴文本）。

### 3.3 Pagination 逻辑（页分配）

输入：

- SelectedMessages（有序）
- PageBreaks（可为空）
- AutoPaginationSettings（可为空）
  输出：
- Pages: Message[][]

规则：

- 若存在 PageBreaks：以 PageBreaks 为硬边界切分。
- 若无 PageBreaks 且启用 AutoPagination：
  - 以每张最大高度为约束，按消息顺序装箱（贪心装箱即可，确保稳定可预测）。
  - 生成的切分点要以 PageBreaks 形式回写到 UI（可见性）。
- 若两者都无：Pages = [SelectedMessages]。

---

## 4) 错误分类与恢复策略（面向用户）

### 4.1 解析类错误

- E-PARSE-UNSUPPORTED：不支持的站点/链接
  - 恢复：手动创建 / 粘贴文本
- E-PARSE-CHANGED：页面结构变化导致解析失败
  - 恢复：重试（刷新）/ 手动创建 / 粘贴文本
- E-PARSE-NETWORK：网络错误（官网）
  - 恢复：重试 / 手动创建

### 4.2 导出类错误

- E-EXPORT-SNAPDOM：主引擎失败
  - 恢复：自动切换 SVG 兜底（若可），否则提示重试
- E-EXPORT-RESOURCE：字体/图片资源未加载
  - 恢复：等待加载、重试；可选“忽略图片继续导出”（若实现）
- E-EXPORT-ZIP：打包失败
  - 恢复：重试；或降级为逐张下载（仅作为最后兜底，MVP 可不实现但应记录）

---

## 5) 可见性与反馈（减少认知负荷）

- 解析阶段：必须显示 loading 与可取消（可选）。
- 自动分页：必须以分页线可视化结果，而不是只给数字。
- 导出阶段：显示进度/转圈与完成提示；失败时给出下一步按钮（重试/兜底）。
