---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Determine the ANT Version or Antares Build Version"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FDetermine%20the%20ANT%20Version%20or%20Antares%20Build%20Version"
importDate: "2026-04-05"
type: troubleshooting-guide
---

#Overview
___
This article provides guidance for the current version of Antares Build Version that a customer's App Service may be running. This is often referred to as **ANT version**.

#Considerations
___
- Application Insights auto-instrumentation implementation is integrated with the App Services Antares Build VM Image. For instance, if we need to update the App Insights .NET SDK version from 2.21 to 2.22 for App Services auto-instrumentation implementation, the SDK team will have to work with App Services team to make sure the updated SDK gets included in the next Antares build and release.
- You will often hear product team, or escalation teams, mention it's in "ANT 101" or the next ANT version. They are referencing this Antares Build Version value.
- These Antares build images are slow to release. Three to six months is not uncommon to wait for the next version which may include a large fix customer could be waiting on.
- This approach works for App Services and Azure Function resources running on either Windows or Linux operating systems.

#Workflow - ASC
___
1. Go to AppLens and enter the name of the App Service resource you want to investigate.
1. Search and select the '**Antares Version - Worker Details**' option in the upper, left filter.
1. Once the detector displays, view the ANT version in the table output, specifically the **Antares Build Version** field value (e.g., "ANT101").

#Workflow - Kudu
___
1. Using the Azure Portal, from the App service or Azure Function resource, search for "kudu" or "Advanced Tools" in the resource menu search box.
1. Select Advanced Tools resource menu selection and then select the **Go** link to open the Kudu administrative site.
1. The ANT Version is displayed directly on the Kudu home tab (e.g., "ANT 101").

#Public Documentation
___
N/A

#Internal References
___
N/A

___
Feedback? Contact Todd Foust (toddfous)
Last Modified: 4/8/2024
