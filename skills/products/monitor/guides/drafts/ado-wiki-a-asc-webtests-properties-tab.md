---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Use the webtests' Properties tab"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FUse%20the%20webtests'%20Properties%20tab"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ASC — Webtests Properties Tab for Application Insights Availability Tests

## Overview

Shows the specific configuration properties for a defined Web Test (Availability Test). Resides under the `microsoft.insights` provider as a secondary resource type.

> **Important limitation**: Only **Classic Ping tests** expose the URL in this tab. Standard test URLs are NOT shown here. To get the URL for Standard Tests, use the [Executions tab](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/580042/Use-webtest's-Executions-tab) or Results tab.

## Resource Name Format
`WebtestName-ApplicationInsightsComponentName`

## General Resource Info
| Property | Description |
|:-------------|:-----------------|
| Resource Id | URI of the Application Insight Resource |
| Resource Name | `WebtestName-ApplicationInsightsComponentName` |
| Resource Type | Resource type name |
| Resource Location | Where the resource was created |
| Resource Subscription Id | Subscription ID |
| Resource Group Name | Resource group name |

## General Web Test Info
| Property | Description |
|:-------------|:-----------------|
| Web Test Name | Name given to the web test |
| Web Test Description | Optional description |
| **Enabled** | `True`/`False` — whether the test is active |
| **Frequency** | Rate at which the test fires (in seconds) |
| **Timeout** | Duration (seconds) the test waits for a 200 response |
| **Kind** | `Ping` or `Multi-Step` |
| **Retry Enabled** | `True`/`False` — whether test retries on non-200 result |

## Locations
List of Azure regions from which the ping test is executed.

## WebTest XML
Contains the XML definition of the test. For Classic Ping tests: includes the `Url` property (the URL being tested). Standard tests do NOT resolve here — see Executions tab.

## Linked Resources
Shows resource types linked to this Application Insight resource (legacy feature).

## Internal References
- [Use a Component's Web Tests tab](/Application-Insights/How-To/Azure-Support-Center/Use-a-Component's-Web-Tests-tab)
- [Use webtest's Executions tab](/Application-Insights/How-To/Azure-Support-Center/Use-webtest's-Executions-tab)
- [Use webtest's Results tab](/Application-Insights/How-To/Azure-Support-Center/Use-webtest's-Results-tab)
- [Diagnose Problems That Cause Availability Tests to Fail](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/availability/diagnose-ping-test-failure)
