# AKS 自动升级与维护窗口 — 排查工作流

**来源草稿**: ado-wiki-b-auto-upgrade-scheduled-maintenance.md
**Kusto 引用**: auto-upgrade.md, maintenance-window.md, scale-upgrade-operations.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-b-auto-upgrade-scheduled-maintenance.md | 适用: 适用范围未明确

### 排查步骤

Most issues are expected to be bad configuration settings. The error should say what the configuration error is, and the docs should help show how it should be configured. If something other than that is wrong, escalate to PG.

##### Useful Kusto Queries

#### Get all Put MaintenanceConfiguration requests for a cluster

```kusto
cluster("Aks").database("AKSprod").FrontEndQoSEvents
| where resourceGroupName == "{resourceGroupName}"
| where resourceName == "{resourceName}"
| where subscriptionID == "{Sub_ID}"
| where operationName == "PutMaintenanceConfigurationHandler.PUT"
| project operationID, operationName, resultType, resultCode, resultSubCode
```

#### Get the user input request body

```kusto
cluster("Aks").database("AKSprod").FrontEndQoSEvents
| where operationID == "{operationID}"
| where msg contains "maintenance configuration request body:"
| project PreciseTimeStamp, msg, fileName, level
```

#### Find when maintenance was rejected based on current configuration

```kusto
cluster('Aks').database('AKSprod').AutoUpgraderEvents
| where subscriptionID == "{Sub_ID}"
| where resourceGroupName == "{resourceGroupName}"
| where resourceName == "{resourceName}"
// | where msg contains "maintenance is allowed:" // shows info for aksManagedAutoUpgradeSchedule or aksManagedNodeOSUpgradeSchedule
| where msg contains "Maintenance is not allowed, current time:"
```

#### Get all maintenance configuration in database

```kusto
cluster("Aks").database("AKSprod").ManagedClusterMonitoring
| where PreciseTimeStamp > ago(1d)
| where entitytype == "maintenanceConfiguration"
| where msg !startswith "Maintenance Configuration does not exist for Managed Cluster"
| extend data=parse_json(msg).data
| mv-expand data
| project data, configName = tostring(data.configName), resourceID = tostring(data.id)
| distinct resourceID, tostring(data)
```

---

## 附录: Kusto 诊断查询

### 来源: auto-upgrade.md

# 自动升级事件查询

## 用途

查询 AKS 自动升级器的事件，包括升级入队、执行情况、维护窗口匹配等。

---

## 查询 1: 查询自动升级事件

### 用途
查看自动升级的执行情况。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AutoUpgraderEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionID == "{subscription}"
| where msg !contains "Is upgrader running: true" and msg !contains "Is operation count cache running: true"
    and msg !contains "upgrader healthz returns: true" and msg !contains "auto-upgrade-operation-count-cache-sync-interval"
| project PreciseTimeStamp, level, msg, resourceName, resourceGroupName
| sort by PreciseTimeStamp desc
```

---

## 查询 2: 查询特定集群的升级事件

### 用途
查看特定集群的自动升级历史。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AutoUpgraderEvents
| where PreciseTimeStamp > ago(1d)
| where subscriptionID =~ '{subscription}'
| where resourceName has "{cluster}"
| project PreciseTimeStamp, level, msg
```

---

## 查询 3: 查询升级入队

### 用途
查看升级操作的入队情况。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').RegionalLooperEvents
| where PreciseTimeStamp > ago(1d)
| where msg contains "Enqueuing message" and msg has "{resourceURI}"
| project PreciseTimeStamp, msg, error, Environment
```

---

## 查询 4: 查询维护窗口配置操作

### 用途
查找维护窗口配置的创建和更新操作。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').FrontEndQoSEvents
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where resourceGroupName == "{resourceGroup}"
| where resourceName == "{cluster}"
| where subscriptionID == "{subscription}"
| where operationName == "PutMaintenanceConfigurationHandler.PUT"
| project operationID, operationName, resultType, resultCode, resultSubCode
```

---

## 查询 5: 关联升级操作和 QoS 事件

### 用途
将自动升级事件与操作 QoS 事件关联，获取完整升级视图。

### 查询语句

```kql
let autoUpgradeTime =
    cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AutoUpgraderEvents
    | where PreciseTimeStamp > ago(7d)
    | where subscriptionID == "{subscription}" and resourceName has "{cluster}"
    | where msg contains "upgrade"
    | summarize min(PreciseTimeStamp) by resourceName;
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').FrontEndQoSEvents
| where PreciseTimeStamp > ago(7d)
| where subscriptionID == "{subscription}" and resourceName == "{cluster}"
| where suboperationName == "Upgrading"
| project PreciseTimeStamp, correlationID, operationID, k8sCurrentVersion, k8sGoalVersion, result, resultCode
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| msg | 自动升级消息 |
| level | 日志级别 |
| Environment | 环境信息 |

## 注意事项

- 过滤健康检查消息可减少噪音
- 自动升级通常在维护窗口内执行
- 与 QoS 事件结合可获取升级结果

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照

---

### 来源: maintenance-window.md

# 维护窗口和计划内维护查询

## 查询语句

### 查询维护窗口配置操作

查找维护窗口（Maintenance Window）的配置请求体。

```kql
union cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndContextActivity,
      cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AsyncContextActivity
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
//| where PreciseTimeStamp > ago(1d)
| where subscriptionID == "{subscription}"
//| where resourceGroupName contains "{resourceGroup}"
//| where resourceName contains "{cluster}"
| extend Message = parse_json(msg)
//| where operationID contains "{operationId}"
| where Message contains "maintenance configuration request body"
| project PreciseTimeStamp, level, msg, namespace, correlationID, operationID, fileName, lineNumber
| take 10
```

### 查询 AKS Planned Maintenance 事件

检查 MaintenanceConfigEvent 表中维护配置服务的日志和错误消息。

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").MaintenanceConfigEvent
| where PreciseTimeStamp >= ago(2d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where msg contains "ARN" and msg contains "has been handled" and msg contains "{clusterUri}"
| project TIMESTAMP, msg
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| msg | 消息内容（含 maintenance configuration request body） |
| namespace | CCP Namespace |
| correlationID | 关联 ID |
| operationID | 操作 ID |

## 关联查询

- [auto-upgrade.md](./auto-upgrade.md) - 自动升级事件
- [operation-tracking.md](./operation-tracking.md) - 操作追踪

---

### 来源: scale-upgrade-operations.md

# Scale/Upgrade 操作查询

## 查询语句

### 查询 Scale/Upgrade 操作事件

```kql
union cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndContextActivity,
      cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AsyncContextActivity
| where subscriptionID == "{subscription}"
| where resourceName contains "{cluster}"
| where msg contains "intent" or msg contains "Upgrading" or msg contains "Successfully upgraded cluster" or msg contains "Operation succeeded" or msg contains "validateAndUpdateOrchestratorProfile"
| where PreciseTimeStamp > ago(1d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| project PreciseTimeStamp, operationID, correlationID, level, suboperationName, msg
| sort by PreciseTimeStamp desc
```

### 查询特定操作的错误消息

使用上一个查询获取的 operationID 深入追踪错误。

```kql
union cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndContextActivity,
      cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AsyncContextActivity
| where operationID == "{operationId}"
| where level != "info"
| project PreciseTimeStamp, level, msg
| sort by PreciseTimeStamp desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| operationID | 操作 ID，用于追踪单个操作 |
| correlationID | 关联 ID |
| level | 日志级别 (info/warning/error) |
| suboperationName | 子操作名称 |
| msg | 详细消息 |

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 通用操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照信息

---
