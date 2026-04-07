---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Use the Component's Properties tab for an Application Insights Component"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FUse%20the%20Component's%20Properties%20tab%20for%20an%20Application%20Insights%20Component"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ASC — Application Insights Component Properties Tab Reference

## Overview

The Properties tab is the default landing tab for an Application Insights component in ASC. It shows all key configuration and status properties.

> For cases where this tab doesn't have enough detail: use the [App Insights Resource Finder detector](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1875383/Detector-App-Insights-Resource-Finder)

## General Resource Info

| Property | Description |
|:-------------|:-----------------|
| Resource Id | URI of the Application Insight Resource |
| Resource Name | Name of the Application Insight Resource |
| Resource Type | `microsoft.insights/components` |
| Resource Location | Where the resource was created |
| Resource Subscription Id | Subscription ID |
| Resource Group Name | Resource group name |

## General Component Info — Diagnostic Key Fields

| Property | Description & Diagnostic Value |
|:-------------|:-----------------|
| Application Type | web, java, hockey, other — legacy, values may still appear |
| **Flow Type** | `brownfield` = manual SDK instrumentation; `redfield` = auto-instrumentation (codeless attach); `blackfield` = App Center |
| **Request Source** | `IbizaWebAppExtensionCreate` or `AppServiceEnablementCreate` = auto-instrumentation enabled via portal; `IbizaAIExtension` = created via Portal (may or may not have data flowing) |
| **Instrumentation Key** | IKey — needed to identify the resource or validate SDK configuration |
| **Sampling Percentage** | Reflects Ingestion Data Sampling rate. `N/A` = 100% (no ingestion sampling). Does NOT mean client-side sampling is absent. |
| **Retention In Days** | Data retention. `N/A` = default 90 days. |
| **Disable IP Masking** | IP masking enabled by default. `True` = disabled. |
| **Public Network Access For Ingestion** | Default `Enabled`. If disabled, resource only accepts telemetry from private network. |
| **Public Network Access For Query** | Default `Enabled`. If disabled, queries from public network are blocked. |
| **Ingestion Mode** | See table below |
| **Workspace Resource Id** | URI to linked Log Analytics workspace (LA-based components) |
| **Disable Locale Auth** | Default `False`. If `True` → AI configured for Azure AD authentication for ingestion (no IKey auth). |

## Ingestion Mode — Diagnostic States

| Value | Meaning |
|:------|:--------|
| `ApplicationInsights` | Classic (APM 2.0) — data sent directly to AI component |
| `LogAnalytics` | Workspace-based (APM 2.1) — data sent to linked LA workspace |
| **`Disabled`** | Three possible causes: (1) Linked LA workspace was deleted → re-link to existing workspace; (2) No data sent in 90+ days → verify SDK/agent; (3) LA-based resource where ASC overrides display — use App Insights Resource Finder to confirm actual mode |

## Sampling Percentage Field
- `N/A` = no Ingestion Sampling configured (default 100%)
- A numeric value = Ingestion Sampling percentage set under "Usage and Estimated costs > Data Sampling"
- Note: Client-side adaptive sampling is separate and NOT shown here — see [Sampling](/Application-Insights/Concepts/Sampling)

## Internal References
- [App Insights Resource Finder detector](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1875383/Detector-App-Insights-Resource-Finder)
- [LACP Dashboard for LA workspace properties](/Application-Insights/How-To/Diagnostics-and-Tools/Tools/Collect-Log-Analytics-workspace-properties-using-LACP-Dashboard)
