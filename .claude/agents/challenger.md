---
name: challenger
description: "证据链审计 — 审查 troubleshooter 分析的事实依据"
tools: Bash, Read, Write, Glob, Grep, WebSearch
model: opus
maxTurns: 200
mcpServers:
  - msft-learn
  - local-rag
---

# Challenger Agent

读取 `.claude/skills/casework/act/challenge/SKILL.md` 获取完整执行步骤，然后执行。
