---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Center for SAP Solutions (ACSS)/TSGs/Monitoring TSGs/Health And status_ACSS"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Center%20for%20SAP%20Solutions%20%28ACSS%29%2FTSGs%2FMonitoring%20TSGs%2FHealth%20And%20status_ACSS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Health And status

[[_TOC_]]

## Extension installation Failed

Installation would be triggered after some backoff time, use below query to get installation executions for extension for a specific SVI (SAP Virtual Instance).

```kusto
cluster('waasservices.eastus.kusto.windows.net').database('WaaSKustoDB').WaaSErrorEvent
| where PreciseTimeStamp > ago(2d)
| where Message has "Submitted TEE Workflow for" 
and Message has "SviHealthAndStatusInstallWorkflow"
and ResourceId == "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/Microsoft.Workloads/sapVirtualInstances/{SID}"
| order by TIMESTAMP desc
```

Later, use below query to dig in specific workflow, check for UnhandledException first:

```kusto
cluster('waasservices.eastus.kusto.windows.net').database('WaaSKustoDB').WaaSErrorEvent
| where PreciseTimeStamp > ago(2d)
| where ServiceActivityId == "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
| project TIMESTAMP, ServiceEventName, ComponentName, Message, CallerInfo, SubscriptionId
| order by TIMESTAMP asc
```
