# Phase 4: mslearn-scan

> **通用规则**（全局约束、双轨提取、JSONL 格式、去重规则）见 `phases/global-constraints.md`

**目标**：穷举 Microsoft Learn 官方 Troubleshoot 文档。

> ⚠️ **范围限定**：只扫描 `support/` 路径下的 troubleshoot 文档（~1000 篇），不扫描产品概念/架构/使用文档（几千篇）。
> 产品文档在 troubleshooter 排查时通过 msft-learn MCP 临时搜索即可，不需要预先入库。

#### 4a. 首次运行 — 从 GitHub toc.yml 构建页面索引

**条件**：`.enrich/scanned-mslearn.json → index` 不存在或为空。

1. **读取 playbooks/product-registry.json** → 取 `podProducts[product].mslearnTocPaths` 数组
   - 为空数组 → 返回 `exhausted: true`（无 toc.yml 映射，退回搜索模式）

2. **对每个 tocPath，下载 toc.yml**：
   ```bash
   curl -s "https://raw.githubusercontent.com/MicrosoftDocs/SupportArticles-docs/main/support/{tocPath}/toc.yml"
   ```

3. **解析 toc.yml**，提取所有 `.md` 引用（`href: xxx.md`），构造完整 URL：
   ```
   https://learn.microsoft.com/en-us/troubleshoot/{tocPath}/{mdFileName}
   ```
   - 跳过外部链接（`href: /azure/...`）——那些是产品文档的交叉引用，不是 troubleshoot 文章
   - 跳过 `.yml` 引用（landing pages）

4. **写入 `.enrich/scanned-mslearn.json → index`**：URL 列表

5. **本 tick 不提取内容**（仅建索引），返回 `{discovered: 0, exhausted: false, summary: "indexed N URLs"}`

#### 4b. 后续运行 — 逐批 fetch 并提取

1. **读取 `.enrich/scanned-mslearn.json`**：
   - `index`：全量 URL 索引
   - `scanned`：已扫描 URL 列表
   - 差集 = 未扫描 URL

2. **取 top 8 未扫描 URL**，对每个 fetch 全文：
   ```
   mcp__msft-learn__microsoft_docs_fetch(url: "{url}")
   ```

3. **双轨提取**（参见全局双轨规则）

4. **21V 标记**：同 ado-wiki-scan 逻辑

5. **去重 → append** `.enrich/known-issues-mslearn.jsonl`：
   ```
   source: "mslearn"
   sourceRef: null
   sourceUrl: "{fullUrl}"
   citeable: true
   confidence: "medium"
   ```

6. **更新 `.enrich/scanned-mslearn.json → scanned`**：append 本次 URL

7. **Append** `.enrich/evolution-log.md`

8. **判断 exhausted**：
   - `mslearn-index` 与 `mslearn` 差集为空 → `exhausted: true`
   - 否则 → `exhausted: false`

#### 4c. Fallback — 搜索模式

如果 `mslearnTocPaths` 为空（无 toc.yml 映射），退回搜索模式补充：
```
mcp__msft-learn__microsoft_docs_search(query: "Azure {product} troubleshoot common issues")
mcp__msft-learn__microsoft_docs_search(query: "Azure {product} error codes")
```
搜索结果同样走 `.enrich/scanned-mslearn.json` 去重和标准提取流程。
搜索模式下无法穷尽，连续 2 轮无新结果 → `exhausted: true`。

---

## 自我链式续跑

**完成提取后，如果 `exhausted === false`，立即 spawn 一个续跑 agent**：

```
Agent(
  description: "enrich {product} from mslearn (chain)",
  run_in_background: true,
  prompt: |
    产品: {product} | 数据源: mslearn | 项目根: {PROJECT_ROOT}
    读取 .claude/skills/product-learn/phases/phase4-mslearn.md 执行。Phase 4b 继续 fetch。
    ⚠️ 写 skills/products/{product}/.enrich/known-issues-mslearn.jsonl, .enrich/scanned-mslearn.json, ID: {product}-mslearn-{seq:03d}
    返回: discovered, deduplicated, exhausted, 摘要(<500bytes)
)
```

**终止条件**：`exhausted === true` → 不 spawn，直接返回结果。
**防爆规则**：每个 agent 只 spawn **1 个**续跑 agent（不分裂）。

