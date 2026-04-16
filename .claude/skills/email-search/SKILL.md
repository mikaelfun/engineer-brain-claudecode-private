---
name: email-search
displayName: 邮件搜索
category: inline
stability: stable
requiredInput: caseNumber
estimatedDuration: 15s
description: "通过 Agency Mail HTTP proxy 搜索 Case 相关邮件完整内容。可独立调用 /email-search {caseNumber}，也可被 casework/其他 skill 引用。"
allowed-tools:
  - Bash
  - Read
---

# /email-search — Outlook 邮件搜索

通过 Agency Mail HTTP proxy (Graph API) 搜索 Outlook 邮箱中与 Case 相关的邮件，获取完整正文（含 HTML），清洗后保存为 `emails-office.md`。

## 两种执行模式

### 1. INLINE_HTTP 模式（默认，推荐）

**由 `casework-gather.sh` 自动调用或手动 `/email-search` 触发，不需要 LLM agent 做 MCP 调用。**

`email-search-inline.sh` 直接通过 agency.exe HTTP proxy 调 Graph API，完全绕过 MCP 直连。
每个 case 独立实例，天然并行安全。

```bash
bash .claude/skills/email-search/scripts/email-search-inline.sh \
  --case-number {caseNumber} \
  --case-dir {caseDir} \
  --project-root .
```

**性能**：10-20s/case（vs 旧模式 MCP 直连 + LLM 多轮调用 30-60s）

**输出**：`{caseDir}/emails-office.md`

**原理**：
1. 启动 `agency.exe mcp mail --transport http --port {port}` 本地 HTTP proxy
2. 通过 curl POST JSON-RPC 调用 `SearchMessagesQueryParameters`（$filter + contains(subject, caseNumber)）
3. Python 解析 rawResponse → 去重（subject+sentDateTime）→ 过滤自动回复
4. 对 bodyPreview 最长的 2-3 封调用 `GetMessage`（preferHtml）获取完整 body
5. HTML 清洗 → 生成 `emails-office.md`
6. 完成后自动杀掉 proxy

**可选参数**：
- `--incremental`：增量搜索（从已有 emails-office.md 的时间戳开始）
- `--top N`：搜索返回最大邮件数（默认 20）
- `--port N`：指定 proxy 端口（默认自动分配 9860-9889）

### 2. MCP 直连模式（DEPRECATED）

旧模式：LLM 直接调用 `mcp__mail__SearchMessagesQueryParameters` 和 `mcp__mail__GetMessage`。
多轮 MCP 调用 + LLM 推理 + 大 JSON 在 context 中传递，开销大。

**⚠️ DEPRECATED** — 推荐改用 INLINE_HTTP 模式。

## 参数
- `$ARGUMENTS` — Case 编号（如 `2603230030001513`）

## 手动调用（/email-search）

```bash
# 读取 config.json 获取 casesRoot
CASES_ROOT=$(python3 -c "import json; print(json.load(open('config.json'))['casesRoot'])")
CASE_DIR="$CASES_ROOT/active/{caseNumber}"
mkdir -p "$CASE_DIR/logs"

bash .claude/skills/email-search/scripts/email-search-inline.sh \
  --case-number {caseNumber} \
  --case-dir "$CASE_DIR" \
  --project-root .
```

读取最后一行输出判断结果：
- `EMAIL_OK|emails=N|fetched=M|elapsed=Xs` → 成功
- `EMAIL_SKIP|reason=...` → 跳过
- `EMAIL_FAIL|reason=...` → 失败

## casework-gather.sh 集成

在 `casework-gather.sh` 中作为后台任务并行执行：

```bash
bash "$CD/.claude/skills/email-search/scripts/email-search-inline.sh" \
  --case-number "$CASE_NUMBER" \
  --case-dir "$CASE_DIR" \
  --project-root "$CD" \
  --incremental \
  > "$CASE_DIR/logs/email-search-stdout.log" 2>&1 &
PID_EMAIL=$!
```

## 搜索策略

### 首次搜索 vs 增量搜索

- `--incremental` 未指定或 `emails-office.md` 不存在 → **首次搜索**（全量）
- `--incremental` 且 `emails-office.md` 存在 → 从 `Generated:` 时间戳开始**增量搜索**

### 搜索方式

使用 `$filter` + `contains(subject, caseNumber)` + `$orderby=receivedDateTime desc`：
- 支持时间排序（`$search` 不支持）
- 支持增量（`receivedDateTime ge {lastFetchTime}`）

### 结果处理

1. **去重**：subject + sentDateTime 相同的只保留第一个
2. **过滤自动回复**：subject 含"自动回复/Automatic reply/Out of Office"
3. **智能 body 拉取**：只拉 bodyPreview 最长的 2-3 封（邮件回复嵌套了完整历史）
4. **HTML 清洗**：strip style/script → br/p→换行 → 去标签 → unescape

## 输出文件

- `{caseDir}/emails-office.md` — Outlook 邮件完整内容（清洗后）
- `{caseDir}/logs/email-search.log` — 执行日志

## 与 emails.md 的关系

- `emails.md` = D365 CRM 源（结构化、可靠但可能截断）
- `emails-office.md` = Outlook 源（完整正文，含团队 DL 抄送邮件）
- 两个文件互补，**不修改** `emails.md`

## 错误处理

- proxy 启动超时 → `EMAIL_FAIL`
- 搜索 0 结果 → 自动重试一次；仍为 0 → 生成空 md
- 单封 GetMessage 失败 → 降级使用 bodyPreview，继续处理其他邮件
- HTML 清洗失败 → 降级使用 bodyPreview
