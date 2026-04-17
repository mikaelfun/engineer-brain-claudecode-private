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
bash .claude/skills/email-search/scripts/scripts/scripts/email-search-inline.sh \
  --case-number {caseNumber} \
  --case-dir {caseDir} \
  --project-root .
```

**性能**：10-20s/case（vs 旧模式 MCP 直连 + LLM 多轮调用 30-60s）

**输出**：`{caseDir}/emails-office.md`

**原理**：
1. 启动 `agency.exe mcp mail --transport http --port {port}` 本地 HTTP proxy
2. 通过 curl POST JSON-RPC 调用 `SearchMessagesQueryParameters`（`$search` 全文搜索）
3. Python 解析 rawResponse → 去重（subject+sentDateTime）→ 过滤自动回复
4. `$search` 结果自带完整 body，直接提取最后一封（含完整嵌套对话历史）
5. HTML 清洗 → 生成 `emails-office.md`（Timeline 索引 + 最后 1 封展开）
6. 完成后自动杀掉 proxy

**可选参数**：
- `--incremental`：增量搜索（从已有 emails-office.md 的时间戳开始）
- `--top N`：搜索返回最大邮件数（默认 20）
- `--port N`：指定 proxy 端口（默认自动分配 9860-9889）

### 2. MCP 直连模式（DEPRECATED）

旧模式：LLM 直接调用 `mcp__mail__SearchMessagesQueryParameters` 和 `mcp__mail__GetMessage`。
多轮 MCP 调用 + LLM 推理 + 大 JSON 在 context 中传递，开销大。

**⚠️ DEPRECATED** — 推荐改用 INLINE_HTTP 模式。

## 并发性能

### 架构：每 case 独立 agency proxy

当前 `email-search-inline.sh` 每次调用启动独立的 `agency.exe mcp mail` HTTP proxy。
天然并行安全，但高并发时 agency.exe 进程数 = 并发数。

### 实测吞吐（226 case 批量压测）

| 并发度 | 总时间 | 吞吐 | 单 case 均时 | 失败率 | 最慢单 case |
|--------|--------|------|-------------|--------|------------|
| 1（串行） | — | 4/min | 14.6s | 0% | — |
| 5 | 16s | 19/min | 3.2s | 0% | 16s |
| 10 | 25s | 24/min | 2.5s | 0% | 24s |
| **20** | **30s** | **40/min** | **1.5s** | **0%** | 28s |
| 40 | 56s | 42/min | 1.4s | 0% | 55s |

### 并发建议

- **casework 单 case**：直接调用，不需要考虑并发
- **patrol 批量**（5-20 case）：`--port` 指定不同端口，并行安全
- **大批量**（20+ case）：推荐并发 **10-20**，Graph API 是瓶颈（非 agency）
  - 20→40 吞吐仅 40→42/min（+5%），但最慢 case 从 28s→55s（+96%）
  - 20 并发是**吞吐/延迟最优平衡点**
- **⚠️ 端口范围**：默认 9860-9889（30 个），超过 30 并发会端口冲突
  - 冲突时后启动的进程复用已有 proxy（Graph API 无状态，不影响正确性）
  - 但先完成的 case 杀 proxy 会中断后续 case → 真正安全上限 ~20 并发

### 批量最佳实践

226 case 全量，推荐分批 + 共享 proxy（未来优化）：

```bash
# 当前：直接并行（20 并发，~6 分钟跑完 226 case）
cat case-ids.txt | xargs -P20 -I{} bash email-search-inline.sh \
  --case-number {} --case-dir ./cases/active/{} --project-root .

# 未来：共享 proxy 模式（参考 teams-search-http.sh）
# 一个 agency proxy + 多 worker 共享同端口，消除 N 个启动开销
```

## 参数
- `$ARGUMENTS` — Case 编号（如 `2603230030001513`）

## 手动调用（/email-search）

```bash
# 读取 config.json 获取 casesRoot
CASES_ROOT=$(python3 -c "import json; print(json.load(open('config.json'))['casesRoot'])")
CASE_DIR="$CASES_ROOT/active/{caseNumber}"
mkdir -p "$CASE_DIR/logs"

bash .claude/skills/email-search/scripts/scripts/scripts/email-search-inline.sh \
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
bash "$CD/.claude/skills/email-search/scripts/scripts/scripts/email-search-inline.sh" \
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

首次搜索：`$search`（全文搜索，可找到 TrackingID# 格式），`$filter` 作为 fallback。
增量搜索：`$filter` + `receivedDateTime ge` + `contains(subject, caseNumber)`。

> `$filter` + `contains()` 对长数字字符串匹配不可靠，`$search` 更准确但不支持 `$orderby`。

### 结果处理

1. **去重**：subject + sentDateTime 相同的只保留第一个
2. **过滤自动回复**：subject 含"自动回复/Automatic reply/Out of Office"
3. **只展开最后 1 封 body**：邮件回复嵌套完整历史，最后一封 = 完整对话
4. **HTML 清洗**：strip style/script → br/p→换行 → 去标签 → unescape

### 输出格式

```markdown
# Emails (Outlook) — Case {caseNumber}
> Generated: ... | Total: N emails | Source: Agency Mail HTTP

## Timeline
| # | Time | Direction | From | Subject |
|---|------|-----------|------|---------|
| 1 | 2026-04-13 06:53 | 📥 Received | Chris | ... |
| ... | ... | ... | ... | ... |
| N | 2026-04-16 12:09 | 📤 Sent | Chris | ... ← full body below |

## 📤 Sent | 2026-04-16 12:09:47
(完整 body，含嵌套的全部历史对话)
```

## 输出文件

- `{caseDir}/emails-office.md` — Outlook 邮件完整内容（清洗后）
- `{caseDir}/.casework/logs/email-search.log` — 执行日志

## 与 emails.md 的关系

- `emails.md` = D365 CRM 源（结构化、可靠但可能截断）
- `emails-office.md` = Outlook 源（完整正文，含团队 DL 抄送邮件）
- 两个文件互补，**不修改** `emails.md`

## 错误处理

- proxy 启动超时 → `EMAIL_FAIL`
- 搜索 0 结果 → 自动重试一次；仍为 0 → 生成空 md
- 单封 GetMessage 失败 → 降级使用 bodyPreview，继续处理其他邮件
- HTML 清洗失败 → 降级使用 bodyPreview
