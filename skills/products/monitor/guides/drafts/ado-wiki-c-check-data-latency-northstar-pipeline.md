---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Ingestion/HT: Check for Data Latency in Northstar Pipeline"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FIngestion%2FHT%3A%20Check%20for%20Data%20Latency%20in%20Northstar%20Pipeline"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Scenario
---
Follow the below steps to investigate Log Analytics Ingestion Delays, as encountered in ICM Incident 248202575, where logs took up to 50 minutes to show up in the Log Analytics workspace after they were generated.

To determine which pipeline is processing a given data type, use the following [TSG](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750222/HT-Determine-which-pipeline-is-processing-a-given-data-type)
![NS.png](/.attachments/NS-177bbba7-b67b-4bd8-8d5e-0031df7bb3e5.png)

# Northstar Pipeline Diagram
---
![NS.png](/.attachments/NS-c97b4da2-33f5-4060-877f-b25d44163c43.png)

Delivery (**GDS**)- The Geneva Delivery Service (GDS) enables delivery of event data to one or more data stores. It delivers data to storage (MDS), event hubs, Log Analytics, and other monitoring data stores. 

# Pre-requisites
---
To be able to run the Kusto queries mentioned bellow, you'll need access to the relevant Kusto database/cluster, so please follow the procedure described in [How-To: Connect to Log Analytics Kusto clusters](/Log-Analytics/How%2DTo-Guides/Kusto-Data/How%2DTo:-Connect-to-Log-Analytics-Kusto-clusters).

You will need the following information:
1. GDS region identifier (GDS_Tenant), it can be obtained by running this query:

**Kusto cluster and database:** https://omsgenevatlm.kusto.windows.net/GenevaNSProd

`LogTrace
| where TIMESTAMP > ago(1h)
| distinct Tenant
| order by Tenant asc`

- For big regions like East US, West Europe there may be multiple tenants. Please make sure to try use of them when you use the query below

2. Log Analytics workspace id (LAWorkspaceId).

# Check for Latency in the GenevaNSProd pipeline
---
You can use the following query to check for latency:

**Kusto cluster and database:** https://omsgenevatlm.kusto.windows.net/GenevaNSProd

**Query used:** <table style="border:0px;" width="100%">
  <tr> 
<table style="border:0px;" width="100%">
  <tr>
    <td style="border=0px;background-color:lightgrey">
let startTime = datetime(yyyy-mm-dd hh:mm); <br>
let endTime = datetime(2021-08-23 18:30); <br>
let environment = "<GDS_Tenant>"; <br>
let workspaceId = "<LAWorkspaceId>"; <br>
LogTrace <br>
| where TIMESTAMP between (startTime .. endTime)<br>
| where Tenant =~ environment <br>
| where Message startswith "lbl=[ProcessBlobChunk]"<br>
| where Message has workspaceId <br>
| parse Message with * "ProcessedDataTimeInfo:[(Min=" processedDataMinTime:datetime ",Max=" processedDataMaxTime:datetime ")]" * 
| parse Message with * "CorrelationId:" CorrelationId "," * <br>
| parse Message with * "DataType:" dataTypeId "," * <br>
| parse Message with * "WorkspaceId:" laWorkspaceId "," * <br>
| parse Message with * "MaxNorthStarE2ELatencyMs=[" MaxNorthStarE2ELatencyMs:int "]" *  <br>
| parse Message with * "GDSE2ELatencyMs=[" GDSE2ELatencyMs:int "]" *  <br>
| extend delayInSeconds = datetime_diff('second', TIMESTAMP, processedDataMinTime) <br>
| extend NSLatencySeconds = MaxNorthStarE2ELatencyMs / 1000 <br>
| extend GDSLatencySeconds = GDSE2ELatencyMs / 1000 <br>
| project dataTypeId, delayInSeconds, NSLatencySeconds, GDSLatencySeconds, CorrelationId <br>
| summarize  <br>
 NumberOfEvents=count(),  <br>
 P99_DelayInSeconds=percentile(delayInSeconds, 99),  <br>
 P99_NSLatencyInSeconds=percentile(NSLatencySeconds, 99),  <br>
 P99_GDSLatencyInSeconds=percentile(GDSLatencySeconds, 99), <br>
 arg_max(NSLatencySeconds, CorrelationId) by dataTypeId <br>
| sort by P99_DelayInSeconds + P99_NSLatencyInSeconds desc <br>
    </td>
  </tr>
</table>

Query Example: [[Web](https://dataexplorer.azure.com/clusters/omsgenevatlm/databases/GenevaNSProd?query=H4sIAAAAAAAAA4VTTW+bQBC9+1eMuARSiAmRqtoRhzS2KkvBtYSrHqzIWmCwaWCxdtexXfXHd8BO+LITTsvMezPvzeymqEAqJtQ8yRBciJhCRUfdsR3Hsh3LuYPbb0PbNu57KWGRRx8j7yrkayJyniFXhNbGTCrrl2852j30+/Bj5C/nyBlXJXiXixe5YSFOogKMAwvqnxV/jYMj8enhd4XtPeWruaBj7x/s1igQ5hNv7M8fvBkEqHaIHPTK3s3Nm36jIpQiwHXrgt+zHkrJVngckdwlag1aGqTuYibykHLf0zx4XG/5y7PW4ayZrPui/IYJWeXLategnUphNGKKFeImPM6HC91LuKvBpp6lUAEYvs0eNNNj+w6K7Vso41mD64sCHnMhMGUqyfkkGmrQ+KcWH3FLzYcNEi06HT/l1BZItJTV/j9hkrNpLtTap3WMnfETGeThwZPuQoNLuWFC69WKAcDFunQb2+VaoWYV3FM4goimdJhwH8OcR7L2JpZREsf6lSwTV2Z1K82z+zSqklP/1LIqeskY9OHWtu2KS5I75JaNikM6/mCoalszW37Mjhiz28Js3hYqLLdZxkTyF6FXPN3pNgtQ/IzHr/SupBvmW650wzwmZ4PBctRo6m5QhIRMUtTbcgaDOu9d3FluV3qTXRk5Sz/js+CXdCZWy4ztz7RojMKA4FCbbjEZ2mIR7LqGLxcs0Upk+B/ngxUnpAUAAA==)] 

![NS.png](/.attachments/NS-c3ecd28d-96a9-46c0-bd55-457196f550bf.png)

You can also use Jarvis https://portal.microsoftgeneva.com/s/78B3FAEA 

# Query output:
---
Once you successfully ran the query, you will see an output as the sample below, displaying the latency for each Data Type.

****
|![LatencySS.jpg](/.attachments/LatencySS-48967dfd-466a-4928-8c5a-790d9fd69772.jpg)|
|--|
|![queryoutput.jpg](/.attachments/queryoutput-35ef72db-7043-4aa7-9236-138e513bf4af.jpg)

## Interpreting the results
---
*Possible combinations* 

1. If both P99_DelayInSeconds + P99_NSLatencyInSeconds are smaller than 300 (5mins), then the latency was introduced downstream, move the investigation to **Application Insights/Log Analytics Backend** 
1. If P99_DelayInSeconds is high but P99_NSLatencyInSeconds is small, latency was introduced upstream. Check ODS logs for this correlationId, look for User-Agent or OboLocation header in properties. If the header exists, then agent or OBO sent the request, currently only traffic from Agents and OBO flows through the NorthStar pipeline. 

Query Link https://portal.microsoftgeneva.com/s/4E0212F4.  

- [ ] User-Agent true: Transfer to the **Azure Log Analytics / OMSWindowsAgent** or **OMSLinuxAgent Agent team** based on the value in properties  IsLinuxDirectAgent, IsWindowsDirectAgent. 

- [ ] Obo true: Transfer to **Azure Monitor Essentials / Sev3 and 4 CRI - Diagnostic Logs** 

*Sample* 
|![blur.jpg](/.attachments/blur-09acc72b-144a-4993-8a4a-64b215560dbd.jpg)| 
|--|
|![blur1.jpg](/.attachments/blur1-e9c377dd-e3cf-439d-9251-98ce6e88aa7c.jpg)


3. If P99_NSLatencyInSeconds is high: 

- [ ] P99_GDSLatencyInSeconds is high, GDS introduced the latency. 
- [ ] P99_GDSLatencyInSeconds is small, GIG or GT introduced latency: 

Use the CorrelationId to query GT logs to identify if latency was introduced there. 

**Direct links**: [Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2fomsgenevatlm.kusto.windows.net/databases/GenevaNSProd?query=H4sIAAAAAAAEAHWR0WqDMBSG7wXf4ZCrtswuWtvaDi8GK6NQYUxfII2nrUNjlxxxgz38YunmNtlNCDnfl%2fOfpEQCQ0JTVlQIMeSCkOx2FPDA93jkBTPwozXn4zvXKS2MKv8XDTt09o3KWmssBRW12uZWYBxlhGIeeeFc2iU8LLz9crH3ZCDCCIPDarkKmZV39THTQqLrfEB7Qo2QbZNNmt0nT7BHahEVjPrU0%2blXqnFvJGiMOKINoUgUyvxOM%2bQu15m2oBOw3q3OdhCcwjOapqQ4baS0NdbpZ6FNr1%2fECbAuRVooiRv12mCDMYO%2fR4lZF4qAVeamrz3gAL8e%2fcAZTLrO%2bEZ2XnjMdvYHlHxP0Q6ZG%2fvCw1a3Puf8ElfXLyhpYLmO63wCY1mSuQUCAAA%3d) [Desktop](https://omsgenevatlm.kusto.windows.net/GenevaNSProd?query=H4sIAAAAAAAEAHWR0WqDMBSG7wXf4ZCrtswuWtvaDi8GK6NQYUxfII2nrUNjlxxxgz38YunmNtlNCDnfl%2fOfpEQCQ0JTVlQIMeSCkOx2FPDA93jkBTPwozXn4zvXKS2MKv8XDTt09o3KWmssBRW12uZWYBxlhGIeeeFc2iU8LLz9crH3ZCDCCIPDarkKmZV39THTQqLrfEB7Qo2QbZNNmt0nT7BHahEVjPrU0%2blXqnFvJGiMOKINoUgUyvxOM%2bQu15m2oBOw3q3OdhCcwjOapqQ4baS0NdbpZ6FNr1%2fECbAuRVooiRv12mCDMYO%2fR4lZF4qAVeamrz3gAL8e%2fcAZTLrO%2bEZ2XnjMdvYHlHxP0Q6ZG%2fvCw1a3Puf8ElfXLyhpYLmO63wCY1mSuQUCAAA%3d&web=0)
 **Kusto cluster and database:** https://omsgenevatlm.kusto.windows.net/GenevaNSProd
**Query used:** 
<table style="border:0px;" width="100%">
  <tr>
    <td style="border=0px;background-color:lightgrey">
let startTime = datetime(2021-08-23 18:00); <br>
let endTime = datetime(2021-08-24 18:30); <br>
let correlationId = "0ec8ea58-45c8-44f6-b76b-c2a48e2f9794"; <br>
LogTrace <br>
| where TIMESTAMP between (startTime .. endTime) <br>
| where Message has correlationId <br>
| where Message startswith "Message complete. Result=Success" <br>
| parse Message with * "TimeSinceEnqueue=" TimeSinceEnqueueMs:int "ms, TimeSinceDequeue=" TimeSinceDequeueMs:int "ms," * <br>
| extend GTLatencySeconds = TimeSinceEnqueueMs/1000 <br>
| project GTLatencySeconds <br>
    </td>
  </tr>
</table>

**Note**: If Latency wasn't introduced by GDS or GT, then it was introduced by GIG. 

<!--- Reference (DO NOT DELETE -->
<!--- https://portal.microsofticm.com/imp/v3/incidents/details/248202575/home -->
# IcM
---
https://portal.microsofticm.com/imp/v3/incidents/details/248202575/home
