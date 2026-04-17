# Monitor 诊断设置与资源日志 - Comprehensive Troubleshooting Guide

**Entries**: 42 | **Drafts fused**: 19 | **Kusto queries**: 1
**Draft sources**: ado-wiki-a-Self-Diagnostics-How-it-works.md, ado-wiki-a-Self-Diagnostics-What-Is-It.md, ado-wiki-a-Self-Diagnostics-When-To-Use.md, ado-wiki-b-Diagnostic-Log-Metrics-Telemetry-ASC.md, ado-wiki-b-Diagnostic-Log-Metrics-Telemetry-Kusto.md, ado-wiki-b-Diagnostic-Settings-Azure-Resources-ASC.md, ado-wiki-b-Diagnostic-Settings-Azure-Resources-Kusto.md, ado-wiki-b-grafana-kusto-diagnostics.md, ado-wiki-b-nodejs-diagnostic-logs.md, ado-wiki-b-query-metrics-resource-provider-diagnostic-logs.md
**Kusto references**: diagnostic-settings.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Azure Policy deployIfNotExists for subscription-level Activity Log diagnostic settings fails with LocationNotAvailableForDeployment error in Mooncake.

**Solution**: 1) Set resource type to Microsoft.Resources/subscriptions. 2) Set deploymentScope to 'subscription'. 3) Set deployment location to valid Mooncake region (e.g., chinaeast2). 4) Configure existenceCondition to match desired log categories (Administrative, Security, Alert, Recommendation, ResourceHe...

`[Source: OneNote, Score: 9.0]`

### Step 2: AAD Diagnostic settings configured to send logs to EventHub fail with UnauthorizedAccess error. Storage Account destination works fine for same diagnostic setting.

**Solution**: Enable Allow trusted Microsoft services to bypass this firewall setting in EventHub namespace. Troubleshooting Kusto queries on azureinsightsmc: 1) RegistrationTelemetry to check diagnostic setting configuration. 2) EventHubSendBatchTelemetry filtered by tenantId and eventHubName to see isFailed/...

`[Source: OneNote, Score: 9.0]`

### Step 3: Diagnostic settings remain visible in Azure Portal after the associated resource is deleted or migrated to a different resource group. Old resourceId persists as orphaned diagnostic settings.

**Solution**: Two options: 1) Recreate the Azure resource under the same subscription, resource group, and resource name to make orphaned settings accessible for deletion. 2) Submit request to Azure Monitor PG via Product Group Escalation (https://aka.ms/azmonpgescalation) to remove orphaned settings. Use Kust...

`[Source: OneNote, Score: 9.0]`

### Step 4: Jarvis action get events for Activity Log query is locked/deprecated due to SFI enhancement rollout. Cannot query Activity Log via Jarvis.

**Solution**: Use the new Activity Log query feature in Azure Support Center (ASC). Verified working for Mooncake ASC at azuresupportcenter.chinacloudapi.cn. Navigate to Resource Explorer > subscription > Azure Activity Logs - New tab.

`[Source: OneNote, Score: 9.0]`

### Step 5: Failed to update diagnostics for resource with error: 'Please register the subscription with Microsoft.Insights'. Diagnostic settings configuration fails.

**Solution**: Register the resource provider: 1) Azure Portal → Subscriptions → select subscription → Resource Providers → find Microsoft.insights → click Register. 2) For PowerShell errors about WorkspaceId parameter not found, update Azure PowerShell to v2.3.0 or later.

`[Source: OneNote, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Policy deployIfNotExists for subscription-level Activity Log diagnostic... | Policy definition missing deploymentScope='subscription' or using invalid/mis... | 1) Set resource type to Microsoft.Resources/subscriptions. 2) Set deploymentS... | 9.0 | OneNote |
| 2 | AAD Diagnostic settings configured to send logs to EventHub fail with Unautho... | EventHub namespace has virtual network/firewall enabled, blocking Azure Monit... | Enable Allow trusted Microsoft services to bypass this firewall setting in Ev... | 9.0 | OneNote |
| 3 | Diagnostic settings remain visible in Azure Portal after the associated resou... | Known Issue (CSS Wiki 14416): Azure Monitor does not automatically clean up d... | Two options: 1) Recreate the Azure resource under the same subscription, reso... | 9.0 | OneNote |
| 4 | Jarvis action get events for Activity Log query is locked/deprecated due to S... | SFI enhancement removed the default EventService-PlatformServiceViewer claim ... | Use the new Activity Log query feature in Azure Support Center (ASC). Verifie... | 9.0 | OneNote |
| 5 | Failed to update diagnostics for resource with error: 'Please register the su... | The Microsoft.Insights resource provider is not registered on the subscriptio... | Register the resource provider: 1) Azure Portal → Subscriptions → select subs... | 9.0 | OneNote |
| 6 | VMs sending AzureMetrics to LA workspace but no DCR or VM data source visible... | Hidden diagnostic settings named setbypolicy created by Azure Policy remediat... | Check AzureMetrics table by _ResourceId. Check ASC Diagnostic blade for hidde... | 9.0 | OneNote |
| 7 | Diagnostic settings are not deleted when the associated Azure resource is del... | Diagnostic settings are extension proxy resources of the Azure resource they ... | Option 1: Recreate the Azure resource under the same subscription, resource g... | 8.5 | ADO Wiki |
| 8 | Diagnostic settings become orphaned (inaccessible but still existing) after t... | Diagnostic settings are extension proxy resources of the Azure resource. The ... | Option 1: Recreate the Azure resource under the same subscription, resource g... | 8.5 | ADO Wiki |
| 9 | Customer reports missing data in Azure API Management API Analytics dashboard... | APIM API Analytics uses Diagnostic Settings to send data to a Log Analytics w... | Clarify API Analytics is powered by Diagnostic Settings -> Log Analytics, not... | 8.5 | ADO Wiki |
| 10 | User cannot see any data on the Azure Monitor Workspace Metrics Usage Insight... | User has not created a Diagnostic Setting for their Azure Monitor Workspace t... | 1) Create a Diagnostic Setting for the AMW 2) Select Metrics Usage Details ca... | 8.5 | ADO Wiki |
| 11 | User cannot see data on Azure Monitor Workspace Metrics Usage Insights tab ev... | No data is being ingested to the Azure Monitor Workspace itself (active time ... | 1) Verify diagnostic settings are created and 24 hours have elapsed 2) Check ... | 8.5 | ADO Wiki |
| 12 | Data exported from Log Analytics to Event Hub appears to show fewer records t... | Data Export sends records in batches to Event Hub. A bug in Event Hub causes ... | Use Kusto query on EventHubSendBatchTelemetry (cluster: azureinsights) to ver... | 8.5 | ADO Wiki |
| 13 | Data export to Event Hub stopped working unexpectedly without customer making... | Product team may blocklist the workspace if the Event Hub destination is inco... | 1) Check if workspace is blocklisted: open Tenants-Prod.json in EngSys-MDA-OB... | 8.5 | ADO Wiki |
| 14 | Export to storage fails with 'StorageException' error - PT1H.json files writt... | Immutable policy configured on the destination storage account conflicts with... | Review the immutable policy on the destination storage account. Ensure the st... | 8.5 | ADO Wiki |
| 15 | No AzureActivity data coming from one or more subscriptions (legacy mode). Op... | The subscription was transferred to another Azure Active Directory tenant, br... | Follow the steps in HT: Reconnect a subscription to Azure Activity log data s... | 8.5 | ADO Wiki |
| 16 | Duplicate records in Log Analytics workspace where _ItemId is different acros... | The source/client is sending duplicate data to Log Analytics. Common cause: m... | 1) Check for duplicate diagnostic settings on the source resource. 2) Contact... | 8.5 | ADO Wiki |
| 17 | Activity Log "Event Initiated by" column is empty or not populated for activi... | The EventServiceEntries claims for the operation do not contain any of the re... | 1) Query EventData table in AzureInsights Kusto cluster (oibebt) using correl... | 8.5 | ADO Wiki |
| 18 | Diagnostic setting appears orphaned - it exists but the associated Azure reso... | The Azure resource was deleted or moved to another subscription/resource grou... | 1) Query RegistrationTelemetry in Kusto (AzureInsights cluster) with the reso... | 8.5 | ADO Wiki |
| 19 | Unnamed failures (EventHubError_60000) when exporting diagnostic data to Even... | Event Hub Basic SKU has a 256KB publication size limit (vs Standard/Premium 1... | 1) Check Event Hub SKU in ASC Overview page. 2) Query EventHubSendBatchTeleme... | 8.5 | ADO Wiki |
| 20 | Customer cannot create or manage Management Group Diagnostic Settings from Az... | Management Group Diagnostic Settings currently only support REST API interact... | Use REST API to create/update/delete Management Group Diagnostic Settings: ht... | 8.5 | ADO Wiki |
| 21 | Duplicate Activity Log records appearing in Log Analytics workspace when usin... | When Diagnostic Settings exist on multiple nested Management Groups or on bot... | 1) Create DS only on the highest-level Management Group (typically Root MG) 2... | 8.5 | ADO Wiki |
| 22 | Diagnostic setting deletion via portal or API appears successful but the sett... | The diagnostic setting is orphaned - the associated Azure resource was delete... | 1) Get the resource ID of the deleted/moved resource from customer 2) Query R... | 8.5 | ADO Wiki |
| 23 | Metrics or logs continue to flow to Storage Account/Event Hub/Log Analytics d... | Orphaned diagnostic setting registration persists in the backend after the so... | 1) Query RegistrationTelemetry in Kusto: RegistrationTelemetry / where Precis... | 8.5 | ADO Wiki |
| 24 | Customer sees JSON parsing error in Log Analytics workspace: Data of type Azu... | Resource Provider (e.g. SQL) emits audit log records where the Statement fiel... | This is an RP-side issue. Investigate using Kusto (azureinsights + omsgenevao... | 8.5 | ADO Wiki |
| 25 | Customer expects to export metrics to partner solutions (Datadog/Dynatrace/El... | Only Logs are supported for export to partner solutions (Liftr). Metrics expo... | Inform customer that diagnostic settings only supports exporting Logs (not Me... | 8.5 | ADO Wiki |
| 26 | Customer reports ADF/Synapse long-running job alerts firing frequently. Alert... | The diagnostic pipeline has a normal loss rate (~0.01%). For high-volume ADF/... | Compare the total record volume with the number of missing records to determi... | 8.5 | ADO Wiki |
| 27 | Service or Resource Health events appear in Activity Logs with significant de... | Known upstream issue where the time gap between event creation (Time column i... | 1) Normal latency up to ~15 mins is expected 2) Check DGREP Time vs Precise T... | 8.5 | ADO Wiki |
| 28 | Diagnostic setting creation fails or setting silently disappears because the ... | Non-ASCII characters in the resource ID or request body are not handled corre... | 1) Check resource ID and request body for non-ASCII characters using ARMProd ... | 8.5 | ADO Wiki |
| 29 | Diagnostic setting creation fails with Conflict error: The limit of 5 diagnos... | Azure enforces a maximum of 5 diagnostic settings per resource; attempting to... | 1) Check existing diagnostic settings on the resource 2) Delete unused diagno... | 8.5 | ADO Wiki |
| 30 | Diagnostic setting creation fails with unauthorized_client error: AADSTS70001... | The Azure Monitor System first-party application (AppId: 11c174dc-1945-4a9a-a... | 1) Verify via SvcErrors Kusto query using ActivityId to find the AADSTS700011... | 8.5 | ADO Wiki |
| 31 | Azure Policy marks resources as non-compliant for diagnostic settings despite... | Built-in Azure Policy uses a broad existenceCondition that checks ALL log cat... | 1) Review which categories are actually enabled vs required 2) Either enable ... | 8.5 | ADO Wiki |
| 32 | Azure Policy marks VM as non-compliant for diagnostic settings when customer ... | The VM blade in Azure Portal labels the Diagnostic Extension (WAD/LAD) config... | 1) Clarify to customer the difference between VM Diagnostic Extension (WAD/LA... | 8.5 | ADO Wiki |
| 33 | Application Insights Profiler fails to start with no diagnostic logs availabl... | NuGet package Microsoft.ApplicationInsights.Profiler.AspNetCore version is be... | Upgrade Microsoft.ApplicationInsights.Profiler.AspNetCore NuGet package to at... | 7.5 | ADO Wiki |
| 34 | Customer confused about which Activity Log events appear in diagnostic settin... | Activity logs are exported differently based on diagnostic settings scope: su... | Refer to the Activity Log export behavior matrix: 1) Subscription-level event... | 7.5 | ADO Wiki |
| 35 | Azure Policy marks App Service Environment (ASE) as non-compliant for diagnos... | App Service Environments use case-sensitive resource identifiers internally. ... | 1) Verify casing mismatch between the original PUT and the Policy/Portal GET ... | 7.5 | ADO Wiki |
| 36 | Deleted Azure Event Hub is automatically re-created by diagnostic settings ev... | Diagnostic settings auto-create event hubs when they receive 'not found' erro... | Update diagnostic settings to stop sending to the event hub before deleting; ... | 7.5 | MS Learn |
| 37 | Management Group Diagnostic Settings not working or cannot be created in Azur... | Management Group Diagnostic Settings are not supported in the Mooncake (Azure... | Inform customer this is a platform limitation. Management Group Diagnostic Se... | 6.5 | ADO Wiki |
| 38 | Customer cannot configure diagnostic settings to export resource logs to part... | Liftr/Partner Solutions feature for diagnostic settings is only supported in ... | Inform customer that partner solution export via diagnostic settings is not a... | 6.5 | ADO Wiki |
| 39 | Permission errors when exporting audit logs to another tenant via Azure Light... | User lacks required permissions on target workspace or has incorrect cross-te... | 1) Check user role assignments in IAM — assign Log Analytics Contributor or R... | 6.5 | MS Learn |
| 40 | Activity log CSV download fails with 'file not found' or 'CSV file not prepar... | Excessive log volume requested — the system cannot process a large number of ... | 1) Reduce the time range to decrease log volume; 2) Break download into small... | 6.5 | MS Learn |
| 41 | Authorization Failed error when configuring Activity Log diagnostic settings ... | Custom role missing Microsoft.Insights/diagnosticSettings/write permission, o... | 1) Duplicate Log Analytics Contributor role; 2) Ensure Microsoft.Insights/dia... | 6.5 | MS Learn |
| 42 | Activity log export to Event Hub in another subscription fails due to permiss... | Event Hub shared access policy missing Manage/Send/Listen permissions, or Azu... | 1) Check Event Hub namespace shared access policy — enable Manage, Send, List... | 6.5 | MS Learn |
