---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Center for SAP Solutions (ACSS)/Trainings/Create Generic query_ACSS"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Center%20for%20SAP%20Solutions%20(ACSS)%2FTrainings%2FCreate%20Generic%20query_ACSS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Create - Generic query (ACSS)

## Error details
Extract the error code / inner error code

## Mitigation Steps
Refer public Microsoft Azure docs / TSGs / reach out for help

## Troubleshooting steps
How to debug the issue with Kusto queries

```kql
// Generic Query
let startDate = datetime("2023-02-28 00:00:00");
let endDate = datetime("2023-03-09 00:00:00");
let visResourceID = "/subscriptions/<subid>/resourcegroups/sapt94-dev-eu2-rsg/providers/microsoft.workloads/sapvirtualinstances/t94";
let customerSubscriptionId = substring(visResourceID, indexof(visResourceID, "/subscriptions")+strlen("/subscriptions")+1,32+4);
cluster('waasservices.eastus.kusto.windows.net').database('WaaSKustoDB').WaaSErrorEvent
| where PreciseTimeStamp between (startDate .. endDate)
| where parse_json(MessageParameters)["ErrorCode"] == "PrivateEndpointCannotBeCreatedInSubnetThatHasNetworkPoliciesEnabled" // Child error
// | where ErrorCodeName == "DeploymentAuthorizationFailed" // Parent error
| where ResourceId =~ visResourceID
| summarize arg_max(PreciseTimeStamp, *) by ActivityId
| join kind=inner
(WaaSMetricEvent
| where PreciseTimeStamp between (startDate .. endDate)
| where ResourceId =~ visResourceID
| where MetricName == "WorkloadOperation"
| where Dimensions["WorkflowName"] == "CreateInfrastructure" and Dimensions["OperationState"] != "Running") on ActivityId
| project SubscriptionId, PreciseTimeStamp, tolower(ResourceId), ErrorCodeName, ErrorMessage
```

If you have the ActivityId from an active error message you can run the below query to get further details:

```kql
cluster('waasservices.eastus.kusto.windows.net').database('WaaSKustoDB').WaaSDiagnosticEvent
| where ActivityId == "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
| where Level < 3
```
