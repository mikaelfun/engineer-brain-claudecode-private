---
name: customMetrics
database: AzureAlertsManagement
cluster: https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn
description: 警报管理自定义指标
status: active
---

# customMetrics

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | AzureAlertsManagement |
| 状态 | ✅ 可用 |

## 用途

记录 Azure Alerts Management 服务的自定义指标数据，用于：
- 监控服务性能指标
- 分析处理延迟和吞吐量
- 追踪资源使用情况

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间戳 |
| operation_Name | string | 操作名称 |
| operation_Id | string | 操作 ID |
| operation_ParentId | string | 父操作 ID |
| name | string | 指标名称 |
| value | real | 指标值 |
| valueCount | long | 值计数 |
| valueMax | real | 最大值 |
| valueMin | real | 最小值 |
| customDimensions | dynamic | 自定义维度 |
| cloud_RoleName | string | 服务角色名称 |

## 常用筛选字段

- `env_time` - 按时间筛选
- `name` - 按指标名称筛选
- `operation_Name` - 按操作名称筛选

## 示例查询

### 查询指标概览

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').customMetrics
| where env_time > ago(1h)
| summarize 
    avg_value = avg(value),
    max_value = max(value),
    count = count()
    by name
| order by count desc
```

### 指标时间序列

```kql
let metricName = "{metricName}";
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').customMetrics
| where env_time > ago(1h)
| where name == metricName
| summarize avg(value) by bin(env_time, 5m)
| order by env_time asc
| render timechart
```

## 关联表

- [traces-alerts.md](./traces-alerts.md) - 警报处理跟踪日志
- [requests.md](./requests.md) - 请求日志
