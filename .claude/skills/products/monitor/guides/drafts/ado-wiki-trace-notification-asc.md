---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Action Groups and Notifications/How to trace an Azure Notification in Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FAction%20Groups%20and%20Notifications%2FHow%20to%20trace%20an%20Azure%20Notification%20in%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to trace an Azure Notification in Azure Support Center

> **Note**: Notification Diagnostic logging is NOT supported for Service Health or Test Notification IDs in both Jarvis or Azure Support Center.

## Prerequisites

- You need access to Azure Support Center (ASC)
- You need the Azure Notification ID (NotificationId)

## Instructions

1. Open Azure Support Center from the support request.

2. Navigate to the Resource Explorer.

3. Locate the desired action group from the left hand navigation. This can be done either:
   - Using the **Resource Group** structure, OR
   - By selecting providers and expanding the **microsoft.insights** provider → **actionGroups** → click the desired action group.

4. Click on the **Notification Diagnostic Logs** tab.

5. In the **Dgrep Logs** section, populate the **AzNS Receipt Id/Notification Id** text box with the Azure Notification identifier, then click **Run**.

6. The result will be a dump of the Jarvis logs for that notification ID.

## Tips

- To make the logs easier to read and to copy/paste to case notes, you can export the results to Excel using the export button.
- There may be a delay in trace logging availability.
