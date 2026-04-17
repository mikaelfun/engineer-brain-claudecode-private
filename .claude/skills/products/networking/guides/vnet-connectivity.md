# Networking VNet 连接与基础设施 — 排查速查

**来源数**: 3 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Cannot create VNET peering between VNETs in different Azu... | Azure Portal does not support cross-tenant VNET... | Use Azure CLI: 1) Add guest users across tenant... | 🟢 9.5 | [MCVKB/3.12 跨租户配置VNET Peering.md] |
| 2 📋 | Function App deployment slot returns Internal Server Erro... | When Storage Account is secured by VNet firewal... | Pre-create the File Share in Azure Storage befo... | 🟢 9.5 | [MCVKB/6.5 Function App deployment slot is unavailable.md] |
| 3 📋 | VM with NAT Gateway: need to understand how VFP rules cha... | When NAT Gateway is attached, the RouteTargetIn... | Check VFP rules or Process Tuples on the host: ... | 🟢 9.5 | [MCVKB/3.11[MCVKB] VFP rule of VM with NAT Gateway.md] |
| 4 📋 | Cannot get correct outbound (OUT) traffic stats for vNIC ... | With Accelerated Networking enabled, data plane... | Switch to the GFT namespace Jarvis dashboard in... | 🟢 9.5 | [MCVKB/10.1[NET]How to get the OUT stats of vNIC if Accel.md] |
| 5 📋 | AppGW create or update operations fail with ApplicationGa... | The user, service principal, or managed identit... | Assign the built-in 'Network Contributor' role ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FVNET%20Permission%20Check) |
| 6 📋 | NVA (Network Virtual Appliance) not forwarding traffic - ... | IP forwarding not enabled on the NVA's network ... | Enable IP forwarding on NVA NIC: Portal > NVA r... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nva) |
| 7 📋 | VNet peering status shows Disconnected - traffic cannot f... | One of the two peering links was deleted (manua... | Delete the remaining peering link from BOTH vir... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-issues) |
| 8 📋 | Cannot create VNet peering - error: Virtual network addre... | Azure does not allow virtual network peering be... | Resize one of the virtual networks to remove th... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-issues) |
| 9 📋 | Traffic to newly added address ranges in peered VNet fail... | After modifying address space of a peered VNet,... | Sync peering after every address space change: ... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-sync-route-issues) |
| 10 📋 | Cannot delete Azure subnet - blocked by private endpoints... | Subnet deletion blocked by: private endpoints, ... | Diagnose with: az network vnet subnet show --qu... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-cannot-delete-vnet) |
| 11 📋 | Cannot resize subnet - error when new address prefix excl... | Azure requires the new subnet address range to ... | Check used IPs: az network vnet subnet show --q... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-cannot-delete-modify-subnet) |

## 快速排查路径
1. Use Azure CLI: 1) Add guest users across tenants, 2) Assign Network Contributor role to the guest us `[来源: onenote]`
2. Pre-create the File Share in Azure Storage before creating the deployment slot. Set WEBSITE_CONTENTS `[来源: onenote]`
3. Check VFP rules or Process Tuples on the host: SLB_SNAT_RULE stays the same, but RouteTargetInternet `[来源: onenote]`
4. Switch to the GFT namespace Jarvis dashboard instead of the default vmswitch namespace. Use GFT metr `[来源: onenote]`
5. Assign the built-in 'Network Contributor' role (or a custom role with Microsoft.Network/virtualNetwo `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vnet-connectivity.md#排查流程)
