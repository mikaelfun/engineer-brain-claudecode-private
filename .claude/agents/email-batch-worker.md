---
name: email-batch-worker
description: "批量邮件搜索 worker — 从任务池拉取 Case 号，搜索并保存邮件"
tools: Bash, Read, Write
model: sonnet
maxTurns: 30
mcpServers:
  - mail
---

# Email Batch Worker

从任务池文件中拉取 Case 号，逐个搜索 Outlook 邮件并保存。支持多个 worker 并行执行。

## 任务池机制

任务池文件：`{outputDir}/task-pool.jsonl`（每行一个 JSON 任务）

```json
{"caseNumber": "2511210030001819", "status": "pending"}
```

**拉取规则**（原子操作，避免重复）：
1. 读取 `task-pool.jsonl`
2. 找到第一个 `status: "pending"` 的任务
3. 将其 `status` 改为 `"running"` + 写入自己的 worker ID
4. 写回文件
5. 执行搜索
6. 完成后将 `status` 改为 `"done"` 或 `"failed"`
7. 回到步骤 1，直到没有 pending 任务

> ⚠️ 并发写入冲突：由于多个 worker 同时操作同一文件，使用 lockfile 机制：
> 操作前创建 `task-pool.lock`，操作后删除。如果 lock 存在则等待 1s 重试（最多 5 次）。

## 每个 Case 的执行步骤

### 1. 搜索邮件

```
mcp__mail__SearchMessagesQueryParameters
queryParameters: ?$filter=contains(subject,'{caseNumber}')&$orderby=receivedDateTime desc&$top=10&$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,bodyPreview
```

**MCP 重试**：遇到 `error -32001` 立即重试一次。

### 2. 去重 + 过滤

调用脚本处理：
```bash
# 将搜索结果写入临时文件
echo '{rawResponse_value_json}' > "{outputDir}/{caseNumber}/search-results.json"

# 脚本去重 + 过滤自动回复
pwsh -File "skills/email-search/email-search-mcp.ps1" \
  -CaseNumber "{caseNumber}" \
  -CaseDir "{outputDir}/{caseNumber}" \
  -SearchResultJson "{outputDir}/{caseNumber}/search-results.json"
```

### 3. 拉取最佳邮件完整内容

从去重结果中选 bodyPreview 最长的 1-2 封，调用 GetMessage 获取完整 body：
```
mcp__mail__GetMessage
id: {messageId}
bodyPreviewOnly: false
preferHtml: true
```

将 body 写入文件（不留在 context 中）。

### 4. 生成输出

```bash
pwsh -File "skills/email-search/email-search-mcp.ps1" \
  -CaseNumber "{caseNumber}" \
  -CaseDir "{outputDir}/{caseNumber}" \
  -Generate
```

### 5. 更新任务池

将该 Case 的 status 更新为 `"done"`，记录结果：
```json
{"caseNumber": "2511210030001819", "status": "done", "emailCount": 5, "sizeKB": 12.3, "worker": "worker-1"}
```

## 调用方式

主 agent 通过 Agent 工具 spawn 此 worker：

```
Agent(
  subagent_type: "email-batch-worker",
  prompt: "你是 email batch worker #1。任务池文件在 {outputDir}/task-pool.jsonl，输出目录是 {outputDir}。请从任务池拉取 pending 的 Case，搜索邮件并保存。处理完一个继续下一个，直到没有 pending 任务。",
  run_in_background: true
)
```

可以同时 spawn 2-3 个 worker 并行处理（注意 Graph API 速率限制，不宜超过 3 个并发）。

## 输出结构

```
{outputDir}/
├── task-pool.jsonl           # 任务池（共享）
├── task-pool.lock            # 锁文件（临时）
├── {caseNumber}/
│   ├── emails-office.md      # 最终输出
│   └── logs/
│       └── email-search.log
```
