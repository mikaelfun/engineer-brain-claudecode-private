---
name: dcmInventoryComponentDiskDirect
database: AzureDCMDb
cluster: https://azuredcmmc.kusto.chinacloudapi.cn
description: DCM 磁盘组件清单表，记录节点磁盘硬件信息
status: active
---

# dcmInventoryComponentDiskDirect

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azuredcmmc.kusto.chinacloudapi.cn |
| 数据库 | AzureDcmDb |
| 实际表名 | dcmInventoryComponentDiskDirect |
| 状态 | ✅ 可用 |

## 用途

记录节点磁盘硬件清单信息，包括序列号、产品 ID、固件版本等。用于硬件故障排查。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| NodeId | string | 节点 ID |
| DataCollectedOn | datetime | 数据收集时间 |
| SCSIPort | int | SCSI 端口 |
| SCSIBus | int | SCSI 总线 |
| SCSIAddress | int | SCSI 地址 |
| SCSILUN | int | SCSI LUN |
| DriveSerialNumber | string | 磁盘序列号 |
| DriveProductId | string | 磁盘产品 ID |
| FirmwareRevision | string | 固件版本 |
| DriveBusType | string | 驱动总线类型 |
| SystemDrive | int | 是否系统盘 (1=是) |
| DeviceGuid | string | 设备 GUID |
| Region | string | 区域 |
| DataCenter | string | 数据中心 |

## 示例查询

### 查询节点磁盘信息

```kql
cluster("https://azuredcmmc.kusto.chinacloudapi.cn").database("AzureDcmDb").dcmInventoryComponentDiskDirect
| where DataCollectedOn >= ago(3d)
| where NodeId == "{nodeId}"
| summarize arg_max(DataCollectedOn, *) by DriveSerialNumber
| project NodeId, SCSIPort, SCSIBus, SCSIAddress, SCSILUN, DriveSerialNumber, DriveProductId, 
         FirmwareRevision, DriveBusType, SystemDrive, Region
```

### 查询集群系统盘

```kql
cluster("https://azuredcmmc.kusto.chinacloudapi.cn").database("AzureDcmDb").dcmInventoryComponentDiskDirect
| where DataCollectedOn >= ago(3d)
| where ClusterId in~ ("{clusterId}")
| summarize arg_max(DataCollectedOn, *) by DriveSerialNumber
| where SystemDrive == 1
| join kind=inner cluster("azuredcmmc.kusto.chinacloudapi.cn").database('AzureDcmDb').dcmInventoryGenerationMappingV3 on NodeId
| project ClusterType, Cluster=ClusterId, NodeId, DriveSerialNumber, DriveProductId, RegionId, CloudName
```

## 关联表

- [ResourceSnapshotHistoryV1.md](./ResourceSnapshotHistoryV1.md) - 节点状态历史
- [RdmResourceSnapshot](.) - 节点资源快照
