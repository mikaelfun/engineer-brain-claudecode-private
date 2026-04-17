---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Workspace Management/How-to: Check the latency or delay"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FWorkspace%20Management%2FHow-to%3A%20Check%20the%20latency%20or%20delay"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How-to: Check the latency or delay

This page explains how to validate if there is any latency in getting the logs into Azure Monitor.

## Check if the Log Analytics Workspace is affected by Latency

1. Start with **Azure Support Center -> Log Analytics workspace -> Latency Analysis tab**
2. Check for any **ongoing/previous identified Outage** causing latency:
   - Check ASC Service Health indications for the subscription
   - Check Iridias: https://iridias.microsoft.com/incidentcentral
   - If ongoing bridge (Sev2/1) discussing latency, **requires SME/TA intervention**
3. Check **Resource Health Ingestion Latency Signal**: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750135/Resource-health-Ingestion-latency-signal

> If no outage, no Resource Health Signal, and no significant latency, refer customer to: https://learn.microsoft.com/azure/azure-monitor/logs/data-ingestion-time

## Check what introduces the latency via Azure Support Center

Query to decompose latency into source vs service components:

```kql
AzureDiagnostics
| extend ingestionTime=ingestion_time()
| extend OverallLatency = ingestionTime-TimeGenerated 
| extend LogAnalyticsServiceLatency=ingestionTime-_TimeReceived
| extend SourceLatency=_TimeReceived-TimeGenerated
| project OverallLatency, SourceLatency, LogAnalyticsServiceLatency, TimeGenerated, _TimeReceived, ingestionTime
| sort by OverallLatency desc
```

Key fields:
- **TimeGenerated** = Record created at source
- **_TimeReceived** = Record arrived in ODS endpoint
- **ingestion_time()** = Record available for querying

## Investigate Latency Introduced by Source

### Agents (MMA, OMS, AMA)
- Networking issues on customer environment (common cause)
- Agent issues causing latency
- Machine performance issues
- Work with Agent SMEs for investigation

### Resource Logs (OBO pipeline)
Query ODSTelemetry on `azureinsights.kusto.windows.net/Insights`:

```kql
let resource="";
let workpaceId="";
ODSPostTelemetry
| where PreciseTimeStamp > ago(2d)
| where resourceId =~ resource
| where workspaceId =~ workpaceId
| where isFailed == false
| where dataType contains "Logs"
| extend oboLatency = datetime_diff('minute', PreciseTimeStamp, todatetime(insertionTime))
| extend normalizerLatency = datetime_diff('minute', todatetime(insertionTime), todatetime(availableTime))
| summarize percentiles(oboLatency, 95, 99), percentiles(normalizerLatency, 95, 99) by bin(PreciseTimeStamp, time(1h))
| render timechart
```

- **oboLatency high** -> OBO team issue, raise IcM
- **normalizerLatency high** -> Normalizer service (upstream from OBO), reach Diagnostic Logs SME/EEE. Logs retention < 30 days, work quickly.

### Custom Log APIs
Customer manages user-agent and PUSH mechanism. For Microsoft-owned Data Collector API sources: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750387/How-to-Investigate-Data-Collector-API-Custom-Logs

## Investigate Latency Introduced by Log Analytics Service

### Step 1: Determine pipeline
Identify which pipeline processes the data type: [HT: Determine which pipeline](/Log-Analytics/How-To-Guides/Ingestion/HT:-Determine-which-pipeline-is-processing-a-given-data-type)

### If using InMem pipeline
Query on `omsgenevainmemprod.eastus.kusto.windows.net/OperationInsights_InMem_PROD`:

```kql
let customer_workspace_ID = "<workspace-id>"; 
let customer_resource_ID = "<resource-id>";
let customer_workspace_region = "AAPRODWEU";
ACE 
| where TIMESTAMP > ago(1d)
| where Environment == customer_workspace_region
| where properties contains customer_workspace_ID and properties contains customer_resource_ID 
| where activityName == "IMTrM.MessageProcessorCompleteMessage"
| parse properties with * "MsgProcessedAgeMS=[" MsgProcessedAgeMS:long "]" *
| project TIMESTAMP, MsgProcessedAgeMS
| summarize max(MsgProcessedAgeMS) by bin(TIMESTAMP, 1h)
```

If InMem latency confirmed, open CRI to Ingestion team: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750121/Escalating-issues-to-the-Log-Analytics-Ingestion-team

### If using NorthStar pipeline
See: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750217/HT-Check-for-Data-Latency-in-Northstar-Pipeline

## By design behaviors
- Usage table latency: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750276/By-design-Usage-table-latency
