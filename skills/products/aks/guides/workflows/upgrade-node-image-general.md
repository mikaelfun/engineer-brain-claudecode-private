# AKS 节点镜像升级 — general — 排查工作流

**来源草稿**: 无
**Kusto 引用**: auto-upgrade.md, image-integrity.md, node-fabric-info.md, remediator-events.md, scale-upgrade-operations.md
**场景数**: 5
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

## Scenario 2: Kusto 诊断: Image Integrity 功能查询
> 来源: image-integrity.md | 适用: Mooncake ✅

### 排查步骤

#### Image Integrity 功能查询

#### 查询语句

##### 查询 Image Integrity 启用操作

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndQoSEvents
//| where PreciseTimeStamp > ago(7d)
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName contains "{resourceGroup}"
| where resourceName contains "{cluster}"
| where userAgent has "azure-resource-manager"
| where operationName == "PutManagedClusterHandler.PUT"
| where propertiesBag has "\"enableImageIntegrity\":\"true\""
| project PreciseTimeStamp, apiVersion, operationID, correlationID, resultCode, errorDetails, propertiesBag
```

#### 关联查询

- [operation-tracking.md](./operation-tracking.md) - 操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照

---

## Scenario 3: Kusto 诊断: 节点 Fabric 层信息查询
> 来源: node-fabric-info.md | 适用: Mooncake ✅

### 排查步骤

#### 节点 Fabric 层信息查询

#### 查询语句

##### 通过 LogContainerSnapshot 获取节点底层信息

获取 AKS 节点的 NodeID、ContainerID、Fabric Host（Tenant）等信息，用于进一步 Fabric 层排查。

> ⚠️ Mooncake 集群: `azurecm.chinanorth2.kusto.chinacloudapi.cn`

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where PreciseTimeStamp >= ago(2d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where roleInstanceName contains "{vmssInstanceName}"
| project PreciseTimeStamp, Fabric_Host=Tenant, Node_ID=nodeId, Container_ID=containerId
| top 1 by PreciseTimeStamp desc
```

##### 通过 GuestAgentExtensionEvents 获取节点扩展日志

可获取已删除节点或 Spot 实例的日志。

> ⚠️ Mooncake 集群: `azcore.chinanorth3.kusto.chinacloudapi.cn`

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').GuestAgentExtensionEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
//| where PreciseTimeStamp > ago(1d)
| where ContainerId == "{containerId}"
| project PreciseTimeStamp, Level, RoleInstanceName, ContainerId, Name, TaskName, Operation, OperationSuccess, Message
```

#### 典型应用场景

1. **获取节点 Fabric 信息** - 从 VMSS 实例名获取 ContainerID/NodeID 用于 Fabric 层查询
2. **已删除节点日志** - Spot 实例被回收后仍可通过 ContainerID 查询扩展日志
3. **跨层关联** - 将 AKS 层问题与 Fabric/CRP 层日志关联

#### 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照
- [operation-tracking.md](./operation-tracking.md) - 操作追踪

---

## Scenario 4: Kusto 诊断: 补救器事件查询
> 来源: remediator-events.md | 适用: Mooncake ✅

### 排查步骤

#### 补救器事件查询

#### 用途

查询 AKS 自动补救器（Remediator）的事件，包括自动修复操作、TunnelExec 错误、Deprecated APIs 检测等。

---

#### 查询 1: 查询补救器事件

##### 用途
查看 AKS 自动补救操作的详细信息。

##### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').RemediatorEvent
| where PreciseTimeStamp >= ago(2d)
| where ccpNamespace contains "{ccpNamespace}"
| project PreciseTimeStamp, ccpNamespace, msg, reason, remediation, pod, container,
         hostMachine, correlationID, state, statusCode, subscriptionID
| sort by PreciseTimeStamp desc
```

---

#### 查询 2: 查询 TunnelExec 补救

##### 用途
查看 TunnelExec 相关的补救操作。

##### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').RemediatorEvent
| where PreciseTimeStamp > ago(3d)
| where msg startswith "Beginning remediation"
| where ccpNamespace contains "{ccpNamespace}"
| project PreciseTimeStamp, msg, reason, remediation
```

---

#### 查询 3: 查询 Deprecated APIs

##### 用途
检测集群使用的已弃用 Kubernetes API。

##### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').CPRemediatorLogs
| project msg, PreciseTimeStamp, namespace
| where namespace == "{ccpNamespace}"
| where msg contains "Update configMap from alert" and msg contains "requestedDeprecatedApis"
      and msg contains "1.27"
| order by PreciseTimeStamp desc
| take 1
```

---

#### 查询 4: 按订阅查询补救事件

##### 用途
查看特定订阅下所有集群的补救事件。

##### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').RemediatorEvent
| where PreciseTimeStamp > ago(7d)
| where subscriptionID == "{subscription}"
| project PreciseTimeStamp, ccpNamespace, reason, remediation, msg
| sort by PreciseTimeStamp desc
```

---

#### 查询 5: 统计补救原因

##### 用途
统计补救事件的原因分布。

##### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').RemediatorEvent
| where PreciseTimeStamp > ago(7d)
| where ccpNamespace == "{ccpNamespace}"
| summarize count() by reason
| sort by count_ desc
```

#### 结果字段说明

| 字段 | 说明 |
|------|------|
| reason | 补救原因 |
| remediation | 执行的补救措施 |
| state | 补救状态 |
| statusCode | 状态码 |

#### 常见补救原因

| 原因 | 说明 |
|------|------|
| TunnelExec | 隧道执行问题 |
| ComponentUnhealthy | 组件不健康 |
| PodCrashLoopBackOff | Pod 崩溃循环 |

#### 关联查询

- [controlplane-logs.md](./controlplane-logs.md) - 控制平面日志
- [alertmanager.md](./alertmanager.md) - 告警查询

---

## Scenario 5: Kusto 诊断: Scale/Upgrade 操作查询
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
