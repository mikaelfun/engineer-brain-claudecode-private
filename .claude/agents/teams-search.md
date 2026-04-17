---
name: teams-search
description: "Teams 消息搜索 + 落盘"
tools: Bash, Read, Write
model: sonnet
maxTurns: 200

mcpServers:
  - teams
---

# Teams Search Agent

搜索与 Case 相关的 Teams 消息，落盘到 `{caseDir}/teams/`。

## 执行步骤
请读取 `.claude/skills/teams-search/SKILL.md` 获取完整执行步骤。

## Step 2 增值（已下放）

**Relevance scoring + digest 生成** 由 `teams-digest-writer` subagent（见 `.claude/agents/teams-digest-writer.md`）处理，由 `/casework:assess` 按 `refreshResults.teams.newMessages > 0` 门控 spawn。

本 agent 仅负责 Step 1 落盘：raw → input → 每 chat .md + `_chat-index.json`。
