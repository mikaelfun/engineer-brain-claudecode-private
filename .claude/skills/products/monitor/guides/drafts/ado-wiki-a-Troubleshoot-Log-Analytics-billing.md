---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Billing/Troubleshoot Log Analytics billing"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FBilling%2FTroubleshoot%20Log%20Analytics%20billing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
   
 **Update Jan 14th 2026**
  
Please note that the previous issue with daily cap exceeding well beyond the configured one in high ingestion rate scenarios and high usage regions like EastUS and WestEurope is now mitigated with redesigned flow from PG side. Though we expect ingestion to not stop at the exact configured daily cap but the scenarios where it was exceeding X times than the configured is now controlled: [https://learn.microsoft.com/en-us/azure/azure-monitor/logs/daily-cap#how-the-daily-cap-works](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/daily-cap#how-the-daily-cap-works) , Please do not raise ICMs with product group for this but rather discuss with STA Sahil and check for further steps like a feasibility of refund and customer-ready message.
</div>

This is a basic work flow that you can use whenever you are working with Azure Log Analytics billing cases. It covers some of the most common scenarios and their respective solutions. 
These scenarios are additionally publicly documented here: [Understand Log Analytics Workspace Costs and Usage](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/log-analytics/billing/understand-log-analytics-workspace-bill) with a step by step public facing article for each scenario.

The public documentation has been revised as of September 2024; refer to it for any pertinent information or fresh perspectives, as it now contains new material.

1. [Investigate unexpected cost increases in a Log Analytics workspace](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/log-analytics/billing/identify-service-cause-unexpected-costs?wt.mc_id=devops_inproduct_tsguide)
1. [Set daily cap limit for Log Analytics workspace](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/log-analytics/billing/set-up-a-daily-cap?wt.mc_id=devops_inproduct_tsguide)
1. [Set recommended alerts for proactive daily cap and ingestion notifications](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/log-analytics/billing/workspace-recommended-alerts?wt.mc_id=devops_inproduct_tsguide)
1. [Identify why daily cap was exceeded in a Log Analytics workspace](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/log-analytics/billing/why-daily-cap-exceeded?wt.mc_id=devops_inproduct_tsguide)
1. [Set retention for Log Analytics Workspace](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/log-analytics/billing/configure-data-retention?wt.mc_id=devops_inproduct_tsguide)
1. [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs)


#Scenario

1. The user sees an unexpected high cost and wants to understand the source of such billing
1. The user accidentally signs up for Capacity Reservation and wants to opt out of it
1. The user might be incorrectly billed and would like a refund
1. The user sees that the daily cap was exceeded
1. The user would like to know how to reduce their Log Analytics cost
1. The user would like to understand the Log Analytics bill
1. The user is using a legacy pricing tier and does not understand Per Node or Standalone billing

#Information you will need
Collect the following Log Analytics workspace details:
Workspace ID 
Workspace resource URI
Workspace region
Workspace pricing tier
Workspace daily cap
Workspace Usage Report (look at the detailed steps to request this from customer)


**If the customer only shares the workspace ID or the workspace name,** please use the article below to get the workspace details (such as the subscription ID, which you might need to load into Azure Support Center) - just as it's show on this How-To article [How-To: Find information about a workspace just having the name or workspaceID](/Log-Analytics/How%2DTo-Guides/Workspace-Management/How%2DTo:-Find-information-about-a-workspace-just-having-the-name-or-workspaceID)





#Known issues (Wiki or ADO items)


Feel free to consult the Known-Issues section of this Wiki

[Billing and Usage - Known Issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750274/Billing)

# Get Workspace Usage Report and translating it

For Scenarios 1,3,5 and 6 you would need access to customer's workspace usage report/billing report to translate the resource ids, meters and cost they are being charged against. CSS ASMS/Billing engineers have internal tools to get these reports but for AME engineers we can request this data from customers.

  
There are two ways to get the usage/billing report to look at:

1.  From Subscription --> Cost Analysis tab --> select view as "Cost By Resource" (default is accumulated costs) --> select time range --> add a filter for "Meter Category" --> Select "Log Analytics" and "Azure Monitor" since some of our meters are in Log analytics category and some are in Azure monitor category.

           An example of the selections below:

![==image_0==.png](/.attachments/==image_0==-c15713e9-a484-4214-876e-78e1790ead3d.png) 

And as the last step click on "Download" above and select "Excel" as the format.

2. Another way is, Customer can go to "Cost management + billing" in their azure portal --> Go to invoices --> and then click on "prepare usage file".  Please refer this: [https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/download-azure-daily-usage](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/download-azure-daily-usage)   

Once you have these reports, you can then look at the resource ids and meter names customer is being charged against. Our log analytics meter names are mentioned here for different features like log ingestion, retention etc. 

https://docs.azure.cn/en-us/azure-monitor/fundamentals/cost-meters


#Troubleshooting
<details closed>
<summary><b>Scenario 1: The user sees an unexpected high cost and wants to understand the source of such billing</b></summary>

<div style="margin:25px">

The customer might observe an increase in their billing - they see it is Azure Monitor and they raise a case directly.


In this case, the customer should be shown how they can filter for the specific resource group and even specific resource that caused the high billing using the Azure Portal - [Cost Analysis Public Documentation](https://learn.microsoft.com//azure/cost-management-billing/costs/quick-acm-cost-analysis). 

They can also leverage the steps mentioned above for "Get Workspace Usage Report and translating it".

If it is a workspace, then they can go to **Usage and estimated cost** blade to see what data type led to a high usage. 

Once the customer knows how to track the expensive resource (Log Analytics), they will see in **Usage and estimated cost** blade that a specific data type caused a lot of cost (Log Management or AzureDiagnostics for instance) but they would probably like to know what specific monitored resource caused the high cost.

At this point, the customers should be suggested to use the Workspace insights feature which shows them the Usage in a friendly way (besides other aspects)

[Log Analytics Workspace Insights Overview](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-insights-overview)

If they want even more flexibility, they can use the queries on ([Analyze usage in a Log Analytics workspace in Azure Monitor - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/analyze-usage)) to see the type of billable data (so that they understand what table caused them the highest cost) 

Then, they should be explained that this public article: [Data Volume by Azure Resource, Resource Group or Subscription](https://learn.microsoft.com//azure/azure-monitor/logs/manage-cost-storage#data-volume-by-azure-resource-resource-group-or-subscription) would help them see exactly what specific resource caused what type of high billing.



Ideally, the customer should understand that every table in Log Analytics has two valuable but hidden columns (<font color="red">_BilledSize</font> and <font color="green">_IsBillable</font>), which can help them understand their cost better and even create advanced reports. The <font color="red">_BilledSize</font> is expressed in bytes of data. 

Using the queries documented above, we can create a custom query which is looking in the Perf table to see what Counter Names led to the highest ingestion per each resource.

```
// get the highest consumption per CounterName for each resource
Perf
| where _IsBillable == true 
| summarize BillableDataBytes = sum(_BilledSize) by _ResourceId, CounterName
| sort by BillableDataBytes nulls last
```

Or this query, which shows the tables with the highest ingestion per each resource.

```kusto
// get the tables with the highest ingestion per each resource
search * 
| where TimeGenerated > ago(24h) 
| where _IsBillable == true 
| summarize BillableDataBytes = sum(_BilledSize) by _ResourceId, $table, _IsBillable
| sort by BillableDataBytes desc

```

You can also format the amount of data in a more human friendly manner by using the **format_bytes** function.

``` bash
search * 
| where _IsBillable == true 
| summarize BillableDataBytes = sum(_BilledSize) by _ResourceId, $table, _IsBillable
| sort by BillableDataBytes desc
| extend NicelyFormatted = format_bytes(BillableDataBytes)
```

Credit: Brandon Humphrey

<p style="font-size:16.0pt;font-family:Corbel">Query benefits from the Operation table:</p>

<b>If the customer sees an unexpected increase in billing for a Log Analytics workspace but ingestion and _BilledSize is approximately the same, the customer may have run out of benefits provided by [Defender for Servers data allowance](https://learn.microsoft.com/azure/azure-monitor/logs/cost-logs#workspaces-with-microsoft-defender-for-cloud) or [the Microsoft Sentinel benefit for Microsoft 365 E5, A5, F5, and G5 customers](https://azure.microsoft.com/pricing/offers/sentinel-microsoft-365-offer/)</b>.

You can check this by querying benefits from the Operation table. Here's a query that charts the benefits used in the last 31-days:

``` bash
Operation
| where TimeGenerated >= ago(31d)
| where Detail startswith "Benefit amount used"
| parse Detail with "Benefit amount used: " BenefitUsedGB " GB"
| extend BenefitUsedGB = toreal(BenefitUsedGB)
| parse OperationKey with "Benefit type used: " BenefitType 
| project BillingDay=TimeGenerated, BenefitType, BenefitUsedGB
| sort by BillingDay asc, BenefitType asc
| render columnchart 
```

Check the logs around the time when the customer reported the increase in billing, and if you see a significant drop in the BenefitUsedGB column, it could mean that the customer is no longer using data allowance from the benefits previously mentioned. For instance, if they disabled Defender for Server.

For more information, see [this section of the 'Analyze usage and cost' documentation.](https://learn.microsoft.com/azure/azure-monitor/cost-usage#query-benefits-from-the-operation-table)

Credit: Pedro Martinez

<p style="font-size:16.0pt;font-family:Corbel">Additional examples of granular billing observation:</p>


If someone wants to see the cost per each category in a scenario where they forward resource logs via Diagnostics Settings, they can also use this scenario.

Here is screenshot of AKS cluster diagnostic settings to forward two log categories to Log Analytics:

![image.png](/.attachments/image-4fc752b2-24fd-4891-b553-1208d73ca14a.png =700x400)


Here is a query to see how much billable data each category brought in the last 30 minutes.

``` bash
// see how many billable bytes each category generated on the workspace during a specific time-frame
// this is a heavy query, please run it on small time-frames
AzureDiagnostics
| where TimeGenerated > ago(30m)
| where _IsBillable == true 
| summarize BillableDataBytes = sum(_BilledSize) by Category
```

![image.png](/.attachments/image-e9ec22f6-b418-49f4-92e6-5b0990f4e7f7.png)

Of course, you can apply further calculation, such as dividing the bytes by 1000 or 1024 in order to get kilo-bytes.

```bash
// see how many billable KBs each category generated on the workspace during a specific time-frame
// this is a heavy query, please run it on small time-frames
AzureDiagnostics
| where TimeGenerated > ago(30m)
| where _IsBillable == true 
| summarize BillableDataKiloBytes = sum(_BilledSize) / 1000 by Category
```
Here is a screenshot of the above query results showing the two AKS cluster categories configured via diagnostic settings.

![image.png](/.attachments/image-71f0258a-8c06-4ac8-8adc-a520bc574d74.png =700x400)

In this scenario, we only have one AKS cluster resource, but if there are multiple clusters sending data to that workspace, then we can filter by Resource or ResourceID or any other property for that matter.

```bash
// see how many billable KBs each category generated on the workspace during a specific time-frame
// this is a heavy query, please run it on small time-frames
AzureDiagnostics
| where TimeGenerated > ago(30m)
| where _IsBillable == true 
| summarize BillableDataKiloBytes = sum(_BilledSize) / 1000 by Category, Resource
```
This screenshot shows results that include the AKS resource.

![image.png](/.attachments/image-c55ea3c1-e62b-4c60-86f9-f8ae12805500.png =700x400)

Furthermore, you can use this Wiki article [Check billing costs for Log Analytics consumption per Data Type](/Log-Analytics/How%2DTo-Guides/Workspace-Management/How%2Dto:-Check-billing-costs-for-Log-Analytics-the-consumption-per-Data-Type) to find valuable queries that would give you insights into the billing of the workspace


Finally, try to understand if there are duplicates that might cause this high ingestion, as per this article [Identify duplicate records and handle them](/Log-Analytics/Troubleshooting-Guides/Ingestion-pipeline/TSG:-Identify-duplicate-records-and-handle-them)
</div>
</details>

<details closed>
<summary><b>Scenario 2: The user accidentally signs up for Capacity Reservation and wants to opt out of it</b></summary>
<div style="margin:25px">

If the customer accidentally opted for Capacity Reservation, then please follow the process listed in this [How-to: Reset Capacity Reservation now called Commitment Tiers](/Log-Analytics/How%2DTo-Guides/Workspace-Management/How%2Dto:-Reset-Capacity-Reservation-now-called-Commitment-Tiers) to opt them out.

</div>
</details>

<details closed>
<summary><b>Scenario 3: The user might be incorrectly billed and would like a refund</b></summary>
<div style="margin:25px">

If the customer is inaccurately billed (more than it should be), then please follow this: [HT: Initiate a refund process](/Log-Analytics/How%2DTo-Guides/Billing-and-Usage/HT:-Initiate-a-refund-process)
<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
   
   **Note**
As per the recent discussion with log analytics PM lead, please do not deny customers help as the first step if it does not qualify for SLA breach, rather reach out to SMEs/STAs via AVA/swarming and we will see if we can do something for customers based on their usage of the product. Regardless whether it is something which customer configured accidently or if it is due to microsoft issue. But do not promise a refund to customers before the outcome of SMEs/STAs engagement.   
</div> 
</div>
</details>

<details closed>
<summary><b>Scenario 4: The user sees that the daily cap was exceeded</b></summary>
<div style="margin:25px">

Firstly, the customer should be directed towards the public documentation on [Understanding the daily cap](https://learn.microsoft.com/azure/azure-monitor/logs/daily-cap).

We do not commit or promise that the daily cap will be respected - which means that some data might accidentally arrive in the workspace, even if the daily cap was already reached for that day. The data ingested beyond the cap threshold is still billed. 

This situation is similar to when you are driving a car (ex: 100 km per hour) and you are suddenly hitting the brake pedal. The car will still move for a few more seconds, thus accumulating distance. It will not stop instantaneously.

First, make sure you know the customer's reset time for the daily cap and you factor it in.

The Daily cap reset time is arbitrarily assigned to a workspace and it might be the regular 00:00 or it might be another hour. The daily cap reset time dictates when the day starts and when the day ends for that workspace.

For example, let's say Workspace A has the daily cap set at 16:00 UTC. That means that the day starts at 16:01 (today) and it finishes the following day at 15:59 (tomorrow). Therefore, the backend software will try to apply the daily cap limit the customer sets (ex: 100 GB / day) on the data ingested between 16:01 today 15:59 tomorrow. It will not apply the cap on the data ingested between 00:01 today and 23:59 today.

In this scenario, if 90 GB are ingested  <font color="blue">today between 10:00 and 15:00</font> and another 90 GB are ingested also <font color="red">today between 17:00 and 22:00</font> – then the daily cap is well respected (even though 80 GB are exceeded over the quota theoretically for today), because it perceives in the following way -> <font color="blue">90 GB ingested in day 1</font> and another <font color="red">90 GB ingested in day 2</font>.

The daily cap setting can be seen on the Workspace Dashboard:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750251/How-To-Find-information-about-a-workspace-just-having-the-name-or-workspaceID

Once you filter for the relevant workspace, go to "Latest Workspace Snapshots" section, expand the 'properties' pane and look for "quotaNextResetTime" value which will indicate the reset time for this workspace.


<ins>**Work-In-Progress (formula)**</ins>
We are working on some sort of formula to determine when is "too much data" ingested over the cap, thus making the customer entitled for a refund (at least partially) - we will update this once we have more clarity.


[**INTERNAL explanation**] The main problem here is that there is delay in applying the daily cap, and that explains why more data can be collected. The higher the data frequency and volume – the more data will accidentally slip through. Determining if the data that slipped through is too much depends on the rate of incoming data. For instance, if a customer sends very high rates of data (10 GB per minute) then it would be expected for the daily cap to admit (and bill) a lot of excess data.  The problem is especially acute when a customer has a low daily cap (ex: just 10 GB daily cap).  If the customer is in a situation where they are hitting the daily cap every day, they are mis-using it. They should properly adjust their incoming data so they don’t routinely hit the cap. 

In an attempt to define a formula, we can take the example the following. If the daily cap was exceeded by 10 GB and the excess amount is also more than 5% of the customer's daily cap - then the customer deserves a refund for all the additional GBs after the initial 10 that accidentally slipped through. 

For instance, if I have a daily cap of 100 GB and there were 113 GB ingested in one day, then I am entitled for a refund of 3 GBs worth of data. The total data that was ingested over the quota is 13 GB, but we said the first 10 GB would be expected. Also, the 113 exceeded GBs are more than 5% of the customer's quota (which in this case would be just <font color="blue">5 GB</font>, because 5% out of 100 GB equals <font color="blue">5 GB</font>). Therefore, anything about the expected 10 GB is worth a refund.  


</div>
</details>


<details closed>
<summary><b>Scenario 5: The user would like to know how to reduce their Log Analytics cost</b></summary>
<div style="margin:25px">

The workspace usage report will give you insights into which workspaces are billed more and for which meters to focus on.  

1. General Log Analytics cost management

Here is a good article on how to reduce data volumes (and hence costs):

https://learn.microsoft.com/azure/azure-monitor/best-practices-cost

<br>

2. Cost management for Insights for Containers solution

Besides the regular Log Analytics practices for reducing cost, the AKS Insights solution comes with special procedures for reducing cost, which can be found on the below two articles:

https://medium.com/microsoftazure/azure-monitor-for-containers-optimizing-data-collection-settings-for-cost-ce6f848aca32
https://learn.microsoft.com//azure/azure-monitor/containers/container-insights-cost#controlling-ingestion-to-reduce-cost



</div>
</details>




<details closed>
<summary><b>Scenario 6: The user would like to understand the Log Analytics bill</b></summary>
<div style="margin:25px">

Here is a good article to help in understanding the actual bill (as opposed to just data volume):

https://learn.microsoft.com/azure/azure-monitor/usage-estimated-costs#view-azure-monitor-usage-and-charges

</div>
</details>


#Getting help (swarming)

If the troubleshooting steps provided have not helped you to resolve the issue, please try to search the error or the task you are looking for on:


a. Search engines (ex: Bing)

b. Azure Support Center search engine

c. Archived IcMs
	
d. Microsoft Teams
	
If you want to search in a specific channel, you can go in that channel and type CTRL + F, then add the text you are looking for:
	
e. Your OneNote base

f. Outlook (if you are subscribed to or part of Distribution Lists) 

g. Check  [Azure Status Page](https://status.azure.com/status)

h. Reach out for assistance in the [Azure Log Analytics swarming channel](https://teams.microsoft.com/l/channel/19%3acdcfaced2e9a4739b3786b8af3ba22f9%40thread.tacv2/Log%2520Analytics?groupId=2fb9049b-bc9c-4cca-a900-84f22c86116c&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) on Teams 

# Frequently Asked Questions
---
Q. Is there are plans to depredcated the legacy 'Standalone' pricing tier, similar to what happened with the 'Free tier'?
A. No, there are no plans to depredate for customers that have access to it.

#Product Group escalation

Please make sure the case has the right Support Area Path (SAP) selected and then simply use the IcM template generated by ASC when escalating the case. 

#Useful links
- [ ] Add additional links
https://learn.microsoft.com//azure/azure-monitor/logs/manage-cost-storage
