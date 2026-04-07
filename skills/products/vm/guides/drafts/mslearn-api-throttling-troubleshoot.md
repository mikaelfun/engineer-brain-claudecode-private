# Azure Compute API Throttling Troubleshooting

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshooting-throttling-errors

## Overview

Azure Compute requests may be throttled at subscription and per-region level. HTTP 429 (Too Many Requests) is returned when rate limits are exceeded.

## Key Concepts

### ARM vs CRP Throttling
- **ARM throttling**: Check `x-ms-ratelimit-remaining-subscription-reads` (GET) or `x-ms-ratelimit-remaining-subscription-writes` (non-GET). If approaching 0 → ARM limit reached.
- **CRP throttling**: If ARM headers show remaining capacity, throttling comes from target resource provider (CRP).

### Response Headers
| Header | Description |
|--------|-------------|
| `x-ms-ratelimit-remaining-resource` | Remaining API call count for specific policy/bucket |
| `x-ms-request-charge` | Number of call counts "charged" for this request |

### Error Response Format
```json
{
  "code": "OperationNotAllowed",
  "message": "The server rejected the request because too many requests have been received...",
  "details": [{"code": "TooManyRequests", "target": "HighCostGet", ...}]
}
```
- `Retry-After` header provides minimum seconds before retry.

## Diagnostic Tools
- `Export-AzLogAnalyticRequestRateByInterval` — API request rate statistics
- `Export-AzLogAnalyticThrottledRequest` — throttling violations per operation group

## Best Practices
1. Do NOT retry unconditionally or immediately on errors
2. Implement proactive client-side self-throttling when available call count drops low
3. Respect `Retry-After` header for async operations
4. Query specific VM directly instead of listing all VMs and filtering client-side
5. Use location-based queries: `GET /subscriptions/<subId>/providers/Microsoft.Compute/locations/<location>/virtualMachines`
6. Track returned async operation to completion rather than polling resource URL
