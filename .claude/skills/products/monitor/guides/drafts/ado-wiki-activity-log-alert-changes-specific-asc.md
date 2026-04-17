---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Activity Log Alerts/How to get Activity Log Alert changes for a specific alert from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FActivity%20Log%20Alerts%2FHow%20to%20get%20Activity%20Log%20Alert%20changes%20for%20a%20specific%20alert%20from%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to get Activity Log Alert changes for a specific alert from Azure Support Center

## Instructions

1. Open ASC from the support request
2. Navigate to Resource Explorer
3. Locate the desired activity log alert rule using the **Resource Group** structure or by expanding **microsoft.insights** > **activityLogAlerts**, then click on the alert rule name.
4. Click on the **Operations** tab.
5. Populate the **Start Time - End Time** date and time picker with the time range to query, then click **Run**.
6. **ARM Operations** section: provides details of the Azure Resource Manager request and results for the operation performed.
7. **RP Operations** section: provides details from the resource provider perspective, including the actual JSON payload for the operation.
