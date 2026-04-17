---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Azure CNI Overlay"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAzure%20CNI%20Overlay"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure CNI Overlay

## Overview

Azure CNI Overlay uses Azure CNI as the network-plugin with "Routing Domains" from the networking team. These routing domains route traffic destined for a pod to the appropriate node without route tables. Uses the same components as PodSubnet/SWIFT (DNC/DNC-RC/CNS/Subnet Handler/DNC cleanup service).

## Pod CIDR Expansion

Preview feature to expand the pod CIDR on an existing cluster without creating a new cluster or migrating workloads. See [docs](https://learn.microsoft.com/en-us/azure/aks/azure-cni-overlay-pod-expand).

## Identifying an Overlay Cluster

Query ManagedClusterMonitoring: `networkPluginMode=overlay`, `networkPlugin=azure`.

```kusto
cluster("Aks").database("AKSprod").ManagedClusterMonitoring
| where TIMESTAMP > ago(1d)
| where msg contains "networkPlugin\":\"azure" and msg contains "networkPluginMode\":\"overlay"
| limit 1
| project mc=parse_json(msg)
```

## Monitoring - Regional Runners

Check pass rate for Scenario_Azure_CNI_Overlay runners:

```kusto
let since=ago(2d);
cluster('aksdevinfragbprod.westus2.kusto.windows.net').database("AKSDevInfra").AKSE2EManagedClusterAudit
| where PreciseTimeStamp > since
| where LooperDeployEnv != "staging"
| extend scenario = trim(" ", TestScenario)
| where scenario == "Scenario_Azure_CNI_Overlay"
| project PreciseTimeStamp, TestScenario, Location, SessionId, TestPassed, RPServiceBuild, OverlaymgrServiceBuild, ClusterId = strcat("/subscriptions/", SubscriptionID, "/resourceGroups/", ResourceGroupName, "/providers/Microsoft.ContainerService/managedClusters/", ResourceName)
| extend Passed=iff(TestPassed=="true", 1, 0)
| summarize round(avg(Passed),2) by Location, TestScenario
| order by avg_Passed asc
```

## Troubleshooting

Detailed troubleshooting flow with Kusto queries, CNI component explanations, and potential failure points:
https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg/azure-cni-overlay

## References

- [Public Docs](https://learn.microsoft.com/en-us/azure/aks/azure-cni-overlay)
