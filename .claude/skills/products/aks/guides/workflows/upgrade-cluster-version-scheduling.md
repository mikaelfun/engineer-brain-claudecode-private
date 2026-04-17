# AKS 集群版本升级 — scheduling — 排查工作流

**来源草稿**: 无
**Kusto 引用**: auto-upgrade.md, cluster-snapshot.md, scale-upgrade-operations.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Kusto 诊断: 自动升级事件查询
> 来源: auto-upgrade.md | 适用: Mooncake ✅

### 排查步骤

#### 自动升级事件查询

#### 用途

查询 AKS 自动升级器的事件，包括升级入队、执行情况、维护窗口匹配等。

---

#### 查询 1: 查询自动升级事件

##### 用途
查看自动升级的执行情况。

##### 查询语句

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

#### 查询 2: 查询特定集群的升级事件

##### 用途
查看特定集群的自动升级历史。

##### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AutoUpgraderEvents
| where PreciseTimeStamp > ago(1d)
| where subscriptionID =~ '{subscription}'
| where resourceName has "{cluster}"
| project PreciseTimeStamp, level, msg
```

---

#### 查询 3: 查询升级入队

##### 用途
查看升级操作的入队情况。

##### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').RegionalLooperEvents
| where PreciseTimeStamp > ago(1d)
| where msg contains "Enqueuing message" and msg has "{resourceURI}"
| project PreciseTimeStamp, msg, error, Environment
```

---

#### 查询 4: 查询维护窗口配置操作

##### 用途
查找维护窗口配置的创建和更新操作。

##### 查询语句

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

#### 查询 5: 关联升级操作和 QoS 事件

##### 用途
将自动升级事件与操作 QoS 事件关联，获取完整升级视图。

##### 查询语句

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

#### 结果字段说明

| 字段 | 说明 |
|------|------|
| msg | 自动升级消息 |
| level | 日志级别 |
| Environment | 环境信息 |

#### 注意事项

- 过滤健康检查消息可减少噪音
- 自动升级通常在维护窗口内执行
- 与 QoS 事件结合可获取升级结果

#### 关联查询

- [operation-tracking.md](./operation-tracking.md) - 操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照

---

## Scenario 2: Kusto 诊断: 集群快照查询
> 来源: cluster-snapshot.md | 适用: Mooncake ✅

### 排查步骤

#### 集群快照查询

#### 用途

获取 AKS 集群的基础信息、CCP Namespace、FQDN、Underlay Name 等关键信息。

#### 查询 1: 获取集群基础信息

##### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {subscription} | 是 | 订阅 ID |
| {resourceGroup} | 是 | 资源组名称 |
| {cluster} | 是 | 集群名称 |

##### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| where customerResourceGroup == "{resourceGroup}"
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project namespace, apiServerServiceAccountIssuerFQDN, UnderlayName, provisioningState, powerState, clusterNodeCount
| take 1
```

##### 结果字段说明

| 字段 | 说明 |
|------|------|
| namespace | CCP 命名空间（用于控制平面日志查询） |
| apiServerServiceAccountIssuerFQDN | API Server FQDN |
| UnderlayName | Underlay 名称 |
| provisioningState | 预配状态 |
| powerState | 电源状态 |
| clusterNodeCount | 节点数量 |

---

#### 查询 2: 查询集群状态历史

##### 查询语句

```kql
let _fqdn = cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| where customerResourceGroup == "{resourceGroup}"
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project apiServerServiceAccountIssuerFQDN
| take 1;
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(90d)
| where apiServerServiceAccountIssuerFQDN in (_fqdn)
| project apiServerServiceAccountIssuerFQDN, PreciseTimeStamp, name, provisioningState, powerState, clusterNodeCount, UnderlayName
| order by PreciseTimeStamp asc
```

---

#### 查询 3: 检查集群异常状态

##### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where TIMESTAMP > ago(3d)
| where clusterName contains "{cluster}" and subscription == "{subscription}"
| where ['state'] contains "degraded" or ['state'] == 'Unhealthy'
| project PreciseTimeStamp, provisionInfo, provisioningState, powerState, clusterNodeCount,
         autoUpgradeProfile, clusterName, resourceState
| sort by PreciseTimeStamp desc
```

---

#### 查询 4: 检查 Extension Addon Profiles (如 Flux)

##### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {ccpNamespace} | 是 | CCP 命名空间 |

##### 查询语句

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
ManagedClusterSnapshot
| where PreciseTimeStamp between(queryFrom..queryTo)
| where ['cluster_id'] == queryCcpNamespace
| summarize arg_max(PreciseTimeStamp, clusterName, extensionAddonProfiles) by cluster_id
| extend extensionAddonProfiles = parse_json(extensionAddonProfiles)
| mv-apply extensionAddonProfiles on (
    project extAddonName = tostring(extensionAddonProfiles.name),
            ProvisionStatus = tostring(extensionAddonProfiles.provisioningState)
)
| extend flux_enabled = tobool(iff(extAddonName=='flux', True, False))
| project extAddonName, flux_enabled, ProvisionStatus
```

#### 关联查询

- [operation-tracking.md](./operation-tracking.md) - 追踪操作详情
- [controlplane-logs.md](./controlplane-logs.md) - 控制平面日志

---

## Scenario 3: Kusto 诊断: Scale/Upgrade 操作查询
> 来源: scale-upgrade-operations.md | 适用: Mooncake ✅

### 排查步骤

#### Scale/Upgrade 操作查询

#### 查询语句

##### 查询 Scale/Upgrade 操作事件

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

##### 查询特定操作的错误消息

使用上一个查询获取的 operationID 深入追踪错误。

```kql
union cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndContextActivity,
      cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AsyncContextActivity
| where operationID == "{operationId}"
| where level != "info"
| project PreciseTimeStamp, level, msg
| sort by PreciseTimeStamp desc
```

#### 结果字段说明

| 字段 | 说明 |
|------|------|
| operationID | 操作 ID，用于追踪单个操作 |
| correlationID | 关联 ID |
| level | 日志级别 (info/warning/error) |
| suboperationName | 子操作名称 |
| msg | 详细消息 |

#### 关联查询

- [operation-tracking.md](./operation-tracking.md) - 通用操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照信息

---
