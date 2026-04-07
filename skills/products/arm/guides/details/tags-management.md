# ARM Azure 资源标签管理 — 综合排查指南

**条目数**: 12 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-working-with-tags-in-powershell.md, ado-wiki-b-configure-nsg-tags.md, ado-wiki-tags-architecture-troubleshooting.md
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Deleted Azure resources' tags still appear in tag lists, Azure Portal tags blad…
> 来源: ado-wiki

**根因分析**: ARM cache does not always clean up tag name/value combinations when resources are deleted, creating 'orphan tags'. These orphan tags still count toward the 80k tag summarization calculation limit. When exceeded, the summarization process fails and returns an empty list.

1. Remove orphan tags using: (1) Remove-AzTag PowerShell cmdlet, (2) az tag delete CLI command, or (3) Tags Delete Value REST API (DELETE on Microsoft.
2. Resources/tagNames/{tagName}/tagValues/{tagValue}).

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 2: Tags fail to save when using Azure Portal or PATCH operation on certain resourc…
> 来源: ado-wiki

**根因分析**: Some resource providers do not implement the PATCH operation for tags. ARM passes the tag operation to the RP, and if the RP doesn't support PATCH, it fails.

1. Use PUT operation instead via PowerShell/CLI/REST API.
2. Example: $Resource = Get-AzResource -ResourceGroupName testrg; $Resource | ForEach-Object { $_.
3. Add('testkey','testval') }; $Resource | Set-AzResource -Force.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Setting tags on AlertRules (microsoft.insights/alertrules) fails with error: Un…
> 来源: ado-wiki

**根因分析**: AlertRules RP returns an invalid 'action' property on GET that causes subsequent PUT to fail. Also 'metricNamespace' in dataSource may cause issues.

1. Remove invalid properties before PUT: $r = Get-AzResource -ResourceId {id}; $r.
2. remove('action'); $r.
3. remove('metricNamespace'); $r | Set-AzResource -Tag @{'key'='value'} -Debug.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Setting tags on App Service Certificates (Microsoft.Web/certificates) via Power…
> 来源: ado-wiki

**根因分析**: PowerShell bug with URL encoding of '#' character in resource IDs. The '#' breaks the URL parsing.

1. Replace '#' with '%23' in the resource ID before calling Set-AzResource: $resource.
2. ResourceId = $resource.
3. Replace('#','%23'); then call Set-AzResource with the modified ResourceId.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Tag names with underscore characters get modified from uppercase to lowercase (…
> 来源: ado-wiki

**根因分析**: Resource provider bug that modifies tag name casing when underscore characters are present

1. No fix available - known RP-side bug.
2. Workaround: avoid underscore characters in tag names or accept the casing change.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Tags with spaces in the name are silently discarded on Traffic Manager (Microso…
> 来源: ado-wiki

**根因分析**: Traffic Manager resource provider silently ignores tags that have spaces in the tag name

1. Do not use spaces in tag names for Traffic Manager resources.
2. File ICM against NRP to fix the silent discard behavior.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Network Watcher resources cannot be tagged from the resource page itself in Azu…
> 来源: ado-wiki

**根因分析**: Network Watcher is a hidden resource type that doesn't expose tag editing from its own resource blade

1. Go to All Resources in portal → click 'Show hidden types' checkbox → find the Network Watcher resource → use the 'Assign tags' button at the top.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Unable to add or update tags on a resource via portal (PATCH fails); Set-AzReso…
> 来源: ado-wiki

**根因分析**: Some Resource Providers do not support PATCH operations for tags. Affected RPs include: AlertRules (microsoft.insights/alertrules), PostgreSQL (Microsoft.DBforPostgreSQL/servers), OMS (Microsoft.OperationsManagement/solutions), Azure Database Migration Services (Microsoft.DataMigration), Azure Frontdoor (Microsoft.Network/frontdoors), IP Groups. Portal always uses PATCH which fails for these RPs.

1. Use PUT operation instead via PowerShell: $Resource = Get-AzResource -ResourceGroupName {rg}; $Resource | ForEach-Object { $_.
2. Add('key', 'value') }; $Resource | Set-AzResource -Force.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Tags applied to Azure resources do not appear in billing invoices
> 来源: ado-wiki

**根因分析**: The billing system queries tags directly from Resource Providers. Some RPs do not correctly return tags when queried by the billing system. This is not an ARM issue but a billing-RP integration issue.

1. Route to ASMS as a billing-related issue.
2. Billing PG is working with each RP to ensure tags are correctly emitted.
3. ARM CSS is not responsible for resolving this.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Cannot add or update tags on Network Watcher resource through normal tag UI
> 来源: ado-wiki

**根因分析**: Network Watcher (Microsoft.Network/networkWatchers) does not support tagging from the resource itself

1. Navigate to 'All Resources' in portal → enable 'Show hidden types' checkbox → locate the Network Watcher resource → use 'Assign tags' button at top of the page.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: Tag names with underscore characters have casing changed silently (e.g., 'ROLE_…
> 来源: ado-wiki

**根因分析**: Known RP bug in Microsoft.Portal/dashboards and microsoft.insights/metricAlerts where underscore handling corrupts uppercase letters in tag names

1. File ICM with respective RP.
2. Workaround: avoid uppercase letters in tag names that contain underscore characters for these resource types.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 12: Setting a tag with spaces in the tag name on Traffic Manager (Microsoft.Network…
> 来源: ado-wiki

**根因分析**: Microsoft.Network/trafficManagerProfiles RP silently discards tags whose names contain space characters

1. File ICM with NRP.
2. Workaround: avoid using spaces in tag names for Traffic Manager resources.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Deleted Azure resources' tags still appear in tag lists, Az… | ARM cache does not always clean up tag name/value combinati… | Remove orphan tags using: (1) Remove-AzTag PowerShell cmdle… |
| Tags fail to save when using Azure Portal or PATCH operatio… | Some resource providers do not implement the PATCH operatio… | Use PUT operation instead via PowerShell/CLI/REST API. Exam… |
| Setting tags on AlertRules (microsoft.insights/alertrules) … | AlertRules RP returns an invalid 'action' property on GET t… | Remove invalid properties before PUT: $r = Get-AzResource -… |
| Setting tags on App Service Certificates (Microsoft.Web/cer… | PowerShell bug with URL encoding of '#' character in resour… | Replace '#' with '%23' in the resource ID before calling Se… |
| Tag names with underscore characters get modified from uppe… | Resource provider bug that modifies tag name casing when un… | No fix available - known RP-side bug. Workaround: avoid und… |
| Tags with spaces in the name are silently discarded on Traf… | Traffic Manager resource provider silently ignores tags tha… | Do not use spaces in tag names for Traffic Manager resource… |
| Network Watcher resources cannot be tagged from the resourc… | Network Watcher is a hidden resource type that doesn't expo… | Go to All Resources in portal → click 'Show hidden types' c… |
| Unable to add or update tags on a resource via portal (PATC… | Some Resource Providers do not support PATCH operations for… | Use PUT operation instead via PowerShell: $Resource = Get-A… |
| Tags applied to Azure resources do not appear in billing in… | The billing system queries tags directly from Resource Prov… | Route to ASMS as a billing-related issue. Billing PG is wor… |
| Cannot add or update tags on Network Watcher resource throu… | Network Watcher (Microsoft.Network/networkWatchers) does no… | Navigate to 'All Resources' in portal → enable 'Show hidden… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Tags fail to save when using Azure Portal or PATCH operation on certain resource types (e.g. AlertR… | Some resource providers do not implement the PATCH operation for tags. ARM passes the tag operation… | Use PUT operation instead via PowerShell/CLI/REST API. Example: $Resource = Get-AzResource -Resourc… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Setting tags on AlertRules (microsoft.insights/alertrules) fails with error: UnsupportedRequestCont… | AlertRules RP returns an invalid 'action' property on GET that causes subsequent PUT to fail. Also … | Remove invalid properties before PUT: $r = Get-AzResource -ResourceId {id}; $r.Properties.PSObject.… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Setting tags on App Service Certificates (Microsoft.Web/certificates) via PowerShell fails with err… | PowerShell bug with URL encoding of '#' character in resource IDs. The '#' breaks the URL parsing. | Replace '#' with '%23' in the resource ID before calling Set-AzResource: $resource.ResourceId = $re… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Tag names with underscore characters get modified from uppercase to lowercase (e.g. 'ROLE_PURPOSE' … | Resource provider bug that modifies tag name casing when underscore characters are present | No fix available - known RP-side bug. Workaround: avoid underscore characters in tag names or accep… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Tags with spaces in the name are silently discarded on Traffic Manager (Microsoft.Network/trafficMa… | Traffic Manager resource provider silently ignores tags that have spaces in the tag name | Do not use spaces in tag names for Traffic Manager resources. File ICM against NRP to fix the silen… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Network Watcher resources cannot be tagged from the resource page itself in Azure Portal | Network Watcher is a hidden resource type that doesn't expose tag editing from its own resource bla… | Go to All Resources in portal → click 'Show hidden types' checkbox → find the Network Watcher resou… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Unable to add or update tags on a resource via portal (PATCH fails); Set-AzResource fails to update… | Some Resource Providers do not support PATCH operations for tags. Affected RPs include: AlertRules … | Use PUT operation instead via PowerShell: $Resource = Get-AzResource -ResourceGroupName {rg}; $Reso… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Tags applied to Azure resources do not appear in billing invoices | The billing system queries tags directly from Resource Providers. Some RPs do not correctly return … | Route to ASMS as a billing-related issue. Billing PG is working with each RP to ensure tags are cor… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | Cannot add or update tags on Network Watcher resource through normal tag UI | Network Watcher (Microsoft.Network/networkWatchers) does not support tagging from the resource itse… | Navigate to 'All Resources' in portal → enable 'Show hidden types' checkbox → locate the Network Wa… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Tag names with underscore characters have casing changed silently (e.g., 'ROLE_PURPOSE' becomes 'ro… | Known RP bug in Microsoft.Portal/dashboards and microsoft.insights/metricAlerts where underscore ha… | Known bug. File ICM with respective RP. Workaround: avoid uppercase letters in tag names that conta… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | Setting a tag with spaces in the tag name on Traffic Manager (Microsoft.Network/trafficManagerProfi… | Microsoft.Network/trafficManagerProfiles RP silently discards tags whose names contain space charac… | Known bug. File ICM with NRP. Workaround: avoid using spaces in tag names for Traffic Manager resou… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 | Deleted Azure resources' tags still appear in tag lists, Azure Portal tags blade, or tag summarizat… | ARM cache does not always clean up tag name/value combinations when resources are deleted, creating… | Remove orphan tags using: (1) Remove-AzTag PowerShell cmdlet, (2) az tag delete CLI command, or (3)… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
