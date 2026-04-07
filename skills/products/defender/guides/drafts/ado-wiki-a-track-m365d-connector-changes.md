---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Microsoft First Party Connectors/Microsoft 365 Defender/Track connector changes"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FMicrosoft%20First%20Party%20Connectors%2FMicrosoft%20365%20Defender%2FTrack%20connector%20changes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Track M365 Defender Connector Changes

## Telemetry

Given a Tenant ID, track requests made to M365:

```kusto
cluster('wcdprod.kusto.windows.net').database('Geneva').HttpRequestLog
| where env_time>ago(14d)
| where * has "{TenantID}"
| sort by TIMESTAMP desc
```

## Disconnect the connector

The M365D connector has a logic that makes a DELETE call to `api/dataexportsettings` when all checkboxes are unchecked and saves the changes.

### Track UI disconnect action

```kusto
cluster('asiusagetelemetryprod.eastus.kusto.windows.net').database('usagetelemetyprod').CustomerConnectOperationsFromUI
| where timestamp > ago(90d)
| where Message contains "DataExportSettings"
| where WorkspaceArmId == "/subscriptions/{SubscriptionID}/resourceGroups/{ResourceGroup}/providers/Microsoft.OperationalInsights/workspaces/{WorkspaceName}"
```

### Track DELETE operation from M365 side

```kusto
cluster('wcdprod.kusto.windows.net').database('Geneva').HttpRequestLog
| where env_time>ago(90d)
| where HttpMethod =~ "delete"
| where OrgId == "{OrgId}"
| where Controller == "DataExportSettings"
| project env_time, DurationMs, HttpMethod, StatusCode, CorrelationId, AppId, AppName, OrgId, RequestUrl, ExposedWorkloads, ObjectId
```

### Track all Sentinel activities for a tenant

```kusto
cluster('wcdprod.kusto.windows.net').database('Geneva').HttpRequestLog
| where env_time>ago(10d)
| where Sha256TenantId == hash_sha256(tolower("{TenantID}"))
| where AppName == "Sentinel"
| sort by TIMESTAMP desc
```

### Track DataExportSettings changes over longer period

```kusto
cluster('wcdprod.kusto.windows.net').database('Geneva').HttpRequestLog
| where env_time>ago(365d)
| where OrgId == "{OrgId}"
| where Controller == "DataExportSettings"
| project env_time, DurationMs, HttpMethod, StatusCode, CorrelationId, AppId, AppName, OrgId, RequestUrl, ExposedWorkloads, ObjectId
```

The OrgId can be found by looking in the HttpRequestLog using the Tenant ID.

Based on [ICM 408859230](https://portal.microsofticm.com/imp/v3/incidents/incident/408859230/summary).
