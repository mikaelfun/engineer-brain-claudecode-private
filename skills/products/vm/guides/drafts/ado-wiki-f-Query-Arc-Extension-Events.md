---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/How Tos/Azure Arc Extension/How to query Azure Arc Extension events_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FHow%20Tos%2FAzure%20Arc%20Extension%2FHow%20to%20query%20Azure%20Arc%20Extension%20events_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Kusto Queries for Azure Arc Extension (AzureFileSyncAgentExtension) Diagnostics

## Permissions

Join security group **'Guest Config Kusto access (partners)'** (TM-GuestConfigKusto@microsoft.com) on aka.ms/idweb.

## Kusto Cluster

- https://guestconfigprod.kusto.windows.net//GuestConfigProd

## Queries

### Total Attempts for Extension

```kql
let extensions = pack_array("AzureFileSyncAgentExtension");
cluster("guestconfigprod.kusto.windows.net").database("GuestConfigProd").EtwAgentTelemetry
| where TIMESTAMP > ago(7d)
| where Region !contains "EUAP"
| where operation in ("EnableEnd") // Can be set to "DisableEnd" "UninstallEnd"
| where extensionType in (extensions)
| extend op = case(
    operation contains "EnableEnd", "Install",
    operation contains "UninstallEnd", "Uninstall",
    "TBD")
| extend ErrorType = case(
    message contains "A system reboot is pending due to Storage Sync file rename operations", "By design - Reboot pending",
    exitCode contains "1618", "By design - Other install running (ERROR_INSTALL_ALREADY_RUNNING)",
    message contains "Extension Enable command timed out" and exitCode contains "63", "Failed: Install timed out",
    message contains "The digital signature is not valid" and exitCode contains "86", "By design: AFS signature validation failed",
    message contains "Certificate chain validation failed" and exitCode contains "87", "By design: Certificate chain validation failed",
    exitCode contains "51" and message contains "The Azure File Sync agent is only supported on RTM", "By design - Unsupported non-RTM Server OS version",
    exitCode contains "1" and message contains "System.Net.Http.HttpClient", "Failed: PowerShell issue with ::new(HttpClient)",
    exitCode contains "214", "Failed - Unknown error",
    message contains "Azure File Sync agent is already installed", "Success (AFS already installed)",
    exitCode contains "63", "Failed: Enable command timed out",
    exitCode contains "62", "Failed: Error occurred in the arcagent outside of running the extension commands",
    exitCode contains "215", "By design: Mitigation Redirection Policy check failure, require latest windows updates on machine",
    message contains "because it is being used by another process", "Failed: Log file in use",
    exitCode contains "1603", "Failed - Need msi installation log to root cause the error",
    exitCode contains "0", "Success",
    "TBD")
| summarize TimeStamp=max(PreciseTimeStamp) by extensionVersion, op, exitCode, ErrorType, status, Region, machineId
| where ErrorType !contains "Success (AFS already installed)"
| order by TimeStamp desc
```

### Install Errors Distribution

```kql
let extensions = pack_array("AzureFileSyncAgentExtension");
cluster("guestconfigprod.kusto.windows.net").database("GuestConfigProd").EtwAgentTelemetry
| where TIMESTAMP > ago(30d)
| where Region !contains "EUAP"
| where operation in ("EnableEnd")
| where extensionType in (extensions)
| extend op = case(
    operation contains "EnableEnd", "Install",
    operation contains "UninstallEnd", "Uninstall",
    "TBD")
| extend ErrorType = case(
    message contains "A system reboot is pending due to Storage Sync file rename operations", "By design - Reboot pending",
    exitCode contains "1618", "By design - Other install running (ERROR_INSTALL_ALREADY_RUNNING)",
    message contains "timed out" and exitCode contains "63", "Failed: Install timed out",
    message contains "The digital signature is not valid" and exitCode contains "86", "By design: AFS signature validation failed",
    message contains "Certificate chain validation failed" and exitCode contains "87", "By design: Certificate chain validation failed",
    exitCode contains "51" and message contains "The Azure File Sync agent is only supported on RTM", "By design: Unsupported non-RTM Server OS version",
    exitCode contains "1" and message contains "System.Net.Http.HttpClient", "Failed: PowerShell issue with ::new(HttpClient)",
    exitCode contains "214", "Failed - Unknown error",
    exitCode contains "215" and message contains "Mitigation Redirection Policy configuration failed", "By design: Mitigation redirection policy failed, missing updates",
    message contains "Azure File Sync agent is already installed", "Success (AFS already installed)",
    exitCode contains "62", "Failed: Error occurred in the arcagent outside of running the extension commands",
    exitCode contains "215", "Mitigation Redirection Policy check failure, require latest windows updates on machine",
    message contains "because it is being used by another process", "Failed: Log file in use",
    exitCode contains "0", "Success",
    "TBD")
| summarize TimeStamp=max(PreciseTimeStamp) by extensionVersion, op, exitCode, ErrorType, status, Region, machineId
| summarize count() by ErrorType, extensionVersion, exitCode
| where ErrorType !contains "Success (AFS already installed)"
| order by count_ desc
```

### Arc Extension Errors (last 30 days)

```kql
let extensions = pack_array("AzureFileSyncAgentExtension");
cluster("guestconfigprod.kusto.windows.net").database("GuestConfigProd").EtwAgentTelemetry
| where TIMESTAMP > ago(30d)
| where operation in ("EnableEnd", "UninstallEnd")
| where extensionType in (extensions)
| summarize TimeStamp=max(PreciseTimeStamp), ServerCount=dcount(machineId) by extensionPublisher, extensionName, extensionVersion, extensionType, operation, exitCode, status, Region, resourceId, message, machineId
| where message !contains "completed successfully"
```

## Common Error Types Reference

| Exit Code | Error Type | Description |
|-----------|-----------|-------------|
| 0 | Success | Install completed successfully |
| 51 | By design | Unsupported non-RTM Server OS version |
| 62 | Failed | Error occurred in arcagent outside extension commands |
| 63 | Failed | Enable command timed out |
| 86 | By design | AFS signature validation failed |
| 87 | By design | Certificate chain validation failed |
| 214 | Failed | Unknown error |
| 215 | By design | Mitigation Redirection Policy check failure |
| 1603 | Failed | Need MSI installation log to root cause |
| 1618 | By design | Other install already running |
