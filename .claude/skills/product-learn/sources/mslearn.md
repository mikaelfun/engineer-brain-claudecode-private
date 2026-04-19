# MS Learn Source Adapter

Per-product adapter. Rules reference: `../shared-rules.md`. Scope: Only `support/` path troubleshoot docs.

> ⚠️ **范围限定**：只扫描 `support/` 路径下的 troubleshoot 文档（~1000 篇），不扫描产品概念/架构/使用文档（几千篇）。
> 产品文档在 troubleshooter 排查时通过 msft-learn MCP 临时搜索即可，不需要预先入库。

---

## 4a. 首次运行 — 从 GitHub toc.yml 构建页面索引

**条件**：`.enrich/scanned-mslearn.json → index` 不存在或为空。

1. **读取 playbooks/product-registry.json** → 取 `podProducts[product].mslearnTocPaths` 数组
   - 为空数组 → 返回 `idle: true`（无 toc.yml 映射，退回搜索模式）

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

5. **本 tick 不提取内容**（仅建索引），返回 `{discovered: 0, idle: false, summary: "indexed N URLs"}`

---

## 4b. 后续运行 — 逐批 fetch 并提取

1. **读取 `.enrich/scanned-mslearn.json`**：
   - `index`：全量 URL 索引
   - `scanned`：已扫描 URL 列表
   - 差集 = 未扫描 URL

2. **取 top 8 未扫描 URL**，对每个 fetch 全文：
   ```
   mcp__msft-learn__microsoft_docs_fetch(url: "{url}")
   ```

3. **双轨提取**（参见 `../shared-rules.md` 双轨规则）

4. **21V 标记**：同其他 source adapter 逻辑

5. **去重 → append** `.enrich/known-issues-mslearn.jsonl`：
   ```
   source: "mslearn"
   sourceRef: null
   sourceUrl: "{fullUrl}"
   citeable: true
   confidence: "medium"
   ```

6. **更新 `.enrich/scanned-mslearn.json`**：
   - append 本次 URL 到 `scanned`
   - 更新 `lastRefreshed` 为当前时间戳（ISO 格式），用于 Pre-flight index 刷新判断

7. **Append** `.enrich/evolution-log.md`

8. **判断 idle**：
   - `index` 与 `scanned` 差集为空 → `idle: true`
   - 否则 → `idle: false`

---

## 4c. Fallback — 搜索模式

如果 `mslearnTocPaths` 为空（无 toc.yml 映射），退回搜索模式补充：
```
mcp__msft-learn__microsoft_docs_search(query: "Azure {product} troubleshoot common issues")
mcp__msft-learn__microsoft_docs_search(query: "Azure {product} error codes")
```
搜索结果同样走 `.enrich/scanned-mslearn.json` 去重和标准提取流程。
搜索模式下无法穷尽，连续 2 轮无新结果 → `idle: true`。

---

## Change Detection

> GitHub Commits API 增量刷新 — 检测 MS Learn 文章的**内容更新**（不仅仅是新增文章）。
> toc.yml 只能发现新文章，GitHub Commits API 能发现已有文章的内容修改。
> MS Learn troubleshoot 文档的源仓库：`MicrosoftDocs/SupportArticles-docs`。

**触发条件**：`lastRefreshed` 距今 ≥ 7 天，或手动 reset。

**流程**：

1. **读取 `lastRefreshed`** 从 `.enrich/scanned-mslearn.json`
   - 不存在或为 null → 使用 30 天前的时间戳（首次刷新）

2. **查询 GitHub Commits API**，对每个 `mslearnTocPaths` 路径：
   ```bash
   gh api "repos/MicrosoftDocs/SupportArticles-docs/commits?path=support/{tocPath}&since={lastRefreshed}&per_page=100" \
     --jq '.[].sha' 2>/dev/null
   ```

3. **逐 commit 获取变更文件列表**（最多处理 20 个 commit）：
   ```bash
   gh api "repos/MicrosoftDocs/SupportArticles-docs/commits/{sha}" \
     --jq '.files[] | select(.filename | endswith(".md")) | .filename' 2>/dev/null
   ```

4. **映射 GitHub 路径 → learn.microsoft.com URL**：
   ```
   support/mem/intune/app-management/troubleshoot-google-apps.md
   → https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-management/troubleshoot-google-apps
   ```
   规则：去掉 `support/` 前缀和 `.md` 后缀，加上 `https://learn.microsoft.com/en-us/troubleshoot/` 前缀。
   跳过非 `.md` 文件和非 `support/` 路径的文件。

5. **分类处理**：
   - URL 在 `scanned` 列表中 → **内容更新**：从 `scanned` 中移除（下次 4b 会重新 fetch）
   - URL 不在 `index` 中 → **新文章**：追加到 `index`
   - URL 在 `index` 但不在 `scanned` → 已在待扫描队列，无需处理

6. **同时刷新 toc.yml index**：重新 fetch toc.yml，新 URL 追加到 `index`

7. **更新 `lastRefreshed`** 为当前 ISO 时间戳

8. **如果有变更**（移除了 scanned 条目或新增了 index 条目）→ 重置 source state 为 `"scanning"`

**Rate limit 注意**：
- GitHub API 未认证 60 req/hour，`gh` CLI 已认证可达 5000 req/hour
- 每个 tocPath 1 次 commits 查询 + 每 commit 1 次文件查询
- 控制最多 20 个 commit → 最多 21 次 API 调用/产品/tocPath
- 多产品刷新时串行执行（不并行），避免 rate limit

---

## Idle Condition

当以下条件**同时满足**时，adapter 报告 `idle: true`（无待处理工作）：

1. `index` 与 `scanned` 的差集为空（所有已知 URL 都已扫描）
2. GitHub Commits API 未检测到近期 commit（无内容更新或新文章）

---

## Lifecycle

Orchestrator manages continuation. This adapter does NOT self-chain.
Returns: `{discovered, deduplicated, idle: true/false, summary}`
