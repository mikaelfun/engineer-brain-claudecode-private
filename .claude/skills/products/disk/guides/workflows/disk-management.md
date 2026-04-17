# Disk Management (Attach/Detach/Resize) — 排查工作流

**来源草稿**: 无
**Kusto 引用**: dcm-disk-inventory.md, disk-api-qos.md, disk-lifecycle.md, disk-metadata.md, rdos-disk-config.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: 磁盘操作失败排查 (API 层)
> 来源: disk-api-qos.md | 适用: Mooncake ✅

### 排查步骤

1. **查询失败的操作**
   ```kql
   cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent
   | where subscriptionId == "{subscription}"
   | where resultCode != "Success" or httpStatusCode >= 400
   | project PreciseTimeStamp, operationName, resourceName, httpStatusCode, errorDetails
   ```

2. **按 CorrelationId 追踪完整操作链**
   ```kql
   DiskManagerApiQoSEvent | where correlationId == "{correlationId}"
   ```

3. **检查长时间操作 (>30s)**
   ```kql
   | where durationInMilliseconds > 30000
   ```

4. **查看详细上下文日志**
   ```kql
   DiskManagerContextActivityEvent | where correlationId == "{correlationId}" and traceLevel >= 2
   ```

### 常见操作名称
- `Disks.ResourceOperation.PUT` — 创建/更新
- `Disks.ResourceOperation.DELETE` — 删除
- `Snapshots.ResourceOperation.PUT` — 创建快照

---

## Scenario 2: 磁盘生命周期事件追踪
> 来源: disk-lifecycle.md | 适用: Mooncake ✅

### 排查步骤

1. **按磁盘名称查询生命周期**
   ```kql
   cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent
   | where subscriptionId == "{subscription}" and resourceName has "{diskName}"
   | project PreciseTimeStamp, resourceName, diskEvent, stage, state, diskOwner
   ```

2. **查看 VM 的磁盘附加/分离历史**
   ```kql
   | where diskOwner contains "{vmName}" and diskEvent in ("Attach", "Detach")
   ```

### 事件类型
| diskEvent | 说明 |
|-----------|------|
| Create | 创建 |
| Delete | 删除 |
| Attach | 附加到 VM |
| Detach | 从 VM 分离 |
| Update | 更新配置 |

---

## Scenario 3: 磁盘元数据查询
> 来源: disk-metadata.md | 适用: Mooncake ✅

### 排查步骤

1. **按订阅列出所有磁盘**
   ```kql
   cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').Disk
   | where SubscriptionId in ("{subscription}") and TIMESTAMP > ago(1d)
   | summarize arg_max(TIMESTAMP, *) by DiskArmId
   | project DiskArmId, DisksName, AccountType, OwnershipState, VMName, DiskSizeGB, Tier, TotalOperationsPerSecond
   ```

2. **查找未附加的磁盘**
   ```kql
   | where OwnershipState == "Unattached"
   ```

### 关键字段
- `TotalOperationsPerSecond` — 配置的 IOPS
- `TotalBytesPerSecond` — 配置的吞吐量
- `Tier` — 性能层级 (P30, P40, etc.)

---

## Scenario 4: 主机物理磁盘硬件检查
> 来源: dcm-disk-inventory.md, rdos-disk-config.md | 适用: Mooncake ✅

### 排查步骤

1. **查询节点物理磁盘清单**
   ```kql
   cluster('https://azuredcmmc.kusto.chinacloudapi.cn').database('AzureDcmDb').dcmInventoryComponentDiskDirect
   | where NodeId == "{nodeId}"
   | project NodeId, Model, SerialNumber, Size, MediaType, BusType, HealthStatus
   ```

2. **健康状态**: Healthy / Warning / Unhealthy / Unknown

3. **查询节点磁盘配置**
   ```kql
   cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsConfigTable
   | where NodeId == "{nodeId}"
   | where ConfigName has "disk" or ConfigName has "vhd"
   ```