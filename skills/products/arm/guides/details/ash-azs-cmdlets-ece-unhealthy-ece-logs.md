# ARM Azure Stack Hub AzS Support 诊断命令 ece unhealthy ece logs — 综合排查指南

**条目数**: 15 | **草稿融合数**: 67 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-AzsSupportComputeInfra.md, ado-wiki-a-AzsSupportCpiClusterNodeState.md, ado-wiki-a-AzsSupportGuestLogCollection.md, ado-wiki-a-AzsSupportVMConnect.md, ado-wiki-a-Clear-AzsSupportWorkingDirectory.md (+62 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Cannot retrieve Azure Stack Hub ECE cloud definition because ECE service is una…
> 来源: ado-wiki

**根因分析**: ECE service is down or in an unhealthy state, preventing normal retrieval of the cloud definition XML

1. Use Get-AzsSupportECECloudDefinitionXml -FromFile to load ECE cloud definition from a backup.
2. Default loads from SRNG backup location.
3. For custom backup: -FromFile 'C:	emp\BackupFileOfECEConfiguration.
4. Use -Force to refresh cached data.
5. Use -SaveToFile to export XML to working directory.
6. Verify ECE health first with Confirm-AzsSupportECEHealthy.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Need to locate ECE role-specific log directories on Azure Stack Hub for trouble…
> 来源: ado-wiki

1. Use Get-AzsSupportECELogDirectories -ECERole <role> to find log locations (e.
2. Multiple roles: -ECERole ACS, ADFS.
3. Without params lists all roles.
4. Combine with Get-AzsSupportECERoleDefinition -ECERole:<role> for role config, Get-AzsSupportECERoleNodes -Role:<role> for node info, and Get-AzsSupportECEComputerRole -ComputerName <name> to identify VM/node role membership.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Azure Stack Hub infrastructure VM is stuck in boot process, showing blue screen…
> 来源: ado-wiki

1. Use Get-AzsSupportInfrastructureVMScreenshot to capture Hyper-V screenshot of the VM.
2. Filter by -Role (e.
3. ACS, FabricRingServices) or -VMName (e.
4. Screenshots saved to AzsSupport working directory or custom -OutputPath.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 4: Azure Stack Hub tenant VM is unresponsive and login screenshot is needed from H…
> 来源: ado-wiki

1. Use Get-AzsSupportTenantVMScreenshot with -SubscriptionId/-ResourceGroupName/-VMName or -ResourceUri to capture tenant VM login screenshot from Hyper-V.
2. Screenshots saved to AzsSupport working directory or custom -OutputPath.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 5: Need to collect Windows event logs from remote Azure Stack Hub infrastructure V…
> 来源: ado-wiki

1. Use Get-AzsSupportWinEvent cmdlet from Azs.
2. Support module.
3. Specify -ComputerName for target VM and -FilterHashTable with hash table query to filter events by log name, level, time range etc.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Azure Stack Hub requires execution of a custom Enterprise Cloud Engine (ECE) ac…
> 来源: ado-wiki

1. Use Invoke-AzsSupportECECustomActionPlan from Azs.
2. Support module.
3. Specify -Name for bundled action plans or -FilePath for custom XML.
4. Add -WaitForResult to wait for completion.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: File lock or access denied issues on Azure Stack Hub infrastructure VM; need to…
> 来源: ado-wiki

1. Use Invoke-AzsSupportHandle to run Handle.
2. exe remotely.
3. Specify -ComputerName and optionally -FilePath.
4. Use -CustomArguments for closing handles: -c HandleID -p PID -y.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Azure Stack Hub tenant VM is hung or unresponsive; cannot be accessed via RDP a…
> 来源: ado-wiki

1. Use Invoke-AzsSupportNonMaskableInterruptToVM to inject NMI into the tenant VM forcing a crash dump.
2. Provide -SubscriptionId -ResourceGroupName -VMName or -ResourceUri.
3. Add -VMScreenshot to capture console screenshot.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Azure Stack Hub infrastructure process is consuming high CPU/memory or appears …
> 来源: ado-wiki

1. Use Invoke-AzsSupportProcDump with -ComputerName and -ProcessId (from Get-AzsSupportService).
2. Default captures full dump (-ma).
3. Use -CustomArguments for advanced: -mp PID -n 3 path.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: WMI-related issues on Azure Stack Hub infrastructure node (WMI queries timing o…
> 来源: ado-wiki

1. Use Invoke-AzsSupportWmiTracing for WMI ETL traces.
2. Specify -ComputerName and -TraceSeconds.
3. Add -IncludeProcDump for concurrent WMI process dumps with -DumpCount and -SecondsBetweenDumps.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: Azure Stack Hub infrastructure service is degraded, stuck, or unresponsive and …
> 来源: ado-wiki

1. Use Restart-AzsSupportService with -Name and -ComputerName.
2. Use -Staggered for rolling restart with -Delay (default 30s).
3. Example: Restart-AzsSupportService -Name NCHostAgent -ComputerName (Get-AzsSupportInfrastructureHost).
4. Name -Staggered.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 12: Need to review Azure Stack Hub health validation results (Test-AzureStack) to i…
> 来源: ado-wiki

1. Use Show-AzsSupportValidationSummaryReport to display latest validation results.
2. Filter with -Test (e.
3. Alerts), -Warnings, -Errors.
4. Use -Newest N for recent reports, -FilePath for specific file.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 13: Azure Stack Hub has duplicate virtual machine objects that do not align with Hy…
> 来源: ado-wiki

**根因分析**: VM objects fell out of sync with the cluster, creating duplicate entries visible in Hyper-V but invalid per clustering state

1. Use Repair-AzsSupportDuplicateVM from Azs.
2. Support Module.
3. Specify -Name with VM GUID or display name.
4. Examples: Repair-AzsSupportDuplicateVM -Name 31393e6b-ee80-4d78-8360-5dadffab0e6b; Repair-AzsSupportDuplicateVM -Name 'AzS-XRP01'.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 14: Azure Stack Hub has orphaned VM objects and stale shared resources that need cl…
> 来源: ado-wiki

**根因分析**: VM lifecycle interruption left orphaned objects and shared resources in Hyper-V without proper cleanup

1. Use Repair-AzsSupportOrphanedVM from Azs.
2. Support Module.
3. Specify target via -ID (VM GUID), -Name (VM name), or -ComputerName (Hyper-V host).
4. Removes orphaned VM objects and associated shared resources.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 15: Azure Stack Hub infrastructure VM has missing ACLs on VHDX disk paths, causing …
> 来源: ado-wiki

**根因分析**: ACL permissions on virtual hard disk (VHDX) file paths were lost or corrupted

1. Use Repair-AzsSupportVirtualMachineACL from Azs.
2. Support Module.
3. Requires -Name (VM name) and -ComputerName (Hyper-V host).
4. Example: Repair-AzsSupportVirtualMachineACL -Name 'AzS-XRP01' -ComputerName 'AzS-S1-N01'.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Cannot retrieve Azure Stack Hub ECE cloud definition becaus… | ECE service is down or in an unhealthy state, preventing no… | Use Get-AzsSupportECECloudDefinitionXml -FromFile to load E… |
| Need to locate ECE role-specific log directories on Azure S… | — | Use Get-AzsSupportECELogDirectories -ECERole <role> to find… |
| Azure Stack Hub infrastructure VM is stuck in boot process,… | — | Use Get-AzsSupportInfrastructureVMScreenshot to capture Hyp… |
| Azure Stack Hub tenant VM is unresponsive and login screens… | — | Use Get-AzsSupportTenantVMScreenshot with -SubscriptionId/-… |
| Need to collect Windows event logs from remote Azure Stack … | — | Use Get-AzsSupportWinEvent cmdlet from Azs.Support module. … |
| Azure Stack Hub requires execution of a custom Enterprise C… | — | Use Invoke-AzsSupportECECustomActionPlan from Azs.Support m… |
| File lock or access denied issues on Azure Stack Hub infras… | — | Use Invoke-AzsSupportHandle to run Handle.exe remotely. Spe… |
| Azure Stack Hub tenant VM is hung or unresponsive; cannot b… | — | Use Invoke-AzsSupportNonMaskableInterruptToVM to inject NMI… |
| Azure Stack Hub infrastructure process is consuming high CP… | — | Use Invoke-AzsSupportProcDump with -ComputerName and -Proce… |
| WMI-related issues on Azure Stack Hub infrastructure node (… | — | Use Invoke-AzsSupportWmiTracing for WMI ETL traces. Specify… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot retrieve Azure Stack Hub ECE cloud definition because ECE service is unavailable or unhealth… | ECE service is down or in an unhealthy state, preventing normal retrieval of the cloud definition X… | Use Get-AzsSupportECECloudDefinitionXml -FromFile to load ECE cloud definition from a backup. Defau… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Need to locate ECE role-specific log directories on Azure Stack Hub for troubleshooting (e.g. ACS, … | — | Use Get-AzsSupportECELogDirectories -ECERole <role> to find log locations (e.g. ACS, ADFS). Multipl… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Need to collect Windows event logs from remote Azure Stack Hub infrastructure VMs for troubleshooti… | — | Use Get-AzsSupportWinEvent cmdlet from Azs.Support module. Specify -ComputerName for target VM and … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Stack Hub requires execution of a custom Enterprise Cloud Engine (ECE) action plan for remedi… | — | Use Invoke-AzsSupportECECustomActionPlan from Azs.Support module. Specify -Name for bundled action … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | File lock or access denied issues on Azure Stack Hub infrastructure VM; need to identify which proc… | — | Use Invoke-AzsSupportHandle to run Handle.exe remotely. Specify -ComputerName and optionally -FileP… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Azure Stack Hub tenant VM is hung or unresponsive; cannot be accessed via RDP and a crash dump is n… | — | Use Invoke-AzsSupportNonMaskableInterruptToVM to inject NMI into the tenant VM forcing a crash dump… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure Stack Hub infrastructure process is consuming high CPU/memory or appears hung; need to captur… | — | Use Invoke-AzsSupportProcDump with -ComputerName and -ProcessId (from Get-AzsSupportService). Defau… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | WMI-related issues on Azure Stack Hub infrastructure node (WMI queries timing out, high WmiPrvSE CP… | — | Use Invoke-AzsSupportWmiTracing for WMI ETL traces. Specify -ComputerName and -TraceSeconds. Add -I… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | Azure Stack Hub infrastructure service is degraded, stuck, or unresponsive and requires restart acr… | — | Use Restart-AzsSupportService with -Name and -ComputerName. Use -Staggered for rolling restart with… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Need to review Azure Stack Hub health validation results (Test-AzureStack) to identify infrastructu… | — | Use Show-AzsSupportValidationSummaryReport to display latest validation results. Filter with -Test … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | Azure Stack Hub infrastructure VM is stuck in boot process, showing blue screen (BSOD), BitLocker s… | — | Use Get-AzsSupportInfrastructureVMScreenshot to capture Hyper-V screenshot of the VM. Filter by -Ro… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 12 | Azure Stack Hub tenant VM is unresponsive and login screenshot is needed from Hyper-V for diagnosis | — | Use Get-AzsSupportTenantVMScreenshot with -SubscriptionId/-ResourceGroupName/-VMName or -ResourceUr… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 13 | Azure Stack Hub has duplicate virtual machine objects that do not align with Hyper-V clustering sta… | VM objects fell out of sync with the cluster, creating duplicate entries visible in Hyper-V but inv… | Use Repair-AzsSupportDuplicateVM from Azs.Support Module. Specify -Name with VM GUID or display nam… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 14 | Azure Stack Hub has orphaned VM objects and stale shared resources that need cleanup | VM lifecycle interruption left orphaned objects and shared resources in Hyper-V without proper clea… | Use Repair-AzsSupportOrphanedVM from Azs.Support Module. Specify target via -ID (VM GUID), -Name (V… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 15 | Azure Stack Hub infrastructure VM has missing ACLs on VHDX disk paths, causing access or boot issues | ACL permissions on virtual hard disk (VHDX) file paths were lost or corrupted | Use Repair-AzsSupportVirtualMachineACL from Azs.Support Module. Requires -Name (VM name) and -Compu… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
