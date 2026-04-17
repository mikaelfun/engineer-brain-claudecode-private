# Defender Guest Config 基线 — 排查工作流

**来源草稿**: ado-wiki-a-container-baselines-product-knowledge.md, ado-wiki-a-guest-config-agent-product-knowledge.md, ado-wiki-a-guest-config-baselines-tsg.md, ado-wiki-a-guest-config-security-baselines-support-boundaries.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Overview (Container Baselines Product Knowledge)
> 来源: ado-wiki-a-container-baselines-product-knowledge.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. If a resource has any Baseline row where AnalyzeResult == "Failed" -> then the resource status is "Not Healthy".
2. If a resource has rows in the Baseline table, and for all of them AnalyzeResult == "Success"-> then the resource status is "Healthy".

### Kusto 诊断查询
**查询 1:**
```kusto
SecurityBaseline
| where BaselineType == "Docker"
| where Computer == "<computer name>" 
| summarize arg_max(TimeGenerated, *) by CceId
| where AnalyzeResult == "Failed"
| project
    CceId,
    Description,
    Resource,
    ResourceGroup,
    RuleSeverity,
    ActualResult,
    BaselineType,
    Type,
    SubscriptionId,
    TenantId,
    ResourceId,
    ComputerEnvironment
| order by RuleSeverity asc nulls last
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 2: Guest Configuration Baselines
> 来源: ado-wiki-a-guest-config-agent-product-knowledge.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- the following directories:

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 3: ado-wiki-a-guest-config-baselines-tsg.md
> 来源: ado-wiki-a-guest-config-baselines-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Run a Query on ARG:**
2. **Analyze Query Results:**
3. **Open an Incident with MDC Guardians:** Include these items:
4. **Verify Reporting by Assessors Service:** Update your resource ID and run this query:
5. **Check Modeller Reception:** Run this query if Assessors report matches expectations:

### Portal 导航路径
- the Azure Resource Graph (ARG) for your selected subscription
- an incident with the Guest Configuration team
- an incident with the Guest Configuration team
- an Incident with MDC Guardians:** Include these items:

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 4: [Support Boundaries] - Guest Configuration Security Baselines
> 来源: ado-wiki-a-guest-config-security-baselines-support-boundaries.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---
