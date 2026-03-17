---
name: notification-service
description: Azure 通知服务 (Action Groups) 查询
tables:
  - traces
parameters:
  - name: subscriptionId
    required: true
    description: 订阅 ID
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
---

# Azure 通知服务查询

## 用途

查询 Azure Notification Service (Azure NS) 的通知发送记录，包括：
- Action Group 通知发送状态
- 通知发送延迟
- 发送失败记录

> ⚠️ **注意**: Azure NS Cluster 可能需要额外权限才能访问。如果查询失败，请联系管理员确认访问权限。

---

## 集群信息

| 属性 | 值 |
|------|-----|
| 集群 | https://aznscluster.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AzNSPROD |
| 状态 | ⚠️ 可能需要额外权限 |

---

## 查询 1: 按订阅查询通知发送状态

### 用途
查询指定订阅下的通知发送记录。

### 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscriptionId} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {startDate} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endDate} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
let subscriptionId = "{subscriptionId}";
cluster('aznscluster.chinaeast2.kusto.chinacloudapi.cn').database('AzNSPROD').traces
| where env_time between (starttime..endtime)
| where message contains subscriptionId
| project env_time, message
| order by env_time desc
```

---

## 查询 2: 按 Action Group 查询

### 用途
查询特定 Action Group 的通知发送记录。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
let actionGroupName = "{actionGroupName}";
cluster('aznscluster.chinaeast2.kusto.chinacloudapi.cn').database('AzNSPROD').traces
| where env_time between (starttime..endtime)
| where message contains actionGroupName
| project env_time, message
| order by env_time desc
```

---

## 诊断步骤

### 通知未发送问题排查

1. **确认警报已触发**
   - 使用 [metric-alerts.md](./metric-alerts.md) 查询确认 MonitorCondition = "Fired"
   - 检查 reciverSets 字段是否包含 Action Group 配置

2. **检查 Action Group 配置**
   - 确认 Action Group 存在且配置正确
   - 确认通知接收者（邮箱、Webhook 等）配置正确

3. **查询通知服务日志**
   - 使用本文件中的查询检查通知发送状态
   - 如无法访问 Azure NS Cluster，联系管理员

4. **检查接收端**
   - 检查邮箱垃圾邮件文件夹
   - 检查 Webhook 端点是否可达
   - 检查 SMS/语音通知配额

## 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 通知未发送 | Action Group 未配置 | 检查警报规则的 Action Group 配置 |
| 通知延迟 | 服务繁忙 | 检查 TraceTelemetry.AlertFiredToNotificationDelayInMs |
| 部分通知失败 | 接收端问题 | 检查 Webhook/邮箱可达性 |

## 关联查询

- [metric-alerts.md](./metric-alerts.md) - Metric Alerts 查询
- [scheduled-query-rules.md](./scheduled-query-rules.md) - Scheduled Query Rules 查询

## 备选方案

如果无法访问 Azure NS Cluster，可以通过以下方式间接排查：

1. **AzureAlertsManagement.traces** - 查看 reciverSets 字段确认通知配置
2. **AzureAlertsManagement.TraceTelemetry** - 查看 AlertFiredToNotificationDelayInMs 分析延迟
3. **Azure Portal Activity Log** - 检查 Action Group 操作日志
