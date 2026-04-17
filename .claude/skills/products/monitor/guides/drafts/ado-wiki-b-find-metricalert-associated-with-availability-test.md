---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Find metricalert associated with an Availability Test"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FFind%20metricalert%20associated%20with%20an%20Availability%20Test"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

#Overview
___
To find the metric alert in ASC related to Application Insights Availability Tests, both Classic and Standard.

#Considerations
___
This is important because most of the time the availability test alert is shared when a case is created but not the associated metric alert. Knowing both allows deeper investigation on first contact with fewer questions to the user.

#Workflow
___
1. Availability test automatically creates an alert rule named using: `{availabilitytestname}-{AppInsightComponentName}`
   - Example: `mhiishostforai-mathofamainappinishtscus`

1. `metricalerts` are found under the `microsoft.insights` provider in the Resource Explorer.

1. Locate the metric alert in the Resource Explorer sorted by Provider. The Application Insights Component name appears after the hyphen in the metric alert name.

1. In the Portal, the relationship between the alert rule, availability test, and Application Insights Component is visible.

1. Using the ellipses on an Availability Test there is an option to **'Open Rules (Alerts) page'** — this shows the alert rules page with the metric alert named as noted above.

1. Key fields in the metric alert:
   - **Name**: formatted as `{availabilitytestname}-{AppInsightComponentName}`
   - **Condition**: threshold to fire the alert (default: ≥2 regions = 40% failures)
   - **Target Scope**: the Application Insights Component resource name
   - **Signal type**: Metrics (MDM, not a log alert)
   - **Status**: enabled or disabled

1. All this information is exposed in ASC so the issue can be investigated with very little information from the user.


#Public Documentation
___
- [Application Insights availability tests](https://learn.microsoft.com/azure/azure-monitor/app/availability?tabs=standard)

#Internal References
___
- [Use metricalerts Properties tab for Application Insights Availability Test](/Application-Insights/How%2DTo/Azure-Support-Center/Use-metricalerts-Properties-tab-for-Application-Insights-Availability-Test)
- [Use metricalerts Fired Alerts tab for Application Insights Availability Test](/Application-Insights/How%2DTo/Azure-Support-Center/Use-metricalerts-Fired-Alerts-tab-for-Application-Insights-Availability-Test)
- [Use Azure Monitor Metrics](/Application-Insights/How%2DTo/Azure-Support-Center/Use-Azure-Monitor-Metrics)

___
Last Modified: 2024/07/15
Last Modified By: matthofa
