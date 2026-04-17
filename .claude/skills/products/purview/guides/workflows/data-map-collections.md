# Purview 集合管理与元数据策略 — 排查工作流

**来源草稿**: `ado-wiki-policy-store-collection-webhook-failures.md`, `ado-wiki-process-dump-collection.md`, `ado-wiki-request-increase-collections.md`, `ado-wiki-scoping-initial-data-collection.md`
**Kusto 引用**: 无
**场景数**: 20
**生成日期**: 2026-04-07

---

## Scenario 1: Issue
> 来源: ado-wiki-policy-store-collection-webhook-failures.md | 适用: 未标注

### 排查步骤
The Policy Store is a crucial service involved in creation and deletion of collections. If the collection creation or deletion fails, the Policy Store service may be involved.

Possible reasons for failure:
- Failure to perform CRUD on Artifact Store for the policy (PurviewAuthzPolicy)
- Failure to publish event in Storage queue for consumption by Authorization service

`[来源: ado-wiki-policy-store-collection-webhook-failures.md]`

---

## Scenario 2: 1. Check Geneva Metrics Dashboard
> 来源: ado-wiki-policy-store-collection-webhook-failures.md | 适用: 未标注

### 排查步骤
Dashboard: https://portal.microsoftgeneva.com/dashboard/BabylonProd/PolicyStore/Collection%2520Webhook

Find the exception type by correlating exception with failures in the charts.

`[来源: ado-wiki-policy-store-collection-webhook-failures.md]`

---

## Scenario 3: 2. Exception Type Breakdown
> 来源: ado-wiki-policy-store-collection-webhook-failures.md | 适用: 未标注

### 排查步骤
| Exception Type | Meaning |
|---|---|
| ErrorResponseException | Unhandled ErrorResponseException received from Artifact Store |
| ArtifactStoreException | Unhandled ArtifactStoreException received from Artifact Store |
| PolicyStoreException | Handled Exception in Policy Store (e.g., Artifact Store returned 404) |
| Exception | Unhandled Exception in Policy Store (System Error, etc.) |
| TaskCanceledException | Task was cancelled (timeout or cancellation) |

`[来源: ado-wiki-policy-store-collection-webhook-failures.md]`

---

## Scenario 4: 3. Drill Down with Kusto/Jarvis Logs
> 来源: ado-wiki-policy-store-collection-webhook-failures.md | 适用: 未标注

### 排查步骤
**Geneva Config:**
- Endpoint: Diagnostics PROD
- Namespace: PolicyStoreProd
- Events: PolicyStoreLogEvent

**Kusto Query** (on https://dataexplorer.azure.com/clusters/babylon.eastus2/databases/babylonMdsLogs):

```kql
PolicyStoreLogEvent
| where ExceptionType == "<YourExceptionType>"
| where ['time'] > ago (1d)
| project CorrelationIdError = CorrelationId
| join (PolicyStoreLogEvent | where ['time'] > ago(1d) | where ExceptionMessage != "null")
  on $left.CorrelationIdError == $right.CorrelationId
| project CorrelationId, ExceptionMessage, Message, AccountId
```

> Replace `<YourExceptionType>` with the actual exception type from step 2.
> Replace `1d` with your lookup time range.

`[来源: ado-wiki-policy-store-collection-webhook-failures.md]`

---

## Scenario 5: Resolution
> 来源: ado-wiki-policy-store-collection-webhook-failures.md | 适用: 未标注

### 排查步骤
With the log search results, identify the failing component and symptoms. Then:
1. Check **Known Issue and Mitigation** to see if this is a known issue
2. If symptoms match and mitigation exists, follow mitigation steps
3. If no symptom match, contact the corresponding **Component SMEs**

`[来源: ado-wiki-policy-store-collection-webhook-failures.md]`

---

## Scenario 6: Steps
> 来源: ado-wiki-process-dump-collection.md | 适用: 未标注

### 排查步骤
1. Download & install DebugDiag (https://www.microsoft.com/en-us/download/details.aspx?id=58210)
2. Launch DebugDiag → Rule Wizard
3. Select "Crash" → Next
4. Select "A Specific Process" → Next
5. Select the crashing process (or enter process name if not running)
6. Configure Advanced: set max userdump limit (default 3) → Next
7. Name the rule, note dump storage path → Next
8. Activate the rule
9. Run the process and wait for crash
10. Dumps generated in "Crash Rule for AllInstances of..." folder

`[来源: ado-wiki-process-dump-collection.md]`

---

## Scenario 7: Dump File Format
> 来源: ado-wiki-process-dump-collection.md | 适用: 未标注

### 排查步骤
`<ProcessName>__PID__<PID>__Date__<Date>__Time_<Time>__SecondChance_<ExceptionName>.dmp`

`[来源: ado-wiki-process-dump-collection.md]`

---

## Scenario 8: Cleanup
> 来源: ado-wiki-process-dump-collection.md | 适用: 未标注

### 排查步骤
After collecting, delete or deactivate the rule in DebugDiag.

`[来源: ado-wiki-process-dump-collection.md]`

---

## Scenario 9: Issue Description
> 来源: ado-wiki-request-increase-collections.md | 适用: 未标注

### 排查步骤
Customers may request to increase the limit of collections beyond the supported maximum.

`[来源: ado-wiki-request-increase-collections.md]`

---

## Scenario 10: Default Response
> 来源: ado-wiki-request-increase-collections.md | 适用: 未标注

### 排查步骤
Microsoft Purview does not support more than 400 collections. However, if the customer provides a reasonable use case and no other solution is viable, additional information will need to be collected for further evaluation.

`[来源: ado-wiki-request-increase-collections.md]`

---

## Scenario 11: Information to Gather from the Customer
> 来源: ado-wiki-request-increase-collections.md | 适用: 未标注

### 排查步骤
1. **User Permissions:**
   - How many users will have permissions to how many collections?

2. **Domain Details:**
   - Will all collections reside within the same domain?
   - Total number of domains involved.

3. **Collection Distribution:**
   - Number of collections assigned per user.
   - Number of collections the same user will have access to.

`[来源: ado-wiki-request-increase-collections.md]`

---

## Scenario 12: Next Steps
> 来源: ado-wiki-request-increase-collections.md | 适用: 未标注

### 排查步骤
1. After gathering the above information, reach out to Blesson John for approval.
2. Open an ICM with the platform team to do the required analysis, as this will impact other customers and may cause performance issues for the requester. If they grant access to more than the said users, there will be search timeouts.

`[来源: ado-wiki-request-increase-collections.md]`

---

## Scenario 13: Scoping & Initial Data Collection for Purview Cases
> 来源: ado-wiki-scoping-initial-data-collection.md | 适用: 未标注

### 排查步骤
Always collect the following information from the customer, depending on the scenario.

**NOTE:** Before engaging TA/SME/EEE or Product Group, collect the logs mentioned in the Logs Required for Escalation wiki.

`[来源: ado-wiki-scoping-initial-data-collection.md]`

---

## Scenario 14: Generic (should be already in the support case)
> 来源: ado-wiki-scoping-initial-data-collection.md | 适用: 未标注

### 排查步骤
- Purview Account name, region and subscription Id
- **Customer environment details** (Custom policy/VNet/Firewall) — critical to understand if customer subscriptions have custom policies on RG or subscription, and if Purview or data sources are behind a VNet or firewall.

`[来源: ado-wiki-scoping-initial-data-collection.md]`

---

## Scenario 15: Provisioning/Deprovisioning Issues
> 来源: ado-wiki-scoping-initial-data-collection.md | 适用: 未标注

### 排查步骤
- Purview Account name, region and subscription Id
- Correlation Id returned by the Provisioning failure

`[来源: ado-wiki-scoping-initial-data-collection.md]`

---

## Scenario 16: Scan/Asset/Classification Issues
> 来源: ado-wiki-scoping-initial-data-collection.md | 适用: 未标注

### 排查步骤
- **Scan Run Id** — found in scan run history under the scan name
- Fully qualified Asset name/URI (for assets not detected or classified)
  - SQL Server: `mssql://server/db/schema/table`
  - Blob Storage: full URL path; if resource set, also collect `sampleUri` from `AggregatedProperties`

`[来源: ado-wiki-scoping-initial-data-collection.md]`

---

## Scenario 17: Search/Browse Assets Issues
> 来源: ado-wiki-scoping-initial-data-collection.md | 适用: 未标注

### 排查步骤
- Scan Run Id
- Fully qualified Asset name/URI

`[来源: ado-wiki-scoping-initial-data-collection.md]`

---

## Scenario 18: On-premise Connectivity / SHIR Issues
> 来源: ado-wiki-scoping-initial-data-collection.md | 适用: 未标注

### 排查步骤
- **SHIR version** — always try to get customer to latest version
- **Report Id** when customer uses "Send Logs" option (without Report Id, cannot filter logs)
- Can also view logs using "View Logs" and opening in Windows Event Viewer

`[来源: ado-wiki-scoping-initial-data-collection.md]`

---

## Scenario 19: Lineage Issues
> 来源: ado-wiki-scoping-initial-data-collection.md | 适用: 未标注

### 排查步骤
- Pipeline Run ID of the ADF pipeline
- Activity Run ID(s) of the ADF activities
- Activity output JSON to confirm `reportLineageToCatalog` status

`[来源: ado-wiki-scoping-initial-data-collection.md]`

---

## Scenario 20: Driver Logs Collection
> 来源: ado-wiki-scoping-initial-data-collection.md | 适用: 未标注

### 排查步骤
1. Enable driver-level logs:
   - Go to driver folder under IR installation: `C:\Program Files\Microsoft Integration Runtime\3.0\Shared\ODBC Drivers\[Driver]\lib`
   - Edit INI file: Change LogLevel to 6, replace `LogType=ETW` with `LogPath=D:\OutputLog`
2. Change IR service running account to Windows login user
3. Restart "Integration Runtime Service"
4. Enable ODBC trace: Control Panel > Administrative Tools > ODBC Data Sources (64-bit) > Tracing tab > Start Tracing Now
5. Reproduce issue
6. Disable: Stop Tracing, restore INI LogLevel to 5, restore `LogType=ETW`, change IR account back to `NT SERVICE\DIAHostService`
7. Share logs: ODBC trace log + driver logs from OutputLog folder + pipeline Run ID

`[来源: ado-wiki-scoping-initial-data-collection.md]`

---
