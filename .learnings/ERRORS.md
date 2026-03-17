# Errors Log

记录遇到的错误和解决方案，避免重复踩坑。

## 格式
```
### YYYY-MM-DD — 错误描述
- 症状：...
- 原因：...
- 解决：...
- 预防：...
```

---

### 2026-03-15 — D365 Entitlement 数据全部返回 null

- 症状：fetch-case-snapshot.ps1 中 `_msdfm_entitlementredemptionid_value` 字段在所有 Case 上返回 null，导致 Entitlement 数据缺失
- 原因：不是 API 字段变更。playwright-cli 当前 tab 在 about:blank 而非 D365 页面，导致 fetch() 相对 URL 无法解析，所有 API 调用静默返回 null
- 解决：手动切到 D365 tab 后正常。在 `Invoke-D365Api` 或 `fetch-case-snapshot.ps1` 入口加 tab 预检（`Ensure-D365Tab`）
- 预防：D365 脚本入口统一加 tab 守卫，确保在 D365 tab 上再调 API
- 相关文件：`skills/d365-case-ops/scripts/fetch-case-snapshot.ps1` (line 94)

### 2026-03-16 — Teams ListChatMessages filter/orderby 不可用

- 症状：`ListChatMessages` 的 schema 看起来支持 `filter`/`orderby`/`top`，但实际调用报错
- 原因：后端不支持 `createdDateTime` 做 filter 或 orderby，错误信息明确指出 not supported/not allowed
- 解决：放弃用 `ListChatMessages(filter/orderby)` 做时间切片增量抓取；改用 `SearchTeamsMessages` 自然语言时间窗做增量入口，命中的 chat 再用 `ListChatMessages` 全量拉取
- 预防：工具 schema 不等于后端真实能力，增量方案必须以实测为准。已记入 Teams skill 文档
- 相关文件：`skills/teams-case-search/scripts/fetch-teams.ps1`

### 2026-03-16 — playwright-cli Chrome not found + Edge 切换

- 症状：`playwright-cli tab-list` 报 `Chromium distribution 'chrome' is not found at ...chrome.exe`
- 原因：本机没装 Chrome，playwright-cli 默认找 chrome
- 解决：在 cwd 下创建 `.playwright/cli.config.json`，配置 `{"browser":{"browserName":"chromium","launchOptions":{"channel":"msedge"}}}`
- 追加：需要用 `playwright-cli open --persistent --profile d365` 启动，才能复用 Edge 的 SSO 登录状态
- 注意：playwright-cli 的 session 是 per-workspace-dir 的，不同 cwd 需要各自启动 session
- 预防：项目根目录和 `.claude/` 目录都放一份 `.playwright/cli.config.json`

### 2026-03-16 — D365 脚本参数名是 -TicketNumber 不是 -CaseNumber

- 症状：`A parameter cannot be found that matches parameter name 'CaseNumber'`
- 原因：所有 D365 脚本用 `-TicketNumber` 参数名
- 解决：修正 subagent 定义中的参数名
- 追加：`-OutputDir` 的语义是父目录（`cases/active/`），脚本内部 `Join-Path $OutputDir $TicketNumber`，不要传带 case number 的完整路径
- 预防：已更新 data-refresh.md agent 文档

### 2026-03-17 — check-ir-status.ps1 FDR/FWR 返回 unknown

- 症状：IR SLA 正确返回 Succeeded，但 FDR 和 FWR 始终返回 unknown
- 原因：D365 UI 的 KPI "Expired" 状态有两种 DOM selector —— `ViolatedTimerLabelID`（计时器超时）和 `UnsucceededLabelId`（直接标记未成功）。脚本只检查了前者，FDR/FWR 用的是后者
- 解决：在两处 `parseKpi` 函数中都追加 `UnsucceededLabelId` 检查（行 ~68 和 ~100）
- 验证：修复后 FDR=Expired, FWR=Expired，符合 UI 显示
- 预防：D365 KPI 选择器不能假设只有一种 Expired 表示，通过 debug 脚本 dump 所有 `data-id` 元素来确认
- 相关文件：`skills/d365-case-ops/scripts/check-ir-status.ps1`

### 2026-03-17 — fetch-emails.ps1 cid 图片无后缀 + 签名图片未过滤

- 症状：images/ 目录下 `inlineimg_XXX` 文件没有扩展名，无法直接打开；同时充满了签名小图标
- 原因：cid 图片的 `att.filename` 可能不带扩展名，旧代码直接用 filename 做文件名；没有签名过滤逻辑
- 解决：新增 `Ensure-Extension` 从 MIME type 补后缀；新增 `Test-SignatureImage` 按文件名模式（logo/icon/linkedin/image00x.png）和大小（< 2KB）跳过
- 验证：单元测试 12/12 通过；端到端未验证（D365 session 过期）
- 预防：所有文件保存前确保有有效扩展名
- 相关文件：`skills/d365-case-ops/scripts/fetch-emails.ps1`

### 2026-03-17 — write-teams.ps1 时区偏移：UTC 时间显示为本地时间

- 症状：消息时间 `2026-03-12T09:11:44Z` 应显示 17:11 (GMT+8) 但显示了 09:11
- 原因：`ConvertFrom-Json` 把 `"...Z"` 结尾的 ISO 时间解析为 `System.DateTime(Kind=Utc)`；但 PowerShell `.ToString()` 输出不带 Z 后缀（如 `03/12/2026 09:11:44`）；`DateTimeOffset::Parse` 拿到没有时区标记的字符串后当成本地时间 (GMT+8)，`.ToOffset(+8)` 自然不变
- 解决：在 `To-Gmt8` 函数中检测输入类型，如果是 `DateTime` 则显式构造 `new DateTimeOffset(dt, TimeSpan.Zero)` 确保按 UTC 处理
- 预防：PowerShell 中处理 JSON 日期时永远检查 `ConvertFrom-Json` 的自动类型转换
- 相关文件：`skills/teams-case-search/scripts/write-teams.ps1`

### 2026-03-17 — playwright-cli --profile 相对路径把浏览器数据写入 cases/active/

- 症状：`cases/active/d365/` 出现一个包含 Edge 浏览器 profile 数据的目录（Default/、Crashpad/、Local State 等）
- 原因：`playwright-cli open --persistent --profile d365` 的 `--profile` 参数是相对路径，浏览器数据创建在了 cwd 下。当时 cwd 恰好在项目根目录，profile 落到了 `cases/active/d365/`
- 解决：用绝对路径 `--profile "$TEMP/playwright-d365-profile"`；删除误创建的目录（需先 `playwright-cli kill-all`）
- 预防：`--profile` 永远用绝对路径（`$TEMP` 或 `$HOME`），不用相对路径
- 相关文件：`.claude/agents/data-refresh.md`
