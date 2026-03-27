---
name: data-refresh
description: "拉取 Case 最新数据 + ICM 信息"
tools: Bash, Read, Write
model: sonnet
maxTurns: 15
mcpServers:
  - icm
---

# Data Refresh Agent

## 职责
拉取 D365 Case 最新数据（快照 + 邮件 + 笔记 + 附件 + ICM）。

## 输入
- `caseNumber`: Case 编号
- `caseDir`: Case 数据目录路径
- `casesRoot`: Cases 根目录

## 执行
读取 `.claude/skills/data-refresh/SKILL.md` 获取完整执行步骤。

## 限制
- ❌ 不使用 Glob/Grep（无需搜索代码）
- ❌ 不使用 Teams/ADO/Kusto/msft-learn 等 MCP
- ❌ 不执行 D365 写操作
- ✅ 仅使用 Bash（运行 pwsh 脚本）+ Read/Write（读写 case 文件）+ ICM MCP（查询 incident）
