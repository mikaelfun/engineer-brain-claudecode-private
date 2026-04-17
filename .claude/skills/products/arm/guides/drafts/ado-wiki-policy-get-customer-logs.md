---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Troubleshooting Guides/Get customer logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FTroubleshooting%20Guides%2FGet%20customer%20logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## From ASC
From the ASC homepage, go to **Resource Explorer** > **Click on the subscription id** > **Azure Policy tab**.

Azure Policy Assignments, Azure Policy Set Definitions and Azure Policy Definitions are covered in [TSG] Get customer configuration.

On this TSG we will cover how to get the customer logs only.

### Azure Policy Change Tracking Log
The Azure Policy Change Tracking Log section allows you to look for recent changes on the Azure Policy resources (definitions, initiatives or assignments). This is useful to determine if a customer made changes to the policy after opening the case, or to confirm if customer waited long enough for brownfield or greenfield evaluation.

Once you have located the required change, the properties value will include the payload of the create/update request, which can then be formatted in VS code.

### Azure Policy Evaluation History Log (Greenfield)
The Azure Policy Evaluation History Log section will return all recent greenfield evaluations on a specific resource.

Once you have located the required entry, the properties value will include the details of the policy evaluation.

You can easily determine this is a greenfield evaluation by looking at this property: `"isComplianceCheck": "False"`.

## From Kusto

### Get policy resource changes
```kql
let resource = ""; //definition, initiative or assignment id
let since = ago(3d);
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where targetUri contains resource
| where TIMESTAMP > since
| where Role =~ "Providers.Authorization.razzle"
| where operationName contains "/PROVIDERS/MICROSOFT.AUTHORIZATION/POLICY"
| where httpMethod =~ "PUT" or httpMethod =~ "DELETE"
| where httpStatusCode == 200 or httpStatusCode == 201 or httpStatusCode == 202
| join kind = inner (cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","EventServiceEntries")
    | where TIMESTAMP > since
    | where resourceId contains resource
    | where operationName startswith "MICROSOFT.AUTHORIZATION/" and ( operationName endswith "/WRITE" or operationName endswith "/DELETE" )
    | where resultType =~ "Start"
) on correlationId
| order by PreciseTimeStamp asc
| project PreciseTimeStamp, correlationId, resourceId, properties, tenantId, operationName1
| limit 5000
```

### Get greenfield evaluations for a resource
```kql
let correlation = ""; //Correlation id of the operation
let since = ago(3d);
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Traces","Traces")
| where TIMESTAMP > since
| where correlationId == correlation
| where operationName startswith "PolicyEvaluationEngine"
```

### Get evaluated policies for an operation
```kql
let correlation = ""; //Correlation id of the operation
let since = ago(3d);
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Traces","Traces")
| where TIMESTAMP > since
| where correlationId == correlation
| where operationName startswith "PolicyEvaluationEngine"
```

### Get create events for a subscription
```kql
// Cluster: https://acegroupsrp.kusto.windows.net/groupsrp
let since = ago(2d);
let subscriptionId = "";
SvcCosmosDb
| where env_time >= since
| where Collection == "ObjectStore"
| where Function == "ExecuteStoredProcedureAsync/subscriptionCreate"
| where RequestPredicate contains subscriptionId
| where ResponseStatusCode == 200
| project env_time, ActivityId, Collection, Function, ResponseStatusCode, RequestPredicate
| take 1000
```

### Get move events for a subscription
```kql
let since = ago(2d);
let subscription = "";
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP >= since
| where operationName in ("microsoft.management/managementgroups/subscriptions/delete", "microsoft.management/managementgroups/subscriptions/write")
| where resourceUri has subscription
```

### Get created remediation tasks for an assignment
```kql
let since = ago(3d);
let assignment= "";
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","EventServiceEntries")
| where resourceId contains "/PROVIDERS/MICROSOFT.POLICYINSIGHTS/REMEDIATIONS/"
| where TIMESTAMP > since
| where properties contains assignment
```

## From Jarvis

### Get created remediation tasks in a subscription
Remediation tasks can be seen from the [JARVIS] Get Resources from Provider action.
