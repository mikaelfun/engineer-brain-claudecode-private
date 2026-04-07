# ARM ARM API 限流与 429 错误 — 排查速查

**来源数**: 9 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
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

## 快速排查路径
1. Reduce polling frequency of automated scripts; scope queries to specific resour… `[来源: onenote]`
2. ARM API call limits are hard limits and cannot be adjusted. Solutions: (1) Opti… `[来源: ado-wiki]`
3. Transfer the case to the owning RP team. RP-side throttle limits can sometimes … `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/arm-throttling.md#排查流程)
