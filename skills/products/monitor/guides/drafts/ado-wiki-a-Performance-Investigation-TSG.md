---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Application Insights portal experiences/Performance Investigation Experience"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FApplication%20Insights%20portal%20experiences%2FPerformance%20Investigation%20Experience"
importDate: "2026-04-06"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

<!--
title: Performance Investigation Experience
description: Help troubleshooting application performance issue reported in my telemetry or the Performance pane shows unexpected results
tags:
� - azure-monitor
� - application-insights
� - portal-experience
� - performance-investigation
  - performance-blade
� - troubleshooting
parent: [Application Insights portal experiences - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605350/Application-Insights-portal-experiences)
ms.topic: troubleshooting-guide
ms.date: 2025-07-15
related:
� - 
-->

# Scenario
---
*Help troubleshooting application performance issue reported in my telemetry or the Performance pane shows unexpected results*

# Troubleshooting�Guide�(TSG)
---
::: template /.templates/AppInsights/v2/Leaf_Disclaimer.md
:::


<details><summary><span�font-weight:700;"�>1. Scoping </span></summary>

##�Scoping
---

:::�template�/.templates/AppInsights/v3/Scoping/ScopingProduct_Steps.md
:::

- What and how is being examined to determine a performance issue is occurring (screenshots)?
  - Do they have a query to show an example of the performance issue?
- What is the expected versus observed, can queries or screenshots be shared showing both?
- Collect all the resources involved.
- If the performance issue is with performance impact of enabling Application Insights this is the wrong Support Area Path (SAP), see: [Crashes or slowness after enabling](/Application-Insights/Support-Topics/Missing-or-incorrect-telemetry-and-performance-issues/Crashes-or-slowness-after-enabling)


---
</details>


<details><summary><span�font-weight:700;"�>2. Expectation Setting </span></summary>

##�Expectation�setting
---�

:::�template�/.templates/AppInsights/v3/Expectations/Expectations_General.md
:::

- If the performance issue is NOT with latency of Application Insights telemetry it, it is not an issue Azure Monitor should own.
- If the performance issue is request or dependency durations it is NOT an issue for Application Insights or an Azure Monitor to own.
  - If the long duration is with a dependency operation the case should start with the team that supports that dependency: database, storage, etc.
  - If the long duration is with a request ensure the duration is not driven by a dependency call initiated by the request, if it is see the above bullet and if it is NOT the case should start with the team hosting application servicing the requests: App Service Web Apps, Functions, etc.

---
</details>


<details><summary><span�font-weight:700;"�>3. Analysis</span></summary>

## Analysis
---

:::�template�/.templates/AppInsights/v3/Analysis/Analysis_Disclaimer.md
:::


1. Check the Known Issues section below, for potential explanation.
1. If the issue is about SDK impact and not Application Performance see:
   - [Performance Impact - Manual](/Application-Insights/Support-Topics/Manual-Instrumentation-using-SDK,-Open-Telemetry-or-by-installing-Agent/Performance-Impact)
   - [Performance Impact - Autoinstrumentation](/Application-Insights/Support-Topics/Application-Insights-setup-and-customization/Performance-Impact)
1. See one of the appropriate sections below:

<details closed>
<summary><b>Need help troubleshooting a performance issue in my application </b></summary>

- See Expectation setting section above.
- The ask is to help resolve a performance issue based on data collected by Application Insights.
   - This means the application, or its dependency(s) may be having a performance issue
   - This means Application Insights is working because the durations are being logged
- Application Insights team can help quantify data points around the performance issue such how often it occurs, when it started, average duration of the operation, potential pattern of occurrence, etc. See Documenation section below
- Application Insights team cannot efficiently help in most instances, that is SQL Operation duration suddenly increased this would need to go to the SQL team to be addressed.

- If the concern is Application Insights is the cause of the performance issue, then this is the wrong support topic, change the Support Topic to either:
   - For Manual instrumentation: [Performance Impact](/Application-Insights/Support-Topics/Manual-Instrumentation-using-SDK,-Open-Telemetry-or-by-installing-Agent/Performance-Impact)
   - For Auto instrumentation: [Performance Impact](/Application-Insights/Support-Topics/Application-Insights-setup-and-customization/Performance-Impact)

</details>
<details closed>
<summary><b>Performance blade is presenting unexpected results for the Operations, Dependencies, Exceptions or Roles tabs</b></summary>

- identify specific concern and what is expected, is data incorrect, missing, etc
- quantify the concern, is the behavior consistent, is missing only sometimes, etc
- is the data itself or how the portal is presenting the information
   - use the View Logs to look at the raw table related the issue
   - often the scale used by the graph can make things look significantly different than they are. This is because the scale uses the max value of the data and if this is significantly different that the bulk of the data things can look off, that is the graph may look like NO data is coming on a large portion of the graph
- Remember sampling can frequently be the causing of missing data
   - #27486
- Application Insights starts measuring the time the outgoing call starts until it returns. 
- If the concern is the duration times Application Insights measures is different than the outgoing operation:
   - if the discrepancy is small this is probably normal the times will never be exact as the measurements are done at different levels
   - if the measurements are significantly off, did this just start? 
- MDM metric dimension limits
   - If there are over 100 AppRoleNames then performance pane may or may not be able to display a specific role to filter on or review. 
   - The 100 custom dimension limits are not always enforced during ingestion so it can be sporadic, meaning portal UX could show up to 200 app roles sometimes
   - Due to these occasional limits on MDM metrics, customers should switch to using log-based queries to further explore the data from performance pane. 
- Behavior details of the Operation Name table
   - first load of the performance pane, the operation name table query displays the top 10 operations, ordered by duration first and count second. If there is an API with a high request count, but the API is highly performant, it may not appear in the initial table load due to the default sort order. 

   The table behavior changes dynamically based on your interactions with the performance pane:
   - **Initial Load**: Shows the top 10 operations.
   - **Interaction**: Scroll to the end of the grid, apply filters, or modify the time range using the chart's time brush, the query adjusts to display the top 10,000 operations.

   For a deeper dive into the entries within the operation name table, select **Requests** from the **View in Logs** menu at the top of the pane. This allows ad hoc query investigate of the log query results in detail.

</details>

<details closed>
<summary><b>Performance blade is showing an error or not loading or simply not behaving as expected</b></summary>

- See: [Troubleshoot general portal blade issues](/Application-Insights/How%2DTo/Additional-Reference-Material/Portal-Experience-References/Troubleshoot-general-portal-blade-issues)

</details>

<details closed>
<summary><b>Some panels show 'Error retrieving data'</b></summary>

- ![image.png](/.attachments/image-d976261e-e104-4a78-ac4b-b45f5f9e22b5.png)
- This could be access to the underly logs.
   - Can the user use View in Logs and query the data from Logs experience?
   - Can the user access the underly Log Analytics workspace directly and query the data there?
   - Check the configuration of the workspace property called, "Access control mode". This can be checked in ASC from the Properties of the associated Log Analytics workspace. See: [Manage access to Log Analytics workspaces - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/manage-access?tabs=portal)

</details>

<details closed>
<summary><b>Experience shows partial telemetry</b></summary>

Consider the following experience: 

![image.png](/.attachments/image-ae396f98-38c4-487f-b530-0c863fb552a9.png)

The experience above shows the Failures blade displaying metric-data data like in the "Failed request count" chart, as well as the count numbers displayed in the "Top 3 response codes". However, the same experience is missing logs-based data, as it can be observed under the "Operation Name" section, as well as in the right pane showing the message "No available results". 

The Failures and Performance blades in Application Insights are made up of both metric-based and log-based data. The ingestion process for both logs and metrics is different and because of this, in scenarios where the backend Log Analytics workspace reaches the configured daily cap, log telemetry will be affected but metrics will continue to ingest, which will lead to this partial experience. 

For more details, refer to #49764

</details>

---
</details>


<details><summary><span�font-weight:700;"�>4. What's Next? </span></summary>

## What's Next  
---

::: template /.templates/AppInsights/v2/Leaf_WhatsNext_Disclaimer.md
:::

::: template /.templates/AppInsights/v2/Leaf_WhatsNext.md
:::

---
</details>


# Known Issues
---
::: query-table 07d8a5a9-3961-43e3-99ba-56bc6524c156
:::


::: template /.templates/AppInsights/v2/AppInsightsGeneralKnownIssues.md
:::

# Public Documentation
---
- "Find and diagnose performance issues with Azure Application Insights" https://docs.microsoft.com/azure/azure-monitor/app/tutorial-performance

# Internal References
---
- None


---
Last�Modified:�March 24,�2025
Last�Modified�by:�matthofa
Created by:�matthofa