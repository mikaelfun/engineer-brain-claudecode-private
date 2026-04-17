# Monitor 告警操作组与通知 — 排查工作流

**来源草稿**: [ado-wiki-a-Autoscale-Email-Notifications-TSG.md], [ado-wiki-a-troubleshooting-email-notifications-not-received.md], [ado-wiki-action-group-change-events-kusto.md], [ado-wiki-action-group-details-asc.md], [ado-wiki-notification-history-action-group-kusto.md], [ado-wiki-trace-notification-asc.md], [ado-wiki-trace-notification-jarvis.md]
**Kusto 引用**: [notification-service.md], [notification-service.md]
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: ---
> 来源: ado-wiki-a-Autoscale-Email-Notifications-TSG.md | 适用: Mooncake ✅

---

## Scenario 2: This troubleshooting guide applies to an alert having been fired successfully but one or more email 
> 来源: ado-wiki-a-troubleshooting-email-notifications-not-received.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Verify the alert really did fire**
   [来源: ado-wiki-a-troubleshooting-email-notifications-not-received.md]

2. **Step 2: Get fired alert details from ASC**
   [来源: ado-wiki-a-troubleshooting-email-notifications-not-received.md]

3. **Step 3: Get notification diagnostic trace logs**
   [来源: ado-wiki-a-troubleshooting-email-notifications-not-received.md]

4. **Step 4: Analyze trace logs**
   [来源: ado-wiki-a-troubleshooting-email-notifications-not-received.md]

5. **Step 5: Check for error traces**
   [来源: ado-wiki-a-troubleshooting-email-notifications-not-received.md]

6. **Step 6: Send test notification**
   [来源: ado-wiki-a-troubleshooting-email-notifications-not-received.md]

---

## Kusto 诊断查询

### 查询来源: notification-service.md
> 适用: Mooncake ✅

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
let subscriptionId = "{subscriptionId}";
cluster('aznscluster.chinaeast2.kusto.chinacloudapi.cn').database('AzNSPROD').traces
| where env_time between (starttime..endtime)
| where message contains subscriptionId
| project env_
```
[工具: Kusto skill — notification-service.md]

### 查询来源: notification-service.md
> 适用: Mooncake ✅

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
let actionGroupName = "{actionGroupName}";
cluster('aznscluster.chinaeast2.kusto.chinacloudapi.cn').database('AzNSPROD').traces
| where env_time between (starttime..endtime)
| where message contains actionGroupName
| project e
```
[工具: Kusto skill — notification-service.md]

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 参见上述场景 | 按步骤排查 | → details/alert-action-group.md |
