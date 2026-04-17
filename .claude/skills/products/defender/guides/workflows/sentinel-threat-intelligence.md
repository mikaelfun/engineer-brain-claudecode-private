# Defender Sentinel 威胁情报 — 排查工作流

**来源草稿**: ado-wiki-a-adls-gen2-federation-tsg.md, ado-wiki-a-calculating-la-workspace-allowance.md, ado-wiki-a-databricks-federation-tsg.md, ado-wiki-a-exclusion-correlation-engine-tsg.md, ado-wiki-a-fabric-federation-tsg.md, ado-wiki-a-mdc-resource-based-usage-calculation.md, ado-wiki-a-mepm-integration-azure-tsg.md, ado-wiki-a-multi-workspace-tsg.md, ado-wiki-a-ti-flat-file-how-to-find-id.md, ado-wiki-a-ti-upload-indicators-api.md, ado-wiki-b-containers-high-resource-consumption.md, ado-wiki-b-ecr-va-common-questions.md, ado-wiki-b-ingestion-delays.md, ado-wiki-b-mdc-k8s-response-actions-tsg.md, ado-wiki-b-r1-email-alert-notifications.md, ado-wiki-b-r1-root-cause-classification.md, ado-wiki-b-taxii-connector-tsg.md, ado-wiki-b-threat-intelligence-ingestion-rules.md, ado-wiki-b-ti-private-preview-actions.md, ado-wiki-b-tsg-sensitivity-settings.md, ado-wiki-b-usx-content-acceleration.md, ado-wiki-c-byol-va-troubleshooting-guide.md, ado-wiki-c-tsg-adaptive-network-hardening.md, ado-wiki-d-tsg-watchlist-not-getting-deleted.md, mslearn-asr-troubleshooting.md, mslearn-mdav-performance-troubleshooting.md, onenote-adaptive-application-control.md, onenote-alerts-validation-reference.md
**场景数**: 26
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting guide for ADLS Gen2 Federation
> 来源: ado-wiki-a-adls-gen2-federation-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Invalid ADLS URL**: Container or path doesn't exist
2. **Permission Denied**: Service Principal lacks read access
3. **No Delta Tables**: Path doesn't contain Delta Lake tables
4. **Network Issues**: Firewall blocking ADLS access
5. **Verify ADLS Path Exists**: Check container exists at `https://{account}.dfs.core.windows.net/{container}`
6. **Verify Delta Tables Exist**: Tables must have `_delta_log` directory
7. **Test with Different Path**: Try navigating parent container first, narrow down to specific folder
8. **Connection ID Missing**: Connection not created during onboarding
9. **Invalid Path**: ADLS path doesn't exist or is malformed
10. **Lakehouse Full**: OneLake storage quota exceeded
11. **Duplicate Shortcut**: Shortcut with same name already exists
12. **Verify Table Pre-creation**: Table must exist in MSG system before federation. Check table was created via CreateCustomTable API.
13. **Check Fabric Details Initialization**: Query IngestionManagementLog for "Get Table" and "for Fabric Connector"
14. **Verify Complete Flow**: Check end-to-end: Get Table -> Creating shortcut -> Successfully Provisioned

### Kusto 诊断查询
**查询 1:**
```kusto
// ADLS Gen2 navigation Failures
let _tenant="<TenantId>";
let _stroageaccountname="<StorageAccountName>";
let _corid = "<CorrelationId>"; //use either CorrelationId or StorageAccountName
IngestionManagementLog
| where PreciseTimeStamp >= ago(24h)
| where TenantId == _tenant
| where CorrelationId == _corid // use ONLY if CorrelationId is Present
| where SourceFilePath has "AdlsGen2Connector"
| where Message has "Connection test failed for datasourceUrl:"
| where isnotempty(ExceptionMessage)
| extend
    CorrelationId = tostring(CorrelationId),
    IsSuccess = Message has "Connection test succeeded",
    IsFailure = isnotempty(ExceptionType),
    DatasourceUrl = extract(@"datasourceUrl[:\s]+(https://[^\s,]+)", 1, Message),
    StorageAccount = extract(@"https://([a-zA-Z0-9]+)\.dfs\.", 1, Message),
    FailureReason = case (
        ExceptionMessage has "KeyVault", "KeyVault Access Failed",
        ExceptionMessage has "Connection test failed", "Connection Test Failed",
        ExceptionMessage has "timeout", "Network Timeout",
        ExceptionMessage has "Forbidden", "Permission Denied",
        "")
| project
    Timestamp = PreciseTimeStamp,
    CorrelationId = tostring(CorrelationId),
    TenantId,
    AccountId = tostring(AccountId),
    StorageAccount,
    Operation = "ADLS Gen2 Navigation FAILURE",
    DatasourceUrl,
    FailureReason
| where StorageAccount == _stroageaccountname // use ONLY if Storage Account Name is known
| order by Timestamp desc
```

**查询 2:**
```kusto
// Check Delta table discovery
IngestionManagementLog
| where TimeGenerated > ago(1h)
| where Message has "delta" or Message has "_delta_log"
| where Message has_any ("{ACCOUNT_ID}", "{DATASOURCE_URL}")
| extend TableCount = extract(@"Found (\d+) tables", 1, Message)
| project TimeGenerated, TableCount, Message
| order by TimeGenerated desc
```

**查询 3:**
```kusto
// Track shortcut creation for ADLS tables
IngestionManagementLog
| where TimeGenerated > ago(24h)
| where Message has "shortcut" or Message has "Shortcut"
| where Message has_any ("{TABLE_NAME}", "{ACCOUNT_ID}", "{WORKSPACE_ID}")
| extend TableName = extract(@"[Tt]able[:\s]+['\"]?(\w+)", 1, Message)
| extend WorkspaceId = extract(@"workspace[:\s]+([a-f0-9\-]+)", 1, Message)
| extend ShortcutName = extract(@"[Ss]hortcut[Nn]ame[:\s]+['\"]?(\w+)", 1, Message)
| extend Operation = case(
    Message has "Creating shortcut", "Creating",
    Message has "Successfully", "Success",
    Message has "Failed" or Message has "Error", "Failed",
    "Unknown")
| project TimeGenerated, Operation, TableName, WorkspaceId, ShortcutName, Message, Level
| order by TimeGenerated asc
```

**查询 4:**
```kusto
// Find shortcut creation errors
let _tenant= "<TenantId>";
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where TenantId == _tenant
| where Message has "CreateShortcutAsync"
| where isnotempty(ExceptionType) and ExceptionType == "RequestFailedException"
```

**查询 5:**
```kusto
// Track external table creation
IngestionManagementLog
| where TimeGenerated > ago(24h)
| where Message has "ProvisionFederatedTableAsync"
    or Message has "Provisioned federated lake table"
| where Message has_any ("{TABLE_NAME}", "{ACCOUNT_ID}")
| extend TableName = extract(@"[Tt]able[:\s]+['\"]?(\w+)", 1, Message)
| extend AccountId = extract(@"accountId[:\s]+([a-f0-9\-]+)", 1, Message)
| extend Status = case(
    Message has "Successfully", "Success",
    Message has "Failed", "Failed",
    Message has "started", "Started",
    "InProgress")
| project TimeGenerated, Status, TableName, AccountId, Message, Level
| order by TimeGenerated asc
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 2: Calculating Log Analytics Workspace Allowance Usage
> 来源: ado-wiki-a-calculating-la-workspace-allowance.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Heartbeat Events**: Logs from agents (AMA/MMA) providing VM health/status
2. **Solutions Column**: Indicates applied solutions (security, antimalware)
3. **Category Column**: Differentiates AMA vs MMA agents

### Kusto 诊断查询
**查询 1:**
```kusto
let Unit = 'GB';
Usage
| where IsBillable == 'TRUE'
| where DataType in ("SecurityAlert", "SecurityBaseline", "SecurityDetection", "SecurityEvent", "WindowsFirewall", "ProtectionStatus", "Update", "UpdateSummary", "MDCFileIntegrityMonitoringEvents")
| project TimeGenerated, DataType, Solution, Quantity, QuantityUnit
| summarize DataConsumedPerDataType = sum(Quantity)/1024 by DataType, DataUnit = Unit
| sort by DataConsumedPerDataType desc
```

**查询 2:**
```kusto
Heartbeat
| where Category == "Azure Monitor Agent"
```

**查询 3:**
```kusto
Heartbeat
| summarize by Computer, SubscriptionId
| summarize TotalUnits = sum(Quantity) by bin(TimeGenerated, 1d), SCAgentChannel, SecuritySolution
| sort by TimeGenerated desc, SCAgentChannel asc, SecuritySolution asc
```

---

## Scenario 3: Troubleshooting Guide for Databricks Federation
> 来源: ado-wiki-a-databricks-federation-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Invalid Databricks URL**: Workspace URL incorrect
2. **Authentication Failure**: Service Principal lacks Databricks permissions
3. **Connection Creation Failed**: Fabric API error
4. **Catalog Name Invalid**: Databricks catalog doesn't exist
5. **Verify Databricks URL**: Check workspace URL is correct
6. **Check Service Principal Permissions**: Verify SP has `Contributor` role on Databricks workspace; check SP can authenticate
7. **Validate Catalog Name**: Catalog must exist in Databricks Unity Catalog; use case-sensitive name
8. **Verify Catalog and Schema Exist**: Check in Databricks Unity Catalog UI; verify schema contains tables
9. **Check JSON Response**: Query IngestionManagementLog for "Received tables JSON"
10. **Verify Token Acquisition**: Query for "Databricks" and "token"
11. **Check if Catalog Already Exists**: Query for "Databricks catalog" and "already exists"
12. **Verify Workspace ID**: Ensure Fabric workspace was created successfully
13. **Validate Connection ID**: Connection must be created before catalog
14. **Verify Complete Provisioning Flow**: Check all steps: Get Table -> Creating shortcut -> Storing -> Successfully Provisioned
15. **Check Databricks Catalog Details Stored**: Query for "DatabricksCatalogDetails"

### Kusto 诊断查询
**查询 1:**
```kusto
// Track Databricks connector instance lifecycle
IngestionManagementLog
| where TimeGenerated > ago(24h)
| where Message has "DatabricksConnector"
    or Message has "ProvisionOnboardingResourcesAsync"
| where Message has_any ("{TENANT_ID}", "{ACCOUNT_ID}", "{CONNECTOR_INSTANCE_ID}")
| extend ConnectorInstanceId = extract(@"connectorInstanceId[:\s]+([a-f0-9\-]+)", 1, Message)
| extend AccountId = extract(@"accountId[:\s]+([a-f0-9\-]+)", 1, Message)
| extend ProvisioningState = extract(@"ProvisioningState[:\s]+(\w+)", 1, Message)
| project TimeGenerated, ConnectorInstanceId, AccountId, ProvisioningState, Message, Level
| order by TimeGenerated asc
```

**查询 2:**
```kusto
// Track Databricks connection creation
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where Message has "connection" or Message has "Connection"
| where Message has "AzureDatabricksWorkspace"
| where Message has_any ("{ACCOUNT_ID}", "{CONNECTOR_INSTANCE_ID}")
| extend ConnectorInstanceId = extract(@"connectorInstanceId[:\s]+([a-f0-9\-]+)", 1, Message)
| extend ConnectionId = extract(@"[Cc]onnection['\"]?\s+['\"]?([a-f0-9\-]+)", 1, Message)
| extend Operation = case(
    Message has "Creating new connection", "Creating",
    Message has "Successfully created", "Success",
    Message has "Updating", "Updating",
    Message has "Failed", "Failed",
    "Unknown")
| project PreciseTimeStamp, Operation, ConnectorInstanceId, ConnectionId, Message, Level
| order by PreciseTimeStamp asc
```

**查询 3:**
```kusto
// Track Databricks table navigation
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where Message has "ListDatabricksTablesAsync"
    or Message has "Listing Databricks tables"
| where Message has_any ("{ACCOUNT_ID}", "{CATALOG_NAME}")
| extend CatalogName = extract(@"catalog[:\s]+['\"]?(\w+)", 1, Message)
| extend SchemaName = extract(@"schema[:\s]+['\"]?(\w+)", 1, Message)
| extend TableCount = extract(@"Found (\d+) tables", 1, Message)
| project PreciseTimeStamp, CatalogName, SchemaName, TableCount, Message, Level
| order by PreciseTimeStamp asc
```

**查询 4:**
```kusto
// Find Databricks API failures
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where Level in ("Error", "Warning")
| where Message has "Databricks" and Message has "tables"
| where Message has_any ("{ACCOUNT_ID}", "{CATALOG_NAME}")
| extend ErrorType = case(
    Message has "Empty response", "EmptyResponse",
    Message has "authentication", "AuthFailure",
    Message has "not found", "NotFound",
    "Unknown")
| project PreciseTimeStamp, ErrorType, Message, Exception
| order by PreciseTimeStamp desc
```

**查询 5:**
```kusto
// Track mirrored catalog creation
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where Message has "mirrored Azure Databricks catalog"
    or Message has "CreateMirroredAzureDatabricksCatalogAsync"
| where Message has_any ("{ACCOUNT_ID}", "{CONNECTOR_INSTANCE_ID}", "{WORKSPACE_ID}")
| extend ConnectorInstanceId = extract(@"connectorInstanceId[:\s]+([a-f0-9\-]+)", 1, Message)
| extend CatalogId = extract(@"catalog['\"]?\s+['\"]?([a-f0-9\-]+)", 1, Message)
| extend WorkspaceId = extract(@"workspace['\"]?\s+['\"]?([a-f0-9\-]+)", 1, Message)
| extend Operation = case(
    Message has "Creating mirrored", "Creating",
    Message has "Successfully created", "Success",
    Message has "already exists", "AlreadyExists",
    Message has "Failed", "Failed",
    "Unknown")
| project PreciseTimeStamp, Operation, ConnectorInstanceId, CatalogId, WorkspaceId, Message, Level
| order by PreciseTimeStamp asc
```

---

## Scenario 4: Exclusion from the correlation engine
> 来源: ado-wiki-a-exclusion-correlation-engine-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Per-rule tag overrides tenant default without clear UI distinction
2. Coach bubble persistence uses localStorage - clearing browser data causes reappearance
3. Changes are forward-looking only - existing incidents unaffected

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('wcdprod').database('TenantsStoreReplica').TenantsLatestSnapshotMV
| extend TenantId = tostring(AadTenantId)
| where TenantId == "<tenant_id>"
| extend FlagText = tolower(trim(" ", tostring(ExcludeSentinelAlertsFromXDRCorrelation)))
| extend TenantDefault = case(
  isempty(ExcludeSentinelAlertsFromXDRCorrelation), false,
  FlagText in ("true", "1"), true,
  false
 )
| project TenantId, ExcludeSentinelAlertsFromXDRCorrelation, TenantDefault
```

**查询 2:**
```kusto
database('SecurityInsightsProd').table('Span')
| where TIMESTAMP between (ago(1d) .. now())
| where name == "Microsoft.Azure.Security.Insights.AlertRules.AlertRulesSync.AlertRulesDbWorkersSync.SyncAlertRule"
| extend TenantId = tostring(env_properties["WorkspaceTenantId"])
| extend RuleId = tostring(env_properties["RuleId"])
| where TenantId == "<tenant_id>"
| extend IsCorrelationExcluded = tobool(tostring(env_properties["IsCorrelationExcluded"]))
| extend IsCorrelationIncluded = tobool(tostring(env_properties["IsCorrelationIncluded"]))
| extend RuleState = case(
  IsCorrelationExcluded == true, "Excluded (#DONT_CORR#)",
  IsCorrelationIncluded == true, "Included (#INC_CORR#)",
  "Untagged (follows tenant default)"
 )
| summarize count() by RuleState
```

**查询 3:**
```kusto
InETraces
| where service_name == "inr-sentinelgatewayjob"
| where message has "<system_alert_id>"
| where message startswith "Grouping configuration details for systemAlertId"
| parse message with *'systemAlertId "'alertId'"'*'ShouldExcludeFromCorrelations 'shouldExclude:bool
| project env_time, DC, alertId, shouldExclude, ContextId
```

**查询 4:**
```kusto
cluster('https://wcdprod.kusto.windows.net').database('Geneva').table('InEHttpRequestLog')
| where env_time between (ago(7d) .. now())
| where service_name == "mgmt-settingsservice"
| where RequestPath contains "mtpAdvancedFeaturesSetting"
| where ResponseStatusCode == 403
| where TenantId == "<tenant_id>"
| project env_time, TenantId, RequestPath, ResponseStatusCode, DC
```

---

## Scenario 5: Troubleshooting Guide for Microsoft Fabric Federation
> 来源: ado-wiki-a-fabric-federation-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Lakehouse Not Schema-Enabled**: Customer lakehouse must support schemas
2. **Invalid Lakehouse ID**: Lakehouse doesn't exist or is inaccessible
3. **Table Count Exceeds Limit**: More than 100 tables in registration request
4. **Invalid Table Path Format**: Must be `Tables/{schema}/{table}`
5. **Verify Schema Support**: Customer lakehouse must be schema-enabled (Fabric portal > Lakehouse Settings > Schema Support)
6. **Validate Table Count**: Query for "Cannot register more than"
7. **Check Path Format**: Query for "Invalid path" or "ValidateTablePath"
8. **Lakehouse Empty**: No schemas or tables exist
9. **Permission Denied**: Insufficient permissions to read lakehouse
10. **API Timeout**: Fabric API slow or unresponsive
11. **Invalid Schema Name**: Schema doesn't exist
12. **Invalid Source Path**: Customer lakehouse path doesn't exist
13. **Permission Issues**: Insufficient permissions to create share
14. **Recipient Principal Invalid**: UAMI or Service Principal not configured
15. **Path Count Exceeds Limit**: More than 100 paths in single share
16. **Invalid Target Path**: Schema path doesn't exist in MSG lakehouse
17. **Workspace ID Mismatch**: Wrong workspace specified
18. **Shortcut Request Invalid**: PathId or Name incorrect
19. **Acceptance Response Empty**: Fabric API returned null
20. **Workspace/Lakehouse Mismatch**: Tables have different customer workspace/lakehouse IDs

### Kusto 诊断查询
**查询 1:**
```kusto
// Track Fabric connector instance lifecycle
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where Message has "FabricConnector"
  or Message has "ProvisionOnboardingResourcesAsync"
| where Message has_any ("{TENANT_ID}", "{ACCOUNT_ID}", "{CONNECTOR_INSTANCE_ID}")
| extend ConnectorInstanceId = extract(@"connectorInstanceId[:\s]+([a-f0-9\-]+)", 1, Message)
| extend AccountId = extract(@"accountId[:\s]+([a-f0-9\-]+)", 1, Message)
| extend WorkspaceId = extract(@"[Ww]orkspace[Ii]d[:\s]+([a-f0-9\-]+)", 1, Message)
| extend LakehouseId = extract(@"[Ll]akehouse[Ii]d[:\s]+([a-f0-9\-]+)", 1, Message)
| project PreciseTimeStamp, ConnectorInstanceId, AccountId, WorkspaceId, LakehouseId, Message, Level
| order by PreciseTimeStamp asc
```

**查询 2:**
```kusto
// Check lakehouse schema validation
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where Message has "schema-enabled" or Message has "ValidateSchemaEnabled"
| where Message has_any ("{ACCOUNT_ID}", "{LAKEHOUSE_ID}")
| extend ValidationResult = case(
  Message has "not schema-enabled", "NotEnabled",
  Message has "is schema-enabled", "Enabled",
  "Unknown")
| project PreciseTimeStamp, ValidationResult, Message, Level
| order by PreciseTimeStamp desc
```

**查询 3:**
```kusto
// Track Fabric table navigation
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where Message has "NavigateAsync"
  or Message has "ListFabricTablesAsync"
  or Message has "ListFabricSchemasAsync"
| where Message has_any ("{ACCOUNT_ID}", "{LAKEHOUSE_ID}")
| extend WorkspaceId = extract(@"[Ww]orkspace[Ii]d[:\s]+([a-f0-9\-]+)", 1, Message)
| extend LakehouseId = extract(@"[Ll]akehouse[Ii]d[:\s]+([a-f0-9\-]+)", 1, Message)
| extend SchemaName = extract(@"[Ss]chema[Nn]ame[:\s]+['\"]?(\w+)", 1, Message)
| project PreciseTimeStamp, WorkspaceId, LakehouseId, SchemaName, Message, Level
| order by PreciseTimeStamp asc
```

**查询 4:**
```kusto
// Track External Data Share creation
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where Message has "CreateExternalDataShareAsync"
  or Message has "External Data Share"
| where Message has_any ("{ACCOUNT_ID}", "{TABLE_NAME}")
| extend TableName = extract(@"table[:\s]+['\"]?(\w+)", 1, Message)
| extend ExternalDataShareId = extract(@"[Ee]xternal[Dd]ata[Ss]hare[Ii]d[:\s]+([a-f0-9\-]+)", 1, Message)
| extend Operation = case(
  Message has "Creating new External Data Share", "Creating",
  Message has "Existing ExternalDataShareId found", "Existing",
  Message has "Failed", "Failed",
  "Unknown")
| project PreciseTimeStamp, Operation, TableName, ExternalDataShareId, Message
| order by PreciseTimeStamp asc
```

**查询 5:**
```kusto
// Track invitation retrieval
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where Message has "GetExternalDataShareInvitationAsync"
  or Message has "External Data Share Invitation"
| where Message has_any ("{ACCOUNT_ID}", "{TABLE_NAME}", "{INVITATION_ID}")
| extend InvitationId = extract(@"[Ii]nvitation[Ii]d[:\s]+([a-f0-9\-]+)", 1, Message)
| extend ExternalDataShareId = extract(@"[Ee]xternal[Dd]ata[Ss]hare[Ii]d[:\s]+([a-f0-9\-]+)", 1, Message)
| project PreciseTimeStamp, InvitationId, ExternalDataShareId, Message
| order by PreciseTimeStamp asc
```

---

## Scenario 6: MDC Resource-Based Usage Calculation
> 来源: ado-wiki-a-mdc-resource-based-usage-calculation.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
let subs = pack_array(
    "subscriptionId01",
    "subscriptionId02",
    "subscriptionIdLast"
);
let _startTime = datetime(yyyy-MM-dd);
let _endTime = datetime(yyyy-MM-dd);
let resourcesList =
cluster("rometelemetrydata.kusto.windows.net").database("RomeTelemetryProd").GetComputeUsageDaily()
    | where Timestamp between (_startTime .. _endTime)
    | where SubscriptionId in (subs)
    | where SourceImageType == "Azure Databricks"
    //| where IsVMScaleSet == bool(False)  // uncomment for VMSS
    | extend ArmId = tolower(ArmId)
    | distinct ArmId;
let BundleMeters =
cluster("https://rometelemetrydata.kusto.windows.net").database('RomeTelemetryProd').BillingMetersKnown()
    | where Bundle == "VirtualMachines"
    | where PricingTier != "Standard Trial"
    | where Enabled == true;
(cluster("RomeTelemetryData").database("RomeTelemetryProd").BillingReportsRawArchive
    | where UsageTime between (_startTime .. _endTime)
    | where SubscriptionId in (subs)
    | extend ResourceUri = tolower(ResourceUri)
    | join kind=inner BundleMeters on MeterId)
| join kind=inner resourcesList on $left.ResourceUri == $right.ArmId
| summarize ["Total Units"]=sum(Units) by MeterId, ArmId
```

---

## Scenario 7: How to Enable MEPM (Azure)
> 来源: ado-wiki-a-mepm-integration-azure-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **UI**: MEPM first-party is granted Reader role on the subscription.
2. **Backend**: Auto-provisioner creates required MEPM resources per subscription.

### Portal 导航路径
- Defender plans blade → Defender CSPM settings → enable "Permissions Management" extension
- CRI with customer tenant ID
- CRI with: Project ID, Subscription ID, query result, validation steps completed

### Kusto 诊断查询
**查询 1:**
```kusto
securityresources
| extend CiemAssessmentsKeys = dynamic(['d19d5a12-41e9-44e2-b7f5-ee2160f62d62', '8b0bd683-bcfe-4ab1-96b9-f15a60eaa89d'])
| where type == "microsoft.security/assessments"
| where CiemAssessmentsKeys contains name
| extend cloud = properties.resourceDetails.Source
| extend displayName = properties.displayName
| where cloud == "Azure"
| project name, id, subscriptionId, cloud, displayName, properties
| order by ['name'] asc
```

---

## Scenario 8: Multi Workspace TSG
> 来源: ado-wiki-a-multi-workspace-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Alerts from Alerts tables tagged with Sentinel product and primary workspace even if data not from Sentinel
2. Reopen closed incident not yet supported - alerts with "Reopen Closed Incident" rule correlated in new incident instead

### Portal 导航路径
- closed incident not yet supported - alerts with "Reopen Closed Incident" rule correlated in new incident instead

---

## Scenario 9: ado-wiki-a-ti-flat-file-how-to-find-id.md
> 来源: ado-wiki-a-ti-flat-file-how-to-find-id.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Go to "manage imports" blade:
2. Open the browser's developer tools (you can do it by pressing F12 in most browsers).
3. Go to the network tab:
4. Refresh the page using the refresh button:
5. You will see that a single call was sent:
6. click that row and go to "Preview". The response will look like this:
7. you can find the file you're looking for based on its location in the grid. For example, if you want to file the id for the second file in the grid, you would go to index 1, expand it, and you will see the id:

### Portal 导航路径
- "manage imports" blade:
- the browser's developer tools (you can do it by pressing F12 in most browsers)
- the network tab:
- index 1, expand it, and you will see the id:

---

## Scenario 10: ado-wiki-a-ti-upload-indicators-api.md
> 来源: ado-wiki-a-ti-upload-indicators-api.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- a collaboration with AAD

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 11: Overview (Containers High Resource Consumption)
> 来源: ado-wiki-b-containers-high-resource-consumption.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Normal behavior due to resource allocation limits.
2. Potential issues with pod performance indicated by frequent restarts.
3. Configuration errors causing unexpected resource consumption patterns.
4. **Check Pod Restarts:**
5. **Validate Defender Agent Functionality:**
6. **Review AKS Resource Utilization:**
7. **Examine Node Resource Allocation:**
8. **Analyze Logs:**

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('rome.kusto.windows.net').database('DetectionLogs').K8S_Logs
   | where EnvTime > ago(30d)
   | where AzureResourceId == "/subscriptions/XXX/resourceGroups/XXX/providers/Microsoft.ContainerService/managedClusters/XXX"
   | where Message startswith "Heartbeat"
   | project EnvTime, NodeName, ComponentName, Message
   | parse Message with "Heartbeat: " heartbeat
   | extend heartbeat = todynamic(heartbeat)
   | extend usage = heartbeat["Performance"]["Memory"]
   | parse usage with usage_num "Mi"
   | extend usage_num = toint(usage_num)
   | summarize max(usage_num) by NodeName, ComponentName, bin(EnvTime, 1h)
   | render timechart
```

---

## Scenario 12: ECR VA - Common Questions
> 来源: ado-wiki-b-ecr-va-common-questions.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Images that have at least one layer over 2GB are not scanned.
2. Public repositories and manifest lists are not supported.
3. Provisioning can take up to 30 min
4. Image scans are triggered every 1 hour
5. Error handling - reason of not applicable image does not show
6. Exemption does not work yet

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 13: Sentinel Alert Ingestion Delay query
> 来源: ado-wiki-b-ingestion-delays.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 14: TSG - MDC Cloud-Native Response Actions in XDR on Kubernetes (K8s) Pods
> 来源: ado-wiki-b-mdc-k8s-response-actions-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Exhaust all troubleshooting steps in this document
2. Collect detailed reproduction steps
3. Refer to MDC Escalation Path Lookup-vTeams-templates-and-categories-mapping)

### Portal 导航路径
- [Kusto TeamX Telemetry](https://dataexplorer

### Kusto 诊断查询
**查询 1:**
```kusto
Span
| where TIMESTAMP > ago(1d) // adjust date per case details
| where OperationResult == "Failure"
| where name in ("MtpActionBL.GetActionStatusAsync", "MtpActionBL.CreateMtpActionAsync", "AgentlessMessageHandler.HandleMessageAsync")
```

---

## Scenario 15: Configuring Microsoft Defender for Cloud: Email Notifications
> 来源: ado-wiki-b-r1-email-alert-notifications.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- **Environment Settings** and then select the subscription or management group where you like to setup the notifications

---

## Scenario 16: Alerts RootCause Tagging Map — Procedure for Case Closure
> 来源: ado-wiki-b-r1-root-cause-classification.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. AF alerts
2. AntimalwarePublisher
3. App Services alerts
4. ASC-R3 Alerts
5. CloudNetworkSecurity
6. DNS Alerts
7. FilelessAttackDetection
8. Key vault alerts
9. MDATP Alerts
10. Networking alerts
11. SQL alerts
12. Storage alerts
13. Windows/Linux alerts — MSTIC provider
14. Other alert provider

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('Rome').database('DetectionAlerts').GetRootCauseL4('{alertId}')
```

**查询 2:**
```kusto
cluster('Rome').database('DetectionAlerts').GetRootCauseL4('2517808671699577562_fbf37841-d839-4509-b5fd-a801fdca7166')
```

**查询 3:**
```kusto
let alert = cluster('RomeEUS.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts()
| where SystemAlertId == '{alertId}' | take 1;
AddRootCauseL4(alert) | project SystemAlertId, ProviderName, AlertType, RootCauseL4
```

**查询 4:**
```kusto
let alerts = <alerts query>;
cluster("Rome").database("DetectionAlerts").AddRootCauseL4(alerts)
| project ProviderName, AlertType, RootCauseL4
```

**查询 5:**
```kusto
let alerts = cluster("Rome").database("ProdAlerts").table("SecurityAlerts") | take 10;
cluster("Rome").database("DetectionAlerts").AddRootCauseL4(alerts)
| project ProviderName, AlertType, RootCauseL4
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 17: ado-wiki-b-taxii-connector-tsg.md
> 来源: ado-wiki-b-taxii-connector-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. https://portal.microsofticm.com/imp/v3/incidents/details/335462260/home
2. https://portal.microsofticm.com/imp/v3/incidents/details/328558056/home

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('SecurityInsights').database('SecurityInsightsProd').ServiceFabricDynamicOE
| where env_time > ago(10d) 
//| where resultType == "Failure" or resultType=="ClientError"
| where customData contains "e6a8b789-4565-419e-b899-7d78990b5bbe" //workspace id
| where operationName contains "Sentinel.Connectors.ConnectorsService.Handlers.ConnectorTypeHandlers.TaxiiConnectorHandler"
| project env_time, operationName, resultType,  resultSignature, resultDescription, rootOperationId, customData
```

---

## Scenario 18: Refrence ICM
> 来源: ado-wiki-b-ti-private-preview-actions.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 19: Sensitivity Settings Troubleshooting
> 来源: ado-wiki-b-tsg-sensitivity-settings.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. User has insufficient permissions
2. ARM / Service issue
3. Bad Request

### Kusto 诊断查询
**查询 1:**
```kusto
MdfcIpServiceLogs
| where TIMESTAMP > ago(1d)
| where TenantId == "<TenantId>"
| where env_cloud_role == "ArmRequestRouter"
```

**查询 2:**
```kusto
MdfcIpServiceLogs
| where TIMESTAMP > ago(1d)
| where Env == "PROD"
| where OperationName == "GetSensitivitySettings" or OperationName == "PutSensitivitySettings"
| where TenantId == "<TenantId>"
| project TIMESTAMP, TenantId, Message, Exception
```

**查询 3:**
```kusto
MdfcIpServiceLogs
| where TIMESTAMP > ago(14d)
| where Env == "PROD"
| where TenantId == "<tenantID>"
| where Message startswith "Salus Event Hub Payload message ResourceStatusUpdatePayload"
| parse Message with * "/Microsoft.Storage/storageAccounts/" StorageName ", TenantId =" * ", Status = " SensitivityStatus ", Plan" *
| where StorageName == "<storageaccount>"
| project TIMESTAMP, TenantId, StorageName, SensitivityStatus
```

**查询 4:**
```kusto
MdfcIpServiceLogs
| where TIMESTAMP > ago(7d)
| where Service == "Salus"
| where * contains "<storageaccountname>"
```

---

## Scenario 20: USX Content Acceleration - SIEM Migration TSG
> 来源: ado-wiki-b-usx-content-acceleration.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Customers can select rules to deploy on "Configure and deploy" section.
2. Once selection done, customers can see the status of each rule deployment in notifications.
3. For any deployment issue, collect from customers:

---

## Scenario 21: ado-wiki-c-byol-va-troubleshooting-guide.md
> 来源: ado-wiki-c-byol-va-troubleshooting-guide.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. In Azure portal, navigate to “**Defender for Cloud**”. In the left menu, navigate to “**Security solutions**” under “**Management**”
2. Under “Connected solutions”, you'll see Qualys Vulnerability Assessment if it is still enabled. Click on “**View**”, select your Virtual Machines (VMs), and “**unlink**”.
3. After unlinking all Virtual Machines (VMs), delete the Qualys solution (needs **Owner** permissions on the subscription).
4. Now that Qualys is removed, you can enable the **Vulnerability assessment for machines** under the Server plan.

### Portal 导航路径
- the machine under virtual machines (VMs) (Arm and classic) -> click on extensions -> find Qualys agent -> click on uninstall
- a case that requires debugging the agent, see Opening a case with Qualys
- a ticket with Qualys:
- a ticket with Qualys
- the Qualys dashboard and look for the status of this resource

### 脚本命令
```powershell
TraceEvent 
| where env_cloud_deploymentUnit == "cus-rp-solutions-prod" 
| where message has "SUBSCRIPTION_ID_HERE" and message has "DeleteProtectedResource" and message has "isn't running or its provision state isn't succeeded"
| extend resourceId = extract("resource ([^ ]+) isn't", 1, message) 
| summarize max(env_time) by resourceId
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 22: Adaptive network hardening FAQ
> 来源: ado-wiki-c-tsg-adaptive-network-hardening.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Remediating recommendations on unhealthy resources.
2. Understanding inapplicability on other resources.
3. Edit the inbound rules on NSGs associated with VMs to restrict access to specific source ranges.
4. Select a VM to restrict access to.
5. In the 'Networking' blade, click the NSG with overly permissive rules.
6. In the 'Network security group' blade, improve rules for ports 80, 443 by applying a less permissive IP range.
7. Apply changes and click 'Save'.
8. Allow only the WAF IP address in the source IP ranges.
9. Update the web application's DNS record to the WAF IP address.
10. Check the calculation result per subscription and assessment.
11. Extract the inapplicability reason of each resource.

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 23: Watchlist is not getting deleted
> 来源: ado-wiki-d-tsg-watchlist-not-getting-deleted.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. You should see activity Logs for specific Watchlist.
2. That delete operation will **write more logs in LAW** marking each **Watchlist ItemStatus from Create to Delete**.
3. `_GetWatchlist('xyz')` function will only try to get Recent logs with Watchlist Items with ItemStatus set to "Create" only.

### Portal 导航路径
- ASC and Run below query on Sentinel Workspace:

### Kusto 诊断查询
**查询 1:**
```kusto
let _startTime = datetime(2024-09-30T21:10:12Z);
let _endTime = datetime(2024-10-01T21:10:12Z);
let _filterall = '';
let _operationName = ''; // Must put Operation Name
let _resourceid = ''; // Must put Watchlist ResourceID or Watchlist Name
let _status = '';
let _subscriptionid = ''; // Workspace Subscription ID
cluster("armprodgbl").database("ARMProd").Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP between (_startTime .. _endTime)
| where subscriptionId == _subscriptionid
| where status contains _status
| where operationName contains _operationName
| where resourceUri contains _resourceid
| where * contains _filterall
| sort by TIMESTAMP
| project-reorder TIMESTAMP, status, operationName, operationId, resourceUri, subscriptionId
| take 100
```

**查询 2:**
```kusto
let watchlistAlias = ""; //watchlistAlias in question.
union Watchlist, ConfidentialWatchlist
| where TimeGenerated < now()
| where _DTItemType == 'watchlist-item'
| where WatchlistAlias == watchlistAlias
//| where _DTItemStatus != 'Delete'
| project-reorder TimeGenerated, _DTItemStatus, WatchlistAlias, WatchlistId, WatchlistItemId, SearchKey, WatchlistItem
```

---

## Scenario 24: ASR Rules Troubleshooting Guide
> 来源: mslearn-asr-troubleshooting.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Enable Audit mode** for the problem rule (action = 2)
2. Reproduce the issue and check Windows Event Viewer:
3. **Add exclusions** via Intune, Group Policy, or PowerShell:
4. Verify rule is in Block mode (not Audit):
5. Verify no extra characters (quotes/spaces) in Group Policy GUID values
6. If still not working, collect diagnostics and report to Microsoft

### 脚本命令
```powershell
$p=Get-MpPreference
   0..([math]::Min($p.AttackSurfaceReductionRules_Ids.Count,$p.AttackSurfaceReductionRules_Actions.Count)-1) | % {
     [pscustomobject]@{Id=$p.AttackSurfaceReductionRules_Ids[$_];Action=$p.AttackSurfaceReductionRules_Actions[$_]}
   } | Format-Table -AutoSize
```

---

## Scenario 25: Defender Antivirus Performance Troubleshooting Guide
> 来源: mslearn-mdav-performance-troubleshooting.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **MDAV Diagnostic Data**: `MpCmdRun.exe -GetFiles` → always collect first
2. **Performance Analyzer**: Purpose-built for MDAV perf issues; run during reproduction
3. **Process Monitor (ProcMon)**: 5-10 min capture during reproduction if PA insufficient
4. **WPRUI/WPR**: Advanced tracing; limit to 3-5 min; most verbose option

---

## Scenario 26: Adaptive Application Control (AAC) Troubleshooting Guide
> 来源: onenote-adaptive-application-control.md | 适用: Mooncake ✅

### 排查步骤
1. Verify machines in AAC list (reported events in last day)
2. If NOT in list:

### Kusto 诊断查询
**查询 1:**
```kusto
AppWhitelistingVmsIngestion
| where SubscriptionId == "<sub-id>"
| where ResourceId contains "<vm-resource-id>"
```

**查询 2:**
```kusto
AppWhitelistingConfigurationsIngestion
| where SubscriptionId == "<sub-id>"
| where VmRecommendations contains "<vm-resource-id>"
```

**查询 3:**
```kusto
AppWhitelistingGroupsIngestion
| where SubscriptionId == "<sub-id>"
```

**查询 4:**
```kusto
TraceEvent
| where env_time > ago(1d)
| where env_cloud_name == "Rome.R3.AppWhitelistingRP"
| where message has "PutGroupDataAsync"
| order by env_time asc
| project env_time, message, env_cv
```

---
