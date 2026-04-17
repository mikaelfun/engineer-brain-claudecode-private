---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/Manage SDN/Load balance multiple SDN logical networks for Azure Local"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Infrastructure/SDN%20Overview/Manage%20SDN/Load%20balance%20multiple%20SDN%20logical%20networks%20for%20Azure%20Local"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Load Balance Multiple SDN Logical Networks for Azure Local

## Overview
Load balancing across multiple SDN logical networks enables scalable, resilient, and efficient traffic distribution between services and tenants in multi-tenant or hybrid deployments.

## Key Concepts
- **Logical Networks**: Abstracted network segments used to define tenant or workload boundaries.
- **Internal Load Balancer (ILB)**: Distributes traffic within a virtual network or across logical networks.
- **Frontend and Backend Pools**: Define how traffic is received and routed to target services.
- **Health Probes**: Monitor service availability to ensure traffic is only routed to healthy endpoints.

## Internal Guidance
- Use internal load balancers to route traffic between services on different logical networks.
- Ensure backend pools are correctly mapped to VMs or services across the networks.
- Configure health probes to detect service availability and avoid routing to unhealthy nodes.
- Document load balancing rules and network mappings for audit and troubleshooting.

## External Reference
https://learn.microsoft.com/en-us/azure/azure-local/manage/load-balance-multiple-networks
