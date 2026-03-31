---
name: AsyncContextActivity
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: AKS 异步操作上下文活动日志，记录后台操作的详细执行过程
status: active
related_tables:
  - FrontEndContextActivity
  - AsyncQoSEvents
---

# AsyncContextActivity

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 AKS 异步后台操作的详细执行过程，包括升级、扩缩容、节点池操作等。特别适用于追踪 VMSS CSE 执行结果。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| subscriptionID | string | 订阅 ID |
| resourceName | string | 集群名称 |
| resourceGroupName | string | 资源组名称 |
| operationID | string | 操作 ID |
| correlationID | string | 关联 ID |
| level | string | 日志级别 (info/warning/error) |
| msg | string | 消息内容 |
| suboperationName | string | 子操作名称 |
| operationName | string | 操作名称 |
| namespace | string | CCP 命名空间 |
| region | string | 区域 |

## 常用筛选字段

- `subscriptionID` - 按订阅筛选
- `resourceName` - 按集群名称筛选
- `operationID` - 按操作 ID 筛选
- `level` - 按日志级别筛选
- `msg` - 按消息内容搜索

## 典型应用场景

1. **查询 VMSS CSE 执行结果** - 搜索 vmssCSE exit code
2. **追踪异步操作详情** - 升级、扩缩容过程
3. **诊断节点加入失败** - 查看 agentpool 相关日志
4. **分析操作失败原因** - 查看详细错误消息

## 示例查询

### 按 OperationID 查询详细日志
```kql
union FrontEndContextActivity, AsyncContextActivity
| where PreciseTimeStamp > ago(2h)
| where operationID contains '{operationId}'
| project PreciseTimeStamp, msg, level
| sort by PreciseTimeStamp desc
```

### 查询 VMSS CSE 执行结果
```kql
AsyncContextActivity
| where PreciseTimeStamp > ago(5d)
| where subscriptionID == "{subscription}"
| where msg contains "agentpool"
| project PreciseTimeStamp, msg, level, operationID
| where msg contains "vmssCSE exit code : "
// 过滤非零 exit code
// | where msg !contains "vmssCSE exit code : 0"
```

### 查询升级/扩缩容操作日志
```kql
union FrontEndContextActivity, AsyncContextActivity
| where subscriptionID == "{subscription}"
| where resourceName contains "{cluster}"
| where msg contains "intent" or msg contains "Upgrading" or msg contains "Successfully upgraded cluster" 
    or msg contains "Operation succeeded" or msg contains "validateAndUpdateOrchestratorProfile"
| where PreciseTimeStamp > ago(1d)
| project PreciseTimeStamp, operationID, correlationID, level, suboperationName, msg
| sort by PreciseTimeStamp desc
```

### 查询错误和警告
```kql
AsyncContextActivity
| where PreciseTimeStamp > ago(1d)
| where subscriptionID == "{subscription}"
| where level != "info"
| project PreciseTimeStamp, operationID, level, msg
| sort by PreciseTimeStamp desc
```

## 关联表

- [FrontEndContextActivity.md](./FrontEndContextActivity.md) - 前端上下文活动
- [AsyncQoSEvents.md](./AsyncQoSEvents.md) - 异步操作 QoS 事件

## VMSS CSE Exit Code 说明

| Exit Code | 说明 |
|-----------|------|
| 0 | 成功 |
| 1-49 | 一般错误 |
| 50 | kubelet 启动失败 |
| 51 | 无法下载 kubelet |
| 52 | 无法连接到 API Server |

## 注意事项

- VMSS CSE (Custom Script Extension) 日志对于诊断节点加入失败非常重要
- 建议与 `FrontEndContextActivity` 联合查询以获取完整操作日志
- 对于 VMSS 相关问题，还需结合 CRP 和 GuestAgent 日志
