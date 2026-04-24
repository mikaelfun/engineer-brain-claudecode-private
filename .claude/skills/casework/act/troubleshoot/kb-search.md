# 知识库搜索（Step 4B — KB 部分）

> 按需加载：主控 SKILL.md 走路径 B 或 Lab 复现后需补充知识库信息时读取。

## 搜索优先级

### 1. OneNote 团队知识库（最高优先级）

读取 `config.json` 获取 `onenote.teamNotebooks[]` 和 `onenote.freshnessThresholdMonths`。
读取 `.claude/skills/onenote/config.json` 获取 `outputDir`。

**关键词生成**（LLM 改写）：
基于问题理解，生成 3-5 组搜索词变体：
- 产品/服务名 + 变体（如 "AKS" / "Kubernetes" / "容器服务"）
- 问题类型（如 "image pull failure" / "镜像拉取失败"）
- 错误码或特定标识符
- 中英文双语覆盖

**搜索范围**：遍历 `teamNotebooks[]` 中每个 notebook 的目录 `{outputDir}/{notebookName}/`。
- 阶段 A：Glob 文件名搜索（高优先级）
- 阶段 B：Grep 内容搜索（补充）
- 去重 & 按命中关键词组数排序

**读取 & 甄别**（top 5-10 匹配文件）：
- 解析 frontmatter `modified` 时间戳
- **时效性判断**：`modified` 距今超过 `freshnessThresholdMonths` 个月 → 标记 `⚠️ 可能过时 — 最后修改 {date}`
- **21v 适用性**：判断知识内容是否适用于 21v China Cloud。判断依据：
  1. **OneNote 内的 feature gap 表格**：团队 notebook 中各产品有对应的 feature gap 表格
  2. **msft-learn 官方文档**：Azure China 文档中有各服务的功能差异说明
  3. 标记 `21v: Partial` 或 `Global-only`
- **相关性**：评估与当前问题的匹配度

如有匹配，还需读取 `{caseDir}/onenote/onenote-digest.md`（如存在），将个人笔记纳入排查上下文。**注意区分 `[fact]`（可直接引用）和 `[analysis]`（需验证）标签**。

### 2. ADO Wiki / Knowledge Base

使用封装脚本 `scripts/ado-search.ps1` 一行调用：

```bash
# Wiki 搜索
pwsh -NoProfile -File scripts/ado-search.ps1 -Type wiki -Query "搜索关键词" -Org msazure

# Code 搜索
pwsh -NoProfile -File scripts/ado-search.ps1 -Type code -Query "关键词" -Org contentidea

# Work Item 搜索
pwsh -NoProfile -File scripts/ado-search.ps1 -Type workitem -Query "关键词" -Org supportability -Top 10
```

参数：`-Type` wiki|code|workitem, `-Query` 关键词, `-Org` 组织名(默认 msazure), `-Top` 返回数(默认 5), `-Profile` az CLI profile(默认 microsoft-fangkun)

**Wiki 页面读取**：
```bash
export AZURE_CONFIG_DIR="$HOME/.azure-profiles/microsoft-fangkun"
az devops wiki page show --wiki "{wikiName}" --project "{project}" \
  --path "{pagePath}" --org "https://dev.azure.com/{org}" --detect false
```

- 参考 `.claude/skills/contentidea-kb-search/SKILL.md` 获取 ContentIdea KB 搜索方法
- ⚠️ Wiki 内容多为 global cloud 视角，用于 21v 时注意 feature gap

### 3. Microsoft Learn / 官方文档

- 使用 msft-learn MCP 搜索官方文档
- 内容权威但偏浅，适合确认基础概念和官方建议

### 4. WebSearch

- 使用 WebSearch 搜索公开资料
- 最广但信噪比最低，用于补充以上来源未覆盖的场景

## Research 引用文件

搜索结果统一保存到 `{caseDir}/research/research.md`（增量更新，去重）。
每条引用标注：`[Applied]`（已采用）| `[Relevant-unused]`（相关但未使用）| `[Background]`（背景参考）

```markdown
# Research References — Case {caseNumber}

> 最后更新：{YYYY-MM-DD HH:MM}

## OneNote 团队知识库
- [{Page Title}]({path}) — {相关性} | Modified: {date} | 21v: {status} | {[Applied]}

## Microsoft Learn / 官方文档
- [文章标题](URL) — 相关性简述 | {[Applied]}

## ADO Wiki / Knowledge Base
- [KB 标题](URL) — 相关性简述 | {[Applied]}

## 其他来源
- [标题](URL) — 相关性简述 | {[Applied]}
```

## 日志

```
[timestamp] STEP 4B-KB OK | sources searched: {N}, matches: {M} applied, {K} unused
```
