# Automation Python SDK 与代码示例 — 排查速查

**来源数**: 3 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | 需要 Python SDK 管理 Azure 资源（告警规则、监控） | — | Python SDK 代码示例：管理 alert rules、monitor 等资源，含 F12 trace 辅助排查 | 🟢 8 — OneNote 文档 | [MCVKB/16.8 Python SDK Azure Resources](MCVKB/VM+SCIM/======16.%20Automation======/16.8[MCVKB][Python%20SDK]Manage%20Azure%20Resources%20via.md) |
| 2 📋 | 需要在 Mooncake 环境使用 Python SDK 入门 | — | Python SDK Mooncake 认证配置 + 入门代码示例 | 🟢 8 — OneNote 文档 | [MCVKB/16.9 Python SDK Getting Started](MCVKB/VM+SCIM/======16.%20Automation======/16.9%20[MCVKB][Python%20SDK]%20How%20to%20start%20with%20Python.md) |
| 3 📋 | 需要从 Automation Runbook 连接和查询 SQL Azure DB 的示例代码 | — | Runbook 中使用 SqlClient 连接 SQL Azure DB，配合 Credential Asset 存储凭据 | 🟢 8 — OneNote 文档 | [POD/AUTOMATION/SQL Azure DB](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/##%20Common%20Code%20Samples/Connect%20and%20Query%20SQL%20Azure%20DB.md) |

## 快速排查路径

1. **Python SDK 入门（Mooncake）**：先配置认证环境 → `AzureChinaCloud` endpoint → 安装 azure SDK 包 `[来源: OneNote]`
2. **管理 Azure 资源**：使用 `azure-mgmt-monitor` 等管理包 → F12 抓 REST API 确认参数 `[来源: OneNote]`
3. **Runbook 连接 SQL Azure**：在 Automation Account 创建 Credential Asset → Runbook 中使用 SqlClient 连接 `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/python-sdk-runbook.md#排查流程)
