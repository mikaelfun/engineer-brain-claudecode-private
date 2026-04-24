# VM VM 启停操作 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 6 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Need to determine which VMs under a subscription had role state changed (start/stop/reboot/migration |  | Kusto on azurecm.chinanorth2 (AzureCM DB): join LogContainerSnapshot + TMMgmtSla | 🟢 8 | ON |
| 2 | After deploying v6 series VMs (Dasv6/Easv6/Fasv6 etc.), local temp disk is not visible or shows as r | v6 VMs use raw unformatted NVMe local disks instead of previous SCSI-based temp  | Initialize and format the NVMe disks into preferred file system after VM boots u | 🔵 7.5 | AW |
| 3 | SAP instance start/stop automation via Logic App and ARM template fails with AuthorizationFailed err | The Managed Identity associated with the Logic App did not have the Azure Center | Assign the Azure Center for SAP Solutions Administrator role to the Logic App Ma | 🔵 7.5 | AW |
| 4 | NFS mount fails with mount.nfs: requested NFS version or transport protocol is not supported | Private endpoint setup is incorrect. DNS resolution for storage.privatelink.file | Run nslookup <storage>.file.core.windows.net and verify it resolves to correct p | 🔵 7.5 | AW |
| 5 | 客户希望将现有 VM 的磁盘控制器从 SCSI 切换到 NVMe，但不清楚步骤或操作后 VM 无法正常启动 | 切换 DiskControllerType 需要 VM 处于 deallocated 状态；仅 Ebsv5/Ebdsv5 VM 系列支持 NVMe；且 OS 镜 | 前提条件：VM 为 Ebsv5 或 Ebdsv5，OS 镜像支持 NVMe，VM 已 deallocate。步骤：1) 停止并 deallocate VM；2) | 🔵 6.5 | AW |
| 6 | Receive alert VM is unavailable for 15 minutes in Azure Resource Health or Activity Log after VM sto | Platform sends unavailability notification when VM is deleted, stopped, dealloca | This is expected behavior in most cases. Check if the operation was user-initiat | 🔵 6.5 | ML |

## 快速排查路径

1. **Need to determine which VMs under a subscription had role state changed (start/s**
   - 方案: Kusto on azurecm.chinanorth2 (AzureCM DB): join LogContainerSnapshot + TMMgmtSlaMeasurementEventEtwTable on ContainerID, filter subscriptionId + clust
   - `[🟢 8 | ON]`

2. **After deploying v6 series VMs (Dasv6/Easv6/Fasv6 etc.), local temp disk is not v**
   - 根因: v6 VMs use raw unformatted NVMe local disks instead of previous SCSI-based temp disks. Unlike previous D/E series VMs, v
   - 方案: Initialize and format the NVMe disks into preferred file system after VM boots up. After stop/deallocate/planned maintenance and auto-recovery events,
   - `[🔵 7.5 | AW]`

3. **SAP instance start/stop automation via Logic App and ARM template fails with Aut**
   - 根因: The Managed Identity associated with the Logic App did not have the Azure Center for SAP Solutions Administrator RBAC ro
   - 方案: Assign the Azure Center for SAP Solutions Administrator role to the Logic App Managed Identity at the resource group or subscription level covering bo
   - `[🔵 7.5 | AW]`

4. **NFS mount fails with mount.nfs: requested NFS version or transport protocol is n**
   - 根因: Private endpoint setup is incorrect. DNS resolution for storage.privatelink.file.core.windows.net returns wrong IP, or p
   - 方案: Run nslookup <storage>.file.core.windows.net and verify it resolves to correct private IP matching ASC. Check PE is in Approved state. If DNS IP misma
   - `[🔵 7.5 | AW]`

5. **客户希望将现有 VM 的磁盘控制器从 SCSI 切换到 NVMe，但不清楚步骤或操作后 VM 无法正常启动**
   - 根因: 切换 DiskControllerType 需要 VM 处于 deallocated 状态；仅 Ebsv5/Ebdsv5 VM 系列支持 NVMe；且 OS 镜像必须支持 NVMe 驱动，否则切换后无法启动
   - 方案: 前提条件：VM 为 Ebsv5 或 Ebdsv5，OS 镜像支持 NVMe，VM 已 deallocate。步骤：1) 停止并 deallocate VM；2) 在 storageProfile 中将 diskControllerTypes 设为 ["NVMe"]；3) 确认 OS 镜像标记为 NV
   - `[🔵 6.5 | AW]`

