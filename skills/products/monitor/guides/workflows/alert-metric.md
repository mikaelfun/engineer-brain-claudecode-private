# Monitor 指标告警规则 — 排查工作流

**来源草稿**: 
**Kusto 引用**: [metric-alerts.md], [metric-alerts.md], [metric-alerts.md], [metric-alerts.md]
**场景数**: 4
**生成日期**: 2026-04-07

---

## Kusto 诊断查询

### 查询来源: metric-alerts.md
> 适用: Mooncake ✅

```kql
let AlertRuleID = "/subscriptions/{subscription}/resourceGroups/{resourceGroup}/providers/microsoft.insights/metricAlerts/{alertName}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database("AzureAlerts
```
[工具: Kusto skill — metric-alerts.md]

### 查询来源: metric-alerts.md
> 适用: Mooncake ✅

```kql
let TargetResource = "/subscriptions/{subscription}/resourceGroups/{resourceGroup}/providers/{provider}/{resourceType}/{resourceName}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database("AzureAlerts
```
[工具: Kusto skill — metric-alerts.md]

### 查询来源: metric-alerts.md
> 适用: Mooncake ✅

```kql
let subscriptionId = "{subscription}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database("AzureAlertsManagement").traces
| where env_time between (starttime..endtime)
| where tostring(customDimensio
```
[工具: Kusto skill — metric-alerts.md]

### 查询来源: metric-alerts.md
> 适用: Mooncake ✅

```kql
let AlertRuleID = "{alertRuleId}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database("AzureAlertsManagement").traces
| where env_time between (starttime..endtime)
| where tostring(customDimensions.A
```
[工具: Kusto skill — metric-alerts.md]

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 参见草稿内容 | 按流程排查 | → details/alert-metric.md |
