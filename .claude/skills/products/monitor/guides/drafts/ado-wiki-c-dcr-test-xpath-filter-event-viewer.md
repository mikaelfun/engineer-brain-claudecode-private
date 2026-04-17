---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Data Collection Rules (DCR)/How-To/How To: Test your Xpath Filter using Event viewer"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Data%20Collection%20Rules%20%28DCR%29/How-To/How%20To%3A%20Test%20your%20Xpath%20Filter%20using%20Event%20viewer"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

Note: All data and machine names in this page are from test lab and don't compromise any Pii data.


[[_TOC_]]
# Scenario
Since Xpath Filters have limitations and the biggest one seems to be the number of expressions that can be used in its filter. The best way to test these filters is to test directly in an event viewer filter Window.



# Your Xpath query

Depending on if the Customer has already provided a query or is need of help crafting one, you may already have the filter query to use. This How To will assume you already have a query, but it can also be used to test during the creation of one.

Let's take the following Query and we will step through how to execute it in Event Viewer:

"Security!*[System[(Level=1  or Level=2 or Level=3 or Level=4 or Level=0 or Level=5) and (EventID=1100 or EventID=1102 or EventID=4624 or EventID=4625 or EventID=4634 or EventID=4648 or EventID=4657 or EventID=4672 or EventID=4688 or EventID=4689 or EventID=4704 or EventID=4706 or EventID=4713 or EventID=4714 or EventID=4716 or EventID=4719 or EventID=4720 or EventID=4722 or EventID=4725 or EventID=4726 or EventID=4728 or EventID=4729 or EventID=4731)]]"

# Open Event Viewer and start a basic filter on the log you are looking to query:

![image.png](/.attachments/image-1025ae05-d5a8-4ded-b2fc-c47cb3be3e5e.png)

Now Let select the "Filter Current Log" option on the right-hand side of the viewing window.

![image.png](/.attachments/image-de586838-8d66-47c0-af56-96649de1673b.png)

We can start with any criteria, but it may be easiest to just choose a known event id. Once you have the criteria in lace you can go ahead and select the XML tab at the top of the query window.

![image.png](/.attachments/image-7e0fdc4f-3dcb-4d05-b812-0ce02b565b0d.png)

Once the Search is displayed in XML format, you can then select the "Edit query manually" option at the bottom of the window. This will allow you to take the query you are testing and paste the contents into the query to see if its valid.

![image.png](/.attachments/image-612ca4cd-1a0d-4b8d-8242-55b4a3fa8adf.png)

Once your content is in place then select the "Ok" button at the bottom of the screen.

![image.png](/.attachments/image-e83d9b25-667f-44c2-a7b8-ad6040fb9efe.png)

If there is a Syntax error in the query, or if the query is too long to be valid, you will receive an error similar to the following.

![image.png](/.attachments/image-baf35e69-9c64-43ae-b051-1ee7ac18930d.png) 

In this case we know the query is too long so if we remove some of the expressions it will be resolved as seen below:

"Security!*[System[(Level=1  or Level=2 or Level=3 or Level=4 or Level=0 or Level=5) and (EventID=1100 or EventID=1102 or EventID=4624 or EventID=4625 or EventID=4634 or EventID=4648 or EventID=4657 or EventID=4672 or EventID=4688 or EventID=4689 or EventID=4704 or EventID=4706 or EventID=4713 or EventID=4714 or EventID=4716 or EventID=4719 or EventID=4720 or EventID=4722 or EventID=4725 or EventID=4726 or EventID=4728)]]"

![image.png](/.attachments/image-61b23804-12c5-44c3-a489-08e120ac5912.png)

![image.png](/.attachments/image-31d2c9b6-d163-480b-bb55-81504d236b41.png)

# More Resources:

https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-rule-azure-monitor-agent?tabs=portal#filter-events-using-xpath-queries
https://learn.microsoft.com/windows/win32/wes/consuming-events#xpath-10-limitations

