---
name: traces
database: LogSearchRule
cluster: https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn
description: 日志搜索规则 (Scheduled Query Rules) 执行跟踪日志
status: active
---

# traces (LogSearchRule)

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | LogSearchRule |
| 状态 | ✅ 可用 |

## 用途

记录 Scheduled Query Rules (日志搜索规则) 的执行跟踪日志，包括：
- 规则评估执行记录
- 查询执行状态
- 规则触发/未触发原因

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间戳 |
| operation_Name | string | 操作名称 |
| operation_Id | string | 操作 ID |
| operation_ParentId | string | 父操作 ID |
| customDimensions | dynamic | 自定义维度 |
| message | string | 日志消息（含规则 ID） |
| severityLevel | string | 日志级别 |
| cloud_RoleName | string | 服务角色名称 |
| environment | string | 环境标识 |

## 常用筛选字段

- `env_time` - 按时间筛选
- `message` - 按消息内容筛选（包含规则 ID）
- `operation_Name` - 按操作类型筛选

## 典型应用场景

1. **查询规则执行历史** - 按规则 ID 搜索 message
2. **诊断规则未触发** - 检查执行记录和错误信息
3. **查看查询执行状态** - 检查 severityLevel 和 message

## 示例查询

### 查询规则执行历史

```kql
let ruleid = "{alertRuleId}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').traces
| where env_time between (starttime..endtime)
| where message contains ruleid
| project env_time, message, operation_Name, operation_Id, severityLevel
| order by env_time desc
```

### 查询最近执行记录

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').traces
| where env_time > ago(1h)
| project env_time, message, operation_Name, severityLevel
| order by env_time desc
| take 100
```

### 查询执行错误

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').traces
| where env_time between (starttime..endtime)
| where severityLevel in ("Error", "Warning", "Critical")
| project env_time, message, operation_Name, severityLevel
| order by env_time desc
```

## 关联表

- [LogSearchRuleSliLogs.md](./LogSearchRuleSliLogs.md) - SLI 日志

## 注意事项

- 规则 ID 通常包含在 message 字段中，使用 `contains` 进行模糊匹配
- 日志保留时间有限，建议及时查询
- 与 AzureAlertsManagement.traces 区分，本表专用于 Scheduled Query Rules
