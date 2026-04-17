# AKS 集群版本升级 — deprecated-api — 排查工作流

**来源草稿**: 无
**Kusto 引用**: api-throttling-analysis.md, auto-upgrade.md, cluster-snapshot.md, deprecated-apis.md, scale-upgrade-operations.md
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: Kusto 诊断: API Server 请求和 Throttling 分析
> 来源: api-throttling-analysis.md | 适用: 适用范围未明确

### 排查步骤

#### API Server 请求和 Throttling 分析

#### 用途

分析 Kubernetes API Server 的请求模式、错误统计和 Throttling 情况。

#### 使用场景

1. **性能问题诊断** - API Server 响应慢
2. **Throttling 分析** - 429 错误排查
3. **请求模式分析** - 识别高频请求来源

#### 查询 1: API 错误统计

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEvents, ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| extend verb = tostring(event.verb)
| extend user = tostring(event.user.username)
| extend reason = tostring(event.responseStatus.reason)
| extend status = tostring(event.responseStatus.status)
| extend code = tostring(event.responseStatus.code)
| extend subresource = tostring(event.objectRef.subresource)
| extend pod = tostring(p.pod)
| extend objectRefname = tostring(event.objectRef.name)
| extend userAgent = tostring(event.userAgent)
| extend clientIp = tostring(event.sourceIPs[0])
| extend latency = datetime_diff('millisecond', todatetime(tostring(event.stageTimestamp)),
                                 todatetime(tostring(event.requestReceivedTimestamp)))
| where code != "200" and code != "201"
| summarize count() by reason, clientIp, code, status, userAgent, verb, objectRefname
| order by count_ desc
```

#### 查询 2: API 请求 Throttling 分析

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEventsNonShoebox, ControlPlaneEvents
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| where event.stage == "ResponseComplete"
| where event.verb != "watch"
| where event.objectRef.subresource !in ("proxy", "exec")
| extend verb = tostring(event.verb)
| extend code = tostring(event.responseStatus.code)
| extend lat = datetime_diff('Millisecond', todatetime(event.stageTimestamp),
                              todatetime(event.requestReceivedTimestamp))
| summarize count() by code, bin(PreciseTimeStamp, 1m)
| render timechart
```

#### 查询 3: 请求延迟分布

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEventsNonShoebox, ControlPlaneEvents
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| where event.stage == "ResponseComplete"
| where event.verb != "watch"
| extend verb = tostring(event.verb)
| extend resource = tostring(event.objectRef.resource)
| extend lat = datetime_diff('Millisecond', todatetime(event.stageTimestamp),
                              todatetime(event.requestReceivedTimestamp))
| summarize
    p50 = percentile(lat, 50),
    p90 = percentile(lat, 90),
    p99 = percentile(lat, 99),
    max_lat = max(lat),
    count = count()
  by verb, resource
| order by p99 desc
```

#### 查询 4: 高频请求用户

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEventsNonShoebox, ControlPlaneEvents
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| where event.stage == "ResponseComplete"
| extend user = tostring(event.user.username)
| extend userAgent = tostring(event.userAgent)
| extend verb = tostring(event.verb)
| summarize count() by user, userAgent, verb
| order by count_ desc
| take 50
```

#### HTTP 状态码说明

| 状态码 | 含义 | 可能原因 |
|-------|------|---------|
| 429 | Too Many Requests | API Throttling |
| 500 | Internal Server Error | API Server 内部错误 |
| 503 | Service Unavailable | API Server 不可用 |
| 504 | Gateway Timeout | 请求超时 |
| 401 | Unauthorized | 认证失败 |
| 403 | Forbidden | 授权失败 |

#### 注意事项

- 429 错误通常表示 API Server 正在进行流量控制
- 关注 userAgent 中的自定义应用可能产生过多请求
- 建议分析 p99 延迟而不是平均延迟

---

## Scenario 2: Kusto 诊断: 自动升级事件查询
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

## Scenario 3: Kusto 诊断: 集群快照查询
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

## Scenario 4: Kusto 诊断: Deprecated APIs 检查
> 来源: deprecated-apis.md | 适用: 适用范围未明确

### 排查步骤

#### Deprecated APIs 检查

#### 用途

检查集群中使用的 Kubernetes Deprecated APIs，帮助在升级前识别可能受影响的工作负载。

#### 使用场景

1. **升级前检查** - 在 K8s 版本升级前识别 deprecated APIs
2. **合规检查** - 确保应用使用最新 API 版本
3. **影响分析** - 识别使用 deprecated APIs 的用户和 UserAgent

#### 查询 1: 检查 Deprecated APIs 使用情况

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
let targetRemovedRelease = 1.27;  // 修改为目标版本
union ControlPlaneEvents, ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| where properties has 'deprecated\\":\\"true\\"'
| extend log = parse_json(tostring(parse_json(properties).log))
| project PreciseTimeStamp, log, properties
| extend verb = tostring(log.verb)
| extend userAgent = tostring(log.userAgent)
| extend username = tostring(log.user.username)
| extend resource = tostring(log.objectRef.resource)
| extend apiGroup = tostring(log.objectRef.apiGroup)
| extend apiVersion = tostring(log.objectRef.apiVersion)
| extend requestURI = tostring(split(log.requestURI, '?')[0])
| extend source_ip = tostring(log.sourceIPs[0])
| extend removed_release = toreal(tostring(log.annotations['k8s.io/removed-release']))
| extend api = strcat(apiGroup, '/', apiVersion)
| extend internal_user = case(
    source_ip startswith '172.31.', true,
    username startswith 'system:node:aks-', true,
    username in ('aksService', 'system:apiserver',
                 'system:serviceaccount:gatekeeper-system:gatekeeper-admin',
                 'system:serviceaccount:kube-system:addon-http-application-routing-external-dns',
                 'nodeclient'), true,
    false
)
| where removed_release == targetRemovedRelease
| extend requestURI = replace_string(requestURI, api, '')
| distinct PreciseTimeStamp, userAgent, username, internal_user, verb, api, resource, removed_release
| order by PreciseTimeStamp desc
```

#### 查询 2: 使用 CPRemediatorLogs 检查 Deprecated APIs

```kql
CPRemediatorLogs
| project msg, PreciseTimeStamp, namespace
| where namespace == "{ccpNamespace}"
| where msg contains "Update configMap from alert" and msg contains "requestedDeprecatedApis"
      and msg contains "1.27"
| order by PreciseTimeStamp desc
| take 1
```

#### 查询 3: Deprecated APIs 统计

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEvents, ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| where properties has 'deprecated\\":\\"true\\"'
| extend log = parse_json(tostring(parse_json(properties).log))
| extend apiGroup = tostring(log.objectRef.apiGroup)
| extend apiVersion = tostring(log.objectRef.apiVersion)
| extend resource = tostring(log.objectRef.resource)
| extend removed_release = toreal(tostring(log.annotations['k8s.io/removed-release']))
| extend api = strcat(apiGroup, '/', apiVersion, '/', resource)
| summarize count() by api, removed_release
| order by removed_release asc, count_ desc
```

#### 常见 Deprecated APIs

| API | 移除版本 | 替代 API |
|-----|---------|---------|
| extensions/v1beta1/ingresses | 1.22 | networking.k8s.io/v1/ingresses |
| batch/v1beta1/cronjobs | 1.25 | batch/v1/cronjobs |
| policy/v1beta1/poddisruptionbudgets | 1.25 | policy/v1/poddisruptionbudgets |
| autoscaling/v2beta1 | 1.26 | autoscaling/v2 |
| flowcontrol.apiserver.k8s.io/v1beta2 | 1.29 | flowcontrol.apiserver.k8s.io/v1 |

#### 注意事项

- 内部用户 (internal_user=true) 通常可以忽略
- 重点关注 userAgent 中包含应用名称的请求
- 建议在升级前至少运行 7 天的 deprecated APIs 检查

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
