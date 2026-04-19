# claims.json Schema

> Version: 2
> Location: `{caseDir}/.casework/claims.json`
> Writers: troubleshooter (creates) → challenger (updates status)
> Consumers: challenger, email-drafter, reassess, summarize, Dashboard

## Overview

Structured evidence chain declarations extracted from troubleshooter analysis reports.
Each claim represents a key technical judgment with confidence level and supporting evidence.

## Root Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | number | yes | Schema version, currently `2` |
| `generatedAt` | string (ISO8601) | yes | When claims were extracted |
| `generatedBy` | string | yes | Always `"troubleshooter"` |
| `analysisRef` | string | yes | Relative path to the analysis.md file (e.g. `analysis/20260402-1030-topic.md`) |
| `overallConfidence` | enum | yes | `"high"` / `"medium"` / `"low"` |
| `triggerChallenge` | boolean | yes | Whether to auto-trigger Challenger agent |
| `retryCount` | number | yes | Troubleshooter retry count, starts at `0` |
| `claims` | array | yes | Array of Claim objects |
| `conclusion` | object | yes | Structured troubleshooter conclusion for reassess consumption |

## Conclusion Object

Structured output from troubleshooter's Step 4c synthesis. Consumed by reassess sub-skill to decide communication action.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | enum | yes | `"found-cause"` / `"need-info"` / `"exhausted"` / `"out-of-scope"` / `"partial"` |
| `summary` | string | yes | 1-3 sentence natural language summary of the conclusion |
| `confidence` | enum | yes | `"high"` / `"medium"` / `"low"` — overall conclusion confidence |
| `suggestedNextAction` | enum | yes | `"email-result"` / `"email-request-info"` / `"escalate-pg"` / `"transfer-pod"` / `"no-action"` |
| `missingInfo` | array[string] | no | Specific information needed from customer (for `need-info` / `partial` types) |
| `scopeAssessment` | enum | yes | `"in-pod"` / `"out-of-scope"` / `"unclear"` |
| `outOfScopeTarget` | string? | no | Target team/POD for transfer (only when `scopeAssessment === "out-of-scope"`) |

### conclusion.type Mapping

| type | Meaning | Typical suggestedNextAction |
|------|---------|----------------------------|
| `found-cause` | Root cause identified | `email-result` |
| `need-info` | Need customer data to verify hypothesis | `email-request-info` |
| `exhausted` | All investigation avenues exhausted, no root cause | `escalate-pg` |
| `out-of-scope` | Problem outside this POD's service scope | `transfer-pod` |
| `partial` | Some findings but investigation incomplete | `email-request-info` |

### overallConfidence Calculation

```
if (all claims confidence === "high") → "high"
else if (any claim confidence === "none") → "low"
else if (any claim confidence === "low") → "low"
else → "medium"
```

### triggerChallenge Calculation

```
triggerChallenge = claims.some(c => c.confidence === "low" || c.confidence === "none")
```

## Claim Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Auto-incrementing: `"C1"`, `"C2"`, ... |
| `claim` | string | yes | Natural language description of the technical judgment |
| `type` | enum | yes | `"root-cause"` / `"cause-chain"` / `"impact"` / `"recommendation"` / `"observation"` |
| `confidence` | enum | yes | `"high"` (multi-source cross-verified) / `"medium"` (single source) / `"low"` (speculative, weak evidence) / `"none"` (pure guess) |
| `evidence` | array | yes | Array of Evidence objects (can be empty for low/none confidence) |
| `status` | enum | yes | `"pending"` → `"verified"` / `"challenged"` / `"rejected"` (updated by Challenger) |
| `note` | string? | no | Troubleshooter's self-annotation |
| `challengerNote` | string? | no | Challenger's review comment |

### Type Mapping from Analysis Report

| Analysis Section | Claim Type |
|------------------|-----------|
| 「分析结论」root cause judgments | `root-cause` |
| Causal chain supporting root cause | `cause-chain` |
| 「建议方案」recommendations | `recommendation` |
| Environmental observations | `observation` |
| Impact scope judgments | `impact` |

## Evidence Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | string | yes | File path relative to caseDir, optionally with `#section` anchor (e.g. `research/research.md#Microsoft Learn`) |
| `excerpt` | string | yes | Specific text from source that supports the claim |
| `sourceType` | enum | yes | See sourceType enum below |
| `url` | string? | no | External URL for `official-doc`, `ado-wiki`, `web-search` types |

### sourceType Enum

| Value | Source | Trust Level |
|-------|--------|-------------|
| `kusto-result` | Kusto query results in `kusto/*.md` | Fact (system telemetry) |
| `official-doc` | Microsoft Learn documentation | Authoritative reference |
| `ado-wiki` | ADO Wiki / TSG pages | High (may be outdated) |
| `onenote-team` | Team OneNote knowledge base | High (check modified date) |
| `onenote-personal` | Personal OneNote notes | Medium (may contain prior AI analysis) |
| `product-skill` | `.claude/skills/products/{product}/SKILL.md` or `known-issues.jsonl` | High (project-maintained) |
| `customer-statement` | Customer emails/Teams messages | Fact (customer's own words) |
| `icm-data` | ICM incident data | Fact (system data) |
| `web-search` | Public web search results | Low (lowest signal-to-noise) |

## Status Transitions

```
pending ──┬──→ verified    (Challenger found supporting evidence)
          ├──→ challenged  (Challenger found no evidence, but no contradiction)
          └──→ rejected    (Challenger found contradicting evidence)
```

Only Challenger updates status. Troubleshooter always writes `"pending"`.

## Example

```json
{
  "version": 2,
  "generatedAt": "2026-04-02T10:30:00+08:00",
  "generatedBy": "troubleshooter",
  "analysisRef": "analysis/20260402-1030-aks-pss-policy.md",
  "overallConfidence": "low",
  "triggerChallenge": true,
  "retryCount": 0,
  "conclusion": {
    "type": "found-cause",
    "summary": "AKS 集群的 Pod Security Standards enforcement 导致 Pod 被 reject，升级到 1.28 后 PSS 默认行为变化",
    "confidence": "medium",
    "suggestedNextAction": "email-result",
    "missingInfo": [],
    "scopeAssessment": "in-pod",
    "outOfScopeTarget": null
  },
  "claims": [
    {
      "id": "C1",
      "claim": "AKS 集群的 Pod Security Standards enforcement 导致 Pod 被 reject",
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
