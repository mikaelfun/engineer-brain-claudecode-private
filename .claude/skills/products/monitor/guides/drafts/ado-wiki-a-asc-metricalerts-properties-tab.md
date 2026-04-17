---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Use metricalerts Properties tab for Application Insights Availability Test"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FUse%20metricalerts%20Properties%20tab%20for%20Application%20Insights%20Availability%20Test"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ASC — Metric Alert Properties Tab for Application Insights Availability Test

## Overview

Used to understand the criteria and configuration of a metric alert associated with an Application Insights availability test (both Classic and Standard).

## Properties Tab — Four Sections

### Section 1: Core Alert Properties
Key fields:
- **Enabled**: True/False — is the alert rule active?
- **Last Fired**: Most recent trigger timestamp
- **Target Resource Scope**: Points to the Application Insights Component where the metric is sourced
- **Criteria**: Threshold definition — for Availability Tests: `WebtestLocationAvailabilityCriteria`
- **Evaluation Frequency**: How often the metric value is checked
- **Period**: Look-back window used during each evaluation

### Section 2: Rule Last Updated
- "Rule Last Updated" — last time the alert rule was modified (important for recent changes)

### Section 3: Backend Details
- **MDM Namespace**: `ApplicationInsights`
- **MDM Metric**: `availabilityResults/duration`

### Section 4: Payload & Monitor Configuration
Contains the full JSON of threshold evaluation. Key items to find:

**Default threshold**: `Failed locations >= 2` (users can modify this via Alert Rules portal page)

To locate threshold in the JSON payload:
1. **Operator** (not user-adjustable): Search the page for `"Comparator"` — this shows the comparison operator
2. **Threshold value**: Scroll to the bottom — comma-delimited list of value pairs is present, and the threshold condition is displayed just above this list

> **Important**: Because this is not a standard metric alert rule, it is not fully replicable in the portal or ASC. The threshold must be identified directly from the JSON payload.

## Related Tabs
- [Use metricalerts Fired Alerts tab](/Application-Insights/How-To/Azure-Support-Center/Use-metricalerts-Fired-Alerts-tab-for-Application-Insights-Availability-Test) — to see when the alert actually triggered
- [Use Azure Monitor Metrics](/Application-Insights/How-To/Azure-Support-Center/Use-Azure-Monitor-Metrics)
