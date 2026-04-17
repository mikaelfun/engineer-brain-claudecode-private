# Azure Update Manager (AUM) — 综合排查指南

**条目数**: 11 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-aum-tools.md](../drafts/onenote-aum-tools.md), [onenote-um-to-aum-migration.md](../drafts/onenote-um-to-aum-migration.md), [onenote-definition-updates-check.md](../drafts/onenote-definition-updates-check.md)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 问题分类
> 来源: [MCVKB/OneNote — AUM Tools](../drafts/onenote-aum-tools.md) + [MCVKB/OneNote — Case Study]

1. **确认客户使用的是 AUM (v2) 还是 Update Management (v1)**
   - AUM: Azure Portal > Update Manager（独立服务）
   - UM v1: Automation Account > Update Management（依赖 Log Analytics）
   - 如果是 v1 问题 → 参考 [update-management-v1.md](update-management-v1.md)

2. **确认 Mooncake 区域支持**
   | 区域 | Azure VM | Arc-enabled |
   |------|----------|-------------|
   | ChinaEast | ✅ | ❌ |
   | ChinaEast2 | ✅ | ✅ |
   | ChinaNorth | ✅ | ❌ |
   | ChinaNorth2 | ✅ | ✅ |

3. **Mooncake Portal 链接**（需 feature flag）：
   `https://portal.azure.cn/?Microsoft_Azure_Automation=flight5&Microsoft_Azure_Maintenance=flight1&feature.automationUpdateManagement=true`

**判断逻辑**：
| 问题类型 | 后续动作 |
|---------|---------|
| VM 镜像不受支持 | → Phase 2a |
| Patch orchestration 模式无法更改 | → Phase 2b |
| Windows "updates for other Microsoft products" 被重置 | → Phase 2c |
| Definition updates 版本不一致 | → Phase 2d |
| 从 UM v1 迁移到 AUM v2 | → Phase 3 |
| Windows Update 失败 0x8024402F | → Phase 2e |
| Arc-enabled servers 误导性计费通知 | → Phase 2f |
| Windows Client OS 不受支持 | → Phase 2g |

`[结论: 🟢 9/10 — OneNote Mooncake 一线经验，多来源交叉验证]`

### Phase 2a: VM 镜像不受 AUM 支持
> 来源: [MCVKB/OneNote — TSG]

**症状**：Assessment 或 patching 操作失败或显示 unsupported。

**根因**：VM 镜像不在 AUM 支持列表中。如果 OS 厂商仍然支持该 OS，PG 可能会在请求后添加支持。

**修复流程**：
1. 提交 New Image Request 表单：
   https://forms.microsoft.com/pages/responsepage.aspx?id=v4j5cvGGr0GRqy180BHbR8SQCvBHdBRGmoav-MUl5-hUNjdTUDNRWEI2TkU0Wk1STUNLVzRKREkwMS4u
2. 邮件联系 aumpm@microsoft.com 和 aumeng@microsoft.com，提供 Product/Offer/Sku + 影响 VM 数量
3. 无回应时提 ICM：https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=X1t346

> ⚠️ **不要**为已 EOL 的 OS（如 RHEL 6、CentOS 8）请求支持。

`[结论: 🟢 8.5/10 — OneNote 实证，含 PG 联系方式]`

### Phase 2b: Patch Orchestration 模式无法更改
> 来源: [MCVKB/OneNote — Known Issue]

**症状**：VM 部署后无法在 Portal 中将 patch orchestration 模式更改为 "Manual" 或 "AutomaticByPlatform"。

**根因**：`patchSettings.patchMode` ARM 属性只能在 VM 部署时设置，部署后不可更改（设置 `NoAutoUpdate` 注册表键）。

**修复**：重新部署 VM 并在 ARM 模板中设置正确的 patchMode：
```json
// Windows
"osProfile": {
  "windowsConfiguration": {
    "patchSettings": {
      "patchMode": "AutomaticByPlatform"
    }
  }
}
// Linux
"osProfile": {
  "linuxConfiguration": {
    "patchSettings": {
      "patchMode": "AutomaticByPlatform"
    }
  }
}
```

> ⚠️ 本地注册表修改会与 ARM 视图不同步。

`[结论: 🟢 8.5/10 — OneNote Mooncake 实证]`

### Phase 2c: Windows "Updates for Other Microsoft Products" 被重置
> 来源: [MCVKB/OneNote — Case Study]

**症状**：通过 Group Policy 启用 "updates for other Microsoft products" 后，AUM 将其重置禁用。

**根因**：Azure Update Manager (AutomaticByPlatform 模式) 修改 Windows Update 注册表设置，禁用 "updates for other Microsoft products"。这是 by-design 行为。

**修复**：

**方式 1 — PowerShell ServiceManager 脚本（在服务器上运行）**：
```powershell
$ServiceManager = (New-Object -com "Microsoft.Update.ServiceManager")
$ServiceManager.AddService2("7971f918-a847-4430-9279-4a52d1efe18d", 7, "")
```

**方式 2 — Group Policy（Server 2016+）**：
使用 Administrative templates 配置 Windows Update 策略。

`[结论: 🟢 8.5/10 — OneNote Case 实证，confirmed by-design]`

### Phase 2d: Definition Updates 版本不一致
> 来源: [MCVKB/OneNote — Case Study](../drafts/onenote-definition-updates-check.md)

**症状**：客户报告 definition updates 版本与 AUM 显示不一致，或需要验证更新安装时间和安装者。

**排查步骤**：

1. 在目标 Windows 机器上运行：
   ```powershell
   get-windowsupdatelog
   ```
   生成 Windows Update 日志文件到桌面。

2. 在日志中搜索特定 KB（如 `KB2267602`）：
   - 检查成功安装的时间戳
   - 检查 `Caller` 字段识别安装发起者

3. **Caller 字段判断**：
   | Caller | 含义 |
   |--------|------|
   | `Azure VM Guest Patching` | 由 AUM 发起 |
   | `Windows Defender` | 由 Windows Defender 自动更新发起，非 AUM |

**关键解释**：
- Windows Defender definition updates（如 KB2267602）有独立的签名更新通道
- 签名更新频繁，不完全依赖 Windows Update 或 AUM
- AUM 安装 definition update 后，Windows Defender 可能很快独立更新到更新版本
- 这解释了 AUM 报告版本与实际安装版本的差异

`[结论: 🟢 8.5/10 — OneNote Case 实证，解释清晰]`

### Phase 2e: Windows Update 失败 0x8024402F
> 来源: [KB5068488](https://support.microsoft.com/kb/5068488)

**症状**：Windows Update 检查失败（本地和 AUM 均失败），WU 日志显示 HTTP status 470，手动 curl `fe2.update.microsoft.com` 报 "underlying connection was closed"。

**根因**：HTTP status 470（非官方）由 Azure Firewall 返回。`download.windowsupdate.com` 未包含在防火墙允许规则中，被默认拒绝。

**修复**：
- 在 Azure Firewall Application Rule 中允许 `*.windowsupdate.com`
- 或使用 Azure Firewall FQDN tags（`WindowsUpdate` 标签）自动覆盖所有 WU 端点

`[结论: 🔵 7/10 — ContentIdea KB 单源，但根因和方案明确]`

### Phase 2f: Arc-enabled Servers 误导性计费通知
> 来源: [MCVKB/OneNote — Known Issue]

**症状**：客户收到 AUM 对 Arc-enabled servers 计费的通知，但并未使用 Arc-enabled servers。

**根因**：PG 误将通知发送给 Mooncake 所有 AUM 客户（2024年7月25日），而非仅 Arc-enabled server 用户。

**修复**：告知客户这是 PG 的错误通知，计费仅适用于使用 AUM 管理 Arc-enabled servers 的客户。如有更多问题，联系 AUM PG (Aakash Panchal)。

`[结论: 🟢 8 — OneNote 实证，已知 PG 错误]`

### Phase 2g: Windows Client OS 不受支持
> 来源: [MCVKB/OneNote — Known Issue]

**症状**：客户期望 AUM 管理 Windows 10/11 等 Client OS。

**根因**：AUM 仅支持 Windows Server 和 Linux Server OS。Windows Client OS 明确列为不支持的 workload。

**修复**：
- 引导客户查看 support matrix：https://learn.microsoft.com/en-us/azure/update-manager/support-matrix?tabs=21via,azurevm-os
- 不支持的 workload：https://learn.microsoft.com/en-us/azure/update-manager/support-matrix?tabs=21via,azurevm-os#unsupported-workloads
- 对 Client OS 使用替代方案（WSUS、Intune）

`[结论: 🟢 8.5 — OneNote + MS Learn 文档交叉验证]`

### Phase 3: 从 Update Management (v1) 迁移到 AUM (v2)
> 来源: [MCVKB/OneNote — Case Study](../drafts/onenote-um-to-aum-migration.md)

**迁移步骤**：

1. **启动迁移向导**：Automation Account > Update Management > Start migration wizard

2. **下载并运行前置脚本**：
   - 参考：https://learn.microsoft.com/zh-cn/azure/update-manager/guidance-migration-automation-update-management-azure-update-manager?tabs=update-mgmt#prerequisite-1-onboard-non-azure-machines-to-arc

3. **Mooncake 关键注意事项** ⚠️：
   - 以 **Administrator** 运行 PowerShell
   - `AutomationAccountAzureEnvironment` 参数 = **`AzureChinaCloud`**（不是某些文档中的 `AzureChina`）
   - 需要 Az module **3.0+** 版本的 `Az.OperationalInsights`
   - 必须安装并导入：`Install-Module Az.OperationalInsights; Import-Module Az.OperationalInsights`
   - 脚本会为迁移 job 生成 Managed Identity

4. **点击 "Migrate Now"**：生成名为 `MigrateToAzureUpdateManager` 的 runbook

5. **运行迁移 Runbook**：执行 VM 和 Schedule 迁移。旧 UM schedules 迁移后自动**禁用**（不删除）

6. **验证**：在 AUM Portal 中检查已迁移的 VM 和 schedules

> 💡 非 Azure 机器必须先 onboard 到 Arc（前置条件）

`[结论: 🟢 9/10 — OneNote 实际 Case 验证，Mooncake 关键参数已确认]`

---

## 诊断工具参考
> 来源: [MCVKB/OneNote](../drafts/onenote-aum-tools.md)

### Kusto 集群

| 集群 | URL |
|------|-----|
| AZ Deployer MC | `https://azdeployermc.kusto.chinacloudapi.cn` |
| AZ CRP MC | `https://azcrpmc.kusto.chinacloudapi.cn` |
| RDOS MC | `https://rdosmc.kusto.chinacloudapi.cn` |
| AUM MC | `https://azupdatecentermc.chinaeast2.kusto.chinacloudapi.cn` |

访问申请：https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-update-management-center/azure-update-management-center/tsg/v2/logskustoclusterdetails

### Jarvis / Geneva
- Geneva Portal: https://portal.microsoftgeneva.com/s/6053E82F
- 查询指南: https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-update-management-center/azure-update-management-center/tsg/v2/logsqueryviagenevaportal

### 通用 Kusto 查询
- https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-update-management-center/azure-update-management-center/tsg/v2/generalkustoqueries

### ASC (Azure Support Center)
- AUM insights 可在 ASC 中用于 AUM 问题排查

### ADO Wiki TSG
- https://msazure.visualstudio.com/DefaultCollection/One/_wiki/wikis/One.wiki/159402/Troubleshooting-Guides-(TSGs)
- https://dev.azure.com/Supportability/AAAP_Code/_wiki/wikis/AAAP/1680101/Azure-Update-Manager

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VM 镜像不受 AUM 支持 | 不在支持列表 | 提交 Image Request + 邮件 PG | 🟢 8.5 — OneNote | [MCVKB/OneNote] |
| 2 | Patch orchestration 模式部署后无法更改 | ARM 属性部署时设定 | 重部署 VM + ARM 模板设置 patchMode | 🟢 8.5 — OneNote | [MCVKB/OneNote] |
| 3 | "Updates for other Microsoft products" 被 AUM 重置 | AutomaticByPlatform by-design | ServiceManager 脚本或 GPO | 🟢 8.5 — OneNote Case | [MCVKB/OneNote] |
| 4 📋 | Definition updates 版本不一致 | Defender 独立更新通道 | `get-windowsupdatelog` 检查 Caller 字段 | 🟢 8.5 — OneNote Case | [MCVKB/OneNote](../drafts/onenote-definition-updates-check.md) |
| 5 | Arc-enabled servers 误导性计费通知 | PG 误发通知 | 告知客户仅 Arc 计费 | 🟢 8 — OneNote | [MCVKB/OneNote] |
| 6 | Windows Client OS 不受支持 | AUM 仅支持 Server OS | 引导 WSUS/Intune 替代 | 🟢 8.5 — OneNote+MS Learn | [MCVKB/OneNote] |
| 7 📋 | AUM 区域支持 + Portal 链接 | — | Mooncake 4 区域 + feature flag URL | 🟢 8 — OneNote | [MCVKB/OneNote] |
| 8 📋 | AUM 诊断工具（Kusto/Jarvis/ASC） | — | 集群 URL + 访问指南 | 🟢 9 — OneNote 指南 | [MCVKB/OneNote](../drafts/onenote-aum-tools.md) |
| 9 📋 | TSG Wiki 链接 | — | ADO Wiki TSG 地址 | 🔵 7 — OneNote | [MCVKB/OneNote] |
| 10 📋 | UMv1→AUMv2 迁移指南 | — | 完整迁移流程 + Mooncake 参数 | 🟢 9 — OneNote Case | [MCVKB/OneNote](../drafts/onenote-um-to-aum-migration.md) |
| 11 | WU 失败 0x8024402F, HTTP 470 | Azure Firewall 未放行 WU 域名 | 放行 `*.windowsupdate.com` 或 FQDN tag | 🔵 7 — KB 单源 | [KB5068488](https://support.microsoft.com/kb/5068488) |
