---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AKS Networking Known Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AKS%20Networking%20Known%20Scenarios"
importDate: "2026-04-05"
type: troubleshooting-guide
---

Note: Before doing any deep Network Troubleshooting make sure to verify and fix below mentioned issues (If any)

1. Resource exhaustion like CPU, Memory or IO usually cause a slow VM and due to this customer may notice request timeout, slow response etc, and if it is caused due to resource exhaustion, please follow provide step mentioned under Resource Exhaustion to fix the resource exhaustion before proceeding any further network troubleshooting

1. Make sure there is no SNAT PORT exhaustion, usually caused due to Basic Load Balancer instead of Standard LB, please refer [TSG] AKS Network Tools / AppLens Detector for identifying SNAT Port exhaustion.

1. For Readiness or Liveness Probe failure we need to verify the customer code which define readiness/Liveness Probe logic.

1. Make sure Firewall/NSG are allowlisted with required AKS PORT as mentioned in [Restrict egress traffic in Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/aks/limit-egress-traffic#azure-global-required-network-rules)

1. Make sure both client and Server is healthy during the time of issue.
