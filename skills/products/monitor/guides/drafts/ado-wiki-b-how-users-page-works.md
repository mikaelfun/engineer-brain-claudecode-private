---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Portal Experiences/How the Users Page works"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FPortal%20Experiences%2FHow%20the%20Users%20Page%20works"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Insights Users Blade

## What is it?

The Users blade provides views of user traffic for apps sending data to Application Insights. It shows unique user counts over time and regional breakdowns.

## How it works

### User Count Calculation

The main chart uses `dcountif` on `user_Id` across a union of `pageViews`, `customEvents`, and `requests` tables:

```kql
let events = dynamic(["*"]);
let mainTable = union pageViews, customEvents, requests
    | where timestamp > ago(1d)
    | where isempty(operation_SyntheticSource)
    | extend name = replace("\n", "", name)
    | extend name = replace("\r", "", name)
    | where '*' in (events) or name in (events);
let resultTable = mainTable;
resultTable
| make-series Users = dcountif(user_Id, 'user_Id' != 'user_AuthenticatedId' or ('user_Id' == 'user_AuthenticatedId' and isnotempty(user_Id))) default = 0 on timestamp from ago(1d) to now() step 1h
```

To simplify and verify the count:
```kql
let events = dynamic(["*"]);
let mainTable = union pageViews, customEvents, requests
    | where timestamp > ago(1d)
    | where isempty(operation_SyntheticSource);
mainTable
| summarize dcountif(user_Id, 'user_Id' != 'user_AuthenticatedId' or ('user_Id' == 'user_AuthenticatedId' and isnotempty(user_Id)))
```

### Regional Breakdown (View More Insights)

The "Counts by region" chart uses `hll` (HyperLogLog) aggregation grouped by `client_CountryOrRegion`:

```kql
let queryTable = mainTable;
let cohortedTable = queryTable
    | extend dimension = tostring(client_CountryOrRegion)
    | extend dimension = iif(isempty(dimension), "<undefined>", dimension)
    | summarize hll = hll(user_Id) by tostring(dimension)
    | extend Users = dcount_hll(hll)
    | order by Users desc
    | serialize rank = row_number()
    | extend dimension = iff(rank > 5, 'Other', dimension)
    | summarize merged = hll_merge(hll) by tostring(dimension)
    | project ["Country or region"] = dimension, Counts = dcount_hll(merged);
```

### Why Regional Counts May Not Sum to Total

The regional breakdown uses HyperLogLog which:
1. Groups top 5 regions, merges rest into "Other"
2. May show slightly different counts due to HLL approximation
3. Empty `client_CountryOrRegion` values appear as `<undefined>`
4. Users with empty `user_Id` are excluded from the count

## Key Takeaway

Use "View in Logs" button on the Users blade to see the exact queries being used. The raw data comes from the union of `pageViews`, `customEvents`, and `requests` tables, with synthetic traffic filtered out.
