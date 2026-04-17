---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] Find app provision deletion flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20Find%20app%20provision%20deletion%20flow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG Find App provision deletion flow

[[_TOC_]]

## Allocation flow events

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

## Deallocation flow events

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

## Kusto query for getting application updates

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

## Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Kenneth Gonzalez Pineda <kegonzal@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
