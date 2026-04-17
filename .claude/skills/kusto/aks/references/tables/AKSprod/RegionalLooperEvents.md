---
name: RegionalLooperEvents
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: 区域循环事件，记录自动升级入队和区域级循环操作
status: active
---

# RegionalLooperEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录区域级别的循环事件，主要用于自动升级入队消息追踪。与 `AutoUpgraderEvents` 配合使用诊断自动升级问题。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| msg | string | 消息内容 |
| error | string | 错误信息 |
| level | string | 日志级别 |
| region | string | 区域 |
| looperActionName | string | 循环操作名称 |
| looperLoopName | string | 循环名称 |
| targetURI | string | 目标资源 URI |
| subscriptionID | string | 订阅 ID |
| operationID | string | 操作 ID |
| correlationID | string | 关联 ID |
| Environment | string | 环境 |

## 常用筛选字段

- `msg` - 按消息内容筛选（如包含资源 URI）
- `region` - 按区域筛选
- `looperActionName` - 按循环操作名称筛选

## 典型应用场景

1. **追踪自动升级入队** - 确认集群是否被加入升级队列
2. **诊断区域级操作** - 分析区域范围的循环任务
3. **错误排查** - 查找循环操作中的错误

## 示例查询

### 查询升级入队消息
```kql
RegionalLooperEvents
| where PreciseTimeStamp > ago(1d)
| where msg contains "Enqueuing message" and msg has "{resourceURI}"
| project PreciseTimeStamp, msg, error, Environment
```

### 查询特定区域的循环事件
```kql
RegionalLooperEvents
| where PreciseTimeStamp > ago(1d)
| where region == "chinaeast2"
| where level == "error" or isnotempty(error)
| project PreciseTimeStamp, looperActionName, looperLoopName, msg, error
| order by PreciseTimeStamp desc
```

## 关联表

- [AutoUpgraderEvents.md](./AutoUpgraderEvents.md) - 自动升级事件
- [AsyncQoSEvents.md](./AsyncQoSEvents.md) - 异步 QoS 事件

## 注意事项

- 此表记录的是区域级别的循环操作，不是单个集群的操作
- 查询升级入队时需要使用完整的资源 URI
