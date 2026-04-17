---
name: AsyncQoSEvents
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: AKS 异步操作 QoS 事件，记录后台操作结果和性能指标
status: active
related_tables:
  - FrontEndQoSEvents
  - AsyncContextActivity
---

# AsyncQoSEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 AKS 异步操作的 QoS 事件，包括升级、扩缩容等后台操作的结果和性能指标。常与 `FrontEndQoSEvents` 联合查询。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| TIMESTAMP | datetime | 时间戳（别名） |
| insertionTime | datetime | 插入时间 |
| subscriptionID | string | 订阅 ID |
| resourceName | string | 集群名称 |
| resourceGroupName | string | 资源组 |
| operationID | string | 操作 ID |
| correlationID | string | 关联 ID |
| operationName | string | 操作名称 |
| suboperationName | string | 子操作名称（如 Upgrading, Scaling） |
| result | string | 操作结果 |
| resultType | int | 结果类型（0=成功） |
| resultCode | string | 结果代码（如 NodesNotReady） |
| resultSubCode | string | 结果子代码 |
| errorDetails | string | 错误详情 |
| agentPoolName | string | 节点池名称 |
| k8sCurrentVersion | string | 当前 K8s 版本 |
| k8sGoalVersion | string | 目标 K8s 版本 |
| propertiesBag | dynamic | 属性包（JSON，包含 LinuxAgentsCount 等） |
| namespace | string | CCP 命名空间 |
| fqdn | string | 集群 FQDN |
| region | string | 区域 |
| pod | string | Pod 名称 |
| UnderlayName | string | Underlay 名称 |
| Underlay | string | Underlay 信息 |
| expirationTime | datetime | 过期时间 |
| innerMessage | string | 内部消息 |
| clientApplicationID | string | 客户端应用 ID |

## 常用筛选字段

- `subscriptionID` - 按订阅筛选
- `resourceName` - 按集群名称筛选
- `correlationID` - 按关联 ID 筛选
- `operationName` - 按操作类型筛选
- `suboperationName` - 按子操作筛选
- `resultCode` - 按结果代码筛选

## 典型应用场景

1. **追踪升级操作** - 检查升级进度和错误
2. **追踪节点池扩缩容** - NodesNotReady 等错误
3. **查询操作失败原因** - errorDetails, resultCode
4. **统计操作错误** - 按区域、订阅统计

## 示例查询

### 查询操作历史
```kql
union FrontEndQoSEvents, AsyncQoSEvents
| where PreciseTimeStamp > ago(1d)
| where subscriptionID == "{subscription}" and resourceName == "{cluster}"
| where operationName notcontains "GET"
| project PreciseTimeStamp, correlationID, operationID, operationName, suboperationName,
         k8sCurrentVersion, k8sGoalVersion, result, resultCode, errorDetails
| sort by PreciseTimeStamp desc
```

### 查询 NodesNotReady 错误
```kql
AsyncQoSEvents
| where subscriptionID == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where suboperationName == "Upgrading"
| where resultCode == "NodesNotReady"
| extend bag = parse_json(propertiesBag)
| extend from_version = tostring(bag.k8sCurrentVersion)
| extend to_version = tostring(bag.k8sGoalVersion)
```

### 统计操作错误
```kql
AsyncQoSEvents
| where TIMESTAMP >= ago(3d)
| where resultType != 0
| where resultCode == "CreateRoleAssignmentError"
| summarize count() by subscriptionID, region
| sort by count_
```

### 查询 VMSS 扩缩容事件
```kql
AsyncQoSEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionID == "{subscription}"
| where resourceGroupName == "{resourceGroup}"
| where resourceName == "{cluster}"
| where operationName !contains "GET"
| extend Count = parse_json(tostring(parse_json(propertiesBag).LinuxAgentsCount))
| project insertionTime, PreciseTimeStamp, operationID, Count, operationName, suboperationName, 
         agentPoolName, result, errorDetails, resultCode, resultSubCode
```

## 关联表

- [FrontEndQoSEvents.md](./FrontEndQoSEvents.md) - 前端操作 QoS 事件
- [AsyncContextActivity.md](./AsyncContextActivity.md) - 异步操作详细日志

## 注意事项

- 与 `FrontEndQoSEvents` 联合查询可获取完整操作视图
- `propertiesBag` 字段包含额外信息，需要 `parse_json` 解析
- `resultType` 为 0 表示成功，非 0 表示失败
