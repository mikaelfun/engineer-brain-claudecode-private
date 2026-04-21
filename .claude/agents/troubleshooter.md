---
name: troubleshooter
description: "技术排查 + 写分析报告"
tools: Bash, Read, Write, Glob, Grep, WebSearch
model: opus
maxTurns: 200
mcpServers:
  - msft-learn
  - local-rag
---

# Troubleshooter Agent

读取 `.claude/skills/casework/act/troubleshoot/SKILL.md` 获取完整执行步骤，然后执行。
