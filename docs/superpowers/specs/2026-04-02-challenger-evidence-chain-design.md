# Challenger — Evidence Chain Audit System

> Spec created: 2026-04-02
> Status: Draft — pending user review

## Problem Statement

当前 casework 流程中，troubleshooter 产出的分析结论（`analysis/*.md`）会通过 `case-summary.md` 传播给所有后续 agent（email-drafter、inspection-writer、下一轮 troubleshooter）。如果 troubleshooter 的分析方向错误，错误会通过 `analysis → case-summary → 所有后续 agent` 这条链路放大和固化，形成确认偏差。

当前缺少：
1. 事实数据与 LLM 推断的区分机制
2. 对分析结论证据链完整性的审查
3. 打回无据推测并触发信息收集或方向修正的反馈闭环

## Design Decisions

| 维度 | 选择 | 理由 |
|------|------|------|
| 介入时机 | 按需触发 | 不是每次 casework 都需要审查，控制 token 成本 |
| 触发机制 | 结构化自评 | troubleshooter 对每个 claim 标注 confidence + citation，低置信度自动触发 |
| 证据链格式 | `claims.json` | 结构化 JSON，便于 Challenger 程序化审查和 Dashboard 消费 |
| Challenger 形态 | 独立 Agent | 独立 context window + MCP，不受 troubleshooter 分析方向污染 |
| 打回机制 | 自动回路 | Challenger reject → troubleshooter retry / email-drafter request-info |
| 数据分离 | Claim 级分离 | 在 claim 粒度标注事实引用，非文件级物理分离，不破坏现有目录 |
| Summary 保护 | `[unverified]` 标注 | challenged claims 写入 summary 时加前缀，防止错误传播 |
| 循环限制 | 1 次重试 + 回落 request-info | 防止无限循环，最终通过客户收集信息解决 |

## Architecture Overview

```
casework B5 路由 → troubleshooter
                      ↓
              analysis.md + claims.json (Step 5a: 证据链提取)
                      ↓
              triggerChallenge === true?
                  ↓ YES              ↓ NO
           spawn challenger      → email-drafter (正常流程)
                  ↓
           challenge-report.md + claims.json 更新
                  ↓
           ┌──────────────────────────────────┐
           │ all verified → email-drafter      │
           │ challenged   → email-drafter      │
           │               (request-info)      │
           │ rejected     → troubleshooter     │
           │               retry (max 1)       │
           │ retry still  → email-drafter      │
           │ rejected       (request-info)     │
           │               + Todo 🔴            │
           └──────────────────────────────────┘
```

## 1. claims.json Schema

位置：`{caseDir}/claims.json`

```json
{
  "version": 1,
  "generatedAt": "2026-04-02T10:30:00+08:00",
  "generatedBy": "troubleshooter",
  "analysisRef": "analysis/20260402-1030-aks-pss-policy.md",
  "overallConfidence": "medium",
  "triggerChallenge": true,
  "retryCount": 0,
  "claims": [
    {
      "id": "C1",
      "claim": "客户 AKS 集群的 Pod Security Standards enforcement 导致 Pod 被 reject",
      "type": "root-cause",
      "confidence": "high",
      "evidence": [
        {
          "source": "kusto/20260402-1030-aks-audit-logs.md",
          "excerpt": "PodSecurityPolicy violation: privileged=true rejected",
          "sourceType": "kusto-result"
        },
        {
          "source": "research/research.md#Microsoft Learn",
          "excerpt": "AKS PSS enforcement rejects pods violating baseline profile",
          "sourceType": "official-doc",
          "url": "https://learn.microsoft.com/azure/aks/use-psa"
        }
      ],
      "status": "pending",
      "challengerNote": null
    },
    {
      "id": "C2",
      "claim": "升级到 1.28 后 PSS 默认从 warn 变为 enforce",
      "type": "cause-chain",
      "confidence": "low",
      "evidence": [],
      "status": "pending",
      "note": "未找到官方文档确认此行为变化，可能是推测",
      "challengerNote": null
    }
  ]
}
```

### 字段定义

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | number | Schema 版本，当前 1 |
| `generatedAt` | ISO8601 | 生成时间 |
| `generatedBy` | string | `"troubleshooter"` |
| `analysisRef` | string | 对应的 analysis.md 相对路径 |
| `overallConfidence` | enum | `high` / `medium` / `low` — 整体置信度 |
| `triggerChallenge` | boolean | 是否触发 Challenger（存在 low/none confidence claim 时为 true） |
| `retryCount` | number | troubleshooter retry 次数，初始 0 |

### Claim 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | `C1`, `C2`, ... 自增 |
| `claim` | string | 技术判断的自然语言描述 |
| `type` | enum | `root-cause` / `cause-chain` / `impact` / `recommendation` / `observation` |
| `confidence` | enum | `high`（多源交叉验证）/ `medium`（单一来源）/ `low`（推测，证据不足）/ `none`（纯猜测） |
| `evidence` | array | 证据列表 |
| `status` | enum | `pending` → `verified` / `challenged` / `rejected`（Challenger 更新） |
| `note` | string? | troubleshooter 自注 |
| `challengerNote` | string? | Challenger 审查备注 |

### Evidence 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `source` | string | 文件路径 + 可选 section anchor（如 `research/research.md#Microsoft Learn`） |
| `excerpt` | string | 来源中支持 claim 的具体段落/数据 |
| `sourceType` | enum | `kusto-result` / `official-doc` / `ado-wiki` / `onenote-team` / `onenote-personal` / `product-skill` / `customer-statement` / `icm-data` / `web-search` |
| `url` | string? | 外部链接（official-doc、ado-wiki 等） |

### overallConfidence 计算规则

```
if (all claims high) → "high"
else if (any claim none) → "low"
else if (any claim low) → "low"
else → "medium"
```

### triggerChallenge 规则

```
triggerChallenge = claims.some(c => c.confidence === 'low' || c.confidence === 'none')
```

## 2. Troubleshooter 改造

### 新增 Step 5a: 证据链提取

在现有 Step 5（写分析报告）之后执行：

1. 从刚写好的 `analysis.md` 中提取每个关键技术判断
2. 为每个 claim 标注 `confidence` + `evidence` 引用
3. 写入 `{caseDir}/claims.json`
4. 计算 `triggerChallenge`

**提取规则**：
- 「分析结论」section 中的每个根因判断 → `type: root-cause`
- 支撑根因的因果链条 → `type: cause-chain`
- 「建议方案」section 中的每个建议 → `type: recommendation`
- 对客户环境的重要观察 → `type: observation`
- 影响范围判断 → `type: impact`

**诚实自评约束**（写入 prompt）：
> "对于无法找到文档支撑的推断，confidence 必须标为 low 或 none。标为 high 但实际无据是最严重的错误——Challenger 会发现并打回整个分析。诚实标注 low 不是失败，是负责任的行为。"

### 写入日志

```
[YYYY-MM-DD HH:MM:SS] STEP 5a OK | claims extracted: N total, H high, M medium, L low, N none | triggerChallenge={true|false}
```

## 3. Challenger Agent

### Agent 定义

```yaml
# .claude/agents/challenger.md
---
name: challenger
description: "证据链审计 — 审查 troubleshooter 分析的事实依据"
tools: Bash, Read, Write, Glob, Grep, WebSearch
model: opus
mcpServers:
  - msft-learn
  - local-rag
maxTurns: 20
---
```

**MCP 配置**：
- `msft-learn` — 验证官方文档引用、搜索新证据
- `local-rag` — 搜索 OneNote 团队知识库

**不配置**：kusto MCP（Challenger 不做新查询，只验证已有结论）

### 执行步骤

#### Step 1. 加载事实上下文（建立独立判断基线）

只读事实源文件：
- `{caseDir}/case-info.md` — 客户问题原始描述
- `{caseDir}/emails.md` — 客户自述和沟通历史
- `{caseDir}/kusto/*.md` — 原始 Kusto 查询结果
- `{caseDir}/research/research.md` — 引用的知识源
- `{caseDir}/teams/*.md` — Teams 沟通记录（如有）
- `{caseDir}/onenote/personal-notes.md` — 个人笔记（如有）
- `skills/products/{product}/SKILL.md` — 产品排查知识
- `skills/products/{product}/known-issues.jsonl` — 已知问题

#### Step 2. 加载待审查对象

- `{caseDir}/claims.json` — 结构化声明
- `{caseDir}/analysis/{latest}.md` — 全文分析报告

#### Step 3. 结构化声明审计

对 claims.json 中每个 claim 执行检查矩阵：

| 检查项 | 方法 | 适用 confidence |
|--------|------|----------------|
| 引用存在性 | evidence 中每个 source 文件是否存在、excerpt 是否可在文件中找到 | all |
| 引用准确性 | source 内容是否真的支持 claim（非断章取义） | all |
| 文档时效性 | official-doc 类 source 用 msft-learn MCP 验证是否仍有效 | high, medium |
| 21v 适用性 | 引用的 global doc/TSG 是否适用于 21v China Cloud | all |
| 交叉验证 | high confidence 的 claim 是否有 ≥2 个独立证据 | high |
| 逻辑一致性 | claim 之间是否有矛盾 | all |

#### Step 4. 隐性推断扫描

扫描 analysis.md 全文，识别**未被提取为 claim** 的推断语句：
- 含 "可能"、"应该是"、"推测"、"most likely"、"probably"、"suggests that" 等词的断言
- 跨步骤的因果链接（"因为 A 所以 B"）中 A 未被验证
- 未标注来源的技术事实陈述

每个隐性推断 → 补充到 claims.json，type 根据内容分类，confidence: `low`，status: `challenged`。

#### Step 5. 独立证据搜索

对 `confidence: low/none` 或 `status: challenged` 的 claim：

1. **msft-learn MCP** — 搜索 `"{产品名} {claim 关键词}"` 官方文档
2. **local-rag** — 搜索 OneNote 团队知识库
3. **product skill** — 读取 `skills/products/{product}/known-issues.jsonl`
4. **WebSearch** — 搜索公开资料（最后手段）

根据搜索结果：
- 找到支撑证据 → 升级 confidence + 补充 evidence + status: `verified`
- 找到矛盾证据 → status: `rejected` + challengerNote 记录矛盾点
- 未找到任何证据 → status 维持 `challenged` + challengerNote 说明搜索范围

#### Step 6. 产出

**6a. 更新 claims.json**

更新每个 claim 的 `status` 和 `challengerNote`，如有新增 claim 则 append。

**6b. 写 challenge-report.md**

位置：`{caseDir}/challenge-report.md`

```markdown
# Challenge Report — {caseNumber}

> Reviewed: {analysis file name}
> Reviewed at: {timestamp}
> Product: {product}

## 审查摘要
- 总 claims: {n}（原始 {m} + 新发现隐性推断 {k}）
- ✅ Verified: {n} | ⚠️ Challenged: {n} | ❌ Rejected: {n}

## 详细审查

### ✅ C1: {claim text}
- **原始 confidence**: high
- **审查结果**: 证据充分，{n} 个独立来源确认
- **补充发现**: {如有新增证据}

### ⚠️ C2: {claim text}
- **原始 confidence**: low
- **审查结果**: 未找到官方文档确认
- **搜索范围**: msft-learn "{query1}", "{query2}"; OneNote MCVKB "{query3}"
- **建议**: 向客户确认 {具体问题}

### ❌ C3: {claim text}
- **原始 confidence**: medium
- **审查结果**: 与官方文档矛盾
- **矛盾点**: {文档说 X，claim 说 Y}
- **正确信息**: {从文档中找到的正确说法 + 链接}

### ⚠️ C4 [隐性推断]: {从 analysis.md 中发现的未标注推断}
- **来源**: analysis.md 第 X 段
- **审查结果**: 无证据支撑
- **建议**: {补充调查方向}

## 需要的额外信息
- [ ] {需要向客户确认的问题1}
- [ ] {需要向客户确认的问题2}

## 建议替代方向
- {如现有分析方向被推翻，建议尝试的新方向}
```

#### Step 7. 触发后续动作

读取更新后的 claims.json 统计：

```
rejected_count = claims.filter(c => c.status === 'rejected').length
challenged_count = claims.filter(c => c.status === 'challenged').length
info_needed = challenge-report.md 中 "需要的额外信息" 列表
```

| 条件 | 动作 | 说明 |
|------|------|------|
| rejected=0, challenged=0 | 返回 `ACTION:pass` | 全部通过 |
| rejected=0, challenged>0, info_needed 非空 | 返回 `ACTION:request-info` | 有不确定且需客户信息 |
| rejected=0, challenged>0, info_needed 为空 | 返回 `ACTION:pass` | 有不确定但无需额外信息（证据链薄弱但无矛盾，可继续） |
| rejected>0, retryCount=0 | 返回 `ACTION:retry` | 有被推翻的结论，重试 |
| rejected>0, retryCount≥1 | 返回 `ACTION:escalate` | 重试后仍失败，升级 |

Challenger agent 在日志和返回值中包含 ACTION 标记，由 Main Agent 读取后执行。

### 日志规范

写入 `{caseDir}/logs/challenger.log`：

```
[YYYY-MM-DD HH:MM:SS] === challenger START ===
[YYYY-MM-DD HH:MM:SS] CLAIMS | total=5, high=2, medium=1, low=1, none=1
[YYYY-MM-DD HH:MM:SS] VERIFY C1 | source exists, excerpt matches → verified
[YYYY-MM-DD HH:MM:SS] VERIFY C2 | no official doc found → challenged
[YYYY-MM-DD HH:MM:SS] SCAN | implicit claim found in analysis.md para 3 → added as C6
[YYYY-MM-DD HH:MM:SS] SEARCH | msft-learn "AKS 1.28 PSS default": 2 results, none confirms → C2 remains challenged
[YYYY-MM-DD HH:MM:SS] RESULT | verified=3, challenged=2, rejected=0, implicit=1
[YYYY-MM-DD HH:MM:SS] ACTION | request-info (2 items needed from customer)
[YYYY-MM-DD HH:MM:SS] === challenger END ===
```

## 4. Casework 流程集成

### B5a. Challenge Gate（新步骤）

在 B5 路由完成 troubleshooter 后插入：

```
Main Agent 读取 {caseDir}/claims.json:
  triggerChallenge === false → 跳过，直接到 email-drafter
  triggerChallenge === true  → spawn challenger agent（前台等待）
```

Spawn 配置：
```
subagent_type: "challenger"
description: "challenge {caseNumber}"
run_in_background: false
prompt: |
  Case {caseNumber}，caseDir={caseDir}（绝对路径）。
  产品域：{product}（从 case-info.md serviceTree 推断）。
  请先读取 .claude/agents/challenger.md 获取完整执行步骤，然后执行。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_challenge_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_challenge_end"
```

### B5b. Auto-loop 逻辑

Challenger 返回后，Main Agent 解析 ACTION：

| ACTION | 执行 |
|--------|------|
| （无 / 全部 verified） | → email-drafter（正常邮件类型） |
| `request-info` | → email-drafter（emailType: request-info，prompt 附带 challenge-report 中的"需要的额外信息"） |
| `retry` | → 更新 claims.json retryCount=1 → spawn troubleshooter retry → 回到 B5a |
| `escalate` | → email-drafter request-info + 写 Todo 🔴 "分析证据不足，已重试仍无法确认" |

### Troubleshooter Retry 模式

Retry spawn prompt：
```
⚠️ 这是 Challenger 打回后的重新排查（retry #{retryCount}）。
请先读取 {caseDir}/challenge-report.md 了解被打回的原因。
被 reject 的 claims:
{rejected claims id + claim 文本列表}

要求：
1. 不要沿用之前被 reject 的分析方向
2. 参考 challenge-report.md 的"建议替代方向"
3. 对新结论必须提供明确的证据引用（claims.json Step 5a）
4. 如果确实无法找到证据，诚实标注 confidence: none
```

Retry 后的 troubleshooter 会产出**新的** analysis.md（文件名含新时间戳，不覆盖旧文件）和更新 claims.json（retryCount 已递增，旧 claims 保留但 status 可能变化），再次进入 B5a Challenge Gate。

## 5. case-summary.md 保护

### inspection-writer 改造

Step 2b（增量追加「关键发现」）增加 claims.json 感知：

**前置检查**：读取 `{caseDir}/claims.json`（如存在）

**写入规则**：

| claim status | 写入 case-summary 的方式 |
|--------------|------------------------|
| `verified` | 正常写入 |
| `challenged` | 加 `[unverified]` 前缀 |
| `rejected` | **不写入** |
| `pending` | 正常写入（向后兼容，未触发 Challenger 的场景） |

**示例**：
```markdown
## 关键发现
- 子问题 1 (403)：缺少 Monitoring Metrics Publisher 数据平面角色 → 已解决
- [unverified] 升级到 1.28 后 PSS 默认从 warn 变为 enforce — 需客户确认配置差异
```

**清理机制**：当后续 casework 中 claim 从 `challenged` 变为 `verified` 或 `rejected` 时：
- `verified` → 移除 `[unverified]` 前缀
- `rejected` → 从 summary 中删除该条目

## 6. Email Drafter 集成

### 上下文读取扩展

email-drafter Step 1（读取上下文）新增：
- `{caseDir}/claims.json`（如存在）
- `{caseDir}/challenge-report.md`（如存在）

### 写作规则扩展

| claim status | 邮件中的表达方式 |
|--------------|----------------|
| `verified` | 自信引用：确定性语气 |
| `challenged` | 试探性语气：如 "Based on our initial analysis, it appears..." |
| `rejected` | **不写入邮件** |
| `pending` | 按原有逻辑（向后兼容） |

### Auto-loop request-info 模式

当由 auto-loop 触发进入 request-info 模式时，email-drafter 的 prompt 额外包含：

```
Challenger 审查发现以下分析结论证据不足，需要向客户收集更多信息：
{从 challenge-report.md "需要的额外信息" section 提取}

请生成一封 request-info 邮件：
- 语气自然，不要暴露内部审查流程
- 将技术问题转化为客户容易回答的具体问题
- 焦点：收集能验证或推翻待定结论的具体信息
```

## 7. `/challenge` 独立 Skill

### Skill 定义

```yaml
# .claude/skills/challenge/SKILL.md
---
name: challenge
displayName: 证据链审查
description: "手动触发 Challenger 审查 troubleshooter 分析的证据链。"
category: agent
stability: experimental
requiredInput: caseNumber
estimatedDuration: 60s
---
```

### 执行逻辑

1. 解析 caseNumber，设置 caseDir
2. 检查 `{caseDir}/claims.json`：
   - 存在 → spawn challenger agent
   - 不存在 → 检查 `{caseDir}/analysis/` 是否有分析报告
     - 有 → 提示用户需先用新版 `/troubleshoot` 重新排查（产出 claims.json）
     - 无 → 提示 "无分析数据可审查"
3. 展示 challenge-report.md 结果

## 8. Dashboard 集成

### Case Detail 新增 "Evidence Chain" Tab

- 读取 `{caseDir}/claims.json`
- 表格展示每个 claim：ID / Claim 文本 / Type / Confidence / Status / Evidence 数量
- 颜色编码：✅ verified (绿) | ⚠️ challenged (橙) | ❌ rejected (红) | ⏳ pending (灰)
- 可展开查看 evidence 详情和 challengerNote

### Challenge Report 查看

- `challenge-report.md` 存在时，显示 "📋 Challenge Report" 按钮
- 点击弹窗显示 markdown 渲染内容

### Todo 集成

auto-loop 产生的 Todo 正常出现在 Todo 列表：
- 🔴 "分析证据不足，已重试仍无法确认 — 请审阅 challenge-report.md"
- 🔴 "需收集更多客户信息以验证分析结论"

## 9. Timing 集成

`casework-timing.sh` 新增可选步骤：

| 步骤 | 说明 |
|------|------|
| `challenge` | Challenger agent 执行时间 |
| `troubleshooterRetry` | Troubleshooter retry 执行时间 |

## 10. 目录 Schema 更新

case-directory.md 新增文件：

| 文件 | 格式 | 写入者 | 说明 |
|------|------|--------|------|
| `claims.json` | JSON | troubleshooter → challenger 更新 | 结构化证据链声明 |
| `challenge-report.md` | Markdown | challenger | 审查报告 |

## 11. 向后兼容

| 场景 | 行为 |
|------|------|
| 现有 case（无 claims.json） | 所有逻辑不变，零影响 |
| 新 case + troubleshooter 全 high confidence | `triggerChallenge: false`，跳过 Challenger，零额外开销 |
| 新 case + 有 low/none confidence claims | 自动触发 Challenger |
| 手动 `/challenge` | 随时可用，无论 triggerChallenge 状态 |
| Dashboard 无 claims.json | Evidence Chain tab 不显示 |
| inspection-writer 无 claims.json | 按原有逻辑写入 summary |
| email-drafter 无 claims.json | 按原有逻辑写邮件 |

## 12. 数据信任分类（Challenger 参考）

Challenger agent prompt 中包含的文件信任分类：

### 事实源（可信，用于验证 claims）

| 文件 | sourceType | 说明 |
|------|-----------|------|
| `case-info.md` | — | D365 系统数据 |
| `emails.md` / `emails-office.md` | `customer-statement` | 客户原话 |
| `notes.md` | — | D365 系统记录 |
| `teams/*.md` | `customer-statement` | 实时沟通记录 |
| `kusto/*.md` | `kusto-result` | 系统遥测数据 |
| `icm/` | `icm-data` | 事件管理系统数据 |
| `attachments/` | — | 客户提供的原始材料 |
| `context/user-inputs.jsonl` | — | 工程师补充的一手信息 |

### 知识源（权威参考，用于验证技术判断）

| 来源 | sourceType | 可信度 |
|------|-----------|--------|
| Microsoft Learn | `official-doc` | 最高（但需注意 global vs 21v 差异） |
| ADO Wiki / TSG | `ado-wiki` | 高（但可能过时） |
| OneNote 团队知识库 | `onenote-team` | 高（但需注意 modified 日期） |
| Product SKILL.md | `product-skill` | 高（项目内维护） |
| known-issues.jsonl | `product-skill` | 中（来自历史案例积累） |
| WebSearch | `web-search` | 低（信噪比最低） |

### 推断源（需审查的对象，不能用于自证）

| 文件 | 说明 |
|------|------|
| `analysis/*.md` | troubleshooter 分析报告 |
| `drafts/*.md` | email-drafter 邮件草稿 |
| `case-summary.md` | 混合事实+推断的摘要 |
| `onenote/personal-notes.md` 中的 CLI 分析 | 可能包含之前 AI 分析的结论 |

## 13. 改动清单

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `.claude/agents/troubleshooter.md` | 修改 | 新增 Step 5a 证据链提取 |
| `.claude/agents/challenger.md` | 新建 | Challenger agent 定义 |
| `.claude/agents/email-drafter.md` | 修改 | 新增 claims.json 感知 |
| `.claude/skills/casework/SKILL.md` | 修改 | B5a Challenge Gate + B5b auto-loop |
| `.claude/skills/challenge/SKILL.md` | 新建 | 独立 /challenge 命令 |
| `.claude/skills/inspection-writer/SKILL.md` | 修改 | case-summary [unverified] 标注 |
| `playbooks/schemas/case-directory.md` | 修改 | 新增 claims.json + challenge-report.md |
| `playbooks/schemas/claims-schema.md` | 新建 | claims.json 完整 schema 文档 |
| Dashboard（前端） | 修改 | Evidence Chain tab + Challenge Report 弹窗 |
| `skills/d365-case-ops/scripts/casework-timing.sh` | 修改 | 新增 challenge + retry 步骤 |
