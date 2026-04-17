---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Compute/Virtual Machine TSGs/VM Performance Troubleshooting Guideline"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVirtual%20Machine%20TSGs%2FVM%20Performance%20Troubleshooting%20Guideline"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VM Performance Troubleshooting

[[_TOC_]]

## Summary

Every time that we suspect VM performance issues, we should do some preemptive checks before opening collabs to VM team without any verification and proof of our suspects.

## Troubleshooting Steps

1. Check which node(s) the customer is complaining about.

2. Search for the node in ASC. Collect the VM ID of the node(s) and check the VM size, limits and disks.

   > NOTE: ASC also allows you to check specific metrics individually. Access via "MC Infra Resource Group" link and check `virtualMachineScaleSets` under `Microsoft.Compute` and analyze individual VMSS instances.

   Pay special attention to:
   - Whether the disk is burst capable
   - Whether the VM is burst capable
   - Reference: [Managed disk bursting](https://learn.microsoft.com/en-us/azure/virtual-machines/disk-bursting)

3. Go to [Azure Service Insights](https://asi.azure.ms). Search for AKS > Managed Cluster and locate the cluster by Resource ID.

   - Locate the link for the target node under Cluster Nodes.
   - Under "Node Details", click "VM Performance" to get relevant VM metrics in Jarvis.

   > **Hint:** When checking Disk QD blade, if you see QD above 10, usually it means some disk limits are being reached. Due to all requests getting throttled on disk, this leads to higher CPU consumption as a consequence.

   **Relevant TSGs**:
   - [TSG: node CPU Usage evaluation](https://eng.ms/docs/cloud-ai-platform/azure-edge-platform-aep/aep-health-standards/fundamentals/interruption-management/interruption-management/content/dashboards/tsg_evaluate_cpu_usage)
   - Network I/O flow limits: [Flow limits and active connections recommendations](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-machine-network-throughput#flow-limits-and-active-connections-recommendations)

4. Check node performance in ASI: [Using ASI to Check Node Performance](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Using-ASI-to-Check-Node-Performance.md)

5. If you observe metrics indicating a performance issue, open a collaboration with the VM team.
