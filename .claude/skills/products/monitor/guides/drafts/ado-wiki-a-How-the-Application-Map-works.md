---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Portal Experiences/How the Application Map works"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FPortal%20Experiences%2FHow%20the%20Application%20Map%20works"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Map Blade

## What is it?

Application Map shows correlation between apps and their calls to dependent resources during a specific time period. It is a dynamic view driven by Log queries.

## How it works

- **Dynamic view**: The map changes based on the lookback period because it queries the Application Insights Log data for that window
- Shorter lookback = fewer arrows/nodes if activity didn't occur during that time
- If no activity in the lookback period, the map shows nothing

## Application Entities (Green Circles)

The app nodes are derived from the `requests` table:
```kql
requests | summarize count() by cloud_RoleName, appId, appName, isServer=true
```

- **cloud_RoleName** is preferred for labeling; falls back to **appName** if cloud_RoleName is empty
- The count in the green circle = total request count for the lookback period

## Dependencies (Arrows)

- Dependencies are drawn from the `dependencies` table
- Green client node = instrumented, collecting telemetry
- Green backend node = also instrumented
- Non-green backend = not instrumented (no telemetry collected from that node)

## Fiddler Investigation

- Application Map queries are POST requests to `api.applicationinsights.io`
- Two API calls are made when loading the blade (one for entities, one for dependencies)
- Changing Time Range triggers new calls with updated time parameters

## Key Queries Used

The full queries (as of May/June 2020) involve complex unions of `requests` and `dependencies` tables with safeDependency datatable fallbacks, truncation limits, and entity classification logic.
