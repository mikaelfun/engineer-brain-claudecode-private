---
description: "拉取 Case 最新数据 + ICM 信息。可独立调用 /data-refresh {caseNumber}，也被 casework 内联执行。"
name: data-refresh
displayName: 数据刷新
category: inline
stability: stable
requiredInput: caseNumber
mcpServers: [icm]
estimatedDuration: 30s
promptTemplate: |
  Execute data-refresh for Case {caseNumber}. Read .claude/skills/data-refresh/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
  - mcp__icm__get_incident_details_by_id
  - mcp__icm__get_ai_summary
---

# /data-refresh — 拉取 Case 最新数据

D365 快照 + 邮件 + 笔记 + 附件 + ICM。

## 参数
- `$ARGUMENTS` — Case 编号

## 配置读取
读取 `config.json` 获取 `casesRoot`，设置 `caseDir = {casesRoot}/active/{caseNumber}/`（绝对路径），`mkdir -p "{caseDir}"`。

## ⚠️ D365 脚本参数约定
- 参数名 **`-TicketNumber`**（不是 -CaseNumber）
- **`-OutputDir` 传父目录 `{casesRoot}/active`**（不含 case number），脚本内部自动 Join-Path
- 用 `pwsh -NoProfile -File`（不用 `-Command`）

## 日志规范
日志 append 到 `{caseDir}/logs/data-refresh.log`，格式 `[YYYY-MM-DD HH:MM:SS] STEP {n} {状态} | {描述}`。
**禁止**单独 Bash 调用写日志——合并到工作命令中：
```bash
LOG="{caseDir}/logs/data-refresh.log" && \
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 1 START | fetch-all-data.ps1" >> "$LOG" && \
pwsh -NoProfile -File skills/d365-case-ops/scripts/fetch-all-data.ps1 ... 2>&1 && \
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 1 OK | completed" >> "$LOG" || \
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 1 FAIL | see output" >> "$LOG"
```

## 执行步骤

### 0. 浏览器预检
**0a**: 清除上个 case 的 incident ID 缓存（仅当 casework 未预跑 changegate 时）：
```bash
pwsh -NoProfile -c 'Remove-Item -Path (Join-Path $env:TEMP "d365-case-context.json") -Force -ErrorAction SilentlyContinue'
```
> ⚠️ 如果 casework 已通过 `check-case-changes.ps1` 预检，incidentId 缓存已就绪且浏览器已预热，**跳过 Step 0a 和 0b**。casework 编排器在 spawn prompt 中通过 `--skip-browser-precheck` 指示。

**0b**: 检查浏览器状态（`playwright-cli tab-list --browser msedge 2>&1`）。
输出含 `dynamics.com` → 就绪。其他情况（login 页/报错）→ 记录 warning，继续。
**Step 0 失败不阻塞**——`_init.ps1` 有 Ensure-D365Tab + browser restart + API retry。

### 1. D365 数据拉取
```bash
pwsh -NoProfile -File skills/d365-case-ops/scripts/fetch-all-data.ps1 -TicketNumber {caseNumber} -OutputDir {casesRoot}/active -CacheMinutes 10 -IncludeIrCheck -MetaDir {casesRoot}/active
```
内部并行执行 snapshot + emails + notes，完成后执行 IR check（API 优先 ~2s，失败降级 UI scraping）。

### 2. 附件下载（DTM）
读 `{caseDir}/case-info.md` 检查 `DTM Attachments: N`。N=0 跳过。
```bash
pwsh -NoProfile -File skills/d365-case-ops/scripts/download-attachments.ps1 -TicketNumber {caseNumber} -OutputDir {casesRoot}/active
```
Token 优先级：① dtm-token-global.json → ② per-workspace 缓存 → ③ Playwright 截获。
**附件下载失败必须明确记录失败原因**，不要静默跳过。

### 3. ICM 数据拉取
从 case-info.md 读 ICM Number。有 ICM 则用 `mcp__icm__get_ai_summary` + `get_incident_details_by_id`，结果写入 `{caseDir}/icm/`。无 ICM 跳过。

## 错误处理
- D365 脚本失败 → 记录错误，继续其他步骤
- 附件下载失败 → 明确记录原因（DTM token 失败等）
- ICM MCP 不可用 → 跳过，记录警告
- 所有步骤完成后汇报各步成功/失败状态
