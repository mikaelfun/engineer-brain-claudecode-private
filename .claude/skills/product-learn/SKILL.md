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

## 路由表

| 子命令 | 路由到 | 简述 |
|--------|--------|------|
| `onenote` | `phases/phase2-onenote.md` | OneNote 团队知识库扫描 |
| `ado-wiki` | `phases/phase3-ado-wiki.md` | ADO Wiki TSG 扫描 |
| `case-review` | `modes/case-review.md` | 归档案例复盘 |
| `promote-case` | `modes/promote-case.md` | Case 增量知识写回 |
| `synthesize` | `modes/synthesize.md` | 综合指南生成 |
| `ado-wiki-blast` | `modes/ado-wiki-blast.md` | ADO Wiki 独立并行扫描 |
| `promote` | `modes/promote.md` | 知识提升到 SKILL.md |
| `auto-enrich` | `modes/auto-enrich.md` | 自动知识富化循环 |
| `add` | 内联（见下方） | 手动添加 known-issue |
| `stats` | 内联（见下方） | 各产品统计概览 |

**调度方式**：读取对应 mode/phase 文件，按其内容执行。

## 通用规则

### known-issues.jsonl 路径
`skills/products/{product}/known-issues.jsonl`

### ID 生成
读取现有条目，找最大序号 +1：`{product}-{seq:03d}`

### 去重
append 前必须检查：
1. 读取已有 `known-issues.jsonl`
2. 对比 `symptom` 和 `rootCause`
3. 如果高度相似（80%+ 关键词重叠）→ 跳过，报告已存在
4. 如果相似但不同角度 → 仍然 append，标注 `relatedTo: "{existing-id}"`

### Evolution Log
每次写入后 append 到 `skills/products/{product}/.enrich/evolution-log.md`：
```
| {date} | {source} | {简述变更} | {case/link} |
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
