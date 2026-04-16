# AKS ACI 网络与 DNS — vnet — 排查工作流

**来源草稿**: ado-wiki-a-aci-find-app-provision-deletion-flow.md, ado-wiki-a-aci-how-to-find-vm-id-for-aci-cg.md, ado-wiki-aci-billing-issues.md, ado-wiki-aci-diagnostic-tools.md, ado-wiki-aci-dns-label-reuse.md, ado-wiki-aci-keep-connection-alive.md, ado-wiki-aci-sbz-verifier-failures.md, ado-wiki-aci-sync-cg-ip-dns.md, ado-wiki-aci-terminologies.md, ado-wiki-azure-copilot-aci-handlers.md, ado-wiki-b-view-vnet-used-by-aci.md
**Kusto 引用**: 无
**场景数**: 11
**生成日期**: 2026-04-07

---

## Scenario 1: TSG Find App provision deletion flow
> 来源: ado-wiki-a-aci-find-app-provision-deletion-flow.md | 适用: 适用范围未明确

### 排查步骤

#### TSG Find App provision deletion flow


#### Allocation flow events

| Step | Event Name | Actor |
| --- | --- | --- |
| 0 | ReceivedAllocationRequestFromUser | AM/Volume, Network RM |
| 1 | **SendAllocationRequestToCA** | AM |
| 2 | AllocateRequestArrived | CA |
| 3 | SendAllocationResponseToAM | CA |
| 3a | **ApplicationAllocationFailed** | CA |
| 4 | AllocateRequestEnd | CA |
| 5 | ReceivedAllocationResponseFromCA | AM |
| 6 | ApplicationDeploymentStart | AM |
| 6a | VolumeDeploymentStarted | AM |
| 6b | VolumeDeploymentSuccessful | AM |
| 7 | ApplicationDeploymentSuccessful | AM |
| 8 | **ApplicationRunning** | AM |

#### Deallocation flow events

| Step | Event Name | Actor |
| --- | --- | --- |
| 0 | ReceivedDeallocationRequestFromUser | AM/Volume, Network RM |
| 1 | ApplicationDeletionStart | AM |
| 2 | **ApplicationDeletionEnd** | AM |
| 3 | **SendDeallocationRequestToCA** | AM |
| 4 | DeallocationRequestArrived | CA |
| 5 | SendDeallocationResponseToAM | CA |
| 6 | DeallocationRequestEnd | CA |
| 7 | ReceivedDeallocationResponseFromCA | AM |

#### Kusto query for getting application updates

```kql
// FINDING APPLICATION EVENTS
let app = "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourcegroups/RG/providers/Microsoft.ServiceFabricMesh/applications/xxxxxxxx-xxxxxxxxxxx-xxx-xxxxxxxxxxxxxxxxxx";
let incidentTime = datetime(2019-01-27 15:45:10.3242476);
cluster('atlaslogscp.eastus').database('telemetry').SeaBreezeRPEvent
| where PreciseTimeStamp >= incidentTime - 3h
| where PreciseTimeStamp <= incidentTime + 3h
| where Message contains app
| extend RequestTimelinePhase = extract("RequestTimeline.([a-zA-Z]+): ", 1, EventMessage, typeof(string))
| extend ApplicationName = extract("RequestTimeline.([a-zA-Z]+): ([a-zA-Z0-9-./\_]+)", 2, EventMessage, typeof(string))
| extend SequenceId = extract("RequestTimeline.([a-zA-Z]+): ([a-zA-Z0-9-./\_]+) ([a-zA-Z0-9-]+)", 3, EventMessage, typeof(string))
| extend Os = extract("RequestTimeline.([a-zA-Z]+): ([a-zA-Z0-9-./\_]+) ([a-zA-Z0-9-]+) OS: ([a-zA-Z]+),", 4, EventMessage, typeof(string))
| extend Cluster = extract("RequestTimeline.([a-zA-Z]+): ([a-zA-Z0-9-./\_]+) ([a-zA-Z0-9-]+) ([0-9null]+)", 4, EventMessage, typeof(string))
| extend AppShortName = extract("/applications/(.+) ([a-zA-Z0-9-]+)", 1, EventMessage, typeof(string))
| order by PreciseTimeStamp asc
| project Tenant, PreciseTimeStamp, RequestTimelinePhase, Cluster, EventMessage, SequenceId, Os, ApplicationName, AppShortName, Message
```

#### Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Kenneth Gonzalez Pineda <kegonzal@microsoft.com>
- Jordan Harder <joharder@microsoft.com>

---

## Scenario 2: TSG How to find the VM id for a given ACI CG
> 来源: ado-wiki-a-aci-how-to-find-vm-id-for-aci-cg.md | 适用: 适用范围未明确

### 排查步骤

#### TSG How to find the VM id for a given ACI CG

1. Get the clusterId
2. Search for the cluster on Seabreeze Explorer.
3. Click on Open SFX in Seabreeze Explorer
4. Search for the CAAS/APP id and in the left pane, drill all the way down and see if you can find the dev\_\<number\> node. Say \_dev_4
5. Then, you should be able to find \_dev_4 under nodes on left pane and in it's config, you can find the VM id.

#### Alternative way with Kusto queries

1. This query will give you the application name used in service fabric for the container group deployed by the customer:

   ```kql
   cluster('accprod').database('accprod').SubscriptionDeployments
   | where TIMESTAMP >= ago(10d)
   | where TaskName contains "Succeeded"
   | where subscriptionId contains "{sub_ID}"
   | where resourceGroup contains "{rg_Name}"
   | where containerGroup contains "{cg_Name}"
   | project clusterDeploymentName
   ```

2. Grab that customer deployment name and find the clusterID on which the application is deployed:

   ```kql
   cluster('atlaslogscp.eastus').database('telemetry').ApplicationDeploymentStartedEvent
   | where TIMESTAMP >= ago(10d)
   | where resourceId contains "{caas-xxxxx}"
   | project resourceId, clusterId
   ```

3. Once you know the cluster ID get the node on which the app is:

   ```kql
   cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent
   | where TIMESTAMP >= datetime(2022-12-09 13:45:44.426)
   | where AtlasRegion contains "WARP-Prod-AM"
   | where Role contains "d31962eb34dc434c8e098cfd8cbf48c2-p-0"
   | where TaskName contains "Hosting"
   | where Message contains "caas-xxxxxxxx"
   | distinct Role, RoleInstance
   ```

4. Substitute the clusterid and roleinstance below to get the VMID

   ```kql
   cluster("rdos.kusto.windows.net").database("rdos").GuestAgentGenericLogs
   where TIMESTAMP > ago(6h)
   | where ResourceGroupName contains "{rg_Name}"
   | where RoleInstanceName == "\_Dev_1"
   | distinct VMId
   ```

#### Finding ClusterId

1. Find the Cluster Deployment Id / App Id.
2. Use it to get the ClusterId like the following:

   ```kql
   cluster('atlaslogscp.eastus').database('telemetry').ApplicationDeploymentStartedEvent
   | where TIMESTAMP >= ago(2d)
   | where Tenant contains "WARP-Prod-BL"
   | where resourceId contains "caas-xxxxxxxxx"
   ```

#### Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Kenneth Gonzalez Pineda <kegonzal@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
- Aritoki Takada <atakada@microsoft.com>
- pkc <pkc@microsoft.com>

---

## Scenario 3: TSG ACI billing related issues
> 来源: ado-wiki-aci-billing-issues.md | 适用: 适用范围未明确

### 排查步骤

#### TSG ACI billing related issues

#### Problem

The customer states their container instance is still running after stop or deletion. Billing on ACI is pretty simple. So, most of the time if a customer is complaining about billing, the root of the issue is something else (example: leaked deployment).

Billing starts when we start a deployment successfully and stops when the deployment is stopped. There is a job that runs and gathers up all the deployments from the deployment index (SubscriptionDeploymentIndex) and reports their usage.

#### Mitigation

Use the queries below to answer these questions.

1. Verify the customer did in fact stop the resource.
2. Verify the customer resource is being billed.
3. Have the customer create a new container instance with the same resourceId in the same region to force cleanup in the ACI backend. This resource can be deleted immediately after creation.
4. If the customer wants a refund, take the billing table data for the time period after the stop and copy the total core and memory charges into the incident. Ask the CSS engineer to reach out to the Commerce team to refund the customer.

#### Investigation

First you want to make sure that the emitted billing meters makes sense for the deployments that happened, the way to do this is to look at the start/stopped events for the cluster and correlate the difference in time to the amount billed for that cluster. Keep in mind that the cpu/mem values will be proportional to the hours. If you see 1 CpuCoreHours reported for a CG that uses 2 cpu cores, then that means it ran for a half hour.

Then you can summarize the billing data per cluster and get the totals to check against the calculated time diff for the deployment start/stop (again scaled by the requested cpu/mem).

Another sanity check is to make sure there are not multiple clusters emitting billing data, if you see this then there is likely a leaked subscription deployment.

##### KQL: Billing meters with deployment events

```kql
// Gets the billing meters along with the subscription deployment events to help correlate deployment start/end and the corresponding meters
let desiredSubscriptionId = "";
let desiredResourceGroup = "";
let desiredContainerGroup = "";
let desiredResourceId = "";
let startTime = ago(1d);
let endTime = now();
union cluster('accprod').database('accprod').SubscriptionDeployments, cluster('accprod').database('accprod').BillingUsageEvents
| where TIMESTAMP >= startTime
| where TIMESTAMP <= endTime
| where TaskName == "SubscriptionDeploymentNodeAssigned" or TaskName == "SubscriptionDeploymentSucceeded" or TaskName == "SubscriptionDeploymentStopped" or TaskName == "BillingUsageDuration"
| where iff( desiredSubscriptionId == "", "True" , tostring(subscriptionId == desiredSubscriptionId)) == "True"
| where (iff( desiredResourceGroup == "", "True" , tostring(resourceGroup == desiredResourceGroup)) == "True") or (iff( desiredResourceGroup == "", "True", tostring(resourceUri contains desiredResourceGroup)) == "True")
| where (iff( desiredContainerGroup == "", "True" , tostring(containerGroup == desiredContainerGroup)) == "True") or (iff( desiredContainerGroup == "", "True", tostring(resourceUri contains desiredContainerGroup)) == "True")
| where (iff( desiredResourceId == "", "True" , tostring(resourceUri == desiredResourceId)) == "True") or (iff( desiredResourceId == "", "True" , tostring(strcat("/subscriptions/", subscriptionId,"/resourceGroups/", resourceGroup, "/providers/Microsoft.ContainerInstance/containerGroups/", containerGroup) == desiredResourceId)) == "True")
| extend meterType=case(meterType == "CoreSecond", "CpuCoreHours", meterType == "GbSecond", "GbHours", "")
| project TIMESTAMP, TaskName, quantity, meterType, clusterId, subscriptionId, resourceGroup, containerGroup, cpu, ['memory'], features
| order by clusterId asc, TIMESTAMP asc
```

##### KQL: Billing totals by resource and cluster

```kql
// Gets the total count for the meters in the requested timeframe summarized by resourceId and clusterId
let desiredSubscriptionId = "";
let desiredResourceGroup = "";
let desiredContainerGroup = "";
let desiredResourceId = "";
let startTime = ago(1d);
let endTime = now();
cluster('accprod').database('accprod').BillingUsageEvents
| where TIMESTAMP >= startTime
| where TIMESTAMP <= endTime
| where TaskName == "BillingUsageDuration"
| where iff( desiredSubscriptionId == "", "True" , tostring(subscriptionId == desiredSubscriptionId)) == "True"
| where iff( desiredResourceGroup == "", "True", tostring(resourceUri contains desiredResourceGroup)) == "True"
| where iff( desiredContainerGroup == "", "True", tostring(resourceUri contains desiredContainerGroup)) == "True"
| where iff( desiredResourceId == "", "True" , tostring(resourceUri == desiredResourceId)) == "True"
| extend meterType=case(meterType == "CoreSecond", "CpuCoreHours", meterType == "GbSecond", "GbHours", "")
| summarize total=sum(quantity) by resourceId=resourceUri, clusterId, meterType
```

#### Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**
- Kenneth Gonzalez Pineda <kegonzal@microsoft.com>

---

## Scenario 4: ACI Diagnostic Tooling Overview
> 来源: ado-wiki-aci-diagnostic-tools.md | 适用: 适用范围未明确

### 排查步骤

#### ACI Diagnostic Tooling Overview

#### Purpose

Dedicated page serving as a repository for important ACI Troubleshooting tools.

| Name | URL | Note |
|------|-----|------|
| ASC | [Azure Support Center](https://azuresupportcenter.msftcloudes.com/) | Get static properties, execution properties from instance view, metrics as shown in portal and more. |
| Applens | [Applens](https://applens.trafficmanager.net/) | Run useful detectors to diagnose issues. |
| ASI | [Azure Service Insights](https://azureserviceinsights.trafficmanager.net/) | Select ACI service and search by Resource Id, FQDN or subscription. |
| Jarvis | [Jarvis](https://portal.microsoftgeneva.com/actions?acisEndpoint=Public&managementOpen=false&selectedNodeType=3&extension=Azure%20Container%20Instance) | Geneva actions from SAVM, e.g.: `Get Subscription Policy` and `Get Subscription Deployments By Delegated Subnet`. |
| ACI Kusto Queries | [Kusto Repo](/Azure-Kubernetes-Service-Wiki/ACT-Team/Tools/Kusto-Repo.md) | Repository for important Kusto Queries Used by ACI PG, EEE and TAs. |
| Container Perf Dashboard | [ACI Container Perf Dashboard](https://portal.microsoftgeneva.com/s/74FCB78D) | Dashboard for container Memory/CPU utilization details. Update resource URI via 'Edit widget' gear icon. |
| Execution Cluster Health | [Atlas Execution Cluster Health](https://portal.microsoftgeneva.com/s/495D06E1) | SF execution cluster health. Input Atlas region and cluster Id. |
| Kusto Helper | [Kusto Helper](https://portal.microsoftgeneva.com/dashboard/ACC/Kusto%20Helper) | Refer to Kusto Helper TSG for details. |
| Atlas Helper | [Atlas Kusto Helper](https://portal.microsoftgeneva.com/dashboard/AzureSeabreeze/Seabreeze/Atlas%20Kusto%20Helper) | Refer to Atlas Kusto Helper TSG for details. |
| Capacity Dashboard | [Capacity - ContainerInstance](https://portal.microsoftgeneva.com/dashboard/ACC/Clusters/Capacity%20-%20ContainerInstance) | Troubleshoot failed deployments due to capacity issues. |
| Tcpdump | [Run tcpdump in a Container Group](/Azure-Kubernetes-Service-Wiki/ACI/How-To/Run-tcpdump-in-a-Container-Group.md) | Instructions to use tcpdump for network connectivity issues. |

---

## Scenario 5: How to use ACI DNS name reuse
> 来源: ado-wiki-aci-dns-label-reuse.md | 适用: 适用范围未明确

### 排查步骤

#### How to use ACI DNS name reuse

#### Summary

Customers may have doubts regarding the ACI DNS label reuse feature (preview): https://learn.microsoft.com/en-us/azure/container-instances/how-to-reuse-dns-names

There are 5 DNS label reuse policies: **unsecure**, **tenantReuse**, **subscriptionReuse**, **resourceGroupReuse**, and **noReuse**.

DNS label reuse applies when an ACI is deleted and a new ACI needs to use the same DNS label as the deleted one.

#### Key Points

- When creating a new ACI with the same DNS label as a deleted one, you **must** specify the same reuse policy again
- If you don't specify the reuse policy on the new ACI, the reuse will **not** work
- The FQDN of the new ACI will match the previous deleted ACI's FQDN when properly configured

#### Repro Steps (resourceGroupReuse example)

1. Create a container instance with the reuse policy "Resource Group"
2. Note the FQDN assigned
3. Delete the ACI
4. Create a new ACI in the **same resource group** with the **same DNS label** and the **same reuse policy** (resourceGroupReuse)
5. The new ACI will have the same FQDN as the deleted one

#### References

- https://learn.microsoft.com/en-us/azure/container-instances/how-to-reuse-dns-names

---

## Scenario 6: Configuring a keep-alive connection for Azure Container Instances
> 来源: ado-wiki-aci-keep-connection-alive.md | 适用: 适用范围未明确

### 排查步骤

#### Configuring a keep-alive connection for Azure Container Instances

#### Summary

This article shows a workaround to keep alive a connection to an ACI that runs Ubuntu 20.04. When attempting to run a long-lived process (even if it's idle), eventually ACI times out the connection when there's no user interaction.

#### Prerequisites

* Active and running ACI instance

#### Implementation Steps

##### (OPTIONAL) Deploy an Azure Container Instance

```sh
az container create --resource-group <rg> \
--cpu 1 \
--memory 1 \
--restart-policy Never \
--ip-address Public \
--ports 80 443 \
--dns-name-label <dns> \
--log-analytics-workspace <loganalytics> \
--name ubuntu-20-04 \
--image ubuntu:latest \
--command-line "tail -f /dev/null"
```

##### Keeping an ACI connection alive

1. Establish a connection to the container group:

   ```sh
   az container exec --name <container-group-name> \
       --resource-group <rg-name> \
       --container-name <name of the container inside the group> \
       --exec-command "/bin/bash"
   ```

2. Keep the connection alive using:

   ```sh
   nohup tail -f /dev/null
   ```

   This will run the command in a way that ignores any hangup signals and thus will keep the connection alive. When you're ready to resume control, `Ctrl+C` to kill the `nohup` process.

---

## Scenario 7: TSG Investigating SBZ Verifier failures
> 来源: ado-wiki-aci-sbz-verifier-failures.md | 适用: 适用范围未明确

### 排查步骤

#### TSG Investigating SBZ Verifier failures

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

---

## Scenario 8: Automating DNS Updates for VNet Container Group IP Addresses
> 来源: ado-wiki-aci-sync-cg-ip-dns.md | 适用: 适用范围未明确

### 排查步骤

#### Automating DNS Updates for VNet Container Group IP Addresses

> Scoped to ACI customers who run their container group in a Virtual Network

#### Summary

When a VNet container group is restarted or stopped/started, its IP address may change. ACI does not support static IP addresses. This causes DNS records to point to the wrong address, resulting in failed connectivity.

#### Solution

Use an **init container** to automate DNS record updates whenever the container group is stopped, started, or restarted.

Follow the MS Learn Module: https://docs.microsoft.com/learn/modules/secure-apps-azure-container-instances-sidecar/6-deploy-with-init-container

**Note:** There will still be downtime during restart, but DNS records will be updated automatically.

#### References

* Init container for setup tasks: https://learn.microsoft.com/en-us/azure/container-instances/container-instances-init-container
* Deploy with init container: https://learn.microsoft.com/en-us/training/modules/secure-apps-azure-container-instances-sidecar/6-deploy-with-init-container

---

## Scenario 9: ACI 排查关键术语
> 来源: ado-wiki-aci-terminologies.md | 适用: 适用范围未明确

### 排查步骤

#### ACI 排查关键术语

> 来源：ADO Wiki `/Azure Kubernetes Service Wiki/ACI/ACI Terminologies for Troubleshooting`
> 提取时间：2026-04-04

#### Container Group（CG）

Container Group 是调度在同一台主机上的一组容器集合，共享生命周期、资源、本地网络和存储卷。概念上类似 Kubernetes 中的 Pod。

**获取 CG Name**：客户提供完整资源 URI，或从 Portal → 资源概览页面获取。

格式示例：
```
/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.ContainerInstance/containerGroups/<cg-name>
```

#### Cluster Deployment Name（caas 名称）

Cluster Deployment 是 Container Group 的活跃实例。**查询后端执行集群日志必须提供 caas-xxx 名称**，因为执行集群日志不存储 correlation ID。

##### 方法一：Kusto Helper

1. 打开 [Kusto Helper](https://portal.microsoftgeneva.com/dashboard/ACC/Kusto%20Helper?overrides=...)
2. 填入正确的 `SubscriptionId`、`resourceGroup`、`containerGroup`
3. 从 `subscription Deployments` widget 中读取 Cluster Deployment name

##### 方法二：Kusto 查询

```kusto
let BT = datetime(YYYY-MM-DD);
let ET = datetime(YYYY-MM-DD);
let resURI = '/subscriptions/<sub-id>/resourcegroups/<rg>/providers/Microsoft.ContainerInstance/containerGroups/<cg-name>';
// 查询 SubscriptionDeployments 表过滤 resourceUri
```

> **注意**：同一时间只有一个活跃的 Cluster Deployment，确保 caas 名称对应客户问题发生的时间戳。

#### 关键诊断要点

| 概念 | 说明 |
|------|------|
| CG Name | ARM 资源名，Portal 可见 |
| caas name | 后端执行实例名（caas-xxx），查后端日志必需 |
| correlation ID | 执行集群日志**不存储** correlation ID |
| Kusto 主表 | `SubscriptionDeployments` |

---

## Scenario 10: Azure Copilot ACI Handlers
> 来源: ado-wiki-azure-copilot-aci-handlers.md | 适用: 适用范围未明确

### 排查步骤

#### Azure Copilot ACI Handlers

#### Overview

The Azure Portal now has copilot integrated into it. Support for copilot in the Azure portal is mainly owned by the VM team, however there are handlers for specific services. See the [AKS Wiki page for Copilot Handlers](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Azure-Copilot-AKS-Handlers)

#### ACI Handlers

##### ACI Troubleshooting Plugin

This plugin will integrate the top ACI (Azure Container Instances) AppLens detectors with Copilot for Azure, to enhance customer self-help and troubleshooting for ACI management, configuration, and connectivity issues.

PluginID: acitroubleshoot_plugin

Two plugins will be developed:

**Handler 1:** For issues related to "Unable to Deploy."

Copilot Orchestration: Users open Copilot and ask why their container deployment failed. Copilot will prompt the user to confirm if they want to troubleshoot using the current Resource Group.
Let the user select failed deployment from drop down and then run the appropriate detectors. Detector results are communicated to the user by copilot, and the user can choose to view the full detector output.

_Example prompts:_
Why did my deployment fail?
Help me with this deployment failure.
Why did my container fail to deploy.

**Handler 2:** For issues related to "Unexpected Restarts."

Copilot Orchestration: Users open Copilot and ask why their container deployment failed. Copilot will prompt the user to confirm if they want to troubleshoot using the current Resource Group or select different Resource Group, then run the appropriate detectors.
Detector results are communicated to the user by copilot and the user can choose to view the full detector output.

Example prompts:
Why did my deployment fail?
Help me with this deployment failure.
Why did my container fail to deploy.

#### Gather Data and Escalate

Please refer to [The main Copilot Wiki Page](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Azure-Copilot-AKS-Handlers) for information on how to [Troubleshoot](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Azure-Copilot-AKS-Handlers#basic-troubleshooting), how to [Gather Data](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Azure-Copilot-AKS-Handlers#data-gathering), and where to [Escalate to.](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Azure-Copilot-AKS-Handlers#escalation)

---

## Scenario 11: Finding the Virtual Network Used for an ACI Container Group
> 来源: ado-wiki-b-view-vnet-used-by-aci.md | 适用: 适用范围未明确

### 排查步骤

#### Finding the Virtual Network Used for an ACI Container Group


#### Background

Determining the virtual network used by ACI container groups can help significantly when troubleshooting network issues. Container groups may use different networking mechanisms depending on the API version used to create them.

#### Method 1 — ACI using Network Profile (API version < 2021-07-01)

Container Groups deployed to BYOVNET and created with an API version **lower than** 2021-07-01 use network profiles.

1. Open ASC for the case and navigate to the ACI container group in Resource Explorer.
2. Navigate to the "Networking" section.
3. Review the network profile — it will show the VNET details and subnet.
4. Use the ASC resource search bar to navigate to the virtual network.

**Common items to check once you've found the VNET:**

* Is the VNET using Azure DNS or custom DNS servers?
* Note the VNET address space and CIDR of the ACI subnet.
* Are there any VNET peerings and are they relevant to the container group's connectivity?

#### Method 2 — ACI using Delegated Subnet (API version >= 2021-07-01)

Container groups created with API version **2021-07-01 or later** use subnet delegation to `Microsoft.ContainerInstance/containerGroups` — no network profile is created (shows as `NetworkProfileIdPlaceholder` in ASC).

Use the following Kusto query to track down VNET from subnet ID:

```sql
cluster('accprod').database('accprod').SubscriptionDeployments
| where TIMESTAMP between (datetime()..datetime()) //datetime format YYYY-MM-DD HH:MM:ss
//| where TIMESTAMP > ago(1d)
| where subscriptionId == "{subscription}"
| where containerGroup has "{containerGroup}"
| project TIMESTAMP, containerGroup, subnetId, ipAddress, clusterDeploymentName, correlationId
| sort by TIMESTAMP desc
```

---
