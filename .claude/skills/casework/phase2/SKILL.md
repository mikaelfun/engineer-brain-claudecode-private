---
description: "Phase 2 — 排查后闭环：challenger gate → reassess → [email] → summarize。在 troubleshooter 完成后由 patrol spawn，单 agent 内 inline 执行全部后续步骤。"
name: casework:phase2
displayName: 排查后闭环（Phase 2）
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run phase2 for Case {caseNumber}. Read .claude/skills/casework/phase2/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# /casework:phase2 — 排查后闭环

troubleshooter 完成后的全部后续步骤，在单个 agent 内 inline 执行。

**调用方**：patrol 主 agent（troubleshooter 完成后 spawn）或 full-mode casework act。
**输入**：troubleshooter 已产出 `claims.json` + `analysis/*.md`。

## 输入契约

- `{caseDir}/.casework/claims.json` — 必须存在（troubleshooter 产物）
- `{caseDir}/analysis/*.md` — 分析报告
- `{caseDir}/.casework/execution-plan.json` — assess 阶段产物
- `{caseDir}/case-info.md` — D365 snapshot
- `{caseDir}/emails.md` — 邮件历史

## 输出契约

- `{caseDir}/.casework/execution-plan.json` — append reassess phase
- `{caseDir}/drafts/*.md` — 邮件草稿（如需）
- `{caseDir}/case-summary.md` — 增量更新
- `{caseDir}/todo/*.md` — todo 生成
- `{caseDir}/casework-meta.json` — upsert lastInspected

## 执行步骤

### Step 1. Challenger Gate（inline）

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action challenger --status active \
  --case-number "{caseNumber}"
```

读取 `{caseDir}/.casework/claims.json`：

```bash
TRIGGER=$(python3 -c "
import json
c = json.load(open(r'{caseDir}/.casework/claims.json', encoding='utf-8'))
print('1' if c.get('triggerChallenge') else '0')
")
```

**triggerChallenge=true 时**：

1. 读取 `.claude/skills/casework/act/challenge/SKILL.md` 获取完整执行步骤
2. **在当前 agent 内 inline 执行** challenger 的全部逻辑（读 claims → 逐条审查 → 写 challenge-report.md → 更新 claims.json 状态）
3. 读取 challenger 结果：
   - `ACTION:retry-troubleshoot` → 更新 state，标记 `needs-retroubleshoot`，**退出返回 patrol**
   - 其他（`ACTION:proceed` / `ACTION:request-info`）→ 继续 Step 2

```bash
# challenger 完成
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action challenger --status completed \
  --case-number "{caseNumber}"
```

**triggerChallenge=false 时**：跳过 challenger，直接 Step 2。

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action challenger --status skipped \
  --case-number "{caseNumber}"
```

### Step 2. Reassess（inline）

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action reassess --status active \
  --case-number "{caseNumber}"
```

读取 `.claude/skills/casework/act/reassess/SKILL.md` 获取完整执行步骤，在当前 agent 内 inline 执行：
- 读 claims.json → fact/analysis 分类落盘 → LLM 决策 → 写 execution-plan phase 2

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action reassess --status completed \
  --case-number "{caseNumber}"
```

### Step 3. Email（inline，按需）

读取 reassess 产出的 execution-plan phase 2 actions：

```bash
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh \
  "{caseDir}/.casework/execution-plan.json")
```

如果有 email-drafter action：

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action email-drafter --status active \
  --case-number "{caseNumber}"
```

读取 `.claude/skills/casework/act/draft-email/SKILL.md` 获取完整执行步骤，在当前 agent 内 inline 执行。
emailType 从 reassess decision 中获取。

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action email-drafter --status completed \
  --case-number "{caseNumber}"
```

如果无 email action（exhausted / out-of-scope）：跳过。

```bash
# Act step 整体完成
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --status completed \
  --case-number "{caseNumber}"
```

### Step 4. Summarize（inline）

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step summarize --status active \
  --case-number "{caseNumber}"
```

读取 `.claude/skills/casework/summarize/SKILL.md` 获取完整执行步骤，在当前 agent 内 inline 执行。

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step summarize --status completed \
  --case-number "{caseNumber}"
```

### Step 5. Exit signal

如果 Step 1 产出 `needs-retroubleshoot`：
```
PHASE2_EXIT|result=needs-retroubleshoot|elapsed={S}s
```

正常完成：
```
PHASE2_OK|conclusion={type}|email={emailType or none}|elapsed={S}s
```

## Safety Redlines

- ❌ 不直接发邮件
- ❌ 不修改 D365
- ✅ challenger/reassess/email-drafter/summarize 全部 inline，不再 spawn subagent
- ⚠️ 唯一返回 patrol 的情况：challenger 判定 needs-retroubleshoot

## Error Handling

| 场景 | 行为 |
|------|------|
| claims.json 不存在 | exit 2，提示 troubleshooter 未完成 |
| reassess LLM 返回非法 JSON | exit 2 |
| email-drafter 失败 | 标记 act.action.email=failed，不阻塞 summarize |
| summarize 失败 | 标记 summarize=failed，退出 |
