---
description: "拉取 Case 最新数据 + ICM 信息。可独立调用 /data-refresh {caseNumber}，也被 casework 内联执行。"
allowed-tools:
  - Bash
  - Read
  - Write
  - mcp__icm__get_incident_details_by_id
  - mcp__icm__get_ai_summary
---

# /data-refresh — 拉取 Case 最新数据

对单个 Case 执行数据刷新：D365 快照 + 邮件 + 笔记 + 附件 + ICM。

## 参数
- `$ARGUMENTS` — Case 编号（如 `2603100030005863`）

## 配置读取
```
读取 config.json 获取 casesRoot
设置 caseDir = {casesRoot}/active/{caseNumber}/（使用绝对路径）
确保 caseDir 存在：mkdir -p "{caseDir}"
```

## ⚠️ 重要：D365 脚本参数约定（违反会导致文件写入错误位置）

- 参数名是 **`-TicketNumber`**（不是 -CaseNumber）
- **`-OutputDir` 必须传 `{casesRoot}/active`（父目录，不含 case number）**
  - ✅ 正确：`-OutputDir "C:\...\cases\active"`
  - ❌ 错误：`-OutputDir "C:\...\cases\active\2603090040000814"` ← 会导致嵌套目录！
- 脚本内部会自动 `Join-Path $OutputDir $TicketNumber` 创建 case 子目录
- **调用方式**：必须用 `pwsh -NoProfile -File`（不用 `pwsh -Command`）

## 执行日志

**每个步骤执行前后都必须写入日志文件 `{caseDir}/logs/data-refresh.log`。**

日志格式（每行一条，append 模式）：
```
[YYYY-MM-DD HH:MM:SS] STEP {步骤号} {状态} | {描述}
```

示例：
```
[2026-03-17 11:08:00] STEP 0 START | Browser pre-check
[2026-03-17 11:08:05] STEP 0 OK    | D365 tab found, browser ready
[2026-03-17 11:08:06] STEP 1 START | fetch-all-data.ps1
[2026-03-17 11:08:20] STEP 1 OK    | case-info.md saved (Sev C, Status: Pending customer response)
[2026-03-17 11:08:53] STEP 2 START | download-attachments.ps1
[2026-03-17 11:09:10] STEP 2 FAIL  | DTM token acquisition failed (no browser session)
[2026-03-17 11:09:11] STEP 3 SKIP  | ICM: no ICM linked to case
```

**规则：**
- 用 Bash `echo "[$(date '+%Y-%m-%d %H:%M:%S')] ..." >> {caseDir}/logs/data-refresh.log` 写入
- `{caseDir}/logs/` 目录不存在时先创建
- 每个脚本的 **exit code 和关键输出摘要** 都要记录
- 脚本失败时记录 stderr 前 200 字符
- 这个日志是排障用的，不需要记录完整脚本输出

## 执行步骤

### 0. 浏览器预检（read-only，不做重连）
D365 脚本依赖 playwright-cli 连接到已登录的 Edge 浏览器。
`_init.ps1` 的 `Ensure-D365Tab` + `Restart-D365Browser` 已覆盖 tab 切换和浏览器重启，Step 0 **只做状态检测**，不尝试 `open` 重连（避免 profile lock 冲突）。

**Step 0a: 清除上一个 case 的 incident ID 缓存**
```bash
pwsh -NoProfile -c 'Remove-Item -Path (Join-Path $env:TEMP "d365-case-context.json") -Force -ErrorAction SilentlyContinue'
```
> ⚠️ 必须用**单引号**包裹 PowerShell 代码，防止 bash 展开 `$env` 和 `$cachePath`。

**Step 0b: 检查浏览器状态**
```bash
playwright-cli tab-list --browser msedge 2>&1
```
> ⚠️ 必须加 `--browser msedge`，本机无 Chrome，默认 `chrome` 会报 `not found`。
> ⚠️ **不要**加 `--profile`，`tab-list` 不需要且会触发 profile lock 冲突。

**判断逻辑**：
- 输出包含 `dynamics.com` → ✅ 浏览器就绪，继续
- 输出包含 `login.microsoftonline` / `Sign in` → ⚠️ 记录 warning，继续（脚本内部会重连）
- 报错 `no browser` / `not found` / `already in use` → ⚠️ 记录 warning，继续（脚本内部会处理）

**关键原则**：Step 0 检测失败**不阻塞**后续步骤，`_init.ps1` 的 `Invoke-D365Api` / `Invoke-D365ApiBatch` 有 `Ensure-D365Tab` 守卫 + browser restart + API retry 逻辑（首次失败→重启浏览器→重试一次）。

### 1. D365 数据拉取（snapshot + emails + notes 并行 + IR check）
使用并行脚本一次性拉取三个数据源并检查 IR：

```bash
pwsh -NoProfile -File skills/d365-case-ops/scripts/fetch-all-data.ps1 -TicketNumber {caseNumber} -OutputDir {casesRoot}/active -CacheMinutes 10 -IncludeIrCheck -MetaDir {casesRoot}/active
```

此脚本内部：
- 并行执行 fetch-case-snapshot + fetch-emails + fetch-notes
- 完成后执行 check-ir-status（**优先使用 API 查询 msdfm_caseperfattributes ~2s**，API 失败时降级到 UI scraping ~15-20s）

> **巡检优化**：patrol 模式下，可先运行 `check-ir-status-batch.ps1 -SaveMeta` 一次性预填所有 case 的 IR/FDR/FWR meta，
> 后续 fetch-all-data.ps1 检测到 meta 中 `irSla.status === "Succeeded"` 时会跳过 IR check，进一步减少耗时。

### 2. 附件下载（DTM）

**先检查是否有附件**：读 `{caseDir}/case-info.md`，找 `DTM Attachments: N`。如果 N = 0，跳过此步骤。

如果有附件：
```bash
pwsh -NoProfile -File skills/d365-case-ops/scripts/download-attachments.ps1 -TicketNumber {caseNumber} -OutputDir {casesRoot}/active
```

**注意事项**：
- 此脚本依赖 playwright-cli + Edge 浏览器的 D365 session
- Token 解析优先级：① `dtm-token-global.json`（预热写入的全局 token，跨 workspace 通用） → ② `dtm-token-$workspaceId.json`（per-workspace 缓存） → ③ Playwright 导航截获（兜底）
- **如果 `dtm-token-global.json` 存在且有效（<50 分钟），附件下载自动使用预热 token，无需 Playwright 导航**——这是 patrol 全并行的基础
- 如果脚本失败，在输出中明确记录失败原因（如"DTM token 获取失败"），
  以便 inspection-writer 正确标注
- **不要忽略此步骤的失败**——即使其他步骤成功，附件下载失败应被报告
- 脚本 exit code 非 0 时，记录 stderr/stdout 并在最终汇报中标注

### 3. ICM 数据拉取
从 `case-info.md` 读取 ICM Number，如果有 ICM 则：
- 使用 `mcp__icm__get_ai_summary` 获取摘要
- 使用 `mcp__icm__get_incident_details_by_id` 获取详情
- 将结果写入 `{caseDir}/icm/icm-summary.md` 和 `{caseDir}/icm/icm-details.md`
- 无 ICM 则跳过

### 4. IR 状态检查
**已合并到 Step 1 的 fetch-all-data.ps1 中**（通过 `-IncludeIrCheck` 参数）。不需要单独执行。

> **性能说明**：check-ir-status.ps1 现在默认使用 API 查询 `msdfm_caseperfattributes` 实体（~2s），
> 不再需要 Playwright 导航到 Case 页面。API 失败时自动降级到 UI scraping。

## 输出文件
- `{caseDir}/case-info.md` — Case 快照
- `{caseDir}/emails.md` — 邮件历史
- `{caseDir}/notes.md` — Notes 历史
- `{caseDir}/attachments/` — 附件目录
- `{caseDir}/icm/` — ICM 数据目录

## 错误处理
- D365 脚本失败 → 记录错误但继续执行其他步骤
- **附件下载失败 → 明确记录失败原因**（如 "DTM token 获取失败"、"Playwright 未连接"），不要静默跳过
- ICM MCP 不可用 → 跳过 ICM 数据拉取，记录警告
- IR 检查失败 → 记录警告，沿用已有值（如有）
- 所有步骤执行完毕后汇报执行结果和遇到的问题，明确标注每个步骤的成功/失败状态
