# Teams Relevance Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add LLM-based relevance scoring to the Teams search agent, producing a filtered digest (`teams-digest.md`) and metadata (`_relevance.json`) that downstream consumers and the Dashboard use instead of raw chat files.

**Architecture:** Teams search agent gains a new Step 5 that reads case context, scores each chat's relevance using the agent's own LLM reasoning, extracts key facts from relevant chats, and writes two new files. Downstream consumers (inspection-writer, troubleshooter, challenger) switch from reading `teams/*.md` to reading `teams-digest.md` with graceful fallback. Dashboard API returns relevance metadata and the frontend renders a tiered view with Key Facts at top, relevant chats expanded, and irrelevant chats collapsed.

**Tech Stack:** PowerShell (write-teams.ps1 extension), TypeScript (Hono backend + React frontend), Markdown skill definitions

**Spec:** `docs/superpowers/specs/2026-04-11-teams-relevance-filter-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `.claude/skills/teams-search/SKILL.md` | Modify | Add Step 5 relevance scoring instructions |
| `.claude/agents/teams-search.md` | Modify | Update maxTurns from 20 → 25 |
| `.claude/skills/inspection-writer/SKILL.md` | Modify | Change Teams read path to teams-digest.md |
| `.claude/agents/troubleshooter.md` | Modify | Change Teams read path to teams-digest.md |
| `.claude/agents/challenger.md` | Modify | Change Teams read path to teams-digest.md |
| `dashboard/src/routes/cases.ts` | Modify | Upgrade GET /api/cases/:id/teams to return relevance |
| `dashboard/web/src/pages/CaseDetail.tsx` | Modify | Tiered TeamsTab with Key Facts + collapsible sections |
| `dashboard/web/src/api/hooks.ts` | Modify | Update type for useCaseTeams response |

---

### Task 1: Update Teams Search Agent SKILL.md — Add Step 5

**Files:**
- Modify: `.claude/skills/teams-search/SKILL.md` (after line 236, before EOF)

- [ ] **Step 1: Read the current SKILL.md ending**

Read `.claude/skills/teams-search/SKILL.md` lines 225-237 to confirm the exact insertion point (after the error handling / timeout protection section, before EOF).

- [ ] **Step 2: Append Step 5 to SKILL.md**

Use Edit to insert after the last line (`- **无论如何 Step 4 必须执行**——end marker 是 casework 等待的信号`):

```markdown

---

## Step 5: Relevance Scoring & Digest Generation（2-3 次调用）

> ⚠️ 只在 Step 4 **成功写入至少 1 个 chat 文件**后执行。
> 缓存命中（Step 0 CACHE_VALID）时跳过——digest 已存在。

### 5a. 读取 Case 上下文（1 次 Bash）

```bash
CASE_DIR="{caseDir}"
SUMMARY=""
if [ -f "$CASE_DIR/case-summary.md" ]; then
  SUMMARY=$(head -60 "$CASE_DIR/case-summary.md")
fi
INFO=$(cat "$CASE_DIR/case-info.md" 2>/dev/null | head -30)
echo "===CASE_CONTEXT==="
echo "$SUMMARY"
echo "===CASE_INFO==="
echo "$INFO"
```

### 5b. 评分 + 写入（1-2 次 Bash/Write）

Agent 已在内存中持有 Step 3-4 的所有 chat 内容。结合 case context，对每个 chat 评分：

**分类标准**：
- `high`：讨论本 case 技术问题、客户沟通、排查步骤、PG 协作、团队讨论本 case 解决方案
- `low`：偶然提到 case 号、不相关话题、日常闲聊、讨论其他 case

**从 `high` chat 中提取 key facts**：每条 fact 是一个独立的事实陈述（时间+人物+内容），可被 troubleshooter/inspection-writer 直接引用。

**写入两个文件**（用 Bash heredoc 或 Write 工具）：

#### `_relevance.json` 格式

```json
{
  "_scoredAt": "2026-04-11T15:30:00Z",
  "_caseContext": "{一句话概括 case 问题}",
  "chats": {
    "{filename-without-md}": {
      "relevance": "high",
      "reason": "{为什么相关的一句话}",
      "keyFacts": ["{fact1}", "{fact2}"]
    },
    "{filename-without-md}": {
      "relevance": "low",
      "reason": "{为什么不相关的一句话}"
    }
  }
}
```

#### `teams-digest.md` 格式

```markdown
# Teams 相关对话摘要

> Case: {caseNumber} — {title}
> 评分时间: {timestamp} GMT+8
> 相关对话: {highCount}/{totalCount} | 无关对话: {lowCount}/{totalCount}

## 关键事实（Key Facts）

- {fact1}
- {fact2}

## 相关对话

### {Contact Name} — {reason}
> 来源: teams/{filename}.md

**{date}** {summary of key exchange}

---

<details>
<summary>无关对话（{lowCount} 条，已折叠）</summary>

- **{filename}.md** — {reason}

</details>
```

### 5c. 特殊情况处理

- **无 case-summary.md**（首次运行）→ 仅用 case-info.md（标题+产品+客户名）做评分，准确度降低但仍有效
- **0 个 chat**（Step 4 写入 0 个文件）→ 跳过 Step 5
- **所有 chat 都是 low** → digest 写 "No directly relevant Teams conversations found"，Key Facts 为空
- **Step 5 失败**（任何异常）→ 记录日志警告，不影响已写入的 end marker 和原始 chat 文件
```

- [ ] **Step 3: Update tool call budget table**

Edit the budget table in SKILL.md (around lines 29-42) to add Step 5:

```markdown
## ⚠️ Tool Call 预算：最多 20 次

整个流程严格控制在 **20 次 tool call 以内**（含 Read SKILL.md）。
禁止为 debug、路径检查、中间日志发起额外调用。

| 步骤 | 预算 | 说明 |
|------|------|------|
| Read SKILL.md | 1 | 必须 |
| Step 0 Bash | 1 | 缓存+时间戳+deadline |
| Step 0.5 MCP + Bash | 2 | 健康检查 + 日志（casework 存活信号） |
| Step 2 MCP ×3 | 3 | Q1+Q2+Q3 **同一条消息** |
| Step 3 MCP ×N | 4-8 | ListChatMessages 分 1-2 批 |
| Step 4 Write（≥4 chat） | 0-1 | _input.json（≤3 chat 用 heredoc 省掉） |
| Step 4 Bash | 1 | write-teams.ps1 + 全部日志 + end marker |
| Step 5 Bash(es) | 1-3 | 读 context + 写 digest + 写 relevance |
| **合计** | **14-20** | |
```

- [ ] **Step 4: Confirm end marker stays in Step 4**

The end marker (`date +%s > "$CASE_DIR/logs/.t_teamsSearch_end"`) must remain in Step 4's bash — it signals casework that teams-search is done. Step 5 is a best-effort enhancement that runs after the end marker. If Step 5 fails, casework is not blocked and raw chat files remain available.

Verify that the Step 5 instructions in SKILL.md do NOT move or duplicate the end marker write.

- [ ] **Step 5: Verify — read back SKILL.md and check**

Read `.claude/skills/teams-search/SKILL.md` to verify:
- Budget table says MAX 20
- Step 5 is after Step 4
- End marker is still in Step 4 (not moved)
- No TBDs or placeholders

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/teams-search/SKILL.md
git commit -m "feat(teams-search): add Step 5 relevance scoring & digest generation

Add LLM-based semantic scoring after message fetch. Produces
teams-digest.md (filtered summary) and _relevance.json (metadata).
Tool call budget increased from 17 to 20."
```

---

### Task 2: Update Teams Search Agent Definition

**Files:**
- Modify: `.claude/agents/teams-search.md:4` (maxTurns)

- [ ] **Step 1: Update maxTurns**

Edit `.claude/agents/teams-search.md` line 6:

Old:
```yaml
maxTurns: 20
```

New:
```yaml
maxTurns: 25
```

Step 5 adds 2-3 extra turns (read context + LLM reasoning + write output). Increase from 20 → 25 for safety margin.

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/teams-search.md
git commit -m "chore(teams-search): increase maxTurns to 25 for Step 5 scoring"
```

---

### Task 3: Update inspection-writer to Read Digest

**Files:**
- Modify: `.claude/skills/inspection-writer/SKILL.md:48,111`

- [ ] **Step 1: Update Step 2a (first-time generation) — line 48**

Edit `.claude/skills/inspection-writer/SKILL.md` line 48:

Old:
```
读取：`case-info.md`、`emails.md`、`notes.md`、`teams/*.md`（如有）。
```

New:
```
读取：`case-info.md`、`emails.md`、`notes.md`、`teams/teams-digest.md`（如有；不存在则回退读 `teams/*.md`）。
```

- [ ] **Step 2: Update Step 2b (incremental update) — line 111**

Edit `.claude/skills/inspection-writer/SKILL.md` line 111:

Old:
```
仅读取**新增内容**（自上次 inspection 后的新邮件、notes、teams 消息）。
```

New:
```
仅读取**新增内容**（自上次 inspection 后的新邮件、notes、`teams/teams-digest.md` 的 Key Facts）。
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/inspection-writer/SKILL.md
git commit -m "feat(inspection-writer): read teams-digest.md instead of raw teams/*.md

Falls back to teams/*.md for backward compatibility with old case dirs."
```

---

### Task 4: Update troubleshooter to Read Digest

**Files:**
- Modify: `.claude/agents/troubleshooter.md:71`

- [ ] **Step 1: Update the teams read instruction — line 71**

Edit `.claude/agents/troubleshooter.md` line 71:

Old:
```
- `teams/` — Teams 讨论（如有）
```

New:
```
- `teams/teams-digest.md` — Teams 相关对话摘要（如有；不存在则回退读 `teams/*.md`）
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/troubleshooter.md
git commit -m "feat(troubleshooter): read teams-digest.md instead of raw teams/*.md

Falls back to teams/*.md for backward compatibility."
```

---

### Task 5: Update challenger to Read Digest

**Files:**
- Modify: `.claude/agents/challenger.md:49,87`

- [ ] **Step 1: Update evidence source table — line 49**

Edit `.claude/agents/challenger.md` line 49:

Old:
```
| `teams/*.md` | `customer-statement` | 实时沟通记录 |
```

New:
```
| `teams/teams-digest.md` | `customer-statement` | 实时沟通记录（已筛选；回退 `teams/*.md`） |
```

- [ ] **Step 2: Update file read list — line 87**

Edit `.claude/agents/challenger.md` line 87:

Old:
```
5. `{caseDir}/teams/*.md` — Teams 沟通记录（如存在）
```

New:
```
5. `{caseDir}/teams/teams-digest.md` — Teams 相关对话摘要（如存在；不存在则读 `teams/*.md`）
```

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/challenger.md
git commit -m "feat(challenger): read teams-digest.md instead of raw teams/*.md

Falls back to teams/*.md for backward compatibility."
```

---

### Task 6: Upgrade Dashboard Backend API

**Files:**
- Modify: `dashboard/src/routes/cases.ts:224-248`

- [ ] **Step 1: Rewrite the GET /api/cases/:id/teams endpoint**

Edit `dashboard/src/routes/cases.ts` lines 224-248. Replace the entire handler:

Old:
```typescript
// GET /api/cases/:id/teams
cases.get('/:id/teams', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  const teamsDir = join(caseDir, 'teams')

  if (!existsSync(teamsDir)) {
    return c.json({ chats: [], total: 0 })
  }

  try {
    const files = readdirSync(teamsDir).filter((f: string) => f.endsWith('.md') && !f.startsWith('_'))
    const chats = files.map((f: string) => {
      const content = readFileSync(join(teamsDir, f), 'utf-8')
      return {
        chatId: f.replace('.md', ''),
        content,
      }
    })
    return c.json({ chats, total: chats.length })
  } catch {
    return c.json({ chats: [], total: 0 })
  }
})
```

New:
```typescript
// GET /api/cases/:id/teams
cases.get('/:id/teams', (c) => {
  const caseNumber = validateCaseNumber(c)
  if (!caseNumber) return c.json({ error: 'Invalid case number' }, 400)
  const caseDir = getCaseDir(caseNumber)
  const teamsDir = join(caseDir, 'teams')

  if (!existsSync(teamsDir)) {
    return c.json({ digest: null, chats: [], total: 0 })
  }

  try {
    // Read relevance metadata if available
    const relevancePath = join(teamsDir, '_relevance.json')
    let relevanceData: Record<string, any> | null = null
    if (existsSync(relevancePath)) {
      try {
        relevanceData = JSON.parse(readFileSync(relevancePath, 'utf-8'))
      } catch { /* ignore parse errors */ }
    }

    // Read digest key facts if available
    let digest: { scoredAt: string; keyFacts: string[]; relevantCount: number; irrelevantCount: number } | null = null
    const digestPath = join(teamsDir, 'teams-digest.md')
    if (existsSync(digestPath) && relevanceData) {
      const digestContent = readFileSync(digestPath, 'utf-8')
      // Extract key facts from "## 关键事实（Key Facts）" section
      const factsMatch = digestContent.match(/## 关键事实（Key Facts）\n\n([\s\S]*?)(?=\n## |$)/)
      const keyFacts = factsMatch
        ? factsMatch[1].split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2))
        : []

      const chatsObj = relevanceData.chats || {}
      const relevantCount = Object.values(chatsObj).filter((v: any) => v.relevance === 'high').length
      const irrelevantCount = Object.values(chatsObj).filter((v: any) => v.relevance === 'low').length

      digest = {
        scoredAt: relevanceData._scoredAt || '',
        keyFacts,
        relevantCount,
        irrelevantCount,
      }
    }

    // Read chat files (exclude underscore-prefixed metadata files and digest)
    const files = readdirSync(teamsDir)
      .filter((f: string) => f.endsWith('.md') && !f.startsWith('_') && f !== 'teams-digest.md')
    const chats = files.map((f: string) => {
      const chatId = f.replace('.md', '')
      const content = readFileSync(join(teamsDir, f), 'utf-8')
      const chatRelevance = relevanceData?.chats?.[chatId]
      return {
        chatId,
        content,
        relevance: (chatRelevance?.relevance as string) || 'unknown',
        reason: chatRelevance?.reason || undefined,
      }
    })

    // Sort: high first, then low, then unknown
    const order: Record<string, number> = { high: 0, low: 1, unknown: 2 }
    chats.sort((a, b) => (order[a.relevance] ?? 2) - (order[b.relevance] ?? 2))

    return c.json({ digest, chats, total: chats.length })
  } catch {
    return c.json({ digest: null, chats: [], total: 0 })
  }
})
```

- [ ] **Step 2: Verify the build compiles**

Run: `cd dashboard && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add dashboard/src/routes/cases.ts
git commit -m "feat(dashboard): upgrade teams API to return relevance metadata

Reads _relevance.json and teams-digest.md to annotate each chat
with relevance score. Sorts chats: high → low → unknown. Returns
digest with key facts when available."
```

---

### Task 7: Update Dashboard Frontend Hook Type

**Files:**
- Modify: `dashboard/web/src/api/hooks.ts:81-87`

- [ ] **Step 1: Update the useCaseTeams hook type**

Edit `dashboard/web/src/api/hooks.ts` lines 81-87:

Old:
```typescript
export function useCaseTeams(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'teams'],
    queryFn: () => apiGet<{ chats: any[]; total: number }>(`/cases/${id}/teams`),
    enabled: !!id,
  })
}
```

New:
```typescript
interface TeamsDigest {
  scoredAt: string
  keyFacts: string[]
  relevantCount: number
  irrelevantCount: number
}

interface TeamsChat {
  chatId: string
  content: string
  relevance: 'high' | 'low' | 'unknown'
  reason?: string
}

interface TeamsResponse {
  digest: TeamsDigest | null
  chats: TeamsChat[]
  total: number
}

export function useCaseTeams(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'teams'],
    queryFn: () => apiGet<TeamsResponse>(`/cases/${id}/teams`),
    enabled: !!id,
  })
}
```

- [ ] **Step 2: Update the TeamsTab call site in CaseDetail.tsx — line 219**

Edit `dashboard/web/src/pages/CaseDetail.tsx` line 219:

Old:
```tsx
{activeTab === 'teams' && <TeamsTab chats={teamsData?.chats || []} />}
```

New:
```tsx
{activeTab === 'teams' && <TeamsTab chats={teamsData?.chats || []} digest={teamsData?.digest || null} />}
```

- [ ] **Step 3: Commit**

```bash
git add dashboard/web/src/api/hooks.ts dashboard/web/src/pages/CaseDetail.tsx
git commit -m "feat(dashboard): add typed TeamsResponse interface with digest support"
```

---

### Task 8: Rewrite Dashboard TeamsTab Component

**Files:**
- Modify: `dashboard/web/src/pages/CaseDetail.tsx:550-599`

- [ ] **Step 1: Rewrite the TeamsTab component**

Edit `dashboard/web/src/pages/CaseDetail.tsx` lines 550-599. Replace the entire `function TeamsTab` with:

```tsx
function TeamsTab({ chats, digest }: { chats: any[]; digest: { scoredAt: string; keyFacts: string[]; relevantCount: number; irrelevantCount: number } | null }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showOther, setShowOther] = useState(false)

  if (chats.length === 0) return <EmptyState icon="💬" title="No Teams chats" description="Teams data will appear after running casework or teams-search" />

  const filteredChats = searchTerm
    ? chats.filter(c => c.content?.toLowerCase().includes(searchTerm.toLowerCase()) || c.chatId?.toLowerCase().includes(searchTerm.toLowerCase()))
    : chats

  const relevantChats = filteredChats.filter(c => c.relevance === 'high')
  const otherChats = filteredChats.filter(c => c.relevance !== 'high')
  const hasScoring = digest !== null

  const highlightText = (text: string) => {
    if (!searchTerm) return text
    const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <mark key={i} className="px-0.5 rounded" style={{ background: 'var(--accent-amber-dim)' }}>{part}</mark>
        : part
    )
  }

  const renderChat = (chat: any, i: number) => (
    <Card key={chat.chatId || i} padding="sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
            {chat.chatId?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || `Chat ${i + 1}`}
          </h4>
          {chat.relevance === 'high' && (
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>relevant</span>
          )}
        </div>
        {chat.reason && <span className="text-xs truncate max-w-48" style={{ color: 'var(--text-tertiary)' }}>{chat.reason}</span>}
      </div>
      <div className="text-sm whitespace-pre-wrap max-h-96 overflow-y-auto" style={{ color: 'var(--text-secondary)' }}>
        {searchTerm ? highlightText(chat.content || '') : chat.content}
      </div>
    </Card>
  )

  return (
    <div className="space-y-3">
      {/* Key Facts Card */}
      {digest && digest.keyFacts.length > 0 && (
        <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-amber)' }}>
          <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-amber)' }}>🔑 关键事实（Key Facts）</h4>
          <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: 'var(--text-secondary)' }}>
            {digest.keyFacts.map((fact, i) => <li key={i}>{fact}</li>)}
          </ul>
          <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
            相关对话: {digest.relevantCount} / {digest.relevantCount + digest.irrelevantCount} · 评分时间: {new Date(digest.scoredAt).toLocaleString()}
          </p>
        </Card>
      )}

      {/* Search */}
      {chats.length > 1 && (
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search chats..."
          className="w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2"
          style={{ border: '1px solid var(--border-default)', boxShadow: 'none', outlineColor: 'var(--accent-blue)', '--tw-ring-color': 'var(--accent-blue)' } as React.CSSProperties}
        />
      )}

      {filteredChats.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>No matches for &ldquo;{searchTerm}&rdquo;</p>
      ) : hasScoring && !searchTerm ? (
        <>
          {/* Relevant Chats Section */}
          {relevantChats.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                📌 相关对话 ({relevantChats.length})
              </h3>
              {relevantChats.map(renderChat)}
            </div>
          )}

          {/* Other Chats Section — collapsed by default */}
          {otherChats.length > 0 && (
            <div>
              <button
                onClick={() => setShowOther(!showOther)}
                className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider w-full py-2 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ display: 'inline-block', transform: showOther ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                其他对话 ({otherChats.length})
              </button>
              {showOther && (
                <div className="space-y-2 mt-1">
                  {otherChats.map(renderChat)}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Flat layout: no scoring data OR user is searching */
        filteredChats.map(renderChat)
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd dashboard && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify visual rendering**

Run: `cd dashboard && npm run dev`
Open browser to `http://localhost:5173`, navigate to a case that has teams data, check the Teams tab renders correctly:
- If `_relevance.json` exists: Key Facts card + tiered layout
- If no `_relevance.json`: flat layout (backward compatible)

- [ ] **Step 4: Commit**

```bash
git add dashboard/web/src/pages/CaseDetail.tsx
git commit -m "feat(dashboard): tiered TeamsTab with Key Facts and collapsible sections

Shows Key Facts card at top, relevant chats expanded, other chats
collapsed by default. Falls back to flat layout for old cases
without relevance data. Search flattens all sections."
```

---

### Task 9: Integration Test — Run teams-search on a Real Case

This is a manual integration test to verify the full pipeline.

- [ ] **Step 1: Pick a test case**

Find an active case with existing teams data:
```bash
ls cases/active/ | head -5
```

Pick one, e.g., `2601290030000748`.

- [ ] **Step 2: Run teams-search with force-refresh**

Invoke the teams-search skill with `--force-refresh` for the chosen case to trigger Step 5.

Verify output files exist:
```bash
ls -la cases/active/{caseNumber}/teams/_relevance.json
ls -la cases/active/{caseNumber}/teams/teams-digest.md
```

- [ ] **Step 3: Validate _relevance.json format**

```bash
python3 -c "
import json, sys
data = json.load(open('cases/active/{caseNumber}/teams/_relevance.json'))
assert '_scoredAt' in data, 'Missing _scoredAt'
assert 'chats' in data, 'Missing chats'
for name, info in data['chats'].items():
    assert info['relevance'] in ('high', 'low'), f'{name}: bad relevance {info[\"relevance\"]}'
    assert 'reason' in info, f'{name}: missing reason'
    if info['relevance'] == 'high':
        assert 'keyFacts' in info and len(info['keyFacts']) > 0, f'{name}: high relevance but no keyFacts'
print('OK: _relevance.json valid')
"
```

- [ ] **Step 4: Validate teams-digest.md format**

```bash
head -20 cases/active/{caseNumber}/teams/teams-digest.md
```

Verify it contains:
- `# Teams 相关对话摘要` header
- `> Case:` metadata line
- `## 关键事实（Key Facts）` section
- At least one `### {name}` under `## 相关对话`

- [ ] **Step 5: Verify Dashboard renders correctly**

Open `http://localhost:5173/cases/{caseNumber}` → Teams tab.
Confirm:
- Key Facts card appears with amber left border
- Relevant chats show green "relevant" badge
- "其他对话" section is collapsed
- Clicking ▶ expands it
- Search still works across all chats

- [ ] **Step 6: Commit test results / fix any issues**

```bash
git add -A
git commit -m "test: verify teams relevance filter on live case {caseNumber}"
```
