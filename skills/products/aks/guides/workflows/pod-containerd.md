# AKS containerd 运行时 — 排查工作流

**来源草稿**: 无
**Kusto 引用**: pod-restart-analysis.md, pod-subnet-sharing.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Kusto 诊断: Pod 重启分析查询
> 来源: pod-restart-analysis.md | 适用: Mooncake ✅

### 排查步骤

#### Pod 重启分析查询

#### 用途

分析 Pod 重启原因、重启历史、容器状态等。用于诊断 Pod 频繁重启问题。

---

#### 查询 1: Pod 重启历史

##### 用途
获取 Pod 的重启历史，包括重启原因、退出码等。

##### 查询语句

```kql
let queryCcpNamespace = '{ccpNamespace}';
let queryFrom = datetime('{startDate}');
let queryTo = datetime('{endDate}');
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').KubeAudit
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where cluster_id == queryCcpNamespace and requestObject has 'terminated'
| mv-expand cs = requestObject.status.containerStatuses
| where cs.lastState.terminated.reason !in ('', 'Completed')
| project
    PreciseTimeStamp,
    container = tostring(cs.name),
    reason = tostring(cs.lastState.terminated.reason),
    exitCode = tostring(cs.lastState.terminated.exitCode),
    image = tostring(cs.image),
    containerID = tostring(cs.containerID),
    pod = tostring(objectRef.name),
    ns = tostring(objectRef.namespace),
    restartCount = toint(cs.restartCount),
    startedAt = todatetime(cs.lastState.terminated.startedAt),
    finishedAt = todatetime(cs.lastState.terminated.finishedAt),
    message = tostring(cs.lastState.terminated.message),
    state = todynamic(cs.state),
    username = tostring(user.username),
    userAgent = tostring(userAgent)
| summarize PreciseTimeStamp = arg_max(PreciseTimeStamp, *) by pod, container
| top 2000 by PreciseTimeStamp desc
```

---

#### 查询 2: Pod 状态时间线

##### 用途
查看特定 Pod 的状态变化时间线。

##### 查询语句

```kql
let queryFrom = datetime('{startDate}');
let queryTo = datetime('{endDate}');
let queryCcpNamespace = '{ccpNamespace}';
let queryPod = '{podName}';
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsAll
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where category == 'kube-audit' and ccpNamespace == queryCcpNamespace and properties has queryPod
| extend log = parse_json(tostring(parse_json(properties).log))
| where log.objectRef.name == queryPod and log.objectRef.resource == "pods"
| where log.verb != "get" and log.stage == "ResponseComplete"
| extend level = tostring(log.level)
| extend verb = tostring(log.verb)
| extend user = tostring(log.user.username)
| extend namespace = tostring(log.objectRef.namespace)
| extend name = tostring(log.objectRef.name)
| extend userAgent = tostring(log.userAgent)
| extend nodeName = case(
    verb == "create", tostring(log.requestObject.target.name),
    level == "RequestResponse" and verb != "create", tostring(log.responseObject.spec.nodeName),
    level == "RequestResponse", tostring(log.responseObject.spec.nodeName),
    tostring(split(log.user.username, "system:node:")[1])
)
| where isnotempty(nodeName)
| extend StartTime = PreciseTimeStamp
| extend status = log.requestObject.status.containerStatuses
| extend Content = strcat(verb, "</br>", userAgent, "</br>", nodeName)
| project StartTime, Content, verb, user, nodeName, namespace, name, userAgent, status
| order by StartTime asc
```

---

#### 查询 3: Pod 操作追踪

##### 用途
追踪特定 Pod 的所有操作（创建、更新、删除等）。

##### 查询语句

```kql
let queryClusterNamespace = '{ccpNamespace}';
let queryFrom = datetime('{startDate}');
let queryTo = datetime('{endDate}');
let queryPod = '{podName}';
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').KubeAudit
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where cluster_id == queryClusterNamespace
| where isempty(queryPod) or requestObject has queryPod
| where objectRef.resource == "pods" and stage == "ResponseComplete" and verb !in ('get', 'list', 'watch')
| where isempty(queryPod) or objectRef.name has queryPod
| extend level = tostring(level)
| extend verb = tostring(verb)
| extend user = tostring(user.username)
| extend namespace = tostring(objectRef.namespace)
| extend subresource = tostring(objectRef.subresource)
| extend name = tostring(objectRef.name)
| extend userAgent = tostring(userAgent)
| extend nodeName = case(
    verb == "create", tostring(coalesce(requestObject.target.name, responseObject.spec.nodeName, requestObject.spec.nodeName)),
    level == "RequestResponse" and verb != "create", coalesce(tostring(responseObject.spec.nodeName), tostring(requestObject.spec.nodeName)),
    level == "RequestResponse", tostring(coalesce(responseObject.spec.nodeName, requestObject.spec.nodeName)),
    tostring(split(user, "system:node:")[1])
)
| extend nodeAffinity = tostring(responseObject.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[0].matchFields[0].values[0])
| extend nodeName = coalesce(nodeName, nodeAffinity)
| where isnotempty(name)
| distinct PreciseTimeStamp, logPreciseTime, subresource, name, nodeName, namespace, verb, userAgent, user
| order by logPreciseTime asc
```

---

#### 查询 4: 统计重启原因

##### 用途
统计 Pod 重启的原因分布。

##### 查询语句

```kql
let queryCcpNamespace = '{ccpNamespace}';
let queryFrom = datetime('{startDate}');
let queryTo = datetime('{endDate}');
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').KubeAudit
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where cluster_id == queryCcpNamespace and requestObject has 'terminated'
| mv-expand cs = requestObject.status.containerStatuses
| where cs.lastState.terminated.reason !in ('', 'Completed')
| extend reason = tostring(cs.lastState.terminated.reason)
| extend exitCode = tostring(cs.lastState.terminated.exitCode)
| summarize count() by reason, exitCode
| sort by count_ desc
```

#### 结果字段说明

| 字段 | 说明 |
|------|------|
| reason | 终止原因 (OOMKilled, Error, etc.) |
| exitCode | 退出码 |
| restartCount | 重启次数 |
| startedAt | 开始时间 |
| finishedAt | 结束时间 |

#### 常见终止原因

| 原因 | 说明 |
|------|------|
| OOMKilled | 内存不足被杀 |
| Error | 错误退出 |
| Completed | 正常完成 |
| ContainerCannotRun | 容器无法运行 |
| DeadlineExceeded | 超时 |

#### 关联查询

- [kube-events.md](./kube-events.md) - Kubernetes 事件
- [controlplane-logs.md](./controlplane-logs.md) - 控制平面日志

---

## Scenario 2: Kusto 诊断: Pod Subnet 共享查询
> 来源: pod-subnet-sharing.md | 适用: Mooncake ✅

### 排查步骤

#### Pod Subnet 共享查询

#### 查询语句

##### 查找共享 Pod Subnet 的集群

用于排查因 Pod Subnet 被多个集群共享导致子网 IP 耗尽的问题。

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AgentPoolSnapshot
| where PreciseTimeStamp >= ago(2d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where podSubnetId != ""
| summarize dcount(id) by podSubnetId
| where dcount_id > 1
```

##### 查看特定 Subnet 被哪些集群使用

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AgentPoolSnapshot
| where PreciseTimeStamp >= ago(2d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where podSubnetId contains "{podSubnetUri}"
| summarize dcount(id) by resource_id, name
```

#### 典型应用场景

1. **IP 耗尽排查** - 确认是否有多个集群共享同一 Pod Subnet
2. **网络规划** - 了解 Subnet 的集群分配情况

#### 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照

---
