---
name: VmssQoSEvent
database: crp_allmc
cluster: https://azcrpmc.kusto.chinacloudapi.cn
description: VMSS QoS 事件，记录 VMSS 级别操作的性能和结果
status: active
---

# VmssQoSEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcrpmc.kusto.chinacloudapi.cn |
| 数据库 | crp_allmc |
| 状态 | ✅ 可用 |

## 用途

记录 VMSS 级别操作的 QoS 事件，包含目标实例数、错误代码、扩展信息等。用于排查 VMSS 扩缩容、部署等问题。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| subscriptionId | string | 订阅 ID |
| resourceGroupName | string | 资源组 |
| vmssName | string | VMSS 名称 |
| operationId | string | 操作 ID |
| operationName | string | 操作名称 |
| oSType | string | 操作系统类型 |
| availabilitySetCount | int | 可用性集数量 |
| targetInstanceCount | int | 目标实例数 |
| vMCountDelta | int | VM 数量变化 |
| e2EDurationSeconds | long | 端到端持续时间 (秒) |
| extensionNamesCsv | string | 扩展名称 (CSV 格式) |
| predominantErrorCode | string | 主要错误代码 |
| predominantErrorDetail | string | 主要错误详情 |
| predominantExceptionType | string | 主要异常类型 |
| image | string | 镜像信息 |
| resultType | string | 结果类型 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `vmssName` - 按 VMSS 名称筛选
- `operationId` - 按操作 ID 筛选
- `predominantErrorCode` - 按错误代码筛选

## 典型应用场景

1. **VMSS 扩缩容监控** - 监控 Cluster Autoscaler PUT 请求
2. **VMSS 部署失败排查** - 获取主要错误代码和详情
3. **性能分析** - 分析 VMSS 操作持续时间
4. **磁盘操作追踪** - 追踪 attach/detach 操作

## 示例查询

### 查询 VMSS QoS 事件

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssQoSEvent
| where TIMESTAMP > ago(3h)
| where subscriptionId == "{sub}"
| where vmssName contains "{vmssname}"
| order by TIMESTAMP asc
| project TIMESTAMP, vmssName, operationName, operationId, image, targetInstanceCount, 
         predominantErrorCode, predominantErrorDetail
```

### 查询 VMSS 错误事件

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssQoSEvent
| where PreciseTimeStamp >= ago(14d)
| where subscriptionId == "{sub}"
| where vmssName contains "{vmssname}"
| where predominantErrorDetail != ""
| project PreciseTimeStamp, vmssName, operationId, resourceGroupName, predominantErrorDetail, 
         predominantErrorCode, operationName
```

### 监控 Cluster Autoscaler PUT 请求

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssQoSEvent
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where subscriptionId == '{sub}'
| where resourceGroupName contains "{resourceGroup}"
| where vmssName contains "{vmss}"
| where operationName == "VirtualMachineScaleSets.ResourceOperation.PUT"
| project PreciseTimeStamp, operationName, operationId, vmssName, oSType, targetInstanceCount, 
         vMCountDelta, e2EDurationSeconds, extensionNamesCsv, predominantErrorCode, predominantErrorDetail
| order by PreciseTimeStamp desc
```

### 查询磁盘挂载/卸载操作

```kql
// 注意：labels 字段来自 ApiQosEvent，通过 join 获取
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssQoSEvent
| where TIMESTAMP > ago(1d)
| where image contains "aks" and subscriptionId == "{sub}"
| join (
    cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent 
    | where TIMESTAMP > ago(2d)
    | where resultType == 0
) on operationId
| where labels contains "attach" or labels contains "detach"
| extend opName = iff(labels contains "attach", "AttachDisk", "DetachDisk")
| project TIMESTAMP, opName, e2EDurationSeconds, resourceGroupName, vmssName
```

## 关联表

- [ApiQosEvent.md](./ApiQosEvent.md) - 联合查询获取更多详情
- [VmssVMGoalSeekingActivity.md](./VmssVMGoalSeekingActivity.md) - 实例级别日志
- [VMApiQosEvent.md](./VMApiQosEvent.md) - VM 实例详细信息

## 注意事项

- 这是 VMSS 级别的聚合事件，单个实例的详情需查询 VmssVMGoalSeekingActivity
- `predominantErrorCode` 是最常见的错误，不是唯一的错误
- 使用 `operationId` 可关联其他表进行深入分析
