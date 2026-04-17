# ARM Azure Local 网络 — 排查速查

**来源数**: 14 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure Local disconnected operations portal (Project Winfield) is not accessible after infrastructur… | Incorrect IP address configuration or self-signed certificate not installed on the host's trusted r… | 1. Verify IP addresses: management endpoint (169.254.53.25) and portal endpoint (10.0.50.4) must be… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Network connectivity issues between host and Azure Local disconnected operations appliance VM | Incorrect network adapter settings or DNS server not configured correctly on the appliance VM | 1. Verify network settings on appliance VM: ensure two network adapters and their respective IP add… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Unable to verify connection to Azure Local disconnected operations Project Winfield endpoints after… | Incorrect endpoint configuration or network issues preventing access to portal.autonomous.cloud.pri… | 1. Run Invoke-WebRequest https://portal.autonomous.cloud.private/api/ping to verify endpoint connec… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Azure Local/HCI cluster RDMA performance issues - Flow Control is enabled on physical NICs, causing… | Flow Control (global pause) is enabled by default on physical NICs. When enabled, it sends global p… | Disable Flow Control on all physical NICs used for RDMA: Set-NetAdapterAdvancedProperty -Name <NIC>… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | RDMA PFC (Priority Flow Control) not working on Azure Local cluster - switches treat RDMA/SMB traff… | VLAN tags are not configured on the storage network adapters. PFC information is contained within t… | Add VLAN tags to storage NICs. For non-converged setup: set VLAN ID in Advanced Properties of the p… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Azure Local DCB/QoS settings unexpectedly changed or overwritten - RDMA configuration drift detecte… | DCBX Willing mode is set to True (default), allowing DCB settings on the host to be overwritten by … | Set DCBX Willing mode to False globally: Set-NetQosDcbxSetting -Willing $false. Verify with Get-Net… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | RDMA Completion Queue Errors counter is non-zero on Azure Local/HCI nodes, indicating errors in RDM… | Driver or firmware issue on the RDMA NIC causing errors in completion queue processing for RDMA ope… | Update NIC driver and firmware to the latest versions. Check RDMA Completion Queue Errors via PerfM… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Unable to resolve domain name portal.autonomous.cloud.private when accessing Project Winfield porta… | DNS name resolution not configured for Winfield private endpoints on client machine | Add host entries to the client hosts file (Windows: C:\Windows\system32\drivers\etc\hosts, Linux: /… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | Unable to resolve domain name for Project Winfield portal (portal.autonomous.cloud.private) - ping … | DNS is not configured to resolve the Winfield private domain names (portal.autonomous.cloud.private… | Add entries to the hosts file mapping the Winfield appliance IP to the private domain names. Window… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | Kerberos authentication fails with KDC_ERR_S_PRINCIPAL_UNKNOWN error in Azure Local/SDN environment… | Service Principal Names (SPNs) are misconfigured, missing, or duplicated - Kerberos cannot locate t… | Use 'setspn -L <account>' to list current SPNs and verify correctness. Use 'setspn -S <SPN> <accoun… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 📋 | SDN deployment or management conflicts on Azure Local when mixing management methods (on-premises t… | Two SDN management methods are mutually exclusive. Running Add-EceFeature on a cluster deployed wit… | Choose one method exclusively: (1) Add-EceFeature -> manage via Azure portal/CLI/ARM only, NSG scop… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 📋 | SDN deployment conflict when mixing management methods on Azure Local: using both Add-EceFeature (A… | Azure Local SDN has two mutually exclusive methods: SDN enabled by Azure Arc (Add-EceFeature, failo… | Use only one SDN management method per cluster. If NC deployed via Add-EceFeature, do NOT use WAC/S… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 📋 | Need to capture SDN network traces for troubleshooting virtual networking issues in Azure Local (AL… | — | Use Start-SdnNetshTrace from SdnDiagnostics module to capture traces (e.g., Start-SdnNetshTrace -Co… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 📋 | Need to capture SDN network traces for troubleshooting Azure Local SDN issues (e.g., virtual gatewa… | — | Use SdnDiagnostics module: 1) Start-SdnNetshTrace -ComputerName 'hosts' -Role:Server, 2) Reproduce … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. 1. Verify IP addresses: management endpoint (169.254.53.25) and portal endpoint… `[来源: ado-wiki]`
2. 1. Verify network settings on appliance VM: ensure two network adapters and the… `[来源: ado-wiki]`
3. 1. Run Invoke-WebRequest https://portal.autonomous.cloud.private/api/ping to ve… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/azure-local-networking.md#排查流程)
