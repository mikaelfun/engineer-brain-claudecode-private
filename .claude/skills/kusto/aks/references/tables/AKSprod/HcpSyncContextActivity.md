---
name: HcpSyncContextActivity
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: HCP 同步上下文活动日志，记录 HCP 组件的同步操作
status: active
---

# HcpSyncContextActivity

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 HCP (Hosted Control Plane) 组件的同步操作活动，包含 Token 操作、API 调用等详细日志。常与 `HcpAsyncContextActivity` 联合查询。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| subscriptionID | string | 订阅 ID |
| resourceGroupName | string | 资源组 |
| resourceName | string | 集群名称 |
| operationID | string | 操作 ID |
| operationName | string | 操作名称 |
| suboperationName | string | 子操作名称 |
| correlationID | string | 关联 ID |
| hcpOperationID | string | HCP 操作 ID |
| controlPlaneID | string | 控制平面 ID |
| msg | string | 消息内容 |
| level | string | 日志级别 |
| httpMethod | string | HTTP 方法 |
| targetURI | string | 目标 URI |

## 常用筛选字段

- `subscriptionID` - 按订阅筛选
- `resourceName` - 按集群名称筛选
- `operationID` - 按操作 ID 筛选
- `correlationID` - 按关联 ID 筛选

## 示例查询

### 按 OperationID 查询 Token 操作
```kql
union HcpSyncContextActivity, HcpAsyncContextActivity
| where operationID == "{operationId}"
| where PreciseTimeStamp > ago(3d)
| project PreciseTimeStamp, level, msg
| order by PreciseTimeStamp desc
```

### 按订阅和集群查询
```kql
HcpSyncContextActivity
| where TIMESTAMP >= ago(1d)
| where subscriptionID has '{subscription}'
| where resourceGroupName has '{resourceGroup}'
| where resourceName has '{clusterName}'
| where operationName notcontains "GET"
| extend Message = parse_json(msg)
| project PreciseTimeStamp, level, msg
```

## 关联表

- [FrontEndContextActivity.md](./FrontEndContextActivity.md) - 前端上下文活动
- [AsyncContextActivity.md](./AsyncContextActivity.md) - 异步上下文活动
- [HcpSyncQoSEvents](.) - HCP 同步 QoS 事件（未建文档）

## 注意事项

- 可结合 `FrontEndContextActivity` 和 `AsyncContextActivity` 进行综合分析
- 注意：源文档中提到的 `HcpAsyncContextActivity` 实际不存在，请使用 `HcpSyncContextActivity`
