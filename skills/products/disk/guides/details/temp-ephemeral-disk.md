# Disk Temporary & Ephemeral OS Disk — 详细速查

**条目数**: 3 | **类型**: 📊 速查（无融合素材）
**生成日期**: 2026-04-07

---

### 1. Ephemeral OS disk data lost after stop/deallocate, reimage, or host maintenance. VM state reset.

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: EOSD on local VM storage, not Azure Storage. Stop/deallocate or host healing recreates from image. No snapshots/backups/ADE.

**方案**: Design stateless workloads. Persist data externally. Do not stop/deallocate EOSD VMs.

**标签**: ephemeral-OS-disk, EOSD, data-loss, deallocate, stateless, reimage

---

### 2. Ephemeral OS disk deployment fails: VM size insufficient local cache/temp for OS image.

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: VM local SSD cache or temp disk too small for OS image.

**方案**: Verify VM supports EOSD (EphemeralOSDiskSupported). Check cache/temp >= image. Use Temp Disk placement for AVD. Larger VM size.

**标签**: ephemeral-OS-disk, EOSD, deployment-failure, VM-size, cache, temp-disk

---

### 3. Temporary disk data lost after VM maintenance, redeployment, or stop/resize.

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Temp disk on physical host, not Azure Storage. Lost during maintenance/redeployment/stop-deallocate.

**方案**: Never store persistent data on temp disk. Use for scratch only (page files, swap, tempdb). Use managed data disks for persistence.

**标签**: temporary-disk, temp-disk, D-drive, ephemeral, data-loss, maintenance

---

