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

通过 Office Mail MCP 搜索 Outlook 邮箱中与 Case 相关的邮件，获取完整正文（含 HTML），清洗后保存为 `emails-office.md`。

## 为什么需要

D365 的 `emails.md` 通过 CRM API 获取，经常出现内容截断、格式丢失。直接搜索 Outlook 邮箱可以获取完整邮件正文，两个文件互补：
- `emails.md` = D365 源（结构化、可靠但可能截断）
- `emails-office.md` = Outlook 源（完整正文）

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
[2026-03-26 10:00:00] STEP 1 START | Search emails for case 2603230030001513
[2026-03-26 10:00:03] STEP 1 OK    | Found 12 emails
[2026-03-26 10:00:04] STEP 2 START | Fetching full content for 12 emails
[2026-03-26 10:00:15] STEP 2 OK    | Fetched 11/12 emails (1 failed)
[2026-03-26 10:00:16] STEP 3 START | HTML cleanup and output generation
[2026-03-26 10:00:18] STEP 3 OK    | emails-office.md saved (11 emails, 45KB)
```

## 执行步骤

**脚本**: `skills/email-search/email-search-mcp.ps1`（去重、body 落盘、HTML 清洗、生成 md）

### 1. 搜索邮件（MCP 调用 → 结果写文件 → 脚本去重）

**1a.** 调用 `mcp__mail__SearchMessagesQueryParameters`：
```
queryParameters: ?$search="{caseNumber}"&$top=50&$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,bodyPreview,isRead
```

**⚠️ MCP 远程连接重试**：
Mail MCP 偶发 `error -32001: Remote connection error`（RPC 瞬断）。遇到此错误时：
1. 写日志 `STEP 1 RETRY | MCP connection error, retrying...`
2. **立即重试一次**（不需要等待）
3. 如果重试仍然失败 → 写日志 `STEP 1 FAILED`，向用户报告

**1b.** 将 MCP 返回的 rawResponse JSON **写入临时文件**（不在 context 中解析）：
```bash
# 将 MCP 返回的 rawResponse 部分写入文件
echo '{rawResponse_value}' > "{caseDir}/.tmp-email-search/search-results.json"
```

**1c.** 调用脚本去重（脚本内部按 `subject + sentDateTime` 去重）：
```bash
pwsh -File "skills/email-search/email-search-mcp.ps1" \
  -CaseNumber "{caseNumber}" \
  -CaseDir "{caseDir}" \
  -SearchResultJson "{caseDir}/.tmp-email-search/search-results.json"
```
脚本输出：`DEDUP_COUNT=19`（去重后邮件数）+ 生成 `message-ids.txt` 和 `messages-meta.json`

- 如果 0 封 → 生成空的 `emails-office.md`，然后结束

### 2. 拉取完整邮件内容（MCP 调用 → body 直接写文件，不经 context）

读取 `{caseDir}/.tmp-email-search/message-ids.txt`（每行一个 id），对每封邮件：

**2a.** 调用 `mcp__mail__GetMessage`：
```
id: {messageId}
bodyPreviewOnly: false
preferHtml: true
```

**⚠️ MCP 远程连接重试**：与步骤 1 相同，遇到 `error -32001` 立即重试一次。

**2b.** 将返回的 `body` 字段 **直接写入临时文件**，不要在 context 中持有大 body：
```bash
# 提取 body 字段，写入文件（body 可能 100KB+，不要留在 context 中）
echo '{body_content}' > "{caseDir}/.tmp-email-search/body-{id_suffix}.html"
```

> **关键**: 每封邮件的 GetMessage 返回后，只从响应中提取 `body` 字段写入文件。不要将整个 100KB+ 的 HTML 保留在 context 中。

**注意事项**：
- 单封邮件失败（重试后仍失败）不阻塞其他邮件获取 — 记录失败的 messageId，继续处理下一封
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
- 读取 `messages-meta.json`（元数据）+ 每封邮件的 `body-*.html`（完整 body）
- Python HTML 清洗 → 纯文本
- 按 `receivedDateTime` 正序排列
- 方向判断：`@microsoft.com` → 📤 Sent，否则 → 📥 Received
- 输出 `emails-office.md`
- 清理临时目录

脚本输出：`COUNT=19, SIZE_KB=45.2`

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
- 每封邮件 body 可能很大（100KB+ HTML），用 `bodyPreviewOnly: false` + `preferHtml: true` 获取完整内容
- 搜索结果上限 50 封，覆盖绝大多数 Case 的邮件量
- 失败的单封邮件不阻塞其他邮件获取
- 日志格式与其他 skill 一致
- 中文字符需正常显示（Python 默认 UTF-8 即可）
