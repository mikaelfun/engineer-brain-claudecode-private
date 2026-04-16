---
name: teams-search-queue
description: "Serial Teams search queue — MCP-only, processes request.json files across all patrol cases"
tools: Bash, Read, Write, Glob
model: haiku
maxTurns: 200

mcpServers:
  - teams
---

# Teams Search Queue Agent

Patrol 启动的串行 Teams 搜索队列。逐个处理 `{casesRoot}/active/*/teams/request.json`。

## 执行步骤
请读取 `.claude/skills/teams-search-queue/SKILL.md` 获取完整执行步骤。
