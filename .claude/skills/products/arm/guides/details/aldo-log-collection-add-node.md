# ARM ALDO 平台 log collection add node — 综合排查指南

**条目数**: 15 | **草稿融合数**: 32 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-aldo-appliance-deployment-investigation.md, ado-wiki-a-aldo-arca-observability-access.md, ado-wiki-a-aldo-asc-azure-support-center.md, ado-wiki-a-aldo-billing-and-usage.md, ado-wiki-a-aldo-certificates-pki.md (+27 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Hyper-V components (Hyper-V management tools) not installing on a random HCI no…
> 来源: ado-wiki

**根因分析**: Intermittent issue where Hyper-V tools get skipped on a random HCI node during the automated deployment script execution. Root cause not fully determined (extra logging added to investigate).

1. Reinstall Hyper-V management tools on affected node via PowerShell: `$clusterAdminCred = New-Object -Type System.
2. PSCredential "winfield\$($ClDomainUser)", $NodeCredential.
3. Password; $x = (1.
4. $HciNodeCount); foreach($y in $x) { Invoke-Command -VMName "HCI-N$($y)" -Credential $clusterAdminCred -ScriptBlock { Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Verbose }}`.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: PP2 integrated ASDK deployment scripts fail or behave unexpectedly when Azure P…
> 来源: ado-wiki

**根因分析**: Specific Az PowerShell module versions beyond 8.2.0 introduce breaking changes that conflict with the deployment scripts. Exact breaking version not documented.

1. Use Azure PowerShell module version 8.
2. 0 or earlier.
3. Do not update beyond 8.
4. 0 until a compatible version is identified.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Customer needs to configure Azure Local Disconnected Operations (ALDO) VM appli…
> 来源: ado-wiki

1. Use the System Configuration Service (SCS), which is bound to the management vNIC.
2. SCS handles configuration of: (1) IP settings of the ingress NIC, (2) DNS forwarder, (3) Azure subscription for connecting the machine to Arc and log upload.
3. Access SCS through the management NIC API endpoint.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Running OnboardingScript.sh to connect Linux server to Winfield (Azure Local Di…
> 来源: ado-wiki

**根因分析**: The certificate exported by Export-WinfieldRootCert is not compatible with Linux. The command exports additional data that Linux does not accept (file contains more than one certificate). Bug raised with PG.

1. 1) On a Windows machine with the cert installed, open certlm.
2. msc → Trusted Root Certificate Authorities → Certificates.
3. 2) Right-click the AzureStackCertificationAuthority cert → All Tasks → Export → select 'Base-64 encoded X.
4. CER)' format → save as Winfieldbase64.
5. 3) Copy Winfieldbase64.
6. cer to Linux VM (e.
7. via WinSCP).
8. 4) Run: sudo cp Winfieldbase64.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Invoke-AzStackHciArcInitialization bootstrap process hangs for ~45 minutes then…
> 来源: ado-wiki

**根因分析**: CRL (Certificate Revocation List) check in the BootstrapManagementService blocks bootstrap completion on build 2602.2.25259.

1. Run PowerShell script on all nodes PRIOR to arc initialization: 1) Find config file at C:\windows\system32\bootstrap\content_*\Microsoft.
2. ManagementService\windows.
3. 2) Set ManagementSettings.
4. CheckCertificateRevocationList = $false.
5. 3) Stop-Service BootstrapManagementService.
6. 4) Save modified config.
7. 5) Start-Service BootstrapManagementService and wait 60s.
8. Full script available in ADO wiki Known Issues #181444.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Linux server fails to connect to Winfield (Azure Local disconnected operations)…
> 来源: ado-wiki

**根因分析**: Export-WinfieldRootCert exports the certificate in a format incompatible with Linux — the exported file contains additional data (multiple certificates) that Linux does not accept. The cert must be re-exported as Base-64 encoded X.509 format.

1. 1) On Windows (e.
2. Hyper-V host), open certlm.
3. msc → Trusted Root CAs → find AzureStackCertificationAuthority cert.
4. 2) Right-click → Export → select 'Base-64 encoded X.
5. CER)' format → save as Winfieldbase64.
6. 3) Copy to Linux VM.
7. 4) Run: sudo cp Winfieldbase64.
8. cer /usr/local/share/ca-certificates/Winfieldbase64.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: ALDO single-node lab menu system throws an error and exits when running 'config…
> 来源: ado-wiki

**根因分析**: Known bug in the menu system's physical host configuration command. The error is cosmetic and does not affect deployment.

1. The error can be safely ignored.
2. Restart the menu system by re-running Invoke-MenuSystem and continue with the DC and node deployment steps.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: ALDO VM deployment uses different data disk scripts for ALCSS01-10 vs ALCSS17-2…
> 来源: ado-wiki

**根因分析**: ALCSS01-10 environments use an updated data disk with a data stripe created in WinPE (Enable-Dynamic-SSD-Disks), while ALCSS17-20 (original ASZCSS10A-D nodes) use the legacy Create-Data-Disk script.

1. For ALCSS01-10: use the Enable-Dynamic-SSD-Disks template script.
2. For ALCSS17-20: use the original Create-Data-Disk template script.
3. Check the physical node name prefix to determine the correct script.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Add-Server or node addition fails in Azure Stack HCI / Azure Local due to Compo…
> 来源: ado-wiki

**根因分析**: ComponentID mismatch between the Network ATC intent configuration and the physical adapter identifiers on the new node, causing validation failures during Add-Server

1. Check adapter ComponentIDs via Get-NetAdapter, compare with existing cluster intent.
2. If mismatched, update the intent or adapter configuration.
3. Check ValidateAzureStackNetworkATCSettings logs for specific errors.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Network ATC provisioning fails during Add-Server or Update operations with Vali…
> 来源: ado-wiki

**根因分析**: Network ATC settings validation fails due to misconfigured intents, adapter mismatches, or incompatible network configuration on the new node

1. Validate logs for ValidateAzureStackNetworkATCSettings errors.
2. Apply mitigation scripts to fix adapter-intent alignment.
3. Ensure the new node network configuration matches the cluster baseline.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: Storage background jobs are not auto-retried after Add Node operation in Azure …
> 来源: ado-wiki

**根因分析**: Azure Stack background storage jobs (repair, optimization) may not automatically retry after node addition, leaving storage in inconsistent state

1. Manually repair via PowerShell (Repair-AzsScaleUnitNode) or Admin Portal.
2. Check storage jobs with Get-StorageJob.
3. Use Get-AzureStackLog to collect ECE, FabricRingServices, PXE, SeedRingServices, Storage, StorageController logs for diagnosis.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 12: Cannot collect diagnostic logs in Azure Local disconnected operations because t…
> 来源: ado-wiki

**根因分析**: Appliance VM unavailable or management endpoint unreachable, preventing standard log collection methods

1. Use Fallback Log Collection: manually extract logs from mounted VHDs using Copy-DiagnosticData script, then send to Microsoft using Send-DiagnosticData script.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 13: Need to collect diagnostic logs in Azure Local disconnected operations when app…
> 来源: ado-wiki

1. Use Direct Collection: trigger Invoke-ApplianceLogCollection from the management endpoint.
2. This is the simplest method when the appliance has Azure connectivity.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 14: Need to collect diagnostic logs in Azure Local when the appliance is disconnect…
> 来源: ado-wiki

**根因分析**: Appliance disconnected from Azure, cannot use direct collection method

1. Use Indirect Collection: trigger Invoke-ApplianceLogCollectionAndSaveToShareFolder to save logs to a local share, then use Send-DiagnosticData to transmit logs to Microsoft when connectivity is available.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 15: Cannot collect diagnostic logs in Azure Local disconnected operations (ALDO) wh…
> 来源: ado-wiki

**根因分析**: Standard log collection mechanisms (direct/indirect) require the appliance VM and management endpoint to be operational; when both are unavailable, no built-in collection path exists

1. Use fallback log collection: 1) Extract logs from mounted VHDs using Copy-DiagnosticData script, 2) Send extracted logs to Microsoft via Send-DiagnosticData script.
2. Ref: https://learn.
3. com/en-us/azure/azure-local/manage/disconnected-operations-fallback.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Hyper-V components (Hyper-V management tools) not installin… | Intermittent issue where Hyper-V tools get skipped on a ran… | Reinstall Hyper-V management tools on affected node via Pow… |
| PP2 integrated ASDK deployment scripts fail or behave unexp… | Specific Az PowerShell module versions beyond 8.2.0 introdu… | Use Azure PowerShell module version 8.2.0 or earlier. Do no… |
| Customer needs to configure Azure Local Disconnected Operat… | — | Use the System Configuration Service (SCS), which is bound … |
| Running OnboardingScript.sh to connect Linux server to Winf… | The certificate exported by Export-WinfieldRootCert is not … | 1) On a Windows machine with the cert installed, open certl… |
| Invoke-AzStackHciArcInitialization bootstrap process hangs … | CRL (Certificate Revocation List) check in the BootstrapMan… | Run PowerShell script on all nodes PRIOR to arc initializat… |
| Linux server fails to connect to Winfield (Azure Local disc… | Export-WinfieldRootCert exports the certificate in a format… | 1) On Windows (e.g. Hyper-V host), open certlm.msc → Truste… |
| ALDO single-node lab menu system throws an error and exits … | Known bug in the menu system's physical host configuration … | The error can be safely ignored. Restart the menu system by… |
| ALDO VM deployment uses different data disk scripts for ALC… | ALCSS01-10 environments use an updated data disk with a dat… | For ALCSS01-10: use the Enable-Dynamic-SSD-Disks template s… |
| Add-Server or node addition fails in Azure Stack HCI / Azur… | ComponentID mismatch between the Network ATC intent configu… | Check adapter ComponentIDs via Get-NetAdapter, compare with… |
| Network ATC provisioning fails during Add-Server or Update … | Network ATC settings validation fails due to misconfigured … | Validate logs for ValidateAzureStackNetworkATCSettings erro… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot collect diagnostic logs in Azure Local disconnected operations because the appliance VM is d… | Appliance VM unavailable or management endpoint unreachable, preventing standard log collection met… | Use Fallback Log Collection: manually extract logs from mounted VHDs using Copy-DiagnosticData scri… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Need to collect diagnostic logs in Azure Local disconnected operations when appliance is connected … | — | Use Direct Collection: trigger Invoke-ApplianceLogCollection from the management endpoint. This is … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Need to collect diagnostic logs in Azure Local when the appliance is disconnected from Azure but th… | Appliance disconnected from Azure, cannot use direct collection method | Use Indirect Collection: trigger Invoke-ApplianceLogCollectionAndSaveToShareFolder to save logs to … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Cannot collect diagnostic logs in Azure Local disconnected operations (ALDO) when appliance VM is d… | Standard log collection mechanisms (direct/indirect) require the appliance VM and management endpoi… | Use fallback log collection: 1) Extract logs from mounted VHDs using Copy-DiagnosticData script, 2)… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Add-Server or node addition fails in Azure Stack HCI / Azure Local due to ComponentID mismatch betw… | ComponentID mismatch between the Network ATC intent configuration and the physical adapter identifi… | Check adapter ComponentIDs via Get-NetAdapter, compare with existing cluster intent. If mismatched,… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Network ATC provisioning fails during Add-Server or Update operations with ValidateAzureStackNetwor… | Network ATC settings validation fails due to misconfigured intents, adapter mismatches, or incompat… | Validate logs for ValidateAzureStackNetworkATCSettings errors. Apply mitigation scripts to fix adap… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Storage background jobs are not auto-retried after Add Node operation in Azure Stack, requiring man… | Azure Stack background storage jobs (repair, optimization) may not automatically retry after node a… | Manually repair via PowerShell (Repair-AzsScaleUnitNode) or Admin Portal. Check storage jobs with G… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Hyper-V components (Hyper-V management tools) not installing on a random HCI node during PP2 integr… | Intermittent issue where Hyper-V tools get skipped on a random HCI node during the automated deploy… | Reinstall Hyper-V management tools on affected node via PowerShell: `$clusterAdminCred = New-Object… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | PP2 integrated ASDK deployment scripts fail or behave unexpectedly when Azure PowerShell (Az PS) mo… | Specific Az PowerShell module versions beyond 8.2.0 introduce breaking changes that conflict with t… | Use Azure PowerShell module version 8.2.0 or earlier. Do not update beyond 8.2.0 until a compatible… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Customer needs to configure Azure Local Disconnected Operations (ALDO) VM appliance after downloadi… | — | Use the System Configuration Service (SCS), which is bound to the management vNIC. SCS handles conf… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | Running OnboardingScript.sh to connect Linux server to Winfield (Azure Local Disconnected Operation… | The certificate exported by Export-WinfieldRootCert is not compatible with Linux. The command expor… | 1) On a Windows machine with the cert installed, open certlm.msc → Trusted Root Certificate Authori… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 | Invoke-AzStackHciArcInitialization bootstrap process hangs for ~45 minutes then fails on Azure Loca… | CRL (Certificate Revocation List) check in the BootstrapManagementService blocks bootstrap completi… | Run PowerShell script on all nodes PRIOR to arc initialization: 1) Find config file at C:\windows\s… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 | Linux server fails to connect to Winfield (Azure Local disconnected operations) with certificate er… | Export-WinfieldRootCert exports the certificate in a format incompatible with Linux — the exported … | 1) On Windows (e.g. Hyper-V host), open certlm.msc → Trusted Root CAs → find AzureStackCertificatio… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 | ALDO single-node lab menu system throws an error and exits when running 'configure physical host fo… | Known bug in the menu system's physical host configuration command. The error is cosmetic and does … | The error can be safely ignored. Restart the menu system by re-running Invoke-MenuSystem and contin… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 15 | ALDO VM deployment uses different data disk scripts for ALCSS01-10 vs ALCSS17-20 environments - usi… | ALCSS01-10 environments use an updated data disk with a data stripe created in WinPE (Enable-Dynami… | For ALCSS01-10: use the Enable-Dynamic-SSD-Disks template script. For ALCSS17-20: use the original … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
