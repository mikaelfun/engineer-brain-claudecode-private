# VM Vm Performance — 综合排查指南

**条目数**: 32 | **草稿融合数**: 7 | **Kusto 查询融合**: 1
**来源草稿**: [ado-wiki-b-afs-recall-performance.md](../../guides/drafts/ado-wiki-b-afs-recall-performance.md), [ado-wiki-b-Defender-Performance-Issues-Process.md](../../guides/drafts/ado-wiki-b-Defender-Performance-Issues-Process.md), [ado-wiki-c-sync-performance-investigation.md](../../guides/drafts/ado-wiki-c-sync-performance-investigation.md), [mslearn-performance-bottlenecks-linux.md](../../guides/drafts/mslearn-performance-bottlenecks-linux.md), [onenote-sar-linux-performance-monitoring.md](../../guides/drafts/onenote-sar-linux-performance-monitoring.md), [onenote-vm-performance-metrics-dashboard.md](../../guides/drafts/onenote-vm-performance-metrics-dashboard.md), [onenote-vm-storage-performance-throttling.md](../../guides/drafts/onenote-vm-storage-performance-throttling.md)
**Kusto 引用**: [vm-disk-performance-analysis.md](../../../kusto/vm/references/queries/vm-disk-performance-analysis.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 数据收集
> 来源: Kusto skill

1. 执行 Kusto 查询 `[工具: Kusto skill — vm-disk-performance-analysis.md]`

### Phase 2: 排查与诊断
> 来源: MS Learn, ADO Wiki, OneNote

1. 参照 [ado-wiki-b-afs-recall-performance.md](../../guides/drafts/ado-wiki-b-afs-recall-performance.md) 排查流程
2. 参照 [ado-wiki-b-Defender-Performance-Issues-Process.md](../../guides/drafts/ado-wiki-b-Defender-Performance-Issues-Process.md) 排查流程
3. 参照 [ado-wiki-c-sync-performance-investigation.md](../../guides/drafts/ado-wiki-c-sync-performance-investigation.md) 排查流程
4. 参照 [mslearn-performance-bottlenecks-linux.md](../../guides/drafts/mslearn-performance-bottlenecks-linux.md) 排查流程
5. 参照 [onenote-sar-linux-performance-monitoring.md](../../guides/drafts/onenote-sar-linux-performance-monitoring.md) 排查流程
6. 参照 [onenote-vm-performance-metrics-dashboard.md](../../guides/drafts/onenote-vm-performance-metrics-dashboard.md) 排查流程
7. 参照 [onenote-vm-storage-performance-throttling.md](../../guides/drafts/onenote-vm-storage-performance-throttling.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Docker Hub enforces rate limiting on container ima | 1 条相关 | Authenticate Docker pulls with a Docker account to increase ... |
| Event telemetry files accumulate in the /var/lib/w | 1 条相关 | Run: sudo rm -f /var/lib/waagent/events/* |
| The replacement OS disk uses a different CPU archi | 1 条相关 | When swapping OS disk on an Arm64 VM, the replacement OS dis... |
| Customer tried to swap the OS disk on an Arm64 VM  | 1 条相关 | When swapping the OS disk on an Arm64 VM, the replacement OS... |
| Azure customers are automatically entitled to ESU  | 1 条相关 | Azure customers with ability to open Azure support case are ... |
| Unknown | 2 条相关 | Use Set-AzVMDiskEncryptionExtension -ResourceGroupName $RG -... |
| GPO or registry setting FDVDenyWriteAccess=1 (Deny | 1 条相关 | Set registry FDVDenyWriteAccess to 0: reg add "HKLM\SYSTEM\C... |
| Status blob exceeds 1MB size limit. Associated wit | 1 条相关 | Collect verbose Linux agent logs (enable only for a few minu... |
| Portal drill-down calculates discounted price by c | 1 条相关 | This is by design. Inform customer: (1) Portal drill-down = ... |
| Known bug in recommendation logic: recommendation  | 1 条相关 | If accelerated logs are already enabled on the server, custo... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Container image pulls from Docker Hub fail with HTTP 429 rate limit errors; anonymous pulls limited ... | Docker Hub enforces rate limiting on container image pull requests. Anonymous us... | Authenticate Docker pulls with a Docker account to increase limits. Use Azure Co... | 🟢 8.0 | ADO Wiki |
| 2 | Linux agent warning 'Too many files under /var/lib/waagent/events' causing agent performance issues | Event telemetry files accumulate in the /var/lib/waagent/events directory faster... | Run: sudo rm -f /var/lib/waagent/events/* | 🟢 8.0 | ADO Wiki |
| 3 | Error 'Swapping OS Disk is not allowed since CPU Architecture property for the VM size is not suppor... | The replacement OS disk uses a different CPU architecture (e.g. x64) from the Ar... | When swapping OS disk on an Arm64 VM, the replacement OS disk must be an Arm64-c... | 🟢 8.0 | ADO Wiki |
| 4 | Error: 'Swapping OS Disk is not allowed since CPU Architecture property X for the VM size Y is not s... | Customer tried to swap the OS disk on an Arm64 VM with an x86/x64 OS disk; the r... | When swapping the OS disk on an Arm64 VM, the replacement OS disk must also be a... | 🟢 8.0 | ADO Wiki |
| 5 | Customer running Windows Server 2008/R2 workloads in Azure asks about ESU support eligibility or ent... | Azure customers are automatically entitled to ESU + Support for actively running... | Azure customers with ability to open Azure support case are entitled to ESU + Su... | 🟢 8.0 | ADO Wiki |
| 6 | Need to migrate VM from Dual Pass ADE (with AAD/Service Principal) to Single Pass ADE (without AAD) |  | Use Set-AzVMDiskEncryptionExtension -ResourceGroupName $RG -VMName $VM -Migrate.... | 🟢 8.0 | ADO Wiki |
| 7 | ADE enable fails with "Failed to configure bitlocker as expected. Exception: SaveExternalKeyToFile f... | GPO or registry setting FDVDenyWriteAccess=1 (Deny write access to removable dri... | Set registry FDVDenyWriteAccess to 0: reg add "HKLM\SYSTEM\CurrentControlSet\Pol... | 🔵 7.0 | ADO Wiki |
| 8 | Linux VM agent reports Size of VM status blob is larger than allowed limit of 1 MB. Guest agent cont... | Status blob exceeds 1MB size limit. Associated with high VM CPU and agent repeat... | Collect verbose Linux agent logs (enable only for a few minutes). Update agent t... | 🟢 8.0 | ADO Wiki |
| 9 | Azure Advisor cost recommendation amounts differ between portal UI and CSV/PDF export, or between ov... | Portal drill-down calculates discounted price by calling billing API (shown in c... | This is by design. Inform customer: (1) Portal drill-down = discounted price in ... | 🟢 8.0 | ADO Wiki |
| 10 | Azure Advisor recommendation "Enable Accelerated Logs for improved performance" for MySQL Flexible S... | Known bug in recommendation logic: recommendation is not cleared after accelerat... | If accelerated logs are already enabled on the server, customer can safely ignor... | 🟢 8.0 | ADO Wiki |
| 11 | Updating networking configuration for Elastic SAN volume group with >40 volumes fails with HTTP 409 ... | Update request gets throttled by Storage Resource Provider when volume group has... | Retry the update command. The networking changes should be applied on subsequent... | 🟢 8.0 | ADO Wiki |
| 12 | Slow performance after mounting Azure file share on Windows Server 2012 R2 or Windows 8.1. | Known OS-level issue in Windows Server 2012 R2 and Windows 8.1 affecting SMB fil... | Apply the April 2014 cumulative update for Windows Server 2012 R2 and Windows 8.... | 🟢 8.0 | ADO Wiki |
| 13 | Azure Files REST API call (ARM or SRP) returns empty value array with nextLink present; no apparent ... | By design - REST API enumeration can return partial or empty results depending o... | Follow nextLink pagination: send GET requests to the URL in nextLink property un... | 🟢 8.0 | ADO Wiki |
| 14 | Opening Excel files from mounted Azure File Share or UNC path is significantly slower than locally | Multiple causes: network latency, xlsx format overhead, Excel unsupported ops, a... | Use XLS/XLSB, disable Protected View, add storage FQDN to Trusted Sites, verify ... | 🟢 8.0 | ADO Wiki |
| 15 | Azure VM screenshot shows 'Windows could not finish configuring the system. To attempt to resume con... | Machine is performing first boot of a generalized image and failed to complete t... | Image is unrecoverable. Customer must recreate the generalized image. Change sup... | 🟢 8.0 | ADO Wiki |
| 16 | Azure VM screenshot shows VM stuck on Hyper-V screen and not booting past the Hyper-V logo (Windows ... | Multiple possible causes: (1) Windows bug check or guest OS issue preventing boo... | Take multiple screenshots via ASC to confirm not reboot loop. Check ASC Insights... | 🟢 8.0 | ADO Wiki |
| 17 | Error when trying to upgrade/resize Azure VM to a size with more than 64 vCPUs (e.g., Standard_F72s_... | The guest operating system running on the VM does not support more than 64 vCPUs | Use a supported guest OS that supports >64 vCPUs: Windows Server 2016, Ubuntu 16... | 🔵 7.0 | MS Learn |
| 18 | Windows VM stuck during boot at 'Applying Software Installation policy' message shown in boot diagno... | Group Policy software installation policy processing stall during boot. Specific... | Collect OS memory dump file via rescue VM, then file Azure support request for d... | 🔵 7.0 | MS Learn |
| 19 | Azure Windows VM BSOD with bug check IRQL_NOT_LESS_OR_EQUAL (0x0000000A). VM fails to boot, blue scr... | OS does not support more than 64 vCPUs but VM is configured with higher vCPU cou... | 1) Reduce vCPUs to 64 or fewer. 2) Rebuild VM with OS supporting >64 vCPUs (Wind... | 🔵 7.0 | MS Learn |
| 20 | Azure Windows VM BSOD with bug check BAD_POOL_HEADER (0x00000019). VM crashes with blue screen. | Memory pool corruption detected. The pool was already corrupted when the current... | Collect OS memory dump file for detailed dump analysis to determine source of po... | 🔵 7.0 | MS Learn |
| 21 | Azure Windows VM BSOD with bug check MEMORY_MANAGEMENT (0x0000001A). VM crashes with blue screen. | Server memory management error occurred. Specific cause requires detailed dump a... | Collect OS memory dump file and file Azure support request for dump analysis. | 🔵 7.0 | MS Learn |
| 22 | Azure Windows VM BSOD with bug check KMODE_EXCEPTION_NOT_HANDLED (0x0000001E). VM crashes with blue ... | Kernel-mode program generated an exception that the error handler didn't catch. | Collect OS memory dump file to identify which exception was generated. File Azur... | 🔵 7.0 | MS Learn |
| 23 | Data disk disappears from Windows guest OS. Event ID 157: Disk has been surprise removed. Disks appe... | I/O throttling causes disk timeout. Excessive workload + low IoTimeoutValue (def... | Increase IoTimeoutValue (max 179s). Cluster: run PerfInsights, check cluster log... | 🔵 7.0 | MS Learn |
| 24 | Linux VM logs Out of memory: Kill process or invoked oom-killer - OOM Killer terminates processes | Both RAM and swap are exhausted; OOM Killer selects process with highest oom_sco... | Identify high-memory process via top/ps. Check for memory leaks. Scale up VM siz... | 🔵 7.0 | MS Learn |
| 25 | Azure Linux VM maximum memory limited to 64 GB despite larger VM size. free -m shows only 64GB insid... | Bug in Linux kernel prior to 3.10 with MTRR handling on Windows Server 2016 Hype... | Add disable_mtrr_trim as kernel boot line option in GRUB config. Or upgrade to n... | 🔵 7.0 | MS Learn |
| 26 | Need to benchmark Azure VM disk performance (IOPS, throughput, latency) on Premium Storage to valida... |  | Use DiskSpd (recommended) or IOMeter. DiskSpd: (1) Throughput: diskspd.exe -c102... | 🟢 8.5 | OneNote |
| 27 | SQL Server on Azure VM shows high IO but CPU/memory are low. Customer claims Azure VM has IO issues ... | SQL Server queries generating excessive IOPS that exceed VM/disk throttling limi... | Use sys.dm_io_virtual_file_stats to measure SQL Server IO before/after query exe... | 🟢 8.5 | OneNote |
| 28 | Linux VM sporadic app failures; dmesg shows Out of memory: Kill process; OOM Killer terminating proc... | Memory pressure: swap not configured, NUMA/HugePages, app memory leak, or insuff... | 1) Configure swap file. 2) Resize VM if workload peak. 3) Check NUMA/HugePages. ... | 🟢 8.5 | OneNote |
| 29 | Azure VM with P60 Premium disks managed by Oracle ASM shows Owait of 20% on the guest; severe I/O th... | I/O throttling at VM level due to exceeding the VM-level IOPS/throughput cap whe... | Verify VM size supports the aggregate IOPS of all attached disks; resize VM to a... | 🔵 6.5 | OneNote |
| 30 | Single-thread sync IO performance poor on Premium disk (P30), adding more disks does not improve per... | Sync IO performance limited by disk latency (~2ms) not IOPS cap. Single outstand... | Use async IO or multi-threaded IO to increase outstanding IO count. Need 10 outs... | 🟢 8.5 | OneNote |
| 31 | Guest Agent shows Not Ready status, extensions fail to execute | High CPU/memory within guest OS causes Guest Agent to hang and not respond. GA r... | Check VM performance metrics during issue timeframe; use IID and WinGuestAnalyze... | 🟢 8.5 | OneNote |
| 32 | Mooncake 应用完成 AAD 登录后，持续重复调用 login.microsoftonline.com/common/discovery/instance 和 openid-configurat... | 应用使用 MSAL 库获取 token 时，代码实现导致登录完成后仍反复触发 metadata discovery 请求 | 检查 MSAL token 获取代码，确保使用 token cache 避免重复 discovery 调用；参考 MSAL 官方文档优化 token acqui... | 🔵 7.0 | OneNote |

