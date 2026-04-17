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

## 错误处理

| 场景 | 行为 |
|------|------|
| `data-refresh-output.json` 不存在 | changePath 默认 CHANGED（保守） |
| `case-info.md` 不存在 | exit 2，提示先跑 `/casework:data-refresh` |
| `generate-todo.sh` 失败 | 记日志，不阻塞 meta 更新 |
| LLM summary 生成失败 | pipeline-state 标 failed |
