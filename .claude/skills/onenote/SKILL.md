---
name: onenote
displayName: OneNote
category: inline
stability: stable
description: "OneNote 笔记本导出 + 搜索。子命令：export（导出/同步 Markdown）、search（ripgrep + 向量语义搜索）。"
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - mcp__local-rag__query_documents
---

# /onenote — OneNote 导出 & 搜索

合并 onenote-export + onenote-search 为单一 skill，三种子命令。

## 子命令

### /onenote export ...

导出/同步 OneNote 笔记本为 Markdown。

参数和完整规则见 `export-rules.md`。

常用调用：
- `/onenote export sync` — 增量同步所有已导出 notebook
- `/onenote export sync "MCVKB"` — 同步指定 notebook
- `/onenote export <onenote-link>` — 从链接自动识别

### /onenote scope [notebook]

查看和管理 notebook 的同步范围（`.export-scope.json`）。

参数和完整规则见 `export-rules.md` 的 "Scope 管理子命令" 章节。

常用调用：
- `/onenote scope` — 列出所有 notebook 的 scope 概览
- `/onenote scope "Mooncake POD Support Notebook"` — 查看指定 notebook 的 scope 详情，交互式增删

### /onenote search <keywords>

搜索已导出的 OneNote Markdown 知识库。ripgrep 精确搜索 + 向量语义搜索混合模式。

参数和完整规则见 `search-rules.md`。

常用调用：
- `/onenote search container registry proxy`
- `/onenote search VM 连不上 RDP`
