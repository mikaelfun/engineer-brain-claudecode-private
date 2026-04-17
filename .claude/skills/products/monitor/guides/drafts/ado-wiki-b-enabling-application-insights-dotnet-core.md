---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/App Service Web app .Net Core/Enabling Application Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Autoinstrumentation/App%20Service%20Web%20app%20.Net%20Core/Enabling%20Application%20Insights"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

:::template /.templates/Sandbox-Header.md
:::


[[_TOC_]]


# Overview
---
This covers the steps on how to enable Application Insights on an App Services Web Application running .Net Core.

This experience is common to all such supported instrumentation scenarios on App Services and while rather straight-forward it is important to understand as it is one of the most commonly used means used by customers.


# Workflow
---

<details><summary>Enable Application Insight for Azure Web Application</summary>

## Enable Application Insight for Azure Web Application
-----

1. This experience occurs after an actual .Net Core web application has been deployed to the App Service web app and where Application Insights was NOT enabled at creation time.
1. Go to the App Services on the Azure portal, https://port.azure.com/#browse/Microsoft.Web%2Fsites
1. Select the previously deployed .Net Core App Services web from the Build section
1. Once at the web app choose "Monitoring" on the far-left and then click "Application Insights" and the following experience is seen:
   - ![image.png](/.attachments/image-e1663a3b-b3fb-4caf-833a-411a2b926d5b.png)
1. Click "Turn on Application Insights" and this will present the user with options to configure Application Insights to send its telemetry to a selected Application Insight Component, as seen below. 
   - In this experience a new or an existing Application Insight resource can be configured to be used.
   - Below shows using existing Application Insights resource named, "codelessattachsamples"
   - ![image.png](/.attachments/image-4b7ef84f-55ac-4f17-92eb-d91acd67cae4.png)
1. Scrolling further down this experience below the list of existing Application Insights Components the "Instrument your application" section is seen and shown below, for now ignore this and move to the next step below
   - ![image.png](/.attachments/image-44179e6c-2e79-4d7f-9a84-00d860f74bb3.png)
1. Hit the "Apply" this will prompt with a warning that the web app will be restarted. A restart impacts the application and makes it temporarily unavailable to users. 
   - ![image.png](/.attachments/image-61c56a74-08aa-4ee8-a41e-cedf8828867d.png)
1. Choosing "Yes" and letting the application restart allows the mechanism built into Application Services web app's to know to inject the Application Insights binaries into the web application upon start up.
1. Enabling autoinstrumentation through App Services will result in several Environment variables being created for Application Insights to use. These environment variables and their values can be seen by going to "Settings" and then choose "Environment variables". The default values for these Application Insights .Net Core application environment variables can be seen below. 
   - The meaning of these variables and their values are beyond the scope of this material.
   - However some of them will be discussed in the next section.
   - ![image.png](/.attachments/image-2a4fce4f-597f-419a-867e-52751a033e43.png)
</details>

<details><summary>Configuring Application Insights autoinstrumentation</summary>

## Configuring Application Insights autoinstrumentation
-----
1. There are some basic key configurations to call out that drive key functionality of Application Insights. 
1. Go to the web app, and under "Monitoring" choose Application Insights and the experience looks as below, the top half of the experience shows   the Application Insight component to be used and the bottom half shows "Instrument your application".
   - ![image.png](/.attachments/image-70bec232-95db-4145-b573-fdf88e096cab.png)
1. Under the "Instrument your application", choose the .Net Core option given that is the language of this web app being used and the following options is presented.
   - "Collection level". This is a bit of misnomer as there are no levels today, it is either "Disabled" which is "off" or "Recommended" which is "On". Other languages might different values here such "Basic"
   - "Interop with Application Insights SDK". This is a powerful feature only available for .Net Core applications. Turning this option "On" tells the existing Application Insights Classic SDK enabled manually to be ignored and ONLY uses autoinstrumentation. This is useful in scenarios where after enabling Application Insights a failed "attach" occurs, commmonly referred to as "backed off" due to a partially manual instrumented SDK.
   - "Profiler and Snapshot debugger" are both advanced features out of scope here.
   - SQL Commands. this feature has very specific requirements to function. What is it offers is insight into the specific TSQ: SQL operation being executed by the Microsoft.Data.SQLClient. 
   - Be aware these settings will have direct impact on the related Environment variables noted previously. 
   - ![image.png](/.attachments/image-d29f43da-134f-405e-80be-949e03175e75.png)
 
 

</details>�


# Public Documentation
---
- [Advanced SQL tracking to get full SQL query](https://learn.microsoft.com/azure/azure-monitor/app/asp-net-dependencies#advanced-sql-tracking-to-get-full-sql-query)

# Internal References
---
- NA


---
Last Modified date: October 10, 2024
Last Modified by: matthofa
