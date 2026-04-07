---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Use webtest's Executions tab"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FUse%20webtest's%20Executions%20tab"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ASC — Webtest Executions Tab for Availability Test Investigation

## Overview

The Executions tab shows execution results for a specific availability test across all configured test regions. Unlike the Component's Web Tests tab (which shows all tests), this tab is centric to one specific test.

## Recommended Settings for Failure Evidence Collection

When collecting evidence for specific failed attempts:
1. **Output**: Set to `Table` (not Chart) — reveals regions and specific Response Times
2. **Aggregate By**: Set to `Location`
3. **Check**: "Only show failed tests?"

Required data for examining a specific failed execution:
- **Timestamp**
- **Location**

## Controls

### Date Time Range (UTC)
- Operates on **UTC** — convert customer-reported local time to UTC first
- Offers Relative and Absolute time range options
- **No default** — must be set before clicking Run

### Output As
- `Chart` (default) or `Table`
- Table output shows regions with specific Response Times for each execution

### Aggregate By
| Option | Description |
|:-------|:------------|
| **Location** (default) | Same as Stamp — more friendly name; use this for failure investigation |
| Stamp | Same as Location |
| Test Name | Overall test view (same as Component's Web Test tab) |
| Machine Name | Actual Azure VM name running the test — useful for specific failure scenarios |

### Only show failed tests?
- Checkbox to filter to failed tests only
- **Caution**: Removes context — no longer clear about failure rate vs total executions
- Successful tests: Only every 20th is stored; high probability successful tests will not be found
- Failed tests: All are attempted to be retained; rare to not find one, but possible

### Only show tests with Full Results?
- Not all tests return Full Results, even for successful runs

## Internal References
- [Use a Component's Web Tests tab](/Application-Insights/How-To/Azure-Support-Center/Use-a-Component's-Web-Tests-tab)
- [Use the webtests' Properties tab](/Application-Insights/How-To/Azure-Support-Center/Use-the-webtests'-Properties-tab)
- [Use webtest's Results tab](/Application-Insights/How-To/Azure-Support-Center/Use-webtest's-Results-tab)
- [Diagnose Problems That Cause Availability Tests to Fail](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/availability/diagnose-ping-test-failure)
