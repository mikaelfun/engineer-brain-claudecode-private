---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Connector Health/Connector Connected and Disconnected status"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FConnector%20Health%2FConnector%20Connected%20and%20Disconnected%20status"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Connector Connected and Disconnected Status

This page explains the logic behind how different Sentinel connectors determine their Connected/Disconnected status in the UI.

## F5 BIG-IP

F5 connectivity check **only** looks at `F5Telemetry_system_CL` table (not other F5 tables like LTM or ASM).

The connectivity query is:
```kusto
F5Telemetry_system_CL
| summarize LastLogReceived = max(TimeGenerated)
| project IsConnected = LastLogReceived > ago(7d)
```

**Key insight**: If no data in `F5Telemetry_system_CL` for >7 days, the connector shows "Disconnected" even if other F5 tables have recent data.

Data types tracked:
- `F5Telemetry_LTM_CL`
- `F5Telemetry_system_CL` (used for connectivity check)
- `F5Telemetry_ASM_CL`

## Azure Active Directory

AAD uses a smarter connectivity check with `MultipleDataTypesDataConnectorFactory` that constructs a query using multiple tables:
- SigninLogs
- AuditLogs
- AADNonInteractiveUserSignInLogs
- AADServicePrincipalSignInLogs
- AADManagedIdentitySignInLogs
- AADProvisioningLogs
- ADFSSignInLogs
- AADUserRiskEvents
- AADRiskyUsers
- NetworkAccessTraffic
- AADRiskyServicePrincipals
- AADServicePrincipalRiskEvents

Unlike F5, AAD checks across multiple tables for connectivity status, making it less likely to show false "Disconnected" status.

## General Pattern

Each connector defines:
- `connectivityCriterias`: Determines Connected/Disconnected using `createIsConnectedQuery()` which checks `max(TimeGenerated) > ago(7d)` on specific tables
- `dataTypes`: Lists all tables with their `lastDataReceivedQuery`

The key difference is which tables are used for the connectivity check vs. data type listing.
