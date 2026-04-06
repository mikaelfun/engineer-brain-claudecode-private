---
description: "拉取 Case 最新数据 + ICM 信息。可独立调用 /data-refresh {caseNumber}，也被 casework 内联执行。"
name: data-refresh
displayName: 数据刷新
category: inline
stability: stable
requiredInput: caseNumber
estimatedDuration: 30s
promptTemplate: |
  Execute data-refresh for Case {caseNumber}. Read .claude/skills/data-refresh/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
  - mcp__playwright__browser_navigate
  - mcp__playwright__browser_run_code
  - mcp__playwright__browser_click
  - mcp__playwright__browser_snapshot
  - mcp__playwright__browser_wait_for
---

# /data-refresh — 拉取 Case 最新数据

D365 快照 + 邮件 + 笔记 + 附件 + ICM。

## 参数
- `$ARGUMENTS` — Case 编号

## 配置读取
读取 `config.json` 获取 `casesRoot`，设置 `caseDir = {casesRoot}/active/{caseNumber}/`（绝对路径），`mkdir -p "{caseDir}"`。

## AR Mode

当检测到 `isAR=true` 和 `mainCaseId={mainCaseNumber}` 时：

- **数据源变化**：
  - `case-info.md` / `emails.md` / `notes.md` / `attachments/` → 从 **main case** (`mainCaseId`) 拉取
  - `notes-ar.md` → 从 **AR case** (`caseNumber`) 拉取
- **跳过项**：
  - `emails-office.md` — AR 不需要
  - IR check — SLA 不是 AR owner 的责任
- **PowerShell 命令**：
  ```bash
  pwsh -NoProfile -File skills/d365-case-ops/scripts/fetch-all-data.ps1 -TicketNumber {caseNumber} -OutputDir {casesRoot}/active -MainCaseNumber {mainCaseId} -CacheMinutes 10 -MetaDir {casesRoot}/active
  ```
  `-MainCaseNumber` 触发 AR 模式，脚本内部会：
  1. 从 mainCaseNumber 拉取 snapshot/emails/notes → 存到 AR case 目录
  2. 从 AR caseNumber 拉取 notes → 存为 `notes-ar.md`
  3. 跳过 IR check

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

**AR Mode**:
```bash
pwsh -NoProfile -File skills/d365-case-ops/scripts/fetch-all-data.ps1 -TicketNumber {caseNumber} -OutputDir {casesRoot}/active -MainCaseNumber {mainCaseId} -CacheMinutes 10 -MetaDir {casesRoot}/active
```
内部会从 mainCaseId 拉取 snapshot + emails + notes 到 AR 目录，并从 AR caseNumber 拉取 notes-ar.md。IR check 自动跳过。

### 1.5. Labor 记录拉取
```bash
pwsh -NoProfile -File skills/d365-case-ops/scripts/view-labor.ps1 -TicketNumber {caseNumber} -OutputDir {casesRoot}/active
```
生成 `{caseDir}/labor.md`，供 `/labor-estimate` 判断当天是否已记录 labor。

**AR Mode**: AR case 使用自身 caseNumber 拉取 labor（labor 是按 case 记录的，不跟 main case）。

**错误处理**：labor 拉取失败记录 warning 到日志，不阻塞后续步骤。

### 2. 附件下载（DTM）
读 `{caseDir}/case-info.md` 检查 `DTM Attachments: N`。N=0 跳过。
```bash
pwsh -NoProfile -File skills/d365-case-ops/scripts/download-attachments.ps1 -TicketNumber {caseNumber} -OutputDir {casesRoot}/active
```
Token 优先级：① dtm-token-global.json → ② per-workspace 缓存 → ③ Playwright 截获。
**附件下载失败必须明确记录失败原因**，不要静默跳过。

**AR Mode**: 从 main case 下载附件（读 AR 目录下的 `case-info.md`，它来自 main case）。

### 3. ICM 数据拉取（Playwright 拦截）

从 `case-info.md` 读 ICM Number。无 ICM 则跳过。有 ICM 则通过 Playwright 拦截 ICM portal 内部 API，一次拿到所有数据。

**方法**：使用 `browser_run_code` 设置 `page.route()` 拦截两个 API，然后导航到 ICM summary 页面：

```javascript
async (page) => {
  let details = null;
  let discussions = null;
  
  await page.route('**/GetIncidentDetails*', async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    details = body;
    await route.fulfill({ response, body });
  });
  
  await page.route('**/getdescriptionentries*', async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    discussions = body;
    await route.fulfill({ response, body });
  });
  
  await page.goto(`https://portal.microsofticm.com/imp/v5/incidents/details/${ICM_ID}/summary`);
  await page.waitForTimeout(10000);
  
  // ... parse and return JSON (see icm-discussion/SKILL.md for full code)
}
```

**SSO 登录**：如果被重定向到 `IdentityProviderSelection.html`，选择 Entra ID → fangkun@microsoft.com。

**从 `GetIncidentDetails` 提取**（写入 `{caseDir}/icm/icm-summary.md`）：
- 基础 meta：Title, State, Severity, OwningTeam, Owner, dates
- Authored Summary：`Description` 字段（HTML → 纯文本）
- Manage Access：`AccessRestrictedToClaims` 数组
  - 每个 claim 的 team name 通过 `mcp__icm__get_team_by_id` 解析（可选，也可直接输出 team ID）
  - **检查**：是否包含 `CSS Mooncake` 相关 team（team name 含 "CSS Mooncake"）且 Role 为 Owners/Contributors
  - 检查结果写入 `icm-summary.md` 末尾的 `## Manage Access` 段

**从 `getdescriptionentries` 提取**（写入 `{caseDir}/icm/icm-discussions.md`）：
- `Items[]` 数组，按时间正序，每条含 Date/Author/Cause/Text
- HTML strip → 纯文本
- 格式见 `icm-discussion/SKILL.md`

**旧文件清理**：如果存在 `icm/{icmId}.md` 或 `icm/icm-details.md`（旧格式），删除替换。

**错误处理**：Playwright 拦截失败（登录过期、页面超时）→ 记录 warning 到日志，跳过 ICM 步骤，不阻塞。

## 错误处理
- D365 脚本失败 → 记录错误，继续其他步骤
- 附件下载失败 → 明确记录原因（DTM token 失败等）
- ICM Playwright 失败 → 跳过，记录警告
- 所有步骤完成后汇报各步成功/失败状态
