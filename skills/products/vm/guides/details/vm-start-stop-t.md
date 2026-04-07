# VM Vm Start Stop T — 综合排查指南

**条目数**: 22 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-f-startbuild-fail-avdimage-languagepack.md](../../guides/drafts/ado-wiki-f-startbuild-fail-avdimage-languagepack.md), [mslearn-start-vm-last-known-good.md](../../guides/drafts/mslearn-start-vm-last-known-good.md), [onenote-script-vm-restart-events.md](../../guides/drafts/onenote-script-vm-restart-events.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: OneNote

1. 参照 [ado-wiki-f-startbuild-fail-avdimage-languagepack.md](../../guides/drafts/ado-wiki-f-startbuild-fail-avdimage-languagepack.md) 排查流程
2. 参照 [mslearn-start-vm-last-known-good.md](../../guides/drafts/mslearn-start-vm-last-known-good.md) 排查流程
3. 参照 [onenote-script-vm-restart-events.md](../../guides/drafts/onenote-script-vm-restart-events.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Customer included a Reboot command in the custom s | 1 条相关 | Remove Reboot command from the custom script; check CSE logs... |
| WALinuxAgent was upgraded while CSE was executing; | 1 条相关 | Wait for WALinuxAgent upgrade to complete then re-trigger CS... |
| VM Extensions use sequence numbers to detect confi | 1 条相关 | Modify settings so handler assigns new sequence number, or u... |
| COMSPEC environment variable changed from cmd.exe  | 1 条相关 | Reset COMSPEC to c:\windows\system32\cmd.exe. Reboot VM. |
| Missing Baltimore CyberTrust Root cert, or cert ch | 1 条相关 | Install Baltimore CyberTrust Root cert from cacert.omniroot.... |
| Bug in sc.exe create command syntax in WinGA MSI v | 1 条相关 | Uninstall WinGA, install v2.7.41491.1010 from GitHub, it aut... |
| Multiple WinGA versions installed simultaneously c | 1 条相关 | Uninstall from Add/Remove Programs, stop services, move old ... |
| Live Migration Defrag enabled on clusters for capa | 1 条相关 | Kusto: LiveMigrationSessionCompleteLog / where PreciseTimeSt... |
| High CPU usage within guest OS causes VM hang. Azu | 1 条相关 | Monitor CPU from within OS; check ASC Resource Explorer > VM... |
| VHD access failure: page blob requests to storage  | 1 条相关 | Check RDOS for E17 events; investigate storage tenant connec... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Linux Custom Script Extension (CSE) stays on Transitioning status indefinitely; operations like disk... | Customer included a Reboot command in the custom script, causing the extension t... | Remove Reboot command from the custom script; check CSE logs at /var/lib/waagent... | 🔵 5.5 | OneNote |
| 2 | Linux Custom Script Extension (CSE) stuck in Transitioning state with status Enable in progress; CSE... | WALinuxAgent was upgraded while CSE was executing; agent restart causes CSE to l... | Wait for WALinuxAgent upgrade to complete then re-trigger CSE with updated setti... | 🔵 5.5 | OneNote |
| 3 | VM extension installation fails with error: Current sequence number, 0, is not greater than the sequ... | VM Extensions use sequence numbers to detect config changes. If re-run with same... | Modify settings so handler assigns new sequence number, or use PowerShell -Force... | 🔵 7.5 | OneNote |
| 4 | Extension installation fails with error code 1007: the system cannot find the file specified. | COMSPEC environment variable changed from cmd.exe to another executable (e.g. Ja... | Reset COMSPEC to c:\windows\system32\cmd.exe. Reboot VM. | 🔵 7.5 | OneNote |
| 5 | Extension fails: The remote certificate is invalid according to the validation procedure. Could not ... | Missing Baltimore CyberTrust Root cert, or cert chain broken by 3rd party SSL in... | Install Baltimore CyberTrust Root cert from cacert.omniroot.com/bc2025.crt and r... | 🔵 7.5 | OneNote |
| 6 | WindowsAzureGuestAgent service not installed from MSI. TransparentInstaller.log: Create service fail... | Bug in sc.exe create command syntax in WinGA MSI v2.7.41491.1024. Missing spaces... | Uninstall WinGA, install v2.7.41491.1010 from GitHub, it auto-updates to .1024 s... | 🔵 7.5 | OneNote |
| 7 | Windows Guest Agent stuck starting. WaAppAgent.log shows old version despite newer version installed... | Multiple WinGA versions installed simultaneously cause version conflict. | Uninstall from Add/Remove Programs, stop services, move old folders, install lat... | 🔵 7.5 | OneNote |
| 8 | VMs experience unexpected reboots during Live Migration Defrag in Mooncake. | Live Migration Defrag enabled on clusters for capacity. Some VMs (<1%) may reboo... | Kusto: LiveMigrationSessionCompleteLog / where PreciseTimeStamp >= ago(2d) and T... | 🔵 7.5 | OneNote |
| 9 | VM hang / unavailable due to high CPU, no platform restart or service healing triggered | High CPU usage within guest OS causes VM hang. Azure platform service healing on... | Monitor CPU from within OS; check ASC Resource Explorer > VM health tab > VMM av... | 🔵 7.5 | OneNote |
| 10 | VM unexpected reboot with Event 17 (E17) in RDOS | VHD access failure: page blob requests to storage tenant fail continuously for 3... | Check RDOS for E17 events; investigate storage tenant connectivity and backend s... | 🔵 7.5 | OneNote |
| 11 | VM deployment or resize fails with AllocationFailed or SkuNotAvailable error. | Insufficient cluster capacity in the target region/zone, or the requested VM siz... | 1) Try a different VM size; 2) Try a different region or availability zone; 3) D... | 🔵 7.5 | OneNote |
| 12 | Multiple VMs on same node go down with VhdDiskPrt Event 16 errors, Hyper-V Event 18590 fatal error, ... | SSD data drive failure on the physical node. In public Azure, Anvil would automa... | Issue FC request (e.g., FC63019) to push the affected node OFR for drive replace... | 🔵 7.5 | OneNote |
| 13 | VM unexpected reboot requiring RCA; customer requests root cause analysis for VM downtime | Host OS crash on the physical node caused all VMs on the node to reboot. The VM ... | Check ASC VM page for Detailed RCA. Provide customer-facing RCA using standard C... | 🔵 7.5 | OneNote |
| 14 | Linux VMs fail SSH connection intermittently; VMs become unresponsive and require portal restart to ... | VM disk IO throttling caused system hang. OS disk was Standard HDD (max 60MB/s),... | Check ASC for disk SKU and IO metrics. If disk read/write bandwidth consistently... | 🔵 5.5 | OneNote |
| 15 | Turbo boost CPU frequency information not displayed in Msv2/Mdsv2 series VMs. Commands turbostat and... | By design. Msv2/Mdsv2 VMs are hosted on older Gen servers where Hyper-V does not... | Inform customer this is expected behavior (by design). Turbo boost is enabled at... | 🔵 6.0 | OneNote |
| 16 | VMSS/AKS node pool creation fails with allocation failure error despite sufficient SKU capacity show... | The target compute cluster is not onboarded to AzSM (Azure Smart Allocation). Wh... | 1) Verify allocation failure via VMApiQosEvent Kusto. 2) Get activityId and chec... | 🔵 7.5 | OneNote |
| 17 | Azure Dedicated Host VMs experience frequent unexpected reboots (8 in 3 months), all caused by physi... | Physical node disks (SKhynix HFS960G32MED-3410A) reached End-of-Life with SMART ... | 1) Check LogContainerSnapshot for nodeId changes. 2) Check LogNodeSnapshot for n... | 🔵 7.5 | OneNote |
| 18 | AKS nodes report VMEventScheduled condition with Freeze event via IMDS; event persists 15+ minutes t... | IMDS scheduled event appears when platform initiates host maintenance (Network i... | 1) Verify via AzPE Kusto: query AzPEWorkflowSnapshot/AzPEWorkflowEvent with node... | 🔵 7.5 | OneNote |
| 19 | SAP NFS server VMs (GlusterFS cluster on SUSE 12) experienced unexpected reboots/redeployments, caus... | Platform-initiated VM reboot/redeploy during maintenance. Multiple NFS server no... | Troubleshooting approach: 1) Check VM Dashboard in Geneva for nodeId/containerId... | 🔵 6.0 | OneNote |
| 20 | RDP connection to Citrix VM fails with Remote Desktop license server error and license store creatio... | Citrix XenApp uses ICA protocol which consumes RD licenses even for admin connec... | 1) Verify licensing mode is correct (set to 4=per user); 2) Ensure SpecifiedLice... | 🔵 7.5 | OneNote |
| 21 | Azure VM is hung/unresponsive, cannot RDP, need to generate memory dump for troubleshooting | VM in hung state where normal remote access is unavailable | Use Azure Portal Serial Console NMI: 1) Pre-configure: reg add CrashControl /v C... | 🔵 7.5 | OneNote |
| 22 | NVs_v3 GPU driver disabled with error Code 43 after VM reboot | GPU driver becomes disabled with Windows Device Manager Code 43 after reboot on ... | Follow TSG: AzureIaaSVM wiki 'NVs_v3-GPU-Driver-is-disabled-with-code-43-after-r... | 🔵 7.5 | OneNote |

