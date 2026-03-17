---
name: FrontEndContextActivity
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: AKS 前端操作上下文活动日志，记录 API 请求的详细执行过程
status: active
related_tables:
  - AsyncContextActivity
  - FrontEndQoSEvents
---

# FrontEndContextActivity

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 AKS 前端 API 请求的详细执行过程和上下文日志。用于追踪操作执行细节、错误诊断。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| subscriptionID | string | 订阅 ID |
| resourceName | string | 集群名称 |
| resourceGroupName | string | 资源组名称 |
| operationID | string | 操作 ID（用于关联操作） |
| correlationID | string | 关联 ID（用于跨服务追踪） |
| level | string | 日志级别 (info/warning/error) |
| msg | string | 消息内容（JSON 格式） |
| suboperationName | string | 子操作名称 |
| operationName | string | 操作名称 |
| clientRequestID | string | 客户端请求 ID |
| userAgent | string | 用户代理 |
| clientPrincipalName | string | 客户端主体名称 |
| namespace | string | CCP 命名空间 |
| targetURI | string | 目标 URI |
| region | string | 区域 |
| fileName | string | 源文件名 |
| code | string | 错误代码（从 msg 解析） |

## 常用筛选字段

- `subscriptionID` - 按订阅筛选
- `resourceName` - 按集群名称筛选
- `operationID` - 按操作 ID 筛选
- `correlationID` - 按关联 ID 筛选
- `level` - 按日志级别筛选

## 典型应用场景

1. **查询操作详细日志** - 使用 operationID 获取完整执行过程
2. **查询错误和警告** - 筛选 level != "info"
3. **追踪 VMSS CSE 执行** - 查看 CustomScriptExtension 执行结果
4. **诊断操作失败原因** - 查看详细错误消息

## 示例查询

### 按 OperationID 查询详细日志
```kql
union FrontEndContextActivity, AsyncContextActivity
| where PreciseTimeStamp > ago(2h)
| where operationID contains '{operationId}'
| project PreciseTimeStamp, msg, level
| sort by PreciseTimeStamp desc
```

### 查询错误和警告消息
```kql
union FrontEndContextActivity, AsyncContextActivity
| where subscriptionID == "{subscription}"
| where resourceName contains "{cluster}"
| where level != "info"
| where PreciseTimeStamp > ago(1d)
| project PreciseTimeStamp, operationID, correlationID, level, suboperationName, msg
| sort by PreciseTimeStamp desc
```

### 查询操作执行细节
```kql
FrontEndContextActivity
| where PreciseTimeStamp > ago(3d)
| where subscriptionID has '{subscription}'
| where operationID == "{operationId}"
| where operationName notcontains "GET"
| extend Message = parse_json(msg)
| project PreciseTimeStamp, level, code=tostring(Message.code), suboperationName, msg, 
         operationName, operationID, correlationID, region, fileName, resourceName, 
         resourceGroupName, subscriptionID
| sort by PreciseTimeStamp asc
```

### 综合查询多个表
```kql
union FrontEndQoSEvents, FrontEndContextActivity, AsyncQoSEvents, AsyncContextActivity, 
      HcpSyncContextActivity, HcpAsyncContextActivity 
| where PreciseTimeStamp > ago(1d)
| where correlationID == "{correlationId}"
// 或使用 operationID
// | where operationID == "{operationId}"
```

## 关联表

- [AsyncContextActivity.md](./AsyncContextActivity.md) - 异步操作上下文活动
- [FrontEndQoSEvents.md](./FrontEndQoSEvents.md) - 前端 QoS 事件

## 注意事项

- `msg` 字段通常包含 JSON 格式的详细信息，可使用 `parse_json` 解析
- 建议与 `AsyncContextActivity` 联合查询以获取完整操作日志
- `level` 字段值: info, warning, error
