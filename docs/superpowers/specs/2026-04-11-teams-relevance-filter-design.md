# Teams Relevance Filter Design

> Date: 2026-04-11
> Status: Draft
> Author: Kun Fang + Claude

## Problem

Teams search agent 当前将所有匹配 case ID / 客户名的聊天消息保存到 `teams/` 目录，但没有判断哪些消息真正与 case 问题相关。典型的一次搜索返回 5-8 个 chat，其中仅 2-3 个包含有价值的技术讨论或客户沟通，其余是偶然提到 case 号的日常闲聊或其他主题。

**影响**：下游消费者（troubleshooter、inspection-writer）读取全部 chat 文件，噪音内容会：
- 误导 troubleshooter 的技术分析方向
- 让 inspection-writer 在 case-summary 中引入无关事实
- 浪费 LLM token 处理无效信息
- Dashboard TeamsTab 中有价值的对话被淹没

## Solution Overview

在 Teams search agent 内部新增 **Step 5: Relevance Scoring & Digest Generation**，使用 LLM（agent 自身）对搜索结果做语义相关性评分，输出分层的 `teams-digest.md` 和 `_relevance.json`。所有下游消费者从读原始 `teams/*.md` 改为读 `teams-digest.md`。

## Architecture

### Data Flow

```
Teams MCP Search (Steps 0-4, unchanged)
        │
        ▼
  teams/*.md (raw chat files, unchanged)
        │
        ▼
  Step 5: Relevance Scoring (NEW)
  ┌─────────────────────────────────────┐
  │ Input:                              │
  │   case-summary.md + case-info.md    │
  │   + all teams/*.md contents         │
  │                                     │
  │ Processing:                         │
  │   LLM semantic scoring per chat     │
  │   Extract key facts from relevant   │
  │                                     │
  │ Output:                             │
  │   teams/_relevance.json             │
  │   teams/teams-digest.md             │
  └─────────────────────────────────────┘
        │
        ▼
  Consumers read teams-digest.md
  ┌──────────┬──────────────┬───────────┐
  │inspector │ troubleshooter│ dashboard │
  └──────────┴──────────────┴───────────┘
```

### Component Changes

| Component | Change | Impact |
|-----------|--------|--------|
| Teams search agent SKILL.md | +Step 5 (scoring & digest) | +3 tool calls, +10s |
| `_relevance.json` | New file | Structured relevance metadata |
| `teams-digest.md` | New file | Human/LLM readable summary |
| inspection-writer SKILL.md | Read path: `teams/*.md` → `teams-digest.md` | Reduced noise |
| troubleshooter agent.md | Read path: `teams/` → `teams-digest.md` | Reduced noise |
| Dashboard API `/api/cases/:id/teams` | Return relevance metadata | Sorted + annotated |
| Dashboard TeamsTab component | Tiered display + collapsed sections | Better UX |

## Detailed Design

### 1. Teams Search Agent — Step 5

**Position**: After Step 4 (write to disk), before end marker.

**Execution Logic**:

1. **Read case context** (1 Bash call)
   - Read `case-summary.md` if exists (preferred, has problem description + timeline)
   - Read `case-info.md` (always available: title, product, customer name)
   - Truncate to ~500 tokens of relevant context

2. **LLM scoring** (Agent's own reasoning, no external API call)
   - Agent already holds all chat content in memory from Steps 3-4
   - For each chat, classify: `high` (directly related) vs `low` (indirectly/unrelated)
   - From `high` chats, extract key facts as bullet points

3. **Write output** (1-2 Bash calls)
   - Write `_relevance.json` with structured metadata
   - Write `teams-digest.md` with human-readable summary

**Classification criteria**:
- `high`: Discusses case technical problem, customer communication about the issue, troubleshooting steps, team collaboration on the case, PG engagement
- `low`: Casual mention of case number, unrelated topics, greetings/small talk, discussions about other cases

**Budget impact**: MAX 17 → MAX 20 tool calls (+3)

**Edge cases**:
- No `case-summary.md` → Use `case-info.md` only (less context but still functional)
- Cache hit (Step 0) → Skip entire agent including Step 5 (digest already exists from previous run)
- Cache miss but digest exists from previous run → Re-score with latest chats (new messages may change relevance)
- Zero chats found → Write empty digest: "No Teams conversations found for this case"
- All chats rated `low` → Digest contains note "No directly relevant Teams conversations found" with empty Key Facts section
- Single chat found → Still score it (don't assume single = relevant)

### 2. Output File Formats

#### `_relevance.json`

```json
{
  "_scoredAt": "2026-04-11T15:30:00Z",
  "_caseContext": "Token revocation issue in Intune MDM, customer: Contoso",
  "chats": {
    "cen-wu": {
      "relevance": "high",
      "reason": "与同事讨论 case 技术细节（token revocation 触发原因、登录日志分析）",
      "keyFacts": [
        "用户 Teams 被弹框输入密码，输错三次触发 wipe",
        "登录日志显示不是 Teams app 主动发起的 broker/SSO extension 请求"
      ]
    },
    "oliver-wu": {
      "relevance": "low",
      "reason": "日常打招呼，偶然提到 case 号但无技术内容"
    }
  }
}
```

**Schema**:
- `_scoredAt`: ISO 8601 timestamp
- `_caseContext`: Brief description used for scoring context
- `chats`: Object keyed by chat filename (without .md)
  - `relevance`: `"high"` | `"low"`
  - `reason`: 1-line explanation of relevance judgment
  - `keyFacts`: (only for `high`) Array of extracted fact strings

#### `teams-digest.md`

```markdown
# Teams 相关对话摘要

> Case: {caseNumber} — {title}
> 评分时间: {timestamp} GMT+8
> 相关对话: {highCount}/{totalCount} | 无关对话: {lowCount}/{totalCount}

## 关键事实（Key Facts）

- Fact 1 extracted from relevant chats
- Fact 2 extracted from relevant chats
- ...

## 相关对话

### {Contact Name} — {reason summary}
> 来源: teams/{filename}.md

**{date}** {summary of key exchange}
**{date}** {summary of key exchange}

### {Contact Name 2} — {reason summary}
> 来源: teams/{filename}.md

...

---

<details>
<summary>无关对话（{lowCount} 条，已折叠）</summary>

- **{filename}.md** — {reason}
- **{filename}.md** — {reason}

</details>
```

### 3. Downstream Consumer Integration

#### inspection-writer

**Current** (SKILL.md line 48):
```
Read teams/*.md
```

**New**:
```
Read teams/teams-digest.md (if exists)
Fallback: Read teams/*.md (backward compat for old cases)
```

Extract "Key Facts" section into case-summary timeline entries.

#### troubleshooter

**Current** (agent.md Step 1):
```
Read teams/ directory for problem understanding
```

**New**:
```
Read teams/teams-digest.md (if exists)
Fallback: Read teams/*.md
```

Use "Key Facts" and "相关对话" sections for technical context.

#### email-drafter

No change. Already consumes Teams context indirectly through case-summary.md, which is now cleaner thanks to inspection-writer reading the digest.

#### status-judge

No change. Does not use Teams data.

### 4. Dashboard Changes

#### Backend API

**`GET /api/cases/:id/teams`** response format upgrade:

```typescript
interface TeamsResponse {
  digest: {
    scoredAt: string
    keyFacts: string[]
    relevantCount: number
    irrelevantCount: number
  } | null  // null when no _relevance.json
  chats: Array<{
    chatId: string
    content: string
    relevance: 'high' | 'low' | 'unknown'  // unknown when no scoring
    reason?: string
  }>
  total: number
}
```

**Implementation**:
- Read `_relevance.json` if exists → annotate each chat with relevance/reason
- Sort chats: `high` first, then `low`, then `unknown`
- Parse `teams-digest.md` Key Facts section → populate `digest.keyFacts`
- No `_relevance.json` → all chats get `relevance: 'unknown'`, `digest: null`

#### Frontend TeamsTab

**Layout**:

1. **Key Facts Card** (top, always visible when digest exists)
   - Amber/gold accent background
   - Bulleted list of extracted key facts
   - Collapsed if >5 facts, with "Show all" toggle

2. **Relevant Chats Section** (expanded by default)
   - Header: "📌 相关对话 ({count})"
   - Each chat card shows: contact name, reason badge, full message content
   - Green accent indicator

3. **Other Chats Section** (collapsed by default)
   - Header: "▶ 其他对话 ({count})" — clickable to expand
   - Gray styling when collapsed
   - Same card format when expanded

4. **Search** (bottom, existing behavior preserved)
   - Searches across ALL chats regardless of relevance
   - When searching, relevance sections flatten into search results

5. **No Scoring Fallback**
   - When `digest` is null, render current flat layout (backward compatible)

## Testing Strategy

- Unit test: `_relevance.json` schema validation
- Unit test: `teams-digest.md` format parsing
- Unit test: API response with/without relevance data
- Integration test: Full flow from raw chats → digest → consumer reads
- Edge case: Empty teams dir, single chat, all low relevance
- Backward compat: Old case dirs without _relevance.json

## Migration

No migration needed. Enhancement is purely additive:
- New runs of teams-search generate new files alongside existing ones
- Old case dirs without `_relevance.json` / `teams-digest.md` → consumers fallback to reading raw `teams/*.md`
- Dashboard shows flat layout for old cases, tiered layout for new ones
