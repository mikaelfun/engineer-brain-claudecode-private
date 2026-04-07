# ARM Azure 资源标签管理 — 排查速查

**来源数**: 12 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Tags fail to save when using Azure Portal or PATCH operation on certain resource types (e.g. AlertR… | Some resource providers do not implement the PATCH operation for tags. ARM passes the tag operation… | Use PUT operation instead via PowerShell/CLI/REST API. Example: $Resource = Get-AzResource -Resourc… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Setting tags on AlertRules (microsoft.insights/alertrules) fails with error: UnsupportedRequestCont… | AlertRules RP returns an invalid 'action' property on GET that causes subsequent PUT to fail. Also … | Remove invalid properties before PUT: $r = Get-AzResource -ResourceId {id}; $r.Properties.PSObject.… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Setting tags on App Service Certificates (Microsoft.Web/certificates) via PowerShell fails with err… | PowerShell bug with URL encoding of '#' character in resource IDs. The '#' breaks the URL parsing. | Replace '#' with '%23' in the resource ID before calling Set-AzResource: $resource.ResourceId = $re… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Tag names with underscore characters get modified from uppercase to lowercase (e.g. 'ROLE_PURPOSE' … | Resource provider bug that modifies tag name casing when underscore characters are present | No fix available - known RP-side bug. Workaround: avoid underscore characters in tag names or accep… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Tags with spaces in the name are silently discarded on Traffic Manager (Microsoft.Network/trafficMa… | Traffic Manager resource provider silently ignores tags that have spaces in the tag name | Do not use spaces in tag names for Traffic Manager resources. File ICM against NRP to fix the silen… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Network Watcher resources cannot be tagged from the resource page itself in Azure Portal | Network Watcher is a hidden resource type that doesn't expose tag editing from its own resource bla… | Go to All Resources in portal → click 'Show hidden types' checkbox → find the Network Watcher resou… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Unable to add or update tags on a resource via portal (PATCH fails); Set-AzResource fails to update… | Some Resource Providers do not support PATCH operations for tags. Affected RPs include: AlertRules … | Use PUT operation instead via PowerShell: $Resource = Get-AzResource -ResourceGroupName {rg}; $Reso… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Tags applied to Azure resources do not appear in billing invoices | The billing system queries tags directly from Resource Providers. Some RPs do not correctly return … | Route to ASMS as a billing-related issue. Billing PG is working with each RP to ensure tags are cor… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | Cannot add or update tags on Network Watcher resource through normal tag UI | Network Watcher (Microsoft.Network/networkWatchers) does not support tagging from the resource itse… | Navigate to 'All Resources' in portal → enable 'Show hidden types' checkbox → locate the Network Wa… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | Tag names with underscore characters have casing changed silently (e.g., 'ROLE_PURPOSE' becomes 'ro… | Known RP bug in Microsoft.Portal/dashboards and microsoft.insights/metricAlerts where underscore ha… | Known bug. File ICM with respective RP. Workaround: avoid uppercase letters in tag names that conta… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 📋 | Setting a tag with spaces in the tag name on Traffic Manager (Microsoft.Network/trafficManagerProfi… | Microsoft.Network/trafficManagerProfiles RP silently discards tags whose names contain space charac… | Known bug. File ICM with NRP. Workaround: avoid using spaces in tag names for Traffic Manager resou… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 📋 | Deleted Azure resources' tags still appear in tag lists, Azure Portal tags blade, or tag summarizat… | ARM cache does not always clean up tag name/value combinations when resources are deleted, creating… | Remove orphan tags using: (1) Remove-AzTag PowerShell cmdlet, (2) az tag delete CLI command, or (3)… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Use PUT operation instead via PowerShell/CLI/REST API. Example: $Resource = Get… `[来源: ado-wiki]`
2. Remove invalid properties before PUT: $r = Get-AzResource -ResourceId {id}; $r.… `[来源: ado-wiki]`
3. Replace '#' with '%23' in the resource ID before calling Set-AzResource: $resou… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/tags-management.md#排查流程)
