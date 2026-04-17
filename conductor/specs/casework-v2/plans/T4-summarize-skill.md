# T4 — Casework Summarize Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地 `casework/summarize/SKILL.md` — Step 4 将现有 `inspection-writer/SKILL.md` 的核心逻辑（case-summary.md 增量更新 + generate-todo.sh + meta 更新）包装为 casework sub-skill，统一四步模型的最后一环。

**Architecture:**
- `execution-plan.json`（Step 2）+ `analysis/` + `drafts/`（Step 3）→ **summarize skill**（本 Plan）→ `case-summary.md` + `todo/*.md` + `casework-meta.json` lastInspected
- 核心是对 `inspection-writer/SKILL.md` 的**薄包装**：summarize 读 pipeline context（delta/actions），委托给 inspection-writer 的逻辑写 summary + todo
- 新增：pipeline-state 更新（标记 summarize completed）+ changePath 从 data-refresh-output.json 推导（不再依赖 changegate）

**Tech Stack:** SKILL.md（文档 + prompt 模板）、Bash（changePath 推导脚本）

**PRD 对应节**：§3.2（summarize/SKILL.md 规格）、§4.1（文件生命周期）、§4.4（pipeline-state）

---

## File Structure

| 文件 | 职责 | 行为 |
|------|------|------|
| `.claude/skills/casework/summarize/SKILL.md` | 主 skill 文档：读 context → 推导 changePath → LLM 写 summary → generate-todo → meta 更新 | **新建** |
| `.claude/skills/casework/summarize/scripts/derive-change-path.sh` | 从 data-refresh-output.json 推导 changePath（CHANGED/NO_CHANGE） | **新建** |
| `.claude/skills/casework/summarize/tests/test_derive_change_path.sh` | changePath 推导测试 | **新建** |
| `.claude/skills/casework/SKILL.md` | Step 4 改为引用 `/casework:summarize`，T4 标记已交付 | **修改** |

---

## Task 1: derive-change-path.sh（TDD）

**Files:**
- Create: `.claude/skills/casework/summarize/scripts/derive-change-path.sh`
- Create: `.claude/skills/casework/summarize/tests/test_derive_change_path.sh`
- Reuse fixtures: `.claude/skills/casework/assess/tests/fixtures/data-refresh-output-*.json`

inspection-writer 需要 `changePath`（`CHANGED`/`NO_CHANGE`）。v1 由 changegate 脚本提供；v2 中 changegate 被取消（PRD §2.2），需从 data-refresh-output.json 的 `deltaStatus` 推导。

- [ ] **Step 1: Write the failing test**

```bash
#!/usr/bin/env bash
# .claude/skills/casework/summarize/tests/test_derive_change_path.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../scripts/derive-change-path.sh"
# Reuse assess fixtures (same data-refresh-output format)
FIXTURES="$HERE/../../assess/tests/fixtures"
PASS=0; FAIL=0

run_test() {
  local name="$1" fixture="$2" expected="$3"
  local actual
  actual=$(bash "$SCRIPT" "$FIXTURES/$fixture")
  if [ "$actual" = "$expected" ]; then
    echo "  ✓ $name"; PASS=$((PASS+1))
  else
    echo "  ✗ $name: expected '$expected', got '$actual'"; FAIL=$((FAIL+1))
  fi
}

echo "=== derive-change-path.sh tests ==="

# T1: DELTA_OK → CHANGED
run_test "delta-ok" "data-refresh-output-full.json" "CHANGED"

# T2: DELTA_EMPTY → NO_CHANGE
run_test "delta-empty" "data-refresh-output-delta-empty.json" "NO_CHANGE"

# T3: teams-only (has delta) → CHANGED
run_test "teams-only" "data-refresh-output-teams-only.json" "CHANGED"

# T4: file not found → CHANGED (conservative default)
run_test "missing-file" "/nonexistent/path.json" "CHANGED"

echo "=== $PASS passed, $FAIL failed ==="
[ $FAIL -eq 0 ]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bash .claude/skills/casework/summarize/tests/test_derive_change_path.sh`
Expected: FAIL (script not found)

- [ ] **Step 3: Implement derive-change-path.sh**

```bash
#!/usr/bin/env bash
# derive-change-path.sh — Map deltaStatus to changePath for inspection-writer
# Usage: bash derive-change-path.sh <data-refresh-output.json>
# Output: CHANGED | NO_CHANGE
set -euo pipefail
INPUT="${1:-}"

if [ -z "$INPUT" ] || [ ! -f "$INPUT" ]; then
  # Conservative default: treat missing/unreadable as CHANGED
  echo "CHANGED"
  exit 0
fi

DELTA=$(python3 -c "
import json, sys
try:
    d = json.load(open(sys.argv[1], encoding='utf-8'))
    print(d.get('deltaStatus', 'DELTA_OK'))
except:
    print('DELTA_OK')
" "$INPUT")

if [ "$DELTA" = "DELTA_EMPTY" ]; then
  echo "NO_CHANGE"
else
  echo "CHANGED"
fi
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bash .claude/skills/casework/summarize/tests/test_derive_change_path.sh`
Expected: all 4 pass

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/casework/summarize/
git commit -m "feat(summarize): derive-change-path.sh with TDD (T4.1)"
```

---

## Task 2: summarize/SKILL.md — 主 Skill 文档

**Files:**
- Create: `.claude/skills/casework/summarize/SKILL.md`

这个 SKILL.md 是对 inspection-writer 的**薄包装** — 增加 v2 pipeline 集成（changePath 推导、pipeline-state 更新），核心 summary 生成逻辑引用 inspection-writer/SKILL.md。

- [ ] **Step 1: Write SKILL.md**

```markdown
---
description: "Step 4 Summarize — case-summary.md 增量更新 + todo 生成 + meta 更新"
name: casework:summarize
displayName: Case 总结
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run Step 4 (summarize) for Case {caseNumber}. Read .claude/skills/casework/summarize/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# /casework:summarize — Step 4 Summarize

增量更新 case-summary.md + 规则化生成 todo + 更新 casework-meta.json。

**本 skill 是 `/inspection-writer` 的 v2 替代品**——核心 summary 生成规则与 inspection-writer 完全相同，增加了 v2 pipeline 集成层。

## 输入契约

- `{caseDir}/.casework/data-refresh-output.json` — 可选（用于推导 changePath；不存在时视为 CHANGED）
- `{caseDir}/case-info.md` — D365 snapshot
- `{caseDir}/emails.md` — 邮件
- `{caseDir}/casework-meta.json` — 累计元数据

## 输出契约

- `{caseDir}/case-summary.md` — 增量更新（首次生成或追加）
- `{caseDir}/todo/YYMMDD-HHMM.md` — 规则化 todo
- `{caseDir}/casework-meta.json` — upsert `lastInspected`
- `{caseDir}/.casework/pipeline-state.json` — 标记 summarize completed

## 执行步骤

### Step 1. 推导 changePath

v2 取消了 changegate；从 data-refresh-output.json 的 `deltaStatus` 推导：

```bash
CHANGE_PATH=$(bash .claude/skills/casework/summarize/scripts/derive-change-path.sh \
  "{caseDir}/.casework/data-refresh-output.json")
# CHANGED | NO_CHANGE
```

### Step 2. Pipeline state — 标记 summarize running

```bash
python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
  --case-dir "{caseDir}" --step "summarize" --status "running" \
  --case-number "{caseNumber}"
```

### Step 3. 执行 summary 更新

**按 inspection-writer/SKILL.md 的完整规则执行**——读取该文件的 Step 2a/2b/2.5/3/4 章节：

1. **changePath 决策树**（inspection-writer Step 1）：
   - `NO_CHANGE + case-summary.md 已存在` → 跳过 summary，直接到 Step 3 todo
   - `NO_CHANGE + case-summary.md 不存在` → 首次生成（Step 2a）
   - `CHANGED + case-summary.md 不存在` → 首次生成（Step 2a）
   - `CHANGED + case-summary.md 已存在` → 增量追加（Step 2b）

2. **首次生成**（Step 2a）：读 case-info.md + emails.md + notes.md + teams-digest.md + claims.json + onenote/personal-notes.md，Write 生成完整 case-summary.md

3. **增量追加**（Step 2b）：仅读新增内容，Edit 追加到「排查进展」「关键发现」「风险」

4. **claims.json 感知**：verified 正常写入、challenged 加 [unverified]、rejected 不写入

5. **SAP 准确性检查**（Step 2.5）

6. **generate-todo.sh**（Step 3）：
```bash
bash skills/casework/scripts/generate-todo.sh "{caseDir}"
# 输出: TODO_OK|red=N,yellow=N,green=N
```

7. **更新 meta**（Step 4）：upsert `casework-meta.json.lastInspected` = ISO now

**完整规则参考**：`cat .claude/skills/inspection-writer/SKILL.md`（summary 格式、AR 规则、claims 感知等均在其中定义）

### Step 4. Pipeline state — 标记 summarize completed + 日志

```bash
python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
  --case-dir "{caseDir}" --step "summarize" --status "completed" \
  --case-number "{caseNumber}"

echo "SUMMARIZE_OK|changePath=$CHANGE_PATH|elapsed=${SECONDS}s"
```

## Safety Redlines

- ❌ 不直接发邮件
- ❌ 不修改 D365（不 add-note、不 record-labor）
- ✅ case-summary.md 增量更新（不重写已有内容）
- ✅ 只 upsert meta.lastInspected，不覆盖 compliance/actualStatus

## Pitfalls (known)

- **changePath 推导**：data-refresh-output.json 不存在时保守视为 CHANGED（触发 LLM summary），避免漏更新
- **inspection-writer 兼容**：本 skill 引用 inspection-writer 的规则，不重复定义。两个 skill 可独立调用——`/inspection-writer` 保留作兼容，`/casework:summarize` 是 v2 推荐入口
- **AR Case**：changePath + AR 规则在 inspection-writer 中定义，本 skill 透传不修改
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/casework/summarize/SKILL.md
git commit -m "docs(summarize): SKILL.md — Step 4 summary + todo + pipeline (T4.2)"
```

---

## Task 3: casework SKILL.md — 接入 Step 4 引用

**Files:**
- Modify: `.claude/skills/casework/SKILL.md`

- [ ] **Step 1: 更新 v2 状态块**

在 casework SKILL.md 的 v2 说明块中，更新：
- `T4, 未交付` 改为 `T4`
- 添加 summarize 内部说明行

找到这行：
```
> - 完整 v2 路径：`data-refresh` (T1) → `assess` (T2) → `act` (T3) → `summarize` (T4, 未交付)
```

替换为：
```
> - 完整 v2 路径：`data-refresh` (T1) → `assess` (T2) → `act` (T3) → `summarize` (T4)
> - summarize 内部：changePath 推导 → inspection-writer 规则执行（summary + SAP check + todo）→ meta.lastInspected 更新 → pipeline-state completed
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/casework/SKILL.md
git commit -m "docs(casework): update v2 status — T4 summarize delivered (T4.3)"
```

---

## Task 4: 真实 case smoke test

**Files:** 无新文件（验证性任务）

- [ ] **Step 1: 验证 derive-change-path 对真实 data**

```bash
bash .claude/skills/casework/summarize/scripts/derive-change-path.sh \
  ../data/cases/active/2604140040001804/.casework/data-refresh-output.json
```

Expected: `CHANGED` 或 `NO_CHANGE`（取决于上次 refresh 结果）

- [ ] **Step 2: 验证 pipeline-state 写入 summarize**

```bash
python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
  --case-dir ../data/cases/active/2604140040001804 \
  --step "summarize" --status "running" --case-number "2604140040001804"
cat ../data/cases/active/2604140040001804/.casework/pipeline-state.json | python3 -m json.tool
python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
  --case-dir ../data/cases/active/2604140040001804 \
  --step "summarize" --status "completed"
```

- [ ] **Step 3: Commit smoke log**

```bash
echo "$(date -u +%FT%TZ) T4 SMOKE PASS — derive-change-path + pipeline-state(summarize) verified on 2604140040001804" \
  >> conductor/specs/casework-v2/plans/T4-summarize-skill.md.smoke.log
git add conductor/specs/casework-v2/plans/T4-summarize-skill.md.smoke.log conductor/specs/casework-v2/plans/T4-summarize-skill.md
git commit -m "test(summarize): T4 smoke test pass on real case (T4.4)"
```

---

## Verification Checklist

| 验证项 | 命令 | 期望 |
|--------|------|------|
| derive-change-path 测试 | `bash .../tests/test_derive_change_path.sh` | 4 passed, 0 failed |
| Bash 语法检查 | `bash -n .../scripts/derive-change-path.sh` | SYNTAX_OK |
| SKILL.md 存在 | `ls -la .claude/skills/casework/summarize/SKILL.md` | file exists |
| 真实 case changePath | `bash ... derive-change-path.sh ...` | CHANGED 或 NO_CHANGE |
| Pipeline state | `python3 ... --step summarize --status running` | valid JSON |
