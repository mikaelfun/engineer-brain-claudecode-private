# Note-Gap Skill — Exact Code Context Report

## 1. **add-note.ps1**
**Full path:** `C:\Users\fangkun\Documents\Claude Code Projects\EngineerBrain/skills/d365-case-ops/scripts/add-note.ps1`

**Key parameters (lines 15-24):**
```powershell
param(
    [Parameter(Mandatory=$true)] [string]$Title,
    [Parameter(Mandatory=$true)] [string]$Body,
    [Parameter(Mandatory=$false)] [string]$TicketNumber,
    [Parameter(Mandatory=$false)] [string]$OutputDir
)
```

**Call pattern from TypeScript (case-session-manager.ts, line 1032):**
- Action type: `note`
- Invoked via: `executeTodoAction(caseNumber, 'note', params)`
- Agent executes: `skills/d365-case-ops/scripts/add-note.ps1`
- Two modes: API mode (D365 annotations OData) + UI fallback (D365 form automation)

---

## 2. **fetch-notes.ps1**
**Full path:** `C:\Users\fangkun\Documents\Claude Code Projects\EngineerBrain/skills/d365-case-ops/scripts/fetch-notes.ps1`

**Cache staleness detection (lines 49-58):**
```powershell
# --- 读取本地已有的 annotationid（增量模式）---
$existingIds = @{}
if (-not $Force -and (Test-Path $notesFile)) {
    $content = Get-Content $notesFile -Raw
    $matches = [regex]::Matches($content, '<!-- id: ([a-f0-9\-]+) -->')
    foreach ($m in $matches) {
        $existingIds[$m.Groups[1].Value] = $true
    }
}
```
**Staleness mechanism:** Regex extracts `annotationid` from HTML comments; if file exists and `-Force` not set, only fetches new notes missing from `$existingIds`.

---

## 3. **notes.md format**
**File path:** `C:\Users\fangkun\Documents\Claude Code Projects\EngineerBrain/cases/active/2603060030001353/notes.md`

**First 30 lines (actual data):**
```markdown
# Notes — Case 2603060030001353

> Generated: 2026-03-27 09:42:15 | Total: 3 notes
<!-- id: 0a4544a0-efaf-4dc8-849a-bbd6f9d92981 -->
### 📝 3/6/2026 3:15 AM | CrmGlobal-DFM-MSaaS
**(no title)**

*(系统自动分配 → fangkun@microsoft.com. | SLA剩余: 109 min)*

---

<!-- id: 80fc6e6b-9e5b-1d8e-9bcb-698d2b34dab2 -->
### 📝 3/6/2026 4:05 AM | Kun Fang
**fangkun note**

- -IR
- -VW, CSAM is not heather kang, cc finder skip.

---

<!-- id: e9c8b032-a35d-5aff-b79e-be1086487a3c -->
### 📝 3/25/2026 8:53 AM | Kun Fang
**fangkun note**

- 分析客户告警邮件被 EOP 隔离的两类问题：
- (1) Sangfor 设备邮件因未通过 SPF 被标记为 SPOOF 
- (2) 内部平台邮件触发 SPAM 过滤。
```

**Timestamp format:** `M/D/YYYY H:MM AM|PM` (line 5 format); stores annotationid as HTML comment `<!-- id: {guid} -->`

---

## 4. **case-summary.md format**
**File path:** `C:\Users\fangkun\Documents\Claude Code Projects\EngineerBrain/cases/active/2603060030001353/case-summary.md`

**"排查进展" section (lines 6-17):**
```markdown
## 排查进展
- [2026-03-06] Case 开立。工程师分析隔离样本，发现两类问题...
- [2026-03-06] 客户尝试将设备 IP 加入 EFSkipIPs...
- [2026-03-10] 客户询问其他公司混合部署处理方式...
- ...
- [2026-03-27] 工程师认可防钓鱼风险，调整建议：优先用 SPF 加固定告警设备 IP...
```

**Structure:** Dated timeline entries prefixed with `[YYYY-MM-DD]`, each describing one action/milestone.

---

## 5. **UI Layout: CaseDetail.tsx + CaseAIPanel.tsx**

**CaseDetail.tsx (lines 45-57):** Tab-based layout:
```typescript
const tabs = [
  { id: 'summary', label: 'Summary', icon: '📋' },
  { id: 'todo', label: 'Todo', icon: '📌', count: todoData?.total },
  { id: 'notes', label: 'Notes', icon: '📝', count: notesData?.total },
  { id: 'ai', label: 'AI Assistant', icon: '🤖' },
  // ... 8 more tabs
]
```

**CaseAIPanel.tsx (lines 70-79):** Renders in two modes:
- `compact` — sidebar with action buttons
- `full` — tab pane with grid actions + messages + session management

**Where to render NoteGapCard:**
- Option A: **In CaseDetail Summary tab** (main panel after metadata)
- Option B: **In CaseAIPanel compact sidebar** (quick action card)
- Recommended: **CaseDetail Summary tab** (persistent visibility + structured layout)

---

## 6. **Existing route pattern: case-routes.ts**

**Todo execution endpoint (case-routes.ts, lines 498-593):**
```typescript
// POST /todo/:id/execute — 执行 Todo 项
caseRoutes.post('/todo/:id/execute', async (c) => {
  const caseNumber = c.req.param('id')
  const body = await c.req.json<{
    action: string
    params: Record<string, string>
    lineNumber?: number
  }>()
  
  // Calls executeTodoAction(caseNumber, body.action, body.params || {})
  // Broadcasts SSE events: 'todo-execute-progress', 'todo-execute-result'
})
```

**Pattern for note-gap endpoint (propose):**
```typescript
// POST /case/:id/note-gap/analyze — Analyze note gaps
caseRoutes.post('/case/:id/note-gap/analyze', async (c) => {
  // Similar to /todo/:id/execute:
  // - Extract caseNumber from params
  // - Call analyzeCaseNoteGaps() generator
  // - Broadcast SSE events ('note-gap-progress', 'note-gap-result')
  // - Enqueue via sdkQueue (line 224: sdkQueue.enqueue(processAsync, ...)
})
```

---

## 7. **config.json current fields**
**Path:** `C:\Users\fangkun\Documents\Claude Code Projects\EngineerBrain/config.json`

```json
{
  "casesRoot": "./cases",
  "dataRoot": "C:\Users\fangkun\Documents\EngineerBrain-Data",
  "teamsSearchCacheHours": 4,
  "podAlias": "mcpodvm@microsoft.com",
  "onenote": {
    "personalNotebook": "Kun Fang OneNote",
    "teamNotebooks": ["MCVKB"],
    "freshnessThresholdMonths": 12,
    "autoRagSync": true
  }
}
```

**Proposed addition for note-gap:**
```json
"noteGap": {
  "minGapHours": 24,
  "summaryRefreshThresholdHours": 2,
  "cacheDir": "./cache/note-gaps"
}
```

---

## Implementation Checklist

1. ✅ **add-note.ps1** — API + UI modes; calls `/annotations` OData endpoint
2. ✅ **fetch-notes.ps1** — Incremental via annotationid dedup; `stripHTML()` function (lines 116-138)
3. ✅ **notes.md** — Timestamp: `M/D/YYYY H:MM AM|PM`; id: `<!-- id: {guid} -->`
4. ✅ **case-summary.md** — Dated bullets: `- [YYYY-MM-DD] action description`
5. ✅ **UI** — Tabs + sidebar modes; use CaseDetail Summary for NoteGapCard
6. ✅ **Routes** — POST `/case/:id/note-gap/analyze`; SSE broadcast + sdkQueue
7. ✅ **Config** — Add `noteGap` section for threshold/cache settings

