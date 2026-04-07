---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Activity Log Alerts/How to determine which evaluation engine processes an Activity log alert rule in Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FActivity%20Log%20Alerts%2FHow%20to%20determine%20which%20evaluation%20engine%20processes%20an%20Activity%20log%20alert%20rule%20in%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to determine which evaluation engine processes an Activity log alert rule in Azure Support Center

## Instructions

1. Open ASC from the support request
2. Navigate to Resource Explorer
3. Locate the desired activity log alert rule from the left hand navigation. This can be done either using the **Resource Group** structure or by selecting providers and expanding the **microsoft.insights** provider and then **activityLogAlerts**, then click on the activity log alert rule name.
4. Click on the **Properties** tab and observe the value of the **Evaluation version** field.

   - **V1** - alert rule was not migrated and uses the legacy engine.
   - **V2** - alert rule was migrated and runs in the new engine.
