---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Action Groups and Notifications/How to trace an Azure Notification in Jarvis"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FAction%20Groups%20and%20Notifications%2FHow%20to%20trace%20an%20Azure%20Notification%20in%20Jarvis"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to trace an Azure Notification in Jarvis

> **Note**: Notification Diagnostic logging is NOT supported for Service Health or Test Notification IDs.

## Quick Link

https://jarvis-west.dc.ad.msft.net/9FA3036D

## Prerequisites

| Property | Description |
|----------|-------------|
| ActivityId | Azure Notification service unique activity identifier. Retrieved as ActivityId from Kusto or CorrelationId from ASC. |
| Timestamp | UTC timestamp of when the notification was fired (+/- 30 minutes). |

## Jarvis Endpoint Configuration by Cloud

| Environment | Endpoint | Namespace | Events to search |
|-------------|----------|-----------|------------------|
| Public | Diagnostics PROD | IcmAzNsProd, AzNsSwedenCentral, AzNsGlobal, AzNsGermanyWC | TraceEvent |
| US Government | CA Fairfax | AzNSWinFab | TraceEvent |
| China (Mooncake) | CA Mooncake | AzNSWinFab | TraceEvent |
| Germany | CA BlackForest | AzNSWinFab | TraceEvent |

## Instructions

1. Open [Jarvis Logs](https://jarvis-west.dc.ad.msft.net/logs/dgrep).
2. Set **Endpoint**, **Namespace** and **Events to search** to match the target environment (see table above).
3. Set the **Time range** to reflect the notification fire timestamp +/- 30 minutes.
4. Under **Filtering conditions**, set `env_cv` to contain the ActivityId value.
5. Update **Client Query** to use KQL:

```kusto
source
| project env_time, messsage, traceLevel, tagId, env_cloud_roleInstance, env_cv
| sort by env_time asc
```

6. Click search icon to execute.
7. Review TraceEvent records matching the timestamp and activity identifier.
