---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Application Insights portal experiences/User behavior analytics"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FApplication%20Insights%20portal%20experiences%2FUser%20behavior%20analytics"
importDate: "2026-04-06"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

<!--
title: User Behavior Analytics (Users, Sessions, Cohorts, etc.)
description: Troubleshooting guide related Usage section related to users, sessions, events, cohorts, etc:
� - azure-monitor
� - application-insights
� - portal-experience
� - Users
  - Sessions
  - Events
  - Funnels
  - User Flows
  - Cohorts
� - troubleshooting
parent: [Application Insights portal experiences - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605350/Application-Insights-portal-experiences)
ms.topic: troubleshooting-guide
ms.date: 2025-07-15
related:
� - 
-->

# Scenario
---
*Problems using features or deciphering meaning of data presented on Users, Sessions, Events, Funnels, User Flows or Cohorts panes*


# Troubleshooting�Guide�(TSG)
---

::: template /.templates/AppInsights/v3/TSGDisclaimer.md
:::

<details><summary>1. Scoping </summary>

## Scoping
---

::: template /.templates/AppInsights/v3/Scoping/ScopingProduct_Steps.md
:::

troubleshooting a specific failure
- Screenshots of the issue
- included with the screenshot what is expected versus what is seen
- included with the screenshot details as to why is there the expectation 
- Was this working differently before and if so when?
- Users and Sessions offers a View in Logs button ![image.png](/.attachments/image-8c606597-242c-446b-8f16-bffa10f8c1c6.png) use this button to collect the query driving the graph

Usage behavior blades are failing to load
- Screenshot of the Failures blade with user comments as to what is wrong and why it is believed to be wrong (what is expected)

---
</details>

<details><summary>2. Expectation setting</summary>

## Expectation setting
--- 

::: template /.templates/AppInsights/v3/Expectations/Expectations_General.md
:::

- None

---
</details>


<details><summary><span�font-weight:700;"�>3. Analysis</span></summary>

## Analysis
---

::: template /.templates/AppInsights/v3/Analysis/Analysis_Disclaimer.md
:::

1. Check the Known Issues section below, for potential explanation. 
1. See one of the appropriate sections below:

<details closed>
<summary><b>Users</b></summary>

1. If the experience was different recently try adjusting the "During" drop down to include a large time window. It is possible that required activity did not occur recently and the look back time needs to be adjusted.
1. Try adjusting the other drop downs as perhaps prior something was not included and the data is now filtered out given the choices in the drop down
1. Be sure to use Relevant Documentation Section 
1. This functionality is dependent on client-side telemetry from the JavaScript sdk being enabled.
1. The "View in logs" feature allows breaking down the query to better understand the graph presented. Look to see if there are distinct values for user_Id.
1. No value for user_Id counts as a distinct user. 
1. see [How the Users Page works](/Application-Insights/Learning-Resources/Training/Course-Materials/Portal-Experiences/How-the-Users-Page-works) for guidance.

</details>
<details closed>
<summary><b>Sessions</b></summary>

1. If the experience was different recently try adjusting the "During" drop down to include a large time window. It is possible that required activity did not occur recently and the look back time needs to be adjusted.
1. Try adjusting the other drop downs as perhaps prior something was not included and the data is now filtered out given the choices in the drop down
1. Be sure to use Relevant Documentation Section 
1. This functionality is dependent on client-side telemetry from the JavaScript sdk being enabled.
1. The "View in logs" feature allows breaking down the query to better understand the graph presented. Look to see if there are distinct values for session_Id.
1. No value for session_Id counts as a distinct session so even if the client-side telemetry from the JavaScript SDK is not enabled.
1. The Sessions portal experience is effectively identical to Users, see [How the Users Page works](/Application-Insights/Learning-Resources/Training/Course-Materials/Portal-Experiences/How-the-Users-Page-works) for more guidance. 

</details>

<details closed>
<summary><b>Events</b></summary>

1. If the experience was different recently try adjusting the "During" drop down to include a large time window. It is possible that required activity did not occur recently and the look back time needs to be adjusted.
1. Try adjusting the other drop downs as perhaps prior something was not included and the data is now filtered out given the choices in the drop down
1. Be sure to use Relevant Documentation Section 
1. This functionality is NOT dependent on client-side telemetry from the JavaScript sdk being enabled unlike Users and Session.
1. The "View in logs" feature allows breaking down the query to better understand the graph presented. It is only counting the number of rows returned by the query.
1. The Events portal experience is effectively identical to Users, see [How the Users Page works](/Application-Insights/Learning-Resources/Training/Course-Materials/Portal-Experiences/How-the-Users-Page-works) for more guidance. 

</details>

<details closed>
<summary><b>Funnels, User Flows, Cohorts</b></summary>

Funnels:
1. Funnels are distinct paths used in an application by a user, that is user starts on Page A and then might go to Page B or C. If the user goes to Page B they might go to Pages D or E and if they had chosen C they might then select Page F or G. This means Steps could be A -> B -> D or A -> C -> G. 
1. Funnels allow one to see if users are getting through a proper path in an application.
1. Be sure to use Relevant Documentation Section 
1. The "View in logs" feature that shows up after using the View tab allows breaking down the query to better understand the graphs presented. 

User Flows:
1. Similar to Funnels but rather looking at a specific path a user will take it shows trends of what users do on the site.
1. Be sure to use Relevant Documentation Section 

Cohorts
1. Cohorts a grouping of things that have something in common
1. Be sure to use Relevant Documentation Section 

</details>

<details closed>
<summary><b>Any of these blades showing an error or not loading or simply not behaving as expected</b></summary>

- See: [Troubleshoot general portal blade issues](/Application-Insights/How%2DTo/Additional-Reference-Material/Portal-Experience-References/Troubleshoot-general-portal-blade-issues)

</details>

---
</details>


<details><summary><span�font-weight:700;"�>4. What's Next? </span></summary>

## What's Next  
---

::: template /.templates/AppInsights/v3/WhatsNext/WhatsNext_Disclaimer.md
:::

::: template /.templates/AppInsights/v3/WhatsNext/WhatsNext_Steps.md
:::

---
</details>


# Known Issues
---
::: query-table 36e2e398-7450-47f4-a546-ac0aa9813dc2
:::


::: template /.templates/AppInsights/v2/AppInsightsGeneralKnownIssues.md
:::

# Public Documentation
---
- Users, sessions, and events analysis in Application Insights: https://docs.microsoft.com/azure/azure-monitor/app/usage-segmentation
- Discover how customers are using your application with Application Insights Funnels : https://learn.microsoft.com/azure/azure-monitor/app/usage-funnels
- Analyze user navigation patterns with User Flows in Application Insights : https://learn.microsoft.com/azure/azure-monitor/app/usage-flows
- Application Insights cohorts : https://learn.microsoft.com/azure/azure-monitor/app/usage-cohorts


# Internal References
---
- None


---
Last�Modified:�March 24,�2025
Last�Modified�by:�matthofa
Created by:�matthofa