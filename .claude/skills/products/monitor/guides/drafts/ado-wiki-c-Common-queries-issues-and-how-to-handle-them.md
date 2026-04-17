---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Query execution/Common queries issues and how to handle them"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FQuery%20execution%2FCommon%20queries%20issues%20and%20how%20to%20handle%20them"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Training
---
![image.png](/.attachments/image-372d2ca4-90e6-49ca-8de7-be3a883a7b01.png =550x)

We finally have this available in Cloud Academy (make sure you are logged in): [Log Analytics common queries issues and how to handle them - Cloud Academy](https://cloudacademy.com/learning-paths/log-analytics-common-queries-issues-and-how-to-handle-them-1854-12875/)

In case you cannot access Cloud Academy, you can review one of the recordings of the original brownbag: [Option 2](https://microsoft.sharepoint.com/:v:/t/AzMonPODSwarming/EQAty2mpa3RGqV7BTOxIY1sBrfuzyqIpiRHZ7legnGc6ig?e=ogGccH&nav=eyJwbGF5YmFja09wdGlvbnMiOnsic3RhcnRUaW1lSW5TZWNvbmRzIjoxOTEuOTh9fQ%3D%3D) [Option 1](https://microsoft.sharepoint.com/:v:/t/AzMonPODSwarming/EUMTMmServdDrAvf1fSNXlUBAvsQpqfvP-E3SthNhX3gjA?e=8WjTay&nav=eyJwbGF5YmFja09wdGlvbnMiOnsic3RhcnRUaW1lSW5TZWNvbmRzIjoxNDAuNX19)

# Background
---
Log Analytics (LA) queries can sometime result in errors and with some issues. It is important to first identify what kind of issue is your customer facing to tell the best way to address it.
This page depicts the most common issues and errors one may face when querying Log Analytics workspaces.

- <b>Note that the queries internal telemetry (also known as Draft telemetry) holds data up to around 30d.</b>
- <b>Azure Monitor CSS does not handle SLA breaching refund calculation</b>

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#FF99C1">

For details on Query Limits, check this troubleshooting guide (TSG): [Query limits - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750133/Query-limits)

</div>


# 1. Known and by-design issues
----
Troublehsooting guides (TSG) with known and by-design issues:
[By Design: Query execution failures after the table schema was altered](/Log-Analytics/Known-Issues/Query-experience/By-Design:-Query-execution-failures-after-the-table-schema-was-altered)
[parse_json() may return error "Query could not be parsed at '.'" once you parse special items](/Log-Analytics/Known-Issues/Query-experience/parse_json\(\)-may-return-error-"Query-could-not-be-parsed-at-'.'"-once-you-parse-special-items)

# 2. Check for any identified ongoing outages
---
A. Check on ASC whether a subscription which the affected workspace(s) is on has a service health identified for it (Under ASC Insights page)
B. Check Iridias: [Iridias](https://iridias.microsoft.com/incidentcentral)
C. Check any email communication sent by SMEs/STA/EEE, Teams channels/groups etc.

# 3. Check for any potential emerging ongoing outages
---
</br>

**It is possible that some service issues, which affect queries, have not been identified as an outage yet/at all.**
Draft, our query service, has several different dependencies, such as other internal services of the holistic Log Analytics service (Such as Kusto Cluster Managemtn (KCM), Log Analytics Control Plane (LACP), Entra ID or Azure Active Directory (AAD), Azure Resource Manager (ARM), Kusto etc.)

**We have the following dashboard to identify a potential emerging outage between Draft and Kusto dependency** in particular (I.e, it is not intended for checking query service , aka Draft, health from all point of views).
Do note that this should be used for getting a sense of a potential emerging issue, as it does not necessarily mean your issue is related with that or vice versa.

- A cluster that has the 'x' suffix stands for a dedicated cluster the customer enabled.
- A cluster that has the 'd' suffix stands for a dedicated cluster that Microsoft seamlessly migrated a customer to (This information is not to be shared with customers).


1. Check the region of the affected workspace(s).
1. Go to the Log Analytics Kusto Cluster health signal monitor tool: 
**Link to the tool:**: [Geneva Health | Jarvis](https://portal.microsoftgeneva.com/health)
3. Expand the "Kusto Cluster Health Signal Monitor" and expand the region(s) you suspect are affected
![image.png](/.attachments/image-67819e34-464c-4cc8-9392-1528060ca950.png)
- If you see a whole region/most clusters in a region showing in <SPAN style="color:#C00000">**red**</SPAN> around the affected time frame, there is a possibility of a regional Query outage. Please contact a Log Analytic SME.
 <SPAN style="color:#C00000;font-size:14.0pt">**Do not share this as a service issue/outage with a customer before confirming with a LA SME/STA/EEE.**</SPAN>

- If you see a whole region/most clusters in green around the affected time frame, it means that there isn't likely an issue with underlying Kusto clusters. Please contact a Log Analytic SME in case of doubts.

# 4. Check if the query is Resource scoped or not
---
Check if a query is in Resource scope or not, **since there are expected behaviors and some limitations applying to such scenario**:
[Resource scope queries - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1090930/Resource-scope-queries)

# 5. Check if this is a customer's networking or environmental issue
---
See: [How-To: Analyze HAR traces and decide if and which product team should we escalate to - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750202/How-To-Analyze-HAR-traces-and-decide-if-and-which-product-team-should-we-escalate-to)


# 6. Check the failing request using Draft telemetry
---
Using Azure Support Center (ASC), navigate to the affected workspace and click on "Query Draft Telemetry" tab.
Then, **set the time\time range** when the query you wish to inspect was executed however you see fit.

Once set, use the **requestId** which is the unique identifier of the given query execution to investigate it.
- On portal, you will see it either on the failure message that pops up or else by clicking on "Query details" at the bottom of the page post execution.
- If you have been provided with a HAR trace, look for the corresponding request of the query. You can find it by searching for some keywords of the query itself or filtering for it as per the call made to draft (See "Owning Team: Draft (API)-OMS" - check this TSG's section [How-To: Analyze HAR traces and decide if and which product team should we escalate to - Decide which product group a CRI investigation should start with](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750202/How-To-Analyze-HAR-traces-and-decide-if-and-which-product-team-should-we-escalate-to?anchor=decide-which-product-group-a-cri-investigation-should-start-with))
Once you identify the right request, you can either check the response payload as it is likely to show the error (See list of errors below), or use the requestId which will be the value of 'x-ms-client-request-id' header specified by the request.�

Run the following query:

```
let requestId = '<request-id>';
requests
| where operation_ParentId == requestId
| extend Failure_message_ = todynamic(customDimensions.['Failure.message'])
| extend Failure_message_1 = todynamic(customDimensions.['Response.errorMessage'])
| extend message = iff(isnotempty(Failure_message_ ),Failure_message_ ,Failure_message_1 )
| extend error = parse_json(tostring(message))
| project timestamp, resultCode, error
```

# 7. Resource Health Low Query Success Signal
---

Sometimes customer would find their workspace resource health showing "Degraded" because of low query success rate and would like to understand the root cause for that. Please follow this guide for the same: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1245381/Resource-health-Query-success-signal


# HTTP 200 OK response code with underlying issues
---
While a 200 OK response may look like a definitive valid response code, it sometimes indicate that the service returned a valid answer, but there is an underlying issue.
**These are defined as 'non-fatal errors' during query execution. The response will also contain an error property, which is OneAPI error object with code PartialError (which is the representation of the same over Draft internal telemetry). Details of the error are included in the details property.** 
(see: [Azure Monitor Log Analytics API response format - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/azure/azure-monitor/logs/api/response-format))

Most common examples and how to check them are below:
<details closed>
<summary><b>1. Response size has exceeded 64MB</b></summary>
<div style="margin:25px">
Can also return 400 response code under certain circumstances. See:
<a href="https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750290/By-Design-Query-Size-Exceeded-Response-Size-too-Large">Response size has exceeded 64MB</a>
<br>
</div>
</details>

<details closed>
<summary><b>2. Query has exceeded the maximum allowed memory</b></summary>
<div style="margin:25px">
This issue leads to receiving partial and incomplete data, sometimes even getting 0 results back. This can be identified by running the following query on draft telemetry:
<br>
<br>
<p style="background-color:tomato;">
<i>let requestId = '00000000-0000-0000-0000-000000000000'; //requestId might be in a non-dashed delimiter convention
dependencies
| where operation_ParentId == requestId
| where customDimensions has "WSNameOrId" //workspace name or wsid
| extend partialQueryFailures= customDimensions['Kusto.partialQueryFailures']
| project resultCode, partialQueryFailures
</i>
</p>

This is an issue which is a direct result of an in-efficient query. Usually caused by a use of 'join' operator in a non efficient manner (Sometimes it might be due to other operator such as "summarize"). Therefore, please work with the customer to improve their query following:
<a href="https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750403/Queries-run-slowly-or-have-performances-issues">Queries run slowly or have performances issues</a>
<br>

<b>For more context from ADX point of view, see the following, however note that in Log Analytics you can not increase the memory limit from 5GB and cannot modify 'maxmemoryconsumptionperiterator':</b>
<a href="https://learn.microsoft.com//azure/data-explorer/kusto/concepts/querylimits#limit-on-memory-per-iterator">XYZ operator has exceeded the memory budget during evaluation. Results may be incorrect or incomplete</a>
<br>
</div>
</details>

<details closed>
<summary><b>3. Missing JSON or Content-Type</b></summary>
<div style="margin:25px">
See:
<a href="https://learn.microsoft.com//azure/azure-monitor/logs/api/errors#missing-json-or-content-type">Missing JSON or Content-Type</a>
<br>
</div>
</details>


# Issues based on HTTP response code
---
Queries are in fact an HTTP call to an API (Usually to api.loganalytics.io and api.loganalytics.azure.com), hence they can return a variety of HTTP response codes.

The API public documentation also states the most common error messages, which you can refer to in this documentaion: [Azure Monitor Log Analytics API errors - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/azure/azure-monitor/logs/api/errors)

**Below is additional information on some of these common errors, what to check for and how to handle them.**

<details closed>
<summary><b>HTTP Response Code 400</b></summary>
<div style="margin:25px">
As per our official documentation, this stands for a Syntax error within the query:
<a href="https://learn.microsoft.com//azure/azure-monitor/logs/api/errors#query-syntax-error">HTTP 400 Response Code - Query Syntax Error</a>
While indeed sometime this is due to a simple syntax errors, <b>but sometimes this syntax error simply reveals a different issues.</b>
<br>
Common examples are:
<br>
<b>a.</b> Query syntax is OK, but a schema\table which is included in the query does not exist on the workspace for some reason. This could be due to reasons such as table related solution does not exist etc.
<br>
<b>b.</b> Query syntax is OK, but a field\column which is included in the query does not exist on the table for some reason. This could be due to reasons such as having a different version of a table in specific region (See ), custom fields created by the customer which have been removed by the customer, AzureDiagnostics fields which are now added to AdditionalFields instead of standing alone as their own field etc.
<br>
<b>c.</b> Sometimes a 400 response code can be returned for an inefficient query, even getting blocked by a mechanism implemented by the product group if a certain pattern is identified with the query in scope. Error Code/InnerError will show <b>"QueryCostError".</b>
<br>
An indication would be one of the following, where the first one is a manual 'lock' done by the product group, and the second and third are automatic.
The solution would be, again, to improve the query and fine tune its performance based on: <a href="https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750403/Queries-run-slowly-or-have-performances-issues">Queries run slowly or have performances issues</a>
<b>Exception is the first one which is a 'manual' lock, which requires a CRI to be opened with Draft product group to ask to release it, while this does not rule the need to improve the query.</b>

<br>
<p style="background-color:tomato;">
1. This�query�was�blocked�for�several�minutes�as�it�was�consuming�too�many�resources. To�revise�the�query,�view�our�best�practices�for�optimizing�log�queries�-�https://aka.ms/logqueryperf";
<br>
2. This�query�was�blocked�for�several�minutes�because�it�failed�to�complete�too�many�times.�To�revise�the�query,�view�our�best�practices�for�optimizing�log�queries:� https://aka.ms/logqueryperf
<br>
3. This�query�was�blocked�for�several�minutes�because�it�failed�to�complete�too�many�times. To�revise�the�query,�view�our�best�practices�for�optimizing�log�queries:� https://aka.ms/logqueryperf
</p>
<br>
d. If Log Analytics functions are involved, see: [Query could not be parsed (Syntax issue) - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1031982/Query-could-not-be-parsed-(Syntax-issue))
</div>
</details>


<details closed>
<summary><b>HTTP Response code 502\503</b></summary>
<div style="margin:25px">
Sometimes, a customer may receive 502 or 503 response codes for their queries. It�s important to first verify whether these were received during a related outage that affected the ability to query workspaces in the relevant region(s). If so, you can share the outage details with the customer through the appropriate channels.


**If these were not received during an outage, then before proceeding forward with any investigation, we must first set the right expectations customer with the following sentiment and customer ready message:**

_Log Analytics is a cloud based logging service, that provides scalable and highly available widely used system, as of the nature of cloud based systems, the availability is not 100% and transient errors might occur. As a cloud service we are dependent on other underlying services. 
We are suggesting our customers to build on a retry policy with exponential backoff strategy, to be able to deal with such occurrences in a retry methodology. See: [Implement retries with exponential backoff - .NET | Microsoft Learn](https://learn.microsoft.com/en-gb/dotnet/architecture/microservices/implement-resilient-applications/implement-retries-exponential-backoff)
Be assured that we are continuously improving our system and striving to minimize the impact on our customers. In addition, below is the Log Analytics SLA doc for your reference: [SLA for Log Analytics | Azure](https://www.azure.cn/en-us/support/sla/Log%20Analytics/index.html)

Saying that, this does not rule out the need to investigate this situation since there still might be some out of the ordinary ratio or specific problem which requires our product group's attention.
Saying that, please open a CRI with the Draft team, while providing the following details:
1. Workspace Id and Name
2. Workspace region
3. Time range of issue occurrence
4. If possible, please provide a few requests-ids OR correlationIds for the requests made which returned 502\503 response codes.

<br>
</div>
</details>

<details closed>
<summary><b>HTTP Response Code 429</b></summary>
<div style="margin:25px">
This stands for Throttling, which means that the customer has breached one\more limitations related with throttling as per:
<br>
<a href="https://learn.microsoft.com/azure/azure-monitor/service-limits#user-query-throttling">User query throttling limits</a>

</div>
</details>

# Queries logical issues
---
Sometimes queries you run might result in unexpected results, for example you get less records than expected or no records at all. **In addition to the examples provided in the section above of "HTTP 200 OK response code with underlying issues", below are additional common examples:**

<details closed>
<summary><b>1. innerunique join vs inner join</b></summary>
<div style="margin:25px">
If one uses �join� without explicitly mentioning its kind , the default kind used would be innerunique. <b>However, innerunique flavor may result in less results due to its nature.</b>
If the customer aims to use a standard innerjoin, the must explicitly mention it as follows:
<i><X | join kind=inner Y on Key/i>
For more information, See:
<a href="https://learn.microsoft.com//azure/data-explorer/kusto/query/joinoperator?pivots=azuremonitor#join-flavors">Join flavors, innerunique vs inner join</a>
<br>
</div>
</details>


<details closed>
<summary><b>2. Using the 'has' operator</b></summary>
<div style="margin:25px">
If a query uses the 'has' operator, we must pay attention to the customer's understating of the consequences. While 'contains' is less efficient, it scans an entire string, while 'has' scans for indexed 'terms'. If the 'has' operator customer is using is searching for a string which is not a valid term, then no results will be found and the completeness and logic of their query could be damaged. Please refer to the following: <a href="https://learn.microsoft.com//azure/data-explorer/kusto/query/datatypes-string-operators">String operators</a>
<br>
</div>
</details>


<details closed>
<summary><b>3. Using the 'take' operator</b></summary>
<div style="margin:25px">
The �take� (limit) operator is commonly used.
However, while often expected to result in sequential results, it returns a random set of records.
This means that: Say a customer has a table with 100 records and he is using |take 50 on it, it will not necessarily take the first 50 records by any order.
Solution: 
Filtering out to the bare minimum of relevant records
Then, Using any sequence preserving method (For example, sort (order by))
<br>
Please refer to the following: <a href="https://learn.microsoft.com//azure/data-explorer/kusto/query/datatypes-string-operators">String operators</a>
<br>
</div>
</details>
