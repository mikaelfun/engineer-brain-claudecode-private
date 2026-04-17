# Disk Storage Spaces & S2D — 排查速查

**来源数**: 5 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: nullsessionshares, registry-type-mismatch, smb, sofs

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | A standalone storage pool was created by using 10 Physical Disk and out of which the virtual disk was curved out.Virtual | All the Physical disk which were presented in the storage pool had it's Free space was zero.Log Name | Add number of physical disk equal to number of column count to Storage pool. | 🔵 7.5 | [KB] |
| 2 | On storage spaces, while running the command get-physicaldisk it was not returning any value even though number of physi | &nbsp;Microsoft Storage Spaces SMP Service was disabled. | Resolution: Set the SMP Service to Manual and restarted the service, post which we were able to get the output of all th | 🔵 7.5 | [KB] |
| 3 | Consider the following Scenario:Single WS19/WS16 Server with Standalone Storage Spaces (no S2D)Customer used x Number of | When the Parity VDisks was created Spaces automatically created a write cache region for these Parit | Add new SSD's as Journal Disks and remove the old SSD's from the Pool Delete the Virtual Disk(s), remove all unwanted SS | 🔵 7.5 | [KB] |
| 4 | Issue:Storage pool is down.Three node S2D cluster.Recent change:Physical location of the data-center&nbsp;movedOS: Windo | 1.Get-physical disk shows that capacity drive for two of the three nodes as lost communication.2&gt; | Binding is an&nbsp;SBL-level operation which associates a capacity device with a cache device. Rebinding usually implies | 🔵 7.5 | [KB] |
| 5 | SOFS (Scale-Out File Server) share creation fails and share properties report error: 'Error Retrieving SMB Server Settin | NullSessionShares registry value under LanManServer\Parameters was configured as REG_SZ (String) ins | Delete the incorrectly typed registry value (NullSessionShares REG_SZ) under HKLM\System\CurrentControlSet\Services\LanM | 🔵 7.5 | [KB] |

## 快速排查路径

1. A standalone storage pool was created by using 10 Physical Disk and out of which → Add number of physical disk equal to number of column count to Storage pool `[来源: contentidea-kb]`
2. On storage spaces, while running the command get-physicaldisk it was not returni → Resolution: Set the SMP Service to Manual and restarted the service, post which we were able to get  `[来源: contentidea-kb]`
3. Consider the following Scenario:Single WS19/WS16 Server with Standalone Storage  → Add new SSD's as Journal Disks and remove the old SSD's from the Pool Delete the Virtual Disk(s), re `[来源: contentidea-kb]`
4. Issue:Storage pool is down.Three node S2D cluster.Recent change:Physical locatio → Binding is an&nbsp;SBL-level operation which associates a capacity device with a cache device `[来源: contentidea-kb]`
5. SOFS (Scale-Out File Server) share creation fails and share properties report er → Delete the incorrectly typed registry value (NullSessionShares REG_SZ) under HKLM\System\CurrentCont `[来源: contentidea-kb]`
