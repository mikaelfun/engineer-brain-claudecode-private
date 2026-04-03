# Patrol SSE Message Flow Analysis

**Analysis Date:** 2026-03-31
**Codebase:** EngineerBrain Dashboard

---

## 1. HOW PATROL PROCESSES CASES

### Five-Phase Architecture

**Phase 1: Discovering**
- Read cases/active/ directory
- Collect all case numbers
- Emit: patrol-progress { phase: 'discovering', totalCases }

**Phase 2: Filtering**
- Read casehealth-meta.json (24-hour staleness check)
- Include: new cases, stale cases (>24h old)
- Skip: recently inspected
- Emit: patrol-progress { phase: 'filtering', changedCases }

**Phase 3: Warming-up**
- Run check-ir-status-batch.ps1 (D365 cache)
- Run warm-dtm-token.ps1 (DTM token)
- Parallel execution (failures don't block)
- Emit: patrol-progress { phase: 'warming-up' }

**Phase 4: Processing (Semaphore = 5 concurrent)**
- For each case:
  1. Acquire operation lock
  2. Emit: patrol-progress { phase: 'processing', currentCase }
  3. Call processCaseSession() - yields SDK messages
     - Broadcast: case-session-thinking
     - Broadcast: case-session-tool-call
     - Broadcast: case-session-tool-result
  4. Emit: patrol-case-completed
  5. Release lock
- Timeout: 15 minutes per case

**Phase 5: Aggregating**
- Read todo files, parse red/yellow/green items
- Emit: patrol-progress { phase: 'aggregating' }
- Emit: patrol-progress { phase: 'completed', todoSummary }
- Emit: patrol-updated

---

## 2. SSE EVENTS BROADCAST

### Patrol-Tier Events (Orchestration)

```
patrol-progress
  { phase, totalCases?, changedCases?, processedCases?, currentCase?, error? }

patrol-case-completed
  { caseNumber, processedCases, error? }

patrol-updated
  { todoSummary, processedCases, changedCases, totalCases }

sessions-changed
  { reason: 'patrol-case-started'|'patrol-case-completed', caseNumber }
```

### Case-Tier Events (Individual Casework)

```
case-session-thinking
  { caseNumber, sessionId, step: 'patrol', content, timestamp }

case-session-tool-call
  { caseNumber, sessionId, step: 'patrol', toolName, content, timestamp }

case-session-tool-result
  { caseNumber, sessionId, step: 'patrol', toolName, content, timestamp }

case-session-completed
  { caseNumber, sessionId, step: 'patrol' }
```

---

## 3. SINGLE-CASE PROCESSING SSE

### POST /case/:id/process

1. Acquire operation lock
2. Call processCaseSession() - async generator
3. For each SDK message:
   - If thinking/tool_use: broadcast case-session-thinking or case-session-tool-call
   - If tool_result: broadcast case-session-tool-result
   - Persist to .case-session-messages.json
4. Broadcast case-session-completed
5. Release lock

### broadcastSDKMessages() Function

Deep-parses SDK messages:
- message.type === 'assistant' -> content blocks (thinking, text, tool_use)
- message.type === 'tool_result' -> extract result content
- For each block: broadcast SSE event + persist

---

## 4. THE GAP: Why Casework Details Not in Patrol UI

### What's Broadcast
✓ Patrol-tier: phase, case count, progress %
✓ Case-tier: thinking, tool calls, tool results

### What's Displayed in Patrol UI
✓ Phase, case count, progress bar, case tags
✗ NOT: thinking, tool calls, tool results

### Why?
- Parallel complexity: 5 concurrent cases = ~50 events/sec
- Session isolation: Messages belong to case view, not patrol view
- UI clarity: Patrol shows orchestration, case view shows details

### Where Messages ARE Available
1. **In-memory:** useCaseSessionStore.messages[caseNumber]
2. **On-disk:** dashboard/.case-session-messages.json
3. **Access:** Case Detail View, filter by step === 'patrol'

---

## 5. FRONTEND PATROL MONITORING

### Patrol Store (patrolStore.ts)
```
isRunning: boolean
phase: string (discovering|filtering|warming-up|processing|aggregating|completed|failed)
totalCases: number
changedCases: number
processedCases: number
currentCase?: string
caseProgress: { caseNumber, status, error? }[]

onPatrolProgress(data)
onPatrolCaseCompleted(data)
```

### SSE Hook (useSSE.ts)
```
addEventListener('patrol-progress') -> patrolStore.onPatrolProgress()
addEventListener('patrol-case-completed') -> patrolStore.onPatrolCaseCompleted()
addEventListener('case-session-*') -> caseSessionStore.addMessage()
```

### Patrol UI (AgentMonitor.tsx)
- Read from patrolStore
- Display progress bar, phase text, case tags
- Show Cancel button
- Render case progress list

---

## 6. KEY CODE LOCATIONS

**Backend:**
- case-routes.ts (857 lines): POST /patrol, POST /case/:id/process
- case-session-manager.ts (1,423 lines): patrolCoordinator, processCaseSession
- sse-manager.ts (~100 lines): broadcast, client management
- sse-helpers.ts (~50 lines): message type mapping

**Frontend:**
- patrolStore.ts (87 lines): patrol state
- useSSE.ts (~300 lines): SSE listeners
- AgentMonitor.tsx (700+ lines): patrol UI

---

## 7. CONCURRENCY & CANCELLATION

### Semaphore
- Max 5 concurrent workers
- 15-minute timeout per case
- Operation lock prevents duplicate processing

### Cancellation
```
POST /patrol/cancel
  -> cancelPatrol()
     -> Set patrolCancelled = true
     -> For each active case: abortQuery(caseNumber)
     -> Release all locks
```

---

## 8. CONCLUSION

### Architecture
- Patrol broadcasts TWO TIERS: orchestration + details
- Frontend displays ONLY orchestration in patrol card (by design)
- Detailed messages persisted for case detail view

### Strengths
✓ Parallel execution (5 concurrent)
✓ Real-time SSE monitoring
✓ Error handling + timeouts
✓ Message persistence
✓ Clean separation

### Key Insight
Patrol DOES broadcast casework details. The frontend deliberately doesn't
show them in the patrol progress card to avoid UI noise from parallel processing.
Access casework messages via Case Detail View.

