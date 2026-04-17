---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/AppGW - how to identify load distribution across backend pool and generate graphs"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAppGW%20-%20how%20to%20identify%20load%20distribution%20across%20backend%20pool%20and%20generate%20graphs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Description

This article will help to identify the load distribution across the backend pool of an AppGW.

## Scenario

Customer is complaining about the uneven load distribution across the backend pool VMs behind the AppGW.

## Cause

We would like to show the customer that this is not the case and the load is actually distributed correctly OR we want to verify if this is the correct behavior the customer is complaining about to further troubleshooting.

## Resolution

Use the AppGWAnalyser Excel tool and Jarvis query to generate load distribution tables and graphs:

1. Use [this Jarvis query](https://portal.microsoftgeneva.com/7ACA76B5) to get AppGW access logs for the relevant time period.
2. Download the results clicking on the download button next to the refresh button on the Jarvis table.
3. Extract the CSV file.
4. Open the AppGWAnalyser.xlsx file (available from internal SharePoint — request from Cristian Critelli).
5. It will show previously loaded sample data — ignore it.
6. Click on **Data** tab → **Queries & Connections**. A flyout will open on the right.
7. Right-click on **APPGWLogs** → **Edit**. A Power Query editor window opens.
8. Right-click on **Source** → **Edit Settings**.
9. Browse to your CSV file extracted using Jarvis Query, select it, hit OK.
10. Click **Close & Load** on the top left corner.
11. Wait for the data to be imported and processed.
12. Browse through the bottom tabs to see data/graphs/tables showing load distribution per backend.
13. You can copy/paste the graphs directly into emails without screenshotting.

> **Important**: If you add internal/sensitive variables to the graphs/tables, **DO NOT share those tables/graphs with the customer**.

## Contributors

Cristian Critelli
