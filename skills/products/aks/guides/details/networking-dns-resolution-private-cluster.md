# AKS DNS 解析排查 — private-cluster -- Comprehensive Troubleshooting Guide

**Entries**: 12 | **Draft sources**: 1 | **Kusto queries**: 1
**Source drafts**: ado-wiki-aci-sync-ip-private-dns.md
**Kusto references**: cluster-snapshot.md
**Generated**: 2026-04-07

---

## Phase 1: Customer created a private DNS zone with the same 

### aks-793: AKS cluster update/upgrade fails with CreateOrUpdateVirtualNetworkLinkFailed: A ...

**Root Cause**: Customer created a private DNS zone with the same name as the AKS-managed private DNS zone in a different subscription and linked it to the AKS cluster VNet

**Solution**:
Remove the link between the AKS cluster VNet and the duplicate private DNS zone in the wrong subscription, then reconcile the cluster

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Create%20or%20update%20virtual%20network%20link%20failure)]`

### aks-971: AKS cluster update/upgrade fails with CreateOrUpdateVirtualNetworkLinkFailed: 'A...

**Root Cause**: Customer created a private DNS zone with the same name as the AKS private DNS zone in a different subscription and linked it to the same VNet, causing ambiguous DNS resolution.

**Solution**:
Remove the VNet link between the AKS VNet and the duplicate private DNS zone in the wrong subscription, then reconcile the cluster.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FCreate%20or%20update%20virtual%20network%20link%20failure)]`

## Phase 2: Original private DNS zone was disassociated and a 

### aks-1155: AKS cluster update or upgrade fails with CreateOrUpdateVirtualNetworkLinkFailed ...

**Root Cause**: Original private DNS zone was disassociated and a new zone with the same name was linked from a different resource group/subscription, causing conflict

**Solution**:
Remove the VNET link to the wrongly-placed private DNS zone, then run 'az aks update -n <cluster> -g <rg>' to reconcile

`[Score: [G] 8.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/createorupdatevirtualnetworklinkfailed-error)]`

## Phase 3: Original private DNS zone was disassociated and re

### aks-1184: AKS cluster update/upgrade fails with CreateOrUpdateVirtualNetworkLinkFailed err...

**Root Cause**: Original private DNS zone was disassociated and replaced with a new zone having the same name but in a different resource group/subscription, causing a VNet link conflict.

**Solution**:
Remove the link between the AKS cluster VNet and the incorrect private DNS zone, then run az aks update to re-provision.

`[Score: [G] 8.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/createorupdatevirtualnetworklinkfailed-error)]`

## Phase 4: The cluster managed identity or service principal 

### aks-1185: AKS private cluster create/update fails with CustomPrivateDNSZoneMissingPermissi...

**Root Cause**: The cluster managed identity or service principal does not have the Private DNS Zone Contributor role on the custom private DNS zone resource.

**Solution**:
Assign 'Private DNS Zone Contributor' role to the cluster control plane identity on the private DNS zone resource. Allow up to 60 minutes for permission propagation.

`[Score: [G] 8.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/customprivatednszonemissingpermissions-error)]`

## Phase 5: NSG rule on client subnet (e.g. DenyOutboundHTTPS 

### aks-540: Private AKS cluster: kubectl times out from client VM in peered VNet (hub/spoke ...

**Root Cause**: NSG rule on client subnet (e.g. DenyOutboundHTTPS priority 100) blocks all outbound TCP 443 with destination '*', which includes peered VNet traffic to the AKS private endpoint. When destination prefix is '*', the deny applies to VirtualNetwork service tag as well, not just Internet.

**Solution**:
1) Check NSG rules on client subnet: az network nsg rule list -g <rg> --nsg-name <nsg> -o table; 2) Look for deny rules on port 443 with destination '*'; 3) Fix options: a) Delete overly broad deny rule, b) Change destination to 'Internet' only (allows VirtualNetwork), c) Add higher-priority allow rule for specific API server private IP before the deny; 4) Also check NSGs on both source and destination subnets in peered VNet architectures.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FTSG%3A%20AKS%20-%20Troubleshooting%20Cluster%20API%20Connectivity%20Issues%20(Start%20Here%20Workflow)%2F%5BTSG%5D%20AKS%20API%20Connectivity%20-%20Hands-On%20Labs)]`

## Phase 6: Private endpoint or network interface misconfigura

### aks-570: Private AKS cluster — unable to connect to API server due to timeout, DNS resolv...

**Root Cause**: Private endpoint or network interface misconfiguration — private endpoint NIC not in correct subnet, privateLinkServiceConnection not approved, or network-level blocking

**Solution**:
1. Check private endpoint: az network private-endpoint list. 2. Verify NIC is in cluster subnet and status is Approved. 3. Test connectivity: nc -vz <apiserver-fqdn> 443 from node or VM in same subnet. 4. If networking issue, engage Azure Networking team. CCP logs: FrontEndContextActivity / AsyncContextActivity at aks.kusto.windows.net

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20PrivateLink%20Cluster)]`

## Phase 7: Exit code 51: API server unreachable from nodes. C

### aks-587: AKS node provisioning fails with vmssCSE exit code 51 (ERR_K8S_API_SERVER_CONN_F...

**Root Cause**: Exit code 51: API server unreachable from nodes. Causes: (1) authorized IP ranges missing outbound IP of firewall/NVA, (2) complex network topology (VPN GW + Palo Alto) where outbound IP not whitelisted, (3) cluster in Stopped state and last Start failed. Exit code 52: DNS cannot resolve cluster FQDN. For private clusters with custom DNS: (1) during initial create, private DNS zone not yet linked to VNET (expected, self-heals on subsequent PUT), (2) custom DNS misconfigured - conditional forwarding does not support subdomains for private link hostname.

**Solution**:
Exit code 51: (1) Check authorized IP ranges, add firewall outbound IP. (2) If cluster Stopped, retry Start (or Stop -> wait 30min -> Start). (3) Verify nc -vz <FQDN> 443. Exit code 52: (1) nslookup <ClusterFqdn> from node. (2) For private cluster + custom DNS: follow Hub & Spoke guide at https://learn.microsoft.com/en-us/azure/aks/private-clusters. (3) If conditional forwarding fails for subdomain, create identical record without subdomain in AKS-managed DNS zone.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning)]`

## Phase 8: Customer created a private DNS zone with the exact

### aks-782: AKS cluster update/upgrade fails with CreateOrUpdateVirtualNetworkLinkFailed - '...

**Root Cause**: Customer created a private DNS zone with the exact same name as AKS private DNS zone (*.privatelink.<region>.azmk8s.io) in a different subscription and linked it to the same VNet. AKS RP cannot find the correct zone

**Solution**:
Remove the VNet link between the AKS cluster VNet and the duplicate private DNS zone (the one in the wrong subscription). Then reconcile the cluster and retry the operation

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Create%20or%20update%20virtual%20network%20link%20failure)]`

## Phase 9: Custom DNS server cannot resolve A records under A

### aks-906: Private AKS cluster nodes cannot resolve API server private FQDN when custom DNS...

**Root Cause**: Custom DNS server cannot resolve A records under Azure private DNS zone. The DNS queries need to be forwarded to Azure default DNS server (168.63.129.16). Additionally, the private DNS zone must have a virtual network link to the DNS server VNet.

**Solution**:
1) For Azure-based DNS server: link the private DNS zone to both the custom DNS server VNet and AKS VNet (AKS VNet is auto-linked). Configure DNS forwarding to 168.63.129.16. 2) For on-prem DNS server: set up an Azure VM as DNS forwarder, link private DNS zone to that VM VNet. On-prem DNS forwards to Azure VM, which forwards to 168.63.129.16. Key: ensure virtual network link exists between private DNS zone and DNS server VNet.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FSetup%20private%20AKS%20with%20custom%20DNS%20server)]`

## Phase 10: Cluster control plane managed identity lacks 'Priv

### aks-1026: AKS cluster create/update fails with CustomPrivateDNSZoneMissingPermissionError:...

**Root Cause**: Cluster control plane managed identity lacks 'Private DNS Zone Contributor' role on the custom Private DNS Zone resource. AKS pre-checks permissions and blocks if insufficient.

**Solution**:
Get identity principal ID from ASC Resource Explorer. Get Private DNS Zone resource ID. Create role assignment: az role assignment create --assignee <principal-id> --scope <dns-zone-id> --role 'Private DNS Zone Contributor'. Retry cluster operation.

`[Score: [B] 6.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FTroubleshooting%20the%20CustomPrivateDNSZoneMissingPermissionError%20error)]`

## Phase 11: Private cluster with custom DNS and private DNS zo

### aks-242: AKS private cluster with custom DNS: reconcile operation fails requiring VMSS de...

**Root Cause**: Private cluster with custom DNS and private DNS zone configuration enters a state where reconcile path cannot properly update VMSS with correct DNS settings.

**Solution**:
Delete the VMSS and trigger reconcile to recreate it with correct DNS configuration. Consult AKS PG for latest fix status.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster update/upgrade fails with CreateOrUpdateVirtualNetworkLinkFailed: A ... | Customer created a private DNS zone with the same name as th... | Remove the link between the AKS cluster VNet and the duplica... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Create%20or%20update%20virtual%20network%20link%20failure) |
| 2 | AKS cluster update or upgrade fails with CreateOrUpdateVirtualNetworkLinkFailed ... | Original private DNS zone was disassociated and a new zone w... | Remove the VNET link to the wrongly-placed private DNS zone,... | [G] 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/createorupdatevirtualnetworklinkfailed-error) |
| 3 | AKS cluster update/upgrade fails with CreateOrUpdateVirtualNetworkLinkFailed err... | Original private DNS zone was disassociated and replaced wit... | Remove the link between the AKS cluster VNet and the incorre... | [G] 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/createorupdatevirtualnetworklinkfailed-error) |
| 4 | AKS private cluster create/update fails with CustomPrivateDNSZoneMissingPermissi... | The cluster managed identity or service principal does not h... | Assign 'Private DNS Zone Contributor' role to the cluster co... | [G] 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/customprivatednszonemissingpermissions-error) |
| 5 | Private AKS cluster: kubectl times out from client VM in peered VNet (hub/spoke ... | NSG rule on client subnet (e.g. DenyOutboundHTTPS priority 1... | 1) Check NSG rules on client subnet: az network nsg rule lis... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FTSG%3A%20AKS%20-%20Troubleshooting%20Cluster%20API%20Connectivity%20Issues%20(Start%20Here%20Workflow)%2F%5BTSG%5D%20AKS%20API%20Connectivity%20-%20Hands-On%20Labs) |
| 6 | Private AKS cluster — unable to connect to API server due to timeout, DNS resolv... | Private endpoint or network interface misconfiguration — pri... | 1. Check private endpoint: az network private-endpoint list.... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20PrivateLink%20Cluster) |
| 7 | AKS node provisioning fails with vmssCSE exit code 51 (ERR_K8S_API_SERVER_CONN_F... | Exit code 51: API server unreachable from nodes. Causes: (1)... | Exit code 51: (1) Check authorized IP ranges, add firewall o... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 8 | AKS cluster update/upgrade fails with CreateOrUpdateVirtualNetworkLinkFailed - '... | Customer created a private DNS zone with the exact same name... | Remove the VNet link between the AKS cluster VNet and the du... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Create%20or%20update%20virtual%20network%20link%20failure) |
| 9 | Private AKS cluster nodes cannot resolve API server private FQDN when custom DNS... | Custom DNS server cannot resolve A records under Azure priva... | 1) For Azure-based DNS server: link the private DNS zone to ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FSetup%20private%20AKS%20with%20custom%20DNS%20server) |
| 10 | AKS cluster update/upgrade fails with CreateOrUpdateVirtualNetworkLinkFailed: 'A... | Customer created a private DNS zone with the same name as th... | Remove the VNet link between the AKS VNet and the duplicate ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FCreate%20or%20update%20virtual%20network%20link%20failure) |
| 11 | AKS cluster create/update fails with CustomPrivateDNSZoneMissingPermissionError:... | Cluster control plane managed identity lacks 'Private DNS Zo... | Get identity principal ID from ASC Resource Explorer. Get Pr... | [B] 6.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FTroubleshooting%20the%20CustomPrivateDNSZoneMissingPermissionError%20error) |
| 12 | AKS private cluster with custom DNS: reconcile operation fails requiring VMSS de... | Private cluster with custom DNS and private DNS zone configu... | Delete the VMSS and trigger reconcile to recreate it with co... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
