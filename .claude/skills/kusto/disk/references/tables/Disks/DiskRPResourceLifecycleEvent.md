---
name: DiskRPResourceLifecycleEvent
database: Disks
cluster: https://disksmc.chinaeast2.kusto.chinacloudapi.cn
description: 磁盘生命周期事件，记录创建、删除、附加等操作
status: active
---

# DiskRPResourceLifecycleEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://disksmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | Disks |
| 状态 | ✅ 可用 |

## 用途

记录磁盘资源的生命周期事件，包括创建 (Create)、删除 (Delete)、附加 (Attach)、分离 (Detach) 等操作的详细信息和状态变化。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| subscriptionId | string | 订阅 ID | guid |
| activityId | string | 活动 ID | guid |
| resourceGroupName | string | 资源组名称 | my-rg |
| resourceName | string | 磁盘名称 | mydisk |
| diskType | string | 磁盘类型 | Managed |
| diskEvent | string | 事件类型 | Create, Delete, Attach, Detach |
| stage | string | 操作阶段 | Start, Complete |
| state | string | 磁盘状态 | Attached, Unattached |
| blobUrl | string | Blob URL | https://md-xxx.blob.core.chinacloudapi.cn/... |
| storageAccountName | string | 存储账户名称 | md-xxx |
| storageAccountType | string | 存储账户类型 | Premium_LRS, Standard_LRS |
| diskOwner | string | 磁盘所有者（VM ARM ID） | /subscriptions/.../virtualMachines/myvm |
| crpDiskId | string | CRP 磁盘 ID | guid |
| diskSizeBytes | long | 磁盘大小（字节） | 107374182400 |
| tier | string | 性能层级 | P30, P40 |
| hyperVGeneration | string | HyperV 代次 | V1, V2 |
| pseudosubscriptionId | string | 伪订阅 ID（内部用） | guid |
| physicalZone | string | 物理区域 | 1, 2, 3 |
| networkAccessPolicy | string | 网络访问策略 | AllowAll, DenyAll |
| totalOperationsPerSecond | long | 配置的 IOPS | 5000 |
| totalBytesPerSecond | long | 配置的吞吐量 | 200000000 |
| timeCreated | string | 磁盘创建时间 | ISO 8601 格式 |
| RPTenant | string | RP 租户 | 租户标识 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `resourceName` - 按磁盘名称筛选
- `diskEvent` - 按事件类型筛选（Create, Delete, Attach, Detach）
- `stage` - 按操作阶段筛选（Start, Complete）
- `blobUrl` - 按 Blob URL 筛选

## diskEvent 事件类型

| 事件类型 | 说明 |
|----------|------|
| Create | 磁盘创建 |
| Delete | 磁盘删除 |
| Attach | 磁盘附加到 VM |
| Detach | 磁盘从 VM 分离 |
| Update | 磁盘更新 |

## 典型应用场景

1. **追踪磁盘创建过程**: 查看磁盘创建的各个阶段和状态
2. **分析附加/分离操作**: 查看磁盘与 VM 的关联变化
3. **按 Blob URL 查找磁盘**: 通过存储层 URL 定位磁盘资源
4. **审计磁盘操作历史**: 查看特定磁盘的完整操作历史

## 示例查询

```kql
// 按磁盘名称查询生命周期事件
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent 
| where subscriptionId == "{subscription}"
| where resourceName has "{diskName}"
| where PreciseTimeStamp >= ago(3d)
| project PreciseTimeStamp, resourceGroupName, resourceName, diskEvent, stage, state, 
         blobUrl, diskOwner, storageAccountType, tier
| order by PreciseTimeStamp asc
```

```kql
// 按 Blob URL 查询磁盘操作
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent 
| where subscriptionId == "{subscription}"
| where blobUrl contains "{blobPath}"
| where PreciseTimeStamp >= ago(3d)
| project PreciseTimeStamp, resourceGroupName, resourceName, diskOwner, blobUrl, diskEvent
| order by PreciseTimeStamp asc
```

```kql
// 查看特定 VM 的磁盘附加/分离历史
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent 
| where subscriptionId == "{subscription}"
| where diskOwner contains "{vmName}"
| where diskEvent in ("Attach", "Detach")
| where PreciseTimeStamp >= ago(7d)
| project PreciseTimeStamp, resourceName, diskEvent, stage, state, diskOwner
| order by PreciseTimeStamp asc
```

## 关联表

- [DiskManagerApiQoSEvent.md](./DiskManagerApiQoSEvent.md) - API 调用 QoS 事件
- [DiskManagerContextActivityEvent.md](./DiskManagerContextActivityEvent.md) - 详细操作日志
- [Disk.md](./Disk.md) - 磁盘元数据快照

## 注意事项

- 使用 `diskEvent` 过滤特定类型的生命周期事件
- `blobUrl` 可用于追踪到存储层的操作
- `diskOwner` 包含关联 VM 的 ARM ID
- `stage` 字段区分操作开始和完成阶段
