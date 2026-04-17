---
name: customEvents
database: AzureAlertsManagement
cluster: https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn
description: 警报管理自定义事件
status: active
---

# customEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | AzureAlertsManagement |
| 状态 | ✅ 可用 |

## 用途

记录 Azure Alerts Management 服务的自定义事件，用于：
- 追踪业务事件
- 分析警报处理流程
- 监控服务行为

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间戳 |
| operation_Name | string | 操作名称 |
| operation_Id | string | 操作 ID |
| operation_ParentId | string | 父操作 ID |
| name | string | 事件名称 |
| customDimensions | dynamic | 自定义维度 |
| metrics | dynamic | 指标数据 |
| cloud_RoleName | string | 服务角色名称 |

## 常用筛选字段

- `env_time` - 按时间筛选
- `name` - 按事件名称筛选
- `operation_Name` - 按操作名称筛选

## 示例查询

### 查询自定义事件

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').customEvents
| where env_time > ago(1h)
| project env_time, name, operation_Name, customDimensions
| order by env_time desc
| take 100
```

### 按事件名称统计

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').customEvents
| where env_time > ago(24h)
| summarize count() by name
| order by count_ desc
```

## 关联表

- [traces-alerts.md](./traces-alerts.md) - 警报处理跟踪日志
- [requests.md](./requests.md) - 请求日志
