# Automation Mooncake Feature Gaps — 综合排查指南

**条目数**: 5 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-automation-feature-gap.md](../drafts/onenote-automation-feature-gap.md)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 确认功能是否在 Mooncake 可用
> 来源: [MCVKB/.../Feature List and Gap.md](../drafts/onenote-automation-feature-gap.md) + [Mooncake POD Support Notebook](../drafts/onenote-automation-feature-gap.md)

1. 客户报告 Automation Account 中某功能不可见或不可用时，首先对照下方 Feature Matrix 确认该功能在 Mooncake 的 GA 状态。

**Feature Availability Matrix (Public Azure vs Mooncake)**:

| Feature | Sub Feature | Public Azure | Mooncake | 备注 |
|---------|-------------|-------------|----------|------|
| Configuration Management | State Configuration (DSC) | GA | GA | |
| | Change Tracking & Inventory | GA | 仅通过 Security Center FIM | 不在 Automation Account blade |
| Update Management | Update Management (AUMv1) | GA | GA (仅 chinaeast2) | 非 chinaeast2 VM 需关联 chinaeast2 LA workspace |
| | Azure Update Manager (AUMv2) | GA | 部分区域 | 见下方区域表 |
| Process Automation | Runbooks & Jobs | GA | GA | |
| | Runbook Gallery | GA | GA | |
| | Hybrid Worker | GA | GA | |
| Shared Resources | Modules | GA | GA (**无 Modules Gallery**) | 需手动上传 |
| Related Resources | Event Grid | GA | GA 但**不在 Automation Account blade** | 通过 Event Grid 服务直接配置 |
| | Start/Stop VM solution | GA | **N/A** | 需自定义 Runbook |
| Account Settings | Source Control | GA | GA | |
| | Run As Accounts | GA (deprecated) | GA (deprecated) | |

`[结论: 🟢 8.5/10 — OneNote 团队知识库，多条目交叉验证，Mooncake 专属]`

### Phase 2: AUM v2 区域可用性判断
> 来源: [MCVKB/.../Feature List and Gap.md](../drafts/onenote-automation-feature-gap.md)

如果客户问题涉及 Azure Update Manager (AUMv2)，需确认目标区域支持情况：

| Region | Azure VMs | Arc VMs |
|--------|-----------|---------|
| ChinaEast | 支持 | 不支持 |
| ChinaEast2 | 支持 | 支持 |
| ChinaNorth | 支持 | 不支持 |
| ChinaNorth2 | 支持 | 支持 |
| ChinaNorth3 | 支持 (delayed) | TBD |

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| 目标区域支持 Azure VM | 可直接使用 AUMv2 | 按正常流程配置 |
| 目标区域不支持 Arc VM | Arc VM 无法使用 AUMv2 | 建议迁移到 ChinaEast2/ChinaNorth2 或等待区域扩展 |
| 客户使用 AUMv1 非 chinaeast2 | AUMv1 仅 chinaeast2 GA | → Phase 3a |

`[结论: 🟢 8/10 — OneNote 来源，区域信息截至 2024-09]`

### Phase 3a: AUMv1 非 chinaeast2 区域 VM 接入
> 来源: [MCVKB/.../Update management(AUMv1).md](automation-019 相关)

非 chinaeast2 区域 VM 接入 Update Management (AUMv1) 的步骤：
1. 在 chinaeast2 创建 Log Analytics workspace
2. 将目标 VM（如 chinanorth、chinanorth3）关联到 chinaeast2 的 LA workspace
3. 通过 chinaeast2 Automation Account > Update Management > Manage machines 注册 VM
4. VM 可跨区域通过 chinaeast2 Automation Account 管理

### Phase 3b: Modules Gallery 不可用的替代方案
> 来源: [MCVKB/.../Feature List and Gap.md](../drafts/onenote-automation-feature-gap.md) + automation-021

Mooncake Automation Account 无 Modules Gallery，模块导入替代方案：
1. **手动下载**：从 [PowerShell Gallery](https://www.powershellgallery.com/) 下载 `.nupkg` 文件
2. **Portal 上传**：Automation Account > Modules > Add a module > 上传 `.zip`
3. **REST API 上传**：通过 PATCH 方法上传模块（参考 automation-008 的 REST API 方式）
   - 使用 F12 抓包获取 Portal Update Az Modules 的精确 API 调用
   - 使用 MSI 认证

`[结论: 🟢 8.5/10 — OneNote 来源，automation-008 + automation-021 交叉验证]`

### Phase 3c: Change Tracking 替代方案
> 来源: automation-020

Mooncake 中 Change Tracking 不在 Automation Account blade：
1. 打开 **Microsoft Defender for Cloud**
2. 导航至 **File Integrity Monitoring (FIM)**
3. FIM 支持 Windows/Linux 文件 和 Windows 注册表变更跟踪

### Phase 3d: Runtime Environment / ARI 不可用
> 来源: automation-013

Azure Resource Inventory (ARI) 需要 Runtime Environment 功能，Mooncake 不支持：
1. **替代方案**：在本地 PowerShell 运行 ARI（非 Automation Runbook）
   ```powershell
   Install-Module -Name AzureResourceInventory
   Import-Module AzureResourceInventory
   Invoke-ARI -TenantID <tenantId> -SubscriptionID <subId> -AzureEnvironment AzureChinaCloud
   ```
2. 生成 Excel 格式的资源清单报告

`[结论: 🟢 8/10 — OneNote Case Study 来源，单源实证]`

### Phase 3e: Billing API 403 误导性错误
> 来源: automation-009

使用 Managed Identity 调用 Billing API (Microsoft.Subscription/aliases) 创建订阅时返回 403：
1. **真实原因**：请求体中 `workload: DevTest` 不是有效 SKU ID（客户账户仅有 `0001` Production）
2. **排查步骤**：
   - 调用 `ListInvoiceSectionsWithCreateSubscriptionPermission` API 检查可用 SKU ID
   - 确认 `enabledAzurePlans` 中的有效 SKU
3. **修复**：将 workload 从 `DevTest` 改为 `Production`

> 注意：403 错误信息 "insufficient permissions" 具有误导性，实际是 SKU 不匹配

`[结论: 🟢 8.5/10 — OneNote MCVKB 来源，含实际 Case 验证]`

---

## PG 联系方式

| 团队 | 联系人 |
|------|--------|
| Azure Automation | Brian McDermott <bmcder@microsoft.com> |
| Automation PM | Jaspreet Kaur <jaspkaur@microsoft.com> |
| Azure Update Manager | <updatemgmtcenter@microsoft.com>, <aumpm@microsoft.com> |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Billing API 403 Forbidden (Managed Identity) | workload DevTest 非有效 SKU ID，403 信息误导 | 改 workload 为 Production，先查 enabledAzurePlans | 🟢 8.5 — OneNote+Case 验证 | [MCVKB/24.1](../drafts/onenote-automation-feature-gap.md) |
| 2 | ARI Runbook 在 Mooncake 失败 (Runtime Environment 不支持) | Runtime Environment 功能不支持 | 本地 PowerShell 运行 ARI + AzureChinaCloud 参数 | 🟢 8 — OneNote Case Study | [Mooncake POD/ARI](../drafts/onenote-automation-feature-gap.md) |
| 3 | Change Tracking 不在 Automation Account blade | Mooncake 仅通过 Security Center FIM 支持 | Defender for Cloud > FIM | 🟢 8.5 — OneNote+Feature List 交叉 | [Mooncake POD/Feature Gap](../drafts/onenote-automation-feature-gap.md) |
| 4 | Modules Gallery / Start-Stop VM / Event Grid 不可见 | Mooncake Feature Gap | 手动上传模块 / 自定义 Runbook / Event Grid 服务直配 | 🟢 8.5 — OneNote 多源交叉 | [Mooncake POD/Feature Gap](../drafts/onenote-automation-feature-gap.md) |
| 5 📋 | Mooncake Feature Gap 完整矩阵 | — | 见融合指南 Feature Matrix | 🟢 9 — OneNote 综合 | [onenote-automation-feature-gap.md](../drafts/onenote-automation-feature-gap.md) |
