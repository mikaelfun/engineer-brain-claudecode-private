---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Review agent instruction set"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Review%20agent%20instruction%20set"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
The agent configuration is defined by data collection rules (DCR). The agent uses the JSON of the DCRs to define an instruction set that defines, specifically, what the agent will be collecting, the local store name of the data, the Azure data type, and where it will send that data.

# Prerequisites
This how-to assumes that you've already [Run the agent troubleshooter](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-linux?tabs=redhat%2CGenerateLogs#run-the-troubleshooter) and have those logs.

# Terms
- **Local store name:** This is the name of the file that we create locally to cache this data.
- **logType:** This is the data type when we're investigating the ingestion pipeline data. This defines the destination table.
- **DCR immutable Id:** Globally unique id for DCRs that defines which DCR we got this configuration from.
- **endpoint (uri):** This is the destination we'll be sending the data to (must be able to reach this endpoint).

With the endpoint (uri) value, [Use the workspaceID to get the resourceID](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590098/AMA-HT-Get-Log-Analytics-Workspace-ResourceID?anchor=workspaceid) of the destination Log Analytics Workspace.

# Scenario: Heartbeat
```VM|Arc: /etc/opt/microsoft/azuremonitoragent/config-cache/mcsconfig.lkg.xml```
```Troubleshooter: ...\DCR\config-cache\mcsconfig.lkg.xml```

Heartbeat entries in the agent instruction set are indicated by the logType="HEALTH_ASSESSMENT_BLOB"

![image.png](/.attachments/image-069c6614-5ab5-403d-83cd-a990a21c612f.png)

![image.png](/.attachments/image-67d1a850-bb09-4e7b-a928-b5590426325f.png)

# Scenario: Text Logs
```VM|Arc: /etc/opt/microsoft/azuremonitoragent/config-cache/mcsconfig.lkg.xml```
```Troubleshooter: ...\DCR\config-cache\mcsconfig.lkg.xml```

Text log entries in the agent instruction set are indicated by logType="Custom-<Table_CL>"

![image.png](/.attachments/image-05cde6c1-581b-4962-9046-9c9592c792a3.png)

Once the Local Store name has been identified, use this name to identify the TCP Port used by fluentbit to send text log data to AMA
![image.png](/.attachments/image-78b53920-7e2f-4d9a-a9f2-750e257fd564.png)




