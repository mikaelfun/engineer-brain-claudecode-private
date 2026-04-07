# ARM Azure Stack Hub 网络与 SDN sdn nrp — 综合排查指南

**条目数**: 15 | **草稿融合数**: 8 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-Invoke-AzsSupportSdnResourceRequest.md, ado-wiki-a-install-the-sdn-diagnostics-module.md, ado-wiki-a-sdn-enabled-by-azure-arc.md, ado-wiki-a-sdn-log-analysis.md, ado-wiki-a-sdn-managed-by-on-premise-tools.md (+3 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Kubernetes master and worker nodes on Azure Stack Hub fail to communicate with …
> 来源: ado-wiki

**根因分析**: Management ARM endpoint IP falls within the CIDR range of the virtual network/subnet that Kubernetes is deployed against, causing nodes to route traffic internally instead of to the public management ARM IP. Default AKS creates 10.240.0.0/16 subnet which may overlap with management endpoint.

1. Use a custom virtual network with AKS engine and ensure the management ARM endpoint IP does not fall within the CIDR of the custom virtual network and subnets.
2. Reference: https://github.
3. com/Azure/aks-engine-azurestack/blob/master/docs/tutorials/custom-vnet.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Stack Hub infrastructure VMs fail TCP connectivity check to Microsoft log…
> 来源: ado-wiki

**根因分析**: Infrastructure VMs designed to have internet access cannot reach Microsoft login endpoints, indicating network configuration or firewall issues

1. Run Test-AzsSupportKIExternalNetworkConnectivity from CSSTools Azs.
2. Support module to perform TCP connectivity check to Microsoft login server URLs for all relevant infra VMs.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Datacenter network device northbound of Azure Stack Hub performing TLS inspecti…
> 来源: ado-wiki

**根因分析**: A datacenter device (firewall, proxy, etc.) upstream of Azure Stack Hub is performing TLS inspection/interception, which is not supported and breaks certificate chain validation

1. Run Test-AzsSupportKIDatacenterTLSInspection from CSSTools Azs.
2. Support module to validate whether TLS inspection is occurring.
3. If detected, configure datacenter device to exempt Azure Stack Hub traffic from TLS inspection.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: DNS forwarders on Azure Stack Hub unable to resolve names successfully, causing…
> 来源: ado-wiki

**根因分析**: DNS forwarders configured on Azure Stack Hub are not functioning correctly, failing to resolve external domain names

1. Run Test-AzsSupportKIDnsForwarderNameResolution from CSSTools Azs.
2. Support module to validate DNS forwarder name resolution capability.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Azure Stack Hub firewall blocks access to the new Marketplace and Patch & Updat…
> 来源: ado-wiki

**根因分析**: Firewall rules not updated to allow traffic to the new CDN endpoint used by Marketplace and Patch & Update services

1. Run Test-AzsSupportKICDNFirewallAccess to detect the issue.
2. Update firewall rules to whitelist the new CDN endpoint.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Duplicate IP address entries in NRP KVS, potentially causing IP conflict or all…
> 来源: ado-wiki

**根因分析**: NRP KVS contains duplicate IP address owner entries leading to inconsistent network state

1. Run Test-AzsSupportKIDuplicateIPAddressEntriesinNRPKVS to detect.
2. Manual mitigation required per the summary of duplicate IPs.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Invalid external DNS entries in NRP KVS causing DNS resolution failures for ten…
> 来源: ado-wiki

**根因分析**: Invalid external DNS entries created in NRP KVS corrupting DNS configuration

1. Run Test-AzsSupportKIInvalidDNSOEntries to identify invalid DNS entries.
2. Remove or correct the invalid entries.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: IP addresses in VNET Subnet IP Address Owner Dictionary but not in Subnet IP Co…
> 来源: ado-wiki

**根因分析**: Mismatched entries between Subnet IP Address Owner Dictionary and IP Configurations list in NRP KVS

1. Run Test-AzsSupportKIMismatchedIPAddressEntriesinNRPKVS to detect.
2. Use -Remediate flag for automated remediation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: IP addresses missing from VNET IP Address Owner Dictionary in NRP KVS causing I…
> 来源: ado-wiki

**根因分析**: Missing IP address owner entries in NRP KVS leading to incomplete network state tracking

1. Run Test-AzsSupportKIMissingIPAddressEntriesinNRPKVS to detect.
2. Use -Remediate flag for automated remediation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Duplicate MAC addresses in Network Controller NetworkInterfaces resource causin…
> 来源: ado-wiki

**根因分析**: MAC address duplication in SDN Network Controller database for NetworkInterfaces

1. Run Test-AzsSupportKIDuplicateMacAddressesNC to detect.
2. Use -SkipVersionCheck to bypass version check if needed.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: ILB PA VIP pool exhausted on Azure Stack Hub, ILB Manager incorrectly allocates…
> 来源: ado-wiki

**根因分析**: Internal Load Balancer PA VIP pool depletion causing VIP allocation to spill into the public IP pool

1. Run Test-AzsSupportKISDNILBVIPPoolExhausted to detect.
2. Expand PA VIP pool or reclaim unused VIPs.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 12: Duplicate MAC addresses in OVSDB ms_vtep physical ports table causing SDN conne…
> 来源: ado-wiki

**根因分析**: Duplicate MAC address entries in the OVSDB ms_vtep physical ports table

1. Run Test-AzsSupportKIDuplicateMACsPhysicalPortTable to detect.
2. Use -Remediate flag for automated remediation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 13: Duplicate MAC addresses in OVSDB ms_vtep ucast remote table causing SDN forward…
> 来源: ado-wiki

**根因分析**: Duplicate MAC address entries in the OVSDB ms_vtep ucast remote table

1. Run Test-AzsSupportDuplicateMACsUcastRemoteTable to detect duplicate entries.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 14: Azure Stack Hub SDN Load Balancer Manager IP pool mismatch: subnets marked isPu…
> 来源: ado-wiki

**根因分析**: Logical Network subnets with isPublic=true not properly registered in SLB Manager ipPools configuration.

1. Run Test-AzsSupportKIVirtualIpPoolMissing from the Azs.
2. Support module.
3. Use -Remediate flag for automated fix.
4. Use -SkipVersionCheck if verifying on non-standard builds.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 15: Azure Stack Hub virtual network outbound NAT public IP address is in a failed o…
> 来源: ado-wiki

**根因分析**: Default outbound NAT rule public IP address entered a failed state.

1. Run Test-AzsSupportKIOutboundNATPublicIPState from the Azs.
2. Support module to validate the public IP state.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Kubernetes master and worker nodes on Azure Stack Hub fail … | Management ARM endpoint IP falls within the CIDR range of t… | Use a custom virtual network with AKS engine and ensure the… |
| Azure Stack Hub infrastructure VMs fail TCP connectivity ch… | Infrastructure VMs designed to have internet access cannot … | Run Test-AzsSupportKIExternalNetworkConnectivity from CSSTo… |
| Datacenter network device northbound of Azure Stack Hub per… | A datacenter device (firewall, proxy, etc.) upstream of Azu… | Run Test-AzsSupportKIDatacenterTLSInspection from CSSTools … |
| DNS forwarders on Azure Stack Hub unable to resolve names s… | DNS forwarders configured on Azure Stack Hub are not functi… | Run Test-AzsSupportKIDnsForwarderNameResolution from CSSToo… |
| Azure Stack Hub firewall blocks access to the new Marketpla… | Firewall rules not updated to allow traffic to the new CDN … | Run Test-AzsSupportKICDNFirewallAccess to detect the issue.… |
| Duplicate IP address entries in NRP KVS, potentially causin… | NRP KVS contains duplicate IP address owner entries leading… | Run Test-AzsSupportKIDuplicateIPAddressEntriesinNRPKVS to d… |
| Invalid external DNS entries in NRP KVS causing DNS resolut… | Invalid external DNS entries created in NRP KVS corrupting … | Run Test-AzsSupportKIInvalidDNSOEntries to identify invalid… |
| IP addresses in VNET Subnet IP Address Owner Dictionary but… | Mismatched entries between Subnet IP Address Owner Dictiona… | Run Test-AzsSupportKIMismatchedIPAddressEntriesinNRPKVS to … |
| IP addresses missing from VNET IP Address Owner Dictionary … | Missing IP address owner entries in NRP KVS leading to inco… | Run Test-AzsSupportKIMissingIPAddressEntriesinNRPKVS to det… |
| Duplicate MAC addresses in Network Controller NetworkInterf… | MAC address duplication in SDN Network Controller database … | Run Test-AzsSupportKIDuplicateMacAddressesNC to detect. Use… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Duplicate MAC addresses in Network Controller NetworkInterfaces resource causing network connectivi… | MAC address duplication in SDN Network Controller database for NetworkInterfaces | Run Test-AzsSupportKIDuplicateMacAddressesNC to detect. Use -SkipVersionCheck to bypass version che… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | ILB PA VIP pool exhausted on Azure Stack Hub, ILB Manager incorrectly allocates VIPs from the publi… | Internal Load Balancer PA VIP pool depletion causing VIP allocation to spill into the public IP pool | Run Test-AzsSupportKISDNILBVIPPoolExhausted to detect. Expand PA VIP pool or reclaim unused VIPs. | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Duplicate MAC addresses in OVSDB ms_vtep physical ports table causing SDN connectivity issues on Az… | Duplicate MAC address entries in the OVSDB ms_vtep physical ports table | Run Test-AzsSupportKIDuplicateMACsPhysicalPortTable to detect. Use -Remediate flag for automated re… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Duplicate MAC addresses in OVSDB ms_vtep ucast remote table causing SDN forwarding issues on Azure … | Duplicate MAC address entries in the OVSDB ms_vtep ucast remote table | Run Test-AzsSupportDuplicateMACsUcastRemoteTable to detect duplicate entries. | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Azure Stack Hub SDN Load Balancer Manager IP pool mismatch: subnets marked isPublic=true are not ad… | Logical Network subnets with isPublic=true not properly registered in SLB Manager ipPools configura… | Run Test-AzsSupportKIVirtualIpPoolMissing from the Azs.Support module. Use -Remediate flag for auto… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Azure Stack Hub virtual network outbound NAT public IP address is in a failed or invalid state, pot… | Default outbound NAT rule public IP address entered a failed state. | Run Test-AzsSupportKIOutboundNATPublicIPState from the Azs.Support module to validate the public IP… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Duplicate IP address entries in NRP KVS, potentially causing IP conflict or allocation failures on … | NRP KVS contains duplicate IP address owner entries leading to inconsistent network state | Run Test-AzsSupportKIDuplicateIPAddressEntriesinNRPKVS to detect. Manual mitigation required per th… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Invalid external DNS entries in NRP KVS causing DNS resolution failures for tenant resources on Azu… | Invalid external DNS entries created in NRP KVS corrupting DNS configuration | Run Test-AzsSupportKIInvalidDNSOEntries to identify invalid DNS entries. Remove or correct the inva… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | IP addresses in VNET Subnet IP Address Owner Dictionary but not in Subnet IP Configurations list, c… | Mismatched entries between Subnet IP Address Owner Dictionary and IP Configurations list in NRP KVS | Run Test-AzsSupportKIMismatchedIPAddressEntriesinNRPKVS to detect. Use -Remediate flag for automate… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | IP addresses missing from VNET IP Address Owner Dictionary in NRP KVS causing IP allocation or trac… | Missing IP address owner entries in NRP KVS leading to incomplete network state tracking | Run Test-AzsSupportKIMissingIPAddressEntriesinNRPKVS to detect. Use -Remediate flag for automated r… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | Azure Stack Hub infrastructure VMs fail TCP connectivity check to Microsoft login/AAD endpoint URLs | Infrastructure VMs designed to have internet access cannot reach Microsoft login endpoints, indicat… | Run Test-AzsSupportKIExternalNetworkConnectivity from CSSTools Azs.Support module to perform TCP co… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 | Datacenter network device northbound of Azure Stack Hub performing TLS inspection, breaking secure … | A datacenter device (firewall, proxy, etc.) upstream of Azure Stack Hub is performing TLS inspectio… | Run Test-AzsSupportKIDatacenterTLSInspection from CSSTools Azs.Support module to validate whether T… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 | DNS forwarders on Azure Stack Hub unable to resolve names successfully, causing DNS resolution fail… | DNS forwarders configured on Azure Stack Hub are not functioning correctly, failing to resolve exte… | Run Test-AzsSupportKIDnsForwarderNameResolution from CSSTools Azs.Support module to validate DNS fo… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 | Kubernetes master and worker nodes on Azure Stack Hub fail to communicate with ARM endpoint during … | Management ARM endpoint IP falls within the CIDR range of the virtual network/subnet that Kubernete… | Use a custom virtual network with AKS engine and ensure the management ARM endpoint IP does not fal… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 15 | Azure Stack Hub firewall blocks access to the new Marketplace and Patch & Update CDN endpoint, caus… | Firewall rules not updated to allow traffic to the new CDN endpoint used by Marketplace and Patch &… | Run Test-AzsSupportKICDNFirewallAccess to detect the issue. Update firewall rules to whitelist the … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
