# Intune 产品排查 Skill

> 覆盖 Microsoft Intune：设备注册、策略部署、应用管理 (MAM/MDM)、合规检查。

## 1. 诊断层级

```
Layer 1: Intune Service
  ├─ 集群: (见 CSV) / intune
  ├─ 关键表: IntuneOperation, IntuneEvent, IntuneScenarioHealth
  │           DeviceLifecycle, DeviceManagementProvider, CMService
  └─ 用途: 设备管理操作追踪

Layer 2: Directory (MSODS)
  ├─ 关键表: IfxAuditLoggingCommon
  └─ 用途: 审计和授权日志
```

## 2. 决策树

### 设备注册失败
```
注册失败
  ├─→ IntuneOperation → 注册操作日志
  ├─→ DeviceLifecycle → 设备生命周期事件
  ├─→ IOSEnrollmentService → (iOS 特定)
  └─→ msft-learn: "Intune enrollment troubleshoot"
```

### 策略/应用部署失败
```
部署失败
  ├─→ IntuneEvent → 部署事件
  ├─→ CMService → 配置管理详情
  ├─→ DownloadService → 应用下载失败原因
  └─→ ADO Wiki: "Intune {errorCode}"
```

## 3. 可用工具链

- **Kusto**: `skills/kusto/intune/` (2 DB: intune, MSODS)
- **msft-learn**: Intune troubleshooting 文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| 0x80180026 | 设备已达注册上限 | 增加 enrollment limit |
| App install stuck | 下载超时 | 检查网络/CDN 可达性 |
| Policy conflict | 多策略冲突 | 检查策略优先级 |

---

## Knowledge Base Assets

> Auto-enriched from 5 sources: ADO Wiki, MS Learn, OneNote, ContentIdea KB, 21V Gap Analysis.
> Last synthesized: 2026-04-07

### Directory Structure

```
skills/products/intune/
  known-issues.jsonl          1522 entries (structured break/fix triples)
  guides/
    _index.md                 Topic index (49 topics)
    {topic-slug}.md           49 speed-reference tables (symptom/cause/solution + scores)
    details/{topic-slug}.md   49 fusion troubleshooting guides (full KQL + decision trees)
    drafts/*.md               342 raw extraction drafts (source material, do not delete)
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

- New knowledge: `/product-learn add intune` or auto-enriched via `/product-learn auto-enrich`
- Re-synthesize after significant new entries: `/product-learn synthesize intune`
- Promote high-confidence entries to this SKILL.md: `/product-learn promote intune`
