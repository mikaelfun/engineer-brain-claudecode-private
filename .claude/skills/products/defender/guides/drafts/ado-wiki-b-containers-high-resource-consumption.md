---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/Defender Sensor and PODs/[Troubleshooting Guide] - Containers high resources consumption (CPU or memory)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2FDefender%20Sensor%20and%20PODs%2F%5BTroubleshooting%20Guide%5D%20-%20Containers%20high%20resources%20consumption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Overview

The defender agent limits its CPU and Memory consumption to very low parameters. This methodology help us to make sure we don't consume a lot of resources from the customer's cluster. On an average cluster, the defender agent CPU consumption limit is less than 3% of the CPU available on the node. A pod that shows 100% CPU usage means that the pod consumes just 3% of the node's CPU.
High CPU and Memory consumption on its own **doesn't indicate any problem**. It may be normal behavior of the agent that uses the resources that were assigned to him. In case those parameters come with restarts or missing security values then it should be treated as an issue.

> **Note:** Increasing the number of nodes in the cluster will not help reduce consumption. The defender agent is a pod that runs on every node in the cluster and each pod is responsible for collecting data from the same node.

Currently the limits are as follow:
```json
lowLevelCollector:
   resources:
      limits:
      cpu: 150m
      memory: 128Mi
   requests:
     cpu: 30m
     memory: 64Mi

podInventoryCollector:
   resources:
     limits:
     cpu: 60m
     memory: 64Mi
   requests:
    cpu: 30m
    memory: 32Mi
```

While 1 core = 1,000m and the most common setup is 16 cores for a node.
150m CPU allocation = 15% of the single core's CPU.

## Symptoms

- High CPU or memory consumption reported by customers.
- Frequent restarts of pods in the cluster.
- Missing security values detected during monitoring.

## Root Causes

1. Normal behavior due to resource allocation limits.
2. Potential issues with pod performance indicated by frequent restarts.
3. Configuration errors causing unexpected resource consumption patterns.

## Scoping Questions

- Are there any recent changes in configuration or workload?
- How many times have the pods restarted?
- Are there any missing security alerts or values?

## Data Collection

Gather the following data from the customer:
- Logs indicating high resource utilization.
- Details on restart counts for each pod.
- Eicar alert validation results to confirm proper functioning of the defender agent.

## Troubleshooting Steps

1. **Check Pod Restarts:**
   - Identify if any pod has more than five restarts, which could indicate a problem requiring investigation.

2. **Validate Defender Agent Functionality:**
   - Perform an Eicar alert check to ensure that the defender agent is operational and collect necessary data using [this guide](https://learn.microsoft.com/en-us/azure/defender-for-cloud/alert-validation#:~:text=To%20simulate%20a%20Kubernetes%20control%20plane%20security%20alert).

3. **Review AKS Resource Utilization:**
   - Go to Azure Kubernetes Service (AKS) -> Insights -> Containers and examine **microsoft-defender-low-lev-collector** and **microsoft-defender-publisher** metrics for CPU consumption relative to allocated resources.
   - The first row indicates CPU consumption of the total allocated CPU for this workload **out of the allocated CPU**. Even if it's 100% consumption - it's using just a fraction of the node's CPU.

4. **Examine Node Resource Allocation:**
   - Access AKS -> Workloads -> Daemon sets, select **microsoft-defender-collector-ds** or **microsoft-defender-publisher-ds**, then review YAML configurations for "Limits."

5. **Analyze Logs:**
   - Use internal Kusto:
   ```kql
   cluster('rome.kusto.windows.net').database('DetectionLogs').K8S_Logs
   | where EnvTime > ago(30d)
   | where AzureResourceId == "/subscriptions/XXX/resourceGroups/XXX/providers/Microsoft.ContainerService/managedClusters/XXX"
   | where Message startswith "Heartbeat"
   | project EnvTime, NodeName, ComponentName, Message
   | parse Message with "Heartbeat: " heartbeat
   | extend heartbeat = todynamic(heartbeat)
   | extend usage = heartbeat["Performance"]["Memory"]
   | parse usage with usage_num "Mi"
   | extend usage_num = toint(usage_num)
   | summarize max(usage_num) by NodeName, ComponentName, bin(EnvTime, 1h)
   | render timechart
   ```

## Preventive Measures

- Regularly monitor AKS insights and daemon set configurations.
- Validate configurations after updates or changes in workloads.
- Establish alerts for unusual restart rates or significant deviations in resource utilization patterns.

## References

### Internal
- [Memory Issue 1](https://portal.microsofticm.com/imp/v3/incidents/details/311244682/home)
- [Memory Issue 2](https://portal.microsofticm.com/imp/v3/incidents/details/310831910/home)
- [CPU Issue 1](https://portal.microsofticm.com/imp/v3/incidents/details/308899035/home)

### Public
- [AKS High CPU Troubleshooting](https://docs.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/identify-high-cpu-consuming-containers-aks)
- [Azure Service Insights](https://azureserviceinsights.trafficmanager.net) - search by full Azure resource ID or FQDN, check "CCP resource usage" and "AppLens"
