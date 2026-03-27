# 自动化测试安全红线

**核心原则：禁止的是 D365 写操作和发送邮件，不是读操作。**

## 🔴 绝对禁止（D365 写操作 + 外发操作）

### 禁止触发的 D365 写操作脚本

| 脚本 | 操作 | 风险 |
|------|------|------|
| `add-note.ps1` | 创建 Case Note | D365 写入 |
| `add-phone-call.ps1` | 创建 Phone Call 活动 | D365 写入 |
| `record-labor.ps1` | 记录 Labor | D365 写入 |
| `edit-sap.ps1` | 修改 Support Area Path | D365 写入 |
| `new-email.ps1` | 创建邮件草稿 | D365 写入 |
| `reply-email.ps1` | 回复邮件草稿 | D365 写入 |
| `edit-draft.ps1` | 修改邮件草稿 | D365 写入 |
| `delete-draft.ps1` | 删除邮件草稿 | D365 删除 |
| `request-access.ps1` | 请求 Case 访问权限 | D365 写入 |

### 禁止触发的 API 端点

| 端点 | 风险说明 |
|------|----------|
| `POST /api/todo/:id/execute` | 直接执行 D365 写操作 |

### 禁止点击的 UI 元素

| 页面 | 元素 | 原因 |
|------|------|------|
| TodoView | "Execute" 按钮 | 直接执行 D365 写操作 |

## ✅ 允许执行（只读操作 + 本地文件操作）

### 允许的 CLI / Agent 操作

| 操作 | 说明 | 安全原因 |
|------|------|----------|
| `casework` 全流程 | data-refresh → compliance → status-judge → inspection | 全程只读 D365 API + 生成本地文件 |
| `troubleshooter` | Kusto 查询 + 文档搜索 + 分析报告 | Kusto 只读、msft-learn 只读 |
| `draft-email` | 生成邮件草稿到本地文件 | 只写本地文件，不发送邮件 |
| `patrol` | 批量巡检所有 active case | 等同于批量 casework，只是耗时较长 |
| `data-refresh` | 拉取 Case 最新数据 | D365 读操作 |
| `compliance-check` | Entitlement 检查 | D365 读操作 |
| `status-judge` | 状态判断 | 本地文件操作 |
| `inspection-writer` | 生成 case-summary + todo | 本地文件操作 |
| `teams-search` | Teams 消息搜索 | Teams API 只读 |

### 允许的 API 端点

| 端点 | 说明 |
|------|------|
| 所有 `GET /api/*` | 读操作 |
| `PUT /api/settings` | 本地配置写入 |
| `PATCH /api/cases/:id/todo/toggle` | 本地文件勾选 |
| `POST /api/case/:id/process` | 触发 casework（只读流程）|
| `POST /api/case/:id/step/*` | 单步执行（除 todo execute 外都安全）|
| `POST /api/patrol` | 批量巡检（耗时长，按需使用）|
| `POST /api/issues` | 创建 Issue（本地文件）|
| `DELETE /api/issues/:id` | 删除 Issue（本地文件）|
| `PUT /api/issues/:id` | 更新 Issue（本地文件）|

### 允许的 UI 操作

- ✅ 页面导航（`goto`）和截图
- ✅ UI 元素可见性检查（`isVisible`、`textContent`）
- ✅ 表单输入和本地状态变更（Settings 页面）
- ✅ Tab 切换、排序、搜索过滤
- ✅ 点击 "Full Process"、"Troubleshoot"、"Draft Email" 按钮（触发只读流程）
- ✅ Issue 操作（New Track、Cancel、Edit、Reopen、Mark Done、Verify）
- ❌ 点击 "Execute"（Todo 执行，触发 D365 写操作）

## ⚠️ 注意事项

- **casework/patrol 会创建本地文件**（case-summary.md、todo/*.md 等）— 如果需要保持测试前状态，使用 backup/restore 模式
- **troubleshooter 会调用 Kusto MCP** — 需要 agency.exe 代理运行中
- **draft-email 生成的草稿在本地** — 不会自动发送，安全
- **patrol 耗时较长**（每个 case ~1-2 分钟）— 适合做完整回归测试，不适合快速验证
