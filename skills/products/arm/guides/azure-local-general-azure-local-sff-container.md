# ARM Azure Local 通用 azure local sff container — 排查速查

**来源数**: 15 | **21V**: 部分
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Container exits immediately after starting in Azure Local Disconnected Operations environment | Container Entry Point (CEP) script fails or exits early during initialization | Check logs under /var/log/cep.log or container stdout. Ensure CEP scripts are idempotent and resili… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Services (azshostagent, azsnode-s) not starting inside Azure Local disconnected container | Missing binaries or configuration files in the container image for CEP services | Validate paths and permissions in the CEP script. Ensure required binaries (/usr/local/bin/azshosta… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Health probes failing for container in Azure Local Disconnected Operations | CEP did not start all required background services before the container was marked as ready | Ensure all background processes (azshostagent, azsnode-s, etc.) are launched and monitored in the C… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Unable to install self-signed certificate (Winfield.cer) on client computer for connecting to Proje… | The Winfield self-signed CA certificate is not installed in the Trusted Root Certification Authorit… | Windows GUI: Right-click Winfield.cer → Install Certificate → Local Machine → Trusted Root Certific… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Unable to access Winfield portal at https://portal.autonomous.cloud.private/ - page fails to load i… | Network connectivity issues between the client and the Winfield appliance, or prerequisites (DNS re… | 1) Verify connectivity: Invoke-WebRequest https://portal.autonomous.cloud.private/api/ping. 2) Ensu… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Azure Local disconnected operations VM (IRVM01) fails to restore with error 0xC000A002 - 'Microsoft… | The IRVM01 VM's saved state has a corrupted or mismatched TPM authentication tag, causing the Hyper… | Force stop and restart the VM to bypass the corrupted saved state: Step 1: Stop-VM IRVM01 -Force. S… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Customer attempts virtual/nested deployment of Azure Local Disconnected Operations (ALDO) and encou… | Virtual deployments are not supported for Azure Local (ALDO). Only physical hardware is allowed. Mi… | Inform customer that ALDO requires physical hardware deployment only. Virtual/nested Hyper-V deploy… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Azure Local (HCI) VM Extension 'AzureEdgeDeviceManagement' fails to enable on cluster nodes with er… | The Microsoft.AzureStackHCI resource provider is not registered in the subscription, or the extensi… | Uninstall and reinstall the extension via Azure CLI: 1) az cloud set -n azure.local && az login --u… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | Azure Local (HCI) cluster node 上 VM Extension (AzureEdgeDeviceManagement) 安装失败，报错 'Failed to enable… | Microsoft.AzureStackHCI Resource Provider 未在订阅中注册，或扩展需要重新安装 | 1) 在 Azure Local cloud 上用 az CLI 登录 (az cloud set -n azure.local && az login --use-device-code); 2)… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | Azure Local SFF (Private Preview 1): Provisioning new machine fails at review+create step with erro… | Onboarding service resource name only accepts alphanumeric characters and hyphens; underscores in s… | Use only alphanumeric characters and hyphens (no underscores) in Azure Local SFF site names and clu… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 11 📋 | Azure Local SFF (Private Preview 1): Cluster creation fails at custom location creation phase with … | Kubernetes namespace name derived from the cluster instance name must comply with DNS-1123 label na… | Use only alphanumeric characters and hyphens (no underscores) in Azure Local SFF cluster instance n… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 12 📋 | Azure Local SFF (Private Preview 1): Cluster creation fails with error 'Device pool internal resour… | Service principal for Microsoft.AzureStack-CloudManagementApp must be created with specific App ID … | Create the Microsoft.AzureStack-CloudManagementApp SPN with App ID f76c49e3-2a2f-4584-ac3b-0a2ccd30… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 13 📋 | Azure Local SFF (Private Preview 2): SFF cluster 'Current State' field intermittently changes to 'F… | Known product bug (Bug 34009472) causing intermittent incorrect state reporting in the SFF cluster … | Known bug (Bug 34009472) - monitor the cluster state; if it recovers on its own the underlying oper… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 14 📋 | Azure Local SFF (Private Preview 2): Arc-connected cluster shows 'Connecting' status despite some c… | Kubernetes Arc bug (Task 33380530) - Cluster Metadata Operator behaves unexpectedly during bootup w… | Known K8s Arc bug (Task 33380530). Wait for the cluster to fully connect; if status persists, check… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 15 📋 | Azure Local SFF (Private Preview 2): Network connectivity issues on host Windows Server after enabl… | When DHCP is enabled on Windows Server host for SFF deployment, it binds to CorpExtSW network adapt… | After enabling DHCP, open the DHCP management app, right-click on your server, select 'Add/Remove B… | 🔵 6.0 — ado-wiki | [ADO Wiki] |

## 快速排查路径
1. Check logs under /var/log/cep.log or container stdout. Ensure CEP scripts are i… `[来源: ado-wiki]`
2. Validate paths and permissions in the CEP script. Ensure required binaries (/us… `[来源: ado-wiki]`
3. Ensure all background processes (azshostagent, azsnode-s, etc.) are launched an… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/azure-local-general-azure-local-sff-container.md#排查流程)
