---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Microsoft Sentinel data lake/[TSG] - Sentinel data lake - Data Federation/[TSG] - Databricks Federation"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Microsoft%20Sentinel%20data%20lake/%5BTSG%5D%20-%20Sentinel%20data%20lake%20-%20Data%20Federation/%5BTSG%5D%20-%20Databricks%20Federation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting Guide for Databricks Federation

## Overview
Architecture of Data Federation from Databricks workspace in Sentinel Data Federation.

## 1. Troubleshoot Connector Instance Creation Issues

### Symptoms
- Databricks connector creation fails
- Mirrored catalog creation fails
- Connection creation errors

### Kusto Query - Databricks Connector Creation

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

### Kusto Query - Databricks Connection Creation

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

### Root Cause Analysis
1. **Invalid Databricks URL**: Workspace URL incorrect
2. **Authentication Failure**: Service Principal lacks Databricks permissions
3. **Connection Creation Failed**: Fabric API error
4. **Catalog Name Invalid**: Databricks catalog doesn't exist

### Resolution Steps
1. **Verify Databricks URL**: Check workspace URL is correct
2. **Check Service Principal Permissions**: Verify SP has `Contributor` role on Databricks workspace; check SP can authenticate
3. **Validate Catalog Name**: Catalog must exist in Databricks Unity Catalog; use case-sensitive name

## 2. Troubleshoot Table Navigation Failures

### Symptoms
- Cannot list Databricks tables
- Empty response from navigation
- Authentication errors

### Kusto Query - Databricks Navigation

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

### Kusto Query - Databricks API Errors

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

### Resolution Steps
1. **Verify Catalog and Schema Exist**: Check in Databricks Unity Catalog UI; verify schema contains tables
2. **Check JSON Response**: Query IngestionManagementLog for "Received tables JSON"
3. **Verify Token Acquisition**: Query for "Databricks" and "token"

## 3. Troubleshoot Table Registration Failures

### 3.1 Mirrored Catalog Creation Failures

#### Symptoms
- Mirrored catalog creation fails
- Catalog already exists errors
- Workspace ID issues

#### Kusto Query - Mirrored Catalog Creation

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

#### Resolution Steps
1. **Check if Catalog Already Exists**: Query for "Databricks catalog" and "already exists"
2. **Verify Workspace ID**: Ensure Fabric workspace was created successfully
3. **Validate Connection ID**: Connection must be created before catalog

### 3.2 Shortcut Creation Failures

```kusto
// Track Databricks shortcut creation
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where Message has "Creating shortcut"
| where Message has "OneLake" or Message has "catalog"
| where Message has_any ("{TABLE_NAME}", "{ACCOUNT_ID}")
| extend TableName = extract(@"[Tt]able[:\s]+['\"]?(\w+)", 1, Message)
| extend CatalogId = extract(@"catalog[:\s]+([a-f0-9\-]+)", 1, Message)
| extend Path = extract(@"path[:\s]+([^\s]+)", 1, Message)
| project PreciseTimeStamp, TableName, CatalogId, Path, Message, Level
| order by PreciseTimeStamp asc
```

### 3.3 External Table Creation Failures

```kusto
// Track end-to-end Databricks table provisioning
IngestionManagementLog
| where PreciseTimeStamp > ago(24h)
| where Message has_any ("ProvisionFederatedTableAsync", "Successfully Provisioned")
| where Message has "{TABLE_NAME}"
| where Message has "Databricks" or Message has "catalog"
| extend Status = case(
    Message has "Successfully", "Success",
    Message has "Failed", "Failed",
    Message has "started", "Started",
    "InProgress")
| project PreciseTimeStamp, Status, Message, Level
| order by PreciseTimeStamp asc
```

#### Resolution Steps
1. **Verify Complete Provisioning Flow**: Check all steps: Get Table -> Creating shortcut -> Storing -> Successfully Provisioned
2. **Check Databricks Catalog Details Stored**: Query for "DatabricksCatalogDetails"
