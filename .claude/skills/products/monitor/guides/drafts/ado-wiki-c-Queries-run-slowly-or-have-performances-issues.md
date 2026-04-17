---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Query execution/Queries run slowly or have performances issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FQuery%20execution%2FQueries%20run%20slowly%20or%20have%20performances%20issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
Azure Monitor Logs uses the Kusto language (also known as ADX/KQL) to query data. Queries are executed in sequential order, meaning they are processed from top to bottom as they appear.

While Azure Monitor Logs is optimized for data analysis, customers may still run into issues with queries performances. This includes (But not limited to) **queries running slowly, throttling or timing out.**
There are several actions we can suggest to improve and handle such issues, as well as some tools that can be used to analyze query performances.


# Before you proceed
---
<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#FF8DD1">

If the affected queries/functions are provided out of the box by Microsoft, the responsibility for ensuring their efficiency lies with the team that created these queries/functions.


</div>

# Query limits
---
<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#FF99C1">

Before proceeding forward with the investigation, please make sure you are fully aware of the Query Limits and expected behavior derived from these: [Query Limits](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750133/Query-limits):

</div>

# Suggested actions and guidelines
---
The guidelines below are the pillars for all queries. Gradual increase in the scales of data our customers process is the main reason these should be followed. While in lower data scales these suggestions might seem to have nearly no affect, they become crucial as more data is stored and processed by the customers.


## 1. Always filter by TimeGenerated first (for example, TableName | where TimeGenerated�.)

- Performance-wise, this leverages the underlying structure of the service, where tables are split into time-based chunks (also known as "Extents").
- It ensures that any query operations down the line are executed on a smaller dataset.
- If a customer's goal is to retrieve only recent data, querying up to 14 days typically provides better performance. Newer data is usually stored in a more performant tier with lower latency, reducing query duration and CPU usage. After a query is executed, you can check how old the processed data is by reviewing the "Age of processed data" value in the Query Performance pane.
- If any sub-queries are used (for example, after a `join` operation), it is recommended to apply time-based filters whenever possible, depending on whether the scenario allows for it.


<P style="margin:0in;margin-left:.375in;font-family:Calibri;font-size:11.0pt"><SPAN style="font-weight:bold">An example of DO:</SPAN></P>



<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt;color:black">KubePodInventory</P>


<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt"><SPAN style="color:black">|</SPAN><SPAN style="color:#0078D4"> where </SPAN><SPAN style="color:black">TimeGenerated &gt; ago(</SPAN><SPAN style="color:#107C10">1</SPAN><SPAN style="color:black">d) </SPAN><SPAN style="color:#00A44A">// TimeGenerated
based filter comes first</SPAN></P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt"><SPAN style="color:black">| </SPAN><SPAN style="color:#0078D4">where </SPAN><SPAN style="color:black">Name </SPAN><SPAN style="color:#0078D4">has </SPAN><SPAN style="color:#C00000">&quot;foo&quot; </SPAN><SPAN style="color:#00A44A">//
Using &quot;has&quot; instead of less-efficient alternatives (See phase 2
below)</SPAN></P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt;color:black">| join kind=inner (</P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt;color:black">&nbsp;&nbsp;&nbsp; ContainerLog</P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt"><SPAN style="color:black"><SPAN>��� </SPAN>|</SPAN><SPAN style="color:#0078D4"> where </SPAN><SPAN style="color:black">TimeGenerated
&gt; ago(</SPAN><SPAN style="color:#107C10">1</SPAN><SPAN style="color:black">d)
</SPAN><SPAN style="color:#00A44A">// Sub-query runs on the same time range as
main query</SPAN></P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt"><SPAN style="color:black">&nbsp;&nbsp;&nbsp; | </SPAN><SPAN style="color:#0078D4">where</SPAN><SPAN style="color:black"> LogEntry </SPAN><SPAN style="color:#0078D4">has </SPAN><SPAN style="color:#C00000">&quot;ServerTimeOut&quot;</SPAN><SPAN style="color:#00A44A">//
Using &quot;has&quot; instead of less-efficient alternatives (See phase 2
below)</SPAN></P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt;color:black">) on ContainerID</P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt"><SPAN style="color:black">| </SPAN><SPAN style="color:#0078D4">summarize count</SPAN><SPAN style="color:black">() </SPAN><SPAN style="color:#0078D4">by</SPAN><SPAN style="color:black"> ClusterName </SPAN></P>

<P style="margin:0in;margin-left:.375in;font-family:Calibri;font-size:11.0pt;color:#833C0B">&nbsp;</P>

<P style="margin:0in;margin-left:.375in;font-family:Calibri;font-size:11.0pt;color:#C00000">&nbsp;<SPAN style="font-weight:bold">An example of DON'T:</SPAN></P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt;color:black">KubePodInventory</P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt"><SPAN style="color:black">| </SPAN><SPAN style="color:#0078D4">where </SPAN><SPAN style="color:black">Name </SPAN><SPAN style="color:#0078D4">contains </SPAN><SPAN style="color:#C00000">&quot;foo&quot; </SPAN><SPAN style="color:#00A44A">//
Using &quot;contains&quot; instead of &quot;has&quot; is inefficient (See phase
2 below)</SPAN></P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt"><SPAN style="color:black">|</SPAN><SPAN style="color:#0078D4"> where </SPAN><SPAN style="color:black">TimeGenerated &gt; ago(</SPAN><SPAN style="color:#107C10">1</SPAN><SPAN style="color:black">d) </SPAN><SPAN style="color:#00A44A">// TimeGenerated
based filter does not comes first which is inefficient</SPAN></P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt;color:black">| join kind=inner (</P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt"><SPAN style="color:black">&nbsp;&nbsp;&nbsp; ContainerLog </SPAN><SPAN style="color:#00A44A">// No TimeGenerated based filter, hence sub-query will
run over all ContainerLog table's data</SPAN></P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt"><SPAN style="color:black">&nbsp;&nbsp;&nbsp; | </SPAN><SPAN style="color:#0078D4">where</SPAN><SPAN style="color:black"> LogEntry </SPAN><SPAN style="color:#0078D4">contains </SPAN><SPAN style="color:#C00000">&quot;ServerTimeOut&quot; </SPAN><SPAN style="color:#00A44A">//
Using &quot;contains&quot; instead of &quot;has&quot; is inefficient (See phase
2 below)</SPAN></P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt;color:black">) on ContainerID</P>

<P style="margin:0in;margin-left:.75in;font-family:Consolas;font-size:10.0pt"><SPAN style="color:black">| </SPAN><SPAN style="color:#0078D4">summarize count</SPAN><SPAN style="color:black">() </SPAN><SPAN style="color:#0078D4">by</SPAN><SPAN style="color:black"> ClusterName</SPAN></P>

## 2. Rule of thumb: Always make sure you reduce the data volume to the smallest possible prior to writing any complex logic. 
This is a massive performance benefit by all means. Further explanation can be found in each of the guidelines below with the relevant context. For example,  using where clauses right after TimeGenerated filter (While it usually does not matter which where clause comes first, as long as they are all having efficient filters as described in phase 2 below).

## 3. Properly scanning raw data
- Prefer **has (Or !has)** over **contains (Or !contains) wherever possible** - <SPAN style="color:#C00000"> **SEE IMPORTANT NOTE BELOW** </SPAN>. 3. While there might be a tendency to use other options, using the `has` operator (and its variants such as `!has`, `has_any`) is significantly more efficient in terms of performance, especially on large datasets.
	Kusto builds a term index consisting of all terms that are four characters (Including) or more. This index is used by the has operator. If the query looks for a term that is smaller than four characters, or uses a contains operator, Kusto will revert to scanning the values in the column if it can't determine a match. This method is much slower than looking up the term in the term index.
**NOTE:** If the string we are looking for is 3 (Or less) characters long, there is no difference between has, contains and ==, as it is not indexed into terms and not utilizing the column indexing. <SPAN style="color:#C00000">**Update:**</SPAN> 2. As of November 2021, Log Analytics' underlying Kusto engine is being upgraded to Kusto Engine 3, and this is an ongoing process. This means that each workspace cluster upgraded to Kusto Engine V3 will index terms of 3 characters or more. For strings of 2 characters or fewer, there is no difference between `has`, `contains`, and `==`, as they are not indexed into terms and do not utilize column indexing.
<SPAN style="color:#C00000"> **IMPORTANT NOTE** </SPAN> - Using the "has" operator will **ONLY** work if what you are looking for has been indexed as a **term**, hence using the "has" operator should follow the "know your data convention" rule. Terms split, in most cases, is decided by which symbols\alphanumeric words are bound by non-alphanumeric characters.
For instance, in this example:
_Processor Time_
Using _has_ to look for "process" will not work because the term will be "Processor" (Terms are "Processor" and "Time" which are split by blankspace, a non-alphanumeric char), while using _contains_ will work since "process" is a substring of "Processor". 


-  **A very common query usage is filtering by IPv4 address.** As of today, since each octet of the IPv4 address has max 3 characters, it means de facto that IPv4 addresses are not indexed by default (While split to "Terms" is also done by alphanumerical delimiters only). Therefore, the matching is done based on raw data scan which is less efficient. 
	**NOTE:** There are a few well-known schemas which have IPv4 columns that have been pre-defined for indexing (For instance, the ComputerIP field of the Heartbeat table), however this does not cover all cases such as Custom Logs or columns that have the IPv4 addresses as part of a longer string (For example, a firewall log represented by a string that contains some IP addresses as well). While there is an ongoing effort to improve that, currently it is a given situation.
**If a certain field\column has been pre-defined for IPv4 indexing, the performance benefit will only apply on a whole match. This means that you can use the == operator to filter for a specific IPv4 address and it will be very efficient, however if you would filter by a prefix\subnet, it will scan raw data and not use the index regardless of the operator you choose (Agnostic to has and contains usage).**

-  When using **RegEx** and\or **Full field text processing** (For example, **split()** ), ensure it is applied on a smaller dataset. This is because such operators enforce Kusto to scan all raw data instead of utilizing its efficient column indexing, as previously described.
- **Avoid filtering based on columns\fields created by extend operator** on the fly.
-  If you customer is using mv-apply to sort elements, then you should consider using array_sort_asc() and array_sort_desc() functions instead, which are around 40% more efficient.

## 4. Heavy CPU processing
- When using heavy CPU processing functions, such as **parse_xml() and parse_json()**, it is important to apply these on a smaller dataset. By doing this early-filtering (See phases 1-3 above) , heavy calculations are done on less data, which is expected to result in better query performances overall.
- Prefer using _parse_ function when and where suitable rather then using the _extract()_ function, as described here: https://learn.microsoft.com/azure/data-explorer/kusto/query/best-practices

## 5. Join and Summarize best practices
- **Avoid High Cardinality**. Cardinality is relevant within the context of **join and summarize**. Cardinality is affected by the number of dimensions we have after the by per summarize or number of attributes per join, which comes at a price in terms of performances. **It is advised to have either less dimensions or to use advanced aggregation functions instead.** Example can be found here: https://learn.microsoft.com//azure/azure-monitor/log-query/query-optimization#use-effective-aggregation-commands-and-dimensions-in-summarize-and-join
**Specifically for joins**, you may consider an alternative for the non-efficient multi-attributes approach mentioned above, that is - filtering for the key POST join operation.
For example:
**Instead of:** _Table1 | join Table2 on $left.UserId == $right.UserId, $left.SearchKey == $right.Site_Url_
**Do**: _Table1 | join Table2 on $left.SearchKey == $right.Site_Url | where UserId==UserId1

- When using **Join**, if one table is smaller then the other, prefer to use the smaller one as the left side of the join.
For example:
_**SmallerTable** | join kind=inner BiggerTable on $left.UserId == $right.UserId_
Also, you may consider using one of 3\4 **Join hints** to improve the performances of the query without affecting its semantic and logic: https://learn.microsoft.com//azure/data-explorer/kusto/query/joinoperator?pivots=azuredataexplorer#join-hints

- Always prefer using **bin() operator to aggregate TimeGenerated** within the context of summarize and join. **Specifically, make sure that bin() is not too granular, as it affects performances and has no added value in most cases.** Aim to have granularity of 1 hour or higher where possible.

	**An example of DO:**
	Event
	|�where�TimeGenerated�>�ago(10d)
	|�where�EventLevelName�==�"Error"�
	|�summarize�count()�by�bin(TimeGenerated,�1d)�
	
	**An example of DON'T:**
	Event
	|�where�TimeGenerated�>�ago(10d)
	|�where�EventLevelName�==�"Error"�
	|�summarize�count()�by�bin(TimeGenerated,�30m)�
	

## 6. AzureDiagnostics table performances

---

- Please refer to this section: https://learn.microsoft.com//azure/azure-monitor/reference/tables/azurediagnostics#tips-on-using-additionalfields-column

## 7. Avoid or reduce the usage of externaldata operator

---

- The **externaldata** operator is used by some customers to fetch data from a storage artifact when running a query on Log Analytics (See: https://learn.microsoft.com//azure/data-explorer/kusto/query/externaldata-operator?pivots=azuremonitor)

1. The usage of this operator is discouraged as it could lead to performance issues. If you identify that it has been used in a query, suggest stopping its use and opting for a more efficient alternative (for example, ingesting this data as Custom Logs into a Log Analytics workspace). If a customer chooses to continue using it, explain its impact and recommend reducing its usage to the bare minimum, such as using it only once in the query and querying files of the smallest size possible.


## 8. Follow Kusto's Query best practices
- Since Log Analytics holds its ingested data in Kusto, Kusto's Query best practices would also apply here: See:
https://learn.microsoft.com/azure/data-explorer/kusto/query/best-practices

# Query performances analysis tools
---
1. The **Query performance pane** consists of 8 indicators that can help analyzing a given query overall performances. It will populate each indicator with values post query execution. This is available through the Logs Portal UI experience and can be accessed by expanding the doubled-upper-arrow on the right corner of the "Results" pane. In case you wish to examine a query executed through a different channel (API, PowerBI etc.), you can simply copy and run it in this user experience to get the same. A hint that a query is using excessive resources is when an orange-bar pops up in Logs Portal, which is also a good reason to inspect the values in the Query performance pane.
Each value has a different meaning in its context. A detailed explanation be found by clicking the info icon next to each indicator. More information can be found here:
https://learn.microsoft.com//azure/azure-monitor/log-query/query-optimization#query-performance-pane
![image.png](/.attachments/image-6dc515ba-81fc-489f-a2b5-3104abb5b5f7.png)

2. The **Optimize log queries in Azure Monitor article** is a highly detailed public documentation which elaborates on various performance related aspects. It includes a set of examples and further explanation on the Query performance pane mentioned above. This can be followed when analyzing a given query's performances and can be shared with customers:
https://learn.microsoft.com//azure/azure-monitor/log-query/query-optimization

3. **The Audit queries in Azure Monitor Logs** is an ability customer's can utilize to audit the queries performed on their environment. This also includes some performances aspects logging and auditing. **If a customer is already using it, it can be utilized for analysis of previous queries execution (Querying the LAQueryLogs table).** If a customer wishes to start auditing it's queries and their performance, this can be suggested so they would have this visibility. For information can be found here:
https://learn.microsoft.com//azure/azure-monitor/log-query/query-audit

4. **Use Azure Support Center (ASC) tools** to get a view on the performance of queries our customer runs on any of their workspace. By navigating on the Resource Explorer to a given workspace, You can find the Query Performance tab. This tab allows you to get a view of query performances for a 24-hours timeframe of your choice (From the available telemetry) per workspace. It also allows you to get the queries which had the longest duration following the same available timeframes.
   - **A video tutorial for Query Performance ASC usage can be found here:**
 https://aka.ms/QueryPerfASC


    In addition, **if you wish to examine the performances of a specific query by its requestId**, you can use the **Query Draft Telemetry tab in ASC**, and use the following base-query:


  ```
let requestId = '00000000-0000-0000-0000-000000000000'; //requestId might be in a non-dashed delimiter convention
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

5. The following **public documentation** lists the **Query Limits of the Log Analytics service.** This can help when analyzing the cause of queries running throttling or timing out, whether it is through the Logs Portal UI or Search API:
https://learn.microsoft.com//azure/azure-monitor/service-limits#log-queries-and-language
https://learn.microsoft.com//azure/azure-monitor/service-limits#log-analytics-workspaces

# What if all actions above did not yield the desired outcome?
---
In case our customers still face performance issues with their queries while implementing all practices mentioned above or if they also have a dedicated cluster in place, **reach out to any of your Log Analytics SME\STA for assistance.**
