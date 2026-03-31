---
name: requests
database: AzureAlertsManagement
cluster: https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn
description: 警报管理 API 请求日志
status: active
---

# requests

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | AzureAlertsManagement |
| 状态 | ✅ 可用 |

## 用途

记录 Azure Alerts Management 服务的 API 请求日志，包括：
- 请求成功/失败状态
- 请求延迟
- 错误码

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间戳 |
| operation_Name | string | 操作名称 |
| operation_Id | string | 操作 ID |
| operation_ParentId | string | 父操作 ID |
| name | string | 请求名称 |
| success | string | 是否成功 |
| resultCode | string | 结果码 |
| duration | real | 请求时长 (毫秒) |
| customDimensions | dynamic | 自定义维度 |
| cloud_RoleName | string | 服务角色名称 |

## 常用筛选字段

- `env_time` - 按时间筛选
- `success` - 按成功/失败筛选
- `resultCode` - 按结果码筛选
- `operation_Name` - 按操作名称筛选

## 示例查询

### 查询失败请求

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').requests
| where env_time > ago(1h)
| where success == "false"
| project env_time, name, resultCode, duration, operation_Id
| order by env_time desc
```

### 请求延迟分析

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').requests
| where env_time > ago(1h)
| summarize 
    avg_duration = avg(duration),
    p95_duration = percentile(duration, 95),
    count = count()
    by bin(env_time, 5m), operation_Name
| order by env_time desc
```

## 关联表

- [traces-alerts.md](./traces-alerts.md) - 警报处理跟踪日志
- [exceptions.md](./exceptions.md) - 异常日志
