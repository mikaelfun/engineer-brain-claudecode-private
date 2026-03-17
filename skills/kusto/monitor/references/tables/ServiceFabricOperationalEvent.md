---
name: ServiceFabricOperationalEvent
database: AzureAlertsManagement
cluster: https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn
description: Service Fabric 操作事件日志
status: active
---

# ServiceFabricOperationalEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | AzureAlertsManagement |
| 状态 | ✅ 可用 |

## 用途

记录 Azure Alerts Management 平台底层 Service Fabric 的操作事件，用于：
- 监控 Service Fabric 集群健康
- 诊断服务副本问题
- 追踪集群操作事件

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 记录时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Tenant | string | 租户 |
| Role | string | 角色 |
| RoleInstance | string | 角色实例 |
| Level | long | 日志级别 |
| ProviderGuid | string | 提供程序 GUID |
| ProviderName | string | 提供程序名称 |
| EventId | long | 事件 ID |
| Pid | long | 进程 ID |
| Tid | long | 线程 ID |
| OpcodeName | string | 操作码名称 |
| KeywordName | string | 关键字名称 |
| TaskName | string | 任务名称 |
| ChannelName | string | 通道名称 |
| EventMessage | string | 事件消息 |
| ActivityId | string | 活动 ID |
| Message | string | 消息内容 |

## 常用筛选字段

- `PreciseTimeStamp` - 按时间筛选
- `Level` - 按日志级别筛选
- `TaskName` - 按任务名称筛选
- `EventId` - 按事件 ID 筛选

## 示例查询

### 查询最近事件

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').ServiceFabricOperationalEvent
| where PreciseTimeStamp > ago(1h)
| project PreciseTimeStamp, Level, TaskName, EventId, Message
| order by PreciseTimeStamp desc
| take 100
```

### 按任务类型统计

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').ServiceFabricOperationalEvent
| where PreciseTimeStamp > ago(24h)
| summarize count() by TaskName, Level
| order by count_ desc
```

### 查询错误事件

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').ServiceFabricOperationalEvent
| where PreciseTimeStamp > ago(1h)
| where Level >= 3  // Error level
| project PreciseTimeStamp, TaskName, EventId, Message
| order by PreciseTimeStamp desc
```

## 关联表

- [traces-alerts.md](./traces-alerts.md) - 警报处理跟踪日志

## 注意事项

- 此表主要用于 Service Fabric 基础设施监控
- Level 值：1=Critical, 2=Error, 3=Warning, 4=Info, 5=Verbose
- 通常用于诊断 AMP 平台级问题，而非单个警报规则问题
