---
name: ApiQosEvent
database: crp_allmc
cluster: https://azcrpmc.kusto.chinacloudapi.cn
description: CRP API 服务质量事件，记录所有 VM/VMSS 操作的结果
status: active
---

# ApiQosEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcrpmc.kusto.chinacloudapi.cn |
| 数据库 | crp_allmc |
| 状态 | ✅ 可用 |

## 用途

记录 VM/VMSS 的所有 API 操作结果，是排查 CRP 层问题的入口表。包含操作名称、结果码、错误详情等关键信息。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 操作完成时间 |
| TIMESTAMP | datetime | 时间戳 |
| subscriptionId | string | 订阅 ID |
| resourceGroupName | string | 资源组名称 |
| resourceName | string | 资源名称 (VM/VMSS) |
| operationId | string | 操作 ID (用于查询 ContextActivity) |
| correlationId | string | 关联 ID (从 Portal 活动日志获取) |
| operationName | string | 操作名称 (如 VirtualMachines.Start) |
| httpStatusCode | int | HTTP 状态码 |
| resultCode | string | 结果代码 (如 AllocationFailed) |
| resultType | int | 结果类型 (0=成功) |
| errorDetails | string | 错误详情 |
| region | string | 区域 |
| clientPrincipalName | string | 客户端主体名称 |
| clientApplicationId | string | 客户端应用 ID |
| userAgent | string | 用户代理 |
| e2EDurationInMilliseconds | long | 端到端持续时间 (毫秒) |
| requestEntity | string | 请求实体 (JSON) |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `operationId` - 按操作 ID 筛选
- `resourceName` - 按资源名称筛选
- `operationName` - 按操作类型筛选
- `resultCode` - 按结果代码筛选

## 典型应用场景

1. **查询操作结果** - 获取 VM 操作的成功/失败状态
2. **获取 operationId** - 用于后续查询 ContextActivity
3. **排查失败原因** - 从 resultCode/errorDetails 获取错误信息
4. **审计操作历史** - 追踪 VM 的所有操作

## 示例查询

### 按 correlationId 查询操作

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where TIMESTAMP > ago(2d)
| where correlationId == "{correlationId}" 
| where operationName notcontains "GET"
| project PreciseTimeStamp, operationId, correlationId, clientPrincipalName, operationName, 
         resourceGroupName, resourceName, httpStatusCode, resultCode, errorDetails, region, 
         userAgent, clientApplicationId, subscriptionId, requestEntity
| order by PreciseTimeStamp asc
```

### 按资源 URI 查询

```kql
let uri="/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/{vmname}";
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where PreciseTimeStamp between(datetime({starttime})..datetime({endtime})) 
| where subscriptionId == split(uri,"/")[2] and resourceName contains split(uri,"/")[8]
| where operationName notcontains "GET"
| order by PreciseTimeStamp asc
| extend startTime=PreciseTimeStamp-e2EDurationInMilliseconds*1ms
| project startTime, PreciseTimeStamp, resourceName, operationName, resultCode, httpStatusCode, 
         operationId, correlationId, region, errorDetails
```

### 查询 VM 开关机历史

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where TIMESTAMP > ago(7d)
| where subscriptionId == "{sub}"
| where resourceName =~ "{vmname}"
| where operationName has_any ("start", "stop", "restart", "deallocate", "powerOff", "powerOn")
| project PreciseTimeStamp, operationName, resourceName, httpStatusCode, resultCode, errorDetails, 
         correlationId, clientPrincipalName
| order by PreciseTimeStamp desc
```

### 查询特定错误码

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where TIMESTAMP > ago(2d)
| where subscriptionId == "{sub}"
| where resultCode == "AllocationFailed" or resultCode == "OSProvisioningTimedOut"
| project PreciseTimeStamp, resourceName, operationName, resultCode, errorDetails, correlationId
| order by PreciseTimeStamp desc
```

## 关联表

- [ContextActivity.md](./ContextActivity.md) - 使用 operationId 查询详细日志
- [VmssQoSEvent.md](./VmssQoSEvent.md) - VMSS 级别事件
- [VMApiQosEvent.md](./VMApiQosEvent.md) - 含 VM 模型的事件

## 注意事项

- `ApiQosEvent` 包含所有操作 (含 GET)，排查问题时通常过滤 `operationName notcontains "GET"`
- 也可使用 `ApiQosEvent_nonGet` 表直接查询非 GET 操作
- `operationId` 对应 ContextActivity 表的 `activityId`
