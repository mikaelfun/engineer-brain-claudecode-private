---
name: deprecated-apis
description: 检查 Kubernetes Deprecated APIs 使用情况
tables:
  - ControlPlaneEvents
  - ControlPlaneEventsNonShoebox
  - KubeAudit
parameters:
  - ccpNamespace: CCP Namespace
  - starttime: 开始时间
  - endtime: 结束时间
  - targetVersion: 目标移除版本（如 1.27）
---

# Deprecated APIs 检查

## 用途

检查集群中使用的 Kubernetes Deprecated APIs，帮助在升级前识别可能受影响的工作负载。

## 使用场景

1. **升级前检查** - 在 K8s 版本升级前识别 deprecated APIs
2. **合规检查** - 确保应用使用最新 API 版本
3. **影响分析** - 识别使用 deprecated APIs 的用户和 UserAgent

## 查询 1: 检查 Deprecated APIs 使用情况

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

## 查询 2: 使用 CPRemediatorLogs 检查 Deprecated APIs

```kql
CPRemediatorLogs
| project msg, PreciseTimeStamp, namespace
| where namespace == "{ccpNamespace}"
| where msg contains "Update configMap from alert" and msg contains "requestedDeprecatedApis" 
      and msg contains "1.27"
| order by PreciseTimeStamp desc
| take 1
```

## 查询 3: Deprecated APIs 统计

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

## 常见 Deprecated APIs

| API | 移除版本 | 替代 API |
|-----|---------|---------|
| extensions/v1beta1/ingresses | 1.22 | networking.k8s.io/v1/ingresses |
| batch/v1beta1/cronjobs | 1.25 | batch/v1/cronjobs |
| policy/v1beta1/poddisruptionbudgets | 1.25 | policy/v1/poddisruptionbudgets |
| autoscaling/v2beta1 | 1.26 | autoscaling/v2 |
| flowcontrol.apiserver.k8s.io/v1beta2 | 1.29 | flowcontrol.apiserver.k8s.io/v1 |

## 注意事项

- 内部用户 (internal_user=true) 通常可以忽略
- 重点关注 userAgent 中包含应用名称的请求
- 建议在升级前至少运行 7 天的 deprecated APIs 检查
