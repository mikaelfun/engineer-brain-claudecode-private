---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/troubleshoot-connections-endpoints-outside-virtual-network
importDate: "2026-04-24"
type: guide-draft
---

# Troubleshoot Connections to Endpoints Outside Virtual Network

## Determine Outbound Type
az aks show --query networkProfile.outboundType
- loadBalancer: check NSG
- userDefinedRouting: verify egress device
- managedNATGateway: verify association

## Persistent: basic troubleshoot, curl codes, bypass appliance
## Intermittent: resource exhaustion, OS disk IOPS, SNAT exhaustion
