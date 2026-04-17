---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Get Logs/Locate a specific operation in Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FTroubleshoting%20Guides%2FGet%20Logs%2FLocate%20a%20specific%20operation%20in%20Kusto"
importDate: "2026-04-06"
type: troubleshooting-guide
---

This is one of those TSG where there is not a *one fits all* solution.

In some cases, locating an operation in Kusto can be done with the **resource id** (in the `targetUri` column), plus the **http status code** and a rough **timestamp**. In other scenarios, using the **principal id** of the user plus the **tenant id** plus a rough **timestamp** might help locate it. And in others, it might not be very obvious and a HTTP trace (See [[ARCH] HTTP Traces](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623755)) might be required to find the specific **activity id** or **correlation id** of the scenario being investigated.

The important thing to remember is that Kusto is flexible, and we can query on any column and querying on any column means using all the information we can get from the customer error message and description of the issue.

Here are a few scenarios where we can "deduce" some Kusto filters for troubleshooting (although they may not be deterministic):

- *"I got an error:"* That means HTTP status code is **> 300**.
- *"I cannot create X, Y or Z":* That means the http method is a **PUT**.
- *"Deployment failed":* We can query the **Deployments** table with a status **Failed** filter.

For all the scenarios above the ticket also already includes the **subscription id**, a rough **timestamp** (from when the ticket was created), the **object id** of the user and sometimes even a **resource id**. And when we are not able to locate the operation this way, we can always fall back to get a trace to obtain a **correlation** or **activity id**.
