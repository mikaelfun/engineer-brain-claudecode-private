---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/All Alerts/How to get alert rule details from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FAll%20Alerts%2FHow%20to%20get%20alert%20rule%20details%20from%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Get Alert Rule Details from Azure Support Center

## Prerequisites
- Obtain ASC permissions (see ASC access guide)

## Steps

1. Open Azure Support Center and navigate to the support request.

2. Navigate to Resource Explorer.

3. Select the **Resource Provider** view.

4. Expand the **PROVIDERS** node and then the **microsoft.insights** resource provider node.

5. Click on the node for the desired type of alert:
   - **activityLogAlerts** - Activity Log Alerts
   - **metricalerts** - Metric Alerts
   - **scheduledqueryrules** - Log alerts / Log Search alerts

6. Click on the **Summary** tab to see all alert rules for that type:
   - Returns list with alert rule names (clickable links to navigate to each rule)
   - Use filter capabilities if there are many alert rules

7. Click on the desired alert rule name, then click on the **Properties** tab.

8. Under Properties, find details including:
   - Whether the alert is enabled
   - Resource group
   - Target resource scopes
   - Conditions defining the fire criteria
   - Last time the alert was fired
   - Action groups linked to the alert rule

**Tip**: Copy Properties info into case notes along with the ASC link for documentation.

To get the Azure resource ID of the alert, see: "How to get the ResourceId value of an Azure resource from Azure Support Center"
