# Purview 产品排查 Skill

> 覆盖 Microsoft Purview：Azure RMS 加密/解密、敏感度标签 (MIP)、DLP。

## 1. 诊断层级

```
Layer 1: Azure RMS
  ├─ 关键表: IFxRequestLogEvent, IFxScenarioLogEvent, IFxTrace (azrms)
  └─ 用途: RMS 加密/解密/授权请求追踪

Layer 2: ESTS (认证)
  ├─ 关键表: PerRequestTableIfx, DiagnosticTracesIfx (ESTS)
  └─ 用途: RMS 认证链路
```

## 2. 决策树

### 文档加密/解密失败
```
RMS 操作失败
  ├─→ azrms 查 IFxRequestLogEvent → 请求追踪
  ├─→ azrms 查 IFxScenarioLogEvent → 场景级日志
  ├─→ 如果是认证问题 → ESTS 查 PerRequestTableIfx
  └─→ ADO Wiki: "RMS {errorCode}"
```

## 3. 可用工具链

- **Kusto**: `skills/kusto/purview/` (2 DB: azrms, ESTS)
- **msft-learn**: Purview/RMS 文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| 无法打开加密文件 | License 获取失败 | 检查 RMS service URL 和认证 |
| 标签无法同步 | Policy sync 超时 | 检查 MIP SDK 版本 |

---

## Knowledge Base Assets

> Auto-enriched from 5 sources: ADO Wiki, MS Learn, OneNote, ContentIdea KB, 21V Gap Analysis.
> Last synthesized: 2026-04-07

### Directory Structure

```
skills/products/purview/
  known-issues.jsonl          643 entries (structured break/fix triples)
  guides/
    _index.md                 Topic index (42 topics)
    {topic-slug}.md           42 speed-reference tables (symptom/cause/solution + scores)
    details/{topic-slug}.md   42 fusion troubleshooting guides (full KQL + decision trees)
    drafts/*.md               269 raw extraction drafts (source material, do not delete)
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

- New knowledge: `/product-learn add purview` or auto-enriched via `/product-learn auto-enrich`
- Re-synthesize after significant new entries: `/product-learn synthesize purview`
- Promote high-confidence entries to this SKILL.md: `/product-learn promote purview`
