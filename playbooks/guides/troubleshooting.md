# 排查指南

从 troubleshooter + researcher agent 提取的领域知识。caseworker 排查问题时读取本文件。

## 排查流程（4 Phase）

### Phase 1：理解问题
- 读取 `case-info.md` + `notes.md` + `emails.md`
- 明确：什么产品、什么操作、什么现象、什么时间、什么环境
- 提炼核心问题（一句话）

### Phase 2：知识调研（先查后验）
按优先级查找已有知识，**不要跳过前面的步骤直接查 Web**：

```
Step 0（强制）：扫描本地知识库（团队共享 KB）
Step 1：搜索 ADO 内部知识源（并行，使用 az devops CLI）
  - ADO-Wiki（内部 TSG / 已知问题）
  - ADO-ContentIdea（内部 KB 文章）
  - ADO-msazure（msazure 项目文档）
  注：通过 az devops invoke --area search 调用，详见 troubleshooter agent 定义
Step 2：搜索外部官方文档
  - Microsoft Learn（通过 microsoftdocs MCP）
Step 3：Web 搜索补充（最后手段）
  - tavily-search / multi-search-engine
```

Step 0 和 Step 1 可并行执行。

### Phase 3：验证分析
根据调研结果，选择验证手段：

- **Kusto 查询**：有平台日志可查时（见 kusto-query-guide.md）
- **日志分析**：客户提供了日志文件时
- **复现测试**：需要实际操作验证时（提供步骤给客户）

### Phase 4：诊断报告
汇总结论，输出到 `${CASES_ROOT}/active/{case-id}/analysis/`：
- 问题原因
- 证据链（哪些日志/查询支撑结论）
- 建议方案
- 不确定的地方标明

## 关键约束

- **最多 3 轮迭代**：查 → 验 → 再查 → 再验 → 结论，防止无限循环
- **独立数据收集可并行**：比如同时查 ADO-Wiki 和 ContentIdea
- **结果忠实**：不编造查询结果，不确定就说不确定
- **缺关键信息时**：写 request-info 邮件向客户追要（参考 email-templates.md）

## 产品 → Kusto Skill 映射

| 产品 | Kusto Skill |
|------|-------------|
| ACR | kusto/acr |
| AKS | kusto/aks |
| ARM | kusto/arm |
| AVD | kusto/avd |
| Disk | kusto/disk |
| Entra-ID | kusto/entra-id |
| Intune | kusto/intune |
| Monitor | kusto/monitor |
| Networking | kusto/networking |
| Purview | kusto/purview |
| VM | kusto/vm |
| EOP | kusto/eop |

## 工具调用方式

- **Kusto 查询**：通过 mcporter → fabric-rti-mcp 执行 KQL
- **文档搜索**：通过 mcporter → microsoftdocs / ADO-Wiki / ADO-ContentIdea / ADO-msazure
- **KB 搜索**：contentidea-kb-search skill
- **Web 搜索**：tavily-search / multi-search-engine

## 排查产出文件

统一存放在 `${CASES_ROOT}/active/{case-id}/` 下：
- `research/` — 知识调研结果
- `analysis/` — 诊断分析报告
- `logs/` — 日志文件
- `kusto/` — Kusto 查询结果
- `drafts/` — 邮件草稿
