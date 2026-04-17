---
name: note-gap-checker
description: "检测单个 Case 的 Note 时间间隔，生成补充 Note 草稿"
tools: Bash, Read, Write
model: haiku
maxTurns: 200

---

# Note Gap Checker Agent

Per-case note gap detection agent.
Read `.claude/skills/casework/note-gap/SKILL.md` for execution steps.
Execute for the given case number and case directory.
