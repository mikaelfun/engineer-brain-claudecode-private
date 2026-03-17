---
description: "批量巡检：获取所有活跃 Case 列表，筛选有变化的 Case，逐个执行 casework 流程，汇总 Todo。"
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - Agent
  - Skill
  - mcp__teams__SearchTeamsMessages
  - mcp__teams__ListChatMessages
  - mcp__icm__get_incident_details_by_id
  - mcp__icm__get_ai_summary
---

# /patrol — 批量巡检

对所有活跃 Case 执行巡检，生成汇总 Todo。

## 执行步骤

1. **获取活跃 Case 列表**
   ```
   pwsh -NoProfile -File skills/d365-case-ops/scripts/list-active-cases.ps1 -OutputJson
   ```

2. **对比变化**
   对每个 case，读取 `{casesRoot}/active/{case-id}/casehealth-meta.json` 的 `lastInspected`
   与 D365 的 `modifiedon` 对比，筛选出有变化的 case

3. **逐个处理**（上限 3 个并行）
   对每个有变化的 case 使用 casework skill 处理

4. **汇总 Todo**
   从各 case 的 `todo/` 目录提取最新 Todo 文件
   按 🔴🟡✅ 分级汇总展示

## 注意
- 读取 `config.json` 获取 `casesRoot`
- 无变化的 case 跳过处理
- 处理超时（单个 case > 5 分钟）→ 标记并跳过
