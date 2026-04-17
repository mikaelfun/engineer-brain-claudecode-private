# ARM ALDO 平台 log collection add node — 排查速查

**来源数**: 15 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Cannot collect diagnostic logs in Azure Local disconnected operations because the appliance VM is d… | Appliance VM unavailable or management endpoint unreachable, preventing standard log collection met… | Use Fallback Log Collection: manually extract logs from mounted VHDs using Copy-DiagnosticData scri… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Need to collect diagnostic logs in Azure Local disconnected operations when appliance is connected … | — | Use Direct Collection: trigger Invoke-ApplianceLogCollection from the management endpoint. This is … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Need to collect diagnostic logs in Azure Local when the appliance is disconnected from Azure but th… | Appliance disconnected from Azure, cannot use direct collection method | Use Indirect Collection: trigger Invoke-ApplianceLogCollectionAndSaveToShareFolder to save logs to … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Cannot collect diagnostic logs in Azure Local disconnected operations (ALDO) when appliance VM is d… | Standard log collection mechanisms (direct/indirect) require the appliance VM and management endpoi… | Use fallback log collection: 1) Extract logs from mounted VHDs using Copy-DiagnosticData script, 2)… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Add-Server or node addition fails in Azure Stack HCI / Azure Local due to ComponentID mismatch betw… | ComponentID mismatch between the Network ATC intent configuration and the physical adapter identifi… | Check adapter ComponentIDs via Get-NetAdapter, compare with existing cluster intent. If mismatched,… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Network ATC provisioning fails during Add-Server or Update operations with ValidateAzureStackNetwor… | Network ATC settings validation fails due to misconfigured intents, adapter mismatches, or incompat… | Validate logs for ValidateAzureStackNetworkATCSettings errors. Apply mitigation scripts to fix adap… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Storage background jobs are not auto-retried after Add Node operation in Azure Stack, requiring man… | Azure Stack background storage jobs (repair, optimization) may not automatically retry after node a… | Manually repair via PowerShell (Repair-AzsScaleUnitNode) or Admin Portal. Check storage jobs with G… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Hyper-V components (Hyper-V management tools) not installing on a random HCI node during PP2 integr… | Intermittent issue where Hyper-V tools get skipped on a random HCI node during the automated deploy… | Reinstall Hyper-V management tools on affected node via PowerShell: `$clusterAdminCred = New-Object… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | PP2 integrated ASDK deployment scripts fail or behave unexpectedly when Azure PowerShell (Az PS) mo… | Specific Az PowerShell module versions beyond 8.2.0 introduce breaking changes that conflict with t… | Use Azure PowerShell module version 8.2.0 or earlier. Do not update beyond 8.2.0 until a compatible… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | Customer needs to configure Azure Local Disconnected Operations (ALDO) VM appliance after downloadi… | — | Use the System Configuration Service (SCS), which is bound to the management vNIC. SCS handles conf… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 📋 | Running OnboardingScript.sh to connect Linux server to Winfield (Azure Local Disconnected Operation… | The certificate exported by Export-WinfieldRootCert is not compatible with Linux. The command expor… | 1) On a Windows machine with the cert installed, open certlm.msc → Trusted Root Certificate Authori… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 📋 | Invoke-AzStackHciArcInitialization bootstrap process hangs for ~45 minutes then fails on Azure Loca… | CRL (Certificate Revocation List) check in the BootstrapManagementService blocks bootstrap completi… | Run PowerShell script on all nodes PRIOR to arc initialization: 1) Find config file at C:\windows\s… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 📋 | Linux server fails to connect to Winfield (Azure Local disconnected operations) with certificate er… | Export-WinfieldRootCert exports the certificate in a format incompatible with Linux — the exported … | 1) On Windows (e.g. Hyper-V host), open certlm.msc → Trusted Root CAs → find AzureStackCertificatio… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 📋 | ALDO single-node lab menu system throws an error and exits when running 'configure physical host fo… | Known bug in the menu system's physical host configuration command. The error is cosmetic and does … | The error can be safely ignored. Restart the menu system by re-running Invoke-MenuSystem and contin… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 15 📋 | ALDO VM deployment uses different data disk scripts for ALCSS01-10 vs ALCSS17-20 environments - usi… | ALCSS01-10 environments use an updated data disk with a data stripe created in WinPE (Enable-Dynami… | For ALCSS01-10: use the Enable-Dynamic-SSD-Disks template script. For ALCSS17-20: use the original … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Use Fallback Log Collection: manually extract logs from mounted VHDs using Copy… `[来源: ado-wiki]`
2. Use Direct Collection: trigger Invoke-ApplianceLogCollection from the managemen… `[来源: ado-wiki]`
3. Use Indirect Collection: trigger Invoke-ApplianceLogCollectionAndSaveToShareFol… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/aldo-log-collection-add-node.md#排查流程)
