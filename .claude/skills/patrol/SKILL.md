---
description: "批量巡检：获取所有活跃 Case 列表，筛选有变化的 Case，逐个执行 casework 流程，汇总 Todo。"
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - Agent
  - mcp__icm__get_incident_details_by_id
  - mcp__icm__get_ai_summary
---

# /patrol — 批量巡检

对所有活跃 Case 执行巡检，生成汇总 Todo。

## 核心原则

**每个 case 的分析/路由/写作步骤必须使用 Agent 工具（独立子进程）处理，禁止在 patrol session 中 inline 执行 casework。**
这确保 patrol session 只保持轻量的调度状态，不会因 case 数据累积导致上下文溢出。

## 架构：预热 → 全并行

通过"阶段 0 预热"一次性解决 Playwright 浏览器互斥问题，之后所有 case 完全并行处理。

```
阶段 0（预热，~15s）:
  ├── check-ir-status-batch.ps1 -SaveMeta     （~3s，批量 IR/FDR/FWR）
  └── warm-dtm-token.ps1                       （~10s，DTM token 预热）

阶段 1（全量并行 casework）:
  ├── Case A: casework（含 data-refresh，自动读 dtm-token-global.json）
  ├── Case B: casework（同上）
  └── Case C: ...
```

### 为什么不再需要串行

- **DTM token 已预热**：`warm-dtm-token.ps1` 将 token 写入 `dtm-token-global.json`，`download-attachments.ps1` 自动优先读取全局缓存，无需 Playwright 导航
- **IR check 已预热**：`check-ir-status-batch.ps1 -SaveMeta` 一次性预填所有 case 的 IR/FDR/FWR meta
- **snapshot/emails/notes**：使用 `page.evaluate(fetch(...))` 不导航页面，跨 case 不冲突

## 执行步骤

1. **读取配置**
   读取 `config.json` 获取 `casesRoot`，计算活跃 case 目录路径。

2. **获取活跃 Case 列表**
   ```
   pwsh -NoProfile -File skills/d365-case-ops/scripts/list-active-cases.ps1 -OutputJson
   ```

3. **筛选需要处理的 Case**
   对每个 case，读取 `{casesRoot}/active/{case-id}/casehealth-meta.json` 的 `lastInspected`。
   满足以下**任一条件**即纳入处理：
   - `lastInspected` 距当前时间超过 24 小时（每日巡检，确保及时发现新邮件、客户长时间未回复等需跟进场景）
   - 无 `casehealth-meta.json` 或无 `lastInspected` 字段（新 case，首次巡检）

   > **设计说明**：不使用 D365 `modifiedon` 作为筛选条件，因为新邮件是独立 Email Activity，不一定更新 Case 实体的 `modifiedon`，会导致漏检。

4. **阶段 0：预热（并行执行，~15s）**

   两个预热任务可并行执行：

   ```bash
   # IR/FDR/FWR 批量预填（~3s）
   pwsh -NoProfile -File skills/d365-case-ops/scripts/check-ir-status-batch.ps1 -SaveMeta -MetaDir {casesRoot}/active

   # DTM token 预热（~10s）
   pwsh -NoProfile -File skills/d365-case-ops/scripts/warm-dtm-token.ps1 -CasesRoot {casesRoot}
   ```

   **关键**：
   - `check-ir-status-batch.ps1` 不依赖 Playwright，可与 `warm-dtm-token.ps1` 并行
   - `warm-dtm-token.ps1` 使用 Playwright 导航 DTM 截获 token → 写入 `$env:TEMP/d365-case-ops-runtime/dtm-token-global.json`
   - 预热完成后，`download-attachments.ps1` 自动优先读取全局缓存，不再需要 Playwright 导航
   - 如果全局 token 缓存仍有效（<50 分钟），`warm-dtm-token.ps1` 会跳过 Playwright，几乎零耗时

5. **阶段 1：全量并行 casework**

   对每个有变化的 case spawn casework agent：

   ```
   Agent({
     prompt: "请读取 .claude/skills/casework/SKILL.md 获取完整执行步骤，对 Case {caseNumber} 执行完整 casework 流程。caseDir: {casesRoot}/active/{caseNumber}/。",
     run_in_background: true
   })
   ```

   - 每个 case 运行在独立上下文中，互不干扰
   - **每个 casework agent 自己完成全流程**（含 data-refresh），无需 `--skip-data-refresh`
   - 附件下载自动使用预热的 DTM token（全局缓存），无 Playwright 浏览器互斥
   - **一次性启动所有 Agent（全量并行）**—— 各 agent 写不同 case 目录，无资源竞争
   - 使用 `TaskOutput` 等待每个 Agent 完成，单个 case 超时 10 分钟则标记并跳过

6. **汇总 Todo**
   等待所有 case 处理完成后，从各 case 的 `todo/` 目录提取最新 Todo 文件
   按 🔴🟡✅ 分级汇总展示

## 注意
- patrol session 只负责：列表获取 → 过滤 → 预热 → 全量并行调度 Agent → 等待 → 读 todo 汇总
- 所有 case 数据的拉取、分析和处理都在阶段 1 的 Agent 子进程中完成
- patrol session **不读取** case-info.md、emails.md 等业务数据

## 串行/并行边界总结
| 操作 | 预热覆盖？ | 必须串行？ |
|------|-----------|-----------|
| DTM token 获取 | ✅ `warm-dtm-token.ps1` 预热 | ❌ 全局缓存，各 case 直接读 |
| IR/FDR/FWR check | ✅ `check-ir-status-batch.ps1` 预填 | ❌ 批量 API 一次完成 |
| snapshot/emails/notes (`page.evaluate(fetch)`) | — | ❌ 页内 JS，不导航 |
| 附件下载 (`download-attachments.ps1`) | ✅ 读全局 token，无 Playwright | ❌ |
| ICM (MCP 调用) | — | ❌ |
| compliance/status/inspection/email 草稿 | — | ❌ |
| Teams 搜索 (MCP 调用) | — | ❌ |
