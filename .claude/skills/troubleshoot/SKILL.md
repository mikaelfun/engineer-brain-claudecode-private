---
description: "单独技术排查：对指定 Case 执行 Kusto 诊断、文档搜索等技术分析，输出分析报告。"
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - Agent
  - WebSearch
---

# /troubleshoot — 单独技术排查

对指定 Case 执行单独的技术排查。

## 参数
- `$ARGUMENTS` — Case 编号 + 可选排查主题
  - 示例: `2603100030005863`
  - 示例: `2603100030005863 storage account access denied`

## 执行步骤

1. **读取配置**
   读取 `config.json` 获取 `casesRoot`
   设置 `caseDir = {casesRoot}/active/{caseNumber}/`

2. **确保数据存在**
   如果 `{caseDir}/case-info.md` 不存在：
   - 先执行 `Agent(subagent_type: "data-refresh")` 拉取数据

3. **执行排查**
   `Agent(subagent_type: "troubleshooter")`:
   - prompt 中包含 caseNumber、caseDir、topic（如有）
   - 请先读取 `.claude/agents/troubleshooter.md` 获取完整执行步骤

4. **展示结果**
   读取生成的分析报告
   展示关键发现和建议
