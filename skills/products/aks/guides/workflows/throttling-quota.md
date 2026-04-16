# AKS 限流与配额 — 排查工作流

**来源草稿**: 无
**Kusto 引用**: api-throttling-analysis.md
**场景数**: 1
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
