---
name: dcmInventoryComponentDisk
database: AzureDCMDb
cluster: https://azuredcmmc.kusto.chinacloudapi.cn
description: 主机磁盘硬件库存信息，包含序列号、产品 ID、固件版本等
status: active
---

# dcmInventoryComponentDisk

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azuredcmmc.kusto.chinacloudapi.cn |
| 数据库 | AzureDcmDb |
| 状态 | ✅ 可用 |

## 用途

存储主机节点上的物理磁盘硬件库存信息，包括磁盘序列号、产品 ID、固件版本、SCSI 地址等。用于硬件故障诊断和磁盘定位。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| NodeId | string | 节点 ID | guid |
| SCSIPort | int | SCSI 端口号 | 0 |
| SCSIBus | int | SCSI 总线号 | 0 |
| SCSIAddress | int | SCSI 地址 | 0 |
| SCSILUN | int | SCSI LUN (逻辑单元号) | 0 |
| DriveSerialNumber | string | 磁盘序列号 | ABC123456 |
| DriveProductId | string | 磁盘产品 ID | SAMSUNG MZQL2 |
| FirmwareRevision | string | 固件版本 | GDC5302Q |
| DriveBusType | string | 磁盘总线类型 | NVMe, SATA |
| SystemDrive | bool | 是否为系统磁盘 | true, false |
| DeviceGuid | string | 设备 GUID | guid |
| Region | string | 区域 | chinaeast2 |
| DataCenter | string | 数据中心 | 数据中心名称 |

## 常用筛选字段

- `NodeId` - 按节点 ID 筛选
- `DriveSerialNumber` - 按磁盘序列号筛选
- `DriveBusType` - 按磁盘类型筛选

## 典型应用场景

1. **硬件故障定位**: 根据 SCSI 地址定位物理磁盘
2. **固件版本检查**: 确认磁盘固件版本
3. **与 WindowsStorageEvents 关联**: 通过 SCSI 地址关联存储事件
4. **磁盘库存查询**: 查看节点上的所有物理磁盘

## 示例查询

```kql
// 查询节点上的磁盘硬件信息
cluster('https://azuredcmmc.kusto.chinacloudapi.cn').database('AzureDcmDb').dcmInventoryComponentDisk
| where NodeId == "{nodeId}"
| project NodeId, SCSIPort, SCSIBus, SCSIAddress, SCSILUN, DriveSerialNumber, 
         DriveProductId, FirmwareRevision, DriveBusType, SystemDrive, DeviceGuid, 
         Region, DataCenter
```

```kql
// 综合查询：关联 WindowsStorageEvents 和磁盘硬件信息
let nodes = pack_array("{nodeId}");
let DaysAgo = time(2d);
let windows_events = cluster("azcore.chinanorth3.kusto.chinacloudapi.cn").database("Fa").WindowsEventTable
| where PreciseTimeStamp >= ago(DaysAgo)
| where NodeId in~(nodes)
| where ProviderName in~("Microsoft-Windows-StorPort", "stornvme", "Disk")
| where EventId in (11, 15, 129, 7, 51, 52, 157, 500)
| project PreciseTimeStamp, Cluster, NodeId, ProviderName, Channel, EventId, Description;
let storage_events = materialize(cluster("azcore.chinanorth3.kusto.chinacloudapi.cn").database("Fa").WindowsStorageEvents
| where PreciseTimeStamp > ago(DaysAgo)
| where NodeId in~(nodes)
| where ProviderName in~("Microsoft-Windows-StorPort", "stornvme")
| where EventId in (500, 504, 549, 505)
| extend SCSIAddress = toint(Target)
| extend SCSILUN = toint(Lun)
| extend SCSIPort = toint(Port)
| extend SCSIBus = toint(Path)
| join kind = inner (cluster("azuredcmmc.kusto.chinacloudapi.cn").database("AzureDcmDb").dcmInventoryComponentDisk 
  | extend DriveSerialNumber = trim(@"[^\w]+", DriveSerialNumber)
) on NodeId, SCSIPort, SCSIBus, SCSIAddress, SCSILUN
| project PreciseTimeStamp, EventId, Description, Cluster, NodeId, 
  DriveSerialNumber, DriveProductId, FirmwareRevision, DriveBusType, SystemDrive,
  DeviceGuid, Region, DataCenter, ProviderName, Channel
);
union storage_events, windows_events
| sort by PreciseTimeStamp asc, NodeId
```

## 常见磁盘错误事件 ID

| EventId | 说明 |
|---------|------|
| 7 | 磁盘坏块 |
| 11 | 磁盘控制器错误 |
| 15 | 磁盘命令失败 |
| 51 | 磁盘故障预警 |
| 52 | 磁盘故障 |
| 129 | 设备重置 |
| 157 | 磁盘意外移除 |

## 关联表

- WindowsStorageEvents - 存储事件（通过 SCSI 地址关联）
- WindowsEventTable - Windows 事件
- ResourceSnapshotHistoryV2 - 节点修复历史

## 注意事项

- 使用 SCSI 地址（Port, Bus, Address, LUN）进行精确匹配
- `DriveSerialNumber` 可能包含特殊字符，需要 trim 处理
- 此表常与 WindowsStorageEvents 进行 join 以获取完整的磁盘故障信息
- 仅 Event ID 7 和 51（磁盘编号 0-8）有意义
