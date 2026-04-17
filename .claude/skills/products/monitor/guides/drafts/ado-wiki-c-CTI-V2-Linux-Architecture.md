---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Linux/Concept/Architecture"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FChange%20Tracking(v2)%20and%20Inventory%2FChange%20Tracking%20and%20Inventory%20(CT%26I)%20V2%20-%20Linux%2FConcept%2FArchitecture"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

# Documentation 

Here is the link to documents: 

[Overview of change tracking and inventory using Azure Monitoring Agent](https://learn.microsoft.com/azure/automation/change-tracking/overview-monitoring-agent)
[Supported Regions](https://learn.microsoft.com/azure/automation/change-tracking/region-mappings-monitoring-agent)
[Enable Change Tracking and Inventory using Azure Monitoring Agent](https://learn.microsoft.com/azure/automation/change-tracking/enable-vms-monitoring-agent?tabs=singlevm)
[Configure Alerts](https://learn.microsoft.com/azure/automation/change-tracking/configure-alerts)
[Extension Version Details and Known Issues](https://learn.microsoft.com/azure/automation/change-tracking/extension-version-details)


# Architecture
---
## Overview
As for a big picture, Azure Monitor Agent (AMA) is responsible for uploading CT&I data to backend, while CT&I agent is just responsible for collecting data from Operation System and pass them to AMA  

![Picture1.png](/.attachments/Picture1-62ad6701-a3b4-490e-b12d-230a00304e00.png)


## Extension Portal view 

![image.png](/.attachments/image-f997142e-abd7-4245-b7d5-b54556a27536.png)

