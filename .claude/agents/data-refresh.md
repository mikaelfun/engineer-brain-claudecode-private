---
description: "拉取 Case 最新数据 + ICM 信息"
tools: ["Bash", "Read", "Write"]
model: "sonnet"
maxTurns: 20
---

# Data Refresh Agent

## 职责
拉取指定 Case 的最新数据并落盘到 case 目录。

## 输入
- `caseNumber`: Case 编号（即 ticketNumber，如 `2603100030005863`）
- `casesRoot`: Case 数据根目录路径（如 `./cases`），从 `config.json` 读取

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
[2026-03-17 11:08:06] STEP 1a START | fetch-case-snapshot.ps1
[2026-03-17 11:08:20] STEP 1a OK    | case-info.md saved (Sev C, Status: Pending customer response)
[2026-03-17 11:08:21] STEP 1b START | fetch-emails.ps1
[2026-03-17 11:08:45] STEP 1b OK    | 25 emails saved
[2026-03-17 11:08:46] STEP 1c START | fetch-notes.ps1
[2026-03-17 11:08:52] STEP 1c OK    | 3 notes saved
[2026-03-17 11:08:53] STEP 2 START | download-attachments.ps1
[2026-03-17 11:09:10] STEP 2 FAIL  | DTM token acquisition failed (no browser session)
[2026-03-17 11:09:11] STEP 3 SKIP  | ICM: no ICM linked to case
[2026-03-17 11:09:12] STEP 4 START | check-ir-status.ps1
[2026-03-17 11:09:30] STEP 4 OK    | IR=Succeeded FDR=Expired FWR=Expired
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
`fetch-all-data.ps1` 内部已有 browser restart + retry 机制，Step 0 **只做状态检测**，不尝试 `open` 重连（避免 profile lock 冲突）。

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

**关键原则**：Step 0 检测失败**不阻塞**后续步骤，`fetch-all-data.ps1` 有完整的 browser restart + API retry 逻辑。

### 1. D365 数据拉取（snapshot + emails + notes 并行 + IR check）
使用并行脚本一次性拉取三个数据源并检查 IR：

```
pwsh -NoProfile -File skills/d365-case-ops/scripts/fetch-all-data.ps1 -TicketNumber {caseNumber} -OutputDir ./cases/active -CacheMinutes 10 -Force -IncludeIrCheck -MetaDir ./cases/active
```

此脚本内部：
- 并行执行 fetch-case-snapshot + fetch-emails + fetch-notes
- 完成后在同一 playwright session 执行 check-ir-status（复用浏览器连接，省 ~10s）

### 2. 附件下载（DTM）

**先检查是否有附件**：读 `{caseDir}/case-info.md`，找 `DTM Attachments: N`。如果 N = 0，跳过此步骤。

如果有附件：
```
pwsh -NoProfile -File skills/d365-case-ops/scripts/download-attachments.ps1 -TicketNumber {caseNumber} -OutputDir ./cases/active
```

**注意事项**：
- 此脚本依赖 playwright-cli + Edge 浏览器的 D365 session
- 需要浏览器处于 D365 页面上下文才能获取 DTM token
- 如果脚本失败，在输出中明确记录失败原因（如"DTM token 获取失败"），
  以便 inspection-writer 正确标注
- **不要忽略此步骤的失败**——即使其他步骤成功，附件下载失败应被报告
- 脚本 exit code 非 0 时，记录 stderr/stdout 并在最终汇报中标注

### 3. ICM 数据拉取
参考 `skills/agency-icm/SKILL.md` 获取 ICM 查询方法：
- 使用 ICM MCP 工具拉取 ICM 信息
- 写入 `{casesRoot}/active/{caseNumber}/icm/`：
  - `icm-summary.md` — ICM 概要
  - `icm-details.md` — ICM 详情
  - `icm-impact.md` — 影响范围

### 4. IR 状态检查
**已合并到 Step 1 的 fetch-all-data.ps1 中**（通过 `-IncludeIrCheck` 参数）。不需要单独执行。

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
