---
name: capacity-allocation
description: 容量分配查询 - 排查分配失败和容量问题
tables:
  - ComputeAllocationActivity
  - LogAllocatableVmCountMetric
  - TMMgmtSlaMeasurementEventEtwTable
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: vmsize
    required: false
    description: VM 规格
  - name: region
    required: false
    description: 区域
  - name: cluster
    required: false
    description: 集群名称
  - name: starttime
    required: false
    default: ago(1d)
    description: 开始时间
  - name: endtime
    required: false
    default: now()
    description: 结束时间
---

# 容量分配查询

## 用途

排查 VM 分配失败问题，检查区域/集群容量状态。用于诊断 AllocationFailed 错误。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {vmsize} | 否 | VM 规格 | Standard_D2s_v3 |
| {region} | 否 | 区域 | chinanorth2 |
| {cluster} | 否 | 集群名称 | cluster-xxx |
| {starttime} | 否 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 否 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询分配活动

```kql
cluster('azureallocatormc.chinaeast2.kusto.chinacloudapi.cn').database('azureallocatormc').ComputeAllocationActivity
| where TIMESTAMP > ago(1d)
| where subscriptionId == "{subscription}"
| where vmSize == "{vmsize}"
| project TIMESTAMP, subscriptionId, region, vmSize, allocationResult, allocationErrorCode, 
         clusterName, availabilityZone
| order by TIMESTAMP desc
```

### 查询分配失败

```kql
cluster('azureallocatormc.chinaeast2.kusto.chinacloudapi.cn').database('azureallocatormc').ComputeAllocationActivity
| where TIMESTAMP > ago(1d)
| where subscriptionId == "{subscription}"
| where allocationResult != "Success"
| project TIMESTAMP, vmSize, region, allocationResult, allocationErrorCode, clusterName
| order by TIMESTAMP desc
```

### 查询节点可分配 VM 数量

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogAllocatableVmCountMetric
| where TIMESTAMP between (datetime({starttime})..datetime({endtime}))
| where Tenant == "{cluster}"
| summarize AvgAllocatable = avg(allocatableVmCount), 
            MinAllocatable = min(allocatableVmCount),
            MaxAllocatable = max(allocatableVmCount)
    by Tenant, bin(TIMESTAMP, 1h)
| order by TIMESTAMP desc
```

### 查询 SLA 测量事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtSlaMeasurementEventEtwTable
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where Tenant == "{cluster}"
| project PreciseTimeStamp, Tenant, SlaType, SlaValue, SlaTarget
| order by PreciseTimeStamp desc
```

### 按区域统计分配情况

```kql
cluster('azureallocatormc.chinaeast2.kusto.chinacloudapi.cn').database('azureallocatormc').ComputeAllocationActivity
| where TIMESTAMP > ago(7d)
| where region == "{region}"
| summarize TotalRequests = count(),
            SuccessCount = countif(allocationResult == "Success"),
            FailedCount = countif(allocationResult != "Success")
    by vmSize, bin(TIMESTAMP, 1d)
| extend SuccessRate = round(100.0 * SuccessCount / TotalRequests, 2)
| order by TIMESTAMP desc, vmSize
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| allocationResult | 分配结果 (Success/Failed) |
| allocationErrorCode | 分配错误代码 |
| clusterName | 分配到的集群名称 |
| allocatableVmCount | 可分配 VM 数量 |
| availabilityZone | 可用区 |

## 常见分配错误

| 错误码 | 说明 |
|--------|------|
| AllocationFailed | 通用分配失败 |
| OverconstrainedAllocationRequest | 约束过多无法分配 |
| ZonalAllocationFailed | 可用区分配失败 |
| SkuNotAvailable | SKU 不可用 |

## 变体查询

### 检查特定 VM 规格的可用性

```kql
cluster('azureallocatormc.chinaeast2.kusto.chinacloudapi.cn').database('azureallocatormc').ComputeAllocationActivity
| where TIMESTAMP > ago(24h)
| where region == "{region}"
| where vmSize == "{vmsize}"
| summarize TotalRequests = count(),
            SuccessCount = countif(allocationResult == "Success")
    by availabilityZone
| extend SuccessRate = round(100.0 * SuccessCount / TotalRequests, 2)
```

### 查询集群容量趋势

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogAllocatableVmCountMetric
| where TIMESTAMP > ago(7d)
| where Tenant == "{cluster}"
| summarize AvgAllocatable = avg(allocatableVmCount) by bin(TIMESTAMP, 1h)
| render timechart
```

## 关联查询

- [vm-operations.md](./vm-operations.md) - VM 操作查询
- [vmss-operations.md](./vmss-operations.md) - VMSS 操作查询
