---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/SDN in progress/SDN in Azure Local overview"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FInfrastructure%2FSDN%20Overview%2FSDN%20in%20progress%2FSDN%20in%20Azure%20Local%20overview"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# SDN in Azure Local Overview

SDN is an optional component in Azure Local. It enhances what is available to the end user in terms of controlling network traffic, isolating boundaries, load balancing, and creating connections to other networks.

SDN functionality was traditionally added using WAC/SDN Express, however since the 2506 build certain features such as the Network Controller have become available as failover clustered services.

## Two Management Methods

### SDN managed by on-premises tools
- Manage SDN with on-premises tools like Windows Admin Center or SDN Express scripts.
- Available for Windows Server and Azure Local 2311.2 or later.
- Uses three main SDN components (choose which to deploy): Network Controller, Software Load Balancer (SLB), and Gateway.

### SDN enabled by Azure Arc
- **Preview** — available for Azure Local 2506 with OS version 26100.xxxx or later.
- Network Controller runs as a **Failover Cluster service** instead of on a VM.
- Integrates with the Azure Arc control plane for managing logical networks.
- Supports creating and applying network security groups (NSGs) to logical networks and Azure Local VM NICs.

## Critical Compatibility Rules

| Management method | Consideration |
|---|---|
| SDN managed by on-premises tools | If Network Controller deployed using `Add-EceFeature`, you must **NOT** attempt to use on-premises tools. Only unmanaged VMs (deployed from WAC, Hyper-V Manager, SCVMM, Failover Cluster Manager) are in scope for NSG management. |
| SDN enabled by Azure Arc | If Network Controller deployed using on-premises tools, you must **NOT** run `Add-EceFeature`. Only Azure Local VMs (deployed from Azure CLI, Azure portal, ARM) are in scope. Do NOT use Azure Local VM with NSG managed from on-premises tools. |

## Comparison Summary

| SDN management | Supported SDN resources | Supported VMs | Management tools |
|---|---|---|---|
| SDN managed by on-premises tools | Logical networks, VM NICs, NSGs, Virtual networks, SLBs, VPN Gateways | Hyper-V VMs, SCVMM VMs | SDN Express scripts, WAC, PowerShell, SCVMM |
| SDN enabled by Arc | Logical networks, VM NICs, NSGs | Azure Local VMs | Azure portal, Azure CLI, ARM templates |
