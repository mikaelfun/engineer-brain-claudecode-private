# ARM ARM API 限流与 429 错误 — 综合排查指南

**条目数**: 9 | **草稿融合数**: 0 | **Kusto 查询融合**: 3
**来源草稿**: —
**Kusto 引用**: throttling-analysis.md, request-tracking.md, arm-rp-chain.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: ARM API returns HTTP 429 Too Many Requests when subscription or tenant exceeds …
> 来源: onenote

**根因分析**: ARM enforces sliding 1-hour window limits: 1200 writes and 32000 reads per subscription/tenant. Automated scripts or many concurrent users can exhaust these limits.

1. Reduce polling frequency of automated scripts; scope queries to specific resources instead of scanning all; distribute workload across subscriptions.
2. Use x-ms-ratelimit-remaining-* response headers to monitor remaining quota.
3. Query HttpIncomingRequests in ARM Kusto to analyze request patterns by clientIpAddress and clientApplicationId.

`[结论: 🟢 8.0/10 — [MCVKB/14.6 [ARM]ARM Throttling.md]]`

### Phase 2: API calls to ARM endpoint return HTTP 429 (Too Many Requests). The failureCause…
> 来源: ado-wiki

**根因分析**: Client exceeded ARM request limits (reads: 12000/hour, writes: 1200/hour per principal per subscription). ARM throttling is enforced at the gateway level. Note: some RPs override ARM limits via throttlingRules in their manifest (e.g., Microsoft.Insights x-ms-ratelimit-remaining-subscription-resource-requests header).

1. ARM API call limits are hard limits and cannot be adjusted.
2. Solutions: (1) Optimize call patterns - e.
3. , replace polling VMs every 2 seconds with Azure Monitor alerts.
4. (2) Split calls across multiple service principals.
5. (3) Review x-ms-ratelimit-remaining-* response headers to track remaining quota.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: API calls return HTTP 429 (Too Many Requests). Error 429 is present in HttpOutg…
> 来源: ado-wiki

**根因分析**: Resource Provider (RP) is throttling the requests at the RP layer, not ARM. The 429 responses originate from the RP endpoint visible in the hostName column of HttpOutgoingRequests.

1. Transfer the case to the owning RP team.
2. RP-side throttle limits can sometimes be adjusted.
3. Use Kusto query on HttpOutgoingRequests filtered by subscriptionId + httpStatusCode==429, summarize by hostName to identify which RP is throttling.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: ARM API calls return HTTP 429 throttling errors, engineer needs to determine if…
> 来源: ado-wiki

**根因分析**: ARM and RP throttling are separate layers; ARM rate-limits incoming requests before forwarding to RP; they show up in different Kusto tables

1. Check HttpIncomingRequests table for HTTP 429 responses to identify ARM-level throttling; check HttpOutgoingRequests table for HTTP 429 to identify RP-level throttling.
2. 429 in Incoming = ARM throttled the call before it reached the RP; 429 in Outgoing = RP throttled the forwarded call.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 5: API calls to ARM endpoint return HTTP 429. Error 429 visible in HttpIncomingReq…
> 来源: ado-wiki

**根因分析**: Client has exceeded ARM hard API call limits for the subscription (ARM-level throttling)

1. ARM API limits are hard limits and cannot be increased.
2. Mitigations: (1) Split calls across multiple service principals; (2) Replace polling patterns with Monitor alerts; (3) Reduce call frequency and optimize call patterns (batch where possible).

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: API calls return HTTP 429. Error 429 visible in HttpOutgoingRequests table matc…
> 来源: ado-wiki

**根因分析**: Resource Provider is throttling requests (not ARM). RP returning 429 responses to ARM's outgoing requests.

1. Transfer case to the RP-owning team.
2. RP throttling limits may sometimes be adjustable; all recommendations on avoiding RP throttle limits must come from the team supporting that RP.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: HTTP 429 throttling on specific ARM resource type operations (e.g., Microsoft.I…
> 来源: ado-wiki

**根因分析**: Some Resource Providers define custom throttlingRules in their ARM manifests that override default ARM limits (e.g., Microsoft.Insights limits scheduledqueryrules/write to 60 requests/hour). This results in ARM-layer failure caused by RP override.

1. Check the RP manifest at armmanifest.
2. visualstudio.
3. com for throttlingRules for the affected resource type.
4. Apply standard ARM throttling mitigations: distribute calls across service principals, reduce call frequency.
5. The x-ms-ratelimit-remaining-subscription-resource-requests header only appears when the default ARM limit is overridden.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: ARM API 调用返回 HTTP 429 Too Many Requests / SubscriptionRequestsThrottled：Number …
> 来源: mslearn

**根因分析**: ARM 对订阅/租户级别的请求实施限流（Token Bucket 算法）：Read 250/bucket 25/s refill，Write/Delete 200/bucket 10/s refill。Resource Provider（如 Microsoft.Compute/Network/Storage）也有独立限流。自动化脚本、频繁的 scale up/down、cluster autoscaler 是常见触发原因

1. 1) 检查响应头 x-ms-ratelimit-remaining-subscription-reads/writes 监控剩余配额；2) 尊重 Retry-After header 指定的等待时间；3) 减少并发请求量、降低脚本执行频率；4) 使用 Azure SDK 的自动重试机制；5) 对 metrics API 改用 getBatch API 减少调用量；6) 分散到不同订阅减轻单订阅压力.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 9: Azure Compute RP API 返回 429 Too Many Requests / OperationNotAllowed / TooManyRe…
> 来源: mslearn

**根因分析**: Compute Resource Provider (CRP) 对 Microsoft.Compute 操作有独立于 ARM 的限流策略，按操作组（HighCostGet/LowCostGet/DeleteVMScaleSet 等）分别计数限流，与 ARM 订阅级限流（x-ms-ratelimit-remaining-subscription-reads/writes）相互独立。频繁 scale up/down、cluster autoscaler、大量 LIST/GET VM 操作、未使用 location-based 查询是常见触发原因

1. 1) 区分限流来源：检查 x-ms-ratelimit-remaining-subscription-reads/writes（接近 0 = ARM 限流），否则查看 x-ms-ratelimit-remaining-resource header 确认 RP 限流的具体操作组；2) 使用 Export-AzLogAnalyticRequestRateByInterval / Export-AzLogAnalyticThrottledRequest 分析订阅内 API 调用模式和限流违规；3) 精确查询替代 list all：用 location-based 查询 /subscriptions/{subId}/providers/Microsoft.
2. Compute/locations/{location}/virtualMachines；4) 跟踪 async operation 完成（provisioningState）而非轮询 resource URL；5) 不要无条件重试或立即重试，实现 proactive client-side self-throttling；6) 尊重 Retry-After header 等待时间.

`[结论: 🔵 6.0/10 — [mslearn]]`

## Kusto 查询参考

### throttling-analysis.md
`[工具: Kusto skill — throttling-analysis.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode == 429
| summarize count() by bin(TIMESTAMP, 1h), operationName
| order by count_ desc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","HttpIncomingRequests")
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode == 429
| summarize count() by bin(TIMESTAMP, 1h), operationName
| order by count_ desc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where httpStatusCode != -1
| where operationName == "{operationName}"  // 从步骤 1 获取
| summarize count() by clientIpAddress, principalOid, clientApplicationId, userAgent, httpStatusCode
| order by count_ desc
```

### request-tracking.md
`[工具: Kusto skill — request-tracking.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, resourceUri, operationName, status, level, properties, claims
| order by TIMESTAMP asc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, resourceUri, operationName, status, level, properties, claims
| order by TIMESTAMP asc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, httpMethod, targetUri, commandName, httpStatusCode, clientIpAddress, userAgent
| order by TIMESTAMP asc
```

### arm-rp-chain.md
`[工具: Kusto skill — arm-rp-chain.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpOutgoingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where targetUri contains "{resourceName}"
| project TIMESTAMP, ActivityId, serviceRequestId, clientRequestId, targetUri, httpMethod, httpStatusCode, hostName
| order by TIMESTAMP desc
```

```kusto
// Public Cloud 查询 - 需要 ARM Prod 权限
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpOutgoingRequests")
// 请联系 ARM 团队申请权限
```

```kusto
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where activityId == "{activityId}"  // 从步骤 1 获取
| project TIMESTAMP, traceLevel, message, callerName
| order by TIMESTAMP asc
```

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ARM API returns HTTP 429 Too Many Requests when subscriptio… | ARM enforces sliding 1-hour window limits: 1200 writes and … | Reduce polling frequency of automated scripts; scope querie… |
| API calls to ARM endpoint return HTTP 429 (Too Many Request… | Client exceeded ARM request limits (reads: 12000/hour, writ… | ARM API call limits are hard limits and cannot be adjusted.… |
| API calls return HTTP 429 (Too Many Requests). Error 429 is… | Resource Provider (RP) is throttling the requests at the RP… | Transfer the case to the owning RP team. RP-side throttle l… |
| ARM API calls return HTTP 429 throttling errors, engineer n… | ARM and RP throttling are separate layers; ARM rate-limits … | Check HttpIncomingRequests table for HTTP 429 responses to … |
| API calls to ARM endpoint return HTTP 429. Error 429 visibl… | Client has exceeded ARM hard API call limits for the subscr… | ARM API limits are hard limits and cannot be increased. Mit… |
| API calls return HTTP 429. Error 429 visible in HttpOutgoin… | Resource Provider is throttling requests (not ARM). RP retu… | Transfer case to the RP-owning team. RP throttling limits m… |
| HTTP 429 throttling on specific ARM resource type operation… | Some Resource Providers define custom throttlingRules in th… | Check the RP manifest at armmanifest.visualstudio.com for t… |
| ARM API 调用返回 HTTP 429 Too Many Requests / SubscriptionReque… | ARM 对订阅/租户级别的请求实施限流（Token Bucket 算法）：Read 250/bucket 25/s r… | 1) 检查响应头 x-ms-ratelimit-remaining-subscription-reads/writes… |
| Azure Compute RP API 返回 429 Too Many Requests / OperationNo… | Compute Resource Provider (CRP) 对 Microsoft.Compute 操作有独立于 … | 1) 区分限流来源：检查 x-ms-ratelimit-remaining-subscription-reads/wr… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ARM API returns HTTP 429 Too Many Requests when subscription or tenant exceeds throttling limits | ARM enforces sliding 1-hour window limits: 1200 writes and 32000 reads per subscription/tenant. Aut… | Reduce polling frequency of automated scripts; scope queries to specific resources instead of scann… | 🟢 8.0 — onenote+21V适用 | [MCVKB/14.6 [ARM]ARM Throttling.md] |
| 2 | API calls to ARM endpoint return HTTP 429 (Too Many Requests). The failureCause field in HttpIncomi… | Client exceeded ARM request limits (reads: 12000/hour, writes: 1200/hour per principal per subscrip… | ARM API call limits are hard limits and cannot be adjusted. Solutions: (1) Optimize call patterns -… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | API calls return HTTP 429 (Too Many Requests). Error 429 is present in HttpOutgoingRequests table, … | Resource Provider (RP) is throttling the requests at the RP layer, not ARM. The 429 responses origi… | Transfer the case to the owning RP team. RP-side throttle limits can sometimes be adjusted. Use Kus… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | API calls to ARM endpoint return HTTP 429. Error 429 visible in HttpIncomingRequests but NOT in Htt… | Client has exceeded ARM hard API call limits for the subscription (ARM-level throttling) | ARM API limits are hard limits and cannot be increased. Mitigations: (1) Split calls across multipl… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | API calls return HTTP 429. Error 429 visible in HttpOutgoingRequests table matching client-side thr… | Resource Provider is throttling requests (not ARM). RP returning 429 responses to ARM's outgoing re… | Transfer case to the RP-owning team. RP throttling limits may sometimes be adjustable; all recommen… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | HTTP 429 throttling on specific ARM resource type operations (e.g., Microsoft.Insights/scheduledque… | Some Resource Providers define custom throttlingRules in their ARM manifests that override default … | Check the RP manifest at armmanifest.visualstudio.com for throttlingRules for the affected resource… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | ARM API calls return HTTP 429 throttling errors, engineer needs to determine if throttling is from … | ARM and RP throttling are separate layers; ARM rate-limits incoming requests before forwarding to R… | Check HttpIncomingRequests table for HTTP 429 responses to identify ARM-level throttling; check Htt… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | ARM API 调用返回 HTTP 429 Too Many Requests / SubscriptionRequestsThrottled：Number of requests for subs… | ARM 对订阅/租户级别的请求实施限流（Token Bucket 算法）：Read 250/bucket 25/s refill，Write/Delete 200/bucket 10/s refil… | 1) 检查响应头 x-ms-ratelimit-remaining-subscription-reads/writes 监控剩余配额；2) 尊重 Retry-After header 指定的等待时间… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 9 | Azure Compute RP API 返回 429 Too Many Requests / OperationNotAllowed / TooManyRequests，x-ms-ratelimi… | Compute Resource Provider (CRP) 对 Microsoft.Compute 操作有独立于 ARM 的限流策略，按操作组（HighCostGet/LowCostGet/De… | 1) 区分限流来源：检查 x-ms-ratelimit-remaining-subscription-reads/writes（接近 0 = ARM 限流），否则查看 x-ms-ratelimit-… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
