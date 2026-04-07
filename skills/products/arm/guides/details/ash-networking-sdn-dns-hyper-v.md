# ARM Azure Stack Hub 网络与 SDN dns hyper v — 综合排查指南

**条目数**: 4 | **草稿融合数**: 8 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-Invoke-AzsSupportSdnResourceRequest.md, ado-wiki-a-install-the-sdn-diagnostics-module.md, ado-wiki-a-sdn-enabled-by-azure-arc.md, ado-wiki-a-sdn-log-analysis.md, ado-wiki-a-sdn-managed-by-on-premise-tools.md (+3 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Orphaned DNS records on WASP DNS Server, records persist after associated resou…
> 来源: ado-wiki

**根因分析**: DNS records not cleaned up when associated resources are deleted, stale entries found by cross-referencing NRP DNS and WASP data

1. Run Test-AzsSupportKIOrphanedDNSRecords to identify orphaned records.
2. Clean up stale DNS entries from WASP DNS Server.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Stack Hub VM network adapters have duplicate MAC addresses in Hyper-V, pr…
> 来源: ado-wiki

**根因分析**: Duplicate MAC addresses assigned to VM network adapters within Hyper-V host.

1. Run Test-AzsSupportKIDuplicateMACsHypervisor from the Azs.
2. Support module.
3. Use -SkipVersionCheck if verifying on non-standard builds.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Azure Stack Hub S2S VPN connections report policy misconfiguration failure, cau…
> 来源: ado-wiki

**根因分析**: Site-to-Site VPN connection policy misconfiguration.

1. Run Test-AzsSupportKIVPNPolicyMisconfiguration from the Azs.
2. Support module to identify affected S2S VPN connections.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Deleting a load balancer in Azure Stack Hub 1907 results in orphaned resources;…
> 来源: ado-wiki

**根因分析**: Load balancer deletion did not propagate to delete the corresponding object in Network Controller (NC), leaving orphaned NC resources

1. Apply hotfix 1.
2. 54 (KB 4523826).
3. Fix ensures deleting an LB also deletes the object in NC, preventing orphaned resources.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Orphaned DNS records on WASP DNS Server, records persist af… | DNS records not cleaned up when associated resources are de… | Run Test-AzsSupportKIOrphanedDNSRecords to identify orphane… |
| Azure Stack Hub VM network adapters have duplicate MAC addr… | Duplicate MAC addresses assigned to VM network adapters wit… | Run Test-AzsSupportKIDuplicateMACsHypervisor from the Azs.S… |
| Azure Stack Hub S2S VPN connections report policy misconfig… | Site-to-Site VPN connection policy misconfiguration. | Run Test-AzsSupportKIVPNPolicyMisconfiguration from the Azs… |
| Deleting a load balancer in Azure Stack Hub 1907 results in… | Load balancer deletion did not propagate to delete the corr… | Apply hotfix 1.1907.17.54 (KB 4523826). Fix ensures deletin… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Orphaned DNS records on WASP DNS Server, records persist after associated resources were deleted on… | DNS records not cleaned up when associated resources are deleted, stale entries found by cross-refe… | Run Test-AzsSupportKIOrphanedDNSRecords to identify orphaned records. Clean up stale DNS entries fr… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Stack Hub VM network adapters have duplicate MAC addresses in Hyper-V, preventing Network Con… | Duplicate MAC addresses assigned to VM network adapters within Hyper-V host. | Run Test-AzsSupportKIDuplicateMACsHypervisor from the Azs.Support module. Use -SkipVersionCheck if … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Azure Stack Hub S2S VPN connections report policy misconfiguration failure, causing VPN tunnels to … | Site-to-Site VPN connection policy misconfiguration. | Run Test-AzsSupportKIVPNPolicyMisconfiguration from the Azs.Support module to identify affected S2S… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Deleting a load balancer in Azure Stack Hub 1907 results in orphaned resources; LB object persists … | Load balancer deletion did not propagate to delete the corresponding object in Network Controller (… | Apply hotfix 1.1907.17.54 (KB 4523826). Fix ensures deleting an LB also deletes the object in NC, p… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
