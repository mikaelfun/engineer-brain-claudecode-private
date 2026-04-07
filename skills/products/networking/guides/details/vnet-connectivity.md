# Networking VNet 连接与基础设施 — 综合排查指南

**条目数**: 11 | **草稿融合数**: 5 | **Kusto 查询融合**: 4
**来源草稿**: [mslearn-vnet-subnet-deletion.md], [onenote-accelerated-networking-diagnostics.md], [onenote-nmagent-version-check.md], [onenote-vnet-get-escort-jit.md], [onenote-vxlan-vfp-netmon-decoding.md]
**Kusto 引用**: [arg-publicip.md], [arg-vnet-subnet.md], [nmagent.md], [server-tor.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 网络与路由
> 来源: mslearn + ado-wiki + onenote

1. **Function App deployment slot returns Internal Server Error and DevOps deployment fails with SCM timeout when Function Ap**
   - 根因: When Storage Account is secured by VNet firewall, creating a deployment slot generates a random WEBSITE_CONTENTSHARE name but the corresponding File Share is NOT automatically created in Azure Storage, causing the slot to fail to start
   - 方案: Pre-create the File Share in Azure Storage before creating the deployment slot. Set WEBSITE_CONTENTSHARE to a predefined unique value for each slot (main app + each deployment slot). This is by-design per MS docs: secured storage accounts in VNet require manual share creation as part of automated deployment
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/6.5 Function App deployment slot is unavailable.md]`

2. **VM with NAT Gateway: need to understand how VFP rules change when NAT Gateway is associated with subnet**
   - 根因: When NAT Gateway is attached, the RouteTargetInternet_0 VFP rule changes to use NVGRE encap with source=node IP and destination=NAT Gateway VIP, while SLB_SNAT_RULE remains unchanged
   - 方案: Check VFP rules or Process Tuples on the host: SLB_SNAT_RULE stays the same, but RouteTargetInternet_0 changes to routeencap type with NVGRE encap pointing to NAT GW VIP. Use this to confirm NAT Gateway is correctly applied to the VM's outbound traffic.
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/3.11[MCVKB] VFP rule of VM with NAT Gateway.md]`

3. **AppGW create or update operations fail with ApplicationGatewayInsufficientPermissionOnSubnet error; also affects AGIC ma**
   - 根因: The user, service principal, or managed identity performing the AppGW operation lacks the Microsoft.Network/virtualNetworks/subnets/join/action permission on the VNet/subnet where AppGW is deployed; this check was enabled starting June 2023
   - 方案: Assign the built-in 'Network Contributor' role (or a custom role with Microsoft.Network/virtualNetworks/subnets/join/action) to the user/SP/MI on the VNet or subnet. For AGIC add-on: assign Network Contributor to the AGIC MI on the AppGW subnet. Temporary workaround: register the AFEC flag 'ApplicationGatewaySubnetPermissionCheck' to disable validation — remove before June 2023 cutoff (no longer available permanently).
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FVNET%20Permission%20Check)`

4. **Cannot delete Azure subnet - blocked by private endpoints, subnet delegation, service association links, or orphaned NIC**
   - 根因: Subnet deletion blocked by: private endpoints, active delegation (e.g., Microsoft.Web/serverFarms), service association links, orphaned NICs, or Azure Bastion/Firewall reserved subnets.
   - 方案: Diagnose with: az network vnet subnet show --query {delegations,privateEndpoints,ipConfigurations,serviceAssociationLinks}. Remove private endpoints first, then service resources, then delegation. Orphaned NICs: delete NIC. Service association links may take 10-15 min to clear.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-cannot-delete-vnet)`

5. **Cannot resize subnet - error when new address prefix excludes IP addresses currently in use by VMs, load balancers, or o**
   - 根因: Azure requires the new subnet address range to include ALL existing IP allocations. If the new prefix excludes any assigned IP, the resize fails. Azure also reserves 5 IPs per subnet (first 4 + last).
   - 方案: Check used IPs: az network vnet subnet show --query ipConfigurations. Ensure new prefix covers all assigned IPs plus 5 reserved. Move resources to another subnet if shrinking is needed.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-cannot-delete-modify-subnet)`

### Phase 2: 其他
> 来源: mslearn + onenote

1. **Cannot get correct outbound (OUT) traffic stats for vNIC when Accelerated Networking is enabled - Jarvis dashboard shows**
   - 根因: With Accelerated Networking enabled, data plane packets bypass the vmswitch via SR-IOV, so the traditional vmswitch-based Jarvis dashboard cannot capture OUT stats
   - 方案: Switch to the GFT namespace Jarvis dashboard instead of the default vmswitch namespace. Use GFT metrics dashboard for accurate AccelNet traffic stats.
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/10.1[NET]How to get the OUT stats of vNIC if Accel.md]`

2. **NVA (Network Virtual Appliance) not forwarding traffic - VM or VPN connectivity errors when using partner NVA in Azure**
   - 根因: IP forwarding not enabled on the NVA's network interface. Without IP forwarding, the NVA drops packets not destined for its own IP address.
   - 方案: Enable IP forwarding on NVA NIC: Portal > NVA resource > Networking > Network interface > IP configuration > enable IP forwarding. Or via PowerShell: Get-AzNetworkInterface, set EnableIPForwarding = 1, Set-AzNetworkInterface. Also verify UDRs point traffic to NVA and NSG allows traffic when using Standard SKU public IP.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nva)`

3. **VNet peering status shows Disconnected - traffic cannot flow between peered virtual networks**
   - 根因: One of the two peering links was deleted (manual deletion, address space changes without sync, subscription/tenant changes, or Azure Policy enforcement). When one link is removed, the remaining link transitions to Disconnected.
   - 方案: Delete the remaining peering link from BOTH virtual networks first, then re-create peering from both sides. Ensure correct settings for Allow forwarded traffic, Allow gateway transit, and Use remote gateways. Verify Connected on both sides.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-issues)`

4. **Cannot create VNet peering - error: Virtual network address space overlaps with the address space of the already peered **
   - 根因: Azure does not allow virtual network peering between two VNets with overlapping CIDR address spaces. Even partial overlap (e.g., 10.0.0.0/16 and 10.0.1.0/24) is blocked.
   - 方案: Resize one of the virtual networks to remove the overlapping address range (ensure no subnets/resources in the range). Alternatively use Azure Virtual Network Manager. Plan address spaces before peering using centralized IPAM.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-issues)`

5. **Traffic to newly added address ranges in peered VNet fails after address space change - effective routes still show old **
   - 根因: After modifying address space of a peered VNet, the peering must be synced to update remote peer routing. Without sync, remote peered VNet uses old address space, causing routing failures.
   - 方案: Sync peering after every address space change: Azure portal > VNet > Peering > select > Sync. CLI: az network vnet peering sync. Repeat for each remote peer. Note: sync not supported when peered with classic VNet.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-sync-route-issues)`

### Phase 3: 已知问题与限制
> 来源: onenote

1. **Cannot create VNET peering between VNETs in different Azure AD tenants via Azure Portal in Mooncake**
   - 根因: Azure Portal does not support cross-tenant VNET peering directly. Previously guest user invitation across tenants was also not supported in Azure China, but now it is.
   - 方案: Use Azure CLI: 1) Add guest users across tenants, 2) Assign Network Contributor role to the guest user on each VNET, 3) Use 'az network vnet peering create --remote-vnet-id <full-resource-id>' from each tenant's context with 'az account set' to switch subscriptions
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/3.12 跨租户配置VNET Peering.md]`

## Kusto 查询模板

`[工具: Kusto skill — arg-publicip.md]`
→ 详见 `skills/kusto/networking/references/queries/arg-publicip.md`

`[工具: Kusto skill — arg-vnet-subnet.md]`
→ 详见 `skills/kusto/networking/references/queries/arg-vnet-subnet.md`

`[工具: Kusto skill — nmagent.md]`
→ 详见 `skills/kusto/networking/references/queries/nmagent.md`

`[工具: Kusto skill — server-tor.md]`
→ 详见 `skills/kusto/networking/references/queries/server-tor.md`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot create VNET peering between VNETs in different Azu... | Azure Portal does not support cross-tenant VNET... | Use Azure CLI: 1) Add guest users across tenant... | 🟢 9.5 | [MCVKB/3.12 跨租户配置VNET Peering.md] |
| 2 | Function App deployment slot returns Internal Server Erro... | When Storage Account is secured by VNet firewal... | Pre-create the File Share in Azure Storage befo... | 🟢 9.5 | [MCVKB/6.5 Function App deployment slot is unavailable.md] |
| 3 | VM with NAT Gateway: need to understand how VFP rules cha... | When NAT Gateway is attached, the RouteTargetIn... | Check VFP rules or Process Tuples on the host: ... | 🟢 9.5 | [MCVKB/3.11[MCVKB] VFP rule of VM with NAT Gateway.md] |
| 4 | Cannot get correct outbound (OUT) traffic stats for vNIC ... | With Accelerated Networking enabled, data plane... | Switch to the GFT namespace Jarvis dashboard in... | 🟢 9.5 | [MCVKB/10.1[NET]How to get the OUT stats of vNIC if Accel.md] |
| 5 | AppGW create or update operations fail with ApplicationGa... | The user, service principal, or managed identit... | Assign the built-in 'Network Contributor' role ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FVNET%20Permission%20Check) |
| 6 | NVA (Network Virtual Appliance) not forwarding traffic - ... | IP forwarding not enabled on the NVA's network ... | Enable IP forwarding on NVA NIC: Portal > NVA r... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nva) |
| 7 | VNet peering status shows Disconnected - traffic cannot f... | One of the two peering links was deleted (manua... | Delete the remaining peering link from BOTH vir... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-issues) |
| 8 | Cannot create VNet peering - error: Virtual network addre... | Azure does not allow virtual network peering be... | Resize one of the virtual networks to remove th... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-issues) |
| 9 | Traffic to newly added address ranges in peered VNet fail... | After modifying address space of a peered VNet,... | Sync peering after every address space change: ... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-sync-route-issues) |
| 10 | Cannot delete Azure subnet - blocked by private endpoints... | Subnet deletion blocked by: private endpoints, ... | Diagnose with: az network vnet subnet show --qu... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-cannot-delete-vnet) |
| 11 | Cannot resize subnet - error when new address prefix excl... | Azure requires the new subnet address range to ... | Check used IPs: az network vnet subnet show --q... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-cannot-delete-modify-subnet) |
