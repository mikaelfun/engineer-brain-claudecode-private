---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Analytics/[Product Knowledge] - Watchlist How to recover them"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FAnalytics%2F%5BProduct%20Knowledge%5D%20-%20Watchlist%20How%20to%20recover%20them"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**[Product-Knowledge] Watchlist How to recover them**

# Recovering Watchlist

## Possible Scenarios
- The customer has accidentally deleted certain Watchlist using UI.
- The customer has deleted Watchlist using some script/automation.

## Recovering
1. Get Watchlist's alias.
2. Get the user object id that deleted the Watchlist.

        It can be found from azure activity log under "claims".
        Look for log with operation "Microsoft.SecurityInsights/watchlists/delete"
3. Use query below

        let _entity = "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx"; //user, Identity object id, which can be found from azure activity logs under "claims"
        let _watchlistAlias = 'test';
        union Watchlist, ConfidentialWatchlist
        | where TimeGenerated < now()
        | where _DTItemType == 'watchlist-item'
        | where _DTItemStatus == 'Delete'
        | where WatchlistAlias == _watchlistAlias
        | where UpdatedBy.objectId == _entity
        | summarize hint.shufflekey=_DTItemId arg_max(_DTTimestamp, _DTItemStatus, LastUpdatedTimeUTC, SearchKey, WatchlistItem, WatchlistAlias) by _DTItemId
        | project-away _DTTimestamp , _DTItemId
        | evaluate bag_unpack(WatchlistItem)
        | project-reorder LastUpdatedTimeUTC, _DTItemStatus, WatchlistAlias
4. Export the result to CSV.
5. Advise customer, Using LastUpdatedTimeUTC remove old and unrequired columns.
6. Create new CSV with WatchlistItems only.
7. Create new Watchlist using CSV file you just created.
