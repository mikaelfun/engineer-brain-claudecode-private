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

## 参数

- `$ARGUMENTS` — 子命令 + 产品 + 可选参数
  - `/product-learn onenote vm` — 从 OneNote 扫描 VM 相关知识
  - `/product-learn ado-wiki aks` — 从 ADO Wiki 扫描 AKS TSG
  - `/product-learn case-review vm` — 复盘归档的 VM 案例
  - `/product-learn case-review 2603100030005863` — 复盘指定案例
  - `/product-learn add vm` — 手动添加一条 known-issue
  - `/product-learn synthesize vm` — 手动触发指南综合生成
  - `/product-learn promote vm` — 查看候选提升条目
  - `/product-learn promote-case {caseNumber}` — 从已解决 Case 的关单邮件+分析报告提取增量知识写回 product skill
  - `/product-learn stats` — 各产品知识积累统计
  - `/product-learn auto-enrich` — 自动富化（双层并行：多产品 × 多 source 同时扫描）
  - `/product-learn auto-enrich status` — 查看并行进度（所有 activeProducts 的 source 状态）
  - `/product-learn auto-enrich reset` — 重置所有自动富化状态
  - `/product-learn auto-enrich reset --reset-source {source}` — 仅重置指定来源的扫描记录（如 `onenote`、`ado-wiki`）
  - `/product-learn auto-enrich skip` — 跳过指定产品或所有 activeProducts
  - `/product-learn ado-wiki-blast {product}` — ADO Wiki 独立并行扫描（3 batch 并行，与 auto-enrich 互斥）
  - `/product-learn ado-wiki-blast {product} status` — 查看 blast 进度
  - `/product-learn ado-wiki-blast all` — 对所有 ado-wiki 未完成的产品执行

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

## 子命令详解

### onenote — OneNote 团队知识库扫描

```
/product-learn onenote {product} [搜索主题]
```

**执行步骤**:

1. **确定搜索词**
   - 产品关键词（从 `skills/products/{product}/SKILL.md` 的已知问题表提取）
   - 常见错误码
   - 可选：用户指定的搜索主题
   
2. **RAG 搜索**
   对每组搜索词调用 `mcp__local-rag__query_documents`：
   ```
   query: "{product} {keyword} 已知问题 workaround"
   limit: 10
   ```

3. **提取知识三元组**
   从每个搜索结果中提取：
   - symptom: 什么症状/错误
   - rootCause: 为什么发生
   - solution: 怎么解决
   
4. **去重 + append**
   - 与现有 known-issues.jsonl 去重
   - 新条目 append，`source: "onenote"`, `sourceRef: "{page-name}"`

5. **输出报告**
   - 搜索了多少页
   - 发现了几条新知识
   - 跳过了几条重复

### ado-wiki — ADO Wiki TSG 扫描

```
/product-learn ado-wiki {product} [搜索主题]
```

**执行步骤**:

1. **搜索 ADO Wiki**
   ```bash
   pwsh -NoProfile -File scripts/ado-search.ps1 \
     -Type wiki -Query "{product} known issue" -Org msazure -Top 10
   ```
   
   多轮搜索：
   - Round 1: `"{product} known issue"`
   - Round 2: `"{product} TSG mitigation"`
   - Round 3: `"{product} {常见错误码}"` (从 SKILL.md 已知问题表提取)

2. **读取 Wiki 页面**
   对高相关结果，用 `az devops wiki page show` 读取全文

3. **提取知识三元组**
   从 Wiki 内容中提取 symptom/rootCause/solution

4. **去重 + append**
   `source: "ado-wiki"`, `sourceRef: "{wiki-url}"`

### case-review — 归档案例复盘

```
/product-learn case-review {product}          # 扫描该产品所有归档案例
/product-learn case-review {caseNumber}       # 复盘指定案例
```

**执行步骤**:

1. **确定案例列表**
   - 如果指定 caseNumber → 读 `cases/active/{caseNumber}/` 或 `cases/archived/{caseNumber}/`
   - 如果指定 product → 扫描所有归档案例，按 case-info.md 中的产品域过滤
   
2. **对每个案例读取**:
   - `context/case-summary.md` — 问题概述和关键发现
   - `emails.md` — 最后几封邮件（特别是 closure email 中的解决方案）
   - `analysis/*.md` — 排查报告中的根因和发现
   - `casehealth-meta.json` — 案例状态

3. **提取学习点**
   从每个案例中提取：
   - **根因**: 从 analysis report 的"分析结论"部分
   - **解决方案**: 从 closure email 或 case-summary 的"后续步骤"
   - **客户困惑点**: 从 emails.md 中客户的反复提问（文档改进信号）
   - **有效的 Kusto 查询**: 从 `kusto/*.md` 中产出结果的查询

4. **去重 + append**
   `source: "email-review"`, `sourceRef: "{caseNumber}"`

5. **特别关注**:
   - 反复出现的问题（跨多个案例的相同 symptom）→ confidence = high
   - 客户困惑点 → tag: `["docs-improvement"]`
   - 有效的临时 Kusto 查询 → 建议保存为 kusto 查询模板

### promote-case — Case 增量知识写回

```
/product-learn promote-case {caseNumber}
```

从已解决 Case 的关单邮件和分析报告中，提取**product skill 中尚未覆盖**的增量知识。

**核心原则**：只写回 delta。如果 case 分析本身就是从 product skill 读出来的知识去解决的，则无新增价值，跳过。

**执行步骤**:

1. **定位 Case 目录**
   搜索 `cases/active/{caseNumber}` 或 `cases/archived/{caseNumber}`

2. **确定产品域**
   从 `case-info.md` 的 SAP 服务路径或 matchKeywords 匹配产品（同 troubleshooter Step 1.5）

3. **读取 Case 数据**（两个来源合并）

   **来源 A — 关单邮件（三元组 ground truth）**：
   - 读取 `emails.md`，定位最后一封 closure/summary 类型邮件
   - 识别特征：主题含 "closure" / "summary" / "resolved" / "关闭" / "解决"，或最后一封发给客户的邮件
   - 从关单邮件提取：
     - `symptom`: 客户原始问题描述
     - `rootCause`: 确认的根本原因
     - `solution`: 实际解决方案（客户验证过的）

   **来源 B — 分析报告（排查路径补充）**：
   - 读取 `analysis/*.md` 和 `kusto/*.md`
   - 提取分析中使用的有效排查步骤、Kusto 查询
   - 这些**不是三元组**，而是潜在的 draft 素材

4. **Delta 检测 — 与已有知识对比**
   - 读取 `skills/products/{product}/guides/_index.md`（如存在）
   - 读取 `skills/products/{product}/known-issues.jsonl`
   - 对比提取的三元组与已有条目：
     - `symptom` + `rootCause` 高度相似（>80% 关键词重叠）→ 已存在，标记 `[已有]`
     - 部分相似但有新角度 → 标记 `[补充]`
     - 全新 → 标记 `[新增]`

5. **展示 Delta 给用户确认**
   
   ```
   === Case {caseNumber} 增量知识提取 ===
   产品: {product}
   
   ## 三元组（来自关单邮件）
   
   [新增] symptom: VM 备份失败，错误码 UserErrorBCMURLConfiguredIncorrectly
         rootCause: 客户的 Vault 配置了自定义 DNS 但未添加 Backup 服务的 private endpoint
         solution: 添加 privatelink.backup.windowsazure.cn 的 DNS 记录和对应的 private endpoint
   
   [已有] symptom: Backup extension timeout
         → 与 vm-016 重复，跳过
   
   ## 排查路径（来自分析报告）
   
   [新增] 有效 Kusto 查询: MABKustoProd 查 BCMBackupStats 按 VaultId 过滤
         → 建议保存为 draft
   
   确认写入？([Y]es / [E]dit / [S]kip)
   ```

6. **用户确认后写入**

   **三元组 → known-issues.jsonl**：
   ```json
   {
     "id": "{product}-{seq}",
     "date": "YYYY-MM-DD",
     "symptom": "...",
     "rootCause": "...",
     "solution": "...",
     "source": "case-delta",
     "sourceRef": "{caseNumber}",
     "product": "{product}",
     "confidence": "high",
     "promoted": false,
     "tags": [...]
   }
   ```
   - `source: "case-delta"` — 区别于自动扫描的 `"case"`
   - `confidence: "high"` — 人工确认 + 客户验证过

   **排查路径 → guides/drafts/**（如有新的排查步骤/Kusto 查询）：
   ```
   guides/drafts/case-{caseNumber}-{topic}.md
   ```
   frontmatter: `source: case-delta`, `sourceRef: {caseNumber}`, `type: troubleshooting-guide`
   对应 JSONL 条目加 `quality: "guide-draft"`, `solution` 引用 draft 路径

7. **记录 evolution-log**
   ```
   | {date} | case-delta | Case {caseNumber}: {简述新发现} | {caseNumber} |
   ```

**跳过条件**：
- Case 目录不存在或无 emails.md → 报错退出
- 关单邮件不存在（case 未关闭）→ 警告，仅从 analysis 提取
- 所有提取的三元组都与已有知识重复 → 报告「无新增知识」，不写入

### add — 手动添加

```
/product-learn add {product}
```

**执行步骤**:

1. **交互收集**
   询问用户：
   - symptom: 什么症状？
   - rootCause: 根本原因是什么？
   - solution: 解决方案是什么？
   - tags: 标签（可选）
   
2. **构建条目**
   ```json
   {"id":"{product}-{seq}","date":"YYYY-MM-DD","symptom":"...","rootCause":"...","solution":"...","source":"manual","product":"{product}","confidence":"high","promoted":false}
   ```

3. **去重 + append**

### synthesize — 手动综合生成

```
/product-learn synthesize {product}
```

将 `known-issues.jsonl` 中积累的知识点聚类、过滤，生成结构化的 Markdown 排查指南。

**执行步骤**:

1. **读取知识库**
   读取 `skills/products/{product}/known-issues.jsonl`，加载全量条目。

2. **主题聚类**
   按 `symptom` 关键词 + `tags` 自动分组，合并同主题条目（如 "AllocationFailed"、"scale-out-stuck" 等聚为独立 topic）。

3. **质量过滤**
   - 丢弃 `confidence: "low"` 且无 `promoted: true` 的孤立条目
   - 保留有 `relatedTo` 关联链或多来源佐证的条目
   - 保留所有 `promoted: true` 条目

4. **生成指南文件**
   每个 topic 生成一个 Markdown 文件：
   ```
   skills/products/{product}/guides/{topic}.md
   ```
   格式：
   ```markdown
   # {topic} 排查指南
   ## 症状
   ## 根因分析
   ## 排查步骤
   ## 已知解决方案
   ## 参考来源
   ```

5. **更新索引**
   写入 `skills/products/{product}/guides/_index.md`，列出所有 topic 及一句话摘要，供 troubleshooter 快速匹配。

6. **审计日志**
   Append 到 `skills/products/{product}/.enrich/synthesize-log.md`：
   ```
   | {date} | {product} | {topic-count} topics | {entry-count} entries → {guide-count} guides |
   ```

**路由实现**：

```
Read(".claude/skills/product-learn/modes/auto-enrich.md")
```

执行其中 **SYNTHESIZE** 阶段的逻辑（subargs = `synthesize {product}`）。

### ado-wiki-blast — ADO Wiki 独立并行扫描

```
/product-learn ado-wiki-blast {product}          # 启动一轮 3-batch 并行扫描
/product-learn ado-wiki-blast {product} status    # 查看 blast 进度
/product-learn ado-wiki-blast all                 # 对所有 ado-wiki 未完成的产品执行
```

**路由实现**：

```
Read(".claude/skills/product-learn/modes/ado-wiki-blast.md")
```

按读到的内容执行。与 auto-enrich 互斥——blast 运行时 auto-enrich 跳过 ado-wiki source。

### promote — 知识提升

```
/product-learn promote {product}
```

**执行步骤**:

1. **读取 known-issues.jsonl**
   筛选 `promoted: false` 且 `confidence: "high"` 的条目

2. **展示候选列表**
   按 symptom 分组，显示出现次数和来源

3. **用户选择**
   用户确认哪些要提升到 SKILL.md

4. **提升执行**
   - 追加到 SKILL.md 的已知问题表
   - 如果发现新的排查路径 → 建议更新决策树
   - 标记 `promoted: true`

### stats — 统计概览

```
/product-learn stats
```

**执行步骤**:

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

troubleshooter agent 在开始排查时，优先检查综合指南；排查完成后执行知识写回：

**排查前（Step 1.5）**：
1. 判断产品域
2. 读取 `skills/products/{product}/guides/_index.md`（若存在）
3. 匹配 symptom 关键词 → 若命中，优先阅读对应 `guides/{topic}.md` 作为排查起点
4. 若 `_index.md` 不存在或无匹配 topic → fallback 到 RAG 搜索 + ms-learn

**排查后（知识写回）**：
1. 从 analysis report 提取发现
2. 判断产品域
3. 构建 known-issue 条目
4. 调用去重逻辑
5. Append 到对应产品的 `known-issues.jsonl`

详见 troubleshooter.md Step 1.5（指南优先）与 Step 6（排查后写回）。

---

## auto-enrich — 自动知识富化循环（v3 双层并行）

```
/product-learn auto-enrich                          # 执行一轮（多产品 × 多 source 并行）
/product-learn auto-enrich status                   # 查看并行进度
/product-learn auto-enrich reset                    # 重置全部状态
/product-learn auto-enrich reset --reset-source onenote   # 仅重置 onenote 扫描记录
/product-learn auto-enrich skip                     # 跳过 activeProducts 或指定产品
/loop 5m /product-learn auto-enrich                 # 持续循环（推荐）
```

**路由实现**：

```
Read(".claude/skills/product-learn/modes/auto-enrich.md")
```

按读到的内容执行。subargs（`status`/`reset`/`reset --reset-source {source}`/`skip`/空）传递给 mode 逻辑。

**架构**：采用 test-supervisor 同款模式——thin router + state 文件 + agent spawn。
每 tick 处理 1 个产品的 1 个阶段，耗尽驱动（无 maxCycles 上限），直到所有来源扫描完毕为止。

**双重产出**：
- `known-issues.jsonl` — 原子知识条目（EXTRACT 阶段产出）
- `guides/{topic}.md` + `guides/_index.md` — 综合排查指南（SYNTHESIZE 阶段产出）

**状态文件**：
- `skills/products/enrich-state.json` — 流水线调度状态（当前产品、当前阶段、队列）
- `skills/products/{product}/.enrich/scanned-sources.json` — 各来源扫描记录（最后扫描时间、条目数、TTL）

**三段流水线（EXTRACT → SYNTHESIZE → REFRESH）**：

1. **EXTRACT** — 知识提取
   - `onenote-tsg-scan` — 从团队 OneNote 提取排查知识（增量：对比 `.enrich/scanned-sources.json` 的上次扫描时间）
   - `ado-wiki-scan` — 穷举 ADO Wiki TSG（递归枚举完整 wiki page tree，从 `config.json → adoWikis` 映射）
   - `mslearn-scan` — 穷举 MS Learn Troubleshoot 文档（从 GitHub toc.yml 索引，只扫 `support/` 路径下的排查文档）
   - `contentidea-kb-scan` — 从 ContentIdea ADO 穷举已发布 KB（结构化字段直接提取，无需 LLM）
   - `case-review-scan` — 自动扫描新归档案例
   - 每个来源扫描完成后更新 `.enrich/scanned-sources.json`

2. **SYNTHESIZE** — 指南综合
   - 当产品的所有 EXTRACT 阶段完成 → 触发 synthesize
   - 执行与 `/product-learn synthesize {product}` 相同的逻辑
   - 生成/更新 `guides/` 目录下的所有指南文件

3. **REFRESH** — 增量刷新钩子
   - OneNote sync hook：若 `onenote-export` 技能触发了新的同步，自动将对应产品重新入队 EXTRACT
   - 已扫描来源按 `.enrich/scanned-sources.json` 中的 TTL 到期后自动重新扫描（默认 30 天）
   - 21v-gap-scan：建立 21V 不支持功能缓存（30 天 TTL）
