---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Autoscale/Troubleshooting Guides/Troubleshooting Autoscale not taking scale actions when expected"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Autoscale/Troubleshooting%20Guides/Troubleshooting%20Autoscale%20not%20taking%20scale%20actions%20when%20expected"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
This troubleshooting guide applies to scenarios where Autoscale was expected to take a scale action in either direction, but no action was taken.

:::template /.templates/Note-AzureVirtualDesktop-Autoscale.md
:::

# Support Boundaries
---
- [Support Boundaries - Autoscale](/Azure-Monitor/Support-Boundaries#autoscale)

# Information you will need
---
- The Resource ID of the Autoscale target (the resource the customer wants to scale)
   - This is included in the Autoscale Setting's configuration, but is useful to confirm the customer is not confusing their target/autoscale pairings.
- The Resource ID of the Autoscale Setting (it is a resource separate from the target, and has its own Resource ID)

   [How to get Autoscale configuration details from Azure Support Center](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-get-Autoscale-configuration-details-from-Azure-Support-Center)
   [How to get Autoscale setting for target resource from Azure Support Center](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-get-Autoscale-setting-for-target-resource-from-Azure-Support-Center)

- The timestamp (or timeframe) in UTC the Autoscale action was expected to be taken
- What action was expected (Scale In, Scale Out, etc)

::: template /.templates/TSG-KnownIssues-Autoscale.md
:::

# Troubleshooting
---
Progress through the troubleshooting steps by clicking the triangle bullet points to expand them.

<div style="margin:25px">

<details closed>
<summary><b>Step 1: Verify the Autoscale Setting's Target, and whether it is Enabled.</b></summary>
<div style="margin:25px"> 

The process for using ASC to review the configuration details of an Autoscale Setting is covered in this [How-To Guide](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-get-Autoscale-configuration-details-from-Azure-Support-Center)

Review the Autoscale Setting's configuration, and verify both that the setting is Enabled, and that the "Target Resource URI" matches the Resource ID from the target the customer has identified.

 - If the Autoscale Setting is Disabled (Enabled = False), then this is likely to be why no Scale Actions have been performed. However, it is possible that the Autoscale Setting was not disabled <i>during the timeframe the customer has given</i>, and so it is worth continuing to Step 3 to verify this.
</details>

<details closed>
<summary><b>Step 2: Verify the Autoscale Profile(s) configurations.</b></summary>
<div style="margin:25px"> 

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

**Note**

An Autoscale Setting can have many profiles, often for different times of day / days of the week / times of year / etc.
Only one Autoscale Profile will be used for any given Autoscale evaluation.
</div>

If the customer expected Autoscale to take a Scale In or Scale Out operation during some timeframe, it is a good step to verify the Autoscale Setting has a Profile configured for that timeframe, and that Profile includes at least 1 Condition which could result in the expected action.

The process for reviewing an Autoscale Profile's configurations is covered in this [How-To Guide](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-get-the-profiles-for-an-Autoscale-configuration-from-Azure-Support-Center).

<b>Considerations:</b>
- If the Autoscale Profile does not have Recurrence times listed, it is always considered active.
   - For example, if the user expected Autoscale to Scale In at 12:00, but did not configure any Scale In rules that apply at 12:00, it will never take that action at that time.
- If an Autoscale Profile's name begins with "Auto created scale condition" this is due to Autoscale creating 'hidden' profiles using the configuration of the Default Profile to cover any gaps in time that are left over from user-created Profiles.
   - For example, if a user configures a Profile that only applies from 00:00-12:00 each day, an "Auto created scale condition" will appear that counts as the profile during the other twelve hours each day. The auto-created profile will have a configuration that matches the Default Profile configuration.
   - Multiple auto-created profiles may exist per Autoscale setting, if multiple user-created profiles incur multiple gaps in time that require coverage. 

<b>Example:</b>
- Consider the follow example Autoscale Profile configuration, paired with a report that no scale action was taken during [2021/07/18 19:30 UTC] - [2021/07/18 21:30 UTC]

![Example Autoscale Profile configuration](/.attachments/image-00b6ac0a-2f31-480b-b3ba-9775bf229b6b.png)

There are several causes as to why scale actions would not have occurred during that timeframe in the above example.
- The scale actions defined in the rules of this profile would only be taken during the hours of 06:00-18:00 UTC.
- The scale actions defined in the rules of this profile would only be taken during the weekdays of Monday-Friday, and 2021/07/18 was a Sunday.
- Additionally, scale actions would not be taken to exceed the maximum or minimum instances count, which being identical at 2, would prevent all scaling. 

</details>

<details closed>
<summary><b>Step 3: Find a sampling of Autoscale evaluations during the target timeframe.</b></summary>
<div style="margin:25px">

After verifying the Autoscale Setting's configuration, we should next query the "Job History" to investigate individual evaluations that occurred within the timeframe to locate what caused Autoscale to not take action.

The process for retrieving an Autoscale Setting's Job History is covered in this [How-To Guide](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-analyze-Autoscale-job-evaluation-history-in-Azure-Support-Center).

After retrieving the Job History, the fields "ExecutionMessage" or "FailureTypeName" may display the reason no scale action was taken for the evaluations. 

<details closed>
<summary><b>No additional information is provided by those fields, they just list "None" or are blank.</b></summary>
<div style="margin:25px">

Collect the one or several Activity IDs for your specific timestamp or timeframe, respectively, and proceed with the Activity ID(s) to step 4.

</details>

<details closed>
<summary><b>The ExecutionMessage or FailureTypeName field gives clear indication of why Autoscale is not taking scale actions.</b></summary>
<div style="margin:25px">

Examples of potential obvious causes would be records listing "MetricFailures" or "No Active Autoscale Settings", etc. 
- MetricFailures, for example, means no Metric data was able to be retrieved during the timeframe when that evaluation occurred. Autoscale will not take any scale actions while metrics are irretrievable.
   - In this scenario, Autoscale would be acting within expected behavior if the metrics are not available. Utilize the [Metrics How-To Guide](/Monitoring-Essentials/Metrics/How%2DTo/How-to-chart-metric-data-in-Azure-Support-Center) to check if the metric has no data for the timeframe autoscale was evaluating.  

If the records list results that you believe may be the cause of no scale actions, but the details are not clear or the message appears inconsistent the scenario, engage a SME or the Autoscale Swarming Channel for further assistance. 

</details>
</details>

<details closed>
<summary><b>Step 4: Analyze the Autoscale Traces for cause of No Scaling</b></summary>
<div style="margin:25px">

The most common cause of no Scale Action being taken is "by design"
- Be sure you are familiar with Autoscale's evaluation logic as documented [publicly here](https://docs.microsoft.com/azure/azure-monitor/autoscale/autoscale-understanding-settings#autoscale-evaluation).

To begin analyzing the Autoscale trace logs, take the ActivityId(s) from Step 3, and follow the process for Job Traces by ActivityId as covered in this [How-To Guide](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-analyze-Autoscale-job-trace-logging-in-Azure-Support-Center).

<details closed>
<summary><b>Why did Autoscale Not Scale [Out]?</b>
</summary>
<div style="margin:25px">

Scale Out actions are the easiest to check for, as the only criteria required is for any one of the individual "Increase" Scale Conditions to be met.

- First, check the Autoscale Profile that is being used by the current evaluation. Find the event with operationName "GetAutoscaleProfile", and check to ensure the Autoscale Profile being used for this evaluation is the one that is expected. 
   - It is a good idea to copy-paste the profile's JSON into a JSON parser for easy viewing.
   - An important aspect of this check is verifying what resources emit the Metrics Autoscale is evaluating. Autoscale can be evaluating Metrics from Resource A and Resource B, while applying scaling to Resource C. Checking the profile's raw JSON helps verify what the metric(s) sources are. 
 
- After verifying the profile, the next events of interest are the "EstimateScaleRule" events. There will be one of these events for each Scale Condition contained within the Profile that can be evaluated, and they will each determine whether they are "Triggered" or "NotTriggered" by comparing the Metric values to their Condition's threshold.
 
- For Scaling [Out], if <b>any one</b> of the "increase" Scale Conditions evaluates to "Triggered", Autoscale will initiate a scaling action to increase the instances count. 
 
- To understand why no scaling action was taken, we must look at <b>all</b> of the "EstimateScaleRule" events for Scale Out (increase) conditions. We can only conclude Autoscale taking no scale actions was by-design after verifying that <b>none</b> of the increase conditions evaluated as "Triggered".


<summary><b>Analyzing results:</b>
</summary>
<div style="margin:25px">

<details closed><summary><b>No threshold values were exceeded, all Scale Out "EstimateScaleRule" conditions evaluated as "NotTriggered"</b></summary><div style="margin:25px">
Autoscale worked as properly, and taking no scale actions would be the expected behavior.
</details>

<details closed><summary><b>No threshold values were exceeded, but one or more Scale Out "EstimateScaleRule" conditions evaluated as "Triggered"</b></summary><div style="margin:25px">
Autoscale did not work properly, validate this with a SME before proceeding to escalate this to the Product Group.
</details>
 
<details closed><summary><b>One or more threshold values were exceeded, but all Scale Out "EstimateScaleRule" conditions evaluated as "NotTriggered"</b></summary><div style="margin:25px">
Autoscale did not work properly, validate this with a SME before proceeding to escalate this to the Product Group.
</details>
 
<details closed><summary><b>One or more threshold values were exceeded, and the Scale Out "EstimateScaleRule" conditions evaluated as "Triggered", but Autoscale still took no scale actions.</b></summary><div style="margin:25px">
Check for further trace logs that indicate a cause for being unable to scale, such as being at Maximum Capacity already, or being within a cooldown period, etc. 
If no such traces exist, validate this with a SME before proceeding to escalate this to the Product Group.
</details>

<details closed><summary><b>One or more threshold values were exceeded, and the Scale Out "EstimateScaleRule" conditions evaluated as "NotTriggered", Autoscale logged that it took scale actions, but the instances count still did not change.</b></summary><div style="margin:25px">
Validate the instances count did not change by checking the trace logs of the next ActivityId that performs a complete evaluation (be mindful of the previous event's cooldown period) to see what instances count is logged there. 

- For example, if the cooldown period is 5 minutes, check the traces from the ActivityId 6 minutes later.
- If checking the next instances count does prove there was no change (no action taken on the resource itself), we must engage the Resource Provider team of the target resource to understand why no change was caused.
- The Resource Provider team will be better able to understand if no request was received from ARM to provision a new instance, or if the request was received but failed to be completed, if a quota blocked the action, etc.
</details>

<details closed><summary><b>No threshold values were exceeded, all Scale Out "EstimateScaleRule" conditions evaluated as "NotTriggered" or did not evaluate, and there are messages mentioning "MetricsFailures" or "unable to retrieve metrics"</b></summary><div style="margin:25px">
Autoscale was unable to retrieve the target metrics during evaluation-- taking no scale actions is the default behavior when data is not available. 

If possible, attempt to query the target metrics yourself in ASC for the same time period that Autoscale was attempting to evaluate, using the [How-To Guide](/Monitoring-Essentials/Metrics/How%2DTo/How-to-chart-metric-data-in-Azure-Support-Center).

- If there is not data available for that time period, the issue should now be treated as a metrics issue and we should proceed with standard troubleshooting for missing metrics.
- If there is data available for that time period, the issue was likely due to the metrics not being available <i>at evaluation time</i>, or the Autoscale configuration may be using too small of a time period (time periods should generally be no smaller than 5-10 minutes in size to account for metrics being NRT). Validate this with a SME before engaging the Product Group. 
</details>



</details>

<details closed>
<summary><b>Why did Autoscale Not Scale [In]?</b>
</summary>
<div style="margin:25px">

Scaling In actions are more difficult to check for, as <b>all</b> of the Scale In (decrease) conditions must be met at the same time, <b>and</b> the anti-flapping logic must not be engaged for a Scale In action to occur.

- First, check the Autoscale Profile that is being used by the current evaluation. Find the event with operationName "GetAutoscaleProfile", and check to ensure the Autoscale Profile being used for this evaluation is the one that is expected. 
   - It is a good idea to copy-paste the profile's JSON into a JSON parser for easy viewing.
   - An important aspect of this check is verifying what resources emit the Metrics Autoscale is evaluating. Autoscale can be evaluating Metrics from Resource A and Resource B, while applying scaling to Resource C. Checking the profile's raw JSON helps verify what the metric(s) sources are. 
 
- After verifying the profile, the next events of interest are the "EstimateScaleRule" events. There will be one of these events for each Scale Condition contained within the Profile that can be evaluated, and they will each determine whether they are "Triggered" or "NotTriggered" by comparing the Metric values to their Condition's threshold.

- To understand why no scaling action was taken, we must look at <b>all</b> of the "EstimateScaleRule" events for Scale In (decrease) conditions, as well as any potential "EstimateScaleRule" events for increase conditions related to anti-flapping logic. We can only conclude that Autoscale taking no scale actions was by-design after verifying that either: 
   - <b>any one</b> of the decrease conditions evaluated to "NotTriggered"
   - or if all decrease conditions evaluated to "Triggered" but the anti-flapping logic also evaluated to "Triggered", thus preventing the scale action.

- For Scaling [In], <b>all</b> of the "decrease" Scale Conditions must evaluate to "Triggered". 
   - If any one of them does not, Autoscale will not scale in, and therefore the behavior is by-design. 
   - If all of them do, we must next check for the Anti-flapping logic's "capacity projections".

- Capacity Projection traces will also appear in the logs as events under the name "EstimateScaleRule", however there will first be traces that exist as a divider between the regular "EstimateScaleRule" events and the capacity projection "EstimateScaleRule" events.

   ![Screenshot showing logs that identify capacity projection](/.attachments/image-4e1765ca-81d0-4590-9753-b8938b276382.png)

- Take the above example:
   - We start with "EstimateScaleRule" for a Scale In condition being tested, and found to be "Triggered". 
   - After this determination, Autoscale must check if Scaling In would cause flapping, and so it names that it will run a capacity projection using the potential new instance count.
   - It then logs another "EstimateScaleRule" event where the calculation is using the capacity projection, and finds that to also evaluate as "NotTriggered".
   - In this scenario, Autoscale would then take the Scale In action. 

- In more extensive examples, there may be more than 1 of each of these events logged, as Autoscale must run a capacity projection for each of the Scale Out conditions, since any one of them could possibly cause flapping.

Ultimately, if any one of the Scale Conditions does not evaluate accordingly, a Scale In action will not occur. All Scale In conditions must evaluate to "Triggered", while at the same time the Anti-flapping logic (capacity projection) must also evaluate to "NotTriggered" for a Scale In to occur.

<summary><b>Analyzing possible results:</b></summary><div style="margin:25px">

<details closed><summary><b>At least one of the threshold values were not exceeded, and at least one of the Scale In "EstimateScaleRule" conditions evaluated as "NotTriggered"</b></summary><div style="margin:25px">
Autoscale worked as properly, and taking no scale actions would be the expected behavior.
</details>

<details closed><summary><b>All of the threshold values were exceeded, and all of the Scale In "EstimateScaleRule" conditions evaluated as "Triggered", however at least one of the Scale Out capacity projections also evaluated as "Triggered".</b></summary><div style="margin:25px">
Autoscale worked as properly, and taking no scale actions would be the expected behavior. In this scenario, there should also be a logged event indicating Flapping.
</details>

<details closed><summary><b>All of the threshold values were exceeded, and all of the Scale In "EstimateScaleRule" conditions evaluated as "Triggered", and all of the Scale Out capacity projections also evaluated as "NotTriggered", but Autoscale did not log that it took scaling actions.</b></summary><div style="margin:25px">
Check for further trace logs that indicate a cause for being unable to scale, such as being at Minimum Capacity already, or being within a cooldown period, etc. If no such traces exist, validate this with a SME before proceeding to escalate this to the Product Group.
</details>

<details closed><summary><b>All of the threshold values were exceeded, and all of the Scale In "EstimateScaleRule" conditions evaluated as "Triggered", and all of the Scale Out capacity projections also evaluated as "NotTriggered", Autoscale logged that it took scale actions, but the instances count still did not change.</b></summary><div style="margin:25px">
Validate the instances count did not change by checking the trace logs of the next ActivityId that performs a complete evaluation (be mindful of the previous event's cooldown period) to see what instances count is logged there. 

- For example, if the cooldown period is 5 minutes, check the traces from the ActivityId 6 minutes later.
- If checking the next instances count does prove there was no change (no action taken on the resource itself), we must engage the Resource Provider team of the target resource to understand why no change was caused.
- The Resource Provider team will be better able to understand if no request was received from ARM to provision a new instance, or if the request was received but failed to be completed, if a quota blocked the action, etc.
</details>

<details closed><summary><b>No threshold values were exceeded, all Scale In "EstimateScaleRule" conditions evaluated as "NotTriggered" or did not evaluate, and there are messages mentioning "MetricsFailures" or "unable to retrieve metrics"</b></summary><div style="margin:25px">
Autoscale was unable to retrieve the target metrics during evaluation-- taking no scale actions is the default behavior when data is not available. 

If possible, attempt to query the target metrics yourself in ASC for the same time period that Autoscale was attempting to evaluate, using the [How-To Guide](/Monitoring-Essentials/Metrics/How%2DTo/How-to-chart-metric-data-in-Azure-Support-Center).

- If there is not data available for that time period, the issue should now be treated as a metrics issue and we should proceed with standard troubleshooting for missing metrics.
- If there is data available for that time period, the issue was likely due to the metrics not being available <i>at evaluation time</i>, or the Autoscale configuration may be using too small of a time period (time periods should generally be no smaller than 5-10 minutes in size to account for metrics being NRT). Validate this with a SME before engaging the Product Group. 
</details>

</details>

</details>

</div>

## Getting Help
:::template /.templates/TSG-GettingHelp-Autoscale.md
:::

# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::
