# VM 磁盘性能与限流 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 15 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ASR replication performance issue -- need to measure disk write churn rate, RPO lag, upload vs proce | Write churn rate exceeds available bandwidth or storage IOPS, causing RPO violat | 3-step query on mabprodmc (MABKustoProd DB): (1) Get DataSourceId: TelemetryPETo | 🟢 9 | ON |
| 2 | Need to benchmark Azure VM disk performance (IOPS, throughput, latency) on Premium Storage to valida |  | Use DiskSpd (recommended) or IOMeter. DiskSpd: (1) Throughput: diskspd.exe -c102 | 🟢 8 | ON |
| 3 | SQL Server on Azure VM shows high IO but CPU/memory are low. Customer claims Azure VM has IO issues  | SQL Server queries generating excessive IOPS that exceed VM/disk throttling limi | Use sys.dm_io_virtual_file_stats to measure SQL Server IO before/after query exe | 🟢 8 | ON |
| 4 | Single-thread sync IO performance poor on Premium disk (P30), adding more disks does not improve per | Sync IO performance limited by disk latency (~2ms) not IOPS cap. Single outstand | Use async IO or multi-threaded IO to increase outstanding IO count. Need 10 outs | 🟢 8 | ON |
| 5 | Container image pulls from Docker Hub fail with HTTP 429 rate limit errors; anonymous pulls limited  | Docker Hub enforces rate limiting on container image pull requests. Anonymous us | Authenticate Docker pulls with a Docker account to increase limits. Use Azure Co | 🔵 7.5 | AW |
| 6 | Columns missing or data not matching when downloading Azure Advisor recommendations in CSV or PDF fo | Known issues: (1) Certain cost recommendations do not support cost-saving price  | Compare data across Portal, CSV, and PDF. If discrepancy is only in cost/pricing | 🔵 7.5 | AW |
| 7 | Lsv3/Lasv3/Lsv2 VM deployment fails with provisioning exception when Premium data disk caching is en | Premium storage caching is not supported on Lsv3/Lasv3/Lsv2 storage-optimized SK | Disable caching (set to None) for all attached data disks on Lsv3/Lasv3/Lsv2. If | 🔵 6.5 | AW |
| 8 | Genomics workflow fails with 'Error downloading/uploading <blob>: Access to storage account <account | Customer submitted too many concurrent workflows reading from or writing to the  | Use a different storage account for workflow inputs/outputs, or wait for current | 🔵 6.5 | AW |
| 9 | Elastic SAN volume creation fails when multiple parallel volume operations are in flight | Limits on concurrent volume create operations that can be handled simultaneously | Reduce the number of parallel volume creation operations. Serialize volume creat | 🔵 6.5 | AW |
| 10 | Elastic SAN volume shows lower than expected performance (bandwidth/IOPS) when running sequential wo | Product limitation: shard level performance limits of 5,000 IOPS and 256 MB/s ar | Workaround: stripe multiple volumes to achieve target performance. Use Storage S | 🔵 6.5 | AW |
| 11 | Updating networking configuration for Elastic SAN volume group with >40 volumes fails with HTTP 409  | Update request gets throttled by Storage Resource Provider when volume group has | Retry the update command. The networking changes should be applied on subsequent | 🔵 6.5 | AW |
| 12 | Azure VM with many attached VHDs in same storage account reboots unexpectedly. Storage metrics show  | Large number of VHDs in single storage account causes IOPS/throughput to exceed  | Distribute VHDs across multiple storage accounts. Max 40 disks per account recom | 🔵 6.5 | ML |
| 13 | Data disk disappears from Windows guest OS. Event ID 157: Disk has been surprise removed. Disks appe | I/O throttling causes disk timeout. Excessive workload + low IoTimeoutValue (def | Increase IoTimeoutValue (max 179s). Cluster: run PerfInsights, check cluster log | 🔵 6.5 | ML |
| 14 | Linux VMs fail SSH connection intermittently; VMs become unresponsive and require portal restart to  | VM disk IO throttling caused system hang. OS disk was Standard HDD (max 60MB/s), | Check ASC for disk SKU and IO metrics. If disk read/write bandwidth consistently | 🔵 6 | ON |
| 15 | Azure VM with P60 Premium disks managed by Oracle ASM shows Owait of 20% on the guest; severe I/O th | I/O throttling at VM level due to exceeding the VM-level IOPS/throughput cap whe | Verify VM size supports the aggregate IOPS of all attached disks; resize VM to a | 🔵 5 | ON |

## 快速排查路径

1. **ASR replication performance issue -- need to measure disk write churn rate, RPO **
   - 根因: Write churn rate exceeds available bandwidth or storage IOPS, causing RPO violations. Mooncake ASR Kusto lacks GetDsHeal
   - 方案: 3-step query on mabprodmc (MABKustoProd DB): (1) Get DataSourceId: TelemetryPEToProvider where SubscriptionId|project DataSourceId,VmName,OsType,Prote
   - `[🟢 9 | ON]`

2. **Need to benchmark Azure VM disk performance (IOPS, throughput, latency) on Premi**
   - 方案: Use DiskSpd (recommended) or IOMeter. DiskSpd: (1) Throughput: diskspd.exe -c1024M -d300 -W5 -w100 -t8 -o64 -b256k -r -h -L E:\testfile.dat; (2) Rate-
   - `[🟢 8 | ON]`

3. **SQL Server on Azure VM shows high IO but CPU/memory are low. Customer claims Azu**
   - 根因: SQL Server queries generating excessive IOPS that exceed VM/disk throttling limits. Customers often blame Azure VM disk 
   - 方案: Use sys.dm_io_virtual_file_stats to measure SQL Server IO before/after query execution: calculate IOPS as (total_io_after - total_io_before) / interva
   - `[🟢 8 | ON]`

4. **Single-thread sync IO performance poor on Premium disk (P30), adding more disks **
   - 根因: Sync IO performance limited by disk latency (~2ms) not IOPS cap. Single outstanding IO gives only ~500 IOPS. More disks 
   - 方案: Use async IO or multi-threaded IO to increase outstanding IO count. Need 10 outstanding IOs to saturate P30 5000 IOPS. Optimize application to use mul
   - `[🟢 8 | ON]`

5. **Container image pulls from Docker Hub fail with HTTP 429 rate limit errors; anon**
   - 根因: Docker Hub enforces rate limiting on container image pull requests. Anonymous users are limited to 100 pulls/6h by IP, f
   - 方案: Authenticate Docker pulls with a Docker account to increase limits. Use Azure Container Registry (ACR) as an alternative registry. Upgrade to a paid D
   - `[🔵 7.5 | AW]`

