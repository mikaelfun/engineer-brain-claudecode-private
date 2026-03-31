---
name: dependencies
database: AzureAlertsManagement
cluster: https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn
description: 警报管理依赖项调用日志
status: active
---

# dependencies

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | AzureAlertsManagement |
| 状态 | ✅ 可用 |

## 用途

记录 Azure Alerts Management 服务对外部依赖项的调用日志，用于：
- 追踪外部服务调用
- 分析依赖项延迟
- 诊断依赖项失败

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间戳 |
| operation_Name | string | 操作名称 |
| operation_Id | string | 操作 ID |
| operation_ParentId | string | 父操作 ID |
| name | string | 依赖项名称 |
| success | string | 是否成功 |
| duration | real | 调用时长 (毫秒) |
| data | string | 调用数据 |
| resultCode | string | 结果码 |
| target | string | 目标地址 |
| customDimensions | dynamic | 自定义维度 |
| cloud_RoleName | string | 服务角色名称 |

## 常用筛选字段

- `env_time` - 按时间筛选
- `name` - 按依赖项名称筛选
- `success` - 按成功/失败筛选
- `target` - 按目标地址筛选

## 示例查询

### 查询失败的依赖项调用

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').dependencies
| where env_time > ago(1h)
| where success == "false"
| project env_time, name, target, resultCode, duration, operation_Id
| order by env_time desc
```

### 依赖项延迟分析

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').dependencies
| where env_time > ago(1h)
| summarize 
    avg_duration = avg(duration),
    p95_duration = percentile(duration, 95),
    success_rate = round(100.0 * countif(success == "true") / count(), 2),
    count = count()
    by name
| order by count desc
```

### 按目标统计

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').dependencies
| where env_time > ago(1h)
| summarize 
    success_count = countif(success == "true"),
    failure_count = countif(success == "false"),
    avg_duration = avg(duration)
    by target
| order by failure_count desc
```

## 关联表

- [traces-alerts.md](./traces-alerts.md) - 警报处理跟踪日志
- [requests.md](./requests.md) - 请求日志
- [exceptions.md](./exceptions.md) - 异常日志
