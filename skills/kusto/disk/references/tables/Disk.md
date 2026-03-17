---
name: Disk
database: Disks
cluster: https://disksmc.chinaeast2.kusto.chinacloudapi.cn
description: 托管磁盘元数据快照表，包含磁盘配置、存储账户、VM 关联等信息
status: active
---

# Disk

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://disksmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | Disks |
| 状态 | ✅ 可用 |

## 用途

存储托管磁盘的元数据快照，包括磁盘配置、存储账户信息、VM 关联、性能层级等。用于查询磁盘的详细属性和状态。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| TIMESTAMP | datetime | 快照时间戳 | 2025-01-01T00:00:00Z |
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| SubscriptionId | string | 订阅 ID | guid |
| ResourceGroup | string | 资源组名称 | my-rg |
| DiskArmId | string | 磁盘 ARM 资源 ID | /subscriptions/.../disks/mydisk |
| DisksName | string | 磁盘名称 | mydisk |
| BlobUrl | string | Blob 存储 URL | https://md-xxx.blob.core.chinacloudapi.cn/... |
| AccountType | string | 存储账户类型 | Premium_LRS, Standard_LRS |
| GeoLocation | string | 地理位置 | chinaeast2 |
| OwnershipState | string | 所有权状态 | Attached, Unattached |
| OwnerReferenceKey | string | 所有者引用（包含 VM ID） | 编码的 VM ARM ID |
| DiskSizeBytes | long | 磁盘大小（字节） | 107374182400 |
| Tier | string | 性能层级 | P30, P40 |
| TotalOperationsPerSecond | long | 配置的 IOPS | 5000 |
| TotalBytesPerSecond | long | 配置的吞吐量 | 200000000 |
| TimeCreated | datetime | 磁盘创建时间 | 2025-01-01T00:00:00Z |
| CrpDiskId | string | CRP 磁盘 ID | guid |
| IsARMResource | string | 是否为 ARM 资源 | True, False |
| BurstingEnabled | string | 是否启用突发 | True, False |
| NetworkAccessPolicy | string | 网络访问策略 | AllowAll, DenyAll |
| PhysicalZone | string | 物理区域 | 1, 2, 3 |
| HyperVGeneration | string | HyperV 代次 | V1, V2 |
| OsType | string | 操作系统类型 | Windows, Linux |
| MaxShares | long | 最大共享数 | 1, 5, 10 |
| RPTenant | string | RP 租户 | 租户标识 |

## 常用筛选字段

- `SubscriptionId` - 按订阅筛选
- `DiskArmId` - 按磁盘 ARM ID 筛选
- `DisksName` - 按磁盘名称筛选
- `OwnershipState` - 按所有权状态筛选
- `AccountType` - 按存储类型筛选

## 典型应用场景

1. **查询磁盘详细信息**: 获取磁盘配置、存储账户、性能层级
2. **查找 VM 关联的磁盘**: 通过 OwnerReferenceKey 解析关联 VM
3. **分析磁盘配置**: 检查 IOPS、吞吐量、突发配置
4. **审计未附加磁盘**: 查找 OwnershipState 为 Unattached 的磁盘

## 示例查询

```kql
// 查询订阅下的所有磁盘信息
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').Disk
| where SubscriptionId in ("{subscription}")
| where TIMESTAMP > ago(1d)
| parse BlobUrl with * 'https://' storageaccount '/' *
| parse kind=regex OwnerReferenceKey with * 'VIRTUALMACHINES%2F' VMName '$'
| extend DiskSizeGB = DiskSizeBytes / 1024 / 1024 / 1024
| distinct SubscriptionId, DiskArmId, BlobUrl, storageaccount, AccountType, GeoLocation, 
          OwnershipState, IsARMResource, VMName, TimeCreated, DiskSizeGB,
          TotalOperationsPerSecond, TotalBytesPerSecond
```

```kql
// 按 VM 名称查询关联的磁盘
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').Disk
| where SubscriptionId has '{subscription}'
| where TIMESTAMP > ago(1d)
| parse BlobUrl with * 'https://' storageaccount '/' *
| parse kind=regex OwnerReferenceKey with * 'VIRTUALMACHINES%2F' VMName '$'
| extend DiskSizeGB = DiskSizeBytes / 1024 / 1024 / 1024
| extend OwnerReferenceKey = replace_string(OwnerReferenceKey, '%2F', '/')
| where VMName has '{vmName}'
| distinct DiskArmId, BlobUrl, storageaccount, AccountType, OwnershipState, VMName, 
          TimeCreated, DiskSizeGB, Tier, TotalOperationsPerSecond, TotalBytesPerSecond
```

```kql
// 查找未附加的磁盘
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').Disk
| where SubscriptionId == "{subscription}"
| where TIMESTAMP > ago(1d)
| where OwnershipState == "Unattached"
| extend DiskSizeGB = DiskSizeBytes / 1024 / 1024 / 1024
| project DiskArmId, DisksName, AccountType, DiskSizeGB, TimeCreated, Tier
| summarize arg_max(TIMESTAMP, *) by DiskArmId
```

## 关联表

- [DiskRPResourceLifecycleEvent.md](./DiskRPResourceLifecycleEvent.md) - 磁盘生命周期事件
- [DiskManagerApiQoSEvent.md](./DiskManagerApiQoSEvent.md) - API 调用事件
- [OsXIOSurfaceCounterTable.md](./OsXIOSurfaceCounterTable.md) - IO 性能数据

## 注意事项

- 此表为快照表，使用 `arg_max(TIMESTAMP, *)` 获取最新状态
- `OwnerReferenceKey` 需要 URL 解码以获取 VM 名称
- `BlobUrl` 可用于追踪到 XStore 层
- 性能配置（IOPS/吞吐量）在 `TotalOperationsPerSecond` 和 `TotalBytesPerSecond` 字段
