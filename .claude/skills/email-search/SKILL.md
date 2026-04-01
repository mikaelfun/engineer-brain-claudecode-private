---
name: email-search
displayName: 邮件搜索
category: inline
stability: dev
requiredInput: caseNumber
description: "通过 Office Mail MCP 搜索 Case 相关邮件完整内容。可独立调用 /email-search {caseNumber}，也可被 casework/其他 skill 引用。"
allowed-tools:
  - Bash
  - Read
  - Write
  - mcp__mail__SearchMessagesQueryParameters
  - mcp__mail__GetMessage
---

# /email-search — Outlook 邮件搜索

通过 Office Mail MCP (Graph API) 搜索 Outlook 邮箱中与 Case 相关的邮件，获取完整正文（含 HTML），清洗后保存为 `emails-office.md`。

支持自己的 Case 和**团队成员的 Case**（通过团队 DL 抄送的邮件同样可搜到）。

## 为什么需要

D365 的 `emails.md` 通过 CRM API 获取，经常出现内容截断、格式丢失。直接搜索 Outlook 邮箱可以获取完整邮件正文，两个文件互补：
- `emails.md` = D365 源（结构化、可靠但可能截断）
- `emails-office.md` = Outlook 源（完整正文，含团队邮件）

## 参数
- `$ARGUMENTS` — Case 编号（如 `2603230030001513`）

## 配置读取
```
读取 config.json 获取 casesRoot
设置 caseDir = {casesRoot}/active/{caseNumber}/（使用绝对路径）
确保 caseDir 存在：mkdir -p "{caseDir}"
确保 logs 目录存在：mkdir -p "{caseDir}/logs"
```

## 执行日志

**每个步骤执行前后都必须写入日志文件 `{caseDir}/logs/email-search.log`。**

日志格式（每行一条，append 模式）：
```
[YYYY-MM-DD HH:MM:SS] STEP {步骤号} {状态} | {描述}
```

示例：
```
[2026-04-01 10:00:00] STEP 1 START | Search emails for case 2603230030001513 (incremental since 2026-03-28)
[2026-04-01 10:00:03] STEP 1 OK    | Found 8 emails, dedup to 5, filtered to 4 (skipped 1 auto-reply)
[2026-04-01 10:00:04] STEP 2 START | Fetching best email (largest body) for full content
[2026-04-01 10:00:08] STEP 2 OK    | Fetched 1 email (121KB body), contains full conversation history
[2026-04-01 10:00:09] STEP 3 START | HTML cleanup and output generation
[2026-04-01 10:00:11] STEP 3 OK    | emails-office.md saved (4 emails, 45KB)
```

## 搜索策略

### 首次搜索 vs 增量搜索

**判断增量**：检查 `{caseDir}/emails-office.md` 是否存在
- 不存在 → **首次搜索**（全量）
- 存在 → 从文件头部提取 `Generated:` 时间戳作为 `lastFetchTime`，执行**增量搜索**

### 搜索方式选择

**使用 `$filter`（推荐，支持时间排序和增量）**：
```
# 首次搜索
queryParameters: ?$filter=contains(subject,'{caseNumber}')&$orderby=receivedDateTime desc&$top=20&$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,bodyPreview

# 增量搜索
queryParameters: ?$filter=receivedDateTime ge {lastFetchTime} and contains(subject,'{caseNumber}')&$orderby=receivedDateTime desc&$top=20&$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,bodyPreview
```

> ⚠️ **为什么不用 `$search`**：`$search` 按相关性排序，不支持 `$orderby`。
> `$filter` + `contains(subject,...)` 支持 `$orderby=receivedDateTime desc`，可以保证拿到最新邮件。

### 结果去重

Graph API 会返回同一封邮件的多个副本（Inbox 收件 + Sent Items 发件各一份）。去重规则：
- 用 `subject + sentDateTime` 作为去重 key
- 相同 key 的邮件只保留第一个

### 过滤自动回复

跳过无实质内容的自动回复邮件：
- subject 包含 `自动回复` / `自动答复` / `Automatic reply` / `Out of Office` → 跳过
- **或** bodyPreview 长度 < 200 字符且 subject 无 `Re:` / `RE:` / `回复` / `答复` 前缀 → 跳过

## 执行步骤

**脚本**: `skills/email-search/email-search-mcp.ps1`（去重、body 落盘、HTML 清洗、生成 md）

### 1. 搜索邮件（MCP 调用 → 结果写文件 → 脚本去重）

**1a.** 调用 `mcp__mail__SearchMessagesQueryParameters`（按上述搜索策略选择首次/增量）。

**⚠️ MCP 远程连接重试**：
Mail MCP 偶发 `error -32001: Remote connection error`（RPC 瞬断）。遇到此错误时：
1. 写日志 `STEP 1 RETRY | MCP connection error, retrying...`
2. **立即重试一次**（不需要等待）
3. 如果重试仍然失败 → 写日志 `STEP 1 FAILED`，向用户报告

**1b.** 将 MCP 返回的 rawResponse JSON **写入临时文件**（不在 context 中解析大 JSON）：
```bash
echo '{rawResponse_value}' > "{caseDir}/.tmp-email-search/search-results.json"
```

**1c.** 调用脚本去重 + 过滤自动回复：
```bash
pwsh -File "skills/email-search/email-search-mcp.ps1" \
  -CaseNumber "{caseNumber}" \
  -CaseDir "{caseDir}" \
  -SearchResultJson "{caseDir}/.tmp-email-search/search-results.json"
```
脚本输出：`DEDUP_COUNT=5`（去重+过滤后邮件数）+ 生成 `message-ids.txt` 和 `messages-meta.json`

- 如果 0 封 → 生成空的 `emails-office.md`，然后结束

### 2. 拉取完整邮件内容（智能选择，最小化 context 开销）

**策略**：不需要拉取每封邮件的完整 body。邮件回复通常嵌套了完整对话历史，**拉取 body 最长的那封**即可获得完整对话。

**2a.** 读取 `messages-meta.json`，根据 `bodyPreview` 长度排序，选出 body 最大的前 2-3 封邮件的 id。

> 为什么取 2-3 封而非 1 封：bodyPreview 只有 ~255 字符，不能精确反映实际 body 大小。
> 取 2-3 封可以防止最大的那封恰好是格式邮件（签名模板等）。

**2b.** 对选出的邮件调用 `mcp__mail__GetMessage`：
```
id: {messageId}
bodyPreviewOnly: false
preferHtml: true
```

**⚠️ MCP 远程连接重试**：与步骤 1 相同，遇到 `error -32001` 立即重试一次。

**2c.** 将返回的 `body` 字段 **直接写入临时文件**，不要在 context 中持有大 body：
```bash
echo '{body_content}' > "{caseDir}/.tmp-email-search/body-{id_suffix}.html"
```

> **关键**: 每封邮件的 GetMessage 返回后，只从响应中提取 `body` 字段写入文件。不要将整个 100KB+ 的 HTML 保留在 context 中。

**注意事项**：
- 对于其他邮件（未拉取完整 body 的），使用 `bodyPreview` 作为内容
- 单封邮件失败（重试后仍失败）不阻塞 — 记录失败的 messageId，继续下一封
- 拉取完成后记录成功/失败数量

### 3. 生成 emails-office.md（脚本执行，不经 context）

调用脚本从临时文件生成最终输出（HTML 清洗 + markdown 格式化全在脚本中完成）：
```bash
pwsh -File "skills/email-search/email-search-mcp.ps1" \
  -CaseNumber "{caseNumber}" \
  -CaseDir "{caseDir}" \
  -Generate
```

脚本内部完成：
- 读取 `messages-meta.json`（元数据）+ 已拉取的 `body-*.html`（完整 body）
- Python HTML 清洗 → 纯文本
- 按 `receivedDateTime` 正序排列（最早在前）
- 方向判断：`@microsoft.com` → 📤 Sent，否则 → 📥 Received
- 有完整 body 的邮件输出清洗后的全文；无完整 body 的输出 bodyPreview
- **增量模式**：将新邮件追加到已有 `emails-office.md`，更新 `Generated:` 时间戳
- 清理临时目录

脚本输出：`COUNT=5, SIZE_KB=45.2`

## 输出文件
- `{caseDir}/emails-office.md` — Outlook 邮件完整内容（清洗后）
- `{caseDir}/logs/email-search.log` — 执行日志

## 错误处理
- **MCP 远程连接失败 (`error -32001`)** → 立即重试一次，重试成功则继续；重试仍失败 → 记录错误到日志，向用户报告
- 单封邮件拉取失败 → 记录失败的邮件 ID，继续处理其他邮件
- HTML 清洗失败 → 降级使用 `bodyPreview` 作为邮件内容
- Python 不可用 → 降级使用简单的 sed/正则替换做基础清洗
- **不修改** `emails.md`（D365 源由 `data-refresh` 管理）

## 关键约束
- **邮件回复嵌套特性**：最新的实质回复邮件通常包含完整对话历史（body 递增），不需要拉取每封邮件的完整 body
- **自动回复例外**：自动回复邮件（bodyLen ~100 字符）不包含对话历史，必须跳过
- `$filter` + `$orderby` 保证按时间排序（`$search` 不支持排序）
- 增量拉取通过 `receivedDateTime ge {lastFetchTime}` 实现，避免重复获取
- GetMessage body 写入临时文件，不留在 context 中（单封可达 100KB+）
- 失败的单封邮件不阻塞其他邮件获取
- 日志格式与其他 skill 一致
- 中文字符需正常显示（Python 默认 UTF-8 即可）
