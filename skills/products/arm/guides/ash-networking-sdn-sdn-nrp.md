# ARM Azure Stack Hub 网络与 SDN sdn nrp — 排查速查

**来源数**: 15 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Duplicate MAC addresses in Network Controller NetworkInterfaces resource causing network connectivi… | MAC address duplication in SDN Network Controller database for NetworkInterfaces | Run Test-AzsSupportKIDuplicateMacAddressesNC to detect. Use -SkipVersionCheck to bypass version che… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | ILB PA VIP pool exhausted on Azure Stack Hub, ILB Manager incorrectly allocates VIPs from the publi… | Internal Load Balancer PA VIP pool depletion causing VIP allocation to spill into the public IP pool | Run Test-AzsSupportKISDNILBVIPPoolExhausted to detect. Expand PA VIP pool or reclaim unused VIPs. | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Duplicate MAC addresses in OVSDB ms_vtep physical ports table causing SDN connectivity issues on Az… | Duplicate MAC address entries in the OVSDB ms_vtep physical ports table | Run Test-AzsSupportKIDuplicateMACsPhysicalPortTable to detect. Use -Remediate flag for automated re… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Duplicate MAC addresses in OVSDB ms_vtep ucast remote table causing SDN forwarding issues on Azure … | Duplicate MAC address entries in the OVSDB ms_vtep ucast remote table | Run Test-AzsSupportDuplicateMACsUcastRemoteTable to detect duplicate entries. | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Azure Stack Hub SDN Load Balancer Manager IP pool mismatch: subnets marked isPublic=true are not ad… | Logical Network subnets with isPublic=true not properly registered in SLB Manager ipPools configura… | Run Test-AzsSupportKIVirtualIpPoolMissing from the Azs.Support module. Use -Remediate flag for auto… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Azure Stack Hub virtual network outbound NAT public IP address is in a failed or invalid state, pot… | Default outbound NAT rule public IP address entered a failed state. | Run Test-AzsSupportKIOutboundNATPublicIPState from the Azs.Support module to validate the public IP… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Duplicate IP address entries in NRP KVS, potentially causing IP conflict or allocation failures on … | NRP KVS contains duplicate IP address owner entries leading to inconsistent network state | Run Test-AzsSupportKIDuplicateIPAddressEntriesinNRPKVS to detect. Manual mitigation required per th… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Invalid external DNS entries in NRP KVS causing DNS resolution failures for tenant resources on Azu… | Invalid external DNS entries created in NRP KVS corrupting DNS configuration | Run Test-AzsSupportKIInvalidDNSOEntries to identify invalid DNS entries. Remove or correct the inva… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | IP addresses in VNET Subnet IP Address Owner Dictionary but not in Subnet IP Configurations list, c… | Mismatched entries between Subnet IP Address Owner Dictionary and IP Configurations list in NRP KVS | Run Test-AzsSupportKIMismatchedIPAddressEntriesinNRPKVS to detect. Use -Remediate flag for automate… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | IP addresses missing from VNET IP Address Owner Dictionary in NRP KVS causing IP allocation or trac… | Missing IP address owner entries in NRP KVS leading to incomplete network state tracking | Run Test-AzsSupportKIMissingIPAddressEntriesinNRPKVS to detect. Use -Remediate flag for automated r… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 📋 | Azure Stack Hub infrastructure VMs fail TCP connectivity check to Microsoft login/AAD endpoint URLs | Infrastructure VMs designed to have internet access cannot reach Microsoft login endpoints, indicat… | Run Test-AzsSupportKIExternalNetworkConnectivity from CSSTools Azs.Support module to perform TCP co… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 📋 | Datacenter network device northbound of Azure Stack Hub performing TLS inspection, breaking secure … | A datacenter device (firewall, proxy, etc.) upstream of Azure Stack Hub is performing TLS inspectio… | Run Test-AzsSupportKIDatacenterTLSInspection from CSSTools Azs.Support module to validate whether T… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 📋 | DNS forwarders on Azure Stack Hub unable to resolve names successfully, causing DNS resolution fail… | DNS forwarders configured on Azure Stack Hub are not functioning correctly, failing to resolve exte… | Run Test-AzsSupportKIDnsForwarderNameResolution from CSSTools Azs.Support module to validate DNS fo… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 📋 | Kubernetes master and worker nodes on Azure Stack Hub fail to communicate with ARM endpoint during … | Management ARM endpoint IP falls within the CIDR range of the virtual network/subnet that Kubernete… | Use a custom virtual network with AKS engine and ensure the management ARM endpoint IP does not fal… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 15 📋 | Azure Stack Hub firewall blocks access to the new Marketplace and Patch & Update CDN endpoint, caus… | Firewall rules not updated to allow traffic to the new CDN endpoint used by Marketplace and Patch &… | Run Test-AzsSupportKICDNFirewallAccess to detect the issue. Update firewall rules to whitelist the … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Run Test-AzsSupportKIDuplicateMacAddressesNC to detect. Use -SkipVersionCheck t… `[来源: ado-wiki]`
2. Run Test-AzsSupportKISDNILBVIPPoolExhausted to detect. Expand PA VIP pool or re… `[来源: ado-wiki]`
3. Run Test-AzsSupportKIDuplicateMACsPhysicalPortTable to detect. Use -Remediate f… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ash-networking-sdn-sdn-nrp.md#排查流程)
