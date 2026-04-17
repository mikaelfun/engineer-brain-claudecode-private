---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] Aks and Network team common troubleshooting/5 - Troubleshoot Connectivity issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F5%20-%20Troubleshoot%20Connectivity%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS Network Connectivity Troubleshooting

## General Approach
For all connectivity issues, identify: source IP, destination IP, destination port.

## Unable to connect to a VM in a peered VNET
1. Verify VM is running and accessible within its own VNET
2. Check peering configuration
3. Check NSGs on VM and peered VNET
4. Verify IP address is correct
5. Check routing tables for correct routes

## Unable to reach a port
1. Verify app/service is running in container/VM
2. Check NSGs on AKS nodes, app, and load balancers
3. Verify IP/hostname is correct
4. Check routing tables and NSGs for proper routing

## Unable to connect to VM in same VNET
1. Verify VM is running
2. Check NSGs
3. Verify IP address
4. Check routing tables
5. Check for firewall or application issues on VM

## VNet Peering Issues
Reference: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/134291/Vnet-Peering

## TLS Connection Troubleshooting
Reference: https://techcommunity.microsoft.com/t5/azure-paas-blog/ssl-tls-connection-issue-troubleshooting-test-tools/ba-p/2240059

## Private Cluster API Server + NVA Decision Tree

```
Private AKS?
├── Yes → Using NVA?
│   ├── Yes → Using Private Endpoint Policy?
│   │   ├── Yes → Customer uses SNAT in NVA?
│   │   │   ├── Yes → Follow PE documentation
│   │   │   └── No → Configure SNAT (REQUIRED for AKS Private Cluster)
│   │   └── No → Follow "Can't connect to PE" wiki
│   └── No → Follow "Can't connect to PE" wiki
└── No → Standard connectivity troubleshooting
```

### Key Point: SNAT Required for Private AKS + NVA
- Some PE resources (like Storage Account) work through AzFW/NVA without SNAT
- **AKS Private Cluster DOES NOT work without SNAT** through NVA/AzFW
- Must configure SNAT on firewall side for traffic to private endpoints
- Reference: https://learn.microsoft.com/en-us/azure/private-link/inspect-traffic-with-azure-firewall
- Internal: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1008662/User-Defined-Routes-Support-For-Private-Endpoints
