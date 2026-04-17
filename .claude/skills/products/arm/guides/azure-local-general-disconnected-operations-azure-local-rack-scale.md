# ARM Azure Local 通用 disconnected operations azure local rack scale — 排查速查

**来源数**: 14 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure Local disconnected operations deployment fails with 2-node HCI cluster due to cluster quorum … | Disconnected HCI cannot use Azure blob storage as cloud witness for cluster quorum (no cloud connec… | Use a 3-node HCI cluster for disconnected operations deployment. A 3-node cluster does not require … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Azure Local disconnected operations infrastructure VM (Winfield) does not start after deployment | Insufficient resources allocated to the VM or incorrect network configuration (virtual switches not… | 1. Verify VM has recommended resources: 24 vCPUs, 48 GB RAM. 2. Check network configuration: ensure… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Unable to verify connection to Azure Local disconnected operations Project Winfield endpoints | Incorrect endpoint configuration or underlying network issues preventing connectivity to portal.aut… | 1. Run Invoke-WebRequest https://portal.autonomous.cloud.private/api/ping to test connectivity. 2. … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Cannot collect diagnostic logs from Azure Local disconnected operations - standard log collection f… | The Azure Local disconnected operations VM (IRVM01) is offline, disconnected, or failed, preventing… | Use appliance fallback logging: 1) Import-Module ApplianceFallbackLogging.psm1, 2) Copy-DiagnosticD… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Customer can export Azure Local disconnected diagnostic logs with Copy-WinfieldDiagnosticData but c… | The customer's environment cannot reach Azure for log upload, or the standalone observability pipel… | Customer provides exported logs to CSS support engineer via approved DTM File Transfer process. Sup… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Unable to install the self-signed certificate (Winfield.cer) on the client computer for Project Win… | Winfield self-signed root CA certificate not installed in the Trusted Root Certification Authoritie… | Windows GUI: Right-click Winfield.cer → Install Certificate → Local Machine → Place in Trusted Root… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Winfield portal (https://portal.autonomous.cloud.private/) fails to load in the browser after DNS a… | Network connectivity issue or service not responding on the Winfield appliance | 1. Verify connectivity: Invoke-WebRequest https://portal.autonomous.cloud.private/api/ping. 2. Ensu… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Azure Local disconnected operations IRVM01 VM fails to restore with error 0xC000A002: 'The computed… | Virtual TPM device authentication tag mismatch prevents IRVM01 from restoring from Saved state, blo… | Step 1: Stop-VM IRVM01 -Force. Step 2: Start-VM IRVM01. This should restore the IRVM to a running s… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | When creating Windows VMs on Azure Local Rack Scale via az stack-hci-vm create using the winmulti-1… | The VM image does not create an account matching the username provided via the admin-username param… | Use Administrator or azureuser as the username with the password specified via admin-password param… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | After creating Azure Local VNET subnets, they are not visible in Azure Portal and do not appear in … | Azure Portal does not currently support displaying Azure Local multi-rack VNET subnets | Use Azure CLI commands: az stack-hci-vm network vnet subnet show (if you saved creation values) or … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 📋 | Linux and Windows VMs on Azure Local Rack Scale are not provisioned with DNS servers specified in t… | DNS server configuration from LNET/VNET is not propagated to the VM during provisioning | Define DNS configuration at the NIC level before creating VMs, or manually configure the DNS server… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 📋 | Creating a Public IP resource on Azure Local Rack Scale fails when the name value contains more tha… | Bug in Public IP resource validation: name field limited to 26 lowercase characters (ADO User Story… | Use a name value containing 26 or fewer lowercase characters for Public IP resources | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 📋 | Creating NAT gateway inbound rules on Azure Local Rack Scale fails when the name value contains upp… | Bug in NAT gateway inbound rules validation: name field cannot contain uppercase characters (ADO Us… | Use only lowercase characters in the name field for NAT gateway inbound rules | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 📋 | Creating a NAT gateway with inbound rules in a single az stack-hci-vm network nat create command on… | ALRS SDN resources have dependency ordering that prevents inline inbound rules at NAT GW creation t… | Follow a 3-step process: (1) Create NAT GW without inbound rules, (2) Associate NAT GW with VNET su… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Use a 3-node HCI cluster for disconnected operations deployment. A 3-node clust… `[来源: ado-wiki]`
2. 1. Verify VM has recommended resources: 24 vCPUs, 48 GB RAM. 2. Check network c… `[来源: ado-wiki]`
3. 1. Run Invoke-WebRequest https://portal.autonomous.cloud.private/api/ping to te… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/azure-local-general-disconnected-operations-azure-local-rack-scale.md#排查流程)
