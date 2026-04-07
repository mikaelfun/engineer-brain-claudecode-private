# ARM Azure Local 通用 azure local sff container — 综合排查指南

**条目数**: 15 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-b-sff-haas-deployment.md
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Local (HCI) VM Extension 'AzureEdgeDeviceManagement' fails to enable on c…
> 来源: ado-wiki

**根因分析**: The Microsoft.AzureStackHCI resource provider is not registered in the subscription, or the extension state is corrupted. In Winfield/disconnected environments, the portal may not support re-installation.

1. Uninstall and reinstall the extension via Azure CLI: 1) az cloud set -n azure.
2. local && az login --use-device-code; 2) az connectedmachine extension delete --extension-name AzureEdgeDeviceManagement --machine-name <node> --resource-group <rg> --yes; 3) az connectedmachine extension create with original properties (publisher: Microsoft.
3. Edge, type: DeviceManagementExtension, type-handler-version from step show).

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Local (HCI) cluster node 上 VM Extension (AzureEdgeDeviceManagement) 安装失败，…
> 来源: ado-wiki

**根因分析**: Microsoft.AzureStackHCI Resource Provider 未在订阅中注册，或扩展需要重新安装

1. 1) 在 Azure Local cloud 上用 az CLI 登录 (az cloud set -n azure.
2. local && az login --use-device-code); 2) az connectedmachine extension show 获取属性; 3) az connectedmachine extension delete 删除扩展; 4) az connectedmachine extension create 重新安装，publisher='Microsoft.
3. Edge', type='DeviceManagementExtension'.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Unable to install self-signed certificate (Winfield.cer) on client computer for…
> 来源: ado-wiki

**根因分析**: The Winfield self-signed CA certificate is not installed in the Trusted Root Certification Authorities store on the client machine, causing TLS/SSL trust failures when accessing the portal.

1. Windows GUI: Right-click Winfield.
2. cer → Install Certificate → Local Machine → Trusted Root Certification Authorities.
3. Windows PowerShell: Import-Certificate -FilePath 'C:\WinfieldClient\Winfield.
4. cer' -CertStoreLocation 'Cert:\LocalMachine\Root' -Verbose; also import to Cert:\CurrentUser\Root.
5. Linux (Ubuntu): sudo cp winfield.
6. cer /usr/local/share/ca-certificates/AzureStackCertificateAuthority.
7. crt && sudo update-ca-certificates.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Unable to access Winfield portal at https://portal.autonomous.cloud.private/ - …
> 来源: ado-wiki

**根因分析**: Network connectivity issues between the client and the Winfield appliance, or prerequisites (DNS resolution, certificate trust) not properly configured.

1. 1) Verify connectivity: Invoke-WebRequest https://portal.
2. private/api/ping.
3. 2) Ensure hosts file has correct entries for Winfield domain names.
4. 3) Ensure Winfield.
5. cer is installed in Trusted Root CA store.
6. 4) Use a modern browser (Edge recommended, IE not supported).
7. 5) Ensure Azure CLI 2.
8. 0+ is installed.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Azure Local disconnected operations VM (IRVM01) fails to restore with error 0xC…
> 来源: ado-wiki

**根因分析**: The IRVM01 VM's saved state has a corrupted or mismatched TPM authentication tag, causing the Hyper-V Virtual TPM device to fail authentication verification during VM restore from saved state.

1. Force stop and restart the VM to bypass the corrupted saved state: Step 1: Stop-VM IRVM01 -Force.
2. Step 2: Start-VM IRVM01.
3. This performs a fresh cold boot instead of restoring from the saved state, resolving the TPM authentication mismatch.
4. Found in build Winfield 6.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Customer attempts virtual/nested deployment of Azure Local Disconnected Operati…
> 来源: ado-wiki

**根因分析**: Virtual deployments are not supported for Azure Local (ALDO). Only physical hardware is allowed. Minimum requirements: 3 physical nodes, 64GB RAM/node, 24 physical CPU cores/node, 2TB SSD/NVME storage/node.

1. Inform customer that ALDO requires physical hardware deployment only.
2. Virtual/nested Hyper-V deployments are unsupported.
3. Refer to hardware requirements: 3 nodes min, 64GB RAM, 24 cores, 2TB SSD/NVME per node, 480GB boot drive.
4. Integration requires ADFS on Windows Server 2022 for OIDC, LDAP for group sync, and Active Directory for RBAC.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Container exits immediately after starting in Azure Local Disconnected Operatio…
> 来源: ado-wiki

**根因分析**: Container Entry Point (CEP) script fails or exits early during initialization

1. Check logs under /var/log/cep.
2. log or container stdout.
3. Ensure CEP scripts are idempotent and resilient to restarts.
4. Validate that all required binaries and config files exist at the expected paths.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Services (azshostagent, azsnode-s) not starting inside Azure Local disconnected…
> 来源: ado-wiki

**根因分析**: Missing binaries or configuration files in the container image for CEP services

1. Validate paths and permissions in the CEP script.
2. Ensure required binaries (/usr/local/bin/azshostagent, /usr/local/bin/azsnode-s) exist with correct permissions.
3. Check that config files (e.
4. , /etc/azs/hostagent.
5. json) are properly mounted.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Health probes failing for container in Azure Local Disconnected Operations
> 来源: ado-wiki

**根因分析**: CEP did not start all required background services before the container was marked as ready

1. Ensure all background processes (azshostagent, azsnode-s, etc.
2. ) are launched and monitored in the CEP script.
3. Use 'wait' command to keep the entrypoint alive.
4. Validate that all services are running before marking the container as healthy.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Azure Local SFF (Private Preview 1): Provisioning new machine fails at review+c…
> 来源: ado-wiki

**根因分析**: Onboarding service resource name only accepts alphanumeric characters and hyphens; underscores in site/cluster names generate invalid resource names that fail validation with a misleading already-exists error (Bug 33075639)

1. Use only alphanumeric characters and hyphens (no underscores) in Azure Local SFF site names and cluster names to avoid invalid onboarding service resource name generation.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 11: Azure Local SFF (Private Preview 1): Cluster creation fails at custom location …
> 来源: ado-wiki

**根因分析**: Kubernetes namespace name derived from the cluster instance name must comply with DNS-1123 label naming convention (alphanumeric and hyphens only); underscores are not valid (Bug 33143274)

1. Use only alphanumeric characters and hyphens (no underscores) in Azure Local SFF cluster instance names to comply with DNS-1123 naming requirements.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 12: Azure Local SFF (Private Preview 1): Cluster creation fails with error 'Device …
> 来源: ado-wiki

**根因分析**: Service principal for Microsoft.AzureStack-CloudManagementApp must be created with specific App ID (f76c49e3-2a2f-4584-ac3b-0a2ccd30cce2) via Azure CLI with tenant-level permissions; SPN was not pre-created in the environment

1. Create the Microsoft.
2. AzureStack-CloudManagementApp SPN with App ID f76c49e3-2a2f-4584-ac3b-0a2ccd30cce2 via Azure CLI (requires tenant-level permissions).
3. Note: this requirement was removed starting from Private Preview 2 (PrP 2).

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 13: Azure Local SFF (Private Preview 2): SFF cluster 'Current State' field intermit…
> 来源: ado-wiki

**根因分析**: Known product bug (Bug 34009472) causing intermittent incorrect state reporting in the SFF cluster Current State field after deployment completion

1. Known bug (Bug 34009472) - monitor the cluster state; if it recovers on its own the underlying operation may still be successful.
2. Raise ICM against Azure Local SFF engineering team if state does not recover.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 14: Azure Local SFF (Private Preview 2): Arc-connected cluster shows 'Connecting' s…
> 来源: ado-wiki

**根因分析**: Kubernetes Arc bug (Task 33380530) - Cluster Metadata Operator behaves unexpectedly during bootup when unable to connect to API Server; same issue observed in Nexus NAKS (Incident-628027194)

1. Known K8s Arc bug (Task 33380530).
2. Wait for the cluster to fully connect; if status persists, check Cluster Metadata Operator logs.
3. Engage Arc platform team via ICM if needed.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 15: Azure Local SFF (Private Preview 2): Network connectivity issues on host Window…
> 来源: ado-wiki

**根因分析**: When DHCP is enabled on Windows Server host for SFF deployment, it binds to CorpExtSW network adapter by default, causing corporate network conflicts

1. After enabling DHCP, open the DHCP management app, right-click on your server, select 'Add/Remove Bindings' > IPv4, and untick CorpExtSW to prevent DHCP from binding to the corporate external switch.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Local (HCI) VM Extension 'AzureEdgeDeviceManagement' … | The Microsoft.AzureStackHCI resource provider is not regist… | Uninstall and reinstall the extension via Azure CLI: 1) az … |
| Azure Local (HCI) cluster node 上 VM Extension (AzureEdgeDev… | Microsoft.AzureStackHCI Resource Provider 未在订阅中注册，或扩展需要重新安装 | 1) 在 Azure Local cloud 上用 az CLI 登录 (az cloud set -n azure.… |
| Unable to install self-signed certificate (Winfield.cer) on… | The Winfield self-signed CA certificate is not installed in… | Windows GUI: Right-click Winfield.cer → Install Certificate… |
| Unable to access Winfield portal at https://portal.autonomo… | Network connectivity issues between the client and the Winf… | 1) Verify connectivity: Invoke-WebRequest https://portal.au… |
| Azure Local disconnected operations VM (IRVM01) fails to re… | The IRVM01 VM's saved state has a corrupted or mismatched T… | Force stop and restart the VM to bypass the corrupted saved… |
| Customer attempts virtual/nested deployment of Azure Local … | Virtual deployments are not supported for Azure Local (ALDO… | Inform customer that ALDO requires physical hardware deploy… |
| Container exits immediately after starting in Azure Local D… | Container Entry Point (CEP) script fails or exits early dur… | Check logs under /var/log/cep.log or container stdout. Ensu… |
| Services (azshostagent, azsnode-s) not starting inside Azur… | Missing binaries or configuration files in the container im… | Validate paths and permissions in the CEP script. Ensure re… |
| Health probes failing for container in Azure Local Disconne… | CEP did not start all required background services before t… | Ensure all background processes (azshostagent, azsnode-s, e… |
| Azure Local SFF (Private Preview 1): Provisioning new machi… | Onboarding service resource name only accepts alphanumeric … | Use only alphanumeric characters and hyphens (no underscore… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Container exits immediately after starting in Azure Local Disconnected Operations environment | Container Entry Point (CEP) script fails or exits early during initialization | Check logs under /var/log/cep.log or container stdout. Ensure CEP scripts are idempotent and resili… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Services (azshostagent, azsnode-s) not starting inside Azure Local disconnected container | Missing binaries or configuration files in the container image for CEP services | Validate paths and permissions in the CEP script. Ensure required binaries (/usr/local/bin/azshosta… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Health probes failing for container in Azure Local Disconnected Operations | CEP did not start all required background services before the container was marked as ready | Ensure all background processes (azshostagent, azsnode-s, etc.) are launched and monitored in the C… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Unable to install self-signed certificate (Winfield.cer) on client computer for connecting to Proje… | The Winfield self-signed CA certificate is not installed in the Trusted Root Certification Authorit… | Windows GUI: Right-click Winfield.cer → Install Certificate → Local Machine → Trusted Root Certific… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Unable to access Winfield portal at https://portal.autonomous.cloud.private/ - page fails to load i… | Network connectivity issues between the client and the Winfield appliance, or prerequisites (DNS re… | 1) Verify connectivity: Invoke-WebRequest https://portal.autonomous.cloud.private/api/ping. 2) Ensu… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Azure Local disconnected operations VM (IRVM01) fails to restore with error 0xC000A002 - 'Microsoft… | The IRVM01 VM's saved state has a corrupted or mismatched TPM authentication tag, causing the Hyper… | Force stop and restart the VM to bypass the corrupted saved state: Step 1: Stop-VM IRVM01 -Force. S… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Customer attempts virtual/nested deployment of Azure Local Disconnected Operations (ALDO) and encou… | Virtual deployments are not supported for Azure Local (ALDO). Only physical hardware is allowed. Mi… | Inform customer that ALDO requires physical hardware deployment only. Virtual/nested Hyper-V deploy… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Azure Local (HCI) VM Extension 'AzureEdgeDeviceManagement' fails to enable on cluster nodes with er… | The Microsoft.AzureStackHCI resource provider is not registered in the subscription, or the extensi… | Uninstall and reinstall the extension via Azure CLI: 1) az cloud set -n azure.local && az login --u… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | Azure Local (HCI) cluster node 上 VM Extension (AzureEdgeDeviceManagement) 安装失败，报错 'Failed to enable… | Microsoft.AzureStackHCI Resource Provider 未在订阅中注册，或扩展需要重新安装 | 1) 在 Azure Local cloud 上用 az CLI 登录 (az cloud set -n azure.local && az login --use-device-code); 2)… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Azure Local SFF (Private Preview 1): Provisioning new machine fails at review+create step with erro… | Onboarding service resource name only accepts alphanumeric characters and hyphens; underscores in s… | Use only alphanumeric characters and hyphens (no underscores) in Azure Local SFF site names and clu… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 11 | Azure Local SFF (Private Preview 1): Cluster creation fails at custom location creation phase with … | Kubernetes namespace name derived from the cluster instance name must comply with DNS-1123 label na… | Use only alphanumeric characters and hyphens (no underscores) in Azure Local SFF cluster instance n… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 12 | Azure Local SFF (Private Preview 1): Cluster creation fails with error 'Device pool internal resour… | Service principal for Microsoft.AzureStack-CloudManagementApp must be created with specific App ID … | Create the Microsoft.AzureStack-CloudManagementApp SPN with App ID f76c49e3-2a2f-4584-ac3b-0a2ccd30… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 13 | Azure Local SFF (Private Preview 2): SFF cluster 'Current State' field intermittently changes to 'F… | Known product bug (Bug 34009472) causing intermittent incorrect state reporting in the SFF cluster … | Known bug (Bug 34009472) - monitor the cluster state; if it recovers on its own the underlying oper… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 14 | Azure Local SFF (Private Preview 2): Arc-connected cluster shows 'Connecting' status despite some c… | Kubernetes Arc bug (Task 33380530) - Cluster Metadata Operator behaves unexpectedly during bootup w… | Known K8s Arc bug (Task 33380530). Wait for the cluster to fully connect; if status persists, check… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 15 | Azure Local SFF (Private Preview 2): Network connectivity issues on host Windows Server after enabl… | When DHCP is enabled on Windows Server host for SFF deployment, it binds to CorpExtSW network adapt… | After enabling DHCP, open the DHCP management app, right-click on your server, select 'Add/Remove B… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
