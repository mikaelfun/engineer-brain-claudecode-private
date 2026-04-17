---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Check performance counters in mcsconfig"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Check%20performance%20counters%20in%20mcsconfig"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Overview
The agent configuration is defined by data collection rules (DCR). The agent uses the JSON of the DCRs to define an instruction set that defines, specifically, what the agent will be collecting, the local store name of the data, the Azure data type, and where it will send that data.

## Prerequisites
This how-to assumes that you have already run the agent troubleshooter and have collected those logs.
- [Windows AMA Troubleshooter](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-windows?tabs=WindowsPowerShell#run-the-troubleshooter)
- [Linux AMA Troubleshooter](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/troubleshooter-ama-linux?tabs=redhat%2CGenerateLogs#python-requirement)

## Terms
- **Local store name:** This is the name of the file that we create locally to cache this data.
- **logType:** This is the data type when we are investigating the ingestion pipeline data. This defines the destination table.
- **DCR immutable Id:** Globally unique id for DCRs that defines which DCR we got this configuration from.
- **endpoint (uri):** This is the destination we will be sending the data to (must be able to reach this endpoint).

With the endpoint (uri) value, use the workspaceID to get the resourceID of the destination Log Analytics Workspace.

## Scenario: Performance Counters

### Config file locations
- **Windows Troubleshooter:** `...\AgentTroubleshooterOutput-{date}\AgentDataStore\Mcs\mcsconfig.latest.xml`
- **Windows VM:** `C:\WindowsAzure\Resources\AMADataStore.{VMName}\mcs\mcsconfig.latest.xml`
- **Windows ARC:** `C:\Resources\Directory\AMADataStore.{MachineName}\mcs\mcsconfig.latest.xml`
- **Linux Troubleshooter:** `.../DCR/config-cache/mcsconfig.lkg.xml`
- **Linux VM/ARC:** `/etc/opt/microsoft/azuremonitoragent/config-cache/mcsconfig.lkg.xml`

### What counters should we collect?
Navigate in the XML: `Events > CounterSets > CounterSet > Counter`

### Where should we be sending performance counters?
Using the local store name from the previous step, find the **EventStreamingAnnotation** that corresponds to determine the destination endpoint and table.
