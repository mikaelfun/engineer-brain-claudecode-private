# Specification: Inspection 重构 — case-summary + 规则化 todo

**Track ID:** inspection-refactor_20260328
**Type:** Refactor
**Created:** 2026-03-28
**Status:** Draft
**Source:** ISS-113

## Summary

废弃 `inspection-YYYYMMDD.md`（95% 重复数据），替换为 `case-summary.md`（增量叙事）+ 规则化 `todo` 生成（bash 脚本）。快速路径省 40-50s LLM，CHANGED 路径省 30-40s。

## Context

当前 casework Step 5 每次全量重建 inspection（Read 5 files → LLM 思考 40-50s → heredoc 写入），但 47 行中只有「最新动态」4 行是其他文件没有的。`case-info.md` 已有基本信息/联系人，`casehealth-meta.json` 已有合规/状态，`timing.json` 已有执行统计。同时 `context/case-summary.md` 已在 schema 中定义但从未实现。

### 当前文件重叠分析

| inspection 区块 | 行数 | 重复源 |
|----------------|------|--------|
| 基本信息 (9 fields) | 12 | 100% 复制 `case-info.md` |
| 联系人 (4 fields) | 7 | 100% 复制 `case-info.md` |
| 合规状态 (5 rows) | 8 | 100% 复制 `casehealth-meta.json` |
| **最新动态** (bullets) | **4** | **唯一价值（语义叙事）** |
| 风险提示 | 2 | 部分重叠 `meta.statusReasoning` |
| 执行统计 | 14 | 100% 复制 `timing.json` |

**结论：47 行中只有 ~6 行（最新动态+风险）是不可从其他文件获取的。**

## Motivation

- inspection 是 casework 快速路径的主要瓶颈（占 70% 耗时，40-50s LLM 思考）
- 95% 内容是其他文件的复制，维护成本高且容易不一致
- case-summary.md 的增量模式更适合 AI resume 场景
- todo 的生成逻辑完全可规则化，不需要 LLM

## 详细设计

### 1. 新文件：`case-summary.md`（取代 inspection 的叙事价值）

**位置**：`{caseDir}/case-summary.md`（根目录，非 context/ 子目录，提升可见性）

**格式**：

```markdown
# Case Summary — {caseNumber}

## 问题描述
{一句话描述客户问题，首次 casework 时生成，后续不变}

## 排查进展
- [{date}] {事件描述} ← 增量追加，每次 CHANGED 时 LLM 追加新条目
- [{date}] {事件描述}
- [{date}] {事件描述} ← latest

## 关键发现
- {发现1，首次生成或有新发现时更新}
- {发现2}

## 风险
- {基于 actualStatus + days + SLA 的风险评估}
```

**更新逻辑**：
- **首次**（文件不存在）：LLM 读取 case-info + emails + notes + teams，生成完整 summary（~10s）
- **CHANGED 时**（有新邮件/notes/teams）：LLM 只读取新增内容（diff），用 Edit 工具追加 1-2 行到「排查进展」，按需更新「风险」（~5-10s）
- **NO_CHANGE 时**：完全跳过，不读不写（0s）

**对比 inspection**：
| 维度 | inspection | case-summary |
|------|-----------|--------------|
| 生成方式 | 每次全量 LLM 重写 | 增量追加 |
| NO_CHANGE 耗时 | 40-50s | 0s |
| CHANGED 耗时 | 40-50s | 5-10s |
| 内容 | 47 行（95% 重复） | ~15-20 行（纯叙事） |
| resume 价值 | 需读全文 | 直接注入 systemPrompt |

### 2. 规则化 Todo 生成脚本

**文件**：`skills/d365-case-ops/scripts/generate-todo.sh`

**输入**：`$1` = caseDir 绝对路径

**读取**：`casehealth-meta.json`（actualStatus, daysSinceLastContact, irSla, fdr, fwr, compliance）

**规则矩阵**：

```
# 🔴 需人工决策
if actualStatus == "new" && irSla.status != "Succeeded"     → 🔴 IR SLA 未完成，需立即处理
if compliance.entitlementOk == false                          → 🔴 Entitlement 异常，需确认

# 🟡 待确认执行
if actualStatus == "pending-customer" && days >= 3            → 🟡 客户 {days} 天无回复，建议发 follow-up
if actualStatus == "pending-customer" && days >= 5            → 🟡 已 3 次 follow-up 未回复，考虑关单
if actualStatus == "ready-to-close"                           → 🟡 准备关单，发 closure email

# ✅ 仅通知
if irSla.status == "Succeeded"                                → ✅ IR SLA 已完成
if actualStatus == "pending-customer" && days < 3             → ✅ 等待客户回复，{days} 天
if actualStatus == "pending-pg"                               → ✅ 等待 PG 回复
if actualStatus == "researching"                              → ✅ 技术排查中
```

**输出**：写入 `{caseDir}/todo/YYMMDD-HHMM.md`，固定格式。stdout 输出 `TODO_OK|red=N,yellow=N,green=N`

**耗时**：~1s（纯 bash/jq，无 LLM）

### 3. Casework SKILL.md Step 变更

**现在 Step 4（inspection-writer）**：
```
读 5 文件 → LLM 思考 40-50s → heredoc 写 inspection + todo → Edit meta
```

**改为**：
```
快速路径 (NO_CHANGE + case-summary 已存在):
  → bash generate-todo.sh（1s）
  → 跳过 case-summary（无变化）
  → bash timing.sh（1s）

快速路径 (NO_CHANGE + case-summary 不存在):
  → 走 inspection-writer 首次生成

正常流程 (CHANGED):
  → case-summary 增量更新：
    if 文件不存在 → LLM 生成完整 summary（~10s）
    if 文件存在 → LLM 读 diff + Edit 追加进展（~5s）
  → bash generate-todo.sh（1s）
  → bash timing.sh（1s）
```

### 4. Dashboard 适配

需要修改的文件：

| 文件 | 改动 |
|------|------|
| `dashboard/src/routes/cases.ts` L288-321 | GET /api/cases/:id/inspection → 改读 case-summary.md，fallback 读 inspection-*.md |
| `dashboard/src/agent/case-session-manager.ts` L425-436 | context/case-summary.md → case-summary.md（根目录） |
| `dashboard/src/agent/case-session-manager.ts` L660 | step prompt 更新描述 |
| `dashboard/web/src/pages/CaseDetail.tsx` | InspectionTab → Summary tab |
| `dashboard/web/src/components/CaseAIPanel.tsx` | action label Inspection → Summary |
| `dashboard/web/src/components/session/SessionMessageList.tsx` | action display label |

### 5. Schema 文档更新

`playbooks/schemas/case-directory.md` 变更：

| 变更 | 旧 | 新 |
|------|-----|-----|
| `inspection-YYYYMMDD.md` | 巡检摘要 | **废弃**（现有文件保留不删） |
| `case-summary.md` | context/ 子目录 | **提升到根目录**，角色：增量叙事摘要 |
| `todo/*.md` | inspection-writer 生成 | `generate-todo.sh` 规则化生成 |

## Acceptance Criteria

- [ ] `case-summary.md` 在首次 casework 时由 LLM 生成完整摘要
- [ ] `case-summary.md` 在 CHANGED 时由 LLM 增量追加新进展（Edit，不全量重写）
- [ ] `case-summary.md` 在 NO_CHANGE 时完全跳过（0 reads, 0 writes）
- [ ] `generate-todo.sh` 根据 meta.json 规则矩阵生成 todo（无 LLM）
- [ ] casework 快速路径不再调用 LLM（仅 bash 脚本）
- [ ] `inspection-writer/SKILL.md` 重写为新逻辑
- [ ] `casework/SKILL.md` Step 4 更新为新流程
- [ ] `case-directory.md` 更新文件角色说明
- [ ] Dashboard Case Detail 适配新数据源（fallback 兼容旧 inspection）

## Risk Assessment

- **中等**：Dashboard 有 6 处读取 inspection 的逻辑需要适配（已全部定位）
- **低**：现有 inspection 文件无需删除，自然淘汰
- **低**：规则化 todo 可能遗漏 LLM 能发现的边缘场景 → 后续可迭代补充规则

## Out of Scope

- 不迁移/删除已有 inspection 文件（自然废弃）
- 不修改 troubleshooter / email-drafter / status-judge 等其他 agent
- 不修改 patrol 流程（patrol 调用 casework，自动继承变化）

---

_Generated by Conductor. Review and edit as needed._
