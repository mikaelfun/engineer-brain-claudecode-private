# ARM Azure Local 通用 disconnected operations azure local rack scale — 综合排查指南

**条目数**: 14 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-b-sff-haas-deployment.md
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Local disconnected operations deployment fails with 2-node HCI cluster du…
> 来源: ado-wiki

**根因分析**: Disconnected HCI cannot use Azure blob storage as cloud witness for cluster quorum (no cloud connectivity). 2-node HCI clusters require a cloud witness, which is unavailable in disconnected mode.

1. Use a 3-node HCI cluster for disconnected operations deployment.
2. A 3-node cluster does not require an external witness for quorum.
3. Future support for local file-share witness (enabling 2-node deployment) has been requested to the HCI team but is not yet available.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Local disconnected operations infrastructure VM (Winfield) does not start…
> 来源: ado-wiki

**根因分析**: Insufficient resources allocated to the VM or incorrect network configuration (virtual switches not set up correctly)

1. Verify VM has recommended resources: 24 vCPUs, 48 GB RAM.
2. Check network configuration: ensure internal virtual switches (Winfield-Ingress and Winfield-Management) are correctly set up.
3. Verify NAT rule is correctly configured to allow traffic to the appliance VM.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Unable to verify connection to Azure Local disconnected operations Project Winf…
> 来源: ado-wiki

**根因分析**: Incorrect endpoint configuration or underlying network issues preventing connectivity to portal.autonomous.cloud.private

1. Run Invoke-WebRequest https://portal.
2. private/api/ping to test connectivity.
3. Check network settings and verify correct IP addresses are used.
4. Verify management endpoint is running using Get-WinfieldApplianceSettings cmdlet.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Cannot collect diagnostic logs from Azure Local disconnected operations - stand…
> 来源: ado-wiki

**根因分析**: The Azure Local disconnected operations VM (IRVM01) is offline, disconnected, or failed, preventing standard log collection from being initiated through normal channels.

1. Use appliance fallback logging: 1) Import-Module ApplianceFallbackLogging.
2. psm1, 2) Copy-DiagnosticData -DiagnosticLogPath <path> to mount VHDs and copy logs (requires BitLocker recovery keys), 3) Send-DiagnosticData with Azure credentials to upload logs to Microsoft.
3. The IRVM is automatically restarted after Copy-DiagnosticData completes.
4. Applies to Azure Local 2411.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Customer can export Azure Local disconnected diagnostic logs with Copy-Winfield…
> 来源: ado-wiki

**根因分析**: The customer's environment cannot reach Azure for log upload, or the standalone observability pipeline fails to Arc-enable the host for upload. The customer has logs exported locally but no path to send them to Microsoft.

1. Customer provides exported logs to CSS support engineer via approved DTM File Transfer process.
2. Support engineer then runs Send-WinfieldDiagnosticData on behalf of the customer to upload logs to Kusto/Geneva workspace.
3. Important: Support engineers should NOT run this on their primary work device as it Arc-enables the host machine.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Unable to install the self-signed certificate (Winfield.cer) on the client comp…
> 来源: ado-wiki

**根因分析**: Winfield self-signed root CA certificate not installed in the Trusted Root Certification Authorities store

1. Windows GUI: Right-click Winfield.
2. cer → Install Certificate → Local Machine → Place in Trusted Root Certification Authorities.
3. Windows PowerShell: Import-Certificate -FilePath 'C:\WinfieldClient\Winfield.
4. cer' -CertStoreLocation 'Cert:\LocalMachine\Root' -Verbose.
5. Linux (Ubuntu): sudo cp ~/WinfieldClient/winfield.
6. cer /usr/local/share/ca-certificates/AzureStackCertificateAuthority.
7. crt && sudo update-ca-certificates.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Winfield portal (https://portal.autonomous.cloud.private/) fails to load in the…
> 来源: ado-wiki

**根因分析**: Network connectivity issue or service not responding on the Winfield appliance

1. Verify connectivity: Invoke-WebRequest https://portal.
2. private/api/ping.
3. Ensure using a modern browser (Edge/Chrome, not IE).
4. Log in with provided credentials.
5. Ensure Azure CLI v2.
6. 0+ is installed.
7. Verify Winfield supporting files (Winfield.
8. cer, cloudConfig.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Azure Local disconnected operations IRVM01 VM fails to restore with error 0xC00…
> 来源: ado-wiki

**根因分析**: Virtual TPM device authentication tag mismatch prevents IRVM01 from restoring from Saved state, blocking ASZWorker deployment with Winfield

1. Step 1: Stop-VM IRVM01 -Force.
2. Step 2: Start-VM IRVM01.
3. This should restore the IRVM to a running state.
4. Diagnose by checking: Get-VM IRVM01 on any seed node.
5. If state is 'Saved' and Start-VM fails with 0xC000A002, apply this mitigation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: When creating Windows VMs on Azure Local Rack Scale via az stack-hci-vm create …
> 来源: ado-wiki

**根因分析**: The VM image does not create an account matching the username provided via the admin-username parameter

1. Use Administrator or azureuser as the username with the password specified via admin-password parameter at creation time.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: After creating Azure Local VNET subnets, they are not visible in Azure Portal a…
> 来源: ado-wiki

**根因分析**: Azure Portal does not currently support displaying Azure Local multi-rack VNET subnets

1. Use Azure CLI commands: az stack-hci-vm network vnet subnet show (if you saved creation values) or az stack-hci-vm network vnet subnet list to query subnets.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: Linux and Windows VMs on Azure Local Rack Scale are not provisioned with DNS se…
> 来源: ado-wiki

**根因分析**: DNS server configuration from LNET/VNET is not propagated to the VM during provisioning

1. Define DNS configuration at the NIC level before creating VMs, or manually configure the DNS server within the VMs after creation per the OS documentation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 12: Creating a Public IP resource on Azure Local Rack Scale fails when the name val…
> 来源: ado-wiki

**根因分析**: Bug in Public IP resource validation: name field limited to 26 lowercase characters (ADO User Story 2539598)

1. Use a name value containing 26 or fewer lowercase characters for Public IP resources.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 13: Creating NAT gateway inbound rules on Azure Local Rack Scale fails when the nam…
> 来源: ado-wiki

**根因分析**: Bug in NAT gateway inbound rules validation: name field cannot contain uppercase characters (ADO User Story 2539469)

1. Use only lowercase characters in the name field for NAT gateway inbound rules.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 14: Creating a NAT gateway with inbound rules in a single az stack-hci-vm network n…
> 来源: ado-wiki

**根因分析**: ALRS SDN resources have dependency ordering that prevents inline inbound rules at NAT GW creation time

1. Follow a 3-step process: (1) Create NAT GW without inbound rules, (2) Associate NAT GW with VNET subnet containing the target NIC resources, (3) Update NAT GW using same create command but now including inbound rules.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Local disconnected operations deployment fails with 2… | Disconnected HCI cannot use Azure blob storage as cloud wit… | Use a 3-node HCI cluster for disconnected operations deploy… |
| Azure Local disconnected operations infrastructure VM (Winf… | Insufficient resources allocated to the VM or incorrect net… | 1. Verify VM has recommended resources: 24 vCPUs, 48 GB RAM… |
| Unable to verify connection to Azure Local disconnected ope… | Incorrect endpoint configuration or underlying network issu… | 1. Run Invoke-WebRequest https://portal.autonomous.cloud.pr… |
| Cannot collect diagnostic logs from Azure Local disconnecte… | The Azure Local disconnected operations VM (IRVM01) is offl… | Use appliance fallback logging: 1) Import-Module ApplianceF… |
| Customer can export Azure Local disconnected diagnostic log… | The customer's environment cannot reach Azure for log uploa… | Customer provides exported logs to CSS support engineer via… |
| Unable to install the self-signed certificate (Winfield.cer… | Winfield self-signed root CA certificate not installed in t… | Windows GUI: Right-click Winfield.cer → Install Certificate… |
| Winfield portal (https://portal.autonomous.cloud.private/) … | Network connectivity issue or service not responding on the… | 1. Verify connectivity: Invoke-WebRequest https://portal.au… |
| Azure Local disconnected operations IRVM01 VM fails to rest… | Virtual TPM device authentication tag mismatch prevents IRV… | Step 1: Stop-VM IRVM01 -Force. Step 2: Start-VM IRVM01. Thi… |
| When creating Windows VMs on Azure Local Rack Scale via az … | The VM image does not create an account matching the userna… | Use Administrator or azureuser as the username with the pas… |
| After creating Azure Local VNET subnets, they are not visib… | Azure Portal does not currently support displaying Azure Lo… | Use Azure CLI commands: az stack-hci-vm network vnet subnet… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Local disconnected operations deployment fails with 2-node HCI cluster due to cluster quorum … | Disconnected HCI cannot use Azure blob storage as cloud witness for cluster quorum (no cloud connec… | Use a 3-node HCI cluster for disconnected operations deployment. A 3-node cluster does not require … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Local disconnected operations infrastructure VM (Winfield) does not start after deployment | Insufficient resources allocated to the VM or incorrect network configuration (virtual switches not… | 1. Verify VM has recommended resources: 24 vCPUs, 48 GB RAM. 2. Check network configuration: ensure… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Unable to verify connection to Azure Local disconnected operations Project Winfield endpoints | Incorrect endpoint configuration or underlying network issues preventing connectivity to portal.aut… | 1. Run Invoke-WebRequest https://portal.autonomous.cloud.private/api/ping to test connectivity. 2. … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Cannot collect diagnostic logs from Azure Local disconnected operations - standard log collection f… | The Azure Local disconnected operations VM (IRVM01) is offline, disconnected, or failed, preventing… | Use appliance fallback logging: 1) Import-Module ApplianceFallbackLogging.psm1, 2) Copy-DiagnosticD… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Customer can export Azure Local disconnected diagnostic logs with Copy-WinfieldDiagnosticData but c… | The customer's environment cannot reach Azure for log upload, or the standalone observability pipel… | Customer provides exported logs to CSS support engineer via approved DTM File Transfer process. Sup… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Unable to install the self-signed certificate (Winfield.cer) on the client computer for Project Win… | Winfield self-signed root CA certificate not installed in the Trusted Root Certification Authoritie… | Windows GUI: Right-click Winfield.cer → Install Certificate → Local Machine → Place in Trusted Root… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Winfield portal (https://portal.autonomous.cloud.private/) fails to load in the browser after DNS a… | Network connectivity issue or service not responding on the Winfield appliance | 1. Verify connectivity: Invoke-WebRequest https://portal.autonomous.cloud.private/api/ping. 2. Ensu… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Azure Local disconnected operations IRVM01 VM fails to restore with error 0xC000A002: 'The computed… | Virtual TPM device authentication tag mismatch prevents IRVM01 from restoring from Saved state, blo… | Step 1: Stop-VM IRVM01 -Force. Step 2: Start-VM IRVM01. This should restore the IRVM to a running s… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | When creating Windows VMs on Azure Local Rack Scale via az stack-hci-vm create using the winmulti-1… | The VM image does not create an account matching the username provided via the admin-username param… | Use Administrator or azureuser as the username with the password specified via admin-password param… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | After creating Azure Local VNET subnets, they are not visible in Azure Portal and do not appear in … | Azure Portal does not currently support displaying Azure Local multi-rack VNET subnets | Use Azure CLI commands: az stack-hci-vm network vnet subnet show (if you saved creation values) or … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | Linux and Windows VMs on Azure Local Rack Scale are not provisioned with DNS servers specified in t… | DNS server configuration from LNET/VNET is not propagated to the VM during provisioning | Define DNS configuration at the NIC level before creating VMs, or manually configure the DNS server… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 | Creating a Public IP resource on Azure Local Rack Scale fails when the name value contains more tha… | Bug in Public IP resource validation: name field limited to 26 lowercase characters (ADO User Story… | Use a name value containing 26 or fewer lowercase characters for Public IP resources | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 | Creating NAT gateway inbound rules on Azure Local Rack Scale fails when the name value contains upp… | Bug in NAT gateway inbound rules validation: name field cannot contain uppercase characters (ADO Us… | Use only lowercase characters in the name field for NAT gateway inbound rules | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 | Creating a NAT gateway with inbound rules in a single az stack-hci-vm network nat create command on… | ALRS SDN resources have dependency ordering that prevents inline inbound rules at NAT GW creation t… | Follow a 3-step process: (1) Create NAT GW without inbound rules, (2) Associate NAT GW with VNET su… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
