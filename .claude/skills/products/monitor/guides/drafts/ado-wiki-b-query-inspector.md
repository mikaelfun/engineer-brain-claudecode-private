---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Grafana/How-To/Investigating Queries with Query Inspector"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FManaged%20Grafana%2FHow-To%2FInvestigating%20Queries%20with%20Query%20Inspector"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Investigating Queries with Query Inspector

## Overview

The Query Inspector in Azure Managed Grafana helps troubleshoot:
- Customer queries not producing data or desired data
- Issues with dashboard panels
- Slow-loading panels

## How to Access

At the bottom of each query panel, find buttons for **Query History** and **Inspector**:
- In a dashboard: click on the panel > Edit
- In Explore: directly available below the query editor

## Query Inspector Tabs

- **Stats**: Query processing time and returned row count. Useful when customer reports slow-loading panels.
- **Query**: Full request details including target data source and all parameters. Click the blue refresh button if data doesn't load immediately.
- **JSON**: Panel JSON for copy/paste to create new panels or share for analysis.
- **Data**: Returned data with transformations applied (table view with raw data).
- **Error** (only appears on errors): Error details from the query. Useful for troubleshooting dashboard errors.

The inspector is valuable for investigating queries and exporting data for repro scenarios (JSON can recreate a visualization).

## Query History

- Shows a list of queries executed through the panel, filterable
- **Starred tab**: Bookmarked queries
- **Settings**: Configure query history behavior
- Useful for going back to a working query version or sharing queries

## Resources

- [Grafana | Panel Inspect View](https://grafana.com/docs/grafana/latest/panels-visualizations/panel-inspector/)
- [Grafana | Query Management](https://grafana.com/docs/grafana/latest/explore/query-management/)
