# Kusto ARM/Activity Log Queries for Mooncake

> Source: OneNote - Mooncake POD Support Notebook / MONITOR / Log Analytics / Troubleshooting / Kusto
> Quality: draft | Needs review before promotion

## Overview
Kusto queries for checking Activity Log and ARM requests in Mooncake using the armmc cluster. Useful for troubleshooting action group operations, resource deployments, and subscription-level events.

## Cluster Endpoints
| Period | Endpoint |
|--------|----------|
| Before Jun 8th | `https://armmc.kusto.chinacloudapi.cn` |
| After Jun 8th | `https://armmcadx.chinaeast2.kusto.chinacloudapi.cn` |

**Note**: Query both clusters with `union` to cover full history.

## Required Permissions (MyAccess)
- FC Log Read-Only Access - 12894
- ARM Logs

## Query Samples

### Check Activity Log for Subscription
```kql
union cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries,
      cluster('armmc.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where PreciseTimeStamp > ago(7d)
| where subscriptionId == "<subscription-id>"
```

### Check ARM Requests for Action Group
**Step 1**: Get ActivityId from front door
```kql
union cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests,
      cluster('armmc.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where subscriptionId == "<subscription-id>" and TIMESTAMP > ago(1d)
| where operationName contains "MICROSOFT.INSIGHTS"
    and operationName == "PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.INSIGHTS/ACTIONGROUPS/"
| project PreciseTimeStamp, errorCode, clientRequestId, subscriptionId, ActivityId, correlationId, httpStatusCode, targetUri
| limit 100
```

**Step 2**: Get action group details via ActivityID (use ActivityId from Step 1 to drill down)

## 21v Applicability
Both clusters are China-specific (`chinacloudapi.cn`). These queries are Mooncake-only.
