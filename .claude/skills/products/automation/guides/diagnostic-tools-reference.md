# Automation 诊断工具与参考资源 — 排查速查

**来源数**: 7 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | 需要 CSS Wiki 参考链接用于 Automation 和 Update Management 排查 | — | CSS Wiki / ADO Wiki 参考链接集合，含 AAAP 等关键资源 | 🔵 7.5 — OneNote 文档 | [POD/AUTOMATION/CSS Wiki](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/##%20Troubleshooting/CSS%20Wiki.md) |
| 2 📋 | 需要 Jarvis namespace 和表引用用于 Mooncake Automation 排查 | — | Jarvis ETWAll 等 namespace 和表的完整参考 | 🟢 8 — OneNote 文档 | [POD/AUTOMATION/Jarvis](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/##%20Troubleshooting/Jarvis.md) |
| 3 📋 | 需要通过 Jarvis 查询 job 触发原因（scheduled/manual/webhook） | — | Jarvis 查询模板：按 job ID 查触发类型和来源 | 🟢 8 — OneNote 文档 | [POD/AUTOMATION/Jarvis/Job Trigger](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/##%20Troubleshooting/Jarvis/How%20to%20query%20why%20job%20is%20triggered.md) |
| 4 📋 | 需要 Mooncake Automation Kusto 集群 URL 和访问权限信息 | — | Kusto 集群地址 + OaaSKustoGovUsers 权限组申请流程 | 🟢 8 — OneNote 文档 | [POD/AUTOMATION/Kusto](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/##%20Troubleshooting/Kusto.md) |
| 5 📋 | 需要 Kusto 查询模板用于 Runbook job 排查（状态、错误、sandbox、web 请求） | — | KQL 查询集合：EtwJobStatus / EtwAll / DrawbridgeHostV1 等表 | 🟢 8 — OneNote 文档 | [POD/AUTOMATION/Kusto/Runbook](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/##%20Troubleshooting/Kusto/Runbook.md) |
| 6 | 需要 Automation/AUM 培训计划和实验材料 | — | Foundation(2h) + Hybrid Worker(3h) + Troubleshooting(1h)；AUM: Overview(2h) + Auto Patching(2h) + Troubleshooting(1h)。关键 Wiki: AAAP | 🔵 7.5 — OneNote 文档 | [POD/AUTOMATION/Readiness](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/Readiness%20Content.md) |
| 7 | 需要 Azure Update Manager 升级的 ICM 模板链接 | — | AUM ICM 模板: `https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ja3O2a` | 🔵 7.5 — OneNote 文档 | [POD/AUTOMATION/ICM Template](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/Azure%20Update%20Manager/##%20ICM%20Template.md) |

## 快速排查路径

1. **Jarvis 排查**：确认 Jarvis namespace → 查 ETWAll 定位 sandbox 事件 → 查 job 触发原因 `[来源: OneNote]`
2. **Kusto 排查**：确认集群 URL + 权限 → 使用 KQL 模板查 EtwJobStatus / DrawbridgeHostV1 `[来源: OneNote]`
3. **参考文档**：CSS Wiki / ADO Wiki / AAAP 获取产品组标准 TSG `[来源: OneNote]`
4. **升级 ICM**：AUM 相关升级使用专用 ICM 模板 `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/diagnostic-tools-reference.md#排查流程)
