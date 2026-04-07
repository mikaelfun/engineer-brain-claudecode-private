---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Application Insights portal experiences/Application Map"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FApplication%20Insights%20portal%20experiences%2FApplication%20Map"
importDate: "2026-04-06"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md 
:::

<!--
title: Application Map 
description: Application Map is missing expected application details or need assistance interpreting the results
tags:
� - azure-monitor
� - application-insights
� - portal
  - Application_map
� - troubleshooting
parent: [Application Insights portal experiences - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605350/Application-Insights-portal-experiences)
ms.topic: troubleshooting-guide
ms.date: 2025-07-15
related:
  - [Sampling - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/583838/Sampling)
� - [Identify if Sampling is enabled - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/580009/Identify-if-Sampling-is-enabled)
-->

#Scenario      
----
*Application Map is missing expected application details or need assistance interpreting the results*

# Troubleshooting Guide (TSG)

---

::: template /.templates/AppInsights/v3/TSGDisclaimer.md 
:::

  

<details><summary>1. Scoping </summary>

## Scoping

---

::: template /.templates/AppInsights/v3/Scoping/ScopingProduct_Steps.md 
:::

- If the Application Map does not display the monitored application, even after expanding the selected time range, this scenario is more likely related to a *Missing all telemetry* support topic.

---
</details>


<details><summary>2. Expectation setting</summary>

## Expectation setting

---

::: template /.templates/AppInsights/v3/Expectations/Expectations_General.md 
:::

- Application Map is primarily driven by metrics-based telemetry. As a result, selecting a resource node in the map may not always surface corresponding log telemetry, which can occur due to sampling behavior.

---

</details>


<details><summary><span�font-weight:700;"�>3. Analysis</span></summary>

## Analysis

---

::: template /.templates/AppInsights/v3/Analysis/Analysis_Disclaimer.md 
:::

1. Review the **Known Issues** section below for any documented explanations that may apply to the observed behavior.

1. Select the appropriate scenario below based on your situation:

<div style="margin:25px">
<details closed>
<summary><b>Need help understanding or interpreting what Application Map is showing </b></summary>
<div style="margin:25px">

- Refer to the **Documentation** section listed later in this guide for conceptual and usage details.

</details>
<details closed>
<summary><b>Application Map is missing items that are expected</b></summary>
<div style="margin:25px">

- If Application Map is empty, first validate whether any telemetry is being ingested into the Application Insights component. Because Application Map is generated entirely from incoming telemetry, an empty map generally indicates no telemetry ingestion.

- Use the [Use Ingestion tab](/Application-Insights/How%2DTo/Azure-Support-Center/Use-Ingestion-tab) to verify whether telemetry is arriving. If no telemetry is found, update the Support Topic accordingly and follow the relevant TSG.

- If telemetry was not generated for a specific dependency within the selected time range, that dependency will not appear in the map. For example, infrequently invoked dependencies will only be visible if activity occurred during the selected time window.

- Adjust the lookback period to include a wider time range and re-evaluate whether the missing items appear.

- If currently using Preview mode, switch to the non-preview experience, or vice versa, to determine whether the selected mode affects visibility.

- If Preview mode impacts results, review and adjust the Intelligent View settings accordingly.

- If the expected items remain unavailable, select the main application node to open the context menu and choose **View Details**.

- From the details view, select **View in Logs** to retrieve the underlying query used to generate the Application Map.

- Execute dependency queries to determine whether telemetry characteristics have changed, such as a dependency target no longer being collected.

classic

```

dependencies

| where timestamp > ago(7d)

| summarize count() by bin(timestamp, 12h), type, target, sdkVersion

| order by timestamp, type, target, sdkVersion

```

workspace

```

AppDependencies

| where TimeGenerated > ago(7d)

| where IKey == ""

| summarize count() by bin(TimeGenerated, 12h), DependencyType, Target, SDKVersion

| order by TimeGenerated, DependencyType, Target, SDKVersion

```

- Application Map requires proper telemetry correlation. If the issue observed is that *App A does not appear to call App B*, refer to [Telemetry Correlation Issues](/Application-Insights/Support-Topics/Manual-Instrumentation-using-SDK,-Open-Telemetry-or-by-installing-Agent/Telemetry-Correlation-Issues).

</div>
</details>

<details closed>
<summary><b>I want to change the labels on items Application Map shows</b></summary>
<div style="margin:25px">

- Labels displayed in Application Map are directly sourced from collected telemetry values.

- The specific changes required depend on which labels need modification and may vary in complexity.

  - For auto-instrumentation scenarios, see [Enabling Application Insights in Azure Portal - Alter or Filter Out Specific Telemetry](/Application-Insights/Support-Topics/Application-Insights-setup-and-customization/Filter-or-modify-collected-telemetry).

  - For manual instrumentation scenarios (including Agents or Status Monitor), see [Manual Instrumentation using SDK or installing Agent - Alter or Filter Out Specific Telemetry](/Application-Insights/Support-Topics/Manual-Instrumentation-using-SDK,-Open-Telemetry-or-by-installing-Agent/Alter-or-Filter-Out-Specific-Telemetry).

</div>
</details>
<details closed>
<summary><b>App Map is showing an error or not loading or simply not behaving as expected </b></summary>
<div style="margin:25px">

- Refer to [Troubleshoot general portal blade issues](/Application-Insights/How%2DTo/Additional-Reference-Material/Portal-Experience-References/Troubleshoot-general-portal-blade-issues).

---

</div>
</details>
</div>

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

::: query-table 680d671d-5b69-437c-bd8f-7de920731842 
:::

::: template /.templates/AppInsights/v2/AppInsightsGeneralKnownIssues.md 
:::

# Public Documentation

---

- Application Map: Triage Distributed Applications: https://docs.microsoft.com/azure/azure-monitor/app/app-map

# Internal References

---

- None

---

Last Modified: March 24, 2025
Last Modified by: matthofa
Created by: matthofa