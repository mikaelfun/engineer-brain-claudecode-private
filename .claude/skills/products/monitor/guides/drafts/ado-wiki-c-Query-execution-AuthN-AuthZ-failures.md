---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Query execution/Query execution issues due to AuthN or AuthZ failures"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FQuery%20execution%2FQuery%20execution%20issues%20due%20to%20AuthN%20or%20AuthZ%20failures"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
Azure Monitor logs are queried to retrieve the logs from the Log Analytics workspace. These queries retrieve results from the underlying API (api.loganalytics.io) post validating the authentication and authorization of the user.
Authentication and authorization usually sound similar but they are distinct security process in terms of identity and access management.
**Authentication** is the act of verifying the identity of a user, while **Authorization** is the process of defining, granting, and enforcing specific privileges of a user.
Customer usually queries the log analytics data through user or Entra ID or Azure Active Directory (AAD) app by assigning either available built-in roles or custom roles. We often see scenarios where the query execution slows down to some extent thus impacting the overall performance. 
There are several details which we can verify at your end before engaging the Product team.

# Authentication vs Authorization
---
It is very important to know and understand the difference between **_authentication_** and **_authorization_**

## Authentication (AuthN) 
---
It validates users are who they say they are: for AAD user, AAD issues a token with user information which then Draft validates. If it fails, Draft returns **401** response code to the client and will NOT proceed to the next step.

Some possible failure reasons:
* No authentication was provided in the request
* Token expired
* Token was issued for a different scope (Service) but was attempted on Draft (For example, using ARM token for Draft)

## Authorization (AuthZ)
---
It validates what users are allowed to do: for AAD user, Draft check's role assignment and role definitions against AAD to verify the user has permissions to the resource (Roles are a wrapper, and the permissions effectively enforce AuthZ). If the user does not has microsoft.operationalinsights/workspaces/query/read permission (action):
* Query will fail, Draft returns **403** response code to the client and will NOT proceed to the next step
* Some possible failure reasons:
     - Unauthorized
     - Invalid Access Token (Malformed etc.)

A query can also get a **403** response code if it violates AMPLS query setting


# Suggested actions and guidelines
---

##1.Verify the mechanism used to query logs
We have seen scenarios where the customers leverage other resources to query Log analytics data and make use of token for authentication. If a valid token is not obtained, then we may encounter 4xx error like below:

![image.png](/.attachments/image-af291c09-2cbc-47e9-9836-97207b4d2fb9.png)

Error message: "Valid authentication was not provided"
Error code: "AuthorizationRequiredError"


In such cases, need to make sure that valid token is supplied for query execution. You can refer [this](/Log-Analytics/How%2DTo-Guides/Workspace-Management/How%2Dto:-Use-the-Log-Analytics-search-API-and-validate-the-permissions-are-correctly-set) documentation or engage Azure Active Directory team for investigation related to this issue. 

## 2. Query optimization
Ensure that the customer is using optimized queries to avoid any performance issues due to it. You can refer the guidelines mentioned in the below documents for same:

- [Queries run slowly or have performances issues](/Log-Analytics/Troubleshooting-Guides/Query-execution/Queries-run-slowly-or-have-performances-issues)
- [Optimize log queries in Azure Monitor - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/azure/azure-monitor/logs/query-optimization)

## 3.Check for outages
Refer to the following blog page to check for backend failures at the time when the customer is facing issue in their query execution: [Azure Monitor Status Archive | Microsoft Community Hub](https://techcommunity.microsoft.com/category/azure/blog/azuremonitorstatusblog)

## 4.Check for ARM calls
In generic scenarios the query execution is directly routed to the DRAFT API (URL starting with https://api.loganalytics.io/�) but in some case, customer might be using Azure Resource Manager (ARM) Software Development Kits (SDK) (URL starting with https://management.azure.com/� ) instead to run their queries.

Hence it is helpful to collect HAR traces (refer to the steps on how to collect a HAR trace in this TSG - [How To Capture a HAR file - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750213/How-To-Capture-a-HAR-file)) and check the request URL to validate the API leveraged for query execution:

![image.png](/.attachments/image-47d6bb56-c0c6-4c83-bde7-4c805eaa68b1.png)

If the Request URL starts with https://management.azure.com/� , execute the below Kusto query to look for failures:

Execute [[Web](https://dataexplorer.azure.com/clusters/armprodgbl.eastus/databases/ARMProd?query=H4sIAAAAAAAAA32QTU%2FDMAyG75P2H6ycOgnWbuM0PqRqFBaxtSXpQBxDa7aILRmJp2mIH084sCKEkHywbL%2BPX3uNBJ6Uo0pvEC6hUYQU0miYDAenySgEDIbjUTJOkt45xDE3Hh2B%2FNIcp7uddeCgaf6nnP2mZKb5wVgYbY1%2BRxcxgW879OTZCbAp0Zab2m60WR7rPeh2PmC%2FQodQ8Xkmq3RewjPSHtFA1J7U73%2F76rWK0F0iLZyG2hpS2nhgFwK93bkagTdgX4BWCDO7hNSo9YF07WFv3avfqhqvWIuyW3SKgvFchW0rFUilKB74dSZkPOcTUcjipuoXZSbSihd5OuO55LfTSsaPhbiTZTrJJAMVPvEH6n6RiSf2CU9QaQSlAQAA)] [[Desktop](https://armprodgbl.eastus.kusto.windows.net/ARMProd?query=H4sIAAAAAAAAA32QTU%2FDMAyG75P2H6ycOgnWbuM0PqRqFBaxtSXpQBxDa7aILRmJp2mIH084sCKEkHywbL%2BPX3uNBJ6Uo0pvEC6hUYQU0miYDAenySgEDIbjUTJOkt45xDE3Hh2B%2FNIcp7uddeCgaf6nnP2mZKb5wVgYbY1%2BRxcxgW879OTZCbAp0Zab2m60WR7rPeh2PmC%2FQodQ8Xkmq3RewjPSHtFA1J7U73%2F76rWK0F0iLZyG2hpS2nhgFwK93bkagTdgX4BWCDO7hNSo9YF07WFv3avfqhqvWIuyW3SKgvFchW0rFUilKB74dSZkPOcTUcjipuoXZSbSihd5OuO55LfTSsaPhbiTZTrJJAMVPvEH6n6RiSf2CU9QaQSlAQAA&web=0)] [[cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd')](https://dataexplorer.azure.com/clusters/armprodgbl.eastus/databases/ARMProd)]

```
let�startTime�=�datetime(2021-03-03�12:30:00);�//Insert�Start�datetime  
let�endTime�=�datetime(2021-03-03�12:40:00);�//Insert�End�datetime  
Unionizer("Requests",�"HttpIncomingRequests")�  
|�where�TIMESTAMP�between�(startTime�..�endTime)  
|�where�targetUri�contains�"<Resource�Id�of�the�Log�Analytics�workspace>"  
|�where�operationName�has�"PROVIDERS/MICROSOFT.OPERATIONALINSIGHTS/WORKSPACES"�and�operationName�has�"QUERY"
```
If you are getting a failed entry for the above table, also identify if the error is coming from the Query API directly by looking for the �HttpOutgoingRequests� table (query mentioned below) with the same filter. 

Execute [[Web](https://dataexplorer.azure.com/clusters/armprodgbl.eastus/databases/ARMProd?query=H4sIAAAAAAAAA32QTU%2FDMAyG75P2H6ycNgnWbuM0PqRqFBaxNSXpQBxDa7qIkYzE0wTixxMObAghJB8s2%2B%2Fj114jQSDtqTIvCOfQaEKKaW%2BUjobH6TgGDEeTcTpJ0%2F4pJAm3AT2B%2BtLsp7uddeSgbf6nnPym5Lb5wVha46x5R99jEl%2B3GCiwI2Azoo3YUuuMbff1PkC38wG7FXqEii9yVWWLEh6RdogWeoebBoNvY%2F2DInZbpKU3UDtL2tgA7ExicFtfI%2FAG3BPQCmHuWsisXr%2BRqQPsnH8OG13jBTug3Aa9pui80HHbSkdSKcUdv8ylShZ8KoUSV9VAlLnMKi6KbM4Lxa9nlUruhbxRZTbNFQMdX%2FEH6naZywf2CTjGoGmmAQAA)] [[Desktop](https://armprodgbl.eastus.kusto.windows.net/ARMProd?query=H4sIAAAAAAAAA32QTU%2FDMAyG75P2H6ycNgnWbuM0PqRqFBaxNSXpQBxDa7qIkYzE0wTixxMObAghJB8s2%2B%2Fj114jQSDtqTIvCOfQaEKKaW%2BUjobH6TgGDEeTcTpJ0%2F4pJAm3AT2B%2BtLsp7uddeSgbf6nnPym5Lb5wVha46x5R99jEl%2B3GCiwI2Azoo3YUuuMbff1PkC38wG7FXqEii9yVWWLEh6RdogWeoebBoNvY%2F2DInZbpKU3UDtL2tgA7ExicFtfI%2FAG3BPQCmHuWsisXr%2BRqQPsnH8OG13jBTug3Aa9pui80HHbSkdSKcUdv8ylShZ8KoUSV9VAlLnMKi6KbM4Lxa9nlUruhbxRZTbNFQMdX%2FEH6naZywf2CTjGoGmmAQAA&web=0)] [[cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd')](https://dataexplorer.azure.com/clusters/armprodgbl.eastus/databases/ARMProd)]
```
let�startTime�=�datetime(2021-03-03�12:30:00);�//Insert�Start�datetime  
let�endTime�=�datetime(2021-03-03�12:40:00);�//Insert�End�datetime  
Unionizer("Requests",�"HttpOutgoingRequests")��  
|�where�TIMESTAMP�between�(startTime�..�endTime)  
|�where�targetUri�contains�"<Resource�Id�of�the�Log�Analytics�workspace>"  
|�where�operationName�has�"PROVIDERS/MICROSOFT.OPERATIONALINSIGHTS/WORKSPACES"�and�operationName�has�"QUERY"
```
�If there is a failure for the above query as well move to step 4 for further investigation. 
�If there is no failure for the above query, then the error message is coming from ARM itself and would need investigation from PG�s end. 


## 5.Execute the DRAFT telemetries from ASC
Collect the Request Id of the recent query execution from the customer and execute the below telemetries from **Query Draft Telemetry tab in ASC**:

a.	Get the reported error message for a request ID: 
```
let requestId = '<request-id>';
requests
| where operation_ParentId == requestId
| extend Failure_message_ = todynamic(customDimensions.['Failure.message'])
| extend Failure_message_1 = todynamic(customDimensions.['Response.errorMessage'])
| extend message = iff(isnotempty(Failure_message_ ),Failure_message_ ,Failure_message_1 )
| extend json = parse_json(tostring(message))
| project json
| evaluate bag_unpack(json)
```

b.	Request failure rate of a specific WS id in the last 24 hours:
```
let wsId = '<workspace-id>';
requests
| where customDimensions.['Workspace.workspaceId'] == wsId
| summarize allRequests = count(), failedRequests = countif(toint(resultCode) >= 500)
| extend failureRate = failedRequests  * 100.0 / allRequests
```
c.	All schema load failure for a specific WS ID in the last 24 hours:	
```
let wsId = '<workspace-id>';
requests
| where customDimensions.['Workspace.workspaceId'] == wsId
| where customDimensions.['Request.pathName'] == 'metadata'
| where resultCode != '200'
| extend message_ = tostring(parse_json(tostring(customDimensions.['Response.errorMessage'])).message)
| project timestamp, message_
```
d.	In addition to the above query, you can execute the below query to examine the amount of time taken for a specific query execution:
```
let requestId = '<request-id>';
requests
| where operation_ParentId == requestId
| extend client = tostring(customDimensions ["Request.clientApp"])
| extend clientInfo = tostring(customDimensions["Request.clientRequestInfo"]) 
| extend client = iif(clientInfo startswith "query=AnalyticsPartQuery", "Azure Dashboards", client)
| extend client = iif(clientInfo startswith "query=UsageNotebookKqlQuery&part=UsageNotebookBlade", "Workbooks", client)
| extend client = iif(client == "AppAnalytics", "Log Analytics UI", client)
| extend client = iif(client has_any ("Unknown", "csharpsdk","LogAnalyticsPSClient"), "API", client)
| extend query = tostring(customDimensions.['Query.cslParam'])
| extend userAgent = customDimensions.['Request.userAgent']
| extend workspaceId = customDimensions.['Workspace.workspaceId']
| extend querySource= customDimensions.['Monitoring.feature']
| extend monitoringSource= customDimensions.['Monitoring.source']
| extend duration = strcat(tostring(duration*0.001) , " seconds")
| extend responseSizeInBytes = customDimensions.['Response.sizeInBytes']
| project timestamp,requestId=operation_ParentId, workspaceId, resultCode, E2Eduration=duration, performanceBucket, query= trim("(?:.*?;){2}(.*)",query) , client, querySource, monitoringSource, responseSizeInBytes
```
## 6. Verify the roles assigned
-Verifying the role assigned to the user/ AAD app is the crucial step while investigating the auth related issues during query execution. Hence it is very important to verify the below pointers:

a.	Verify if the role assigned to the Log Analytics workspace is a built-in role or custom role. You can validate the same by navigating to the Access Control blade of the Log Analytics workspace. The steps mentioned [here.](https://learn.microsoft.com//azure/role-based-access-control/check-access)

b.	In case of custom role, check the role definition through the below PowerShell cmdlet:  

**PowerShell Cmdlet**: Get-AzRoleDefinitation -Name �<Custom Role Name>"

**Output:** The output will describe the actions and not actions of the custom role defined in the above cmdlet.

![image.png](/.attachments/image-c5d5de9f-22f9-4b18-a906-47f7ed0ee851.png)

Looking at the role definition�s Actions column, verify if the customer has given access to all logs types or specific tables:

**Action 1:** Microsoft.OperationalInsights/workspaces/query/*/read - Access to all log types using queries.

**Action 2:** Microsoft.OperationalInsights/workspaces/query/Heartbeat/read - Access to specific table.

**Recommendation**
In case of custom roles, recommendation is to have **Action 1** defined in the custom role instead of **Action 2** as in the latter case the RBAC is slow because it has to figure out which tables within the entire workspace the user actually has access to. The mechanism used for this traversing is in the process of optimization from the Product team's end but currently we do not have any ETA for same.


c. Verify the number of custom role assignments/role definitions present in the subscription. Though we do not have any specific limit over number of custom roles that can be created in a subscription, its always seen that the lesser the number of custom roles leads to better RBAC performance. 

d. Also, check the number of tables present in customer�s log analytics workspace, especially the custom log tables as it impacts the query execution performance and often leads to slowness.
You can execute the below query in the customer�s workspace from ASC:

**Query:** union * | summarize count() by Type

# PG Escalation
---
If the above steps did not help with getting the issue resolved, please proceed with opening ICM to below team:

**Owning Service:** Azure Log Analytics
**Owning Team:** DataPlane_API_QueryService

Information required when opening ICM: 

1.	HAR traces collected in 4th step of previous section.
2.	Request ID of recent query execution.
3.	Target query and timeframe.
4.	Permission related information collected in 5th step of previous section.

Please ensure you follow the instructions in this wiki page while raising ICM: [Escalating to the PG](/Log-Analytics/Collaboration-Guides/Escalating-to-the-Azure-Log-Analytics-product-group)

In case of any doubts, please reach out to a Log Analytics SME\TA\STA\EEE.

