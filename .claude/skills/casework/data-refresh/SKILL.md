---
description: "Step 1 Data Refresh — 并行拉取 D365/Teams/ICM/OneNote/Attachments 数据，产出 data-refresh.json（写入 run 目录）"
name: casework:data-refresh
displayName: Case 数据刷新
category: casework-sub-skill
stability: stable
requiredInput: caseNumber
promptTemplate: |
  Run Step 1 (data-refresh) for Case {caseNumber}. Read .claude/skills/casework/data-refresh/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
---

# /casework:data-refresh — Step 1 Data Refresh

纯脚本步骤，无 LLM 推理。并行拉取 6 路数据源，聚合为 `data-refresh.json`（写入 run 目录）。

## 输入

- `caseNumber` — 必填
- `caseDir` — case 目录路径（`{casesRoot}/active/{caseNumber}`）

## 输出

- `{caseDir}/.casework/runs/{runId}/data-refresh/data-refresh.json` — 聚合结果（PRD §4.2 schema）。下游通过 `resolve-run-path.sh output/data-refresh.json` 解析。
- `{caseDir}/case-info.md` — D365 snapshot
- `{caseDir}/emails.md` — 邮件
- `{caseDir}/notes.md` — Notes
- `{caseDir}/teams/` — Teams 搜索结果
- `{caseDir}/onenote/` — OneNote 相关页面
- `{caseDir}/icm/` — ICM 数据（如有）

## 执行

```bash
bash .claude/skills/casework/scripts/data-refresh.sh \
  --case-number {caseNumber} \
  --case-dir {caseDir} \
  --project-root {projectRoot}
```

AR case（case number ≥ 19 位）自动检测，额外传 `--is-ar --main-case-number {前16位}`。

## 数据源与优先级

| 优先级 | 数据源 | 失败影响 |
|--------|--------|---------|
| **L1** | D365（case-info, emails, notes） | 失败 → 整体失败，exit 1 |
| L2 | Teams 搜索 | 降级，assess 标注 degraded |
| L2 | ICM | 降级 |
| L2 | OneNote | 降级 |
| L3 | Attachments | 降级 |
| L3 | Digest 生成（Teams + OneNote） | 降级 |

## AR 模式差异

- D365 数据从 **main case**（前 16 位）拉取（emails 挂在 main case）
- Teams 搜索：AR case number + case owner 名
- 不执行 IR check
- `data-refresh-output.json` 中 `isAR=true`

## Delta 检测

脚本对比本次拉取与上次缓存，产出 `deltaStatus`：
- `DELTA_EMPTY` — 无新数据（assess 走快速路径，零 LLM）
- `DELTA_HAS_CHANGES` — 有变化（assess 执行完整 LLM 判断）

## 错误处理

| 场景 | 行为 |
|------|------|
| D365 拉取失败 | exit 1，不产出 output JSON |
| Teams/ICM/OneNote 失败 | output JSON 中对应源 status=FAILED，继续 |
| Digest 生成失败 | digest 文件不生成，assess 不引用，继续 |
