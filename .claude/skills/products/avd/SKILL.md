# AVD 产品排查 Skill

> 覆盖 Azure Virtual Desktop（原 WVD）、Session Host、FSLogix、MSIX App Attach。

## 1. 诊断层级

```
单集群架构
  集群: (见 kusto_clusters.csv) / WVD
  关键表: DiagActivity, DiagError, RDOperation, RDAgentMetadata
           RDClientTrace, HostPool, ShoeboxAgentHealth
```

## 2. 决策树

### 用户无法连接
```
连接失败
  ├─→ DiagActivity → 连接事件追踪
  ├─→ DiagError → 错误详情
  ├─→ RDClientTrace → 客户端日志（RDP 客户端版本等）
  ├─→ 如果 Session Host 不可用 → 查 ShoeboxAgentHealth
  └─→ 如果 RDAgent 异常 → 查 RDAgentMetadata 版本
```

### Session Host 不健康
```
SH 状态异常
  ├─→ ShoeboxAgentHealth → Agent 健康心跳
  ├─→ RDAgentMetadata → Agent 版本和注册状态
  ├─→ 如果 VM 层面问题 → 转 VM 产品 skill
  └─→ msft-learn: "AVD session host troubleshoot"
```

## 3. 可用工具链

- **Kusto**: `.claude/skills/kusto/avd/` (1 DB: WVD, 11 表)
- **ADO Wiki**: "AVD", "WVD", "RDAgent"
- **msft-learn**: AVD troubleshooting 文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| Connection failed 0x3000018 | 网关超时 | 检查 SH 网络和 RDAgent 状态 |
| Agent heartbeat lost | RDAgent crash | 重启 RDAgentBootLoader 服务 |
| FSLogix profile load failure | VHD 无法挂载 | 检查存储权限和网络 |

---

## Knowledge Base Assets

> Auto-enriched from 5 sources: ADO Wiki, MS Learn, OneNote, ContentIdea KB, 21V Gap Analysis.
> Last synthesized: 2026-04-07

### Directory Structure

```
.claude/skills/products/avd/
  known-issues.jsonl          694 entries (structured break/fix triples)
  guides/
    _index.md                 Topic index (71 topics)
    {topic-slug}.md           71 speed-reference tables (symptom/cause/solution + scores)
    details/{topic-slug}.md   71 fusion troubleshooting guides (full KQL + decision trees)
    drafts/*.md               300 raw extraction drafts (source material, do not delete)
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

- New knowledge: `/product-learn add avd` or auto-enriched via `/product-learn auto-enrich`
- Re-synthesize after significant new entries: `/product-learn synthesize avd`
- Promote high-confidence entries to this SKILL.md: `/product-learn promote avd`
