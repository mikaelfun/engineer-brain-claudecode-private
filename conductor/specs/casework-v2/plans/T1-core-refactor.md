# T1: Casework V2 核心重构 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 casework 从 8+ 执行路径的 602 行 SKILL.md 重构为 4 步统一模型（data-refresh → assess → act → summarize），消除 changegate/fast-path/AR 分支散布，独立 AR 路径，subskill 化四步。

**Architecture:** 纯脚本化 Step 1（全并行数据源 + delta 内联报告），LLM 只负责 Step 2/4。每个子步骤拆成独立 subskill（可单独被 WebUI 调用）。AR 独立为 `casework-ar/`。

**Tech Stack:** Bash + PowerShell + Node.js + Python3；Claude Code SKILL.md；现有 fetch-*.ps1 / icm-discussion-ab.js / onenote-search-inline.py 原样复用。

**Scope（本 plan 不含）：**
- ❌ T2: patrol SKILL.md + pipeline-state.json 协议（依赖 T1 的 events/ schema）
- ❌ T3: Dashboard 前后端适配（依赖 T2 的 pipeline-state schema）

**前置 TODO（Spike 验证，Task 1 开始前必须定板）：**
- [ ] TODO-1: 从样本 case-info.md 提取 compliance hash 字段列表（Entitlement name / SAP code / Support Plan 具体 key 名）
- [ ] TODO-2: 定义 data-refresh.sh 汇总器如何判断 L1/L2/L3 失败（方案：每个子脚本退出前写 `events/<task>.json` 带 `status: OK|FAILED|SKIP`；汇总器扫事件文件 + L1 任一 FAILED → overall FAILED）
- [ ] TODO-3: 确认 `.casework/events/` 目录的 gitignore 规则（应该 ignore，与 `.casework/` 整体一致）

---

## File Structure

### 新建文件

| 路径 | 职责 |
|------|------|
| `src/.claude/skills/casework/scripts/data-refresh.sh` | 统一数据源调度器（bg 并行 + 事件汇总 + L1/L2/L3 判定） |
| `src/.claude/skills/casework/scripts/write-event.sh` | 原子事件写入 helper（tmp + mv），被所有 Step 1 子脚本 source |
| `src/.claude/skills/casework/data-refresh/SKILL.md` | 子 skill：Step 1，WebUI alias `data-refresh` |
| `src/.claude/skills/casework/assess/SKILL.md` | 子 skill：Step 2，含 compliance gate + actualStatus 判断 |
| `src/.claude/skills/casework/act/SKILL.md` | 子 skill：Step 3，路由表 + spawn 模板 |
| `src/.claude/skills/casework/summarize/SKILL.md` | 子 skill：Step 4，case-summary 增量 + generate-todo |
| `src/.claude/skills/casework-ar/SKILL.md` | AR 专用四步编排 |
| `src/.claude/skills/casework-ar/assess-ar/SKILL.md` | AR 状态判断 |
| `src/.claude/skills/casework-ar/act-ar/SKILL.md` | AR 路由表 |
| `src/scripts/tests/data-refresh.bats` | bats 测试（可选，取决于 T1 测试装备） |

### 修改文件

| 路径 | 改动 |
|------|------|
| `src/.claude/skills/casework/SKILL.md` | 重写为 < 200 行的四步编排主 skill，支持 mode=full / mode=patrol |
| `src/.claude/skills/casework/scripts/teams-search-inline.sh` | 加 events/ 写入（progress + 完成事件） |
| 所有引用 `casehealth-meta.json` 的文件 | 批量改为 `casework-meta.json`（见 Task 1） |
| `src/.claude/skills/casework/scripts/casework-gather.sh` | **替换**为 data-refresh.sh 后删除（保留 .bak） |

### 备份后删除（Task 14 统一处置）

- `check-case-changes.ps1`, `casework-fast-path.sh`, `agent-cache-check.sh`
- `casework-light-runner.sh`, `casework-gather.sh`, `extract-delta.sh`
- `icm-discussion-daemon.js`, `icm-discussion-warm.sh`, `icm-queue-submit.sh`
- `.claude/skills/status-judge/`, `compliance-check/`, `inspection-writer/`, `data-refresh/`（旧的）
- `.claude/agents/casework-light.md`, `teams-search-queue.md`
- `.claude/skills/teams-search-queue/`

---

## Task 0: Spike 验证 (前置)

**Files:**
- Read: `src/cases/active/*/case-info.md` (3 个样本)
- Read: `src/.claude/skills/casework/scripts/casework-gather.sh` (理解现状)
- Create: `src/conductor/specs/casework-v2/plans/spike-notes.md`

- [ ] **Step 0.1: 取 3 个样本 case-info.md 提取 Entitlement/SAP 字段**

```bash
ls src/cases/active/ | head -3 | while read c; do
  echo "=== $c ==="
  grep -E "^\*\*(Entitlement|SAP|Support Plan)" "src/cases/active/$c/case-info.md" || echo "  (fields absent)"
done
```

Expected: 输出 3 个 case 的字段名。记录**精确的字段名和格式**。

- [ ] **Step 0.2: 记录 compliance hash 字段到 spike-notes.md**

写入 `spike-notes.md`：
```markdown
# Compliance Hash Fields
- field1: "Entitlement: ..."
- field2: "SAP Code: ..."
- field3: "Support Plan: ..."
sha256 input: f"{entitlement}|{sapCode}|{supportPlan}"
```

- [ ] **Step 0.3: 验证 write-event 原子写方案**

写一个 5 行 bash 测试脚本，并发写同一目录 100 次，确认 file-watcher 读不到半写：
```bash
mkdir -p /tmp/event-test
for i in $(seq 1 100); do
  (echo "{\"n\": $i}" > /tmp/event-test/e.json.tmp && mv /tmp/event-test/e.json.tmp /tmp/event-test/e.json) &
done
wait
python3 -c "import json; print(json.load(open('/tmp/event-test/e.json')))"
```

Expected: 最终文件 JSON 合法（不会报解析错误）。

- [ ] **Step 0.4: Commit spike notes**

```bash
git add src/conductor/specs/casework-v2/plans/spike-notes.md
git commit -m "spike: validate casework-v2 T1 assumptions (compliance hash fields, atomic event writes)"
```

---

## Task 1: Meta 文件重命名（最小风险，先做）

**Files:**
- Modify: 所有 case 目录的 `casehealth-meta.json` → `casework-meta.json`
- Modify: 所有引用 `casehealth-meta.json` 的脚本/SKILL.md（全局搜索）

- [ ] **Step 1.1: 备份 + 列出所有引用**

```bash
cd src
grep -rln "casehealth-meta" --include="*.sh" --include="*.ps1" --include="*.py" --include="*.md" --include="*.ts" --include="*.js" . > /tmp/casehealth-refs.txt
cat /tmp/casehealth-refs.txt | wc -l
```

Expected: 打印引用数（预计 20-40 处），保留到 spike-notes.md。

- [ ] **Step 1.2: 批量重命名 case 目录中的文件**

```bash
cd src
for d in cases/active/*/ cases/archived/*/; do
  [ -f "$d/casehealth-meta.json" ] && mv "$d/casehealth-meta.json" "$d/casework-meta.json"
done
find cases/active cases/archived -name "casehealth-meta.json" 2>/dev/null | wc -l
```

Expected: 最后一行输出 `0`。

- [ ] **Step 1.3: 全局替换代码引用（干跑 → 确认 → 执行）**

干跑：
```bash
cd src
cat /tmp/casehealth-refs.txt | xargs grep -n "casehealth-meta" | head -30
```

执行（逐个确认每类文件后）：
```bash
cd src
cat /tmp/casehealth-refs.txt | xargs sed -i 's/casehealth-meta/casework-meta/g'
grep -rln "casehealth-meta" . 2>/dev/null | head
```

Expected: 最后一条 grep 无输出。

- [ ] **Step 1.4: 冒烟测试 data-refresh**

挑一个 active case 跑现有 casework-light-runner.sh，确认不因改名报错：
```bash
cd src
CASE=$(ls cases/active/ | head -1)
bash .claude/skills/casework/scripts/casework-light-runner.sh --case-number "$CASE" --case-dir "cases/active/$CASE" 2>&1 | tail -30
```

Expected: 无 `casehealth-meta` 相关 FileNotFound 报错。

- [ ] **Step 1.5: Commit**

```bash
cd src
git add -A cases/active cases/archived .claude skills playbooks scripts dashboard
git commit -m "refactor(casework-v2/T1): rename casehealth-meta.json to casework-meta.json

- Rename file in all active/archived case dirs
- Update all code references (shell, ps1, python, md, ts, js)
- Ref: PRD §6.1 step 0"
```

---

## Task 2: write-event.sh 原子事件写入 helper

**Files:**
- Create: `src/.claude/skills/casework/scripts/write-event.sh`
- Test: `src/scripts/tests/write-event-test.sh`

- [ ] **Step 2.1: 写测试（先失败）**

Create `src/scripts/tests/write-event-test.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
SCRIPT="$(dirname "$0")/../../../.claude/skills/casework/scripts/write-event.sh"

TMPDIR=$(mktemp -d); trap "rm -rf $TMPDIR" EXIT

# Test 1: 基础写入
bash "$SCRIPT" "$TMPDIR/e.json" '{"task":"d365","status":"active"}'
python3 -c "import json; assert json.load(open('$TMPDIR/e.json'))['status']=='active'"
echo "PASS: basic write"

# Test 2: tmp 文件被清理
[ ! -f "$TMPDIR/e.json.tmp" ] && echo "PASS: tmp cleaned"

# Test 3: 并发写不坏文件
for i in $(seq 1 50); do
  bash "$SCRIPT" "$TMPDIR/c.json" "{\"n\":$i}" &
done
wait
python3 -c "import json; json.load(open('$TMPDIR/c.json'))"
echo "PASS: concurrent write survives"
```

- [ ] **Step 2.2: 运行测试验证失败**

```bash
bash src/scripts/tests/write-event-test.sh
```

Expected: FAIL（脚本不存在）。

- [ ] **Step 2.3: 实现 write-event.sh**

Create `src/.claude/skills/casework/scripts/write-event.sh`:
```bash
#!/usr/bin/env bash
# Atomic event writer for .casework/events/*.json
# Usage: write-event.sh <file> <json-content>
set -euo pipefail

FILE="${1:?file required}"
CONTENT="${2:?content required}"

mkdir -p "$(dirname "$FILE")"
TMP="${FILE}.tmp.$$"
echo "$CONTENT" > "$TMP"
mv "$TMP" "$FILE"
```

- [ ] **Step 2.4: 运行测试验证通过**

```bash
chmod +x src/.claude/skills/casework/scripts/write-event.sh src/scripts/tests/write-event-test.sh
bash src/scripts/tests/write-event-test.sh
```

Expected: 全部 PASS。

- [ ] **Step 2.5: Commit**

```bash
cd src
git add .claude/skills/casework/scripts/write-event.sh scripts/tests/write-event-test.sh
git commit -m "feat(casework-v2/T1): add write-event.sh atomic event writer

Implements tmp+mv pattern for .casework/events/*.json writes.
Prevents file-watcher from reading half-written JSON during concurrent writes."
```

---

## Task 3: Step 1 子脚本 events/ 改造 — teams-search-inline.sh

**Files:**
- Modify: `src/.claude/skills/casework/scripts/teams-search-inline.sh`

- [ ] **Step 3.1: 在脚本头加 EVENT_DIR 环境变量**

```bash
# 在 set -euo pipefail 后加
EVENT_DIR="${CASE_DIR:?}/.casework/events"
mkdir -p "$EVENT_DIR"
WRITE_EVENT="$PROJECT_ROOT/.claude/skills/casework/scripts/write-event.sh"
```

- [ ] **Step 3.2: 启动时写 active 事件**

```bash
START_TS=$(date -u +%FT%TZ)
bash "$WRITE_EVENT" "$EVENT_DIR/teams.json" \
  "{\"task\":\"teams\",\"status\":\"active\",\"startedAt\":\"$START_TS\"}"
```

- [ ] **Step 3.3: ThreadPoolExecutor 回调写 progress**

找到现有 concurrent.futures 块（Python）。每个 chat 完成后：
```python
with open(f"{EVENT_DIR}/teams.json.tmp", "w") as f:
    json.dump({"task":"teams","status":"active","startedAt":START_TS,
               "progress":{"done":done_count,"total":total}}, f)
os.replace(f"{EVENT_DIR}/teams.json.tmp", f"{EVENT_DIR}/teams.json")
```

- [ ] **Step 3.4: 收尾写 completed 或 failed 事件**

```bash
END_TS=$(date -u +%FT%TZ)
DURATION_MS=$(( ($(date +%s%N) - START_NS) / 1000000 ))
if [ "$TEAMS_EXIT" = "0" ]; then
  bash "$WRITE_EVENT" "$EVENT_DIR/teams.json" \
    "{\"task\":\"teams\",\"status\":\"completed\",\"startedAt\":\"$START_TS\",\"completedAt\":\"$END_TS\",\"durationMs\":$DURATION_MS,\"delta\":{\"newMessages\":$NEW_MSGS,\"newChats\":$NEW_CHATS}}"
else
  bash "$WRITE_EVENT" "$EVENT_DIR/teams.json" \
    "{\"task\":\"teams\",\"status\":\"failed\",\"startedAt\":\"$START_TS\",\"durationMs\":$DURATION_MS,\"error\":\"$ERR_MSG\"}"
fi
```

- [ ] **Step 3.5: 手动冒烟测试**

```bash
cd src
CASE=$(ls cases/active/ | head -1)
CASE_DIR="cases/active/$CASE"
rm -rf "$CASE_DIR/.casework"; mkdir -p "$CASE_DIR/.casework/events"
bash .claude/skills/casework/scripts/teams-search-inline.sh \
  --case-number "$CASE" --case-dir "$CASE_DIR" --project-root .
cat "$CASE_DIR/.casework/events/teams.json"
```

Expected: 输出 JSON，status=completed，含 durationMs 和 delta。

- [ ] **Step 3.6: Commit**

```bash
cd src
git add .claude/skills/casework/scripts/teams-search-inline.sh
git commit -m "feat(casework-v2/T1): teams-search-inline emits events/teams.json

- Writes active/progress/completed/failed events atomically
- Progress updated per chat completion via ThreadPoolExecutor callback
- Part of Step 1 observability refactor (PRD §4.4)"
```

---

## Task 4: Step 1 子脚本 events/ 改造 — 其余 5 个数据源

> 重复 Task 3 的模式，应用到：d365, icm, onenote, labor, attachments。对于不支持 progress 的脚本，只写 active → completed/failed 两个事件。

**Files:**
- Modify: `fetch-all-data.ps1` (wrapper bash) → events/d365.json
- Modify: `icm-discussion-ab.js` 调用点 → events/icm.json
- Modify: `onenote-search-inline.py` 调用点 → events/onenote.json
- Modify: `view-labor.ps1` 调用点 → events/labor.json
- Modify: `download-attachments.ps1` 调用点 → events/attachments.json

**注**：PowerShell / Node.js / Python 都不改本体，而是在 data-refresh.sh 中用 bash wrapper 包裹它们并写事件。保持原 ps1/js/py 脚本的接口不变。

- [ ] **Step 4.1: 设计 bash wrapper 模式**

Create `src/.claude/skills/casework/scripts/event-wrapper.sh`:
```bash
#!/usr/bin/env bash
# Generic wrapper that emits active/completed/failed events around a command.
# Usage: event-wrapper.sh <task-name> <event-dir> -- <command> [args...]
set -euo pipefail

TASK="${1:?task required}"; shift
EVENT_DIR="${1:?event-dir required}"; shift
[ "$1" = "--" ] && shift
WRITE_EVENT="$(dirname "$0")/write-event.sh"

START_TS=$(date -u +%FT%TZ)
START_NS=$(date +%s%N)
bash "$WRITE_EVENT" "$EVENT_DIR/$TASK.json" \
  "{\"task\":\"$TASK\",\"status\":\"active\",\"startedAt\":\"$START_TS\"}"

set +e
"$@"
EXIT=$?
set -e

END_TS=$(date -u +%FT%TZ)
DUR_MS=$(( ($(date +%s%N) - START_NS) / 1000000 ))

if [ $EXIT -eq 0 ]; then
  bash "$WRITE_EVENT" "$EVENT_DIR/$TASK.json" \
    "{\"task\":\"$TASK\",\"status\":\"completed\",\"startedAt\":\"$START_TS\",\"completedAt\":\"$END_TS\",\"durationMs\":$DUR_MS}"
else
  bash "$WRITE_EVENT" "$EVENT_DIR/$TASK.json" \
    "{\"task\":\"$TASK\",\"status\":\"failed\",\"startedAt\":\"$START_TS\",\"durationMs\":$DUR_MS,\"error\":\"exit $EXIT\"}"
fi
exit $EXIT
```

- [ ] **Step 4.2: 测试 wrapper**

```bash
chmod +x src/.claude/skills/casework/scripts/event-wrapper.sh
TMPDIR=$(mktemp -d)
bash src/.claude/skills/casework/scripts/event-wrapper.sh test "$TMPDIR" -- sleep 0.1
cat "$TMPDIR/test.json"
# Expect: status=completed, durationMs > 0
bash src/.claude/skills/casework/scripts/event-wrapper.sh fail "$TMPDIR" -- false || true
cat "$TMPDIR/fail.json"
# Expect: status=failed
```

Expected: completed + failed 事件按预期。

- [ ] **Step 4.3: 特殊：支持 progress 的 attachments 改造**

`download-attachments.ps1` 每完成一个文件，原子写一次 progress 事件。在 ps1 中加：
```powershell
# TODO: 在循环中每个文件 downloaded 后
$event = @{task="attachments";status="active";startedAt=$startTs;progress=@{done=$done;total=$total}} | ConvertTo-Json -Compress
$tmp = "$EventDir/attachments.json.tmp"; $final = "$EventDir/attachments.json"
Set-Content -Path $tmp -Value $event -NoNewline
Move-Item -Path $tmp -Destination $final -Force
```

- [ ] **Step 4.4: Commit wrapper + 每个子脚本改造**

五个子任务每个独立 commit（便于回滚）：
```bash
git add .claude/skills/casework/scripts/event-wrapper.sh
git commit -m "feat(casework-v2/T1): add event-wrapper.sh generic event emitter"

# 分别提交每个数据源的改造
git commit -m "feat(casework-v2/T1): emit events/d365.json via event-wrapper"
# ... 同理 icm / onenote / labor / attachments
```

---

## Task 5: data-refresh.sh 调度器 + L1/L2/L3 判定

**Files:**
- Create: `src/.claude/skills/casework/scripts/data-refresh.sh`
- Test: `src/scripts/tests/data-refresh-test.sh`

- [ ] **Step 5.1: 写测试骨架（happy path + L1 失败）**

Create `src/scripts/tests/data-refresh-test.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
# Pick a known case, run data-refresh, assert output schema.
CASE="${TEST_CASE:-$(ls src/cases/active/ | head -1)}"
cd src
rm -rf "cases/active/$CASE/.casework"
bash .claude/skills/casework/scripts/data-refresh.sh \
  --case-number "$CASE" \
  --case-dir "cases/active/$CASE" \
  --project-root . \
  --cases-root ./cases \
  --is-ar false

OUT="cases/active/$CASE/.casework/data-refresh-output.json"
[ -f "$OUT" ] || { echo "FAIL: output missing"; exit 1; }
python3 -c "
import json
d = json.load(open('$OUT'))
assert 'refreshResults' in d, 'missing refreshResults'
assert 'overallStatus' in d, 'missing overallStatus'
assert d['overallStatus'] in ('OK','DEGRADED','FAILED')
print('PASS: schema valid')
"
```

- [ ] **Step 5.2: 运行测试验证失败**

```bash
bash src/scripts/tests/data-refresh-test.sh
```

Expected: FAIL（脚本不存在）。

- [ ] **Step 5.3: 实现 data-refresh.sh 骨架**

Create `src/.claude/skills/casework/scripts/data-refresh.sh`:
```bash
#!/usr/bin/env bash
# Unified data refresh scheduler for casework-v2 Step 1.
# Spawns 6 data sources in parallel via event-wrapper, aggregates results.
set -euo pipefail

# --- 参数解析 ---
CASE_NUMBER=""; CASE_DIR=""; PROJECT_ROOT=""; CASES_ROOT=""; IS_AR="false"
while [ $# -gt 0 ]; do
  case "$1" in
    --case-number) CASE_NUMBER="$2"; shift 2;;
    --case-dir) CASE_DIR="$2"; shift 2;;
    --project-root) PROJECT_ROOT="$2"; shift 2;;
    --cases-root) CASES_ROOT="$2"; shift 2;;
    --is-ar) IS_AR="$2"; shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 2;;
  esac
done
: "${CASE_NUMBER:?}" "${CASE_DIR:?}" "${PROJECT_ROOT:?}"

EVENT_DIR="$CASE_DIR/.casework/events"
WRAP="$PROJECT_ROOT/.claude/skills/casework/scripts/event-wrapper.sh"
mkdir -p "$EVENT_DIR"

# --- 并行启动 6 个数据源 ---
bash "$WRAP" d365 "$EVENT_DIR" -- pwsh -NoProfile -File "$PROJECT_ROOT/skills/d365-case-ops/scripts/fetch-all-data.ps1" -CaseNumber "$CASE_NUMBER" -CaseDir "$CASE_DIR" &
PID_D365=$!
bash "$WRAP" labor "$EVENT_DIR" -- pwsh -NoProfile -File "$PROJECT_ROOT/skills/d365-case-ops/scripts/view-labor.ps1" -CaseNumber "$CASE_NUMBER" -CaseDir "$CASE_DIR" &
PID_LABOR=$!
bash "$WRAP" teams "$EVENT_DIR" -- bash "$PROJECT_ROOT/.claude/skills/casework/scripts/teams-search-inline.sh" --case-number "$CASE_NUMBER" --case-dir "$CASE_DIR" --project-root "$PROJECT_ROOT" &
PID_TEAMS=$!
bash "$WRAP" onenote "$EVENT_DIR" -- python3 "$PROJECT_ROOT/.claude/skills/onenote-search/scripts/onenote-search-inline.py" --case-number "$CASE_NUMBER" --case-dir "$CASE_DIR" &
PID_ON=$!
ICM_ID=$(python3 -c "import json; d=json.load(open('$CASE_DIR/casework-meta.json')) if __import__('os').path.exists('$CASE_DIR/casework-meta.json') else {}; print(d.get('icmId',''))" 2>/dev/null || echo "")
if [ -n "$ICM_ID" ]; then
  bash "$WRAP" icm "$EVENT_DIR" -- node "$PROJECT_ROOT/.claude/skills/icm-discussion/scripts/icm-discussion-ab.js" --single "$ICM_ID" --case-dir "$CASE_DIR" &
  PID_ICM=$!
else
  bash "$WRAP" icm "$EVENT_DIR" -- bash -c "echo 'no icm'; true" &
  PID_ICM=$!
fi
bash "$WRAP" attachments "$EVENT_DIR" -- pwsh -NoProfile -File "$PROJECT_ROOT/skills/d365-case-ops/scripts/download-attachments.ps1" -CaseNumber "$CASE_NUMBER" -CaseDir "$CASE_DIR" &
PID_ATT=$!

# --- wait + 忽略单个失败（L1/L2/L3 判定在下一步）---
set +e
wait $PID_D365; wait $PID_LABOR; wait $PID_TEAMS; wait $PID_ON; wait $PID_ICM; wait $PID_ATT
set -e

# --- 汇总 events/*.json → refreshResults ---
python3 - <<PYEOF
import json, os, hashlib
event_dir = "$EVENT_DIR"
case_dir = "$CASE_DIR"
L1 = ["d365"]; L2 = ["teams","icm"]; L3 = ["onenote","labor","attachments"]

results = {}
for t in L1+L2+L3:
  p = f"{event_dir}/{t}.json"
  if os.path.exists(p):
    results[t] = json.load(open(p))
  else:
    results[t] = {"task": t, "status": "FAILED", "error": "no event file"}

def to_status(ev):
  s = ev.get("status","")
  return {"completed":"OK","failed":"FAILED","skipped":"SKIP"}.get(s, s.upper() or "FAILED")

summary = {k: {"status": to_status(v), **({"error": v["error"]} if "error" in v else {})} for k,v in results.items()}

# L1/L2/L3 判定
l1_failed = any(summary[t]["status"]=="FAILED" for t in L1)
l2_failed = any(summary[t]["status"]=="FAILED" for t in L2)

if l1_failed:
  overall = "FAILED"
elif l2_failed:
  overall = "DEGRADED"
else:
  overall = "OK"

out = {
  "caseNumber": "$CASE_NUMBER",
  "caseDir": "$CASE_DIR",
  "isAR": "$IS_AR" == "true",
  "refreshResults": summary,
  "overallStatus": overall,
  "degradedSources": [t for t in L2 if summary[t]["status"]=="FAILED"],
  "failedSources": [t for t in L1 if summary[t]["status"]=="FAILED"],
}

if overall == "FAILED":
  print(json.dumps({"error":"L1 source failed","overallStatus":"FAILED","failed":out["failedSources"]}), file=__import__('sys').stderr)
  __import__('sys').exit(1)

os.makedirs(f"{case_dir}/.casework", exist_ok=True)
with open(f"{case_dir}/.casework/data-refresh-output.json.tmp","w") as f:
  json.dump(out, f, indent=2)
os.replace(f"{case_dir}/.casework/data-refresh-output.json.tmp", f"{case_dir}/.casework/data-refresh-output.json")
print(f"OK overall={overall}")
PYEOF
```

> **TODO-4**（deferred to Task 6）：delta 汇总与 deltaStatus=DELTA_OK/DELTA_EMPTY/DELTA_FIRST_RUN 的内联扫描逻辑。Task 5 先保证 refreshResults 正确，Task 6 加 delta 摘要。

- [ ] **Step 5.4: 运行测试验证通过**

```bash
chmod +x src/.claude/skills/casework/scripts/data-refresh.sh
bash src/scripts/tests/data-refresh-test.sh
```

Expected: PASS: schema valid。

- [ ] **Step 5.5: Commit**

```bash
cd src
git add .claude/skills/casework/scripts/data-refresh.sh scripts/tests/data-refresh-test.sh
git commit -m "feat(casework-v2/T1): add data-refresh.sh orchestrator

- Spawns 6 data sources in parallel via event-wrapper
- Aggregates events/*.json → data-refresh-output.json
- Implements L1/L2/L3 failure tiering (PRD §2.2)
- L1 failure → exit 1, no output
- L2 failure → overallStatus=DEGRADED
- L3 failure → skipped, overallStatus=OK"
```

---

## Task 6: delta 摘要汇总进入 data-refresh.sh

**Files:**
- Modify: `src/.claude/skills/casework/scripts/data-refresh.sh`

- [ ] **Step 6.1: 读取各源 event 的 delta 字段汇总**

在 Task 5 的 python 汇总块中，增加：
```python
delta_bits = []
new_email_count = 0
for t, ev in results.items():
  d = ev.get("delta")
  if d:
    if "newEmails" in d: new_email_count += d["newEmails"]; delta_bits.append(f"新邮件 {d['newEmails']} 封")
    if "newMessages" in d: delta_bits.append(f"Teams +{d['newMessages']} 条消息")
    if "newEntries" in d: delta_bits.append(f"ICM +{d['newEntries']} 条 discussion")

has_any = bool(delta_bits)
first_run = not os.path.exists(f"{case_dir}/casework-meta.json")
out["deltaStatus"] = "DELTA_FIRST_RUN" if first_run else ("DELTA_OK" if has_any else "DELTA_EMPTY")
out["deltaSummary"] = "；".join(delta_bits) if delta_bits else "（无新数据）"
```

- [ ] **Step 6.2: 扩展测试覆盖 deltaStatus**

```bash
# 追加到 data-refresh-test.sh
python3 -c "
import json
d = json.load(open('$OUT'))
assert 'deltaStatus' in d and d['deltaStatus'] in ('DELTA_OK','DELTA_EMPTY','DELTA_FIRST_RUN')
print(f'PASS: deltaStatus={d[\"deltaStatus\"]}')
"
```

- [ ] **Step 6.3: 跑测试 + Commit**

```bash
bash src/scripts/tests/data-refresh-test.sh
cd src && git add -A && git commit -m "feat(casework-v2/T1): aggregate per-source deltas into deltaStatus

- Reads delta field from each events/*.json
- Computes DELTA_OK/DELTA_EMPTY/DELTA_FIRST_RUN
- Generates Chinese deltaSummary string
- PRD §2.2 DELTA semantics"
```

---

## Task 7: casework/data-refresh/SKILL.md 子 skill

**Files:**
- Create: `src/.claude/skills/casework/data-refresh/SKILL.md`

- [ ] **Step 7.1: 写 SKILL.md 框架**

Create:
```markdown
---
name: casework:data-refresh
description: Casework V2 Step 1 — 并行收集 6 个数据源，输出 data-refresh-output.json
allowed-tools: Bash
argument-hint: "<caseNumber>"
---

# Casework Step 1: Data Refresh

收集 Case 最新数据（D365 / Teams / ICM / OneNote / Labor / Attachments），输出 `.casework/data-refresh-output.json` 供 Step 2 Assess 使用。

## 输入
- `$1` = caseNumber（必须）
- 环境变量 `CASE_DIR`（默认从 `casesRoot` 配置推断）

## 执行

调用统一调度脚本：
\`\`\`bash
bash .claude/skills/casework/scripts/data-refresh.sh \
  --case-number "$1" \
  --case-dir "./cases/active/$1" \
  --project-root . \
  --cases-root ./cases \
  --is-ar false
\`\`\`

## 输出
`.casework/data-refresh-output.json`：
\`\`\`json
{
  "overallStatus": "OK|DEGRADED|FAILED",
  "deltaStatus": "DELTA_OK|DELTA_EMPTY|DELTA_FIRST_RUN",
  "deltaSummary": "新邮件 3 封；Teams +12 条消息",
  "refreshResults": { ... },
  ...
}
\`\`\`

## L1/L2/L3 失败处理（PRD §2.2）
- L1 失败（D365） → 脚本 exit 1，无输出，Step 2 不执行
- L2 失败（Teams / ICM） → overallStatus=DEGRADED，Step 2 正常执行但 prompt 中标注数据不完整
- L3 失败（OneNote / Labor / Attachments） → overallStatus=OK，忽略

## 数据源增量机制
详见 PRD §2.2 表格。每个源脚本自带增量，Step 1 不做外层 changegate。
```

- [ ] **Step 7.2: Commit**

```bash
cd src && git add .claude/skills/casework/data-refresh/SKILL.md
git commit -m "feat(casework-v2/T1): add casework:data-refresh subskill"
```

---

## Task 8: casework/assess/SKILL.md 子 skill（含 compliance gate）

**Files:**
- Create: `src/.claude/skills/casework/assess/SKILL.md`

- [ ] **Step 8.1: 从旧 skills 提取素材**

```bash
cd src
cat .claude/skills/status-judge/SKILL.md > /tmp/status-judge.md
cat .claude/skills/compliance-check/SKILL.md > /tmp/compliance.md
```

- [ ] **Step 8.2: 写 assess/SKILL.md（含 hash 字段，来自 Task 0.2）**

关键要点（骨架）：
```markdown
---
name: casework:assess
description: Casework V2 Step 2 — LLM 判断 actualStatus + 生成 execution-plan.json
allowed-tools: Read, Write, Bash
argument-hint: "<caseNumber>"
---

# Casework Step 2: Assess

## 0. 前置检查
读 `.casework/data-refresh-output.json`：
- 文件不存在 → "Step 1 未完成，请先 /casework:data-refresh"
- `overallStatus=FAILED` → 退出，不做推理
- `deltaStatus=DELTA_EMPTY` → **快速路径**：写 execution-plan.json `{"actions":[], "noActionReason":"DELTA_EMPTY"}`，actualStatus 从 casework-meta.json 复用（PRD §2.2），退出

## 1. Compliance Gate（源字段 hash 缓存）
计算当前 case-info.md 的 compliance hash：
\`\`\`python
# TODO-1 的字段列表（从 spike-notes.md 读）
fields = [entitlement_name, sap_code, support_plan]
current_hash = sha256("|".join(fields).encode()).hexdigest()[:8]
\`\`\`
对比 `casework-meta.json.compliance.sourceHash`：
- hash 匹配 → 复用 `entitlementOk` 结果
- hash 不匹配 → LLM 推理 entitlement，写回新 hash
- `entitlementOk=false` → 终止（阻断 Step 3）

## 2. actualStatus 判断
基于 `deltaSummary` + `caseInfoHead` + `emailsTail` 推理。枚举值：pending-engineer / pending-customer / pending-pg / researching / ready-to-close / resolved / closed。

判断原则（从 status-judge/SKILL.md 提取）：
- 最新邮件来自客户且未回 → pending-engineer
- 最新邮件工程师发出 → pending-customer（若有明确问题）或 researching
- PG engaged 且最后消息来自 PG → pending-pg
- ... (详细规则 TODO：从 status-judge.md 摘取核心规则，不复制整段)

## 3. recommendedActions
基于 actualStatus → 路由表：
| actualStatus | actions |
|---|---|
| pending-engineer | troubleshooter + email-drafter(reply-customer) |
| pending-customer | email-drafter(follow-up)（若 daysSinceLastContact > 3） |
| researching | troubleshooter |
| ... | ... |

## 4. 输出
更新 `casework-meta.json`：
- actualStatus / daysSinceLastContact / compliance.sourceHash / recommendedActions

写 `.casework/execution-plan.json`（schema 见 PRD §4.3）。
```

- [ ] **Step 8.3: Commit**

```bash
cd src && git add .claude/skills/casework/assess/SKILL.md
git commit -m "feat(casework-v2/T1): add casework:assess subskill

- Consolidates status-judge + compliance-check logic
- Hash-based compliance cache (PRD §2.5)
- DELTA_EMPTY fast path skips LLM
- Writes execution-plan.json"
```

---

## Task 9: casework/act/SKILL.md 子 skill

**Files:**
- Create: `src/.claude/skills/casework/act/SKILL.md`

- [ ] **Step 9.1: 写 act/SKILL.md**

```markdown
---
name: casework:act
description: Casework V2 Step 3 — 按 execution-plan.json spawn agent
allowed-tools: Task, Read
argument-hint: "<caseNumber>"
---

# Casework Step 3: Act

**mode=full only**——patrol 模式下 Step 3 由 patrol 主 session 编排，此 skill 不被调用。

## 0. 前置
读 `.casework/execution-plan.json`：
- `actions: []` → 退出（无事可做）
- `noActionReason=DELTA_EMPTY` → 退出

## 1. 按 priority 顺序 spawn agent

对每个 action：
- `type=troubleshooter` → Task tool spawn `troubleshooter` subagent，传入 caseNumber + caseDir + 当前 emails tail
- `type=email-drafter` → Task tool spawn `email-drafter` subagent，传入 emailType (`reply-customer` / `follow-up` / `status-update`)

## 2. dependsOn 处理
如果 action 有 `dependsOn: "troubleshooter"`，先等前置 agent 完成再 spawn。

## 3. Challenge 不自动触发
Challenge 改为手动命令 `/challenge {caseNumber}`（PRD §6.1 step 7）。

## 4. 输出
Spawn 的 agent 各自写入：
- `analysis/*.md` （troubleshooter）
- `drafts/*.md` （email-drafter）
- `claims.json`
```

- [ ] **Step 9.2: Commit**

---

## Task 10: casework/summarize/SKILL.md 子 skill

**Files:**
- Create: `src/.claude/skills/casework/summarize/SKILL.md`

- [ ] **Step 10.1: 写 summarize/SKILL.md**

从 inspection-writer/SKILL.md 提取增量 case-summary 规则。关键点：
- 首次生成 vs 增量追加
- 调 `generate-todo.sh`（含 note-gap + labor 检查）
- 更新 casework-meta.json `lastInspected`
- 写 timing.json

骨架（略，按 Task 7/8 同款 frontmatter + 分节）。

- [ ] **Step 10.2: Commit**

---

## Task 11: 重写 casework/SKILL.md 主编排（< 200 行）

**Files:**
- Modify: `src/.claude/skills/casework/SKILL.md` (602 → <200 行)

- [ ] **Step 11.1: 备份旧版**

```bash
cp src/.claude/skills/casework/SKILL.md src/.claude/skills/casework/SKILL.md.v1.bak
```

- [ ] **Step 11.2: 写新版骨架**

内容：
- YAML frontmatter（name: casework, allowed-tools: Task, Read, Write, Bash）
- 参数：`$1` = caseNumber，`$2` = mode (full|patrol)（默认 full）
- 四步顺序调用对应 subskill：
  - Step 1: `/casework:data-refresh $1`
  - Step 2: `/casework:assess $1`
  - Step 3: if mode=full → `/casework:act $1`；if mode=patrol → 退出（patrol 接管）
  - Step 4: if mode=full → `/casework:summarize $1`；if mode=patrol → 退出
- 错误处理：Step 1 FAILED → 终止；Step 2 entitlementOk=false → 终止

- [ ] **Step 11.3: 验证行数**

```bash
wc -l src/.claude/skills/casework/SKILL.md
```

Expected: < 200。

- [ ] **Step 11.4: 冒烟测试（完整 flow）**

```bash
cd src
CASE=$(ls cases/active/ | head -1)
# 模拟 claude code 调用：
# /casework $CASE full
# 或直接 bash + claude CLI
```

（需要实际 claude code session 验证，不能纯脚本跑。作为手测步骤。）

- [ ] **Step 11.5: Commit**

```bash
cd src
git add .claude/skills/casework/SKILL.md .claude/skills/casework/SKILL.md.v1.bak
git commit -m "refactor(casework-v2/T1): rewrite casework/SKILL.md as 4-step orchestrator

- 602 → <200 lines (-66%)
- Delegates to subskills: data-refresh / assess / act / summarize
- Supports mode=full (direct) and mode=patrol (Step 1+2 only)
- Eliminates changegate/fast-path/AR branches/timing boilerplate
- Old version kept as .v1.bak"
```

---

## Task 12: casework-ar 目录（AR 独立）

**Files:**
- Create: `src/.claude/skills/casework-ar/SKILL.md`
- Create: `src/.claude/skills/casework-ar/assess-ar/SKILL.md`
- Create: `src/.claude/skills/casework-ar/act-ar/SKILL.md`

- [ ] **Step 12.1: 从旧 casework SKILL.md v1 提取 AR 分支**

```bash
grep -n "isAR\|AR PATH\|ar-mode" src/.claude/skills/casework/SKILL.md.v1.bak | head -30
```

- [ ] **Step 12.2: 写 casework-ar/SKILL.md**

复用 data-refresh（传 `--is-ar true --main-case-id $MAIN_ID`），assess/act 走 AR 专用子 skill。

- [ ] **Step 12.3: 写 assess-ar 和 act-ar**

- AR 专用 actualStatus 判断（communicationMode / scope）
- AR 路由表（收件人 = case owner 或 客户）

- [ ] **Step 12.4: Commit**

---

## Task 13: 冒烟测试 + 性能基准

**Files:**
- Create: `src/conductor/specs/casework-v2/plans/t1-benchmark.md`

- [ ] **Step 13.1: 跑 3 个 case（普通 / AR / DELTA_EMPTY）**

```bash
cd src
# 普通
time bash .claude/skills/casework/scripts/data-refresh.sh \
  --case-number $(ls cases/active/ | head -1) \
  --case-dir "cases/active/$(ls cases/active/ | head -1)" \
  --project-root . --cases-root ./cases --is-ar false
```

记录：Step 1 耗时、overallStatus、deltaStatus。

- [ ] **Step 13.2: 对比 PRD §7 性能指标**

| Metric | Target | Actual |
|--------|--------|--------|
| Step 1 Data Refresh | < 20s | ? |
| Teams 8 chats | < 10s | ? |

任何目标未达 → 记录到 benchmark.md，判定是 T1 范围内优化还是单独 issue。

- [ ] **Step 13.3: Commit benchmark**

---

## Task 14: 清理旧文件（.bak 保留）

**Files:**
- Delete 或 rename to .bak: 见"File Structure → 备份后删除"段

- [ ] **Step 14.1: 批量 rename 为 .bak**

```bash
cd src
for f in .claude/skills/casework/scripts/check-case-changes.ps1 \
         .claude/skills/casework/scripts/casework-fast-path.sh \
         .claude/skills/casework/scripts/agent-cache-check.sh \
         .claude/skills/casework/scripts/casework-light-runner.sh \
         .claude/skills/casework/scripts/casework-gather.sh \
         .claude/skills/casework/scripts/extract-delta.sh; do
  [ -f "$f" ] && mv "$f" "$f.bak"
done
for d in .claude/skills/status-judge .claude/skills/compliance-check \
         .claude/skills/inspection-writer .claude/skills/data-refresh \
         .claude/skills/teams-search-queue; do
  [ -d "$d" ] && mv "$d" "${d}.bak"
done
for f in .claude/agents/casework-light.md .claude/agents/teams-search-queue.md; do
  [ -f "$f" ] && mv "$f" "$f.bak"
done
```

- [ ] **Step 14.2: grep 确认无活引用**

```bash
cd src
grep -rln "check-case-changes\|casework-fast-path\|status-judge\|compliance-check\|inspection-writer\|casework-light-runner" \
  --include="*.sh" --include="*.ps1" --include="*.md" . | grep -v "\.bak\|SKILL.md.v1" | head
```

Expected: 空输出。

- [ ] **Step 14.3: Commit**

```bash
cd src && git add -A
git commit -m "chore(casework-v2/T1): rename deprecated files to .bak

- See PRD §6.2 for full list
- Will be deleted after T2+T3 stable"
```

---

## Self-Review Checklist

做完 Task 14 后跑一次：

- [ ] PRD §6.1 migration steps 0-5 每条对应 Task：
  - step 0 meta rename → Task 1
  - step 1 new scripts → Task 2, 4, 5
  - step 2 optimize scripts → Task 3
  - step 3 subskills → Task 7, 8, 9, 10
  - step 4 rewrite casework/SKILL.md → Task 11
  - step 5 casework-ar → Task 12
- [ ] PRD §6.2 deletable files 全部处置 → Task 14
- [ ] PRD §4.1 临时文件生命周期（`.casework/` 清空重建）→ 在 casework/SKILL.md Step 1 前置加 `rm -rf && mkdir`
- [ ] Placeholder scan: 所有 "TODO" 都有明确来源（spike / 追后续 task），无 "implement later" / "similar to above"

**已知 deferred 到 T2**：
- patrol SKILL.md 重写
- `pipeline-state.json` schema + update-pipeline-state.sh
- patrol 编排事件循环

**已知 deferred 到 T3**：
- Dashboard 前后端（CaseworkPipeline、patrolStore、file-watcher、patrol-orchestrator）

---

## Execution Handoff

**Plan 保存位置：** `src/conductor/specs/casework-v2/plans/T1-core-refactor.md`

**执行建议：**

1. **Subagent-Driven（推荐）** — `superpowers:subagent-driven-development`：每个 Task 一个 fresh subagent，你 review 后进下一个。T1 有 14 个 Task，跑下来约 4-6h（含测试）。
2. **Inline Execution** — `superpowers:executing-plans`：当前 session 顺序跑，有 checkpoints 给你确认。

**Icebreaker**：Task 0（spike）+ Task 1（meta rename）可先做，零风险，适合今晚就启动。然后睡觉，明早 review spike 结果后开 Task 2+。

> 颗粒度对齐：每个 Task 独立闭环，失败只回滚当前 commit 不影响前序。TODO 标注明确，executor 不会在模糊处卡住。
