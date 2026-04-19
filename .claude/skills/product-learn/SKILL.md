---
name: product-learn
displayName: 产品学习
category: inline
stability: dev
description: "从案例、OneNote、ADO Wiki、MS Learn、ContentIdea KB 学习新知识，生成综合排查指南，演进产品排查 Skill。触发词：product-learn、学习、知识积累、复盘。"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
  - mcp__local-rag__query_documents
---

# /product-learn — 产品 Skill 知识学习

从多种来源学习新知识，追加到产品 skill 的 `known-issues.jsonl`；并通过综合管线生成 Markdown 排查指南。

> 数据格式规范（JSONL、去重、ID、写入规则）见 shared-rules.md

## 路由表

| 子命令 | 路由到 | 简述 |
|--------|--------|------|
| `auto-enrich` | `orchestrator.md` | Cron 驱动的增量知识富化 |
| `case-review` | `modes/case-review.md` | 归档案例复盘 |
| `promote-case` | `modes/promote-case.md` | Case 增量知识写回 |
| `synthesize` | `synthesis/synthesize.md` | 手动触发综合指南生成 |
| `promote` | `modes/promote.md` | 知识提升到 SKILL.md |
| `ado-wiki rebuild-index` | `sources/ado-wiki.md` | 重建 wiki 页面索引 |
| `add` | 内联（见下方） | 手动添加 known-issue |
| `stats` | 内联（见下方） | 各产品统计概览 |

## 架构概览

```
Orchestrator (orchestrator.md)
  │
  ├── Shared Pool Layer
  │   └── OneNote Router (router/onenote-router.md)
  │
  ├── Per-Product Source Adapters (sources/)
  │   ├── onenote.md    — dual-channel: section mapping + Router
  │   ├── ado-wiki.md   — wiki tree enum, standard + parallel mode
  │   ├── mslearn.md    — toc.yml + GitHub Commits API
  │   └── contentidea.md — WIQL query
  │
  ├── Reference Data (reference/)
  │   └── 21v-gap.md    — Feature Gap cache (not a source)
  │
  └── Synthesis (synthesis/)
      ├── merge.md       — cross-source dedup + ID unification
      └── synthesize.md  — cluster + conflict scan + guide generation
```

---

## 内联子命令

### add — 手动添加

```
/product-learn add {product}
```

1. **交互收集** — 询问用户 symptom / rootCause / solution / tags（可选）
2. **构建条目**
   ```json
   {"id":"{product}-{seq}","date":"YYYY-MM-DD","symptom":"...","rootCause":"...","solution":"...","source":"manual","product":"{product}","confidence":"high","promoted":false}
   ```
3. **去重 + append**

### stats — 统计概览

```
/product-learn stats
```

1. 读取所有产品的 `known-issues.jsonl`
2. 统计：总条目数、按 source 分布、按 confidence 分布、promoted 比例
3. 读取各产品 `guides/_index.md` 统计已生成指南数
4. 展示表格

---

## 搜索词参考

各产品的高频搜索词（用于 onenote/ado-wiki 扫描）：

| 产品 | 搜索词示例 |
|------|-----------|
| vm | AllocationFailed, Service Healing, OSProvisioningTimedOut, VMSS scale out |
| aks | CreateOrUpdate failed, node NotReady, cluster autoscaler, upgrade stuck |
| arm | 429 throttling, deployment failed, SubscriptionNotRegistered |
| networking | VPN tunnel down, ExpressRoute circuit, AppGw 502, NSG flow |
| disk | IO throttling, IOPS limit, disk attach failed, bursting |
| entra-id | AADSTS, conditional access, MFA, sign-in failed |
| avd | connection failed, RDAgent, FSLogix, session host unavailable |
| monitor | alert not fired, notification delayed, SQR error |
| intune | enrollment failed, policy conflict, app install |
| purview | RMS decrypt, sensitivity label, DLP |
| acr | docker push 401, registry login, rate limit 429 |
| eop | SCL, DIMP, SPOOF, spam agent |

---

## 与 Troubleshooter 集成

troubleshooter agent 在开始排查时优先检查综合指南，排查完成后执行知识写回。

**排查前（Step 1.5）**：读取 `guides/_index.md` → 匹配 symptom → 阅读对应指南 → fallback 到 RAG/ms-learn。

**排查后（知识写回）**：提取发现 → 构建条目 → 去重 → append `known-issues.jsonl`。

详见 troubleshooter.md Step 1.5（指南优先）与 Step 6（排查后写回）。
