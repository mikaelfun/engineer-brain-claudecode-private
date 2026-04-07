# EOP 产品排查 Skill

> 覆盖 Exchange Online Protection：垃圾邮件、钓鱼、域模拟、邮件头分析。

## 1. 诊断方式

EOP 排查不使用 Kusto MCP，而是通过 **PowerShell 邮件头解析**：

```
工具: skills/kusto/eop/references/decodingspamagentdata.ps1
输入: 邮件头中的 X-MS-Exchange-Organization-SCL 和 X-Forefront-Antispam-Report
输出: 垃圾邮件判定原因分析
```

## 2. 决策树

### 邮件被误判为垃圾邮件
```
邮件到垃圾箱
  ├─→ 解析邮件头 → SCL 分值
  │     ├─ SCL >= 5 → Content Filter 判定
  │     ├─ DIMP → 域模拟检测
  │     ├─ SPOOF → 发件人欺骗检测
  │     └─ PHSH → 钓鱼检测
  ├─→ 检查发件人 SPF/DKIM/DMARC
  └─→ msft-learn: "EOP anti-spam headers"
```

### 邮件未收到
```
邮件丢失
  ├─→ Message Trace（通过 Exchange Admin Center）
  ├─→ 检查 Transport Rules
  └─→ 检查 Connector 配置
```

## 3. 可用工具链

- **PowerShell**: `skills/kusto/eop/references/decodingspamagentdata.ps1`
- **msft-learn**: EOP 邮件头文档
- **Exchange Admin Center**: Message Trace（需客户操作）

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| SCL=9 | Content Filter 高置信度 | 创建 Transport Rule 放行 |
| DIMP | 域模拟攻击检测 | 加 Anti-phishing policy 白名单 |
| SPOOF | 发件人欺骗 | 配置 SPF/DKIM/DMARC |

---

## Knowledge Base Assets

> Auto-enriched from 5 sources: ADO Wiki, MS Learn, OneNote, ContentIdea KB, 21V Gap Analysis.
> Last synthesized: 2026-04-07

### Directory Structure

```
skills/products/eop/
  known-issues.jsonl          288 entries (structured break/fix triples)
  guides/
    _index.md                 Topic index (37 topics)
    {topic-slug}.md           37 speed-reference tables (symptom/cause/solution + scores)
    details/{topic-slug}.md   37 fusion troubleshooting guides (full KQL + decision trees)
    drafts/*.md               109 raw extraction drafts (source material, do not delete)
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

- New knowledge: `/product-learn add eop` or auto-enriched via `/product-learn auto-enrich`
- Re-synthesize after significant new entries: `/product-learn synthesize eop`
- Promote high-confidence entries to this SKILL.md: `/product-learn promote eop`
