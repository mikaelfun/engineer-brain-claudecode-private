# ARM Azure Stack Hub AzS Support 诊断命令 vm refresh safe restart — 排查速查

**来源数**: 11 | **21V**: 部分
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure Stack Hub portal persistent disk cache corruption causing portal loading failures, UI errors,… | Corrupted persistent disk cache files on portal nodes | Run Repair-AzsSupportPortalPersistentDiskCache to delete the cache and restart IIS. Use -Portal "Te… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Azure Stack Hub ECE action plan failed and need to identify the owning engineering team or componen… | — | Use Get-AzsSupportRoutingInformation to analyze failed action plans and identify component ownershi… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Need to collect DSC (Desired State Configuration) logs from Azure Stack Hub infrastructure nodes fo… | — | Use Get-AzsSupportDscLogs -ComputerName <NodeName> to collect DSC text and event logs from the spec… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Azure Stack Hub Network Controller has leaked/orphaned ILB address mapping entries causing IP addre… | When network resources (internal load balancers) are deleted or modified, the address mapping in Ne… | Use Repair-AzsSupportLeakedAddressMapping cmdlet with -SubnetInstanceId (subnet instanceID of the i… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Azure Stack Hub: Group policy machine policy file header integrity check fails, indicating the grou… | Group policy machine store file header integrity issue; file corruption in the GP machine policy st… | Run Test-AzsSupportKIGPMachinePolicyCorruption from Azs.Support Module (CSSTools) to validate the f… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Azure Stack Hub infrastructure VM needs to be refreshed/recovered with proper safeguards and stamp … | — | Use Invoke-AzsSupportVMRefresh. Includes automated safeguards and pre-checks on stamp state before … | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 7 📋 | Azure Stack Hub infrastructure VM (e.g., XRP) needs to be safely restarted using action plans | — | Use Restart-AzsSupportComputer with safe restart action plans. Currently only supports infrastructu… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 8 📋 | Need to identify which Hyper-V host is running a specific Azure Stack Hub infrastructure VM | — | Use Get-AzsSupportInfrastructureVMHost. Filter by -Role or -VMName. Can pipe from Get-AzsSupportInf… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 9 📋 | Need to collect host and infrastructure VM performance metrics on Azure Stack Hub | — | Use Get-AzsSupportPerformanceMetrics. Internally calls Test-AzureStack -Include AzsInfraPerformance… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 10 📋 | Need a comprehensive VM report (infrastructure + tenant VMs) from Azure Stack Hub hosts | — | Use Get-AzsSupportVMReport. Returns PSCustomObject; use -OutputPath for CSV export to specified dir… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 11 📋 | Need to query specific virtual machines from Azure Stack Hub Hyper-V hosts by name, ID, state, or h… | — | Use Get-AzsSupportVirtualMachine with filters: -Name, -ID, -ComputerName, -State. Supports -AsJob f… | 🔵 6.0 — ado-wiki | [ADO Wiki] |

## 快速排查路径
1. Run Repair-AzsSupportPortalPersistentDiskCache to delete the cache and restart … `[来源: ado-wiki]`
2. Use Get-AzsSupportRoutingInformation to analyze failed action plans and identif… `[来源: ado-wiki]`
3. Use Get-AzsSupportDscLogs -ComputerName <NodeName> to collect DSC text and even… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ash-azs-cmdlets-vm-refresh-safe-restart.md#排查流程)
