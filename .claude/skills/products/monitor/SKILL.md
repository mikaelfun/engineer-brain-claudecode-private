# Monitor 产品排查 Skill

> 覆盖 Azure Monitor Alerts（Metric/Log/Activity Log）、通知、诊断设置。

## 1. 诊断层级

```
Layer 1: Alert Management
  ├─ 集群: (见 CSV) / AzureAlertsManagement
  ├─ 关键表: requests, exceptions, customEvents, dependencies
  └─ 用途: Alert 处理管道追踪

Layer 2: Insights (诊断设置)
  ├─ 集群: (见 CSV) / azureinsightsmc
  ├─ 关键表: ItemizedQosEvent, Traces-insights
  └─ 用途: 诊断设置操作日志

Layer 3: Log Search Rules
  ├─ 集群: (见 CSV) / LogSearchRule
  ├─ 关键表: LogSearchRuleSliLogs, traces-logsearchrule
  └─ 用途: Scheduled Query Rules 执行日志
```

## 2. 决策树

### Alert 未触发
```
警报应触发但没有
  ├─→ 查 AzureAlertsManagement.requests → Alert 评估记录
  ├─→ 查条件是否满足 → customMetrics / customEvents
  ├─→ 如果是 Log Alert → 查 LogSearchRuleSliLogs → SQR 执行日志
  └─→ msft-learn: "metric alert troubleshoot"
```

### 通知未收到
```
Alert 触发但通知未到
  ├─→ 查 AzureAlertsManagement.dependencies → 通知发送记录
  ├─→ 分析 Action Group 配置
  └─→ 如果是 email → 检查垃圾邮件; webhook → 检查 endpoint
```

## 3. 可用工具链

- **Kusto**: `.claude/skills/kusto/monitor/` (3 DB)
- **msft-learn**: Azure Monitor 文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| Alert 未触发 | 条件未满足/评估延迟 | 检查 metric 粒度和阈值 |
| SQR 报错 | KQL 语法错误/超时 | 检查查询和时间窗口 |
| 通知延迟 | Action Group 限流 | 检查 rate limit |

---

## Knowledge Base Assets

> Auto-enriched from 5 sources: ADO Wiki, MS Learn, OneNote, ContentIdea KB, 21V Gap Analysis.
> Last synthesized: 2026-04-07

### Directory Structure

```
.claude/skills/products/monitor/
  known-issues.jsonl          1209 entries (structured break/fix triples)
  guides/
    _index.md                 Topic index (50 topics)
    {topic-slug}.md           50 speed-reference tables (symptom/cause/solution + scores)
    details/{topic-slug}.md   35 fusion troubleshooting guides (full KQL + decision trees)
    drafts/*.md               819 raw extraction drafts (source material, do not delete)
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

- New knowledge: `/product-learn add monitor` or auto-enriched via `/product-learn auto-enrich`
- Re-synthesize after significant new entries: `/product-learn synthesize monitor`
- Promote high-confidence entries to this SKILL.md: `/product-learn promote monitor`
