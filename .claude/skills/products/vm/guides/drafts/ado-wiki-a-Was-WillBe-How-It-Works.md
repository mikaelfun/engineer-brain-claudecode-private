---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/Was&WillBe_How It Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FWas%26WillBe_How%20It%20Works"
importDate: "2026-04-06"
type: troubleshooting-guide
tags:
  - cw.How-It-Works
---

[[_TOC_]]

# Internals - What are Node Service Was / WillBe docs?
Was and WillBe doc is used by host node's NodeService service to drive node (including required VMs) to desired state. It is given to it by Azure Fabric.  
Refer [AzureFabric](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495421) for main page (it has trainings etc.).

# Logs

```kusto
// Replace values in below.
cluster('azcsupfollower.kusto.windows.net').database('rdos').NodeServiceEventEtwTable
| where NodeId  == "f63e934f-01da-494d-b1ad-03b7ba9f586b"
| where PreciseTimeStamp between (datetime(2020-04-22 08:00)..30m)
| project PreciseTimeStamp, Message
```

| PreciseTimeStamp | Message |
|---|---|
| 2020-04-22 08:20:34.6963994 | ServiceManager: Accepted WillBe revision: 15862 |
| 2020-04-22 08:20:34.6990211 | ServiceManager: Updated Was revision: 414 GoalAchieved:false ContainerGoalAchieved:false ArtifactGoalAchieved:false WillBeRevision:15862 |
| 2020-04-22 08:20:34.7130962 | Container[5e28b7a9-02ec-4267-826b-c35653bd6e9e]: WillBe rev:15862 |
| 2020-04-22 08:20:34.7140208 | Container[3065e194-1130-4579-b943-4d94f5c2be69]: WillBe rev:15862 |

```kusto
// Replace values in below.
// containerState equivalent to WillBe.State.
cluster("AzureCM").database("AzureCM").LogContainerHealthSnapshot
| where PreciseTimeStamp between (datetime(2020-04-22 08:00)..30m)
| where containerId == "5e28b7a9-02ec-4267-826b-c35653bd6e9e"
| project PreciseTimeStamp, containerState
```

| PreciseTimeStamp | containerState |
|---|---|
| 2020-04-22 08:22:49.0593469 | ContainerStateDestroyed |

```
// RDAgent.exe.log through Host Analyzer.
[2020/04/22, 08:20:34.717,  INFO, 00010280] Container WillBe doc exists [NodeService::Providers::ContainerManagementProvider::QueryContainerFeedback]		Context={{ QueryContainerFeedback: id=199bd6d6-f59a-489a-9863-022781e82d96 }}
```
