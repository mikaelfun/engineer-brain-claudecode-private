# Casework V2 T1 — Session Handoff

**交接时间**: 2026-04-17
**上下文状态**: 上一 session 上下文满，新 session 接续

## 当前进度

- ✅ PRD.md 完成定板（1298 行，9 个 issue 已修）
- ✅ T1 Plan 写完（15 Task，1069 行）
- ⏸️ Task 0 Spike 未执行
- ⏸️ Task 1-14 未执行

## 用户决策：A+B 路径

- **B（今晚）**: 跑 Task 0 Spike（只读，零风险）
- **A（明早）**: 用户 review spike 结果 + plan，再决定是否开 Task 1+

## 新 Session 首条指令

**复制下面这段给新 session：**

```
继续 Casework V2 T1 实施。读这两个文件：
1. src/conductor/specs/casework-v2/plans/HANDOFF.md（本文件）
2. src/conductor/specs/casework-v2/plans/T1-core-refactor.md（完整 Plan）

请执行 Task 0 Spike，按 Step 0.1 → 0.2 → 0.3 → 0.4 顺序做完并 commit。
完成后停下，不要进 Task 1。等我 review spike-notes.md。
```

## Task 0 Spike 摘要（新 session 可直接做）

### Step 0.1: 提取 compliance 字段

```bash
cd src
ls cases/active/ | head -3 | while read c; do
  echo "=== $c ==="
  grep -E "^\*\*(Entitlement|SAP|Support Plan)" "cases/active/$c/case-info.md" || echo "  (fields absent)"
done
```

### Step 0.2: 写 spike-notes.md

路径：`src/conductor/specs/casework-v2/plans/spike-notes.md`
内容模板：

```markdown
# T1 Spike Notes

## Compliance Hash Fields (TODO-1 resolution)

Sample cases examined:
- {caseNumber1}
- {caseNumber2}
- {caseNumber3}

Fields identified:
- field1: "Entitlement: <example value>"
- field2: "SAP Code: <example value>"
- field3: "Support Plan: <example value>"

sha256 input format: `{entitlement}|{sapCode}|{supportPlan}`

## Atomic Write Validation (TODO-3 resolution)

Concurrent 100-writer test: PASS / FAIL
Final file JSON parseable: PASS / FAIL

## casehealth-meta.json reference count (Task 1 preview)

Found N references across file types:
- .sh: X
- .ps1: X
- .py: X
- .md: X
- .ts: X
```

### Step 0.3: 原子写并发测试

```bash
mkdir -p /tmp/event-test && rm -f /tmp/event-test/*
for i in $(seq 1 100); do
  (echo "{\"n\": $i}" > /tmp/event-test/e.json.tmp && mv /tmp/event-test/e.json.tmp /tmp/event-test/e.json) &
done
wait
python3 -c "import json; print('OK', json.load(open('/tmp/event-test/e.json')))"
```

### Step 0.4: commit

```bash
cd src
git add conductor/specs/casework-v2/plans/spike-notes.md
git commit -m "spike(casework-v2/T1): validate compliance hash fields + atomic writes"
```

## 关键路径速查

| 文件 | 用途 |
|------|------|
| `src/conductor/specs/casework-v2/PRD.md` | 唯一事实来源 |
| `src/conductor/specs/casework-v2/plans/T1-core-refactor.md` | 执行 plan |
| `src/conductor/specs/casework-v2/plans/HANDOFF.md` | 本文件 |
| `src/conductor/specs/casework-v2/plans/spike-notes.md` | ⚠️ Task 0 产出（尚未创建） |

## 红线提醒（新 session 必读）

- ❌ 不要动任何 case 目录的数据（Task 0 只读）
- ❌ 不要跑 Task 1 之后的任务（等用户 review）
- ❌ 不要 spawn subagent（Task 0 是纯 bash + Read）
- ✅ 完成后在 spike-notes.md 写 "Task 0 完成，等待 review"

## 方法论

- flavor: 🟠 alibaba
- 核心：闭环拿结果——spike 的交付物是 spike-notes.md，不是"我看了一眼"
- 颗粒度：Task 0 四步每步独立可验证
