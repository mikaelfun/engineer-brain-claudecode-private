---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Analytics/[TSG] - Watchlist is Not Getting Deleted"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FAnalytics%2F%5BTSG%5D%20-%20Watchlist%20is%20Not%20Getting%20Deleted"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [TSG] Watchlist is not getting deleted

## Possible Scenarios

- Customer tried deleting Watchlist from UI. But its still present when they call `_GetWatchlist('xyz')` Log Analytic Function.
- Customer tried deleting Watchlist using API. But its still present when they call `_GetWatchlist('xyz')` Log Analytic Function.

## Good to know

- [Watchlists in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/watchlists)
- [Build queries or detection rules with watchlists in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/watchlists-queries)
- [Functions in Azure Monitor log queries](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/functions)

## What happens when you push delete operation on a Watchlist?

1. You should see activity Logs for specific Watchlist.
2. That delete operation will **write more logs in LAW** marking each **Watchlist ItemStatus from Create to Delete**.
3. `_GetWatchlist('xyz')` function will only try to get Recent logs with Watchlist Items with ItemStatus set to "Create" only.

## Troubleshooting

### Prerequisite

- subscriptionId
- Workspace ResourceID
- WatchlistAlias
- Time when it was deleted

### 1. Check activity Logs to ensure Watchlist Delete operation was Pushed and completed successfully and it was not recreated again.

Operations to Check:

```
microsoft.securityinsights/watchlists/write
microsoft.securityinsights/watchlists/delete
microsoft.securityinsights/watchlists/watchlistitems/delete
microsoft.securityinsights/watchlists/watchlistitems/write
```

**How?**

a. You can use [Infrastructure Solutions - Common Queries / Azure Activity Logs](https://dataexplorer.azure.com/dashboards/dee7f3f7-1f8c-4b09-9518-433be60836eb) Dashboard (with Ms account).

Or

b. Run below query:

```kql
let _startTime = datetime(2024-09-30T21:10:12Z);
let _endTime = datetime(2024-10-01T21:10:12Z);
let _filterall = '';
let _operationName = ''; // Must put Operation Name
let _resourceid = ''; // Must put Watchlist ResourceID or Watchlist Name
let _status = '';
let _subscriptionid = ''; // Workspace Subscription ID
cluster("armprodgbl").database("ARMProd").Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP between (_startTime .. _endTime)
| where subscriptionId == _subscriptionid
| where status contains _status
| where operationName contains _operationName
| where resourceUri contains _resourceid
| where * contains _filterall
| sort by TIMESTAMP
| project-reorder TIMESTAMP, status, operationName, operationId, resourceUri, subscriptionId
| take 100
```

Or

c. Review Activity logs with customer on call. [Use the Azure Monitor activity log and activity log insights](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/activity-log-insights)

**Once Confirmed, Delete Operation was successfully completed and was not recreated again. Go to Step 2.**

### 2. Check for New LAW logs marking each Watchlist ItemStatus from Create to Delete

Go to ASC and Run below query on Sentinel Workspace:

```kql
let watchlistAlias = ""; //watchlistAlias in question.
union Watchlist, ConfidentialWatchlist
| where TimeGenerated < now()
| where _DTItemType == 'watchlist-item'
| where WatchlistAlias == watchlistAlias
//| where _DTItemStatus != 'Delete'
| project-reorder TimeGenerated, _DTItemStatus, WatchlistAlias, WatchlistId, WatchlistItemId, SearchKey, WatchlistItem
```

**Once confirmed Step 1 and you don't see new logs with _DTItemStatus set to delete.** Your case may require an ICM to PG.

### 3. Steps to follow before submit ICM request

- Look for any similar ICMs.
- If Watchlist is still visible on UI, get screenshot and HAR of Watchlist Page.
- Bring on Triage or weekly Sentinel Expert call.

### Requirement for an ICM

- Wait for at least 24 hours from the Delete operation was performed.
- ASC with Access to run query on Sentinel Workspace (if possible, ASC is not strictly needed but is still a useful verification step)
