---
name: FrontEndQoSEvents
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: AKS 前端操作 QoS 事件，记录操作结果和性能指标
status: active
related_tables:
  - AsyncQoSEvents
  - FrontEndContextActivity
---

# FrontEndQoSEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 AKS 前端操作的 QoS 事件，包含操作结果和性能指标。常与 `AsyncQoSEvents` 联合查询。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| insertionTime | datetime | 插入时间 |
| subscriptionID | string | 订阅 ID |
| resourceName | string | 集群名称 |
| resourceGroupName | string | 资源组 |
| operationID | string | 操作 ID |
| correlationID | string | 关联 ID |
| operationName | string | 操作名称 |
| suboperationName | string | 子操作名称 |
| result | string | 操作结果 |
| resultType | int | 结果类型（0=成功） |
| resultCode | string | 结果代码 |
| resultSubCode | string | 结果子代码 |
| errorDetails | string | 错误详情 |
| agentPoolName | string | 节点池名称 |
| k8sCurrentVersion | string | 当前 K8s 版本 |
| k8sGoalVersion | string | 目标 K8s 版本 |
| propertiesBag | dynamic | 属性包（JSON） |
| region | string | 区域 |
| pod | string | Pod 名称 |
| UnderlayName | string | Underlay 名称 |
| userAgent | string | 用户代理 |

## 常用筛选字段

- `subscriptionID` - 按订阅筛选
- `resourceName` - 按集群名称筛选
- `correlationID` - 按关联 ID 筛选
- `operationName` - 按操作类型筛选

## 典型应用场景

1. **查询集群操作** - 创建、升级、删除等
2. **追踪节点池扩缩容** - NodesNotReady 等错误
3. **查询维护配置操作** - MaintenanceConfiguration
4. **监控 Azure Policy 操作** - Image Integrity 等

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

## 关联表

- [AsyncQoSEvents.md](./AsyncQoSEvents.md) - 异步操作 QoS 事件
- [FrontEndContextActivity.md](./FrontEndContextActivity.md) - 详细执行日志
