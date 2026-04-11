---
name: teams-search
description: "Teams 消息搜索 + 落盘"
tools: Bash, Read, Write
model: sonnet
maxTurns: 25
mcpServers:
  - teams
---

# Teams Search Agent

搜索与 Case 相关的 Teams 消息，落盘到 `{caseDir}/teams/`。

## 执行步骤
请读取 `.claude/skills/teams-search/SKILL.md` 获取完整执行步骤。
