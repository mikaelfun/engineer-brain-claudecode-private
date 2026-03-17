---
name: exceptions
database: AzureAlertsManagement
cluster: https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn
description: 警报管理异常日志
status: active
---

# exceptions

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | AzureAlertsManagement |
| 状态 | ✅ 可用 |

## 用途

记录 Azure Alerts Management 服务的异常日志，用于：
- 诊断服务错误
- 追踪异常堆栈
- 分析错误模式

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间戳 |
| operation_Name | string | 操作名称 |
| operation_Id | string | 操作 ID |
| operation_ParentId | string | 父操作 ID |
| outerType | string | 外部异常类型 |
| outerMessage | string | 外部异常消息 |
| stackTrace | string | 堆栈跟踪 |
| innermostType | string | 最内层异常类型 |
| innermostMessage | string | 最内层异常消息 |
| customDimensions | dynamic | 自定义维度 |
| cloud_RoleName | string | 服务角色名称 |

## 常用筛选字段

- `env_time` - 按时间筛选
- `outerType` - 按异常类型筛选
- `innermostMessage` - 按错误消息筛选
- `operation_Name` - 按操作名称筛选

## 示例查询

### 查询最近异常

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').exceptions
| where env_time > ago(1h)
| project env_time, outerType, outerMessage, innermostMessage, operation_Name
| order by env_time desc
| take 100
```

### 按异常类型统计

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').exceptions
| where env_time > ago(24h)
| summarize count() by outerType, innermostType
| order by count_ desc
```

## 关联表

- [traces-alerts.md](./traces-alerts.md) - 警报处理跟踪日志
- [requests.md](./requests.md) - 请求日志
