---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Resource Health/How-To/How to get resource health events for a resource in Azure Support Center (ASC)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FResource%20Health%2FHow-To%2FHow%20to%20get%20resource%20health%20events%20for%20a%20resource%20in%20Azure%20Support%20Center%20(ASC)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

::: template /.templates/Note-ASCGetPermissions.md
:::

# Before You Begin
---
This article refers to resource health events that are **sent by each individual resource provider to Geneva Health System (GHS)**. 
Resource health page in the portal queries for the resource health state from data available in GHS endpoint.

:::template /.templates/AzMon-OpenASCFromSupportRequest.md
:::

:::template /.templates/ASC-NavigateToResourceExplorer.md
:::

#Instructions 

1. Locate the desired azure resource by navigating the resource tree to find the desired resource, select which view you would like for the left hand navigation tree:  **Resource Provider** or **Resource Group**.

   ![image.png](/.attachments/image-8b8cecea-3c88-45f5-b030-7a0549e86fb6.png)

   * **Resource Provider** lists all the resources starting with the provider that hosts those resources such as Microsoft.Insights, Microsoft.AlertsManagement or Microsoft.OperationalInsights.

       ![image.png](/.attachments/Screenshot%202025-02-24%20214237-044f7af5-988b-4d24-9145-0a931e5cb70a.png =200x300)

   * **Resource Group** lists all the resources by the resource group they are hosted in and then by the resource provider.

     ![Screenshot 2025-02-24 215011.png](/.attachments/Screenshot%202025-02-24%20215011-dbcc76a4-83cc-460e-b647-bca6e3f94a4c.png =225x225)

2. Once in the desired resource, there are 2 options to check the health of the resource 
     


<details closed>
<summary><b>Option 1: Check the resource health blade.</b> (click to expand)</summary>
<div style="margin:25px">

![Screenshot 2025-02-24 215858.png](/.attachments/Screenshot%202025-02-24%20215858-143f9efa-9932-42aa-8b43-8284e0b97722.png)

In order to identify the relevant health events for a specific period, first thing is to query the **date time range (UTC)**. 

The health tab can vary between resource providers although in general it is displays the **health timeline**, the **resource events**, the **outages** and the **advisories and maintenance**.

The **health timeline** provides a overview of the health status for which the resource passed by during the time queried in **date time range (UTC)**. The four colors idetify diferent statuses: **<span style="color:green;">available (green)</span>**, **<span style="color:red;">unavailable (red)</span>**, **<span style="color:grey;">unknown (grey)</span>**, and **<span style="color:purple;">degraded (purple)</span>**.

![11.png](/.attachments/11-d72248f0-605c-4cb7-9637-6faa61fd2ff9.png)


**Resource events** provides extended information on the resource events that affected the resource during the queried time period. 

![4 resource event .png](/.attachments/4%20resource%20event%20-e220ffcd-e7e9-4e4f-b8de-54c9df908bd6.png)

We can correlate the health timeline information with the resource event and determine the correspondent health event of a sudden health status change. 

On the bellow example we can see that the virtual machine became unavailable for a small period around the 24/02 and this was accompanied with an **informational alert level**, containing information on how the virtual machine was unavailable. 

We can inclusively add a column to see the **recommended actions** by clicking on "add/remove column" (pointed with the arrow).

![example.png](/.attachments/example-a8516aa0-3774-42e4-b984-d42149b37f64.png)

</div>
</details>


<details closed>
<summary><b>Option 2: Check the insights blade.</b> (click to expand)</summary>
<div style="margin:25px">

![Insights critical .png](/.attachments/Insights%20critical%20-ea1d6514-6015-4c2f-8916-a61d89aec2ee.png)

  
By extending any of the critical insights it will be presented a **description** of the issue affecting the resource, the **impacted resources** by this event, and some **costumer ready content** including **recommend steps**. 

</div>
</details>
<br>



**Note**: There is a third option to check the resource health events of a resource, by checking the resource health events the subscription level. 


<details closed>
<summary><b>Option 3: Query the relevant Activity Logs for the specific resource.</b> (click to expand)</summary>
<div style="margin:25px">

Locate the subscription by navigating the subscription Id on top of the **'All resources'**. Choose **Azure Activity logs - New** to open the activity log query editor 

![Subscriptionn.png](/.attachments/Subscriptionn-5e3f33e9-97f8-44c4-86a9-5e26bb95a81d.png)

&nbsp;

Run the following query to get all the resource health events for a specific resources in the last 30 days. 


```
AzureActivityV2
| where TimeGenerated > ago(30d) �// Adjust the time range as needed
| where CategoryValue =~ "ResourceHealth" �// Ensure it's a Resource Health event
| where _ResourceId =~ "RESOURCEID" �// Replace with the actual resource ID
| project TimeGenerated, CorrelationId, EventDataId, Level, OperationNameValue, ActivityStatusValue, PropertiesBackCompat
| order by TimeGenerated desc �// Show the latest events first

```

This query projects the most revelant parameters of a resource health event that you would possibly need in order to troubleshoot, such as the **PropertiesBackCompat**. 

This parameter that specifies the previous and current status of the resource so that you can conclude further on the origin of the resource health event, or eventually to correlate with missed or false resource health alerts according to [Troubleshooting Resource Health](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/548180/Troubleshooting-Resource-Health-alerts).

&nbsp;

![example activity log.png](/.attachments/example%20activity%20log-21ad2e40-d871-46be-963c-d6b78eaabb1b.png)