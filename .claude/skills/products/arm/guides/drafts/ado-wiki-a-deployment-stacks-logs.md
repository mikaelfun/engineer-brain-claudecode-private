---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Get Logs/Deployment Stacks"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FTroubleshoting%20Guides%2FGet%20Logs%2FDeployment%20Stacks"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Job summary information
``` csharp
let correlationIdToLookup=""; //correlation id of the stack execution
let lowerBoundSearchDate=ago(5d); //how many days to look back
cluster('armprod.kusto.windows.net').database('deployments').DeploymentsWorkerJobCompleted
| where RelatedActivityId == correlationIdToLookup 
    and ActivityName startswith "DeploymentStack"
    and PreciseTimeStamp >= lowerBoundSearchDate
| order by PreciseTimeStamp asc 
| serialize 
| extend ElapsedAsFirstJob = iff(row_number() == 1, ElapsedMilliseconds, 0)
| summarize
    totalUniqueJobsExecuted = count_distinct(ActivityName), 
    totalJobExecutions = count(),
    totalJobExecutionDuration = sum(ElapsedMilliseconds) * 1ms,
    totalJobFaults = countif(ActivityResult != "Success"),
    totalWorkerDuration = max(PreciseTimeStamp) - (min(PreciseTimeStamp)-(max(ElapsedAsFirstJob) * 1ms))
    by RelatedActivityId, ResourceId, Location
| join kind=fullouter  (DeploymentsWorkerJobCompleted
    | where ActivityName startswith "DeploymentStack"
      and RelatedActivityId == correlationIdToLookup
      and isnotempty(Exception_Details)      
      and PreciseTimeStamp >= lowerBoundSearchDate
    | order by PreciseTimeStamp asc
    | take 1 
    | project 
        RelatedActivityId, 
        firstExceptionMessage = Exception_Message, 
        firstExceptionDetails = Exception_Details,
        firstFaultingJob = ActivityName) on RelatedActivityId
| project-rename correlationId=RelatedActivityId, stackResourceId=ResourceId
| project 
    totalUniqueJobsExecuted,
    totalJobExecutions, 
    totalJobFaults,
    totalJobExecutionDuration, 
    totalWorkerDuration, 
    firstFaultingJob, 
    firstExceptionDetails, 
    firstExceptionMessage, 
    stackResourceId, 
    correlationId
```

## Stack execution logs (verbose)
``` csharp
let correlationIdToLookup=""; //correlation id of the stack execution
let lowerBoundSearchDate=ago(5d); //how many days to look back
cluster('armprod.kusto.windows.net').database('deployments').DeploymentsWorkerJobCompleted 
| where RelatedActivityId == correlationIdToLookup 
  and ActivityName startswith "DeploymentStack"
  and PreciseTimeStamp >= lowerBoundSearchDate
| order by PreciseTimeStamp asc 
```

## Deployment status for a stack run
``` csharp
let correlationIdToLookup=""; //correlation id of the stack execution
let lowerBoundSearchDate=ago(3d); //how many days to look back
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where correlationId == correlationIdToLookup 
    and PreciseTimeStamp > lowerBoundSearchDate
    and operationName == "PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.RESOURCES/DEPLOYMENTS/"
| summarize 
    deployment_PUTAttempted = iff(count() >= 1, true, false),
    deployment_PUTSucceeded = iff(count(set_has_element(dynamic([200, 201, 202]), httpStatusCode)) >= 1, true, false),
    deployment_uri = iff(count() >= 1, min(targetUri), "No Deployment")
| extend 
    deployment_PUTFailed = deployment_PUTAttempted and not(deployment_PUTSucceeded),
    correlationId = correlationIdToLookup
| join kind=fullouter(cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Deployments","Deployments")
    | where 
        correlationId == correlationIdToLookup and
        PreciseTimeStamp >= lowerBoundSearchDate
    | order by PreciseTimeStamp desc
    | take 1
    | summarize
        deployment_outcome = iif(count() > 0, max(executionStatus), "No Deployment")
    | extend correlationId = correlationIdToLookup
) on correlationId
| join kind=fullouter(cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
    | where 
        correlationId == correlationIdToLookup and
        PreciseTimeStamp >= lowerBoundSearchDate
    | order by PreciseTimeStamp desc
    | take 1
    | summarize
        logLookupStatus = iif(count() > 0, "HTTP Logs Found", "No HTTP Logs Found - Adjust query")
    | extend correlationId = correlationIdToLookup
) on correlationId
| extend needsDeploymentInvestigation = 
    deployment_PUTAttempted and (deployment_PUTFailed or deployment_outcome != "Succeeded")
| project-away correlationId1, correlationId2
| project-reorder
    logLookupStatus,
    needsDeploymentInvestigation,
    deployment_PUTAttempted, 
    deployment_PUTFailed, 
    deployment_PUTSucceeded, 
    deployment_uri,
    deployment_outcome, 
    correlationId
```
