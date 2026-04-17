# Monitor 日志查询告警规则 — 排查工作流

**来源草稿**: 
**Kusto 引用**: [scheduled-query-rules.md], [scheduled-query-rules.md], [scheduled-query-rules.md], [scheduled-query-rules.md], [scheduled-query-rules.md]
**场景数**: 5
**生成日期**: 2026-04-07

---

## Kusto 诊断查询

### 查询来源: scheduled-query-rules.md
> 适用: Mooncake ✅

```kql
let ruleid = "{alertRuleId}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').traces
| where env_time between (starttime..endtime)
| where message contains ruleid
| project 
    env_time,
```
[工具: Kusto skill — scheduled-query-rules.md]

### 查询来源: scheduled-query-rules.md
> 适用: Mooncake ✅

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').traces
| where env_time between (starttime..endtime)
| where severityLevel in ("Error", "Warning", "Critical")
| project 
    env_time, 
  
```
[工具: Kusto skill — scheduled-query-rules.md]

### 查询来源: scheduled-query-rules.md
> 适用: Mooncake ✅

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').traces
| where env_time between (starttime..endtime)
| summarize count() by operation_Name, severityLevel
| order by count_ desc
```
[工具: Kusto skill — scheduled-query-rules.md]

### 查询来源: scheduled-query-rules.md
> 适用: Mooncake ✅

```kql
let ruleid = "{alertRuleId}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').traces
| where env_time between (starttime..endtime)
| where message contains ruleid
| summarize count() by b
```
[工具: Kusto skill — scheduled-query-rules.md]

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 参见草稿内容 | 按流程排查 | → details/alert-log-query.md |
