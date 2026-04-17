---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Alerts/[Troubleshooting Guide] - Testing Alerts/[TSG] - Security Alert Testing"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Security%20Alerts/%5BTroubleshooting%20Guide%5D%20-%20Testing%20Alerts/%5BTSG%5D%20-%20Security%20Alert%20Testing"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Alert Testing and Validation

## Overview

This article provides comprehensive guidance on alert testing, processing times, and utilization of Microsoft Defender for Cloud (MDC) for effective alert management. It includes instructions on using PowerShell to retrieve alerts, details about Kusto queries for analyzing alerts, and steps to access alerts from the Azure Support Center (ASC).

## Testing Alerts

For detailed information on testing alerts, refer to:

* [Security Center Alert Validation](https://docs.microsoft.com/en-us/azure/security-center/security-center-alert-validation)
* [How to verify if any Internet Protocol (IP) is being flagged by Interflow database](https://dev.azure.com/SupportabilityWork/Azure%20Security/_wiki/wikis/Defender%20for%20Cloud%20CSS%20wiki/1751/How-to-verify-if-any-IP-is-being-flagged-by-Interflow-database)

## Alert Processing Times

MDC generates alerts through various detectors. Some detectors use batch processing pipelines (e.g., every hour or day), while others operate in near real-time (e.g., every 5 minutes). The alert latency SLA measures from detection time to processing completion, not from the initial event occurrence.

To accurately measure detection time post-event, calculate relative to `EndTimeUtc` rather than `StartTimeUtc`.

### Processing Time per Provider

```kusto
cluster('RomeEUS.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts()
| where StartTimeUtc > ago(14d)
| extend ProcessingLatency = todatetime(ProcessingEndTime) - TimeGeneratedUtc
| extend TimeFromEvent = todatetime(ProcessingEndTime) - EndTimeUtc
| where TimeFromEvent > time(0) and ProcessingLatency > time(0)
| project Severity, CompromisedEntity, ProviderName, AlertType, StartTimeUtc, TimeGeneratedUtc, ProcessingLatency, TimeFromEvent, ingestion_time()
| summarize count(), avg(ProcessingLatency), percentiles(ProcessingLatency, 50, 90, 95, 99) by ProviderName
```

### Detection Time per Provider

```kusto
cluster('RomeEUS.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts()
| where StartTimeUtc > ago(14d)
| extend ProcessingLatency = todatetime(ProcessingEndTime) - TimeGeneratedUtc
| extend TimeFromEvent = todatetime(ProcessingEndTime) - EndTimeUtc
| where TimeFromEvent > time(0) and ProcessingLatency > time(0)
| project Severity, CompromisedEntity, ProviderName, AlertType, StartTimeUtc, TimeGeneratedUtc, ProcessingLatency, TimeFromEvent
| summarize count(), avg(TimeFromEvent), percentiles(TimeFromEvent, 50, 90, 95, 99) by ProviderName
```

## PowerShell: Get-AzSecurityAlert

The `Az.Security` module cmdlet allows you to:
* Retrieve up to 1,500 alerts
* Access alerts up to 90 days old

## Kusto Queries

Alert data is regionally stored for compliance (GDPR, CCPA). Use the unified function:

```kusto
cluster('RomeEUS.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts()
```

**Retrieve all alerts for a subscription:**

```kusto
cluster('RomeEUS.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts() 
| where AzureResourceSubscriptionId == '{subscriptionId}'
| where StartTimeUtc > startofmonth(now())
| project TimeGeneratedUtc, StartTimeUtc, EndTimeUtc, Status, AlertDisplayName,
  ProviderAlertId, SystemAlertId, AlertType, Severity,
  ProviderName, CompromisedEntity,
  Metadata, ExtendedProperties,
  Intent, Entities,
  ProductName, VendorName, Description, RemediationSteps,
  AzureResourceId, WorkspaceId
```

## Get Alerts from Azure Support Center

1. Load your subscription
2. Change view to "Resource Provider"
3. Go to Microsoft.OperationalInsights
4. Select your workspace under "Workspace"
5. Switch to "Query Customer Data" tab
6. Run query from "Kusto query tab":

```kusto
SecurityAlert 
| where TimeGenerated > now(-90d)
```

## IcM Data Collection Requirements

If CRI is needed, provide:
* Screenshots of all customer-facing portal pages of the alert
* A copy of email if sent
* Subscription ID
* Kusto screenshots:

```kusto
cluster('rome.kusto.windows.net').database("ProdAlerts").SecurityAlertsFromAllRegions('{subscriptionId}',now(-30d),now())
| project EndTimeUtc, VendorName, SystemAlertId, ExtendedProperties, Entities, Metadata
```

* Send collected information to TA for approval before opening IcM.
