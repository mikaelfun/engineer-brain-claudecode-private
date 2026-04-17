# ARM Azure Stack Hub 网络与 SDN dns hyper v — 排查速查

**来源数**: 4 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Orphaned DNS records on WASP DNS Server, records persist after associated resources were deleted on… | DNS records not cleaned up when associated resources are deleted, stale entries found by cross-refe… | Run Test-AzsSupportKIOrphanedDNSRecords to identify orphaned records. Clean up stale DNS entries fr… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Azure Stack Hub VM network adapters have duplicate MAC addresses in Hyper-V, preventing Network Con… | Duplicate MAC addresses assigned to VM network adapters within Hyper-V host. | Run Test-AzsSupportKIDuplicateMACsHypervisor from the Azs.Support module. Use -SkipVersionCheck if … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Azure Stack Hub S2S VPN connections report policy misconfiguration failure, causing VPN tunnels to … | Site-to-Site VPN connection policy misconfiguration. | Run Test-AzsSupportKIVPNPolicyMisconfiguration from the Azs.Support module to identify affected S2S… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Deleting a load balancer in Azure Stack Hub 1907 results in orphaned resources; LB object persists … | Load balancer deletion did not propagate to delete the corresponding object in Network Controller (… | Apply hotfix 1.1907.17.54 (KB 4523826). Fix ensures deleting an LB also deletes the object in NC, p… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Run Test-AzsSupportKIOrphanedDNSRecords to identify orphaned records. Clean up … `[来源: ado-wiki]`
2. Run Test-AzsSupportKIDuplicateMACsHypervisor from the Azs.Support module. Use -… `[来源: ado-wiki]`
3. Run Test-AzsSupportKIVPNPolicyMisconfiguration from the Azs.Support module to i… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ash-networking-sdn-dns-hyper-v.md#排查流程)
