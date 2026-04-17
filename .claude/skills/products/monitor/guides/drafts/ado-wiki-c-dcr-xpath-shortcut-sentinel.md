---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Data Collection Rules (DCR)/How-To/Shortcut Way to Create XPath Queries for Microsoft Sentinel DCRs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Data%20Collection%20Rules%20%28DCR%29/How-To/Shortcut%20Way%20to%20Create%20XPath%20Queries%20for%20Microsoft%20Sentinel%20DCRs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

Note: All data and machine names in this page are from test lab and don't compromise any Pii data.


[[_TOC_]]

# Public Article
https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-rule-azure-monitor-agent?tabs=portal#extract-xpath-queries-from-windows-event-viewer

# Background
XPath queries are something you�ll need to become comfortable with creating to use Data Collection Rules (DCRs) that are part of using the new agent � the Azure Monitor Agent (AMA).


# The Trick
However, there�s a shortcut trick to creating your XPath queries using good, old Event Viewer.
Open up Event Viewer on any Windows system and select the log file where you want to pull Event IDs from.

1.  Choose the Filter Current Log� option, then�

1. Enter the Event IDs you want to collect, and then�

1. Go to the XML tab in the filter to find the XPath query.

![image.png](/.attachments/image-8138212d-41d3-4e4e-b8af-e6e7c160a6e8.png)

4. Lastly, take the XPath query part (as shown in the next image), and copy and paste it into your new DCR in the Windows Security Events Data Connector.

![image.png](/.attachments/image-dd17b93b-37d2-4960-91ca-a5ccc1d93f71.png)