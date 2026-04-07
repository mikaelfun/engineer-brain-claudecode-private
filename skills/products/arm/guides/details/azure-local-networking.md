# ARM Azure Local 网络 — 综合排查指南

**条目数**: 14 | **草稿融合数**: 9 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-Invoke-AzsSupportSdnResourceRequest.md, ado-wiki-a-install-the-sdn-diagnostics-module.md, ado-wiki-a-sdn-enabled-by-azure-arc.md, ado-wiki-a-sdn-log-analysis.md, ado-wiki-a-sdn-managed-by-on-premise-tools.md (+4 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Local disconnected operations portal (Project Winfield) is not accessible…
> 来源: ado-wiki

**根因分析**: Incorrect IP address configuration or self-signed certificate not installed on the host's trusted root certificate store

1. Verify IP addresses: management endpoint (169.
2. 25) and portal endpoint (10.
3. 4) must be correctly configured.
4. Install self-signed certificate from management endpoint on host's trusted root certificate store.
5. Modify host file to add DNS records resolving Project Winfield appliance endpoints.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Network connectivity issues between host and Azure Local disconnected operation…
> 来源: ado-wiki

**根因分析**: Incorrect network adapter settings or DNS server not configured correctly on the appliance VM

1. Verify network settings on appliance VM: ensure two network adapters and their respective IP addresses are correctly configured.
2. Ensure DNS server IP is correctly set to resolve external endpoints.
3. Use Get-WinfieldApplianceSettings cmdlet to verify the applied settings.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Unable to verify connection to Azure Local disconnected operations Project Winf…
> 来源: ado-wiki

**根因分析**: Incorrect endpoint configuration or network issues preventing access to portal.autonomous.cloud.private

1. Run Invoke-WebRequest https://portal.
2. private/api/ping to verify endpoint connectivity.
3. Check network settings and ensure correct IP addresses are used.
4. Verify management endpoint is running via Get-WinfieldApplianceSettings cmdlet.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Azure Local/HCI cluster RDMA performance issues - Flow Control is enabled on ph…
> 来源: ado-wiki

**根因分析**: Flow Control (global pause) is enabled by default on physical NICs. When enabled, it sends global pause frames onto the network which pause ALL traffic types, including cluster heartbeat traffic, instead of only pausing the specific traffic class that needs throttling.

1. Disable Flow Control on all physical NICs used for RDMA: Set-NetAdapterAdvancedProperty -Name <NIC> -RegistryKeyword '*FlowControl' -RegistryValue 0.
2. Verify with Get-NetAdapterAdvancedProperty.
3. PFC (Priority Flow Control) should be used instead, enabled only on the SMB priority level.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: RDMA PFC (Priority Flow Control) not working on Azure Local cluster - switches …
> 来源: ado-wiki

**根因分析**: VLAN tags are not configured on the storage network adapters. PFC information is contained within the VLAN header, so without VLAN tags the switches cannot see PFC information and treat all traffic as best-effort.

1. Add VLAN tags to storage NICs.
2. For non-converged setup: set VLAN ID in Advanced Properties of the pNIC.
3. For converged setup: set VLAN IDs on vNICs only using Set-VMNetworkAdapterVlan -ManagementOS -VMNetworkAdapterName <name> -Access -VlanId <id>.
4. Verify with Get-VMNetworkAdapterVlan -ManagementOS or Get-VMNetworkAdapterIsolation -ManagementOS.
5. Do NOT set VLANs in both locations.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Azure Local DCB/QoS settings unexpectedly changed or overwritten - RDMA configu…
> 来源: ado-wiki

**根因分析**: DCBX Willing mode is set to True (default), allowing DCB settings on the host to be overwritten by settings advertised by another source (e.g., network switches) participating in DCB exchange.

1. Set DCBX Willing mode to False globally: Set-NetQosDcbxSetting -Willing $false.
2. Verify with Get-NetQosDcbxSetting (global) and per-interface settings.
3. If global is False, DCBX is disabled everywhere.
4. If global is True, check per-interface settings.
5. In ALDO deployments, Network ATC should handle this automatically.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: RDMA Completion Queue Errors counter is non-zero on Azure Local/HCI nodes, indi…
> 来源: ado-wiki

**根因分析**: Driver or firmware issue on the RDMA NIC causing errors in completion queue processing for RDMA operations.

1. Update NIC driver and firmware to the latest versions.
2. Check RDMA Completion Queue Errors via PerfMon counters.
3. Also verify NetworkDirect Technology registry value (*NetworkDirectTechnology) is present - some vendors didn't include it in driver INF file; updating driver/firmware resolves this.
4. Use Validate-DCB module (Install-Module Validate-DCB) to comprehensively validate RDMA/DCB configuration.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Unable to resolve domain name portal.autonomous.cloud.private when accessing Pr…
> 来源: ado-wiki

**根因分析**: DNS name resolution not configured for Winfield private endpoints on client machine

1. Add host entries to the client hosts file (Windows: C:\Windows\system32\drivers\etc\hosts, Linux: /etc/hosts) mapping the Winfield appliance IP (e.
2. 4) to portal.
3. private, login.
4. private, and graph.
5. Verify with: ping portal.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Unable to resolve domain name for Project Winfield portal (portal.autonomous.cl…
> 来源: ado-wiki

**根因分析**: DNS is not configured to resolve the Winfield private domain names (portal.autonomous.cloud.private, login.autonomous.cloud.private, graph.autonomous.cloud.private) on the client machine.

1. Add entries to the hosts file mapping the Winfield appliance IP to the private domain names.
2. Windows: edit C:\Windows\system32\drivers\etc\hosts as admin.
3. Linux: edit /etc/hosts.
4. Add lines: <WinfieldIP> portal.
5. private, <WinfieldIP> login.
6. private, <WinfieldIP> graph.
7. private (replace <WinfieldIP> with actual appliance IP, e.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Kerberos authentication fails with KDC_ERR_S_PRINCIPAL_UNKNOWN error in Azure L…
> 来源: ado-wiki

**根因分析**: Service Principal Names (SPNs) are misconfigured, missing, or duplicated - Kerberos cannot locate the service account and falls back to NTLM

1. Use 'setspn -L <account>' to list current SPNs and verify correctness.
2. Use 'setspn -S <SPN> <account>' to register missing SPNs.
3. Check for duplicates with 'setspn -X'.
4. Ensure all systems trust the same KDC and have synchronized time.
5. For SQL Server deployments, use Kerberos Configuration Manager to diagnose SPN issues.
6. Ref: https://learn.
7. com/en-us/azure/azure-local/manage/kerberos-with-spn.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: SDN deployment or management conflicts on Azure Local when mixing management me…
> 来源: ado-wiki

**根因分析**: Two SDN management methods are mutually exclusive. Running Add-EceFeature on a cluster deployed with on-premises tools (or vice versa) causes conflicts — each expects exclusive Network Controller control and programs different VM types.

1. Choose one method exclusively: (1) Add-EceFeature -> manage via Azure portal/CLI/ARM only, NSG scope = Azure Local VMs.
2. (2) On-premises tools -> manage via WAC/PowerShell/SCVMM only, NSG scope = Hyper-V/SCVMM VMs.
3. Never mix on same cluster.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 12: SDN deployment conflict when mixing management methods on Azure Local: using bo…
> 来源: ado-wiki

**根因分析**: Azure Local SDN has two mutually exclusive methods: SDN enabled by Azure Arc (Add-EceFeature, failover clustered NC) vs SDN managed by on-premises tools (WAC/SDN Express, service fabric NC). Mixing them creates conflicting Network Controller configurations.

1. Use only one SDN management method per cluster.
2. If NC deployed via Add-EceFeature, do NOT use WAC/SDN Express.
3. If NC deployed via on-premises tools, do NOT run Add-EceFeature.
4. Verify deployment method before making SDN changes.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 13: Need to capture SDN network traces for troubleshooting virtual networking issue…
> 来源: ado-wiki

1. Use Start-SdnNetshTrace from SdnDiagnostics module to capture traces (e.
2. , Start-SdnNetshTrace -ComputerName 'machine01','machine02' -Role:Server), reproduce the issue, then Stop-SdnNetshTrace.
3. Use Start-SdnDataCollection to automatically collect traces.
4. Copy to on-prem file server for analysis.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 14: Need to capture SDN network traces for troubleshooting Azure Local SDN issues (…
> 来源: ado-wiki

1. Use SdnDiagnostics module: 1) Start-SdnNetshTrace -ComputerName 'hosts' -Role:Server, 2) Reproduce the network scenario, 3) Stop-SdnNetshTrace, 4) Copy traces to on-prem file server or run Start-SdnDataCollection to auto-collect.
2. Ref: https://github.
3. com/microsoft/SdnDiagnostics/wiki/Start-SdnNetshTrace.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Local disconnected operations portal (Project Winfiel… | Incorrect IP address configuration or self-signed certifica… | 1. Verify IP addresses: management endpoint (169.254.53.25)… |
| Network connectivity issues between host and Azure Local di… | Incorrect network adapter settings or DNS server not config… | 1. Verify network settings on appliance VM: ensure two netw… |
| Unable to verify connection to Azure Local disconnected ope… | Incorrect endpoint configuration or network issues preventi… | 1. Run Invoke-WebRequest https://portal.autonomous.cloud.pr… |
| Azure Local/HCI cluster RDMA performance issues - Flow Cont… | Flow Control (global pause) is enabled by default on physic… | Disable Flow Control on all physical NICs used for RDMA: Se… |
| RDMA PFC (Priority Flow Control) not working on Azure Local… | VLAN tags are not configured on the storage network adapter… | Add VLAN tags to storage NICs. For non-converged setup: set… |
| Azure Local DCB/QoS settings unexpectedly changed or overwr… | DCBX Willing mode is set to True (default), allowing DCB se… | Set DCBX Willing mode to False globally: Set-NetQosDcbxSett… |
| RDMA Completion Queue Errors counter is non-zero on Azure L… | Driver or firmware issue on the RDMA NIC causing errors in … | Update NIC driver and firmware to the latest versions. Chec… |
| Unable to resolve domain name portal.autonomous.cloud.priva… | DNS name resolution not configured for Winfield private end… | Add host entries to the client hosts file (Windows: C:\Wind… |
| Unable to resolve domain name for Project Winfield portal (… | DNS is not configured to resolve the Winfield private domai… | Add entries to the hosts file mapping the Winfield applianc… |
| Kerberos authentication fails with KDC_ERR_S_PRINCIPAL_UNKN… | Service Principal Names (SPNs) are misconfigured, missing, … | Use 'setspn -L <account>' to list current SPNs and verify c… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Local disconnected operations portal (Project Winfield) is not accessible after infrastructur… | Incorrect IP address configuration or self-signed certificate not installed on the host's trusted r… | 1. Verify IP addresses: management endpoint (169.254.53.25) and portal endpoint (10.0.50.4) must be… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Network connectivity issues between host and Azure Local disconnected operations appliance VM | Incorrect network adapter settings or DNS server not configured correctly on the appliance VM | 1. Verify network settings on appliance VM: ensure two network adapters and their respective IP add… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Unable to verify connection to Azure Local disconnected operations Project Winfield endpoints after… | Incorrect endpoint configuration or network issues preventing access to portal.autonomous.cloud.pri… | 1. Run Invoke-WebRequest https://portal.autonomous.cloud.private/api/ping to verify endpoint connec… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Local/HCI cluster RDMA performance issues - Flow Control is enabled on physical NICs, causing… | Flow Control (global pause) is enabled by default on physical NICs. When enabled, it sends global p… | Disable Flow Control on all physical NICs used for RDMA: Set-NetAdapterAdvancedProperty -Name <NIC>… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | RDMA PFC (Priority Flow Control) not working on Azure Local cluster - switches treat RDMA/SMB traff… | VLAN tags are not configured on the storage network adapters. PFC information is contained within t… | Add VLAN tags to storage NICs. For non-converged setup: set VLAN ID in Advanced Properties of the p… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Azure Local DCB/QoS settings unexpectedly changed or overwritten - RDMA configuration drift detecte… | DCBX Willing mode is set to True (default), allowing DCB settings on the host to be overwritten by … | Set DCBX Willing mode to False globally: Set-NetQosDcbxSetting -Willing $false. Verify with Get-Net… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | RDMA Completion Queue Errors counter is non-zero on Azure Local/HCI nodes, indicating errors in RDM… | Driver or firmware issue on the RDMA NIC causing errors in completion queue processing for RDMA ope… | Update NIC driver and firmware to the latest versions. Check RDMA Completion Queue Errors via PerfM… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Unable to resolve domain name portal.autonomous.cloud.private when accessing Project Winfield porta… | DNS name resolution not configured for Winfield private endpoints on client machine | Add host entries to the client hosts file (Windows: C:\Windows\system32\drivers\etc\hosts, Linux: /… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | Unable to resolve domain name for Project Winfield portal (portal.autonomous.cloud.private) - ping … | DNS is not configured to resolve the Winfield private domain names (portal.autonomous.cloud.private… | Add entries to the hosts file mapping the Winfield appliance IP to the private domain names. Window… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Kerberos authentication fails with KDC_ERR_S_PRINCIPAL_UNKNOWN error in Azure Local/SDN environment… | Service Principal Names (SPNs) are misconfigured, missing, or duplicated - Kerberos cannot locate t… | Use 'setspn -L <account>' to list current SPNs and verify correctness. Use 'setspn -S <SPN> <accoun… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | SDN deployment or management conflicts on Azure Local when mixing management methods (on-premises t… | Two SDN management methods are mutually exclusive. Running Add-EceFeature on a cluster deployed wit… | Choose one method exclusively: (1) Add-EceFeature -> manage via Azure portal/CLI/ARM only, NSG scop… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 | SDN deployment conflict when mixing management methods on Azure Local: using both Add-EceFeature (A… | Azure Local SDN has two mutually exclusive methods: SDN enabled by Azure Arc (Add-EceFeature, failo… | Use only one SDN management method per cluster. If NC deployed via Add-EceFeature, do NOT use WAC/S… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 | Need to capture SDN network traces for troubleshooting virtual networking issues in Azure Local (AL… | — | Use Start-SdnNetshTrace from SdnDiagnostics module to capture traces (e.g., Start-SdnNetshTrace -Co… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 | Need to capture SDN network traces for troubleshooting Azure Local SDN issues (e.g., virtual gatewa… | — | Use SdnDiagnostics module: 1) Start-SdnNetshTrace -ComputerName 'hosts' -Role:Server, 2) Reproduce … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
