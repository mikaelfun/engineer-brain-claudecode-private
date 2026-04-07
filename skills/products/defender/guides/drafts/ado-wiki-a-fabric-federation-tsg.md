---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Microsoft Sentinel data lake/[TSG] - Sentinel data lake - Data Federation/[TSG] - Microsoft Fabric Federation"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Microsoft%20Sentinel%20data%20lake/%5BTSG%5D%20-%20Sentinel%20data%20lake%20-%20Data%20Federation/%5BTSG%5D%20-%20Microsoft%20Fabric%20Federation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting Guide for Microsoft Fabric Federation

## Overview
Architecture of Data Federation from Microsoft Fabric workspace in Sentinel Data Federation.

## 1. Troubleshoot Connector Instance Creation Issues

### Symptoms
- Fabric connector creation fails
- Lakehouse validation errors
- Schema validation failures

### Kusto Query - Fabric Connector Creation

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

### Kusto Query - Schema Validation

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

### Root Cause Analysis
1. **Lakehouse Not Schema-Enabled**: Customer lakehouse must support schemas
2. **Invalid Lakehouse ID**: Lakehouse doesn't exist or is inaccessible
3. **Table Count Exceeds Limit**: More than 100 tables in registration request
4. **Invalid Table Path Format**: Must be `Tables/{schema}/{table}`

### Resolution Steps
1. **Verify Schema Support**: Customer lakehouse must be schema-enabled (Fabric portal > Lakehouse Settings > Schema Support)
2. **Validate Table Count**: Query for "Cannot register more than"
3. **Check Path Format**: Query for "Invalid path" or "ValidateTablePath"

## 2. Troubleshoot Table Navigation Failures

### Symptoms
- Cannot list Fabric tables
- Schema listing fails
- Empty results returned

### Kusto Query - Fabric Navigation

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

### Root Cause Analysis
1. **Lakehouse Empty**: No schemas or tables exist
2. **Permission Denied**: Insufficient permissions to read lakehouse
3. **API Timeout**: Fabric API slow or unresponsive
4. **Invalid Schema Name**: Schema doesn't exist

## 3. Troubleshoot Table Registration Failures

### 3.1 External Data Share Creation Issues

#### Symptoms
- External Data Share creation fails
- Error: "Failed to create external data share"
- Recipient service principal issues

#### Kusto Query - External Data Share Creation

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

#### Root Cause Analysis
1. **Invalid Source Path**: Customer lakehouse path doesn't exist
2. **Permission Issues**: Insufficient permissions to create share
3. **Recipient Principal Invalid**: UAMI or Service Principal not configured
4. **Path Count Exceeds Limit**: More than 100 paths in single share

#### Key Tenant IDs
- **Provider Tenant ID**: Should be customer's tenant
- **Recipient Tenant ID**: Should be AME tenant (`33e01921-4d64-4f8c-a055-5bdaffd5e33d`)

### 3.2 External Data Share Invitation Issues

#### Symptoms
- Cannot get invitation details
- Invitation not found or expired

#### Kusto Query - Invitation Retrieval

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

### 3.3 External Data Share Acceptance Issues

#### Symptoms
- Acceptance fails
- Shortcut creation fails during acceptance

#### Kusto Query - Invitation Acceptance

```kusto
// Track invitation acceptance
IngestionManagementLog
| where TimeGenerated > ago(24h)
| where Message has "AcceptExternalDataShareInvitationAsync"
  or Message has "Accepting External Data Share Invitation"
| where Message has_any ("{ACCOUNT_ID}", "{TABLE_NAME}", "{INVITATION_ID}")
| extend InvitationId = extract(@"[Ii]nvitation[Ii]d[:\s]+([a-f0-9\-]+)", 1, Message)
| extend TableName = extract(@"table[:\s]+['\"]?(\w+)", 1, Message)
| project TimeGenerated, TableName, InvitationId, Message, Level
| order by TimeGenerated asc
```

#### Root Cause Analysis
1. **Invalid Target Path**: Schema path doesn't exist in MSG lakehouse
2. **Workspace ID Mismatch**: Wrong workspace specified
3. **Shortcut Request Invalid**: PathId or Name incorrect
4. **Acceptance Response Empty**: Fabric API returned null

### 3.4 External Table Creation Failures

#### Kusto Query - Complete Fabric Table Provisioning

```kusto
// Track end-to-end Fabric table provisioning
IngestionManagementLog
| where TimeGenerated > ago(1h)
| where Message has "{TABLE_NAME}"
| where Message has_any (
  "Provisioning federated lake table",
  "Storing shortcut details",
  "Getting connection id",
  "Storing connection id",
  "Successfully Provisioned")
| extend Step = case(
  Message has "Provisioning federated", "1_Start",
  Message has "Storing shortcut", "2_Shortcut",
  Message has "Getting connection", "3_GetConnection",
  Message has "Storing connection", "4_StoreConnection",
  Message has "Successfully", "5_Complete",
  "Unknown")
| project TimeGenerated, Step, Message
| order by TimeGenerated asc
```

### 3.5 Batch Registration Issues

#### Symptoms
- Batch registration partially fails
- Some tables succeed, others fail
- Schema group processing errors

#### Kusto Query - Batch Processing

```kusto
// Track batch provisioning flow
IngestionManagementLog
| where TimeGenerated > ago(1h)
| where Message has "Batch provisioning"
  or Message has "schema group"
  or Message has "Grouped"
| where Message has "{ACCOUNT_ID}"
| extend TableCount = extract(@"(\d+)\s+tables", 1, Message)
| extend SchemaGroups = extract(@"(\d+)\s+schema group", 1, Message)
| project TimeGenerated, TableCount, SchemaGroups, Message
| order by TimeGenerated asc
```

#### Kusto Query - Batch Consistency Validation

```kusto
// Check for consistency errors
IngestionManagementLog
| where TimeGenerated > ago(1h)
| where Level in ("Error", "Warning")
| where Message has_any ("CustomerWorkspaceId", "CustomerLakehouseId", "different external data shares")
| where Message has "{ACCOUNT_ID}"
| extend ErrorType = case(
  Message has "CustomerWorkspaceId", "WorkspaceMismatch",
  Message has "CustomerLakehouseId", "LakehouseMismatch",
  Message has "different external data shares", "ShareMismatch",
  "Unknown")
| project TimeGenerated, ErrorType, Message
| order by TimeGenerated desc
```

#### Root Cause Analysis
1. **Workspace/Lakehouse Mismatch**: Tables have different customer workspace/lakehouse IDs
2. **Multiple External Data Shares**: Tables already federated with different share IDs
3. **Schema Group Limit**: Too many schemas in batch
4. **Partial Failure**: Some tables succeed, others fail
