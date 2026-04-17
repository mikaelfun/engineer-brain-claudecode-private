---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Jarvis/Determine the Workspace for AI Components set to Log Analytics Ingestion mode"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FJarvis%2FDetermine%20the%20Workspace%20for%20AI%20Components%20set%20to%20Log%20Analytics%20Ingestion%20mode"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Determine the Workspace for AI Components set to Log Analytics Ingestion mode

## Overview

Application Insights supports two ingestion modes: **Classic** and **Log Analytics**. When Log Analytics ingestion mode is in use, the "Query Customer Data" tab in ASC under the Application Insights Component resource cannot be used directly. Instead, query data from the "Query Customer Data" tab in **Log Analytics** in ASC — but first you need to know the URI to the associated Log Analytics workspace.

## Steps to Determine the Workspace for LA Ingestion Mode

1. Log into a Virtual SAW machine: see [SAW Access](ado-wiki-c-saw-access.md)
2. Start an Edge session on the virtual SAW machine
3. Access Jarvis using the steps in [Use Jarvis Actions related to AI](ado-wiki-c-use-jarvis-actions-related-to-ai.md) — authenticate with your Microsoft Corp domain account (AME account is **not** required for this operation)
4. In Jarvis, locate the Application Insights action for workspace lookup and paste in the **instrumentation key** of the AI Component
5. The result displays the **URI to the workspace** (includes the workspace name at the end of the URI)

Once you have the workspace URI, use it in the ASC Log Analytics "Query Customer Data" tab to query telemetry data for workspace-based Application Insights resources.
