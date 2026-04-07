---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Use a Component's Web Tests tab"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FUse%20a%20Component%27s%20Web%20Tests%20tab"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Use a Component's Web Tests tab

## Overview

The Application Insights Component Web Test tab is a good place to start to identify Availability Test issues that might be occurring or occurred, especially when only an Application Insights Component name is provided by the user.

## Considerations

- It works for both "Classic" and the "Standard" Availability Tests one creates within Application Insights resource.
- This tab allows for quick identification of Web Tests associated with Application Insights Component and the status of recent Web Tests executions.
- This experience is designed for a high-level inspection. Investigation into actual failures and getting details on the definition of the Availability Test are done under the actual "webtests" sub resource type.

## Step by Step Instructions

- The Web Test Executions is driven by two drop downs and a couple of checkboxes.

- **Date Time Range (UTC)**
   - This drop down sets the time range to examine and operates on UTC time, so be sure to convert if the reported time of the issue is in local time.
   - Like other places in ASC it offers both Relative and Absolute time range options.
   - It has no default so setting a range is required prior to using the "Run" button.

- **Output as**
   - This drop down has two options: "Chart" or "Table". Chart is the default.
   - Table output will show regions of execution and specific Response Time.
   - The Name column in the table output and values shown in the legend of the chart will map to the actual name of the web test defined in the Application Insights Component.

- **Only show failed tests?**
   - A checkbox to be used to only return the "Failed" tests. Using this removes context from the problem because it is no longer clear of the rate and range of failures.

- **Only show tests with Full Results?**
   - Not all tests return Full Results and this is true even for successful runs.

## Public Documentation

- [Diagnose Problems That Cause Availability Tests to Fail in Application Insights](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/availability/diagnose-ping-test-failure)

## Internal References

- [Use the webtests' Properties tab](/Application-Insights/How-To/Azure-Support-Center/Use-the-webtests'-Properties-tab)
- [Use webtest's Executions tab](/Application-Insights/How-To/Azure-Support-Center/Use-webtest's-Executions-tab)
