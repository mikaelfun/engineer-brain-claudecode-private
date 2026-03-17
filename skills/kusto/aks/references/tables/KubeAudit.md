---
name: KubeAudit
database: AKSccplogs
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: Kubernetes 审计日志（新表，推荐使用），记录 API Server 的所有请求
status: active
related_tables:
  - ControlPlaneEvents
  - ControlPlaneEventsNonShoebox
---

# KubeAudit

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSccplogs |
| 状态 | ✅ 可用（推荐使用） |

## 用途

记录 Kubernetes API Server 的审计日志，包含所有 API 请求的详细信息。这是新版审计日志表，相比 ControlPlaneEvents 更易于查询。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| logPreciseTime | string | 日志精确时间 |
| cluster_id | string | CCP 命名空间 |
| level | string | 审计级别 |
| stage | string | 请求阶段 (RequestReceived/ResponseComplete) |
| verb | string | HTTP 动词 (get/list/watch/create/update/delete/patch) |
| user | dynamic | 用户信息 |
| userAgent | string | 用户代理 |
| sourceIPs | dynamic | 来源 IP 列表 |
| objectRef | dynamic | 对象引用 |
| requestObject | dynamic | 请求对象 |
| responseObject | dynamic | 响应对象 |
| responseStatus | dynamic | 响应状态 |
| annotations | dynamic | 注解 |
| auditID | string | 审计 ID |
| requestReceivedTimestamp | string | 请求接收时间 |
| stageTimestamp | string | 阶段时间 |

## objectRef 字段结构

```json
{
  "resource": "pods",
  "namespace": "default",
  "name": "my-pod",
  "apiGroup": "",
  "apiVersion": "v1",
  "subresource": ""
}
```

## 典型应用场景

1. **追踪 Pod 操作** - 查看 Pod 创建、删除、更新
2. **分析 API 请求** - 统计请求类型和来源
3. **检查 Deprecated APIs** - 查找使用已弃用 API 的请求
4. **诊断权限问题** - 分析 403/401 错误

## 示例查询

### Pod 操作追踪
```kql
let queryClusterNamespace = '{ccpNamespace}';
let queryFrom = datetime('{startDate}');
let queryTo = datetime('{endDate}');
let queryPod = '{podName}';
KubeAudit
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where cluster_id == queryClusterNamespace
| where isempty(queryPod) or requestObject has queryPod
| where objectRef.resource == "pods" and stage == "ResponseComplete" and verb !in ('get', 'list', 'watch')
| where isempty(queryPod) or objectRef.name has queryPod
| extend user = tostring(user.username)
| extend namespace = tostring(objectRef.namespace)
| extend name = tostring(objectRef.name)
| extend nodeName = case(
    verb == "create", tostring(coalesce(requestObject.target.name, responseObject.spec.nodeName)),
    level == "RequestResponse", tostring(responseObject.spec.nodeName), 
    ""
)
| where isnotempty(name)
| distinct PreciseTimeStamp, name, nodeName, namespace, verb, userAgent, user
| order by PreciseTimeStamp asc 
```

### Pod 重启历史分析
```kql
let queryCcpNamespace = '{ccpNamespace}';
let queryFrom = datetime('{startDate}');
let queryTo = datetime('{endDate}');
KubeAudit
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
    pod = tostring(objectRef.name),
    ns = tostring(objectRef.namespace),
    restartCount = toint(cs.restartCount),
    startedAt = todatetime(cs.lastState.terminated.startedAt),
    finishedAt = todatetime(cs.lastState.terminated.finishedAt)
| summarize PreciseTimeStamp = arg_max(PreciseTimeStamp, *) by pod, container
| top 2000 by PreciseTimeStamp desc 
```

### 检查 Deprecated APIs
```kql
let queryCcpNamespace = '{ccpNamespace}';
let queryFrom = datetime('{startDate}');
let queryTo = datetime('{endDate}');
KubeAudit
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where cluster_id == queryCcpNamespace
| where annotations['k8s.io/deprecated'] == "true"
| extend removed_release = toreal(tostring(annotations['k8s.io/removed-release']))
| extend api = strcat(tostring(objectRef.apiGroup), '/', tostring(objectRef.apiVersion))
| extend user = tostring(user.username)
| distinct PreciseTimeStamp, userAgent, user, verb, api, objectRef.resource, removed_release
| order by PreciseTimeStamp desc
```

## 关联表

- [ControlPlaneEvents.md](./ControlPlaneEvents.md) - 控制平面事件（包含审计日志）
- [AKSKubeEvents.md](./AKSKubeEvents.md) - Kubernetes 事件

## 注意事项

- 这是新版审计日志表，字段已预解析，查询更方便
- `stage == "ResponseComplete"` 筛选完成的请求
- 过滤 `verb !in ('get', 'list', 'watch')` 可减少读操作噪音
- 与 ControlPlaneEvents 中的 kube-audit category 数据相同，但格式更友好
