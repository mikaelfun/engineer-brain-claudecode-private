---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Activity Log Alerts/How to get Activity Log Alert changes for all alerts from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FActivity%20Log%20Alerts%2FHow%20to%20get%20Activity%20Log%20Alert%20changes%20for%20all%20alerts%20from%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to get Activity Log Alert changes for all alerts from Azure Support Center

## Instructions

1. Open ASC from the support request
2. Navigate to Resource Explorer
3. Click on **Resource Providers** to switch the left hand navigation to showing data by providers rather than by resource groups.
4. Under **Providers** click on **microsoft.insights**.
5. Click the **Log Alerts Summary** tab.
6. Click the **ARM/RP logs** tab.
7. Select the desired start and end time and click **Run**. The start and end timestamps must represent a maximum of a 7-day span but can go back up to 30 days.
8. **ARM Operations** section: provides details of the Azure Resource Manager request and results.
9. **RP Operations** section: provides details from the resource provider perspective, including JSON payload.
