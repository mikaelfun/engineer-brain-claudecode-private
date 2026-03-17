---
name: d365-case-ops
description: 操作 Dynamics 365 CRM (OneSupport) 中的 Case。支持搜索/打开 Case、记录 Labor、添加 Note/Phone Call、查看 Timeline/Details/Attachments、邮件操作（新建/编辑/删除草稿、回复）、修改 SAP、请求访问权限。通过 OData API（优先）和 playwright-cli UI 操作（回落）双轨执行。触发词：D365、Dynamics、Case、Labor、Note、Timeline、OneSupport、CRM、Email、Draft、SAP。
---

# D365 Case Operations

通过 OData API（优先）和 `playwright-cli` UI 操作（回落）双轨驱动 Dynamics 365 CRM（OneSupport）。

## 前置条件

1. **playwright-cli skill 已加载**
2. **已进入应用**：运行 `scripts/open-app.ps1` 启动浏览器并进入 Copilot Service workspace（默认无头模式）

> ⚠️ **登录/Cookie 过期处理**：`open-app.ps1` 默认以无头模式启动，依赖 persistent profile 中的登录态。如果脚本报错且页面跳转到登录页（如找不到 `#AppLandingPage` iframe），说明 Cookie 已过期，需要用有头模式让用户完成一次登录：
> ```powershell
> playwright-cli open https://onesupport.crm.dynamics.com/ --headed --browser=msedge --persistent
> ```
> 用户在浏览器中完成登录/MFA 后，persistent profile 会保存新的 Cookie。之后关闭浏览器（`playwright-cli close`），重新用 `open-app.ps1` 以无头模式启动即可。

## 可用脚本

**所有脚本都是黑盒执行，先用 `--help` 或 `-?` 查看用法，不要读取源码以避免污染上下文窗口。**

### 打开应用和 Case

```powershell
# 启动浏览器并进入 Copilot Service workspace
pwsh scripts/open-app.ps1

# 列出 Dashboard 上的所有 Case（自动检测所有表格，不绑定特定 Dashboard）
pwsh scripts/list-cases.ps1
pwsh scripts/list-cases.ps1 -View "My Open Cases"   # 可选：只看指定表格

# 搜索 Case（全局搜索，返回 Case 编号、标题、严重级别、状态、负责人）
pwsh scripts/search-case.ps1 -Keyword "2602280040000729"     # 按 Case 编号搜索
pwsh scripts/search-case.ps1 -Keyword "PostgreSQL"           # 按关键词搜索
pwsh scripts/search-case.ps1 -Keyword "2602280040000729" -Open  # 搜索并直接打开第一个匹配的 Case

# 打开指定 Case（通过 Case 编号或标题关键词匹配，仅在 Dashboard 列表中查找）
pwsh scripts/open-case.ps1 -Keyword "2602280040000729"

# 查看/切换已打开的 Case Tab
pwsh scripts/switch-case.ps1                              # 列出所有打开的 Tab
pwsh scripts/switch-case.ps1 -Keyword "2602280040000729"  # 切换到指定 Case
```

### 记录 Labor

D365 打开 Case 后会自动启动 session 计时器。记录 Labor 有两种方式：

```powershell
# 方式 1：手动指定时长
pwsh scripts/record-labor.ps1 -Minutes 30
pwsh scripts/record-labor.ps1 -Minutes 60 -Classification "Troubleshooting" -Description "See case notes"

# 方式 2：使用 D365 session 自动计时值（Duration 字段保留系统自动填入的值，不覆盖）
pwsh scripts/record-labor.ps1 -UseSessionTime
```

### 查看 Labor

```powershell
pwsh scripts/view-labor.ps1
pwsh scripts/view-labor.ps1 -Count 5
```

### 添加 Note

```powershell
pwsh scripts/add-note.ps1 -Title "Progress Update" -Body "内容..."
```

### 查看 Timeline

```powershell
# 返回 JSON 格式的 Timeline 摘要
pwsh scripts/view-timeline.ps1

# 刷新 Timeline（操作后获取最新状态）
pwsh scripts/refresh-timeline.ps1
```

### 查看 Case 详情

```powershell
pwsh scripts/view-details.ps1    # 读取 Case Number、标题、Severity、Status、SAP、Age 等字段
```

### 添加 Phone Call 记录

```powershell
# 基本用法（Outbound 外呼，Call From = 自己，Call To = Case 联系人，系统自动填充）
pwsh scripts/add-phone-call.ps1 -Subject "Discussed migration plan"

# 指定时长和电话号码
pwsh scripts/add-phone-call.ps1 -Subject "Follow-up call" -Minutes 30
pwsh scripts/add-phone-call.ps1 -Subject "Called customer" -PhoneNumber "+8613800138000"
```

### 请求 Case 访问权限

```powershell
# 默认以 Case review 为由请求访问
pwsh scripts/request-access.ps1

# 指定原因（可选：Swarming, Backup, TechRouter, Escalation, CaseReview, RootCause, IcM, Other）
pwsh scripts/request-access.ps1 -Reason Swarming
pwsh scripts/request-access.ps1 -Reason Escalation
```

### 新建邮件草稿

```powershell
# 新建邮件草稿（To/Cc/Subject 系统自动填充，保存为 Draft 供 review 后手动点 Send）
pwsh scripts/new-email.ps1 -Body "Hi, please check the migration guide."

# 覆盖默认 Subject
pwsh scripts/new-email.ps1 -Body "Issue resolved." -Subject "Resolution - Case 123"
```

### 编辑 / 打开 / 删除邮件草稿

```powershell
# 编辑当前打开的草稿（在 new-email 之后，Draft Tab 保持打开状态使用）
pwsh scripts/edit-draft.ps1 -Body "P.S. one more thing..."              # 追加到正文末尾
pwsh scripts/edit-draft.ps1 -Body "Completely new content." -Replace     # 替换整个正文（签名保留）

# 从 Timeline 中打开一封 Draft Email（配合 view-timeline 使用）
pwsh scripts/open-draft.ps1             # 打开最新的 Draft
pwsh scripts/open-draft.ps1 -Index 2    # 打开第二封 Draft

# 删除当前打开的 Draft Email（必须先 open-draft 进入 Email 编辑器）
pwsh scripts/delete-draft.ps1
```

### 回复邮件

```powershell
# 从 Timeline 直接回复最新的邮件（hover → Reply All → 注入正文 → Save 为草稿）
pwsh scripts/reply-email.ps1 -Body "Hi, thanks for your update."
pwsh scripts/reply-email.ps1 -Body "Please see details below." -Index 2  # 回复第二封

# 从 Timeline 打开一封邮件查看内容（非必需，可独立使用）
pwsh scripts/open-email.ps1                          # 打开最新的邮件
pwsh scripts/open-email.ps1 -Filter "Received"       # 打开最新的 Received Email
```

### 查看附件

```powershell
pwsh scripts/view-attachments.ps1    # 只读取附件数量（DTM 系统需手动操作）
```

### 抓取 Case 完整快照（含缓存）

```powershell
# 首次抓取：通过 API 抓取所有信息，保存到 workspace-dfmworker/cases/{CaseNumber}/case-info.md
pwsh scripts/fetch-case-snapshot.ps1 -TicketNumber "2603100030005863"

# 强制刷新（忽略缓存）
pwsh scripts/fetch-case-snapshot.ps1 -TicketNumber "2603100030005863" -CacheMinutes 0

# 自定义输出目录
pwsh scripts/fetch-case-snapshot.ps1 -TicketNumber "2603100030005863" -OutputDir "C:\cases"
```

> 纯 API 操作，**不需要浏览器**（不需要 open-app）。10 分钟内重复查询直接读本地缓存。

### 下载 DTM 附件

```powershell
# 下载 Case 的所有 DTM 附件
pwsh scripts/download-attachments.ps1 -TicketNumber "2603060030001353"

# 强制重新下载（覆盖已有文件）
pwsh scripts/download-attachments.ps1 -TicketNumber "2603060030001353" -Force
```

> 需要浏览器已打开（open-app）。自动检测已有文件并跳过（按文件名+大小判断）。
> 无附件时自动跳过，不报错。

### 修改 Support Area Path (SAP)

```powershell
# 两级 SAP（Family + Name）
pwsh scripts/edit-sap.ps1 -Family "Windows" -Name "PSS Other"

# 三级 SAP（Family + Name + Version）
pwsh scripts/edit-sap.ps1 -Family "Azure" -Name "21Vianet Mooncake" -Version "21Vianet China Azure Cosmos DB"
```

## 📍 页面上下文模型

脚本运行依赖当前页面所处的"上下文"。Agent 在编排脚本时，必须根据此模型判断是否需要先切换上下文。

### 上下文定义

| 上下文 | 说明 | 如何到达 |
|--------|------|---------|
| **Dashboard** | Support Engineer Dashboard，含 Case 列表 | `open-app` 或 `switch-case` 切到 Dashboard tab |
| **Case Form** | 打开 Case 后的表单页面（含 Summary/Timeline/Details 等 tab） | `open-case`、`search-case -Open`、`switch-case` |
| **Email Editor** | 新建/编辑/回复邮件时的编辑器页面 | `new-email`、`open-draft`、`open-email`、`reply-email` |
| **Search Results** | 全局搜索结果页面 | `search-case`（不加 `-Open`） |

### 脚本的前置/后置上下文

| 脚本 | 需要的上下文 | 执行后的上下文 | 备注 |
|------|:----------:|:------------:|------|
| **open-app** | 任意 | Dashboard | |
| **list-cases** | Dashboard | Dashboard | |
| **search-case** | 任意 | Search Results | 加 `-Open` 则为 Case Form |
| **open-case** | Dashboard | Case Form | 从 Dashboard 列表匹配 |
| **switch-case** | 任意 | Case Form / Dashboard | 切换到已打开的 Tab |
| **view-details** | Case Form | Case Form | 自动切到 Details tab |
| **view-timeline** | Case Form | Case Form | 自动切到 Summary tab |
| **view-labor** | Case Form | Case Form | 自动切到 Labor tab |
| **view-attachments** | Case Form | Case Form | 不切换 tab，原地读取 |
| **refresh-timeline** | Case Form | Case Form | 自动切到 Summary tab |
| **add-note** | Case Form | Case Form | 自动切到 Summary tab |
| **record-labor** | Case Form | Case Form | 自动切到 Labor tab |
| **add-phone-call** | Case Form | Case Form | 自动切到 Summary tab |
| **new-email** | Case Form | Email Editor | ⚠️ 后续操作需先 `switch-case` 回 Case |
| **edit-draft** | Email Editor | Email Editor | 必须在已打开的 Draft 上 |
| **open-draft** | Case Form | Email Editor | ⚠️ 同 new-email |
| **open-email** | Case Form | Email Editor | ⚠️ 同 new-email |
| **delete-draft** | Email Editor | Case Form | 删除后自动回到 Case tab |
| **reply-email** | Case Form | Email Editor | ⚠️ 同 new-email |
| **edit-sap** | Case Form | Case Form | |
| **request-access** | Case Form | Case Form | |

### 编排规则

1. **Case Form 内的 tab 切换**（Summary ↔ Timeline ↔ Details ↔ Labor）：脚本内部自动处理，Agent 无需干预
2. **Email Editor → Case Form**：必须用 `switch-case` 切回
3. **Search Results → Case Form**：用 `switch-case` 或重新 `open-case`
4. **Dashboard → Case Form**：用 `open-case` 或 `search-case -Open`
5. **如果脚本报 `ERR: Not on Case Form`**：先用 `switch-case -Keyword <CaseNumber>` 切回

## ⚠️ 脚本执行注意事项

- **API First + UI Fallback**：读操作（view-details/timeline/labor/attachments）和写操作（add-note/record-labor/add-phone-call）优先通过 OData API 执行，失败时自动回落到 UI 操作。对调用方透明。
- 脚本通过 `playwright-cli run-code` 调用 Playwright API 和 OData API，使用稳定选择器
- 如果脚本报错，参考 [references/popup-handling.md](references/popup-handling.md) 处理弹窗
- 脚本执行完成后会输出结果（成功/失败 + 数据），无需额外 snapshot
- **工作区治理（自动）**：`_init.ps1` 会将 `playwright-cli` 运行产物输出到 `$env:TEMP\d365-case-ops-runtime\.playwright-cli`，并执行日志轮转与过期清理（默认每类保留 10 个、清理 7 天前文件）
  - 若外部（客户端/平台）已设置 `PLAYWRIGHT_MCP_OUTPUT_DIR`，脚本会尊重该值，不覆盖
  - 关闭清理：`$env:D365_WORKSPACE_HYGIENE_DISABLE='1'`
  - 调整保留数量：`$env:D365_PLAYWRIGHT_LOG_KEEP='20'`
  - 调整过期天数：`$env:D365_PLAYWRIGHT_LOG_MAX_AGE_DAYS='14'`
- **浏览器生命周期**：`open-app.ps1` 启动的浏览器进程会持续运行，供后续所有脚本复用。**当所有 D365 操作完成后，必须运行 `playwright-cli close` 关闭浏览器，释放系统资源。** 不要在每个脚本之间关闭——连续操作共享同一个浏览器会话。
- 如需调试或扩展新操作，参考 [references/selectors.md](references/selectors.md) 和 [assets/unscripted-operations.md](assets/unscripted-operations.md)
- 排查 Case 时，参考 [references/troubleshooting-guide.md](references/troubleshooting-guide.md) 的三要素提取和决策树

## 🛡️ 写操作安全规则

**执行任何写操作之前，必须先向用户展示即将执行的内容，等待明确确认后再执行。绝不在未经用户同意的情况下自动执行写操作。**

| 操作 | 确认前展示内容 |
|------|--------------|
| add-note | Note 标题和正文全文 |
| record-labor | 分类、时长、描述、日期 |
| add-phone-call | 通话主题、方向、通话对象 |
| new-email / reply-email | 邮件正文全文、收件人 |
| edit-sap | 当前 SAP → 目标 SAP |
| edit-draft -Replace | 替换后的完整正文 |
| request-access | 请求原因 |

例外：以下操作风险极低，可直接执行无需确认：
- `view-*`、`list-cases`、`search-case`、`switch-case`（纯读操作）
- `refresh-timeline`、`open-email`、`open-draft`（纯导航）
- `delete-draft`（删除的是未发送的草稿，且用户通常是刚创建的）

## 🔍 错误诊断指南

脚本报错时，按以下表格判断根因和处理方式：

| 错误表现 | 根因 | 处理 |
|---------|------|------|
| `Not on Case Form` | 页面不在 Case 上下文 | `switch-case -Keyword <CaseNumber>` 切回 |
| API 返回 `HTTP 401` | Cookie/Session 过期 | 用有头模式重新登录：`playwright-cli open https://onesupport.crm.dynamics.com/ --headed --browser=msedge --persistent` |
| API 返回 `HTTP 403` | 无权限访问此 Case | 运行 `request-access.ps1` 请求权限 |
| API 返回 `HTTP 404` | 实体/端点不存在 | 检查 incidentid 是否正确，清除缓存文件 `$env:TEMP/d365-case-context.json` |
| `More Tabs not found` / `Related not found` | 视口太小或 D365 布局变化 | 确认 `setViewportSize(1920, 1080)` 已执行 |
| `Timeout` / 选择器找不到 | UI 变化或弹窗阻塞 | `playwright-cli snapshot` 查看页面状态，处理弹窗 |
| `Case not found` (search/open) | Case 编号错误或不在 Dashboard | 确认 ticket number 格式（16 位数字） |
| Resolve 失败 | 有未关闭的 Open 活动 | 先关闭所有 Open Email/Phone Call |
| `(API failed, falling back to UI...)` | API 端点变化或临时故障 | 自动回落到 UI，无需干预。如持续失败，检查 API 端点 |
| `Playwright error` | 浏览器状态异常 | `playwright-cli close` 后重新 `open-app.ps1` |

## 🔧 Skill 维护与进化

本 Skill 支持 Agent 在使用过程中自主维护和扩展。修改会持久化到文件系统，热加载即时生效。

### 设计原则（新建/修改脚本前必读）

1. **脚本原子化**：每个脚本只做一件事。Agent 负责编排和循环，脚本不做多步流程。
2. **验证页面状态**：操作前必须检查当前页面是否符合预期（如 `delete-draft` 先检查 Send Email 按钮），不符合则报错退出。
3. **Agent 编排依赖**：脚本之间的依赖由 Agent 判断，不在脚本内硬编码。典型流程：`view-timeline` → `open-draft` → `delete-draft`。
4. **输出驱动决策**：脚本输出包含足够信息让 Agent 判断下一步（如 `view-timeline` 输出条目类型，Agent 据此决定是否需要 `open-draft`）。
5. **不做假设**：找不到选择器就报错退出，不猜测替代方案。让 Agent 根据错误信息决定下一步。

### 脚本报错时的自修复流程

1. 读取脚本输出的错误信息，对照上方「错误诊断指南」判断问题类型
2. 如果是 API 错误：检查 [references/api-reference.md](references/api-reference.md) 中的端点和字段名是否仍然有效
3. 如果是 UI 错误：用 `playwright-cli snapshot` 查看当前页面实际状态
4. 定位根因：API 字段变化？选择器失效？页面未加载？弹窗阻塞？前置步骤遗漏？
5. 直接编辑 `scripts/*.ps1` 修复问题（脚本是普通 PowerShell 文件）
6. 重新运行脚本验证修复效果
7. 同步更新相关文档：
   - API 变化 → `references/api-reference.md`
   - 选择器变化 → `references/selectors.md`
   - 新技术发现 → `references/technical-notes.md`

### 创建新脚本

当用户需要的操作没有现成脚本时：

1. 查看 [assets/unscripted-operations.md](assets/unscripted-operations.md) 了解已有的探索信息和选择器
2. **优先考虑 API 实现**：查看 [references/api-reference.md](references/api-reference.md) 是否有对应的 OData 端点
3. 如果有 API：实现 API First + UI Fallback 模式（参考 `add-note.ps1` 的结构）
4. 如果只有 UI：用 `playwright-cli snapshot` 探索目标操作的 UI 结构
3. 提取稳定选择器，遵循以下优先级：
   - ✅ `getByRole('button/menuitem/dialog/...', { name })` — 大多数元素可用
   - ✅ `page.locator('[role=tab][aria-label=...]')` — Case Form 的 tab 必须用 CSS 选择器（`getByRole('tab')` 在 D365 UCI 中不可靠）
   - ❌ ref ID（如 `e1277`）和 DOM ID（如 `#TextField295`）— 禁止使用
4. 创建 `scripts/<operation>.ps1`，开头必须 `. "$PSScriptRoot\_init.ps1"`
5. 使用 `_init.ps1` 的公共函数：
   - `Invoke-PlaywrightCode` — 执行 Playwright JS 代码
   - `Invoke-D365Api` — 调用 OData API（API First 模式）
   - `Get-IncidentId` / `Get-CurrentCaseId` — 获取 Case GUID
   - `Ensure-CaseFormContext` — 验证/切换 Case Form 上下文
   - `ConvertTo-EmailHtml`、`ConvertTo-JsString` — 格式转换
6. 脚本必须有 `.SYNOPSIS`、`.DESCRIPTION`、`.EXAMPLE` 帮助文档
7. 更新以下文件：
   - **本文件 `SKILL.md`**：添加脚本用法示例
   - **`references/selectors.md`**：添加新发现的选择器
   - **`assets/unscripted-operations.md`**：移除已完成的条目
8. 关键技术决策记录到 [references/technical-notes.md](references/technical-notes.md)

### 自主操作边界

| 操作 | Agent 可自主执行 | 需人类确认 |
|------|:---:|:---:|
| 修复失效选择器 | ✅ | |
| 修复脚本逻辑 bug | ✅ | |
| 修复 API 端点/字段名变化 | ✅ | |
| 添加新的类型识别（如 Timeline 新条目类型） | ✅ | |
| 更新文档和选择器/API 映射 | ✅ | |
| 更新 incidentid 缓存文件 | ✅ | |
| 创建全新脚本 | | ✅ |
| 删除或重命名现有脚本 | | ✅ |
| 改变现有脚本的行为逻辑 | | ✅ |
| 执行任何写操作（add/record/edit/delete） | | ✅ |
