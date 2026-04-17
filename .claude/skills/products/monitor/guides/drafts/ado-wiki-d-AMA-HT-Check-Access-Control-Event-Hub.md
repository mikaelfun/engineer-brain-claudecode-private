---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Check access control for Event Hub"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Check%20access%20control%20for%20Event%20Hub"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This how-to will demonstrate how to check what permissions a user-managed identity has on an Event Hub.

# Prerequisites
You must have the objectId of the user managed identity:
[AMA: HT: Azure Resource Graph Queries - Scenario: Managed Identiy](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2143191/AMA-HT-Azure-Resource-Graph-Queries?anchor=scenario%3A-managed-identity)

# Azure Support Center
Resource Explorer > Select Event Hub > Access Control (tab) > Check access > Enter objectId (from above)

Verify that the [required role](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/send-event-hubs-storage?tabs=linux%2Cwindows-1#permissions) exists.
![image.png](/.attachments/image-0c8f7b3a-0116-4622-a88f-c082e4ec54ea.png)