# ARM Azure Stack Hub AzS Support 诊断命令 ece unhealthy ece logs — 排查速查

**来源数**: 15 | **21V**: 部分
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Cannot retrieve Azure Stack Hub ECE cloud definition because ECE service is unavailable or unhealth… | ECE service is down or in an unhealthy state, preventing normal retrieval of the cloud definition X… | Use Get-AzsSupportECECloudDefinitionXml -FromFile to load ECE cloud definition from a backup. Defau… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Need to locate ECE role-specific log directories on Azure Stack Hub for troubleshooting (e.g. ACS, … | — | Use Get-AzsSupportECELogDirectories -ECERole <role> to find log locations (e.g. ACS, ADFS). Multipl… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Need to collect Windows event logs from remote Azure Stack Hub infrastructure VMs for troubleshooti… | — | Use Get-AzsSupportWinEvent cmdlet from Azs.Support module. Specify -ComputerName for target VM and … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Azure Stack Hub requires execution of a custom Enterprise Cloud Engine (ECE) action plan for remedi… | — | Use Invoke-AzsSupportECECustomActionPlan from Azs.Support module. Specify -Name for bundled action … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | File lock or access denied issues on Azure Stack Hub infrastructure VM; need to identify which proc… | — | Use Invoke-AzsSupportHandle to run Handle.exe remotely. Specify -ComputerName and optionally -FileP… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Azure Stack Hub tenant VM is hung or unresponsive; cannot be accessed via RDP and a crash dump is n… | — | Use Invoke-AzsSupportNonMaskableInterruptToVM to inject NMI into the tenant VM forcing a crash dump… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Azure Stack Hub infrastructure process is consuming high CPU/memory or appears hung; need to captur… | — | Use Invoke-AzsSupportProcDump with -ComputerName and -ProcessId (from Get-AzsSupportService). Defau… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | WMI-related issues on Azure Stack Hub infrastructure node (WMI queries timing out, high WmiPrvSE CP… | — | Use Invoke-AzsSupportWmiTracing for WMI ETL traces. Specify -ComputerName and -TraceSeconds. Add -I… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | Azure Stack Hub infrastructure service is degraded, stuck, or unresponsive and requires restart acr… | — | Use Restart-AzsSupportService with -Name and -ComputerName. Use -Staggered for rolling restart with… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | Need to review Azure Stack Hub health validation results (Test-AzureStack) to identify infrastructu… | — | Use Show-AzsSupportValidationSummaryReport to display latest validation results. Filter with -Test … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 📋 | Azure Stack Hub infrastructure VM is stuck in boot process, showing blue screen (BSOD), BitLocker s… | — | Use Get-AzsSupportInfrastructureVMScreenshot to capture Hyper-V screenshot of the VM. Filter by -Ro… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 12 📋 | Azure Stack Hub tenant VM is unresponsive and login screenshot is needed from Hyper-V for diagnosis | — | Use Get-AzsSupportTenantVMScreenshot with -SubscriptionId/-ResourceGroupName/-VMName or -ResourceUr… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 13 📋 | Azure Stack Hub has duplicate virtual machine objects that do not align with Hyper-V clustering sta… | VM objects fell out of sync with the cluster, creating duplicate entries visible in Hyper-V but inv… | Use Repair-AzsSupportDuplicateVM from Azs.Support Module. Specify -Name with VM GUID or display nam… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 14 📋 | Azure Stack Hub has orphaned VM objects and stale shared resources that need cleanup | VM lifecycle interruption left orphaned objects and shared resources in Hyper-V without proper clea… | Use Repair-AzsSupportOrphanedVM from Azs.Support Module. Specify target via -ID (VM GUID), -Name (V… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 15 📋 | Azure Stack Hub infrastructure VM has missing ACLs on VHDX disk paths, causing access or boot issues | ACL permissions on virtual hard disk (VHDX) file paths were lost or corrupted | Use Repair-AzsSupportVirtualMachineACL from Azs.Support Module. Requires -Name (VM name) and -Compu… | 🔵 6.0 — ado-wiki | [ADO Wiki] |

## 快速排查路径
1. Use Get-AzsSupportECECloudDefinitionXml -FromFile to load ECE cloud definition … `[来源: ado-wiki]`
2. Use Get-AzsSupportECELogDirectories -ECERole <role> to find log locations (e.g.… `[来源: ado-wiki]`
3. Use Get-AzsSupportWinEvent cmdlet from Azs.Support module. Specify -ComputerNam… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ash-azs-cmdlets-ece-unhealthy-ece-logs.md#排查流程)
