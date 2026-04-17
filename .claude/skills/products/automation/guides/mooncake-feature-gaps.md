# Automation Mooncake 功能差异与限制 — 排查速查

**来源数**: 5 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 403 Forbidden 使用 Billing API (Microsoft.Subscription/aliases) 通过 Automation MSI 创建订阅，用户账号同权限却成功 | 请求体中 workload DevTest 不是该 invoice section 的有效 SKU ID，客户只有 skuId 0001 (Production)。403 报错信息具有误导性 | 将 workload 从 DevTest 改为 Production；先调用 ListInvoiceSectionsWithCreateSubscriptionPermission API 确认可用 SKU ID | 🟢 9 — OneNote 实证 | [MCVKB/24.1 Billing API 403](MCVKB/VM+SCIM/======24.%20Billing%20API%20(21v%20Customer%20Agreement)====/24.1%20Received%20403%20forbidden%20when%20using%20billing%20API.md) |
| 2 | ARI (Azure Resource Inventory) Automation Runbook 在 Mooncake 失败，Runtime Environment 选项不存在，Modules 方式导入也失败 | ARI 要求 Runtime Environment 功能，Mooncake 不完全支持；Runbook 内脚本导入模块受环境限制 | 改用本地 PowerShell：`Install-Module AzureResourceInventory` → `Invoke-ARI -TenantID xxx -SubscriptionID xxx -AzureEnvironment AzureChinaCloud` | 🟢 9 — OneNote 实证 | [POD/AUTOMATION/Case Study/ARI](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/##%20Case%20Study/Azure%20Resource%20Inventory.md) |
| 3 | Change Tracking 和 Inventory 在 Mooncake Automation Account 面板中不可见 | Mooncake 的 Change Tracking 仅通过 Security Center FIM 提供，不集成到 Automation Account UX | 使用 Microsoft Defender for Cloud → File Integrity Monitoring (FIM) 访问 Change Tracking 功能（仅支持 Windows/Linux 文件和 Windows 注册表） | 🟢 8 — OneNote 文档 | [POD/AUTOMATION/Feature List and Gap](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/##%20Feature%20releasement%20and%20verification/##%20Feature%20List%20and%20Gap.md) |
| 4 | Modules Gallery 无法从 Mooncake Automation Account 访问；Start/Stop VM 方案和 Event Grid 集成也不可见 | Mooncake 不提供 Modules Gallery、Start/Stop VM 方案（N/A）、Event Grid 集成（GA 但不在 Automation 面板显示） | 模块：手动从 PSGallery 下载后通过 Portal 或 REST API 上传。Start/Stop VM：自建 Runbook。Event Grid：直接通过 Event Grid 服务配置 | 🟢 8 — OneNote 文档 | [POD/AUTOMATION/Feature List and Gap](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/##%20Feature%20releasement%20and%20verification/##%20Feature%20List%20and%20Gap.md) |
| 5 📋 | 需要了解 Public Azure 与 Mooncake 的 Automation 功能差异，包括 AUM v2 发布状态和区域支持 | — | 完整功能差异清单含 AUMv2 区域支持信息 | 🟢 8 — 含融合指南 | [POD/AUTOMATION/Feature List and Gap](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/##%20Feature%20releasement%20and%20verification/##%20Feature%20List%20and%20Gap.md) |

## 快速排查路径

1. 确认客户场景是否涉及 Mooncake 不支持的功能 → 对照功能差异表 `[来源: OneNote]`
2. 如果是 Modules Gallery 不可用 → 手动下载模块并通过 REST API 上传（参考 automation-008 REST API 方法）`[来源: OneNote]`
3. 如果是 Change Tracking 需求 → 引导至 Defender for Cloud FIM `[来源: OneNote]`
4. 如果是 Runtime Environment 相关 → 建议本地 PowerShell 替代方案 `[来源: OneNote]`
5. 如果 Billing API 403 → 检查 workload SKU ID，DevTest 可能不可用 `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/mooncake-feature-gaps.md#排查流程)
