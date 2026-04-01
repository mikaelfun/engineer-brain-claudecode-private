# Case 目录结构

所有 agent / caseworker / Web UI 共用的 Case 数据目录定义。

> 路径配置：从 `config.json` 读取 `casesRoot`。

## 根目录结构

```text
${casesRoot}/
  active/{case-id}/      # 所有活跃 Case（普通 + AR）
  archived/{case-id}/    # 已关单 Case（D365 Resolved/Cancelled）
  transfer/{case-id}/    # 已转移 Case（不在 active 也不在 closed，转给其他工程师）
  archive-log.jsonl      # 归档/转移操作日志（每行一条 JSON）
  casehealth-state.json  # 全局巡检状态
```

## 单 Case 内文件

| 文件 | 格式 | 写入者 | 说明 |
|------|------|--------|------|
| `case-info.md` | Markdown | d365-case-ops | Case 快照（基本信息、联系人、Entitlement 等） |
| `casehealth-meta.json` | JSON | caseworker / IR 脚本 | 巡检元数据（见 `schemas/meta-schema.md`） |
| `case-summary.md` | Markdown | inspection-writer | 增量叙事摘要（问题描述/排查进展/关键发现/风险） |
| `inspection-YYYYMMDD.md` | Markdown | ~~inspection-writer~~ | **废弃（legacy，保留不删）**。已由 `case-summary.md` + `todo/*.md` 替代 |
| `emails.md` | Markdown | d365-case-ops | 完整邮件历史（按时间倒序，D365 源） |
| `emails-office.md` | Markdown | email-search | Outlook 邮件完整正文（按时间正序，Office Mail MCP 源，与 emails.md 互补） |
| `notes.md` | Markdown | d365-case-ops | Note 历史（增量更新） |
| `timing.json` | JSON | casework (Main Agent) | 各步骤执行耗时（见 `schemas/timing-schema.md`） |

## 子目录

| 目录 | 内容 | 写入者 |
|------|------|--------|
| `attachments/` | 客户附件（DTM 下载） | d365-case-ops (download-attachments.ps1) |
| `analysis/` | 诊断分析报告 | troubleshooter |
| `drafts/` | 邮件草稿 | email-drafter |
| `research/` | 搜索到的文档/Wiki/KB 链接引用 | troubleshooter |
| `kusto/` | Kusto 查询结果 | troubleshooter |
| `teams/` | Teams 聊天记录（按会话分文件） | teams-search |
| `images/` | 邮件内联图片（自动提取） | d365-case-ops (fetch-emails.ps1) |
| `icm/` | ICM 数据（summary/details/impact） | data-refresh |
| `logs/` | subagent 执行日志（每个 agent 一个 .log 文件） | 各 subagent 自动写入 |
| `context/` | 用户补充的上下文 | 用户交互 / Main Agent |
| `kb/` | 关单时生成的 KB 文章 | Main Agent |
| `todo/` | Todo 文件 | generate-todo.sh |

## context/ 目录（用户补充上下文）

用于存储用户通过 Dashboard 或对话补充的信息：

```text
context/
  user-inputs.jsonl      # 用户补充的每条信息（JSONL，append-only）
```

> **注意**：`case-summary.md` 已从 `context/` 提升到 Case 根目录，由 inspection-writer skill 维护。

### user-inputs.jsonl

每行一条 JSON 记录：
```json
{"timestamp":"2026-03-18T10:00:00+08:00","type":"phone-call","content":"客户说 VM 是 D4s_v3，问题从上周五开始，只影响 production slot"}
```

type 枚举: `phone-call` / `meeting` / `observation` / `user-note`

### ~~case-summary.md~~（已提升到根目录）

`case-summary.md` 现在位于 Case 根目录（非 context/ 子目录），提升可见性。
由 inspection-writer skill 维护，包含：
- 问题描述
- 排查进展（增量追加）
- 关键发现
- 风险评估

作为 resume 时的上下文锚点注入 systemPrompt。

## kb/ 目录（关单 KB）

关单时由 Main Agent 从全量 case 数据生成：
```text
kb/
  kb-article.md          # Knowledge Base 文章
```

## teams/ 目录

详细说明见 `.claude/agents/teams-search.md`。

```text
teams/
  _search-log.md              # 搜索记录
  _chat-index.json            # chatId → 本地文件/最后消息时间索引
  {sanitized-chat-name}.md    # 按会话分文件
```

## case-info.md 中的 ICM 信息要求

`case-info.md` 在存在已绑定 ICM 时，应尽量包含：
- ICM Number / Incident ID
- ICM Title（如可获取）
- ICM State / Severity（如可获取）
- Owning Team / Owning Team ID（如可获取）

## analysis/ 目录

### 文件命名
```text
YYYYMMDD-HHMM-{topic}.md
```

### topic 来源规则

按优先级：
1. Case 主问题关键词（如 `acr-pull-timeout`）
2. 产品名 + 症状（如 `vm-extension-failure`）
3. 错误码（如 `arm-conflict-409`）
4. 若不明确 → `general-analysis`

### 标准分析报告结构

至少包含：
1. **根因分析结论** — 时间线表格 + 根因确认 + 可能原因列表
2. **诊断查询过程** — 每个查询的目的/KQL/结果/发现
3. **知识来源引用** — 本地 KB / ADO / Microsoft Learn / 技术原理
4. **建议后续行动** — 需补充的信息 + 预防/解决建议

## drafts/ 目录

### 文件命名
```text
YYYYMMDD-HHMM-{mail-type}-{lang}-{recipient}.md
```

### 文件头规范
```markdown
# Draft Email
- Type: {mail-type}
- Language: zh / en
- To: {recipient}
- Suggested Subject: {subject}
- Based on: {latest-customer-email-time / case status / analysis}

## Body
{邮件正文}

## Notes for User
- 为什么这样写
- 是否有风险 / 是否需要你补充
```

## 平台无关性

- 所有数据都是 Markdown 或 JSON，不依赖任何数据库
- Web UI / Claude Code / 其他 agent 框架都可以直接读写
