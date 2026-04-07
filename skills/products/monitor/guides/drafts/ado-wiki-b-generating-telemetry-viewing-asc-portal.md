---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/App Service Web app .Net Core/Generating telemetry and viewing it in ASC and Portal"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Autoinstrumentation/App%20Service%20Web%20app%20.Net%20Core/Generating%20telemetry%20and%20viewing%20it%20in%20ASC%20and%20Portal"
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
This is a guide for generating telemetry with the java-based web application built during this exercise which was autoinstrumented with Application Insights. 

It assists in: 
- ensuring that the Application Insights configuration is correct and working 
- shows how to verify using both the portal and internal tools what SDK version is being used


# Workflow
---

<details><summary>Generate Telemetry</summary>

## Generate Telemetry
-----
<br>
Use below steps to generate telemetry with Java-based applications configured with application insight. This will ensure instrumentation was successful and telemetry can reach the ingestion endpoint.

1. Go to the Azure portal and the App Service Web app created previously. The following experience should be seen:
- ![image.png](/.attachments/image-3a638800-7fec-4749-bdcf-1699464e7bdb.png)
1. Click the link to the right of the 'Default domain:' on the right in the image above.  This will launch a browser session of the web application. 
1. Now hit refresh a couple times. Each time this action causes the autoinstrumented SDK loaded into the web application to generate request telemetry via the default auto-collection it is supposed to do. The autoinstrumented SDK then sends the telemetry the designated region ingestion endpoint specified in the Connection String.
<br>
</details>

<details><summary>View Telemetry in Azure Portal</summary>

## View Telemetry in Azure Portal
-----
<br>
The below leverage how to use the portal to validate and see telemetry sent to Application Insights.

1. Navigate to Azure Portal go to the Application Insight's component configured with the web application being used here. 

1. On this Overview page one should see the request telemetry surfaced in the tiles presented:
   - ![image.png](/.attachments/image-a8108084-7aa7-46ee-8c04-a5b1e4a81818.png)

1. Now navigate to "Logs" within the Application Insight Component, switch to "KQL mode" and execute below query to check data ingestion. 
    ``` requests | where timestamp >= ago(24h) | project timestamp, url, sdkVersion, cloud_RoleName, cloud_RoleInstance ```
   - It should return results similar to image below.
   - **Note:** The results shown below have two different web applications sending telemetry to the same Application Insights Component. This know by the values in cloud_RoleName. This was the domain name of the web app used in the images in this lab, "mynetcorewebapp-e2dyhbf9g5d3fzgf.eastus2-01".
   - ![image.png](/.attachments/image-9eafc254-0546-4cd9-9d3c-97353576c809.png)

1. Examine some the fields used in the query
   - timestamp is the time the request happened, it defaults in the portal to UTC time
   - url is the URL used to access the application; it can help identify the source of the request telemetry along with cloud_RoleName
   - sdkVersion is important it tells use the version but also many other details such language, platform, instrumentation method ***(See Internal References section below)***
   - cloud_Rolename typically maps to the App Services Web name. It is means to distinguish telemetry from a specific application when one Application Insight Component is housing telemetry from multiple applications.
   - cloud_RoleInstance is a specific instance of the application running, there could be several for a single application

1. Navigate to "Transaction Search", check telemetry data here by changing time range in time bubble. It will show telemetry data of any type, along with graphical representation of telemetry received.
   - ![image.png](/.attachments/image-20470ce6-ab2e-45a9-8ebc-a6142f4bdb3b.png)

1. The filter options along the top can be used to set the cloud_RoleName so telemetry from just specific application is shown, see below:
   - ![image.png](/.attachments/image-e4783fa7-260b-4086-8c7f-b70c4cf4bdf7.png)

<br>

</details>

<details><summary>View Telemetry in Azure Support Center (ASC)</summary>

## View Telemetry in Azure Support Center (ASC)
-----
<br>

Validating data in ASC is a very important part of the troubleshooting process as it allows CSS engineers to review and understand the data being sent to Application Insights without the need of asking the customer. 
This helps the engineer paint a clearer picture of the issue and allows engineers to create more accurately formulated problem statements and details of the issue in the FQR. This helps narrow down the issue by seeking confirmation around the problem based on the data reviewed, set expectations of the problem to be resolved.

1. Use [Azure Support Center](/Application-Insights/How%2DTo/Azure-Support-Center)

1. Navigate to ASC and locate the Application Insights resource in question. - [Locate Application Insights resources in ASC](/Application-Insights/How%2DTo/Azure-Support-Center/Locate-Application-Insights-resources-in-ASC)

1. On the component, select the "Query Customer Data" tab, more info found here: [Use Query Customer Data tab](/Application-Insights/How%2DTo/Azure-Support-Center/Use-Query-Customer-Data-tab).

1. On the "Query Customer Data" tab use below query data in the component to check and see if data was ingested. This query or others help get the SDK Version, telemetry reporting along with cloud role name and instance name just as would be done in the Azure Portal. This is how engineers can validate that the SDK, telemetry, and applications sending or not sending telemetry. 
    ```union * | where timestamp >= ago(24h) | project timestamp, sdkVersion, itemType,  cloud_RoleName, cloud_RoleInstance```
    - ![image.png](/.attachments/image-1200267a-8643-482d-b59e-e52379d4c80c.png)
1. In regards to the above image, note: 
   - the itemType column has been adjusted to only show records that came from the "requests" table. 
   - the values in the cloud_RoleName like in the portal experience telemetry from multiple applications is being sent this Component

1. The Ingestion tab within ASC is also a powerful tool, to see what is coming into an Application Insights resource. It is a similar but different view than the Query Customer Data experience. See: [Use Ingestion tab](/Application-Insights/How%2DTo/Azure-Support-Center/Use-Ingestion-tab)
   - The graph presents an aggregated view of all telemetry flowing into this Application Insights Component so what is presented here needs to be considered carefully as gives an impression telemetry is flowing in it can hide that fact it is NOT flowing in from a specific web application.
   - ![image.png](/.attachments/image-f2467d5b-b67d-4cbf-93b3-1ee55a19d569.png)

<br>

</details>

# Public Documentation
---
- [Application Insights overview](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Application Insights : Experiences](https://learn.microsoft.com/azure/azure-monitor/app/overview-dashboard)


# Internal References
---
- [Azure Support Center](/Application-Insights/How%2DTo/Azure-Support-Center)
- [Use Query Customer Data tab](/Application-Insights/How%2DTo/Azure-Support-Center/Use-Query-Customer-Data-tab)
- [Use Ingestion tab](/Application-Insights/How%2DTo/Azure-Support-Center/Use-Ingestion-tab)
- [Break down SDKs used and their versions](/Application-Insights/How%2DTo/Additional-Reference-Material/General-References/Break-down-SDKs-used-and-their-versions)


---
Last Modified date: October 16, 2024
Last Modified by: Matthofa



