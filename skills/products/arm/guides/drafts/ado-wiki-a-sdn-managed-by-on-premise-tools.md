---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/SDN in progress/SDN managed by on-premise tools"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FInfrastructure%2FSDN%20Overview%2FSDN%20in%20progress%2FSDN%20managed%20by%20on-premise%20tools"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# SDN managed by On-Premise Tools — Lab Walkthrough

## WAC VM Deployment

1. Deploy a WAC VM
2. Install the latest version of Windows Admin Center

## Network Controller Deployment via WAC

Follow the steps outlined in the official documentation:
https://learn.microsoft.com/en-us/azure/azure-local/deploy/sdn-wizard-23h2?view=azloc-2507#deploy-sdn-network-controller

Deploy 3 Network Controller VMs. These VMs can be seen running in Hyper-V.

## Architecture Notes

- The Network Controller is similar to that found in Azure Stack Hub
- Network Controller utilizes **Service Fabric** for its services (unlike the Arc-enabled method which uses Failover Clustering)
- In WAC you can view the Network Controllers and optionally deploy:
  - **SLBs**: https://learn.microsoft.com/en-us/azure/azure-local/deploy/sdn-wizard-23h2?view=azloc-2507#deploy-sdn-software-load-balancer
  - **Gateways**: https://learn.microsoft.com/en-us/azure/azure-local/deploy/sdn-wizard-23h2?view=azloc-2507#deploy-sdn-software-load-balancer
