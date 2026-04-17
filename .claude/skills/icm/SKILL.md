---
name: icm
displayName: ICM
category: inline
stability: stable
description: "ICM 操作：discussion（抓取 timeline）、summary（获取 AI 摘要，HTTP 模式）、fill（从 case 数据生成 + 浏览器填写）。"
allowed-tools:
  - Bash
  - Read
  - Write
  - mcp__playwright__browser_navigate
  - mcp__playwright__browser_evaluate
  - mcp__playwright__browser_run_code
  - mcp__playwright__browser_click
  - mcp__playwright__browser_type
  - mcp__playwright__browser_wait_for
---

# /icm — ICM 操作

合并 icm-discussion + agency-icm + icm-fill 为单一 skill，三种子命令。

## 子命令

### /icm discussion {incidentId} [--case-dir {dir}]

抓取 ICM incident 的完整 discussion timeline。详见 `discussion-rules.md`。

### /icm summary {incidentId}

获取 incident AI 摘要/详情。通过 agency HTTP proxy 调用（非 MCP 模式）。详见 `summary-rules.md`。

### /icm fill {caseNumber} [--draft-only]

从 case 数据自动生成 ICM 内容，可选浏览器自动填写。详见 `fill-rules.md`。
