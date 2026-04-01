---
name: onenote-search
displayName: OneNote 搜索
category: inline
stability: stable
description: "搜索已导出的 OneNote Markdown 知识库。ripgrep 精确搜索 + 向量语义搜索混合模式，支持中英文。"
allowed-tools:
  - Read
  - Glob
  - Grep
  - mcp__local-rag__query_documents
---

# /onenote-search — 搜索 OneNote 知识库（混合模式）

搜索通过 `/onenote-export` 导出的 OneNote Markdown 文件。采用 **ripgrep 精确搜索 + 向量语义搜索** 混合模式，精确匹配和模糊语义互补。

## 前置条件

- 已使用 `/onenote-export` 导出至少一个 notebook
- onenote-export 的 config.json 已配置 `outputDir`
- local-rag MCP server 运行中（向量搜索需要）

## 参数

`$ARGUMENTS` = 搜索关键词（必填）

```
/onenote-search container registry proxy
/onenote-search VM 连不上 RDP
/onenote-search error code 0x80070005
/onenote-search AKS image pull failure
```

## 执行步骤

### 0. 参数检查

如果 `$ARGUMENTS` 为空 → 报错提示用法，不继续。

### 1. 读取配置

读取 `.claude/skills/onenote-export/config.json` 获取 `outputDir`。
- **存在** → 用 `outputDir` 作为搜索根目录
- **不存在** → 提示用户先运行 `/onenote-export` 导出 notebook

验证 `outputDir` 目录存在且包含 `.md` 文件（Glob `{outputDir}/**/*.md`）。
如果没有 `.md` 文件 → 提示先导出。

### 2. 理解查询意图

分析用户输入，提炼核心技术概念：
- 产品/服务名称（AKS, VM, ACR, ...）
- 具体问题类型（connectivity, performance, authentication, ...）
- 错误码或关键短语
- 中文/英文混合时识别两种语言的关键词

### 3. 并行双通道搜索

**同时**发起两个搜索通道：

#### 通道 A：ripgrep 精确搜索（关键词匹配）

**A1. LLM 关键词改写**：生成 **3-5 组搜索词变体**：
- 原始关键词
- 英文同义词/缩写（如 "container registry" ↔ "ACR"）
- 中文对应（如 "image pull failure" ↔ "镜像拉取失败"）
- 相关错误码或 URL（如 "mirror.azure.cn"）

**A2. 文件名搜索**：用 `Glob` 搜索文件名包含关键词的 `.md` 文件（高优先级）。

**A3. 内容搜索**：用 `Grep` 搜索 `{outputDir}/` 下所有 `.md` 文件内容（`files_with_matches` 模式）。

#### 通道 B：向量语义搜索（语义匹配）

调用 `mcp__local-rag__query_documents`：
```
query: "{用户原始查询}"
limit: 15
```

向量搜索返回的每条结果包含 `source`（文件路径）和 `score`（0=最相关）。

**⚠️ 如果 local-rag MCP 不可用**（超时/报错），跳过通道 B，仅用通道 A 结果。在报告中提示 "向量搜索不可用，仅显示关键词搜索结果"。

### 4. 结果合并 & 排序

合并两个通道的命中文件，按综合相关性排序：

**评分规则**：
| 信号 | 权重 |
|------|------|
| 文件名命中关键词 | +3 |
| ripgrep 内容命中（多组关键词） | +1 per group |
| 向量搜索命中（score < 0.3） | +3（高相关） |
| 向量搜索命中（0.3 ≤ score < 0.6） | +2（中相关） |
| 向量搜索命中（score ≥ 0.6） | +1（低相关） |
| 两个通道都命中 | +2 bonus |

**去重**：同一文件路径只保留一条，合并两个通道的信号。

取 **top 10** 结果进入下一步。

### 5. 读取 & 摘要

读取 top 5-10 匹配文件：
- 提取 frontmatter（title, created, modified）
- 从文件路径解析 Notebook/Section/Page 信息
- 提取与查询最相关的段落（上下文窗口）
- 生成简短摘要

### 6. 展示结果

**结果表格**：

| # | Notebook | Section | Page | 匹配来源 | 关键词命中 |
|---|----------|---------|------|---------|-----------|
| 1 | ... | ... | ... | 🔍+🧠 | 3/5 组 |
| 2 | ... | ... | ... | 🧠 | — |
| 3 | ... | ... | ... | 🔍 | 2/5 组 |

**匹配来源图标**：
- 🔍 = ripgrep 关键词命中
- 🧠 = 向量语义命中
- 🔍+🧠 = 双通道命中（最可靠）

**命中详情**（每个匹配文件）：
- 文件路径
- 标题（来自 frontmatter）
- 最后修改时间
- 关键内容摘要（2-3 句）
- 匹配到的关键词列表
- 向量 score（如有）

如果无结果 → 提示可能原因：
- 关键词拼写问题
- 该主题可能不在已导出的 notebook 中
- 建议尝试其他关键词

## 路径解析规则

从文件路径提取结构信息：
`{outputDir}/{NotebookName}/{SectionPath}/{PageName}.md`

示例：
`C:\...\OneNote Export\MCVKB\VM+SCIM\=======18. AKS=======\18.7 [AKS] troubleshooting guide for container reg.md`
→ Notebook: `MCVKB`, Section: `VM+SCIM/18. AKS`, Page: `18.7 [AKS] troubleshooting guide...`

Section 名中的 `=======...=======` 装饰符号应在展示时去掉。

## 可移植性

本 skill 与 `onenote-export` 配套：
- ripgrep 搜索：纯 Glob/Grep/Read 工具，无外部依赖
- 向量搜索：依赖 local-rag MCP server（可选，不可用时降级为纯 ripgrep）
- 配置复用 onenote-export 的 config.json（`outputDir`）

分发方式：将 `onenote-export/` + `onenote-search/` 两个目录一起复制到目标项目。向量搜索需要目标项目配置 local-rag MCP。
