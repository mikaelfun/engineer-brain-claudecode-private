---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Microsoft Sentinel data lake/[TSG] - Sentinel data lake - Data Federation/[TSG] - ADLS Gen2 Federation"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Microsoft%20Sentinel%20data%20lake/%5BTSG%5D%20-%20Sentinel%20data%20lake%20-%20Data%20Federation/%5BTSG%5D%20-%20ADLS%20Gen2%20Federation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting guide for ADLS Gen2 Federation

## Overview

Architecture of Data Federation from ADLS in Sentinel Data Federation.

## Table Navigation Issues

### Symptom
Connector Instance does not show Tables Or Navigation shows Failures

### Troubleshooting Steps
- If CorrelationId is present from the HAR files, grab CorrelationId for the failed API calls from the header `x-ms-correlation-request-id`
- Check if there is a Navigate Failure for failing request
- If Error shows KeyVault access failed, MSG Managed Identity does not have access to the KeyVault
- If Error shows Permission denied as the failure reason, the ServicePrincipal does not have access to Storage Account
- If there is any other error, please contact the Engineering Team with Query Results for further Investigation using the ICM Team

### Kusto Query - Navigation Failures

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

## Table Discovery Issues

### Kusto Query - Delta Table Discovery

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

### Root Cause Analysis
1. **Invalid ADLS URL**: Container or path doesn't exist
2. **Permission Denied**: Service Principal lacks read access
3. **No Delta Tables**: Path doesn't contain Delta Lake tables
4. **Network Issues**: Firewall blocking ADLS access

### Resolution Steps
1. **Verify ADLS Path Exists**: Check container exists at `https://{account}.dfs.core.windows.net/{container}`
2. **Verify Delta Tables Exist**: Tables must have `_delta_log` directory
3. **Test with Different Path**: Try navigating parent container first, narrow down to specific folder

## Table Registration Issues

### Symptom
Customer is unable to register a set of selected tables for Federation

### Troubleshooting Steps
Table Registration can fail for multiple reasons:
- First time onboarding: Fabric Provisioning failures in AME (workspace, Lakehouse, Capacity creation issues; Private Link Service creation issues)
- Failures during Fabric Connection, Shortcuts creation
- Failures to create External Tables in Kusto
- Identify the type of errors and Create ICM to Engineering team with Kusto Query and results

### Kusto Query - Shortcut Creation Tracking

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

### Kusto Query - Shortcut Creation Failures

```kusto
// Find shortcut creation errors
let _tenant= "<TenantId>";
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where TenantId == _tenant
| where Message has "CreateShortcutAsync"
| where isnotempty(ExceptionType) and ExceptionType == "RequestFailedException"
```

### Root Cause Analysis
1. **Connection ID Missing**: Connection not created during onboarding
2. **Invalid Path**: ADLS path doesn't exist or is malformed
3. **Lakehouse Full**: OneLake storage quota exceeded
4. **Duplicate Shortcut**: Shortcut with same name already exists

## External Table Creation Failures

### Kusto Query - External Table Creation

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

### Kusto Query - Fabric Details Missing

```kusto
// Detect missing Fabric details
IngestionManagementLog
| where TimeGenerated > ago(24h)
| where Message has "Fabric Details is missing"
| where Message has_any ("{TABLE_NAME}", "{ACCOUNT_ID}")
| project TimeGenerated, Message
| order by TimeGenerated desc
```

### Resolution Steps
1. **Verify Table Pre-creation**: Table must exist in MSG system before federation. Check table was created via CreateCustomTable API.
2. **Check Fabric Details Initialization**: Query IngestionManagementLog for "Get Table" and "for Fabric Connector"
3. **Verify Complete Flow**: Check end-to-end: Get Table -> Creating shortcut -> Successfully Provisioned
