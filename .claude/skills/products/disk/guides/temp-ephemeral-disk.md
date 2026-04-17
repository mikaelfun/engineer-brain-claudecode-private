# Disk Temporary & Ephemeral OS Disk — 排查速查

**来源数**: 3 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: cache, d-drive, data-loss, deallocate, deployment-failure, eosd, ephemeral, ephemeral-os-disk, maintenance, reimage

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Ephemeral OS disk data lost after stop/deallocate, reimage, or host maintenance. VM state reset. | EOSD on local VM storage, not Azure Storage. Stop/deallocate or host healing recreates from image. N | Design stateless workloads. Persist data externally. Do not stop/deallocate EOSD VMs. | 🔵 7.5 | [MS Learn] |
| 2 | Ephemeral OS disk deployment fails: VM size insufficient local cache/temp for OS image. | VM local SSD cache or temp disk too small for OS image. | Verify VM supports EOSD (EphemeralOSDiskSupported). Check cache/temp >= image. Use Temp Disk placement for AVD. Larger V | 🔵 7.5 | [MS Learn] |
| 3 | Temporary disk data lost after VM maintenance, redeployment, or stop/resize. | Temp disk on physical host, not Azure Storage. Lost during maintenance/redeployment/stop-deallocate. | Never store persistent data on temp disk. Use for scratch only (page files, swap, tempdb). Use managed data disks for pe | 🔵 7.5 | [MS Learn] |

## 快速排查路径

1. Ephemeral OS disk data lost after stop/deallocate, reimage, or host maintenance. → Design stateless workloads `[来源: mslearn]`
2. Ephemeral OS disk deployment fails: VM size insufficient local cache/temp for OS → Verify VM supports EOSD (EphemeralOSDiskSupported) `[来源: mslearn]`
3. Temporary disk data lost after VM maintenance, redeployment, or stop/resize. → Never store persistent data on temp disk `[来源: mslearn]`
