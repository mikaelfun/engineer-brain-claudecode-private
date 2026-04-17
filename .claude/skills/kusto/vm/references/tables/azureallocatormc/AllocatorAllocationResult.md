---
name: AllocatorAllocationResult
database: azureallocatormc
cluster: https://azureallocatormc.chinaeast2.kusto.chinacloudapi.cn
description: VM 分配结果表，记录分配请求和结果
status: active
---

# AllocatorAllocationResult

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azureallocatormc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | azureallocatormc |
| 状态 | ✅ 可用 |

## 用途

记录 VM 分配请求和结果。用于排查 AllocationFailed 错误，了解分配约束和容量问题。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| subscriptionId | string | 订阅 ID |
| tenantName | string | 租户名称 |
| allocationId | string | 分配 ID |
| correlationId | string | 关联 ID |
| activityId | string | 活动 ID |
| allocationRequestType | string | 分配请求类型 |
| isSucceeded | bool | 是否成功 |
| containersRequested | long | 请求的容器数 |
| containersAllocated | long | 已分配的容器数 |
| totalTime | long | 总时间 (毫秒) |
| allocationFault | string | 分配故障 |
| AvailabilityZone | string | 可用区 |
| Region | string | 区域 |
| DataCenterName | string | 数据中心名称 |

## 示例查询

### 按订阅查询分配失败

```kql
cluster('azureallocatormc.chinaeast2.kusto.chinacloudapi.cn').database('azureallocatormc').AllocatorAllocationResult
| where TIMESTAMP > ago(1d)
| where subscriptionId == "{subscription}"
| where isSucceeded == false
| project PreciseTimeStamp, tenantName, allocationRequestType, isSucceeded, allocationFault, 
         containersRequested, containersAllocated, Region, AvailabilityZone
| order by PreciseTimeStamp desc
```

### 按关联 ID 查询

```kql
cluster('azureallocatormc.chinaeast2.kusto.chinacloudapi.cn').database('azureallocatormc').AllocatorAllocationResult
| where TIMESTAMP > ago(3d)
| where correlationId == "{correlationId}"
| project PreciseTimeStamp, allocationId, tenantName, isSucceeded, allocationFault, totalTime
```

## 相关表

| 表名 | 用途 |
|------|------|
| AllocatorTrace | 分配过程详细日志 |
| AllocatorServiceAllocationRejectionInfo | 分配拒绝原因 |
| AllocatorRejectedNodeInfo | 节点拒绝原因 |
| AllocatorRejectedClusterInfo | 集群拒绝原因 |

## 常见分配错误

| allocationFault | 说明 |
|-----------------|------|
| AllocationFailed | 通用分配失败 |
| OverconstrainedAllocationRequest | 约束过多无法分配 |
| ZonalAllocationFailed | 可用区分配失败 |
| SkuNotAvailable | SKU 不可用 |
