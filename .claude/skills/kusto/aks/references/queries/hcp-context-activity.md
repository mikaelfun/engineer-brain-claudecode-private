---
name: hcp-context-activity
description: HCP 上下文活动日志查询
tables:
  - HcpSyncContextActivity
  - FrontEndContextActivity
  - AsyncContextActivity
parameters:
  - subscription: 订阅 ID
  - resourceGroup: 资源组
  - clusterName: 集群名称
  - operationId: 操作 ID
  - correlationId: 关联 ID
---

# HCP 上下文活动日志

## 用途

查询 HCP (Hosted Control Plane) 组件的上下文活动日志，用于诊断控制平面操作问题。

## 使用场景

1. **Token 操作追踪** - 诊断认证相关问题
2. **HCP 组件操作** - 追踪控制平面组件活动
3. **综合操作分析** - 结合多个表进行完整操作追踪

## 查询 1: 按 OperationID 查询 HCP 活动

```kql
HcpSyncContextActivity
| where operationID == "{operationId}"
| where PreciseTimeStamp > ago(3d)
| project PreciseTimeStamp, level, msg
| order by PreciseTimeStamp desc
```

## 查询 2: 按订阅和集群查询

```kql
HcpSyncContextActivity
| where TIMESTAMP >= ago(1d)
| where subscriptionID has '{subscription}'
| where resourceGroupName has '{resourceGroup}'
| where resourceName has '{clusterName}'
| where operationName notcontains "GET"
| extend Message = parse_json(msg)
| project PreciseTimeStamp, level, msg
| order by PreciseTimeStamp desc
```

## 查询 3: 综合查询多个表

```kql
union FrontEndQoSEvents, FrontEndContextActivity, AsyncQoSEvents, AsyncContextActivity, 
      HcpSyncContextActivity
| where PreciseTimeStamp > ago(1d)
| where correlationID == "{correlationId}"
| project PreciseTimeStamp, level, msg, operationName, operationID
| order by PreciseTimeStamp desc
```

## 查询 4: HCP 错误日志

```kql
HcpSyncContextActivity
| where PreciseTimeStamp > ago(1d)
| where subscriptionID has '{subscription}'
| where resourceName has '{clusterName}'
| where level == "error"
| project PreciseTimeStamp, operationName, msg, operationID, correlationID
| order by PreciseTimeStamp desc
```

## 查询 5: HCP 操作时间线

```kql
HcpSyncContextActivity
| where operationID == "{operationId}"
| where PreciseTimeStamp > ago(3d)
| project PreciseTimeStamp, operationName, suboperationName, level, msg
| order by PreciseTimeStamp asc
```

## 表说明

| 表名 | 用途 |
|------|------|
| HcpSyncContextActivity | HCP 同步操作日志 |
| FrontEndContextActivity | 前端上下文活动 |
| AsyncContextActivity | 异步上下文活动 |

## 注意事项

- 源文档中提到的 `HcpAsyncContextActivity` 表实际不存在，请使用 `HcpSyncContextActivity`
- HCP 表与 FrontEnd/Async 表结构类似，可以联合查询
- 使用 `operationID` 或 `correlationID` 进行关联查询
- 错误日志通常 level == "error"
