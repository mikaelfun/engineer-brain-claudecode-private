---
name: email-batch-worker
description: "批量邮件搜索 worker — 从任务池拉取 Case 号，搜索并保存邮件"
tools: Bash, Read, Write
model: opus
maxTurns: 200
mcpServers:
  - mail
---

# Email Batch Worker

从任务池文件中拉取 Case 号，逐个搜索 Outlook 邮件并保存。支持多个 worker 并行执行。

## 关键脚本

- **去重+过滤**: `skills/email-search/email-search-mcp.ps1`
- **MCP 响应处理**: `skills/email-search/mcp-response-handler.ps1`（解析 JSON、写文件、日志）

## 任务池机制

任务池文件：`{outputDir}/task-pool.jsonl`（每行一个 JSON 任务）

```json
{"caseNumber": "2511210030001819", "status": "pending"}
```

**拉取规则**（python 原子操作）：
1. 读取 `task-pool.jsonl`
2. 找到第一个 `status: "pending"` 的任务
3. 将其 `status` 改为 `"running"` + 写入 worker ID
4. 执行搜索
5. **无论成功失败，都必须将 status 改为 `"done"` 或 `"failed"`**
6. 回到步骤 1，直到没有 pending 任务

> ⚠️ **退出前必须回写状态**：不要让任何 Case 卡在 running 状态

## 每个 Case 的执行步骤

### Step 1: 搜索邮件

调用 MCP 工具搜索，然后用脚本处理响应（**不要自己解析 JSON**）：

```
1. 调用 mcp__mail__SearchMessagesQueryParameters
   queryParameters: ?$filter=contains(subject,'{caseNumber}')&$orderby=receivedDateTime desc&$top=10&$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,bodyPreview

2. 如果返回 error -32001 → 立即重试一次

3. 将 MCP 返回的完整 JSON 用 Write 工具写入临时文件：
   Write → {outputDir}/{caseNumber}/mcp-raw-search.json

4. 调用脚本解析并保存（脚本处理所有 JSON 转义问题）：
   Bash: pwsh -File skills/email-search/mcp-response-handler.ps1 \
     -Mode search \
     -OutputPath "{outputDir}/{caseNumber}/search-results.json" \
     -LogFile "{outputDir}/{caseNumber}/logs/email-search.log" \
     < "{outputDir}/{caseNumber}/mcp-raw-search.json"

   脚本输出 STATUS=OK/RETRY/ERROR 和 EMAIL_COUNT=N
```

### Step 2: 去重 + 过滤

```bash
pwsh -File skills/email-search/email-search-mcp.ps1 \
  -CaseNumber "{caseNumber}" \
  -CaseDir "{outputDir}/{caseNumber}" \
  -SearchResultJson "{outputDir}/{caseNumber}/search-results.json"
```

如果去重后 0 封 → 标记 done，继续下一个。

### Step 3: 拉取最佳邮件完整 body

从 `messages-meta.json` 选 bodyPreview 最长的 1 封：

```
1. 调用 mcp__mail__GetMessage  id={messageId}  preferHtml=true  bodyPreviewOnly=false

2. 将 MCP 返回的完整 JSON 用 Write 写入临时文件：
   Write → {outputDir}/{caseNumber}/mcp-raw-body.json

3. 脚本解析并保存 body：
   Bash: pwsh -File skills/email-search/mcp-response-handler.ps1 \
     -Mode body \
     -OutputPath "{outputDir}/{caseNumber}/.tmp-email-search/body-{id后10字符}.html" \
     -LogFile "{outputDir}/{caseNumber}/logs/email-search.log" \
     < "{outputDir}/{caseNumber}/mcp-raw-body.json"
```

### Step 4: 生成 emails-office.md

```bash
pwsh -File skills/email-search/email-search-mcp.ps1 \
  -CaseNumber "{caseNumber}" \
  -CaseDir "{outputDir}/{caseNumber}" \
  -Generate
```

### Step 5: 更新任务池

将 status 改为 `"done"` 或 `"failed"`，继续拉取下一个。

## Worker 调用方式

```
Agent(
  subagent_type: "email-batch-worker",
  prompt: "你是 email batch worker #N。任务池在 {outputDir}/task-pool.jsonl，输出到 {outputDir}。从 [正序/倒序] 拉取 pending Case，搜索并保存邮件。",
  run_in_background: true
)
```

推荐 **2 worker 并行**（Graph API 限流安全上限）。

## 输出结构

```
{outputDir}/
├── task-pool.jsonl
├── {caseNumber}/
│   ├── emails-office.md        # 最终输出
│   ├── search-results.json     # 去重后的搜索结果
│   ├── mcp-raw-search.json     # MCP 原始响应（调试用）
│   ├── mcp-raw-body.json       # MCP 原始响应（调试用）
│   └── logs/
│       └── email-search.log    # 每步日志（含 MCP 限流/错误记录）
```
