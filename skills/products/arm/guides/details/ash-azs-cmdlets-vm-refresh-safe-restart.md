# ARM Azure Stack Hub AzS Support 诊断命令 vm refresh safe restart — 综合排查指南

**条目数**: 11 | **草稿融合数**: 67 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-AzsSupportComputeInfra.md, ado-wiki-a-AzsSupportCpiClusterNodeState.md, ado-wiki-a-AzsSupportGuestLogCollection.md, ado-wiki-a-AzsSupportVMConnect.md, ado-wiki-a-Clear-AzsSupportWorkingDirectory.md (+62 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Stack Hub infrastructure VM needs to be refreshed/recovered with proper s…
> 来源: ado-wiki

1. Use Invoke-AzsSupportVMRefresh.
2. Includes automated safeguards and pre-checks on stamp state before refresh.
3. Params: -ComputerName (case-sensitive), -Role (optional, auto-detected), -Retries (default 3).
4. Example: Invoke-AzsSupportVMRefresh -ComputerName AZS-XRP01 -Role ADFS -Retries 2.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 2: Azure Stack Hub infrastructure VM (e.g., XRP) needs to be safely restarted usin…
> 来源: ado-wiki

1. Use Restart-AzsSupportComputer with safe restart action plans.
2. Currently only supports infrastructure VMs.
3. Param: -ComputerName (e.
4. , Azs-XRP01).
5. Example: Restart-AzsSupportComputer -ComputerName 'Azs-XRP01'.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 3: Need to identify which Hyper-V host is running a specific Azure Stack Hub infra…
> 来源: ado-wiki

1. Use Get-AzsSupportInfrastructureVMHost.
2. Filter by -Role or -VMName.
3. Can pipe from Get-AzsSupportInfrastructureVM.
4. Examples: Get-AzsSupportInfrastructureVMHost -VMName 'Azs-XRP01'; Get-AzsSupportInfrastructureVM -NonHighlyAvailable | Get-AzsSupportInfrastructureVMHost.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 4: Need to collect host and infrastructure VM performance metrics on Azure Stack H…
> 来源: ado-wiki

1. Use Get-AzsSupportPerformanceMetrics.
2. Internally calls Test-AzureStack -Include AzsInfraPerformance -Debug and returns all host and infrastructure VM performance metrics.
3. Example: Get-AzsSupportPerformanceMetrics.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 5: Need a comprehensive VM report (infrastructure + tenant VMs) from Azure Stack H…
> 来源: ado-wiki

1. Use Get-AzsSupportVMReport.
2. Returns PSCustomObject; use -OutputPath for CSV export to specified directory (default: AzsSupportWorkingDirectory on ERCS VM).
3. Examples: Get-AzsSupportVMReport | Format-Table; Get-AzsSupportVMReport -OutputPath 'C:\temp\'.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 6: Need to query specific virtual machines from Azure Stack Hub Hyper-V hosts by n…
> 来源: ado-wiki

1. Use Get-AzsSupportVirtualMachine with filters: -Name, -ID, -ComputerName, -State.
2. Supports -AsJob for background execution with -Wait -PassThru -ExecutionTimeout (default 900s).
3. Examples: Get-AzsSupportVirtualMachine -Name 'AzS-XRP01'; Get-AzsSupportVirtualMachine -ComputerName 'AzS-Node01'.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 7: Azure Stack Hub portal persistent disk cache corruption causing portal loading …
> 来源: ado-wiki

**根因分析**: Corrupted persistent disk cache files on portal nodes

1. Run Repair-AzsSupportPortalPersistentDiskCache to delete the cache and restart IIS.
2. Use -Portal "Tenant" or "Admin" to target a specific portal (default: both).
3. Use -CollectData to gather logs for root cause analysis.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Azure Stack Hub ECE action plan failed and need to identify the owning engineer…
> 来源: ado-wiki

1. Use Get-AzsSupportRoutingInformation to analyze failed action plans and identify component ownership.
2. Supports: -ActionPlanInstanceId <id>, -MostRecentUpdate (latest update/hotfix AP), -ActionPlanSummaryFilePath <xml-path>, -RolePath/-RoleName for direct component lookup.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Need to collect DSC (Desired State Configuration) logs from Azure Stack Hub inf…
> 来源: ado-wiki

1. Use Get-AzsSupportDscLogs -ComputerName <NodeName> to collect DSC text and event logs from the specified infrastructure node.
2. Example: Get-AzsSupportDscLogs -ComputerName "Azs-XRP01".

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Azure Stack Hub Network Controller has leaked/orphaned ILB address mapping entr…
> 来源: ado-wiki

**根因分析**: When network resources (internal load balancers) are deleted or modified, the address mapping in Network Controller may not be properly cleaned up, leaving stale entries that can cause IP conflicts

1. Use Repair-AzsSupportLeakedAddressMapping cmdlet with -SubnetInstanceId (subnet instanceID of the invalid resource) and -IpAddress (leaked IP address) parameters to remove the leaked ILB mapping from Network Controller.
2. Optionally specify -NetworkController if auto-detection is unavailable.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: Azure Stack Hub: Group policy machine policy file header integrity check fails,…
> 来源: ado-wiki

**根因分析**: Group policy machine store file header integrity issue; file corruption in the GP machine policy store on Azure Stack Hub nodes

1. Run Test-AzsSupportKIGPMachinePolicyCorruption from Azs.
2. Support Module (CSSTools) to validate the file header integrity.
3. Use -Remediate flag to trigger automated remediation steps.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Stack Hub infrastructure VM needs to be refreshed/rec… | — | Use Invoke-AzsSupportVMRefresh. Includes automated safeguar… |
| Azure Stack Hub infrastructure VM (e.g., XRP) needs to be s… | — | Use Restart-AzsSupportComputer with safe restart action pla… |
| Need to identify which Hyper-V host is running a specific A… | — | Use Get-AzsSupportInfrastructureVMHost. Filter by -Role or … |
| Need to collect host and infrastructure VM performance metr… | — | Use Get-AzsSupportPerformanceMetrics. Internally calls Test… |
| Need a comprehensive VM report (infrastructure + tenant VMs… | — | Use Get-AzsSupportVMReport. Returns PSCustomObject; use -Ou… |
| Need to query specific virtual machines from Azure Stack Hu… | — | Use Get-AzsSupportVirtualMachine with filters: -Name, -ID, … |
| Azure Stack Hub portal persistent disk cache corruption cau… | Corrupted persistent disk cache files on portal nodes | Run Repair-AzsSupportPortalPersistentDiskCache to delete th… |
| Azure Stack Hub ECE action plan failed and need to identify… | — | Use Get-AzsSupportRoutingInformation to analyze failed acti… |
| Need to collect DSC (Desired State Configuration) logs from… | — | Use Get-AzsSupportDscLogs -ComputerName <NodeName> to colle… |
| Azure Stack Hub Network Controller has leaked/orphaned ILB … | When network resources (internal load balancers) are delete… | Use Repair-AzsSupportLeakedAddressMapping cmdlet with -Subn… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Stack Hub portal persistent disk cache corruption causing portal loading failures, UI errors,… | Corrupted persistent disk cache files on portal nodes | Run Repair-AzsSupportPortalPersistentDiskCache to delete the cache and restart IIS. Use -Portal "Te… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Stack Hub ECE action plan failed and need to identify the owning engineering team or componen… | — | Use Get-AzsSupportRoutingInformation to analyze failed action plans and identify component ownershi… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Need to collect DSC (Desired State Configuration) logs from Azure Stack Hub infrastructure nodes fo… | — | Use Get-AzsSupportDscLogs -ComputerName <NodeName> to collect DSC text and event logs from the spec… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Stack Hub Network Controller has leaked/orphaned ILB address mapping entries causing IP addre… | When network resources (internal load balancers) are deleted or modified, the address mapping in Ne… | Use Repair-AzsSupportLeakedAddressMapping cmdlet with -SubnetInstanceId (subnet instanceID of the i… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Azure Stack Hub: Group policy machine policy file header integrity check fails, indicating the grou… | Group policy machine store file header integrity issue; file corruption in the GP machine policy st… | Run Test-AzsSupportKIGPMachinePolicyCorruption from Azs.Support Module (CSSTools) to validate the f… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Azure Stack Hub infrastructure VM needs to be refreshed/recovered with proper safeguards and stamp … | — | Use Invoke-AzsSupportVMRefresh. Includes automated safeguards and pre-checks on stamp state before … | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 7 | Azure Stack Hub infrastructure VM (e.g., XRP) needs to be safely restarted using action plans | — | Use Restart-AzsSupportComputer with safe restart action plans. Currently only supports infrastructu… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 8 | Need to identify which Hyper-V host is running a specific Azure Stack Hub infrastructure VM | — | Use Get-AzsSupportInfrastructureVMHost. Filter by -Role or -VMName. Can pipe from Get-AzsSupportInf… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 9 | Need to collect host and infrastructure VM performance metrics on Azure Stack Hub | — | Use Get-AzsSupportPerformanceMetrics. Internally calls Test-AzureStack -Include AzsInfraPerformance… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 10 | Need a comprehensive VM report (infrastructure + tenant VMs) from Azure Stack Hub hosts | — | Use Get-AzsSupportVMReport. Returns PSCustomObject; use -OutputPath for CSV export to specified dir… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 11 | Need to query specific virtual machines from Azure Stack Hub Hyper-V hosts by name, ID, state, or h… | — | Use Get-AzsSupportVirtualMachine with filters: -Name, -ID, -ComputerName, -State. Supports -AsJob f… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
