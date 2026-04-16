# TestLab Dashboard Architecture & Data Flow Analysis

**Date**: 2026-04-05  
**Scope**: TestLab.tsx (1850 lines), testLabStore.ts, api/hooks.ts, design-system.md  
**Goal**: Understand current architecture before redesigning ReasoningNarrative component

---

## 1. CURRENT COMPONENT HIERARCHY

```
TestLab (Main Page)
├── useInjectKeyframes() 
│   └─ Injects CSS animations (bar-pulse, shimmer, spin, float, connector-flow, etc.)
│
├── TestLabHeader (line ~240)
│   ├─ useRunnerStatus() [polling 5s]
│   ├─ useRunnerStart(), useRunnerStop() mutations
│   ├─ useElapsedTimer() hook (handles active/inactive timing)
│   ├─ useCountdown() hook (for "waiting" state)
│   └─ UI: Cycle | Stage badge | Elapsed/Countdown | Status dot | Controls (Start/Stop)
│       └─ Single line, compact, glass effect
│       └─ 3px shimmer bar at top when active
│
├── ReasoningNarrative (line 444) ⚠️ TARGET FOR REDESIGN
│   ├─ useTestSupervisor() [polling 10s, returns ~/tests/supervisor endpoint]
│   ├─ Data: supervisorData { reasoning, selfHealEvent, step, tick }
│   ├─ Smart collapse: auto-expands if selfHealEvent or reasoning.reflect
│   ├─ UI: Collapsed summary (1 line) + optional expanded timeline (5 steps)
│   │   └─ Steps: observe → diagnose → decide → act → reflect
│   │   └─ Icons: 👁️ 🤺 🧠 ⚡ 💭
│   └─ External CLI detection: checks runnerStatus.status === 'external'
│
├── StagePipeline (line 662)
│   ├─ useTestPipeline() [polling 10s]
│   ├─ Data: pipelineData { cycle, maxCycles, currentStage, status, stages[] }
│   ├─ Layout: Horizontal flex, 5 stages: SCAN → GENERATE → TEST → FIX → VERIFY
│   ├─ Per stage:
│   │   ├─ Icon (36px emoji)
│   │   ├─ Name (uppercase mono)
│   │   ├─ Status indicator (spinner when running, checkmark when done, dim if pending)
│   │   ├─ Summary text (truncated, gray)
│   │   └─ Connector line (lit/flowing/off states with animations)
│   ├─ Color mapping: SCAN(blue) GENERATE(purple) TEST(amber) FIX(red) VERIFY(green)
│   └─ Animations: icon float (2.2s), connector flow (1.6s), stage glow pulse
│
├── StatsBar (line 866)
│   ├─ useTestStats() [polling 15s]
│   ├─ Data: cumulative + cycleStats { passed, failed, fixed, skipped }
│   ├─ Layout: Two groups (TOTAL | CYCLE) separated by vertical line
│   └─ Icons: CheckCircle, XCircle, Wrench, SkipForward (colored)
│
├── Tabs Panel (line ~1500)
│   ├─ Tab 1: Overview
│   │   ├─ ActivityStream (line 1048)
│   │   │   ├─ apiGet('/tests/recent-events', { limit: 30 })
│   │   │   ├─ SSE listeners: 8 event types
│   │   │   │   ├─ test-state-updated
│   │   │   │   ├─ test-discoveries-updated
│   │   │   │   ├─ test-result-updated
│   │   │   │   ├─ test-evolution-updated
│   │   │   │   ├─ runner-status-changed
│   │   │   │   ├─ test-self-heal
│   │   │   │   ├─ test-learning
│   │   │   │   └─ test-strategy
│   │   │   ├─ Container: max-h-[260px], overflow-y-auto
│   │   │   └─ UI: emoji + time + phase badge + message
│   │   │
│   │   └─ QueuesPanel (line 917)
│   │       ├─ useTestQueues() [polling 15s]
│   │       ├─ Data: { testQueue, fixQueue, verifyQueue, regressionQueue, gaps, inProgress, skipRegistry }
│   │       └─ UI: Expandable queue cards with item lists
│   │
│   ├─ Tab 2: Discoveries
│   │   └─ useTestDiscoveries() [polling 60s]
│   │
│   └─ Tab 3: Trends & Evolution
│       ├─ useTestTrends() [polling 60s]
│       └─ useTestEvolution() [polling 60s]
```

---

## 2. DATA SOURCES & POLLING INTERVALS

### TanStack Query Hooks (`api/hooks.ts` lines 759-982)

| Hook | Endpoint | Polling | Retry | Purpose |
|------|----------|---------|-------|---------|
| `useTestPipeline()` | `/tests/pipeline` | 10s | 3x (skip 404) | Stages, cycle progress |
| `useTestSupervisor()` | `/tests/supervisor` | 10s | 3x (skip 404) | **5-step reasoning data** |
| `useRunnerStatus()` | `/tests/runner/status` | 5s | default | Runner state, timing |
| `useTestQueues()` | `/tests/queues` | 15s | 3x (skip 404) | Queue data |
| `useTestStats()` | `/tests/stats` | 15s | 3x (skip 404) | Cumulative & cycle counts |
| `useTestState()` | `/tests/state` | 30s | 3x (skip 404) | Full state (legacy/fallback) |
| `useTestDiscoveries()` | `/tests/discoveries` | 60s | 3x (skip 404) | Insights |
| `useTestTrends()` | `/tests/trends` | 60s | default | Trends |
| `useTestRegistry()` | `/tests/registry` | 5m | 3x (skip 404) | Test definitions |
| `useTestEvolution()` | `/tests/evolution` | 60s | 3x (skip 404) | Evolution |

### Runner Mutations

- `useRunnerStart()` → POST `/tests/runner/start` → invalidates runner-status queries
- `useRunnerStop()` → POST `/tests/runner/stop` → invalidates runner-status queries

---

## 3. STATE MANAGEMENT

### Zustand Store (`testLabStore.ts` lines 1-44)

**Intentionally thin** — most data comes from TanStack Query.

```typescript
interface TestLabState {
  livePhase: string | null           // From SSE push (immediate UI update)
  liveRound: number | null           // From SSE push
  liveCurrentTest: string | null     // From SSE push
  lastUpdated: string | null         // Timestamp
  
  // Actions
  onStateUpdate(data: { phase?, round?, currentTest? }): void
  reset(): void
}
```

**Purpose**: Instant SSE-driven UI response (not replacing Query cache)

### SSE Events (Real-time)

Listened in `ActivityStream` component (lines 1124-1173):

```
test-state-updated          → phase changed
test-discoveries-updated    → new insights
test-result-updated         → test result changed
test-evolution-updated      → evolution data changed
runner-status-changed       → runner state changed
test-self-heal              → self-healing triggered ⚠️ IMPORTANT
test-learning               → learning event
test-strategy               → strategy update
```

**Connection handling**: Reconnection badge shown if disconnected

---

## 4. REASONING NARRATIVE COMPONENT (TARGET FOR REDESIGN)

### Current Implementation (lines 444-641)

```typescript
function ReasoningNarrative({ 
  supervisorData,      // from useTestSupervisor()
  runnerStatus,        // from useRunnerStatus() 
  pipelineData         // from useTestPipeline()
})
```

### Data Shape

```typescript
supervisorData: {
  reasoning: {
    observe: "string content or null",
    diagnose: "...",
    decide: "...",
    act: "...",
    reflect: "..."
  },
  selfHealEvent: string | null,
  step: "observe" | "diagnose" | "decide" | "act" | "reflect" | null,
  tick: number
}
```

### 5 Reasoning Steps

| # | Step | Icon | Label | Purpose |
|---|------|------|-------|---------|
| 1 | observe | 👁️ | Observe | Gather test data, inspect failures |
| 2 | diagnose | 🤺 | Diagnose | Analyze root causes |
| 3 | decide | 🧠 | Decide | Plan fix strategy |
| 4 | act | ⚡ | Act | Execute fixes |
| 5 | reflect | 💭 | Reflect | Review results & learn |

### Collapse/Expand Logic

**Auto-expand** if:
- `selfHealEvent` is present (amber highlight)
- `reasoning.reflect` has content (purple highlight)

**Manual override** via button toggle

**Collapsed UI** (always visible):
- Summary text: `"⚡ CLI Active — running"` or `"💭 Reflecting — analysis complete"` etc.
- Progress: `"${filledSteps}/5 steps"` counter
- Chevron: up/down indicator

**Expanded UI** (with fadeIn animation):
- External CLI banner (if `runnerStatus.status === 'external'`)
- Vertical timeline: 5 steps, each collapsible
- Each step shows icon + label + content

### Key Logic Points

**Line 464-465**: Detects external CLI runs
```typescript
const isExternal = runnerStatus?.status === 'external'
const externalStage = isExternal ? (pipelineData?.currentStage || ...) : ''
```

**Line 468**: Smart fold decision
```typescript
const shouldAutoExpand = !!(selfHealEvent || reasoning.reflect)
```

**Line 485**: Color selection
```typescript
const summaryColor = selfHealEvent ? 'var(--accent-amber)' : 
                    isExternal ? 'var(--accent-blue)' : 
                    reasoning.reflect ? 'var(--accent-purple)' : 
                    
