---
name: disk-lifecycle
description: 磁盘生命周期事件查询
tables:
  - DiskRPResourceLifecycleEvent
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: diskName
    required: false
    description: 磁盘名称
  - name: startTime
    required: false
    default: ago(3d)
    description: 开始时间
  - name: endTime
    required: false
    default: now()
    description: 结束时间
---

# 磁盘生命周期事件查询

## 用途

查询磁盘的创建、删除、附加、分离等生命周期事件，追踪磁盘状态变化。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {diskName} | 否 | 磁盘名称 | mydisk |
| {startTime} | 否 | 开始时间 | 2025-01-01T00:00:00Z |
| {endTime} | 否 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询 1: 按磁盘名称查询生命周期事件

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent 
| where subscriptionId == "{subscription}"
| where resourceName has "{diskName}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| project PreciseTimeStamp, resourceGroupName, resourceName, diskEvent, stage, state, 
         blobUrl, diskOwner, storageAccountType, tier, diskSizeBytes
| order by PreciseTimeStamp asc
```

### 查询 2: 按 Blob URL 查询磁盘操作

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent 
| where subscriptionId == "{subscription}"
| where blobUrl contains "{blobPath}"
| where PreciseTimeStamp >= ago(3d)
| project PreciseTimeStamp, resourceGroupName, resourceName, diskOwner, blobUrl, diskEvent, stage
| order by PreciseTimeStamp asc
```

### 查询 3: 查看特定 VM 的磁盘附加/分离历史

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent 
| where subscriptionId == "{subscription}"
| where diskOwner contains "{vmName}"
| where diskEvent in ("Attach", "Detach")
| where PreciseTimeStamp >= ago(7d)
| project PreciseTimeStamp, resourceName, diskEvent, stage, state, diskOwner
| order by PreciseTimeStamp asc
```

### 查询 4: 统计磁盘操作类型

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= ago(7d)
| summarize count() by diskEvent, stage
| order by count_ desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| PreciseTimeStamp | 事件时间 |
| resourceGroupName | 资源组名称 |
| resourceName | 磁盘名称 |
| diskEvent | 事件类型 (Create, Delete, Attach, Detach) |
| stage | 操作阶段 (Start, Complete) |
| state | 磁盘状态 (Attached, Unattached) |
| blobUrl | Blob 存储 URL |
| diskOwner | 磁盘所有者 (VM ARM ID) |
| storageAccountType | 存储类型 |
| tier | 性能层级 |

## 事件类型说明

| diskEvent | 说明 |
|-----------|------|
| Create | 磁盘创建 |
| Delete | 磁盘删除 |
| Attach | 磁盘附加到 VM |
| Detach | 磁盘从 VM 分离 |
| Update | 磁盘更新 |

## 关联查询

- [disk-api-qos.md](./disk-api-qos.md) - API 调用追踪
- [disk-metadata.md](./disk-metadata.md) - 磁盘元数据
