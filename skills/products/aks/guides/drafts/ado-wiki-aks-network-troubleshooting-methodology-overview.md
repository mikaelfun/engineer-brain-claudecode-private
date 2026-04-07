---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] Aks and Network team common troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS and Network Team Common Troubleshooting — Overview

Author: @mosbah.majed (aks), @mariochaves (aks), @lesantos (net)

One-stop guide for troubleshooting **Networking** cases from an **AKS support engineer** perspective.

## Sub-sections

1. Troubleshoot AKS cluster issues
2. What is the Network deployment type used in the AKS cluster
3. Troubleshoot Common issues when working with customer
4. Troubleshooting checklists
5. Troubleshoot Connectivity issues
6. Troubleshoot Performance issues
7. Troubleshoot Azure Firewall
8. Troubleshoot Azure ExpressRoute
9. Troubleshoot Azure Loadbalancer Health and Health Probes
10. Troubleshoot Network Virtual Appliances and routing
11. Troubleshoot NSG Common Scenarios
12. Troubleshoot DNS Common Scenarios
13. Common Troubleshoot Steps
14. Common Troubleshoot tools and command lines

## How kubectl apply works (Kubernetes Control Plane Flow)

```
User → API Server → etcd (save state)
Controller Manager → API Server (check changes)
Scheduler → API Server (watch unassigned pods)
API Server → Scheduler (notify pod with nodeName="")
Scheduler → API Server (assign pod to node)
API Server → etcd (save state)
Kubelet → API Server (look for newly assigned pods)
API Server → Kubelet (bind pod to node)
Kubelet → Container Runtime (start container)
Kubelet → API Server (update pod status)
API Server → etcd (save state)
```

## Approach

- Main workflow = entry point for ALL networking cases troubleshooting
- Secondary workflows derive from main workflow addressing specific error conditions
- Each sub-section handles a specific networking domain (firewall, LB, NVA, NSG, DNS, etc.)
