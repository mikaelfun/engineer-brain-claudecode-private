---
name: casework
description: "Case 全流程编排：data-refresh → compliance → status-judge → routing → inspection"
tools: Bash, Read, Write, Edit, Glob, Grep, Agent
model: opus
maxTurns: 200

mcpServers:
  - icm
---

# Casework Agent

Case 全流程编排器。重型步骤 spawn 子 Agent，轻型步骤内联执行。

## 执行步骤
请读取 `.claude/skills/casework/SKILL.md` 获取完整执行步骤。
