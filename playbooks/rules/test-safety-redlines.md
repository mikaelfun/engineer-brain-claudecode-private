# 自动化测试安全红线

**以下操作在自动化测试（单元测试、UI 测试、Playwright 脚本）中绝对禁止触发。**

## 禁止触发的 D365 写操作脚本

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

## 禁止触发的 API 端点

| 端点 | 风险说明 |
|------|----------|
| `POST /api/todo/:id/execute` | 直接执行 D365 写操作 |
| `POST /api/case/:id/process` | 编排全流程，可间接触发写操作 |
| `POST /api/case/:id/step/*` | 步骤执行，draft-email 等可触发写操作 |
| `POST /api/patrol` | 批量巡检，可间接触发写操作 |

## 禁止点击的 UI 元素

| 页面 | 元素 | 原因 |
|------|------|------|
| CaseDetail | "Full Process" 按钮 | 触发完整 casework 流程 |
| CaseDetail | "Troubleshoot" 按钮 | 启动 agent 编排 |
| CaseDetail | "Draft Email" 按钮 | 启动邮件草稿 agent |
| TodoView | "Execute" 按钮 | 直接执行 D365 写操作 |

## 允许的操作

- ✅ 页面导航（`goto`）和截图
- ✅ 读取 API（`GET /api/cases/*`, `GET /api/settings`, `GET /api/todos/*`）
- ✅ UI 元素可见性检查（`isVisible`、`textContent`）
- ✅ 表单输入和本地状态变更（Settings 页面填写路径）
- ✅ Tab 切换、排序、搜索过滤
- ✅ `PUT /api/settings`（本地配置写入）
- ✅ `PATCH /api/cases/:id/todo/toggle`（本地文件勾选）
- ❌ 任何触发 Claude SDK session 的操作
- ❌ 任何调用 D365 PowerShell 脚本的操作
