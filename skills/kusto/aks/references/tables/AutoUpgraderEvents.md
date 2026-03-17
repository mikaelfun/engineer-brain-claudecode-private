---
name: AutoUpgraderEvents
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: AKS 自动升级事件，记录自动升级操作
status: active
related_tables:
  - RegionalLooperEvents
---

# AutoUpgraderEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 AKS 自动升级器的事件，用于追踪自动升级操作和维护窗口执行情况。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| subscriptionID | string | 订阅 ID |
| resourceGroupName | string | 资源组名称 |
| resourceName | string | 集群名称 |
| level | string | 日志级别 |
| msg | string | 消息内容 |

## 常用筛选字段

- `subscriptionID` - 按订阅筛选
- `resourceName` - 按集群名称筛选
- `msg` - 按消息内容搜索

## 典型应用场景

1. **追踪自动升级** - 查看自动升级执行情况
2. **匹配维护窗口** - 验证维护窗口内的升级操作
3. **诊断升级问题** - 分析自动升级失败原因

## 示例查询

### 查询自动升级事件
```kql
AutoUpgraderEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionID == "{subscription}"
| where msg !contains "Is upgrader running: true" and msg !contains "Is operation count cache running: true"
    and msg !contains "upgrader healthz returns: true" and msg !contains "auto-upgrade-operation-count-cache-sync-interval"
| project PreciseTimeStamp, level, msg, resourceName, resourceGroupName
| sort by PreciseTimeStamp desc
```

### 查询特定集群的升级事件
```kql
AutoUpgraderEvents
| where PreciseTimeStamp > ago(1d)
| where subscriptionID =~ '{subscription}'
| where resourceName has "{cluster}"
| project PreciseTimeStamp, level, msg
```

## 关联表

- [RegionalLooperEvents.md](./RegionalLooperEvents.md) - 区域循环事件
- [FrontEndQoSEvents.md](./FrontEndQoSEvents.md) - 操作 QoS 事件

## 注意事项

- 过滤健康检查消息可减少噪音
- 与 `FrontEndQoSEvents` 结合可获取完整升级操作视图
