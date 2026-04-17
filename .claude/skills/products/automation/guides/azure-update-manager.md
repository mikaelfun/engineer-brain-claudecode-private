# Automation Azure Update Manager (AUMv2) — 排查速查

**来源数**: 11 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows "updates for other Microsoft products" 设置被 AUM 反复禁用 | AUM AutomaticByPlatform 模式修改注册表，覆盖 GP 设置（by-design） | ServiceManager 脚本重新启用：`$ServiceManager = (New-Object -com 'Microsoft.Update.ServiceManager'); $ServiceManager.AddService2('7971f918-...',7,'')` | 🟢 9 — OneNote 实证 | [MCVKB/Azure Update Manager/Case Study](../../guides/drafts/) |
| 2 | Mooncake 中无法更改 VM patch orchestration mode 为 Manual/AutomaticByPlatform | patchSettings.patchMode 仅可在 VM 部署时通过 ARM 模板设置，部署后不可更改 | 使用正确 patchMode 重新部署 VM（ARM: `osProfile.windowsConfiguration.patchSettings.patchMode=AutomaticByPlatform`） | 🟢 8 — OneNote | [MCVKB/Azure Update Manager/Know issue](../../guides/drafts/) |
| 3 | AUM 不支持 Windows Client OS（Win10/11），客户期望 AUM 管理桌面机 | AUM 仅支持 Windows Server 和 Linux Server，Client OS 明确不支持 | 引导客户查看 [support matrix](https://learn.microsoft.com/en-us/azure/update-manager/support-matrix?tabs=21via,azurevm-os)；桌面机用 WSUS/Intune | 🟢 8 — OneNote | [MCVKB/Azure Update Manager/Know issue](../../guides/drafts/) |
| 4 | VM image 不在 AUM 支持列表，Assessment/Patching 报 unsupported | VM 镜像未被 AzGPS 支持列表收录 | 1) 提交 [New Image Request](https://forms.microsoft.com/...) 2) 邮件 aumpm/aumeng@microsoft.com 3) 无响应则 [ICM](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=X1t346)。注意：不要为 EOL OS 申请 | 🟢 8 — OneNote | [MCVKB/Azure Update Manager/TSG](../../guides/drafts/) |
| 5 | 收到 AUM 对 Arc-enabled servers 计费通知，但未使用 Arc 服务器 | PG 7/25 误发通知给所有 Mooncake AUM 用户，仅 Arc-enabled servers 用户受影响 | 告知客户为误发；仅 AUM on Arc-enabled servers 计费。联系 PG: Aakash Panchal | 🟢 8 — OneNote | [MCVKB/Azure Update Manager/Know issue](../../guides/drafts/) |
| 6 📋 | 需要验证 Windows 定义更新（KB2267602）安装时间和来源（AUM vs Defender 自动更新） | — | 详见融合指南：Get-WindowsUpdateLog + EventLog 分析 | 🟢 8 — OneNote 含融合指南 | [MCVKB/Case Study](../../guides/drafts/) |
| 7 📋 | 需要 AUM 诊断工具参考（Kusto/Jarvis/ASC for Mooncake） | — | 详见融合指南：Kusto 集群 + Jarvis + ASC 工具清单 | 🟢 8 — OneNote 含融合指南 | [MCVKB/Azure Update Manager/Tools](../../guides/drafts/) |
| 8 📋 | 需要 UMv1 → AUMv2 迁移步骤指南（Mooncake） | — | 详见融合指南：迁移步骤 + Runbook 配置 | 🟢 8 — OneNote 含融合指南 | [MCVKB/Azure Update Manager/Migration](../../guides/drafts/) |
| 9 | AUM Mooncake 支持区域和 Portal 链接 | — | 区域: ChinaEast(Azure), ChinaEast2(Azure+Arc), ChinaNorth(Azure), ChinaNorth2(Azure+Arc)。Portal: `portal.azure.cn/?Microsoft_Azure_Automation=flight5&...` | 🟢 8 — OneNote | [MCVKB/Azure Update Manager/Release info](../../guides/drafts/) |
| 10 | AUM TSG Wiki 链接速查 | — | ADO Wiki: [One Wiki TSGs](https://msazure.visualstudio.com/DefaultCollection/One/_wiki/wikis/One.wiki/159402), [AAAP Wiki](https://dev.azure.com/Supportability/AAAP_Code/_wiki/wikis/AAAP/1680101/Azure-Update-Manager) | 🟢 8 — OneNote | [MCVKB/Azure Update Manager/TSG](../../guides/drafts/) |
| 11 | WU 检查失败 0x8024402F，HTTP 470 from WinHttpQueryHeaders，curl 到 fe2.update.microsoft.com 失败 | Azure Firewall 未放行 download.windowsupdate.com，返回 HTTP 470 (unofficial) | Azure Firewall Application Rule 添加 `*.windowsupdate.com`，或使用 FQDN tag `WindowsUpdate` 自动覆盖所有 WU 端点 | 🔵 6.5 — ContentIdea KB | [KB5068488](https://support.microsoft.com/kb/5068488) |

## 快速排查路径
1. 确认 VM OS 是否受支持 → 查 [AUM support matrix](https://learn.microsoft.com/en-us/azure/update-manager/support-matrix?tabs=21via,azurevm-os) `[来源: OneNote]`
2. 确认 VM image 是否被 AzGPS 支持 → 不支持则提交 New Image Request `[来源: OneNote]`
3. 确认 patch orchestration mode → 必须在 VM 部署时设定 ARM patchMode `[来源: OneNote]`
4. Windows Update 连通性 → 检查防火墙是否放行 `*.windowsupdate.com` `[来源: ContentIdea KB]`
5. 定义更新来源确认 → Get-WindowsUpdateLog + Windows Event Log `[来源: OneNote]`
6. "其他 Microsoft 产品更新" 被关 → ServiceManager PowerShell 脚本重启设置 `[来源: OneNote]`
7. Mooncake 特有问题 → 确认区域支持 + Portal 链接 + ICM 模板 `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/azure-update-manager.md#排查流程)
