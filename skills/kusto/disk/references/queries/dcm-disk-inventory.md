---
name: dcm-disk-inventory
description: DCM 主机磁盘硬件库存查询
tables:
  - dcmInventoryComponentDiskDirect
parameters:
  - name: nodeId
    required: true
    description: 主机节点 ID
  - name: cluster
    required: false
    description: 集群名称
---

# DCM 主机磁盘硬件库存查询

## 用途

查询主机物理磁盘硬件信息，分析磁盘故障和健康状态。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {nodeId} | 是 | 主机节点 ID | guid |
| {cluster} | 否 | 集群名称 | cluster-xxx |

## 查询语句

### 查询 1: 节点物理磁盘清单

```kql
let nodeIdFilter = "{nodeId}";
cluster('https://azuredcmmc.kusto.chinacloudapi.cn').database('AzureDcmDb').dcmInventoryComponentDiskDirect
| where NodeId == nodeIdFilter
| project NodeId, Model, SerialNumber, Size, MediaType, BusType, FirmwareVersion, HealthStatus
```

### 查询 2: 集群磁盘故障统计

```kql
cluster('https://azuredcmmc.kusto.chinacloudapi.cn').database('AzureDcmDb').dcmInventoryComponentDiskDirect
| where cluster == "{cluster}"
| where HealthStatus != "Healthy"
| summarize FaultCount = count() by HealthStatus, Model
| order by FaultCount desc
```

### 查询 3: 结合主机事件的磁盘故障分析

```kql
// 需要先从 WindowsStorageEvents 获取可疑节点，再联合 DCM 查询
let faultNodes = 
    cluster('https://azuredcmmc.kusto.chinacloudapi.cn').database('AzureDcmDb').WindowsStorageEvents
    | where PreciseTimeStamp >= ago(1d)
    | where EventLevel in ("Error", "Warning")
    | where EventMessage has "disk" or EventMessage has "storage"
    | summarize count() by NodeId
    | where count_ > 5
    | project NodeId;
cluster('https://azuredcmmc.kusto.chinacloudapi.cn').database('AzureDcmDb').dcmInventoryComponentDiskDirect
| where NodeId in (faultNodes)
| project NodeId, Model, SerialNumber, HealthStatus, Size
```

### 查询 4: 磁盘型号分布

```kql
cluster('https://azuredcmmc.kusto.chinacloudapi.cn').database('AzureDcmDb').dcmInventoryComponentDiskDirect
| where cluster == "{cluster}"
| summarize DiskCount = count() by Model, MediaType
| order by DiskCount desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| NodeId | 主机节点 ID |
| Model | 磁盘型号 |
| SerialNumber | 序列号 |
| Size | 磁盘容量 |
| MediaType | 介质类型 (SSD, HDD) |
| BusType | 总线类型 (SATA, NVMe, SAS) |
| HealthStatus | 健康状态 |
| FirmwareVersion | 固件版本 |

## 健康状态说明

| 状态 | 说明 |
|------|------|
| Healthy | 正常 |
| Warning | 警告 (可能有潜在问题) |
| Unhealthy | 不健康 |
| Unknown | 状态未知 |

## 常见故障码

参考 DCM 磁盘故障码文档：
- `0x1` - 读取错误
- `0x2` - 写入错误
- `0x4` - 固件问题
- `0x8` - 连接问题

## 关联查询

- [io-errors.md](./io-errors.md) - IO 错误详情
- [disk-metadata.md](./disk-metadata.md) - 托管磁盘元数据
