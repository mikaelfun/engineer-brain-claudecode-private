# Phase 3: ado-wiki-scan

> **通用规则**（全局约束、双轨提取、JSONL 格式、去重规则）见 `phases/global-constraints.md`

**目标**：从 ADO Wiki 穷举提取 TSG 文档。

> ⚠️ **v2 升级**：从搜索模式（top 20）升级为穷举模式（递归枚举完整 wiki page tree）。
> 产品到 wiki 的映射从 `config.json → podProducts[product].adoWikis` 读取。

---

### ⚠️ codeWiki 内容读取必须用 REST API

**问题**：`az devops wiki page show` 对 codeWiki 类型的 wiki 返回空 content（`"content": ""`），
即使页面在浏览器中有大量内容。只有 projectWiki 能正确返回内容。

**影响范围**：绝大多数产品的 wiki 都是 codeWiki（仅 monitor、disk、arm/AdaptiveCloud、avd/W365 是 projectWiki）。

**解决方案**：所有内容读取统一使用 REST API + `includeContent=true`：

```bash
# 通用内容读取命令（codeWiki + projectWiki 均适用）
MSYS_NO_PATHCONV=1 az rest --method get \
  --url "https://dev.azure.com/{org}/{project}/_apis/wiki/wikis/{wikiName}/pages?path={urlEncodedPath}&includeContent=true&api-version=7.1" \
  --resource "499b84ac-1321-427f-aa17-267ca6975798" \
  --output json
```

返回 JSON 中 `content` 字段即为页面全文（Markdown）。`path` 需 URL encode（空格→`%20`，`&`→`%26` 等）。
wiki 名称可直接使用（无需 wiki ID）。

> 📌 **规则**：本文件中所有「读取页面内容」的操作，都必须使用上述 REST API 方式。
> 禁止使用 `az devops wiki page show --include-content` 读取内容。
> `az devops wiki page show` 仅用于**页面树枚举**（`--recursion full`，不读内容）。

#### 3a. 首次运行 — 构建页面索引

**条件**：`.enrich/scanned-ado-wiki.json → index` 不存在或为空。

1. **读取 config.json** → 取 `podProducts[product].adoWikis` 数组
   - 为空数组 → 返回 `exhausted: true`
   - 每条含 `org`、`project`，可选 `wiki`（wiki 名，默认取该项目第一个 wiki）
   - 可选 `pathScope`：路径前缀数组（如 `["/AKS", "/ACI"]`），只索引这些子树下的叶子页面

2. **对每个 adoWiki 条目，获取完整页面树**：
   ```bash
   pwsh -NoProfile -Command '
     $org = "{org}"; $project = "{project}"; $wikiName = "{wikiName}"
     $pages = az devops invoke --area wiki --resource pages `
       --route-parameters project="$project" wikiIdentifier="$wikiName" `
       --org "https://dev.azure.com/$org" --api-version "7.0" `
       --query-parameters recursionLevel=full --http-method GET -o json 2>$null | ConvertFrom-Json
     # 递归提取所有叶子页面路径
     function Get-Leaves($page) {
       if (-not $page.subPages -or $page.subPages.Count -eq 0) {
         if ($page.path -ne "/") { Write-Output "$($page.path)" }
       }
       foreach ($sub in $page.subPages) { Get-Leaves $sub }
     }
     $prefix = "$org/$project/${wikiName}:"
     Get-Leaves $pages | ForEach-Object { "$prefix$_" } | ConvertTo-Json
   '
   ```

   > **关键**：`Get-Leaves` 返回 wiki 相对路径（如 `/AdminUI`），**必须**拼接
   > `{org}/{project}/{wikiName}:` 前缀构成完整 key（如 `Supportability/Intune/Intune:/AdminUI`）。
   > 遗漏前缀会导致 index 与 scanned 格式不一致，差集计算错误。

   **pathScope 过滤**：如果 config 中有 `pathScope`，只保留路径以 scope 中任一前缀开头的叶子页面。
   注意：pathScope 是 wiki 相对路径（如 `"/AKS"`），需要在拼接前缀**之后**对完整 key 的路径部分过滤：
   ```python
   if pathScope:
       full_keys = [k for k in full_keys if any(k.split(":", 1)[1].startswith(scope) for scope in pathScope)]
   ```

3. **写入 `.enrich/scanned-ado-wiki.json → index`**：
   ```json
   {
     "index": [
       "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/...",
       "Supportability/AzureIaaSVM/AzureIaaSVM:/Announcements/...",
       ...
     ],
     "scanned": []
   }
   ```
   **index 条目格式统一为字符串 key**：`"{org}/{project}/{wikiName}:{path}"`
   scanned 条目使用完全相同的格式（差集计算时直接 set 对比）。
   
   > ⚠️ 禁止使用 dict 格式（`{"org":"...","path":"..."}`）。历史遗留的 dict 格式
   > 在 rebuild-index 时会被自动转换为 string key。

4. **本 tick 不提取内容**（仅建索引），返回 `{discovered: 0, exhausted: false, summary: "indexed N pages"}`

#### 3b-blast. Blast Batch 模式（调度器预分配页面）

**条件**：agent prompt 中包含 `模式: blast-batch` 和 `batchId` 参数。

进入此模式时：
1. **跳过**差集计算（Step 3b.1）和预读（Step 2a）——调度器已完成分页
2. 从 prompt 中的 `pagesToProcess` JSON 数组获取页面列表
3. 逐页读取全文（使用 REST API + `includeContent=true`，见文件顶部说明）
4. 双轨提取（复用 Step 3 的 Track A/B 逻辑）
5. 写入 **batch 隔离文件**（使用下方 Python 模板，禁止自行发明写入方式）：
   - JSONL → `.enrich/known-issues-ado-wiki-{batchId}.jsonl`
   - 扫描记录 → `.enrich/scanned-ado-wiki-{batchId}.json`（仅记录本 batch 处理的页面路径数组）
   - ID 格式 → `{product}-ado-wiki-{batchId}-{seq:03d}`（在 per-batch JSONL 内递增）
   - 草稿前缀 → `guides/drafts/ado-wiki-{batchId}-{title}.md`

   **写入模板**（必须使用此模板，设置 `PYTHONUTF8=1` 防编码问题）：
   ```bash
   PYTHONUTF8=1 python3 -c "
   import json
   # Write JSONL
   entries = [...]  # 构建好的条目列表
   with open('skills/products/{product}/.enrich/known-issues-ado-wiki-{batchId}.jsonl', 'w') as f:
       for e in entries:
           f.write(json.dumps(e, ensure_ascii=True) + '\n')
   # Write scanned
   scanned = [...]  # 已处理的页面路径列表
   with open('skills/products/{product}/.enrich/scanned-ado-wiki-{batchId}.json', 'w') as f:
       f.write(json.dumps(scanned, ensure_ascii=True))
   print(f'Written {len(entries)} entries, {len(scanned)} scanned')
   "
   ```

   > ⚠️ **写入失败自愈规则**：如果 bash/python 写文件连续失败 **2 次**，
   > **立即停止重试**，将已提取的结果以 JSON 格式直接包含在返回的 summary 中，
   > 标注 `"writeStatus": "WRITE_FAILED"`。调度器会在 merge 阶段补写。
   > **绝对禁止**在写入失败后进入重试循环——这会耗尽 token budget 导致 agent 卡死。

6. **❌ 不执行"自我链式续跑"**——由调度器控制下一轮
7. 返回: `{discovered, deduplicated, batchId, pagesProcessed, summary}`

> 如果 prompt 中**没有** `模式: blast-batch`，进入下方标准模式（Step 3b）。

---

#### 3b. 后续运行 — 动态批量读取并提取（标准模式）

1. **读取 `.enrich/scanned-ado-wiki.json`**：
   - `index`：全量页面索引
   - `scanned`：已扫描的路径列表
   - `skipped`：预筛跳过的路径列表（低价值页面，如 Labs/Sandbox/NewsFlash）
   - 差集 = `index` - `scanned` - `skipped` = 未扫描页面

2. **动态批量分配**（避免 token 耗尽）：

   **Step 2a — 预读页面大小（渐进式缓存）**：
   
   检查 `.enrich/scanned-ado-wiki.json → index` 中是否已有 `length` 字段：
   - 已有 length 的页面 → 直接使用缓存值，跳过 API 调用
   - 无 length 的页面 → 取前 20 个，用 REST API 批量获取 content length：
   ```bash
   # 对每个无 length 的页面，用 REST API 获取内容长度
   for path in "${paths[@]}"; do
     encoded_path=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$path'))")
     content_len=$(MSYS_NO_PATHCONV=1 az rest --method get \
       --url "https://dev.azure.com/{org}/{project}/_apis/wiki/wikis/{wikiName}/pages?path=${encoded_path}&includeContent=true&api-version=7.1" \
       --resource "499b84ac-1321-427f-aa17-267ca6975798" \
       --output json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('content','')))" 2>/dev/null || echo "0")
     echo "$path|$content_len"
   done
   ```
   - **缓存写回**：将预读得到的 length 写回 `.enrich/scanned-ado-wiki.json → index` 对应条目
     - index 条目格式从纯字符串 `"org/project/wiki:path"` 升级为对象 `{"path":"...", "length": 1234}`
     - ⚠️ **`path` 字段必须保留完整 key**（含 `{org}/{project}/{wikiName}:` 前缀），不能存 wiki 相对路径
     - 升级时直接复用原字符串作为 `path` 值：`{"path": originalStringKey, "length": N}`
     - 向后兼容：如果 index 条目是字符串，视为 length 未知
   - 后续 agent 直接读缓存，无需重复 API 调用

   **Step 2b — 按总字符数凑批**：
   - 从预读结果（缓存 + 新预读）中按顺序累加 `length`
   - **累计 ≤ 15000 字符** → 继续加页面
   - **累计 > 15000** → 停止，本批到此为止
   - **最少 1 页，最多 10 页**
   - length=0 的页面（空/父页面）不计入字符数但计入批次

   **Step 2c — 逐页读取全文**：只读 Step 2b 选中的页面，**不截取内容**，读取完整全文
   ```bash
   # 使用 REST API 读取内容（codeWiki + projectWiki 通用）
   encoded_path=$(python3 -c "import urllib.parse; print(urllib.parse.quote('{pagePath}'))")
   MSYS_NO_PATHCONV=1 az rest --method get \
     --url "https://dev.azure.com/{org}/{project}/_apis/wiki/wikis/{wikiName}/pages?path=${encoded_path}&includeContent=true&api-version=7.1" \
     --resource "499b84ac-1321-427f-aa17-267ca6975798" \
     --output json 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin).get('content',''))"
   ```
   - **不截取**——动态分配已确保总字符量在 agent token 预算内
   - content 为空 → 跳过（父页面），仍标记已扫描
   - ⚠️ **禁止使用 `az devops wiki page show --include-content`**——codeWiki 类型会返回空内容

   **预读失败的 Fallback**：如果 REST API 调用失败，退回固定 3 页/批模式（不截取）。

3. **内容分类 + 双轨处理**

   对每页内容，LLM 先判断类型（一次 prompt 同时完成分类和提取）：

   **Track A — Break/Fix 型**（有明确的错误现象 + 原因 + 解决方案）：
   - 提取 symptom/rootCause/solution 三元组（一页可出 0-5 条）
   - 去重 → append `.enrich/known-issues-ado-wiki.jsonl`
   - 标准 JSONL 条目格式

   **Track B — 排查指南型**（决策树、多步诊断流程、无单一根因、操作手册）：
   - **不提三元组**——直接保存为指南草稿
   - 写入 `skills/products/{product}/guides/drafts/{sanitized-page-title}.md`
   - 草稿格式：
     ```markdown
     ---
     source: ado-wiki
     sourceRef: "{org}/{project}/{wikiName}:{pagePath}"
     sourceUrl: "https://dev.azure.com/..."
     importDate: "YYYY-MM-DD"
     type: troubleshooting-guide
     ---

     {原始 wiki 内容（保留 Markdown 格式）}
     ```
   - 在 `.enrich/known-issues-ado-wiki.jsonl` 中写一条**指引条目**（不含具体解决方案，指向草稿）：
     ```json
     {
       "id": "{product}-{seq}",
       "symptom": "{从标题和摘要提取的关键症状描述}",
       "rootCause": null,
       "solution": "见排查指南: guides/drafts/{filename}.md",
       "source": "ado-wiki",
       "sourceRef": "{org}/{project}/{wikiName}:{pagePath}",
       "confidence": "medium",
       "quality": "guide-draft",
       "tags": ["troubleshooting-guide"]
     }
     ```

   **分类判断提示词**（供 LLM 使用）：
   > 这篇文档是 Break/Fix 型（有明确错误 → 原因 → 修复）还是排查指南型（决策树、多步诊断、无单一根因）？
   > - 如果能提取出至少一组完整的 symptom + (rootCause 或 solution) → Track A
   > - 如果整篇是分支排查流程、操作手册、参考表 → Track B

   **SYNTHESIZE 阶段的变化**：
   - 聚类时扫描 `guides/drafts/` 目录
   - 如果某 topic 既有三元组又有草稿指南 → 合并：三元组的 rootCause/solution 补充到草稿指南的对应 section
   - 纯草稿指南 → 清洗格式后直接升级为正式指南（从 `drafts/` 移到 `guides/`）

4. **21V 标记**：读取 `21v-gaps.json`
   - solution 涉及 unsupported feature → 添加 tag `"21v-unsupported"`
   - 设 `21vApplicable: false`

5. **去重 → append** `skills/products/{product}/known-issues.jsonl`（主 JSONL，非 .enrich/ 临时文件）：
   - 去重对比：读取主 JSONL 已有条目的 `symptom[:100]+rootCause[:100]` 指纹，>80% 重叠则跳过
   ```
   source: "ado-wiki"
   sourceRef: "{org}/{project}/{wikiName}:{pagePath}"
   sourceUrl: "https://dev.azure.com/{org}/{project}/_wiki/wikis/{wikiName}?pagePath={urlEncodedPath}"
   id: "{product}-ado-wiki-{seq:04d}"  (seq 从主 JSONL 已有最大 ado-wiki seq+1 开始)
   ```
   
   > ⚠️ **标准模式直接写主 JSONL**。不再写 `.enrich/known-issues-ado-wiki.jsonl` 临时文件。
   > Blast 模式仍写 per-batch 临时文件（由调度器 merge 到主 JSONL）。
   > **并发安全**：标准模式为自链式单 agent 运行（无并发）；blast 模式通过 per-batch 文件隔离；
   > 两种模式通过 `adoWikiBlast` 标记互斥，不会同时写主 JSONL。

6. **更新 `.enrich/scanned-ado-wiki.json → scanned`**：append 本次处理的路径
   - **关键：scanned 条目必须使用完整 key 格式**：`"{org}/{project}/{wikiName}:{pagePath}"`
   - 与 index 中的 key 格式一致（计算 unscanned 差集时用 key 对比）
   - 同时确保 JSONL 条目的 `sourceRef` 也使用相同格式
   - **原子性**：先写 scanned，再写 JSONL/draft，确保不会出现"有内容但未标记扫描"的脏状态
   - **必须使用 `PYTHONUTF8=1 python3`** 写文件，`ensure_ascii=True` 防编码问题
   
   > ⚠️ **写入失败自愈规则**（适用于所有模式）：如果 bash/python 写文件连续失败 **2 次**，
   > **立即停止重试**，将已提取的结果以 JSON 格式直接包含在返回的 summary 中，
   > 标注 `"writeStatus": "WRITE_FAILED"`。
   > **绝对禁止**在写入失败后进入重试循环——这会耗尽 token budget 导致 agent 卡死。

7. **Append** `.enrich/evolution-log.md`

8. **判断 exhausted**：
   - `.enrich/scanned-ado-wiki.json` 的 `index` 与 (`scanned` ∪ `skipped`) 差集为空 → `exhausted: true`
   - 否则 → `exhausted: false`

#### 3c. Fallback — 搜索模式

如果 `adoWikis` 为空但仍需扫描（如 msazure org 有零散相关 wiki），可通过 `ado-search.ps1` 补充：
```bash
pwsh -NoProfile -File scripts/ado-search.ps1 -Type wiki -Query "{product} troubleshooting" -Org msazure -Top 20
```
搜索结果同样走 `.enrich/scanned-ado-wiki.json` 去重和标准提取流程。

---

## 自我链式续跑

> **Blast Batch 模式下**：不 spawn 续跑 agent，直接返回结果（由 blast 调度器控制下一轮）。
> 以下仅适用于**标准模式**（非 blast-batch）。

**完成提取后，如果 `exhausted === false`，立即 spawn 一个续跑 agent**：

```
Agent(
  description: "enrich {product} from ado-wiki (chain)",
  run_in_background: true,
  prompt: |
    产品: {product} | 数据源: ado-wiki | 项目根: {PROJECT_ROOT}
    读取 .claude/skills/product-learn/phases/phase3-ado-wiki.md 执行。
    ⚠️ 写 skills/products/{product}/.enrich/known-issues-ado-wiki.jsonl, .enrich/scanned-ado-wiki.json, ID: {product}-ado-wiki-{seq:03d}
    config: adoWikis={adoWikis配置}
    返回: discovered, deduplicated, exhausted, 摘要(<500bytes)
)
```

**终止条件**：`exhausted === true` → 不 spawn，直接返回结果。
**防爆规则**：每个 agent 只 spawn **1 个**续跑 agent（不分裂）。

