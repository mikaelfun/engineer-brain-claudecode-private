---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Workloads/Arc-enabled Kubernetes clusters"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Workloads/Arc-enabled%20Kubernetes%20clusters"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Arc-enabled Kubernetes clusters

There are two types of Kubernetes deployment in Azure Local:

1. **Azure Arc-enabled Kubernetes** : allows you to attach Kubernetes clusters running anywhere so that you can manage and configure them in Azure. By managing all of your Kubernetes resources in a single control plane, you can enable a more consistent development and operation experience, helping you run cloud-native apps anywhere and on any Kubernetes platform.

2. **AKS enabled by Azure Arc** : Azure Kubernetes Service (AKS) enabled by Azure Arc is a managed Kubernetes service that you can use to deploy and manage containerized applications on-premises, in datacenters, or at edge locations such as retail stores or manufacturing plants. You need minimal Kubernetes expertise to get started with AKS. AKS reduces the complexity and operational overhead of managing Kubernetes by offloading much of that responsibility to Azure. AKS is an ideal platform for deploying and managing containerized applications that require high availability, scalability, and portability. It's also ideal for deploying applications to multiple locations, using open-source tools, and integrating with existing DevOps tools.

When it comes to Azure Local Disconnected Operations, AKS enabled by Azure Arc is currently the only supported way to deploy and manage Kubernetes clusters.

## References

- https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/overview
- https://learn.microsoft.com/en-us/azure/aks/aksarc/aks-overview
