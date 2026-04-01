# Test Supervisor Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the existing test supervisor with a priority engine (UX-first test ordering), competitive fix (multi-agent parallel solutions), and morning report system (structured event log + Markdown/Dashboard output).

**Architecture:** Three independent modules layered onto the existing SCAN-GENERATE-TEST-FIX-VERIFY pipeline. Module A (foundation) provides the event writer and queue sorter scripts. Module B enriches SCAN with impact classification. Module C adds multi-agent competitive fixing. Module D integrates event logging into all phases. Module E generates the morning report. Module F adds Dashboard visualization.

**Tech Stack:** Bash (executors), Markdown (phase instructions), JSON/JSONL (data), React + TypeScript (Dashboard page)

**Spec:** `docs/superpowers/specs/2026-04-01-test-supervisor-enhancement-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `playbooks/rules/impact-classification.md` | P0-P3 impact classification rules for scanners |
| `tests/executors/event-writer.sh` | Append structured events to events.jsonl |
| `tests/executors/queue-sorter.sh` | Sort queues by impact priority |
| `tests/executors/morning-report-generator.sh` | Generate Markdown report + Dashboard JSON from events.jsonl |
| `tests/results/fix-proposals/` | Directory for competitive fix proposal files |

### Modified Files

| File | Change |
|------|--------|
| `.claude/skills/stage-worker/phases/SCAN.md` | Add impact classification instructions to GAP output |
| `.claude/skills/stage-worker/phases/state-update.md` | Add queue-sorter call after SCAN completes |
| `.claude/skills/stage-worker/phases/FIX.md` | Add complexity triage + competitive fix flow |
| `.claude/skills/stage-worker/phases/common.md` | Add event-writer rules and event type reference |
| `.claude/skills/stage-worker/phases/TEST.md` | Add event writing for test pass/fail |
| `.claude/skills/stage-worker/phases/VERIFY.md` | Add event writing for verify results + fix outcomes |
| `.claude/agents/test-supervisor-runner.md` | Add morning report generation to Reflect step |
| `tests/pipeline.json` | Add `priorityConfig` section |

---

## Task 1: Impact Classification Rules

**Files:**
- Create: `playbooks/rules/impact-classification.md`

- [ ] **Step 1: Create the classification rules document**

```markdown
# Impact Classification Rules

## Purpose
供 SCAN 阶段各 scanner 在发现 gap 时对其用户影响进行分级。

## 分级定义

| 等级 | 名称 | 定义 | 关键词信号 |
|------|------|------|-----------|
| **P0** | 流程断裂 | 核心用户流程完全跑不通 | casework 中断、dashboard 无法加载、patrol 失败、session crash、白屏 |
| **P1** | 功能故障 | 功能存在但执行时报错或产出错误结果 | 按钮无响应、API 报错、草稿生成失败、Todo 执行失败、数据丢失 |
| **P2** | 体验退化 | 功能可用但体验明显变差 | 耗时 >2x 基线、UI 错位、对比度不足、响应慢、交互卡顿 |
| **P3** | 代码质量 | 不影响用户可见行为 | 架构不合理、代码重复、类型不安全、命名不规范、注释缺失 |

## 分级规则

### 按 area 的默认倾向
- `casework` / `patrol` — 偏 P0-P1（核心业务流程）
- `dashboard` — UI 相关偏 P2，功能相关偏 P1
- `email-drafter` / `troubleshooter` — 偏 P1
- `arch` / `unit-test` — 偏 P3

### 按 scanner 类型
- `issue-scanner` — 按 issue 自身 priority 映射：critical→P0, high→P1, medium→P2, low→P3
- `design-fidelity` — 默认 P2（视觉问题），除非涉及"不可操作"则 P1
- `performance` — delta >100% 为 P1，>50% 为 P2，其他 P3
- `architecture` — 默认 P3，除非涉及安全/数据丢失风险则 P1
- `observability` — 默认 P2
- `ux-review` — 默认 P2

### 覆盖规则
- Scanner 可在 GAP 输出中显式指定 impact，覆盖默认值
- 如果 gap description 包含关键词信号，优先使用关键词对应的等级
```

- [ ] **Step 2: Verify file created**

Run: `cat playbooks/rules/impact-classification.md | head -5`
Expected: `# Impact Classification Rules`

- [ ] **Step 3: Commit**

```bash
git add playbooks/rules/impact-classification.md
git commit -m "docs: add impact classification rules for test supervisor priority engine"
```

---

## Task 2: Event Writer Script

**Files:**
- Create: `tests/executors/event-writer.sh`
- Test: manual invocation + output verification

- [ ] **Step 1: Write the event-writer.sh script**

```bash
#!/usr/bin/env bash
# event-writer.sh — Append structured events to events.jsonl
# Usage: bash tests/executors/event-writer.sh --type <type> --impact <P0-P3> --area <area> --detail <detail> [--result pass|fail] [--method direct|competitive] [--chosen <agent>] [--confidence <0-1>] [--delta <string>] [--fixed true|false]
#
# Output: EVENT_WRITE|success|<type>|<impact>
# Appends one JSONL line to tests/results/events.jsonl

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EVENTS_FILE="$SCRIPT_DIR/../results/events.jsonl"

# Parse arguments
TYPE="" IMPACT="" AREA="" DETAIL="" RESULT="" METHOD="" CHOSEN="" CONFIDENCE="" DELTA="" FIXED=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --type)      TYPE="$2"; shift 2 ;;
    --impact)    IMPACT="$2"; shift 2 ;;
    --area)      AREA="$2"; shift 2 ;;
    --detail)    DETAIL="$2"; shift 2 ;;
    --result)    RESULT="$2"; shift 2 ;;
    --method)    METHOD="$2"; shift 2 ;;
    --chosen)    CHOSEN="$2"; shift 2 ;;
    --confidence) CONFIDENCE="$2"; shift 2 ;;
    --delta)     DELTA="$2"; shift 2 ;;
    --fixed)     FIXED="$2"; shift 2 ;;
    *) echo "EVENT_WRITE|error|unknown arg: $1" >&2; exit 1 ;;
  esac
done

# Validate required fields
if [[ -z "$TYPE" || -z "$IMPACT" || -z "$AREA" || -z "$DETAIL" ]]; then
  echo "EVENT_WRITE|error|missing required fields (--type --impact --area --detail)" >&2
  exit 1
fi

# Validate type
VALID_TYPES="feature_verified bug_discovered bug_fixed fix_failed perf_regression perf_improved ui_issue flow_broken needs_human"
if ! echo "$VALID_TYPES" | grep -qw "$TYPE"; then
  echo "EVENT_WRITE|error|invalid type: $TYPE" >&2
  exit 1
fi

# Validate impact
if [[ ! "$IMPACT" =~ ^P[0-3]$ ]]; then
  echo "EVENT_WRITE|error|invalid impact: $IMPACT (must be P0-P3)" >&2
  exit 1
fi

# Ensure results directory exists
mkdir -p "$(dirname "$EVENTS_FILE")"

# Build JSON line
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Escape detail for JSON (handle quotes and backslashes)
DETAIL_ESCAPED=$(printf '%s' "$DETAIL" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g')

JSON="{\"ts\":\"$TS\",\"type\":\"$TYPE\",\"impact\":\"$IMPACT\",\"area\":\"$AREA\",\"detail\":\"$DETAIL_ESCAPED\""

# Add optional fields
[[ -n "$RESULT" ]]     && JSON="$JSON,\"result\":\"$RESULT\""
[[ -n "$METHOD" ]]     && JSON="$JSON,\"method\":\"$METHOD\""
[[ -n "$CHOSEN" ]]     && JSON="$JSON,\"chosen\":\"$CHOSEN\""
[[ -n "$CONFIDENCE" ]] && JSON="$JSON,\"confidence\":$CONFIDENCE"
[[ -n "$DELTA" ]]      && JSON="$JSON,\"delta\":\"$DELTA\""
[[ -n "$FIXED" ]]      && JSON="$JSON,\"fixed\":$FIXED"

JSON="$JSON}"

# Atomic append (>> is atomic for lines < PIPE_BUF on POSIX)
echo "$JSON" >> "$EVENTS_FILE"

echo "EVENT_WRITE|success|$TYPE|$IMPACT"
```

- [ ] **Step 2: Make executable and test with a sample event**

Run:
```bash
chmod +x tests/executors/event-writer.sh
bash tests/executors/event-writer.sh --type feature_verified --impact P0 --result pass --area casework --detail "Case处理全流程正常完成"
```
Expected: `EVENT_WRITE|success|feature_verified|P0`

- [ ] **Step 3: Verify JSONL output**

Run: `cat tests/results/events.jsonl | tail -1 | python3 -m json.tool`
Expected: Valid JSON with `type`, `impact`, `area`, `detail`, `result` fields.

- [ ] **Step 4: Test error handling — missing fields**

Run: `bash tests/executors/event-writer.sh --type bug_discovered --impact P1 2>&1`
Expected: `EVENT_WRITE|error|missing required fields`

- [ ] **Step 5: Test error handling — invalid type**

Run: `bash tests/executors/event-writer.sh --type invalid_type --impact P0 --area test --detail "test" 2>&1`
Expected: `EVENT_WRITE|error|invalid type: invalid_type`

- [ ] **Step 6: Clean up test data and commit**

```bash
rm -f tests/results/events.jsonl
git add tests/executors/event-writer.sh
git commit -m "feat: add event-writer.sh for structured event logging"
```

---

## Task 3: Queue Sorter Script

**Files:**
- Create: `tests/executors/queue-sorter.sh`

- [ ] **Step 1: Write the queue-sorter.sh script**

```bash
#!/usr/bin/env bash
# queue-sorter.sh — Sort testQueue by impact priority (P0 first)
# Usage: bash tests/executors/queue-sorter.sh
#
# Reads tests/queues.json, sorts testQueue by impact field, writes back via state-writer.sh
# Items without impact field are treated as P3 (lowest priority)
# Within same priority, original order is preserved (stable sort)
#
# Output: QUEUE_SORT|success|<count> items sorted

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
QUEUES_FILE="$SCRIPT_DIR/../queues.json"

if [[ ! -f "$QUEUES_FILE" ]]; then
  echo "QUEUE_SORT|error|queues.json not found"
  exit 1
fi

# Read current testQueue
QUEUE_JSON=$(cat "$QUEUES_FILE")
QUEUE_LENGTH=$(echo "$QUEUE_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
q = data.get('testQueue', [])
print(len(q))
")

if [[ "$QUEUE_LENGTH" -le 1 ]]; then
  echo "QUEUE_SORT|skip|$QUEUE_LENGTH items (no sort needed)"
  exit 0
fi

# Sort by impact: P0 < P1 < P2 < P3 < missing
# Uses python3 for reliable JSON handling + stable sort
SORTED_QUEUE=$(cat "$QUEUES_FILE" | python3 -c "
import json, sys

data = json.load(sys.stdin)
queue = data.get('testQueue', [])

priority_order = {'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3}

def sort_key(item):
    if isinstance(item, str):
        return 3  # string items (legacy) → P3
    impact = item.get('impact', 'P3')
    return priority_order.get(impact, 3)

queue.sort(key=sort_key)
print(json.dumps(queue))
")

# Write back via state-writer
echo "{\"testQueue\":$SORTED_QUEUE}" | bash "$SCRIPT_DIR/state-writer.sh" --target queues --merge

echo "QUEUE_SORT|success|$QUEUE_LENGTH items sorted"
```

- [ ] **Step 2: Make executable and verify syntax**

Run: `chmod +x tests/executors/queue-sorter.sh && bash -n tests/executors/queue-sorter.sh`
Expected: No output (syntax OK)

- [ ] **Step 3: Commit**

```bash
git add tests/executors/queue-sorter.sh
git commit -m "feat: add queue-sorter.sh for impact-based test prioritization"
```

---

## Task 4: SCAN Phase — Add Impact Classification

**Files:**
- Modify: `.claude/skills/stage-worker/phases/SCAN.md`
- Reference: `playbooks/rules/impact-classification.md` (created in Task 1)

- [ ] **Step 1: Read current SCAN.md**

Read `.claude/skills/stage-worker/phases/SCAN.md` to locate the GAP output format section.

- [ ] **Step 2: Update GAP output format to include impact**

Find the existing GAP output format line:
```
GAP|{type}|{source}|{category}|{description}|{priority}
```

Replace with:
```
GAP|{type}|{source}|{category}|{description}|{priority}|{impact}|{impactReason}
```

- [ ] **Step 3: Add impact classification instructions**

After the GAP output format definition, add a new section:

```markdown
### Impact Classification（优先级引擎）

每个 GAP 必须附带 `impact` 和 `impactReason` 字段。分级规则详见 `playbooks/rules/impact-classification.md`。

**快速参考：**
- **P0 — 流程断裂**: 核心用户流程（casework/patrol/dashboard加载）完全不可用
- **P1 — 功能故障**: 功能存在但执行报错（按钮无响应、API 错误、生成失败）
- **P2 — 体验退化**: 能用但体验差（耗时过长、UI 错位、对比度不足）
- **P3 — 代码质量**: 不影响用户（架构问题、代码重复、类型不安全）

**写入 queues.json 时的格式**：
```json
{
  "testId": "xxx",
  "impact": "P1",
  "impactReason": "Todo执行是用户日常操作的核心功能",
  "... 其他现有字段 ...": "..."
}
```

**impactReason** 用一句话解释为什么是这个等级，供晨报展示。
```

- [ ] **Step 4: Add event writing for scan discoveries**

In the SCAN phase, after gap discovery steps (Steps 1-7), add instruction:

```markdown
### SCAN 事件记录

每发现一个 gap，写入事件：
```bash
bash tests/executors/event-writer.sh \
  --type bug_discovered \
  --impact {impact} \
  --area {area} \
  --detail "{gap description}"
```

如果是性能类 gap（performance scanner 发现），使用 `perf_regression` 类型并附带 `--delta`。
如果是 UI/设计类 gap（design-fidelity scanner），使用 `ui_issue` 类型。
如果是流程断裂（E2E 整体失败），使用 `flow_broken` 类型。
```

- [ ] **Step 5: Verify SCAN.md is syntactically coherent**

Read the modified file and confirm all sections are properly connected.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/stage-worker/phases/SCAN.md
git commit -m "feat: add impact classification to SCAN phase GAP discovery"
```

---

## Task 5: State Update — Add Queue Sorting After SCAN

**Files:**
- Modify: `.claude/skills/stage-worker/phases/state-update.md`

- [ ] **Step 1: Read current state-update.md**

Read `.claude/skills/stage-worker/phases/state-update.md` to locate the stage completion logic.

- [ ] **Step 2: Add queue sorting step after SCAN**

After the stage completion state write (Step 2) and before the circuit breaker (Step 2.2), add:

```markdown
### Step 2.05: Queue Priority Sort（仅 SCAN 后）

如果刚完成的阶段是 `SCAN` 且 `testQueue` 非空：

```bash
bash tests/executors/queue-sorter.sh
```

确保高优先级（P0）的测试最先执行。排序基于 queue item 的 `impact` 字段。
无 `impact` 字段的 item 视为 P3。
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/stage-worker/phases/state-update.md
git commit -m "feat: add queue priority sorting after SCAN completion"
```

---

## Task 6: Pipeline Config — Add Priority Settings

**Files:**
- Modify: `tests/pipeline.json`

- [ ] **Step 1: Read current pipeline.json**

Read `tests/pipeline.json` to understand current structure.

- [ ] **Step 2: Add priorityConfig section**

Add to the top-level of `tests/pipeline.json`:

```json
"priorityConfig": {
  "skipP3": false,
  "maxP3Items": 10,
  "p0p1Only": false
}
```

Use `state-writer.sh --merge` to add:
```bash
echo '{"priorityConfig":{"skipP3":false,"maxP3Items":10,"p0p1Only":false}}' | bash tests/executors/state-writer.sh --target pipeline --merge
```

- [ ] **Step 3: Update SCAN.md to reference priorityConfig**

In SCAN.md, add to the impact classification section:

```markdown
### 预算控制

读取 `pipeline.json` 的 `priorityConfig`：
- `p0p1Only: true` → 只入队 P0 和 P1 gap，P2/P3 记录到事件日志但不入 testQueue
- `skipP3: true` → 不入队 P3 gap
- `maxP3Items: N` → P3 gap 最多入队 N 个

适用于时间紧张的短时运行。默认全部入队。
```

- [ ] **Step 4: Commit**

```bash
git add tests/pipeline.json .claude/skills/stage-worker/phases/SCAN.md
git commit -m "feat: add priorityConfig for test budget control"
```

---

## Task 7: FIX Phase — Competitive Fix Flow

**Files:**
- Modify: `.claude/skills/stage-worker/phases/FIX.md`
- Create: `tests/results/fix-proposals/` (directory)

- [ ] **Step 1: Read current FIX.md**

Read `.claude/skills/stage-worker/phases/FIX.md` to understand existing flow.

- [ ] **Step 2: Create fix-proposals directory**

```bash
mkdir -p tests/results/fix-proposals
```

- [ ] **Step 3: Add complexity triage before existing fix logic**

After Step -1 (timer) and the fixQueue sort, but BEFORE the batch processing loop, insert:

```markdown
### Step 0.5: Complexity Triage（复杂度分流）

对每个 fixQueue item 判断复杂度：

**Trivial 条件**（满足任一即为 trivial）：
- 有匹配的 fix recipe（`tests/recipes/fix/_index.md` 命中）
- `category === "framework"`（框架修复走现有路径）
- `isEnvIssue === true`（环境问题）
- fix-analyzer 报告的 failureType 是 `typo`、`config`、`import`
- 预估只涉及 1 个文件改动

**Non-trivial**（以上均不满足）：
- 跨文件改动
- 多种可能根因
- 涉及业务逻辑或架构决策
- 无匹配 recipe 且非环境问题

标记方式：在处理每个 item 时，先运行 `fix-analyzer.sh`，根据返回结果判断 `complexity = trivial | non-trivial`。

- Trivial → 走 **现有修复路径**（Step c-e，不变）
- Non-trivial → 走 **竞争修复路径**（Step f，新增）
```

- [ ] **Step 4: Add competitive fix flow as Step f**

After the existing fix logic (Steps c-e), add:

```markdown
### Step f: 竞争修复路径（Non-trivial Only）

当 `complexity === "non-trivial"` 时执行：

**f1. 构建问题包**

收集以下信息组成问题包：
- fix-analyzer.sh 的完整输出（根因分析）
- 失败的测试文件内容（`tests/registry/{category}/{testId}.yaml`）
- 测试结果日志（`tests/results/{testId}/`）
- 相关源代码文件（根据 fix-analyzer 报告的涉及文件）

**f2. Spawn 三个并行 fix-proposer agents**

```
Agent A（保守）: 
  prompt: "你是保守修复专家。目标：最小改动修复问题。优先 workaround，不引入新风险。
           禁止改动 3 个以上文件。禁止重构。
           [问题包内容]
           输出 JSON 到 tests/results/fix-proposals/{testId}-conservative.json"

Agent B（激进）:
  prompt: "你是根治修复专家。目标：从根因彻底解决问题。允许必要的重构。
           追求长期最优解，即使改动较大。
           [问题包内容]
           输出 JSON 到 tests/results/fix-proposals/{testId}-aggressive.json"

Agent C（平衡）:
  prompt: "你是平衡修复专家。目标：在改动量和彻底性之间取最佳平衡。
           适度改动，兼顾短期可用与长期可维护。
           [问题包内容]
           输出 JSON 到 tests/results/fix-proposals/{testId}-balanced.json"
```

每个 agent 使用 `isolation: "worktree"` 在独立 worktree 中工作。
三个 agent **并行 spawn**（在同一消息中发送三个 Agent 工具调用）。

**提案输出格式**（每个 agent 必须遵循）：
```json
{
  "agent": "conservative|aggressive|balanced",
  "targetId": "{testId}",
  "diagnosis": "一段根因分析",
  "plan": ["步骤1", "步骤2", "..."],
  "files_affected": ["path/to/file1.ts", "path/to/file2.ts"],
  "changes_summary": "改动摘要（1-2句）",
  "risk_assessment": "风险评估",
  "estimated_confidence": 0.85
}
```

**f3. Supervisor 评分**

读取三个提案 JSON，按以下维度打分（0-10）：

| 维度 | 权重 | 评判标准 |
|------|------|---------|
| 正确性 | 35% | diagnosis 是否准确定位根因，plan 是否真正解决问题 |
| 风险控制 | 25% | changes 是否可能破坏其他功能，files_affected 中有无高风险文件 |
| 改动范围 | 15% | files_affected 数量，越少越好 |
| 可验证性 | 15% | 修复后能否通过原测试轻松验证 |
| 副作用 | 10% | 是否引入新的技术债或依赖 |

加权总分 = sum(维度得分 × 权重)

**f4. 选择与执行**

- 最高分方案 ≥ 5.0 → **选中该方案**，切换到其 worktree 并 merge 改动到主分支
- 最高分 < 5.0 → **标记 `needs_human`**，不执行修复，写入事件日志
- 如果两个方案可互补（如 A 的诊断 + B 的实现）→ supervisor 可融合，但需在 reasoning 中说明

**f5. 记录**

- 三个提案 JSON 保留在 `tests/results/fix-proposals/`（供审计）
- 评分结果写入 `supervisor.json` 的 reasoning：
  ```json
  {"competitiveFix": {"testId": "xxx", "scores": {"conservative": 7.2, "aggressive": 6.1, "balanced": 8.0}, "chosen": "balanced", "reason": "..."}}
  ```
- 写入事件：
  ```bash
  bash tests/executors/event-writer.sh --type bug_fixed --impact {impact} --area {area} --detail "{what was fixed}" --method competitive --chosen {agent_name} --confidence {score}
  ```
- 未选中的 worktree 自动清理

**f6. 进入 VERIFY**

选中的修复进入 verifyQueue，走正常 VERIFY 流程。
```

- [ ] **Step 5: Verify FIX.md coherence**

Read the complete modified file and verify:
- Trivial path still works as before
- Non-trivial path has clear entry/exit points
- No contradictions with existing steps

- [ ] **Step 6: Commit**

```bash
mkdir -p tests/results/fix-proposals
git add .claude/skills/stage-worker/phases/FIX.md tests/results/fix-proposals/.gitkeep
git commit -m "feat: add competitive fix flow for non-trivial repairs"
```

---

## Task 8: Common Rules — Add Event Writing Standards

**Files:**
- Modify: `.claude/skills/stage-worker/phases/common.md`

- [ ] **Step 1: Read current common.md**

Read `.claude/skills/stage-worker/phases/common.md`.

- [ ] **Step 2: Add event writing rules section**

Append after the existing Directive 处理 section:

```markdown
## 🔵 Event Writing（事件记录）

所有 stage 必须在关键动作点写入事件日志。

**工具**: `bash tests/executors/event-writer.sh`

**必填参数**: `--type --impact --area --detail`

**事件类型速查**:

| type | 何时写入 | 必须附加的参数 |
|------|---------|--------------|
| `feature_verified` | TEST 中测试完成 | `--result pass\|fail` |
| `bug_discovered` | TEST 失败分析确认为 bug | — |
| `bug_fixed` | FIX → VERIFY 通过 | `--method direct\|competitive` |
| `fix_failed` | VERIFY 未通过 | — |
| `perf_regression` | performance scanner 检出退化 | `--delta "+XX%"` |
| `perf_improved` | FIX 后性能改善 | `--delta "-XX%"` |
| `ui_issue` | design-fidelity scanner 检出 | — |
| `flow_broken` | E2E 测试核心流程断裂 | — |
| `needs_human` | 竞争修复评分都 < 5.0 | — |

**area 值**: 使用 test 所属的功能区域，如 `casework`, `dashboard`, `patrol`, `email-drafter`, `troubleshooter`, `data-refresh`, `compliance`, `framework`

**规则**:
- 事件写入是 **advisory**，失败不阻塞流程（`|| true`）
- 不要重复写入同一个发现（SCAN 写了就不要 TEST 再写）
- `detail` 用中文或英文均可，简洁描述（<100字）
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/stage-worker/phases/common.md
git commit -m "feat: add event writing rules to common phase instructions"
```

---

## Task 9: TEST Phase — Event Integration

**Files:**
- Modify: `.claude/skills/stage-worker/phases/TEST.md`

- [ ] **Step 1: Read current TEST.md**

Read `.claude/skills/stage-worker/phases/TEST.md`.

- [ ] **Step 2: Add event writing after each test execution**

In the batch processing loop, after step e (update state for PASS/FAIL), add:

```markdown
   **e2. 写入事件**

   测试通过：
   ```bash
   bash tests/executors/event-writer.sh \
     --type feature_verified --impact {item.impact:-P3} --result pass \
     --area {category} --detail "{testId} 验证通过" || true
   ```

   测试失败：
   ```bash
   bash tests/executors/event-writer.sh \
     --type feature_verified --impact {item.impact:-P3} --result fail \
     --area {category} --detail "{testId} 验证失败: {failure_summary}" || true
   ```

   如果失败分析确认是 bug（非测试本身问题）：
   ```bash
   bash tests/executors/event-writer.sh \
     --type bug_discovered --impact {item.impact:-P3} \
     --area {category} --detail "{root cause summary}" || true
   ```
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/stage-worker/phases/TEST.md
git commit -m "feat: add event logging to TEST phase"
```

---

## Task 10: VERIFY Phase — Event Integration

**Files:**
- Modify: `.claude/skills/stage-worker/phases/VERIFY.md`

- [ ] **Step 1: Read current VERIFY.md**

Read `.claude/skills/stage-worker/phases/VERIFY.md`.

- [ ] **Step 2: Add event writing after verify results**

After step c (update state for PASS/FAIL), add:

```markdown
   **c2. 写入事件**

   验证通过（修复成功）：
   ```bash
   # 判断修复方式
   FIX_METHOD="direct"
   [[ -f "tests/results/fix-proposals/${testId}-conservative.json" ]] && FIX_METHOD="competitive"

   bash tests/executors/event-writer.sh \
     --type bug_fixed --impact {item.impact:-P3} \
     --area {category} --detail "{testId} 修复验证通过: {fix_summary}" \
     --method "$FIX_METHOD" || true
   ```

   验证失败（修复无效）：
   ```bash
   bash tests/executors/event-writer.sh \
     --type fix_failed --impact {item.impact:-P3} \
     --area {category} --detail "{testId} 修复验证失败 (retry ${retryCount})" || true
   ```
```

- [ ] **Step 3: Add needs_human event for competitive fix failures**

In the self-heal check section, when competitive fix proposals all score below threshold:

```markdown
   如果竞争修复三方案评分均 < 5.0：
   ```bash
   bash tests/executors/event-writer.sh \
     --type needs_human --impact {item.impact:-P1} \
     --area {category} --detail "{testId} 竞争修复三方案均低于阈值，需人工介入" || true
   ```
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/stage-worker/phases/VERIFY.md
git commit -m "feat: add event logging to VERIFY phase"
```

---

## Task 11: Morning Report Generator

**Files:**
- Create: `tests/executors/morning-report-generator.sh`

- [ ] **Step 1: Write the morning report generator**

```bash
#!/usr/bin/env bash
# morning-report-generator.sh — Generate morning report from events.jsonl
# Usage: bash tests/executors/morning-report-generator.sh [--date YYYY-MM-DD]
#
# Reads: tests/results/events.jsonl, tests/pipeline.json, tests/stats.json
# Writes: tests/results/morning-report-YYYY-MM-DD.md
#         tests/results/dashboard-data-YYYY-MM-DD.json
#
# Output: REPORT|success|<report_path>

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/../results"
EVENTS_FILE="$RESULTS_DIR/events.jsonl"

# Parse date argument
REPORT_DATE="${1:-$(date +%Y-%m-%d)}"
[[ "$1" == "--date" ]] && REPORT_DATE="$2"

REPORT_FILE="$RESULTS_DIR/morning-report-${REPORT_DATE}.md"
DASHBOARD_FILE="$RESULTS_DIR/dashboard-data-${REPORT_DATE}.json"

if [[ ! -f "$EVENTS_FILE" ]]; then
  echo "REPORT|error|no events.jsonl found"
  exit 1
fi

EVENT_COUNT=$(wc -l < "$EVENTS_FILE")
if [[ "$EVENT_COUNT" -eq 0 ]]; then
  echo "REPORT|error|events.jsonl is empty"
  exit 1
fi

# Use python3 for reliable JSON processing and report generation
python3 -c "
import json
import sys
from collections import Counter, defaultdict
from datetime import datetime

# Read events
events = []
with open('$EVENTS_FILE', 'r') as f:
    for line in f:
        line = line.strip()
        if line:
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                pass

if not events:
    print('REPORT|error|no valid events', file=sys.stderr)
    sys.exit(1)

# Read pipeline stats
pipeline = {}
try:
    with open('$SCRIPT_DIR/../pipeline.json', 'r') as f:
        pipeline = json.load(f)
except:
    pass

stats = {}
try:
    with open('$SCRIPT_DIR/../stats.json', 'r') as f:
        stats = json.load(f)
except:
    pass

# Compute summary
type_counts = Counter(e['type'] for e in events)
impact_groups = defaultdict(list)
area_groups = defaultdict(list)
for e in events:
    impact_groups[e.get('impact', 'P3')].append(e)
    area_groups[e.get('area', 'unknown')].append(e)

verified_pass = [e for e in events if e['type'] == 'feature_verified' and e.get('result') == 'pass']
verified_fail = [e for e in events if e['type'] == 'feature_verified' and e.get('result') == 'fail']
bugs_found = [e for e in events if e['type'] == 'bug_discovered']
bugs_fixed = [e for e in events if e['type'] == 'bug_fixed']
fix_failed = [e for e in events if e['type'] == 'fix_failed']
needs_human = [e for e in events if e['type'] == 'needs_human']
perf_reg = [e for e in events if e['type'] == 'perf_regression']
perf_imp = [e for e in events if e['type'] == 'perf_improved']
ui_issues = [e for e in events if e['type'] == 'ui_issue']
flow_broken = [e for e in events if e['type'] == 'flow_broken']

competitive_fixes = [e for e in bugs_fixed if e.get('method') == 'competitive']

cycles = pipeline.get('cycle', '?')
cumulative = stats.get('cumulative', pipeline.get('cumulative', {}))

# Calculate duration from first to last event
try:
    first_ts = datetime.fromisoformat(events[0]['ts'].replace('Z', '+00:00'))
    last_ts = datetime.fromisoformat(events[-1]['ts'].replace('Z', '+00:00'))
    duration = last_ts - first_ts
    hours = int(duration.total_seconds() // 3600)
    mins = int((duration.total_seconds() % 3600) // 60)
    duration_str = f'{hours}h {mins}m'
except:
    duration_str = '?'

# --- Generate Markdown Report ---
report = []
report.append(f'# Test Supervisor Morning Report - {\"$REPORT_DATE\"}\n')

# Executive summary
report.append('## Executive Summary\n')
report.append(f'| Metric | Value |')
report.append(f'|--------|-------|')
report.append(f'| Duration | {duration_str} |')
report.append(f'| Cycles | {cycles} |')
report.append(f'| Total Events | {len(events)} |')
report.append(f'| Features Verified | {len(verified_pass)} pass / {len(verified_fail)} fail |')
report.append(f'| Bugs Discovered | {len(bugs_found)} |')
report.append(f'| Auto-Fixed | {len(bugs_fixed)} (competitive: {len(competitive_fixes)}) |')
report.append(f'| Fix Failed | {len(fix_failed)} |')
report.append(f'| Needs Human | {len(needs_human)} |')
report.append(f'| Performance | {len(perf_reg)} regression / {len(perf_imp)} improved |')
report.append(f'| UI Issues | {len(ui_issues)} |')
report.append('')

# Needs attention (P0-P1 unfixed)
attention = [e for e in events if e.get('impact') in ('P0', 'P1') and e['type'] in ('bug_discovered', 'flow_broken', 'needs_human', 'fix_failed')]
if attention:
    report.append('## Needs Your Attention (P0-P1)\n')
    for i, e in enumerate(attention, 1):
        report.append(f\"### {i}. [{e.get('impact', '?')}] {e.get('detail', 'No detail')}\")
        report.append(f\"- **Area**: {e.get('area', '?')}\")
        report.append(f\"- **Type**: {e['type']}\")
        report.append('')

# Auto-fixed
if bugs_fixed:
    report.append('## Auto-Fixed\n')
    for i, e in enumerate(bugs_fixed, 1):
        method = e.get('method', 'direct')
        chosen = e.get('chosen', '')
        conf = e.get('confidence', '')
        line = f\"{i}. [{e.get('impact', '?')}] {e.get('detail', '')}\"
        if method == 'competitive':
            line += f' (competitive fix, chosen: {chosen}, confidence: {conf})'
        report.append(line)
    report.append('')

# Feature verification details
if verified_pass or verified_fail:
    report.append('## Feature Verification\n')
    report.append('| Feature | Impact | Result | Area |')
    report.append('|---------|--------|--------|------|')
    for e in verified_pass + verified_fail:
        result = 'PASS' if e.get('result') == 'pass' else 'FAIL'
        icon = 'v' if result == 'PASS' else 'x'
        report.append(f\"| {e.get('detail', '?')} | {e.get('impact', '?')} | {result} | {e.get('area', '?')} |\")
    report.append('')

# Performance
if perf_reg or perf_imp:
    report.append('## Performance\n')
    for e in perf_reg:
        report.append(f\"- REGRESSION [{e.get('impact', '?')}] {e.get('detail', '')} (delta: {e.get('delta', '?')})\")
    for e in perf_imp:
        report.append(f\"- IMPROVED [{e.get('impact', '?')}] {e.get('detail', '')} (delta: {e.get('delta', '?')})\")
    report.append('')

# UI Issues
if ui_issues:
    report.append('## UI/Design Issues\n')
    for e in ui_issues:
        report.append(f\"- [{e.get('impact', '?')}] {e.get('detail', '')} ({e.get('area', '?')})\")
    report.append('')

# Competitive fix decisions
if competitive_fixes:
    report.append('## Competitive Fix Decisions\n')
    for e in competitive_fixes:
        report.append(f\"- **{e.get('detail', '')}**: chosen={e.get('chosen', '?')}, confidence={e.get('confidence', '?')}\")
    report.append('')

# Write markdown report
with open('$REPORT_FILE', 'w', encoding='utf-8') as f:
    f.write('\n'.join(report))

# --- Generate Dashboard JSON ---
dashboard = {
    'runDate': '$REPORT_DATE',
    'duration': duration_str,
    'cycles': cycles,
    'summary': {
        'verified_pass': len(verified_pass),
        'verified_fail': len(verified_fail),
        'bugs': len(bugs_found),
        'fixed': len(bugs_fixed),
        'fix_failed': len(fix_failed),
        'needs_human': len(needs_human),
        'perf_regressions': len(perf_reg),
        'perf_improved': len(perf_imp),
        'ui_issues': len(ui_issues),
    },
    'events': events,
    'byArea': {area: [e for e in evts] for area, evts in area_groups.items()},
    'byImpact': {imp: [e for e in evts] for imp, evts in impact_groups.items()},
    'competitiveFixes': competitive_fixes,
}

with open('$DASHBOARD_FILE', 'w', encoding='utf-8') as f:
    json.dump(dashboard, f, ensure_ascii=False, indent=2)

print(f'REPORT|success|$REPORT_FILE')
"
```

- [ ] **Step 2: Make executable and verify syntax**

Run: `chmod +x tests/executors/morning-report-generator.sh && bash -n tests/executors/morning-report-generator.sh`
Expected: No output (syntax OK)

- [ ] **Step 3: Create test events and run generator**

```bash
# Create sample events
cat > tests/results/events.jsonl << 'EVENTS'
{"ts":"2026-04-01T23:15:00Z","type":"feature_verified","impact":"P0","result":"pass","area":"casework","detail":"Case处理全流程正常完成"}
{"ts":"2026-04-01T23:32:00Z","type":"bug_discovered","impact":"P1","area":"dashboard","detail":"Todo执行按钮无响应"}
{"ts":"2026-04-01T23:48:00Z","type":"bug_fixed","impact":"P1","area":"dashboard","detail":"修复event handler绑定","method":"competitive","chosen":"conservative","confidence":0.88}
{"ts":"2026-04-02T00:15:00Z","type":"perf_regression","impact":"P2","area":"data-refresh","detail":"单Case数据拉取耗时增加","delta":"+167%"}
{"ts":"2026-04-02T01:20:00Z","type":"flow_broken","impact":"P0","area":"patrol","detail":"批量巡检第3个Case后中断","fixed":false}
EVENTS

bash tests/executors/morning-report-generator.sh --date 2026-04-01
```

Expected: `REPORT|success|.../morning-report-2026-04-01.md`

- [ ] **Step 4: Verify generated report**

Run: `cat tests/results/morning-report-2026-04-01.md`
Expected: Markdown with Executive Summary, Needs Your Attention, Auto-Fixed sections.

- [ ] **Step 5: Verify dashboard JSON**

Run: `python3 -m json.tool tests/results/dashboard-data-2026-04-01.json | head -20`
Expected: Valid JSON with `summary`, `events`, `byArea`, `byImpact` fields.

- [ ] **Step 6: Clean up test data and commit**

```bash
rm -f tests/results/events.jsonl tests/results/morning-report-2026-04-01.md tests/results/dashboard-data-2026-04-01.json
git add tests/executors/morning-report-generator.sh
git commit -m "feat: add morning report generator (Markdown + Dashboard JSON)"
```

---

## Task 12: Supervisor Reflect — Morning Report Integration

**Files:**
- Modify: `.claude/agents/test-supervisor-runner.md`

- [ ] **Step 1: Read current test-supervisor-runner.md**

Read `.claude/agents/test-supervisor-runner.md` to locate Step 5 (Reflect).

- [ ] **Step 2: Add morning report generation to Reflect step**

In Step 5 (Reflect), before the status cleanup, add:

```markdown
### 5b. Morning Report Generation（晨报生成）

如果 `tests/results/events.jsonl` 存在且非空：

```bash
bash tests/executors/morning-report-generator.sh
```

成功后在摘要中包含：
- 晨报文件路径
- 需要关注的 P0-P1 问题数量
- 自动修复数量
- 竞争修复次数

如果 events.jsonl 不存在或为空，跳过晨报生成（可能是空跑）。
```

- [ ] **Step 3: Add events.jsonl reset at session start**

In Step 1 (Observe), at the beginning of the pre-flight checks, add:

```markdown
### 1.pre: Events 日志重置

每次 supervisor session 启动时，归档旧的 events.jsonl（如果存在）：

```bash
EVENTS_FILE="tests/results/events.jsonl"
if [[ -f "$EVENTS_FILE" && -s "$EVENTS_FILE" ]]; then
  ARCHIVE_DATE=$(date +%Y%m%d-%H%M%S)
  mv "$EVENTS_FILE" "tests/results/events-${ARCHIVE_DATE}.jsonl"
fi
```

确保本次 session 的事件日志是干净的。
```

- [ ] **Step 4: Verify supervisor-runner.md coherence**

Read the complete modified file and verify the new steps fit naturally into the existing 5-step flow.

- [ ] **Step 5: Commit**

```bash
git add .claude/agents/test-supervisor-runner.md
git commit -m "feat: integrate morning report into supervisor Reflect step"
```

---

## Task 13: Dashboard Test Results Page

**Files:**
- Create: `dashboard/src/pages/TestResultsPage.tsx` (or appropriate location following existing patterns)
- Modify: Dashboard router/navigation to add new page

> **Note:** This task requires reading the existing Dashboard codebase to follow established patterns (component structure, routing, styling, data fetching). The implementation below is a structural guide — adapt to match existing conventions.

- [ ] **Step 1: Explore Dashboard structure**

```bash
ls dashboard/src/pages/
ls dashboard/src/components/
cat dashboard/src/App.tsx | head -50
```

Understand routing pattern, component conventions, and state management approach.

- [ ] **Step 2: Create TestResultsPage component**

Create the page component following existing Dashboard patterns. Must include:

1. **Data loading**: Read `tests/results/dashboard-data-YYYY-MM-DD.json` (most recent file)
2. **Summary cards**: Duration, Cycles, Verified pass/fail, Bugs found/fixed, Needs human
3. **Events table**: Sortable/filterable by area, impact, type
4. **Filter controls**: Dropdowns for area, impact level, event type
5. **Detail expansion**: Click event row to see full detail

Follow `playbooks/guides/dashboard-design-system.md` for styling (dark/light theme, card styles).

- [ ] **Step 3: Add route and navigation entry**

Add the page to the router and sidebar navigation, following existing patterns.

- [ ] **Step 4: Add API endpoint for test results data**

Create endpoint that reads the most recent `dashboard-data-*.json` file:

```
GET /api/test-results → returns latest dashboard-data JSON
GET /api/test-results/:date → returns specific date's data
GET /api/test-results/dates → returns list of available report dates
```

- [ ] **Step 5: Verify page renders with sample data**

Place a sample `dashboard-data-2026-04-01.json` in `tests/results/` and verify the page loads and displays correctly.

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/pages/TestResultsPage.tsx dashboard/src/...
git commit -m "feat: add Test Results dashboard page for morning report visualization"
```

---

## Execution Order & Dependencies

```
Task 1 (classification rules) ──┐
Task 2 (event-writer.sh) ───────┤── Foundation (no dependencies)
Task 3 (queue-sorter.sh) ───────┘
         │
         ▼
Task 4 (SCAN + impact) ─── depends on Task 1
Task 5 (state-update sort) ── depends on Task 3
Task 6 (pipeline config) ──── depends on Task 4
         │
         ▼
Task 7 (FIX competitive) ── depends on Task 2 (event-writer)
         │
         ▼
Task 8 (common rules) ──── depends on Task 2
Task 9 (TEST events) ───── depends on Task 8
Task 10 (VERIFY events) ── depends on Task 8
         │
         ▼
Task 11 (report generator) ── depends on Task 2
Task 12 (supervisor reflect) ── depends on Task 11
         │
         ▼
Task 13 (Dashboard page) ── depends on Task 11 (needs dashboard-data JSON format)
```

Tasks 1-3 can run in parallel. Tasks 4-6 can run in parallel. Tasks 8-10 can run in parallel.
