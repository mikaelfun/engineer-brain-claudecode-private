---
name: scheduled-query-rules
description: Scheduled Query Rules (日志搜索规则) 执行查询
tables:
  - traces
  - LogSearchRuleSliLogs
parameters:
  - name: alertRuleId
    required: true
    description: 警报规则 ID
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
---

# Scheduled Query Rules 执行查询

## 用途

查询 Scheduled Query Rules (日志搜索规则) 的执行记录，包括：
- 规则评估历史
- 执行成功/失败状态
- 错误详情

---

## 查询 1: 按规则 ID 查询执行历史

### 用途
根据警报规则 ID 查询执行记录。

### 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {alertRuleId} | 是 | 警报规则 ID（可以是部分 ID） | my-alert-rule |
| {startDate} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endDate} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

### 查询语句

```kql
let ruleid = "{alertRuleId}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').traces
| where env_time between (starttime..endtime)
| where message contains ruleid
| project 
    env_time, 
    message, 
    operation_Name, 
    operation_Id, 
    severityLevel
| order by env_time desc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| message | 日志消息（含规则详情） |
| operation_Name | 操作名称 |
| operation_Id | 操作 ID |
| severityLevel | 日志级别 |

---

## 查询 2: 查询执行错误

### 用途
查找规则执行中的错误和警告。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').traces
| where env_time between (starttime..endtime)
| where severityLevel in ("Error", "Warning", "Critical")
| project 
    env_time, 
    message, 
    operation_Name, 
    severityLevel
| order by env_time desc
```

---

## 查询 3: 按操作类型统计

### 用途
统计不同操作类型的执行次数。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').traces
| where env_time between (starttime..endtime)
| summarize count() by operation_Name, severityLevel
| order by count_ desc
```

---

## 查询 4: 规则执行时间线

### 用途
生成规则执行的时间线视图。

### 查询语句

```kql
let ruleid = "{alertRuleId}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').traces
| where env_time between (starttime..endtime)
| where message contains ruleid
| summarize count() by bin(env_time, 5m), severityLevel
| order by env_time asc
| render timechart
```

---

## 查询 5: SLI 指标查询

### 用途
查询日志搜索规则服务的 SLI 指标。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').LogSearchRuleSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize 
    avg_value = avg(Value),
    min_value = min(Value),
    max_value = max(Value)
    by MetricName, bin(MetricTimestamp, 5m)
| order by MetricTimestamp desc
```

## 诊断步骤

1. **确认规则 ID** - 获取完整的规则资源 ID 或规则名称
2. **查询执行历史** - 使用查询 1 查看规则是否有执行记录
3. **检查错误** - 使用查询 2 查找错误信息
4. **分析模式** - 使用查询 3 和 4 分析执行模式

## 关联查询

- [metric-alerts.md](./metric-alerts.md) - Metric Alerts 查询
- [amp-sli.md](./amp-sli.md) - AMP SLI 查询
