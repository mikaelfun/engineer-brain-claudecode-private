# ACR 产品排查 Skill

> 覆盖 Azure Container Registry：镜像推拉、认证、限流、ACR Tasks。

## 1. 诊断层级

```
单集群架构
  集群: (见 CSV) / acrprodmc
  关键表: RegistryActivity, RPActivity, BuildHostTrace
           RegistryMasterData, StorageAccountLogs, WorkerServiceActivity
```

## 2. 决策树

### 镜像推拉失败
```
docker push/pull 失败
  ├─→ RegistryActivity → 操作日志
  │     ├─ 401 Unauthorized → 认证问题
  │     │     └─ 检查 ACR admin/token/SP 权限
  │     ├─ 403 Forbidden → IP 限制 / 防火墙
  │     ├─ 429 Too Many Requests → SKU 限流
  │     │     └─ 建议: 升级 SKU (Basic→Standard→Premium)
  │     └─ 5xx → 服务端问题
  ├─→ RPActivity → RP 操作详情
  └─→ msft-learn: "ACR troubleshoot login"
```

### ACR Tasks 构建失败
```
Task 构建失败
  ├─→ BuildHostTrace → 构建日志
  ├─→ WorkerServiceActivity → Worker 状态
  └─→ 检查 Dockerfile 和网络
```

## 3. 可用工具链

- **Kusto**: `.claude/skills/kusto/acr/` (1 DB: acrprodmc, 6 表)
- **msft-learn**: ACR troubleshooting 文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| 401 unauthorized | Token 过期/SP 无权限 | 重新 az acr login / 检查 RBAC |
| 429 rate limit | 超过 SKU 限制 | 升级 SKU / 降低频率 |
| push timeout | 镜像过大 / 网络慢 | 分层构建 / 检查带宽 |

---

## Knowledge Base Assets

> Auto-enriched from 5 sources: ADO Wiki, MS Learn, OneNote, ContentIdea KB, 21V Gap Analysis.
> Last synthesized: 2026-04-07

### Directory Structure

```
.claude/skills/products/acr/
  known-issues.jsonl          109 entries (structured break/fix triples)
  guides/
    _index.md                 Topic index (20 topics)
    {topic-slug}.md           20 speed-reference tables (symptom/cause/solution + scores)
    details/{topic-slug}.md   20 fusion troubleshooting guides (full KQL + decision trees)
    drafts/*.md               25 raw extraction drafts (source material, do not delete)
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

- New knowledge: `/product-learn add acr` or auto-enriched via `/product-learn auto-enrich`
- Re-synthesize after significant new entries: `/product-learn synthesize acr`
- Promote high-confidence entries to this SKILL.md: `/product-learn promote acr`
