---
description: "搜索已导出的 OneNote Markdown 知识库。ripgrep 精确搜索 + LLM 关键词改写，支持中英文。"
allowed-tools:
  - Read
  - Glob
  - Grep
---

# /onenote-search — 搜索 OneNote 知识库

搜索通过 `/onenote-export` 导出的 OneNote Markdown 文件，快速定位知识库中的相关内容。

## 前置条件

- 已使用 `/onenote-export` 导出至少一个 notebook
- onenote-export 的 config.json 已配置 `outputDir`

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

### 3. LLM 关键词改写

基于查询意图，生成 **3-5 组搜索词变体**：
- 原始关键词
- 英文同义词/缩写（如 "container registry" ↔ "ACR"）
- 中文对应（如 "image pull failure" ↔ "镜像拉取失败"）
- 相关错误码或 URL（如 "mirror.azure.cn"）
- 常见拼写变体

示例输入：`container registry proxy`
改写结果：
1. `container registry proxy`
2. `ACR proxy` / `docker registry mirror`
3. `镜像拉取` / `容器镜像代理`
4. `mirror.azure.cn` / `image pull`
5. `proxy server` / `registry cache`

### 4. 多轮搜索

对每组关键词执行搜索，分两阶段：

**阶段 A：文件名搜索（高优先级）**
用 `Glob` 搜索文件名包含关键词的 `.md` 文件。
文件名命中 = 该页面主题直接相关，优先级最高。

**阶段 B：内容搜索（补充）**
用 `Grep` 搜索 `{outputDir}/` 下所有 `.md` 文件内容。
使用 `files_with_matches` 模式获取匹配文件列表。

**去重 & 排序**：
- 合并所有命中文件
- 按命中关键词组数排序（多组命中 > 单组命中）
- 文件名命中权重 > 内容命中

### 5. 读取 & 摘要

读取 top 5-10 匹配文件：
- 提取 frontmatter（title, created, modified）
- 从文件路径解析 Notebook/Section/Page 信息
- 提取与查询最相关的段落（上下文窗口）
- 生成简短摘要

### 6. 展示结果

**结果表格**：

| # | Notebook | Section | Page | 关键词命中 |
|---|----------|---------|------|-----------|
| 1 | ... | ... | ... | 3/5 组 |

**命中详情**（每个匹配文件）：
- 文件路径
- 标题（来自 frontmatter）
- 最后修改时间
- 关键内容摘要（2-3 句）
- 匹配到的关键词列表

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

本 skill 与 `onenote-export` 配套，可独立于任何项目使用：
- 搜索逻辑全部在 SKILL.md 中定义，无外部脚本依赖
- 配置复用 onenote-export 的 config.json（`outputDir`）
- 纯 Glob/Grep/Read 工具，不依赖特定 MCP server

分发方式：将 `onenote-export/` + `onenote-search/` 两个目录一起复制到目标项目。
