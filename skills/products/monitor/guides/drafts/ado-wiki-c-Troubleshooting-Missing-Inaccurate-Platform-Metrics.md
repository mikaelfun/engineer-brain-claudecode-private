---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Metrics/Troubleshooting Guides/Troubleshooting Missing or Inaccurate Platform Metrics"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FMetrics%2FTroubleshooting%20Guides%2FTroubleshooting%20Missing%20or%20Inaccurate%20Platform%20Metrics"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
This troubleshooting guide applies to [Platform Metrics](https://learn.microsoft.com/azure/azure-monitor/essentials/metrics-supported#table-formatting) in Azure Monitor that a customer has reported missing in any location that is directly querying our [Azure Monitor Metrics APIs](https://learn.microsoft.com/rest/api/monitor/metrics/list?tabs=HTTP), or that they have successfully queried, but believe the values to be inaccurate. This includes the Azure Portal (such as Dashboards, Overview blades, Autoscale, Metric Alerts, and Metrics Explorer), querying via Powershell/CLI/Postman/any SDKs directly, or any other setup not listed here that still directly queries the API.

The majority of encountered issues are related to the Metrics API querying the values themselves, not the definitions or namespaces. 
- Metrics Values API Documentation: https://learn.microsoft.com/rest/api/monitor/metrics/list?tabs=HTTP
- Metrics Definitions API Documentation: https://learn.microsoft.com/rest/api/monitor/metric-definitions/list?tabs=HTTP
- Metrics Namespaces API Documentation: https://learn.microsoft.com/rest/api/monitor/metric-namespaces/list?tabs=HTTP 

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:yellow">

**Important**

You are required seek help via Azure monitor swarming channel to validate your findings after executing this TSG.
[AzMon POD Swarming | Metrics | Microsoft Teams](https://teams.microsoft.com/l/channel/19%3A77cfe9b229e6400b97f142b0090c008b%40thread.tacv2/Metrics?groupId=2fb9049b-bc9c-4cca-a900-84f22c86116c&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)
Any escalation via ICM to PG without concrete investigation will be mitigated without further investigation. 
</div>


# Support Boundaries
---
See article [Support Boundaries](https://aka.ms/azmon/supportboundaries?anchor=metrics).

# Information you will need
---
- An example of the missing/inaccurate metrics that is within the last 30 days

- The Azure resourceId for which the customer is attempting to query metrics.

- The details of the metrics query itself. All of this information can be gathered from the request string of the call itself, or from a screenshot of Metrics Explorer, etc:
  - What timeframe was viewed (such as the time range set in the Azure Portal chart, or the start & end time values supplied to a direct API call)
  - What metric names were queried
  - Which aggregation types were used (Minimum, Maximum, Count, Sum/Total, Average)
  - Which, if any, dimension names and dimension values were used 
&nbsp;

- The output retrieved by the metrics query.

- The expected output that the customer believes should have been retrieved by the query. 
  - It is important when troubleshooting Metrics queries that we clarify the difference between what the query retrieves and what the user expected it to retrieve. 
  - This difference can be crucial to identifying if there is unexpected behavior that must involve deeper troubleshooting, or if the issue can be explained by a misunderstanding, which offers us a chance to help educate a user. 
&nbsp;


::: template /.templates/TSG-KnownIssues-Metrics.md
:::

# Permissions
---
Please check if the user has required Monitoring reader permissions. https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2100697/How-to-identify-RBAC-filtering-(permissions-issues)-with-Metrics

# Troubleshooting
---
1. **Collect the required information regarding the metric query**

Revisiting the "Information you will need" section, the first step is ensuring we have <u>exactly</u> the information utilized when the customer attempts to view their metrics. 

This information can be retrieved from the request string of the API call, from a screenshot, etc-- but must include the multiple elements. Below are two examples of this:

<details closed>
<summary><u>Example 1: Request URL</u></summary>
<div style="margin:25px">

   ```

https://management.azure.com//subscriptions/ <subscriptionIdredacted> /resourceGroups/testnc-rg/providers/Microsoft.Compute/virtualMachines/MyVM/providers/Microsoft.Insights/metrics?api-version=2018-01-01&metricnames=Percentage%20CPU&timespan=2023-02-02T18%3A00%3A00Z%2F2023-02-02T19%3A00%3A00Z&interval=PT5M&aggregation=Minimum%2CMaximum%2CAverage

   ```
![image.png](/.attachments/image-1e5301cc-c3bb-4519-a306-635631e71ee6.png)

From the above we can retrieve the necessary pieces of information to understand how this call was made.
In this example we can see that:
- the resource is a Microsoft.Compute/virtualMachine named "MyVM"
- the metric requested is "Percentage CPU"
- the timespan is "2023-02-02T18%3A00%3A00Z%2F2023-02-02T19%3A00%3A00Z" which in more readable format is: "2023-02-02T18:00:00Z/2023-02-02T19:00:00Z"
- the interval is PT5M, meaning the values will be in 5 minute 'buckets' 
- the aggregation type(s) are Minimum, Maximum, and Average, so data should be returned for all three

&nbsp; 

</div>
</details>

<details closed>
<summary><u>Example 2: Screenshot of Metrics Explorer</u></summary>
<div style="margin:25px">

![image.png](/.attachments/image-82e876d8-f0d1-4041-af3d-cb67a9ff8649.png)


From the above we can retrieve the necessary pieces of information to understand how this call was made.
In this example we can see that:
- the resource is a Microsoft.Compute/virtualMachine named "MyVM"
- the metric requested is "Percentage CPU"
- the timespan is "2023-02-02T18%3A00%3A00Z%2F2023-02-02T19%3A00%3A00Z" which in more readable format is: "2023-02-02T18:00:00Z/2023-02-02T19:00:00Z"
- the interval is PT5M, meaning the values will be in 5 minute 'buckets' 
- the aggregation type(s) is Average

&nbsp; 

</div>
</details>

&nbsp; 
Between these two examples, we can see that these are <i>almost</i> identical metrics queries, just presented in two different mediums. 

Their only difference is the requesting of multiple aggregation types in Example 1, with Example 2 only requesting a single aggregation.

Neither example is utilizing any dimensions, so we can be confident after collecting all of this information that we will be able to make a parallel query in Azure Support Center. The parallel query we make will help us verify what data should be returned, and if there are any discrepancies between what the customer saw, and what the Metrics backend houses. 


&nbsp;
&nbsp;
 
2. **Query the Metrics in Azure Support Center**

Using the information gathered from the above step, following the [How-To](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480524/How-to-chart-metric-data-in-Azure-Support-Center) article for querying Metrics data in Azure Support Center, and query the data using the same set of inputs as the customer. 

The only way we can expect the output from this query to match the customer's view is if we ensure we are utilizing the <b>exact same set of inputs</b>.

This means ensuring we are using the same:
- Time Window (the total amount of time being queried between the start and end datetime)
- Aggregation type (whether the query is using Maximum, Minimum, Total (Sum), Average, or Count
- Time Grain (what the size of each datapoint is, are they aggregated into 15 minute bins, or 30 minutes, 6 hours, or 1 minute, etc)
- Any dimensions (whether the query is choosing to filter down to a specific dimension, or simply split by dimensions, this must be the same)

All of the parameters **must be the same** in our internal query to match the customer's setup, otherwise the comparison is irrelevant and should be expected to appear differently. 

From this step, we can confirm:
<details closed>
<summary><u>The data seen in ASC matches what the user saw in Metrics Explorer/Azure Dashboard/etc</u></summary>
<div style="margin:25px">

This is the expected result, as anything other than an exact match when performing an identical API call would indicate some form of unexpected behavior. 

If this is the result, move on to step 3.

</div>
</details>

<details closed>
<summary><u>The data seen in ASC <b>does not</b> match what the user saw in Metrics Explorer/Azure Dashboard/etc</u></summary>
<div style="margin:25px">

If this does not match, the recommendation is largely to first ensure that the cause of the mismatch is not simply explained by some latency (delay) in metrics ingestion. For example, data queried for a time range of [11:50-12:00] at 12:01 could be subject to change if some metrics ingestion latency exceeds ~1 minute. Many metrics do not have latency that exceeds this length of time (at least not typically), but there are cases such as Microsoft.Web/serverfarms metrics where the latency is often ~5 minutes.

If querying the data appears to indicate latency is causing the discrepancy, query using an end time that is old enough that latency would not be impacting the result (such as at least 30 minutes older than current time). If even in doing so you still have doubts, please reach out to a SME.

If latency is incapable of explaining the discrepancies observed between the end-users viewed metrics and the metrics seen in ASC, gather a HAR trace of what the end-user sees for more direct comparison. The issue can potentially be related to the UI itself rather than the API, and a HAR trace can help confirm if this is occurring.

</div>
</details>


&nbsp; 
&nbsp;

3. **Compare the API's Metrics against MDM (Jarvis)**

In the previous two steps we have compared the metrics from what the end-user could see, with what can be seen in Azure Support Center as queried directly from the Metrics API. 
Once we have verified the previous two options display the same data, we want to query the data in MDM to verify that it is also the same as those. 

If a customer's initial complaint is that the data appears inaccurate, this is the most important step.

To begin to verify this, first open the JARVIS link that is generated alongside the ASC Metrics line chart, like mentioned in the [How-To article here](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480524/How-to-chart-metric-data-in-Azure-Support-Center?anchor=jarvis-portal-link-(mdm-raw-data)).

Here we want to compare the two Metric views, but they are likely to be different. We must make sure the JARVIS link uses the same Time Granularity as the Metrics chart in ASC or the Azure Portal. We must also make sure it uses the same aggregation, and that the "fillGapWithZeroes" behavior is the same. 

Another item to check is that the generated link may not include grouping by dimensions in Jarvis.  See article [How to chart MDM metrics data by dimensions in Jarvis](/Monitoring-Essentials/Metrics/How%2DTo/How-to-chart-MDM-metrics-data-by-dimensions-in-Jarvis) for details on how to add the desired dimensions and other considerations to the charting experience in Jarvis.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
When comparing the data in JARVIS against the data in Azure Support Center, one important note is the time grain in use will be autogenerated in JARVIS based on the size of the time range. Changing the time range is the only way to change the time grain, and doing so is important to ensure any discrepancies that appear between the charts are not accounted for by the time grains being different.
 
&nbsp;
If you encounter any doubts when attempting to make the MDM JARVIS dashboard match the ASC Metrics API line chart, generate a link for sharing the JARVIS Metrics chart, and then [reach out to a SME](https://teams.microsoft.com/l/channel/19%3A77cfe9b229e6400b97f142b0090c008b%40thread.tacv2/Metrics?groupId=2fb9049b-bc9c-4cca-a900-84f22c86116c&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47). 

**Do not open an ICM to the Metrics PG if this has not been validated.**
</div>




- Note:

  - MDM is conceptually 'underneath' the Metrics API-- it is the source of data the Metrics API queries from and delivers. Resource Providers emit their Metrics to MDM as the metrics backend store, the Metrics API uses MDM's query service to retrieve data, interprets the result and packages it for consumption. 

  - Because these systems are all interrelated, we expect that the data viewed in MDM would be the same as the data seen in Azure Support Center.


&nbsp;
&nbsp;

4. **Identify Results**

There are ultimately three layers that we are checking to ensure they are all displaying identical data. 
- The end-user/customer's view (this may be Metrics Explorer, for example)
- The direct Metrics API response (from Azure Support Center)
- The data in MDM as emitted by the Resource Provider (JARVIS dashboard)
&nbsp; 

<details closed>
<summary><u>All three layers match</u></summary>
<div style="margin:25px">

If all three layers show the same data, then the issue of missing data/inaccurate values needs to be transferred to appropriate Resource Provider team that owns the metrics in question. 
- For example, if a customer complains they cannot see an UsedCapacity values for their Microsoft.Storage/storageAccounts resource, and we have confirmed that there are also no values seen in MDM, this denotes the Resource Provider did not emit those values successfully to MDM. 
- As such, in this hypothetical we would want to transfer the case to the Microsoft.Storage provider, and we can create a collaboration task assigned to Azure Monitor and stay involved with the case that way. 

</div>
</details>

<details closed>
<summary><u>One or more layers do not match</u></summary>
<div style="margin:25px">

If there is a discrepancy in between any of the layers, this is where we are involved as Metrics RP support. 
- If there is a discrepancy between the data displayed by MDM (JARVIS) and the data seen in ASC (Metrics API), then please reach out to a Metrics SME as this is likely an ICM (CRI). This would denote a problem with the Metrics API itself. 
- If there is a discrepancy between the data seen by the end-user's view and the data seen in ASC (Metrics API), then please gather a HAR trace of what the end-user is viewing. This is likely also a CRI if the UI is somewhere in Azure, but is unlikely to be an issue with the Metrics API and is more likely an issue with the UI in use. Please also consult a SME with any Metrics screenshot/HAR trace showing the discrepancy. 

</div>
</details>

## Getting Help
:::template /.templates/TSG-GettingHelp-Metrics.md
:::

# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::
