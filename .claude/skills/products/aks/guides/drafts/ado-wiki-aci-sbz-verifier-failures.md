---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] Investigating SBZ Verifier failures"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Investigating%20SBZ%20Verifier%20failures"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# TSG Investigating SBZ Verifier failures

SBZ verifier failures can be grouped like this using first query from below:

| sum_Pass | sum_Cancelled | sum_Unknown | sum_InsuficientCapcity | sum_WrongResponse | sum_FailedOnDelete | sum_UnreachableOnCreate | sum_TooLongToFirstResponse | sum_NoLongerReachable | sum_CreateAsyncTimeOut | sum_ResourceGetContentAsyncTimeout | sum_WhenReadyAsyncTimeout | sum_OtherFailure |
|----------|---------------|-------------|------------------------|-------------------|--------------------|-------------------------|----------------------------|-----------------------|------------------------|------------------------------------|---------------------------|------------------|
| 10581    | 382           | 18          | 415                    | 122               | 3284               | 318                     | 452                        | 166                   | 522                    | 2716                               | 2941                      | 4                |

Can be ignored: Cancelled, Unkown, InsufficientCapacity, FailedOnDelete

Networking Issues: WrongResponse, UnreachableOncreate, TooLongTofirstResponse, NoLongerReachable

Deployment issues: CreateAsyncTimeout, Resoure.GetContentAsyncTimeout, Resource.WhenReadyAsyncTimeout

Investigating further you would like to know more details about deployment issues.

RP reasons for the deployment issue can be investigated with the second query from below:

| sum_DidntComeToAllocation | sum_NoClusterAvailableCount | sum_VolumeRefsInvalid | sum_StorageExceptionCount | sum_ExecClusterExceptionsCount | sum_NetworkProgrammingMsgCount | sum_RpResourcesDeploymentLongerThan30sCount | sum_ClusterDeploymentLongerThan30sCount |
|---------------------------|-----------------------------|-----------------------|---------------------------|--------------------------------|--------------------------------|---------------------------------------------|-----------------------------------------|
| 452                       | 33                          | 0                     | 0                         | 31                             | 0                              | 26                                          | 1662                                    |

sum_DidntComeToAllocation - application registration or network resources issues, before AM asked CA for the cluster
sum_NoClusterAvailableCount - not available cluster, e.g. not enough capacity

sum_VolumeRefsInvalid - volume resources issues

sum_StorageExceptionCount - storage resource issues

sum_ExecClusterExceptionsCount - exception from execution clusters caught while deploying application

sum_NetworkProgrammingMsgCount - network resource issues

sum_RpResourcesDeploymentLongerThan30sCount - RP resources deployment longer than 30 seconds

sum_ClusterDeploymentLongerThan30sCount - cluster needed more than 30 seconds to deploy application

```kql
// All verifier failures for Functions tests
VerifierTestResult
 | where Tenant contains "meshrptest"
 | where TIMESTAMP  > datetime(2019-07-04 00:30)
 | where testName contains "functions"
 | extend AvgLatency = extractjson(" $AvgRequestLatency", resultDescription)
 | extend resultBody = extractjson(" $ResultDescription", resultDescription)
 | extend ResourceProvisionDuration = toint(extractjson(" $ResourceProvisionDuration", resultDescription))
 | extend ProvisionToHttpResponse = toint(extractjson(" $ProvisionToHttpResponse", resultDescription))
 | extend CompletedRuns = toint(extractjson(" $CompletedRuns", resultDescription))
 | extend Pass = iff(result == "Pass", 1, 0), Cancelled = iff(result == "Cancelled", 1, 0), Unknown = iff(result == "Unknown", 1, 0)
 | extend InsuficientCapcity = iff(result == "Fail" and EventMessage contains "Insufficient capacity is available in this region", 1, 0)
 | extend WrongResponse = iff(result == "Fail" and EventMessage contains "Missing expected content from endpoint", 1, 0)
 | extend FailedOnDelete = iff(result == "Fail" and EventMessage contains "DeleteAsync", 1, 0)
 | extend UnreachableOnCreate = iff(result == "Fail" and EventMessage contains "Running" and AvgLatency == "NaN", 1, 0)
 | extend TooLongToFirstResponse = iff(result == "Fail" and CompletedRuns  >= 2 and ProvisionToHttpResponse  > 120000, 1, 0)
 | extend NoLongerReachable = iff(result == "Fail" and (ResourceProvisionDuration + ProvisionToHttpResponse)  < 240000 and durationInMs  > 800000 and CompletedRuns  >= 2 and resultBody contains "GetEndpointsAsync", 1, 0)
 | extend CreateAsyncTimeOut = iff(result == "Fail" and resultBody contains "TaskCanceledException" and resultBody contains "CreateAsync", 1, 0)
 | extend ResourceGetContentAsyncTimeout = iff(result == "Fail" and resultBody contains "TaskCanceledException" and resultBody contains "GetContentAsync", 1, 0)
 | extend WhenReadyAsyncTimeout = iff(result == "Fail" and resultBody contains "TaskCanceledException" and resultBody contains "WhenReadyAsync", 1, 0)
 | extend OtherFailure = iff(result == "Fail" and InsuficientCapcity == 0 and WrongResponse == 0 and FailedOnDelete == 0 and UnreachableOnCreate == 0 and TooLongToFirstResponse == 0 and NoLongerReachable == 0 and CreateAsyncTimeOut == 0 and ResourceGetContentAsyncTimeout == 0 and WhenReadyAsyncTimeout == 0, 1, 0)
 | summarize sum(Pass), sum(Cancelled), sum(Unknown), sum(InsuficientCapcity), sum(WrongResponse), sum(FailedOnDelete), sum(UnreachableOnCreate), sum(TooLongToFirstResponse), sum(NoLongerReachable), sum(CreateAsyncTimeOut), sum(ResourceGetContentAsyncTimeout), sum(WhenReadyAsyncTimeout), sum(OtherFailure)
```

```kql
// Verifier failures with RP reasons
let region = "meshrptest";
let incidentTime = datetime(2019-07-04 00:30);
let incidentStartTime = incidentTime;
let incidentEndTime = incidentTime + 2d;
VerifierTestResult
 | where Tenant contains "meshrptest"
 | where TIMESTAMP  > datetime(2019-07-04 00:30)
 | where testName contains "functions"
 | extend AvgLatency = extractjson(" $AvgRequestLatency", resultDescription)
 | extend resultBody = extractjson(" $ResultDescription", resultDescription)
 | extend ResourceProvisionDuration = toint(extractjson(" $ResourceProvisionDuration", resultDescription))
 | extend ProvisionToHttpResponse = toint(extractjson(" $ProvisionToHttpResponse", resultDescription))
 | extend CompletedRuns = toint(extractjson(" $CompletedRuns", resultDescription))
 | extend Pass = iff(result == "Pass", 1, 0), Cancelled = iff(result == "Cancelled", 1, 0), Unknown = iff(result == "Unknown", 1, 0)
 | extend InsuficientCapcity = iff(result == "Fail" and EventMessage contains "Insufficient capacity is available in this region", 1, 0)
 | extend WrongResponse = iff(result == "Fail" and EventMessage contains "Missing expected content from endpoint", 1, 0)
 | extend FailedOnDelete = iff(result == "Fail" and EventMessage contains "DeleteAsync", 1, 0)
 | extend UnreachableOnCreate = iff(result == "Fail" and EventMessage contains "Running" and AvgLatency == "NaN", 1, 0)
 | extend TooLongToFirstResponse = iff(result == "Fail" and CompletedRuns  >= 2 and ProvisionToHttpResponse  > 120000, 1, 0)
 | extend NoLongerReachable = iff(result == "Fail" and (ResourceProvisionDuration + ProvisionToHttpResponse)  < 240000 and durationInMs  > 800000 and CompletedRuns  >= 2 and resultBody contains "GetEndpointsAsync", 1, 0)
 | extend CreateAsyncTimeOut = iff(result == "Fail" and resultBody contains "TaskCanceledException" and resultBody contains "CreateAsync", 1, 0)
 | extend ResourceGetContentAsyncTimeout = iff(result == "Fail" and resultBody contains "TaskCanceledException" and resultBody contains "GetContentAsync", 1, 0)
 | extend WhenReadyAsyncTimeout = iff(result == "Fail" and resultBody contains "TaskCanceledException" and resultBody contains "WhenReadyAsync", 1, 0)
 | extend OtherFailure = iff(result == "Fail" and InsuficientCapcity == 0 and WrongResponse == 0 and FailedOnDelete == 0 and UnreachableOnCreate == 0 and TooLongToFirstResponse == 0 and NoLongerReachable == 0 and CreateAsyncTimeOut == 0 and ResourceGetContentAsyncTimeout == 0 and WhenReadyAsyncTimeout == 0, 1, 0)
 | where CreateAsyncTimeOut != 0 or ResourceGetContentAsyncTimeout != 0 or WhenReadyAsyncTimeout != 0
 | join kind = leftouter
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime - 1h
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | where (Message contains "RequestTimeline.ReceivedAllocationRequestFromUser" or Message contains "RequestTimeline.ReceivedDeallocationRequestFromUser") and Message contains "SEABREEZEVERIFIER_"
 | extend resourceId = extract("RequestTimeline.([a-zA-Z_]+): ([a-zA-Z0-9-./_ ]+)", 2, EventMessage, typeof(string))
 | extend TrimmedResourceGroup = tolower(extract("resourcegroups/SEABREEZEVERIFIER_([a-zA-Z0-9-]+)/providers", 1, EventMessage, typeof(string)))
 | summarize count() by TrimmedResourceGroup, resourceId
 | project TrimmedResourceGroup, resourceId
) on $left.runId == $right.TrimmedResourceGroup
 | order by TrimmedResourceGroup, PreciseTimeStamp asc
 | join kind = leftouter
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime - 1h
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | where Message contains "NoClusterAvailable"
 | extend ApplicationName = extract("RequestTimeline.([a-zA-Z]+): ([a-zA-Z0-9-./_ ]+)", 2, EventMessage, typeof(string))
 | summarize NoClusterAvailable = count() by ApplicationName
)
on $left.resourceId == $right.ApplicationName
 | join kind = leftouter
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime - 3h
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | where EventMessage contains "RequestTimeline"
 | where EventMessage contains "DeployingApplication"
 | extend RequestTimelinePhase = extract("RequestTimeline.([a-zA-Z]+): ", 1, EventMessage, typeof(string))
 | extend ApplicationName = extract("RequestTimeline.([a-zA-Z]+): ([a-zA-Z0-9-./_ ]+)", 2, EventMessage, typeof(string))
 | project PreciseTimeStamp, RequestTimelinePhase, ApplicationName, Tenant
 | summarize min(PreciseTimeStamp) by ApplicationName
 | join
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | where EventMessage contains "failed deployment due to application deployment timeout policy"
 | extend RequestTimelinePhase = "DeploymentTimeoutPolicy"
 | extend ApplicationName = extract("Application ([a-zA-Z0-9-./_ ]+) failed deployment due to application deployment timeout policy of ([0-9: ]+).", 1, EventMessage, typeof(string))
 | extend PolicyTime = extract("Application ([a-zA-Z0-9-./_ ]+) failed deployment due to application deployment timeout policy of ([0-9: ]+).", 2, EventMessage, typeof(string))
 | project PreciseTimeStamp, RequestTimelinePhase, ApplicationName, PolicyTime, Tenant
) on ApplicationName
 | extend InterruptedDeployingTime = PreciseTimeStamp - min_PreciseTimeStamp
 | project Tenant , ApplicationName , min_PreciseTimeStamp , PreciseTimeStamp , InterruptedDeployingTime , PolicyTime
 | order by Tenant, ApplicationName
) on $left.resourceId == $right.ApplicationName
 | join kind = leftouter
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime - 3h
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | where EventMessage contains "RequestTimeline"
 | where EventMessage contains "DeployingApplication"
 | extend RequestTimelinePhase = extract("RequestTimeline.([a-zA-Z]+): ", 1, EventMessage, typeof(string))
 | extend ApplicationName = extract("RequestTimeline.([a-zA-Z]+): ([a-zA-Z0-9-./_ ]+)", 2, EventMessage, typeof(string))
 | project PreciseTimeStamp, RequestTimelinePhase, ApplicationName, Tenant
 | summarize min(PreciseTimeStamp) by ApplicationName
 | join
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | extend RequestTimelinePhase = "ApplicationProvisioningSuccessful"
 | extend ApplicationName = extract("RequestTimeline.([a-zA-Z]+): ([a-zA-Z0-9-./_ ]+)", 2, EventMessage, typeof(string))
 | project PreciseTimeStamp, RequestTimelinePhase, ApplicationName, Tenant
 | summarize max(PreciseTimeStamp) by ApplicationName, Tenant
) on ApplicationName
 | extend SuccessfullDeployingTime = max_PreciseTimeStamp - min_PreciseTimeStamp
 | project Tenant , ApplicationName , min_PreciseTimeStamp , SuccessfullDeployingTime
 | order by Tenant, ApplicationName
) on $left.resourceId == $right.ApplicationName
 | join kind = leftouter
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime - 3h
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | where EventMessage contains "RequestTimeline"
 | where EventMessage contains "ReceivedAllocationRequestFromUser"
 | extend RequestTimelinePhase = extract("RequestTimeline.([a-zA-Z]+): ", 1, EventMessage, typeof(string))
 | extend ApplicationName = extract("RequestTimeline.([a-zA-Z]+): ([a-zA-Z0-9-./_ ]+)", 2, EventMessage, typeof(string))
 | project PreciseTimeStamp, RequestTimelinePhase, ApplicationName, Tenant
 | summarize min(PreciseTimeStamp) by ApplicationName, Tenant
 | join
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | where EventMessage contains "RequestTimeline"
 | where EventMessage contains "DeployingApplication"
 | extend RequestTimelinePhase = extract("RequestTimeline.([a-zA-Z]+): ", 1, EventMessage, typeof(string))
 | extend ApplicationName = extract("RequestTimeline.([a-zA-Z]+): ([a-zA-Z0-9-./_ ]+)", 2, EventMessage, typeof(string))
 | project PreciseTimeStamp, RequestTimelinePhase, ApplicationName, Tenant
 | summarize min(PreciseTimeStamp) by ApplicationName, Tenant
) on ApplicationName
 | extend RpAndDeployingResourcesTime = min_PreciseTimeStamp1 - min_PreciseTimeStamp
 | project Tenant, ApplicationName , min_PreciseTimeStamp , min_PreciseTimeStamp1 , RpAndDeployingResourcesTime
 | order by Tenant, ApplicationName
)
on $left.resourceId == $right.ApplicationName
 | join kind = leftouter
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime - 3h
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | where Message contains "exception" and Message contains "ExecutionClusterClientBase"
 | extend ApplicationName = extract("subscriptions([a-zA-Z0-9-./_ ]+)", 1, Message, typeof(string))
 | extend ApplicationNameException = strcat("/subscriptions" , ApplicationName)
 | project ApplicationNameException, EventMessage, Message
 | summarize ExecClusterExceptions = count() by ApplicationNameException
)
on $left.resourceId == $right.ApplicationNameException
 | join kind = leftouter
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime - 3h
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | where Message contains "ReceivedAllocationResponseFromCA"
 | extend ApplicationName = extract("subscriptions([a-zA-Z0-9-./_ ]+) ", 1, Message, typeof(string))
 | extend ApplicationNameCluster = strcat("/subscriptions" , ApplicationName)
 | extend TargetedCluster = extract("RequestTimeline.([a-zA-Z]+): ([a-zA-Z0-9-./_ ]+) ([a-zA-Z0-9-]+) ([0-9a-z]+)", 4, EventMessage, typeof(string))
 | project ApplicationNameCluster, TargetedCluster, EventMessage, Message
)
on $left.resourceId == $right.ApplicationNameCluster
 | join kind = leftouter
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime - 3h
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | where Message contains "Microsoft.WindowsAzure.Storage.StorageException: The remote server returned an error: (404) Not Found."
 | extend ApplicationName = extract("subscriptions([a-zA-Z0-9-./_ ]+)", 1, Message, typeof(string))
 | extend ApplicationNameException = strcat("/subscriptions" , ApplicationName)
 | project ApplicationNameException, EventMessage, Message
 | summarize StorageException = count() by ApplicationNameException
)
on $left.resourceId == $right.ApplicationNameException
 | join kind = leftouter
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime - 3h
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | where Message contains "Network programming in progress."
 | extend ApplicationName = extract("subscriptions([a-zA-Z0-9-./_ ]+)", 1, Message, typeof(string))
 | extend ApplicationNameNetworkProgramming = strcat("/subscriptions" , ApplicationName)
 | project ApplicationNameNetworkProgramming, EventMessage, Message
 | summarize SlowNetworkProgramming = count() by ApplicationNameNetworkProgramming
)
on $left.resourceId == $right.ApplicationNameNetworkProgramming
 | join kind = leftouter
(
SeaBreezeRPEvent
 | where PreciseTimeStamp  >= incidentStartTime - 3h
 | where PreciseTimeStamp  <= incidentEndTime
 | where Tenant contains region
 | where Message contains "Format of the 'destinationPath' '/home/site/wwwroot' in volumes/volumeRefs is invalid"
 | extend ApplicationName = extract("subscriptions([a-zA-Z0-9-./_ ]+)", 1, Message, typeof(string))
 | extend ApplicationNameVolumeRefsInvalid = strcat("/subscriptions" , ApplicationName)
 | project ApplicationNameVolumeRefsInvalid, EventMessage, Message
 | summarize VolumeRefsInvalid = count() by ApplicationNameVolumeRefsInvalid
)
on $left.resourceId == $right.ApplicationNameVolumeRefsInvalid
 | extend DidntComeToAllocation = iff(isempty(TargetedCluster), 1, 0)
 | extend RpResourcesDeploymentLongerThan30s = iff(RpAndDeployingResourcesTime  > 20s, 1, 0)
 | extend ClusterDeploymentLongerThan30s = iff(SuccessfullDeployingTime  > 20s, 1, 0)
 | project PreciseTimeStamp , Tenant , runId, resourceId , TargetedCluster ,
DidntComeToAllocation, NoClusterAvailable, VolumeRefsInvalid, StorageException, ExecClusterExceptions , SlowNetworkProgramming ,
RpAndDeployingResourcesTime , RpResourcesDeploymentLongerThan30s, InterruptedDeployingTime , PolicyTime, SuccessfullDeployingTime, ClusterDeploymentLongerThan30s
 | order by PreciseTimeStamp asc
 | extend OtherFailure = iff(DidntComeToAllocation == 0 and NoClusterAvailable == 0 and VolumeRefsInvalid == 0 and StorageException == 0
and ExecClusterExceptions == 0 and SlowNetworkProgramming == 0 and RpResourcesDeploymentLongerThan30s == 0 and ClusterDeploymentLongerThan30s == 0, 1, 0)
 | summarize sum(DidntComeToAllocation), sum(NoClusterAvailable), sum(VolumeRefsInvalid), sum(StorageException),
sum(ExecClusterExceptions) , sum(SlowNetworkProgramming), sum(RpResourcesDeploymentLongerThan30s), sum(ClusterDeploymentLongerThan30s), sum(OtherFailure)
```
