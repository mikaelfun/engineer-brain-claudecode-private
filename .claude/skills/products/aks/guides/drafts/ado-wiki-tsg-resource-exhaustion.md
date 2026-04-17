---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] Resource Exhaustion"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Resource%20Exhaustion"
importDate: "2026-04-05"
type: troubleshooting-guide
---

If there was a slow VM caused by resource exhaustion, please provide below recommendations based on the context

1. Customer should configure a reasonable resource limits on their pods and packing the nodes less [  Ref : [Managing Resources for Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) / [Resource management best practices - Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/aks/developer-best-practices-resource-management#define-pod-resource-requests-and-limits)

1. Dedicated node pool for running System Resources and PODs

1. Leveraging ephemeral OS Disk [Cluster configuration in Azure Kubernetes Services (AKS) - Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/aks/cluster-configuration#ephemeral-os)

1. Paid SLA for production level cluster for better ApiServer stability Ref [Azure Kubernetes Service (AKS) Uptime SLA](https://docs.microsoft.com/en-us/azure/aks/uptime-sla)

1. If above suggestion doesn't fix the slow VM, they may need to review their application to see any kind of Memory leak/PORTS exhaustion/application logic (may be a tight loop) etc, and they can leverage [Linux Performance Troubleshooting](https://docs.microsoft.com/en-us/azure/aks/troubleshoot-linux) for isolating the issue.
