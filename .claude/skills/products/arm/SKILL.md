# ARM 产品排查 Skill

> 覆盖 Azure Resource Manager 层问题：请求追踪、部署、限流、活动日志。

## 1. 诊断层级

```
单层架构 — ARM 是所有 Azure 操作的入口
  集群: armmcadx.chinaeast2 / armmc
  关键表: HttpIncomingRequests, EventServiceEntries, ClientRequests
           Deployments, DeploymentOperations, JobOperations
```

## 2. 决策树

### 429 Throttling
```
客户遇到 429
  ├─→ HttpIncomingRequests by subscription → 确认请求量
  ├─→ ClientRequests → 客户端请求详情
  ├─→ 分析 throttle 类型（subscription-level / tenant-level / RP-level）
  └─→ 建议: 降低请求频率 / 分批 / 使用 async 模式
```

### 部署失败
```
ARM 部署失败
  ├─→ Deployments → 部署概览
  ├─→ DeploymentOperations → 逐操作详情
  ├─→ JobOperations / JobErrors → 异步 job 状态
  └─→ 如果是 RP 返回错误 → 转对应产品 skill
```

## 3. 可用工具链

- **Kusto**: `.claude/skills/kusto/arm/` (1 DB: armmc, 14 表)
- **ADO Wiki**: org=msazure, "ARM throttling", "deployment failure"
- **msft-learn**: ARM 部署文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| 429 TooManyRequests | 超过 ARM rate limit | 降低请求频率，使用 retry-after |
| DeploymentFailed | 模板错误或 RP 错误 | 查 DeploymentOperations 定位具体资源 |
| SubscriptionNotRegistered | 未注册 RP | `az provider register --namespace xxx` |

---

## Knowledge Base Assets

> Auto-enriched from 5 sources: ADO Wiki, MS Learn, OneNote, ContentIdea KB, 21V Gap Analysis.
> Last synthesized: 2026-04-07

### Directory Structure

```
.claude/skills/products/arm/
  known-issues.jsonl          508 entries (structured break/fix triples)
  guides/
    _index.md                 Topic index (60 topics)
    {topic-slug}.md           60 speed-reference tables (symptom/cause/solution + scores)
    details/{topic-slug}.md   39 fusion troubleshooting guides (full KQL + decision trees)
    drafts/*.md               335 raw extraction drafts (source material, do not delete)
    conflict-report.md        Cross-source contradiction report
  .enrich/                    Enrichment state (progress, scanned records, evolution log)
```

### How to Use

**Troubleshooter Integration (Step 1.5)**:
1. Read `guides/_index.md` to find matching topic by symptom keywords
2. Read the speed-reference `guides/{topic}.md` for quick symptom-cause-solution lookup
3. If the topic has a fusion guide, read `guides/details/{topic}.md` for full KQL queries and decision trees
4. Fallback to `known-issues.jsonl` keyword search if no topic matches
5. Final fallback: RAG / MS Learn search

**Score Legend** (in speed-reference tables):
| Score | Icon | Meaning |
|-------|------|---------|
| 8-10  | Green circle  | Directly trustworthy |
| 5-7.9 | Blue circle  | Reference, verify key steps |
| 3-4.9 | Yellow circle  | Directional only |
| 0-2.9 | White circle  | Possibly outdated |

**Source Priority**: OneNote(5) > ADO Wiki(4) > ContentIdea KB(3) > MS Learn(2) > Case(1)

### Maintenance

- New knowledge: `/product-learn add arm` or auto-enriched via `/product-learn auto-enrich`
- Re-synthesize after significant new entries: `/product-learn synthesize arm`
- Promote high-confidence entries to this SKILL.md: `/product-learn promote arm`
