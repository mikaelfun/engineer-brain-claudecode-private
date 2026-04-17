---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/Troubleshooting Guides/TSG : Delays in exporting Metrics via diagnostic settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/Troubleshooting%20Guides/TSG%20%3A%20Delays%20in%20exporting%20Metrics%20via%20diagnostic%20settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:yellow">

**Important**

You are required seek help via Azure monitor swarming channel to validate your findings after executing this TSG.
[Autoscale, Activity Logs and Resource Logs | AzMon POD Swarming | Microsoft Teams](https://teams.microsoft.com/l/channel/19%3Ae8340fd5f1784ae186e8873be02b9053%40thread.tacv2/Autoscale%2C%20Activity%20Logs%20and%20Resource%20Logs?groupId=2fb9049b-bc9c-4cca-a900-84f22c86116c&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)
Any escalation via ICM to PG without concrete investigation will be mitigated without further investigation. 
Please use both the mitigations given below
</div>


Scenario
---
Customers might reach out indicating that - they are experiencing latency in exporting metrics via diagnostic setting.

Information Needed
---

1. Resource Id on which diagnostic setting is created.
2. To which destination, it is configured to export the metrics.(Log analytics/Storage account /Event hub)

Note: Customer might indicate they are seeing latency for many resources. However, we should ask to provide some sample resources.


Goals of investigation
---

1. Validate If the customer is really seeing delays , if the metrics are being exported to log analytics

For Log analytics
Use the query shown in the screenshot below and run it customer workspace and validate if the customer really seeing latency

```
AzureMetrics
| extend ingestionTime= ingestion_time()
| extend overalllatency= ingestionTime - TimeGenerated
| extend loganalyticServiceLatency = ingestionTime - _TimeReceived
| extend sourceLatency= _TimeReceived - TimeGenerated
| where sourceLatency > 1h
| project-reorder _ResourceId, overalllatency, sourceLatency, loganalyticServiceLatency, TimeGenerated, _TimeReceived, ingestionTime
| sort by overalllatency desc
| distinct ResourceProvider
```


![image.png](/.attachments/image-2f039dda-dbc7-4cb7-9851-125a83f66308.png)

For Storage Account

From CSS side, we cannot validate this. You are supposed to ask proof or the blob containing the metric which is delayed and take few samples

For Event hub

From CSS side, we cannot validate this. You are supposed to ask proof from the customer 

Next steps
---

1. Once you have narrowed down the resource id. We need to check our internal telemetry to see what is causing these delays

```
1. Delays are majorly caused due to non-availability of the metric in a given query window. Metric export job is delayed. if metric is not found.
2. Issues writing to destinations. lets say, if the customer EH is throttled then, writing to EH will be delayed. 
3. There can other issues with log analytics or Storage accounts.
```

Known issues : https://supportability.visualstudio.com/AzureMonitor/_workitems/edit/89411


2. Query the "Registration Telemetry" table to gather some information.
Substitute the  resource id field in the below query and run it 


From Clipboard 
Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2fazureinsights.kusto.windows.net/databases/Insights?query=RegistrationTelemetry%0d%0a%7c+where+PreciseTimeStamp+%3e+ago(2d)%0d%0a%7c+where+resourceId+%3d%7e%22%2fsubscriptions%2f76faaa9e-a008-4fde-b1da-e09193b405eb%2fresourceGroups%2faf07c9ea-2044-49ef-8ed1-4c152fd58c01%2fproviders%2fMicrosoft.Compute%2fvirtualMachines%2fA0002WJ7000%22%0d%0a%7c+summarize+max(PreciseTimeStamp)+by+name%2c+categories%2c+usingOms%2c+usingServiceBus%2c+usingStorage%2c+metricExtractionJobInfo%0a%0a)] [[Desktop](https://azureinsights.kusto.windows.net//Insights?query=H4sIAAAAAAAEAF2QQUsDMRCF7wX%2fQ%2biphcZk163tHhRURFooFlvwPJudbAeazTJJaivib7d7qIKneQzvPWa%2bN2woRIZIvt3iHh1GPl0NvsTHDhnFmtFQwC053ERwnbgX0PhRXo%2f%2fPIzBJza4qMXd91CFVAXD1PWNQc1uLQCUKEHruSxsjbLKapCoy6y8qQo9xUpdGl7Ypy4osHpmSgSZ66KQRYlWzrHOZGGyaW7r6dzoTHXsD1QjB7Uiwz54G6%2bfvOtSRHUgjgn2KzA7ajGoB611%2fr6cncewvzsk54DpE4WD4%2bj%2fj2NRnUQLDifCQMTGM2GYiBSobV7dRW2QD2TwMf0uomdozqEeIZnn45mq6SEsfbVorR8MfgAqj56rbAEAAA%3d%3d&web=0)] [[Desktop (SAW)](https://azureinsights.kusto.windows.net//Insights?query=H4sIAAAAAAAEAF2QQUsDMRCF7wX%2fQ%2biphcZk163tHhRURFooFlvwPJudbAeazTJJaivib7d7qIKneQzvPWa%2bN2woRIZIvt3iHh1GPl0NvsTHDhnFmtFQwC053ERwnbgX0PhRXo%2f%2fPIzBJza4qMXd91CFVAXD1PWNQc1uLQCUKEHruSxsjbLKapCoy6y8qQo9xUpdGl7Ypy4osHpmSgSZ66KQRYlWzrHOZGGyaW7r6dzoTHXsD1QjB7Uiwz54G6%2bfvOtSRHUgjgn2KzA7ajGoB611%2fr6cncewvzsk54DpE4WD4%2bj%2fj2NRnUQLDifCQMTGM2GYiBSobV7dRW2QD2TwMf0uomdozqEeIZnn45mq6SEsfbVorR8MfgAqj56rbAEAAA%3d%3d&saw=1)] [https://azureinsights.kusto.windows.net//Insights](https://azureinsights.kusto.windows.net//Insights)  
RegistrationTelemetry
| where PreciseTimeStamp > ago(2d)
| where dataType contains "Metrics"
| where resourceId =~"/subscriptions/removed/resourceGroups/removed/providers/Microsoft.Compute/virtualMachines/removed"
| summarize max(PreciseTimeStamp) by name, categories, usingOms, usingServiceBus, usingStorage, metricExtractionJobInfo

| name<br> | categories<br> | usingOms<br> | usingServiceBus<br> | usingStorage<br> | metricExtractionJobInfo<br> | max_PreciseTimeStamp<br> |
| --- | --- | --- | --- | --- | --- | --- |
| DIAGNOSTICSETTING<br> | AllMetrics<br> | False<br> | True<br> | False<br> | {"jobPartition":"76FAAA9E:2DA008:2D4FDE:2DB1DA:2DE09193B405EB:3AAF07C9EA:2D2044:2D49EF:2D8ED1:2D4C152FD58C01:3AMICROSOFT:2ECOMPUTE:3AA0002WJ7000","jobId":"2DA7B8121FA6881D30610DA19E110B19:3AA0002WJ7000","storageAccountResourceId":"/subscriptions/d3a28c09-ddef-4cf5-acfe-d3e69c62bf0c/resourceGroups/OboBjsStorageEastUS/providers/Microsoft.Storage/storageAccounts/obobjsmetricprodeus11"}<br> | 2025-05-16 18:49:16.9741204<br> |


3. In the resultant data, please take note of value in the column "metricExtractionJobInfo" and use the "jobPartition" and "jobId" values in the below query


From Clipboard 
Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2fazureinsights.kusto.windows.net/databases/Insights?query=let+resourceid%3d%22%2fsubscriptions%2f76faaa9e-a008-4fde-b1da-e09193b405eb%2fresourceGroups%2faf07c9ea-2044-49ef-8ed1-4c152fd58c01%2fproviders%2fMicrosoft.Compute%2fvirtualMachines%2fA0002WJ7000%22%3b%0d%0aJobHistory%0d%0a%7c+where+PreciseTimeStamp+%3e+ago(2d)%0d%0a%7c+where+jobPartition+%3d%7e%2276FAAA9E%3a2DA008%3a2D4FDE%3a2DB1DA%3a2DE09193B405EB%3a3AAF07C9EA%3a2D2044%3a2D49EF%3a2D8ED1%3a2D4C152FD58C01%3a3AMICROSOFT%3a2ECOMPUTE%3a3AA0002WJ7000%22%0d%0a%7c+where+jobId+%3d%7e%222DA7B8121FA6881D30610DA19E110B19%3a3AA0002WJ7000%22%0d%0a%7c+join+kind+%3d+inner+SvcOutgoingRequests+on+ActivityId%0d%0a%7c+where+PreciseTimeStamp1+%3e+ago(2d)%0d%0a%7c+where+operationName+%3d%7e%22GetMDMDataForResource%22%0d%0a%7c+where+message+contains+resourceid+%2f%2finclude+this+for+non-sql%0d%0a%7c+extend+metrisQuerystartTime+%3d+substring(message%2c+indexof(message%2c+%22start+time%22)+%2b+10%2c+(indexof(message%2c+%22number+of+minutes%22)+-+indexof(message%2c+%22start+time%22)+-+11))%0d%0a%7c+extend+metrisQueryendTime+%3d+substring(message%2c+indexof(message%2c+%22number+of+minutes%22)+%2b+18%2c+(strlen(message)+-+(indexof(message%2c+%22number+of+minutes%22)%2b18)))%0d%0a%7c+extend+executionDetailsToValidJson1+%3d+substring(executionDetails%2cindexof(executionDetails%2c%22Result%22))%0d%0a%7c+extend+executionDetailsToValidJson2+%3d+substring(executionDetailsToValidJson1%2cindexof(executionDetailsToValidJson1%2c%22Result%22)%2cindexof(executionDetailsToValidJson1%2c%22%7d%7d%22)%2b2)%0d%0a%7c+extend+executionDetailsobj+%3d+parse_json(tostring(replace_string(executionDetailsToValidJson2%2c%22Result%3a%22%2c%22%22)))%0d%0a%7c+extend+metricsInterval+%3d+datetime_diff(%27minute%27%2c+todatetime(metrisQueryendTime)+%2c+todatetime(metrisQuerystartTime))%0d%0a%7c+extend+metricsFound+%3d+executionDetailsobj.allMetrics.nonZeroMetricsFound%0d%0a%7c+extend+result+%3d+executionDetailsobj.allMetrics.resultType%0d%0a%7c+extend+delay+%3d+datetime_diff(%27minute%27%2c+PreciseTimeStamp%2ctodatetime(metrisQuerystartTime))%0d%0a%2f%2f%7c+project+PreciseTimeStamp%2ctodatetime(metrisQuerystartTime)%2c++todatetime(metrisQueryendTime)%2ctodatetime(nextExecutionTime)%2cmetricsInterval%2cresult%0d%0a+%2f%2f%7c+render+timechart%0d%0a%2f%2f%7c+order+by+PreciseTimeStamp%2c+metrisQueryendTime+desc%0d%0a+++%7c+summarize+avg(delay)+by+tostring(result)%2c+bin(PreciseTimeStamp%2c5min)%0d%0a++%7c+render+timechart+%0d%0a%2f%2f+)] [[Desktop](https://azureinsights.kusto.windows.net//Insights?query=H4sIAAAAAAAEAJVVTW%2fbOBC9B8h%2fIHSpjVqRqNixlKILyJbcTQA32cS7C%2fQSUNLIoVciXZLyxkW6v32Hdtw6sfPRE0Hxzbz3ZoZUBYYo0LJROfDio%2bPpJtO54nPDpdBe%2f6RkjEXgMt8P3W5ZgJvRgrngRzQ6zrp%2bDzJvE%2f9JyWauPVb6%2fTwC5gZ%2bt%2bt2IyjdEArqdnPaC8qiF%2bY%2b9eZKLngBSntjniupZWmOhrKeNwa8BVemYdWY5bdcgPZi3%2feDv8%2f7uDgfDg%2fOZfY710aq5eHBPfn3FhSQSwU51zDhNVwbVs%2fJb4RNZSso2j8xM5ldMmW4dUY%2b%2fuf0T0ZxHEfpaZAgQ4hLd5TY3YAmMS7pyuMAPaaD0%2bM4Hvn9YZTaE2vMwqN0hEuYJtTuhmhvlPTCoU8RPj4bXl1cX4wmp0E6vBhf%2fjlJbZItK4%2bUnRVWEirpD0Ia0FF8EoY0OfZPqJ%2fENEop9Qc02pNhJrkg%2f3CB8YQLAYpcL%2fKLxkzx%2b%2fQKvjagjSboOM4NX3CzPCueLxvdVzc5B8Vs0T6zGqzKT2DGyThhho2kunpo%2fpadGrRmUyC5FIZxobcGjHgeF3nVFEDMLdeklIoIKVz9tbLxcGcAndRgFNd%2fNKCW2mDLrD60Z0cTD8S09cDQQccF3Mny5wdnFUAMRjht8p5Qv0NauyjR1BmWSpak5gJnTiPYfS2bSyhtt%2ffrxO2vqNzHj2JDFIvBFYgN1rK%2bTf97GrYfqYM7yBvbtwSwDZWeyL9YxYtzLQV9pPMpsLPh2zlwsNtNZZy38gQv8mwLepbzEegH%2fxvh379jXYKXxMpshhrnTGm4mWFQy8gHtQrmFcvh5nXxwUbXqdNxnPbuiOT6TBhQC1YhV8EM2IG6KXhZtt6t%2b%2feuQ4zcnLR256pNngP8uCD7aEeyWT0Me1wfsaoar1FHeAO%2fgJLjraCtXGrl7fUsa9xkOYet4AIqtnzB9dMXqPMGl553T%2fD%2fMYPc%2fHp8h7xS6e0MAl2kG9fr0ycN7axdHx4Qq0phEryWNja%2fRca1Vqnsx2y5K3bfC1KAzjEdIfd4deqaKf4NCFtMW6tStm2erRm15Ogp46K1k72HVW7bVLvCiFVG%2fge0DAZ%2b%2fQcAAA%3d%3d&web=0)] [[Desktop (SAW)](https://azureinsights.kusto.windows.net//Insights?query=H4sIAAAAAAAEAJVVTW%2fbOBC9B8h%2fIHSpjVqRqNixlKILyJbcTQA32cS7C%2fQSUNLIoVciXZLyxkW6v32Hdtw6sfPRE0Hxzbz3ZoZUBYYo0LJROfDio%2bPpJtO54nPDpdBe%2f6RkjEXgMt8P3W5ZgJvRgrngRzQ6zrp%2bDzJvE%2f9JyWauPVb6%2fTwC5gZ%2bt%2bt2IyjdEArqdnPaC8qiF%2bY%2b9eZKLngBSntjniupZWmOhrKeNwa8BVemYdWY5bdcgPZi3%2feDv8%2f7uDgfDg%2fOZfY710aq5eHBPfn3FhSQSwU51zDhNVwbVs%2fJb4RNZSso2j8xM5ldMmW4dUY%2b%2fuf0T0ZxHEfpaZAgQ4hLd5TY3YAmMS7pyuMAPaaD0%2bM4Hvn9YZTaE2vMwqN0hEuYJtTuhmhvlPTCoU8RPj4bXl1cX4wmp0E6vBhf%2fjlJbZItK4%2bUnRVWEirpD0Ia0FF8EoY0OfZPqJ%2fENEop9Qc02pNhJrkg%2f3CB8YQLAYpcL%2fKLxkzx%2b%2fQKvjagjSboOM4NX3CzPCueLxvdVzc5B8Vs0T6zGqzKT2DGyThhho2kunpo%2fpadGrRmUyC5FIZxobcGjHgeF3nVFEDMLdeklIoIKVz9tbLxcGcAndRgFNd%2fNKCW2mDLrD60Z0cTD8S09cDQQccF3Mny5wdnFUAMRjht8p5Qv0NauyjR1BmWSpak5gJnTiPYfS2bSyhtt%2ffrxO2vqNzHj2JDFIvBFYgN1rK%2bTf97GrYfqYM7yBvbtwSwDZWeyL9YxYtzLQV9pPMpsLPh2zlwsNtNZZy38gQv8mwLepbzEegH%2fxvh379jXYKXxMpshhrnTGm4mWFQy8gHtQrmFcvh5nXxwUbXqdNxnPbuiOT6TBhQC1YhV8EM2IG6KXhZtt6t%2b%2feuQ4zcnLR256pNngP8uCD7aEeyWT0Me1wfsaoar1FHeAO%2fgJLjraCtXGrl7fUsa9xkOYet4AIqtnzB9dMXqPMGl553T%2fD%2fMYPc%2fHp8h7xS6e0MAl2kG9fr0ycN7axdHx4Qq0phEryWNja%2fRca1Vqnsx2y5K3bfC1KAzjEdIfd4deqaKf4NCFtMW6tStm2erRm15Ogp46K1k72HVW7bVLvCiFVG%2fge0DAZ%2b%2fQcAAA%3d%3d&saw=1)] [https://azureinsights.kusto.windows.net//Insights](https://azureinsights.kusto.windows.net//Insights)  
let resourceid="add from above query;
JobHistory
| where PreciseTimeStamp > ago(2d)
| where jobPartition =~"add from above query"
| where jobId =~"add from above query"
| join kind = inner SvcOutgoingRequests on ActivityId
| where PreciseTimeStamp1 > ago(2d)
| where operationName =~"GetMDMDataForResource"
| where message contains resourceid //include this for non-sql
| extend metrisQuerystartTime = substring(message, indexof(message, "start time") + 10, (indexof(message, "number of minutes") - indexof(message, "start time") - 11))
| extend metrisQueryendTime = substring(message, indexof(message, "number of minutes") + 18, (strlen(message) - (indexof(message, "number of minutes")+18)))
| extend executionDetailsToValidJson1 = substring(executionDetails,indexof(executionDetails,"Result"))
| extend executionDetailsToValidJson2 = substring(executionDetailsToValidJson1,indexof(executionDetailsToValidJson1,"Result"),indexof(executionDetailsToValidJson1,"}}")+2)
| extend executionDetailsobj = parse_json(tostring(replace_string(executionDetailsToValidJson2,"Result:","")))
| extend metricsInterval = datetime_diff('minute', todatetime(metrisQueryendTime) , todatetime(metrisQuerystartTime))
| extend metricsFound = executionDetailsobj.allMetrics.nonZeroMetricsFound
| extend result = executionDetailsobj.allMetrics.resultType
| extend delay = datetime_diff('minute', PreciseTimeStamp,todatetime(metrisQuerystartTime))
//| project PreciseTimeStamp,todatetime(metrisQuerystartTime), �todatetime(metrisQueryendTime),todatetime(nextExecutionTime),metricsInterval,result
�//| render timechart
//| order by PreciseTimeStamp, metrisQueryendTime desc
� �| summarize avg(delay) by tostring(result), bin(PreciseTimeStamp,5min)
� | render timechart
//


![image.png](/.attachments/image-78821c55-73ce-4c94-a634-06dd1a63c4c3.png)

In the above screenshot, we can see amount of latency in "RED" and after some time latency drops indicated in "Blue".
This screenshot was taken from a ICM case, were customer event hub was throttled due to which  they experienced a lot latency and after they re-sized their EH, latency came back down.

This may happen or may not happen. You might all the job runs in "Succeeded" and still latency can be high.

In any case, next step of validation is using ASC.

Use the ASC and query for metric using the same resource id used above and for a any time frame 

![image.png](/.attachments/image-5f2856aa-520d-436c-9252-8fb0c8a782d6.png)

In the resultant metric chart, if you see partial data received or metric is not available for times. 
Validate the same with MDM, link will be provided automatically in the page. See if these two match. 

If it matches , then we can atleast understand metric is not being emitted all the time and it may be that - resource is not being that much due to which metric is not emitted.

In such cases, the metrics extraction which polls these metrics gets delayed. if the job doesn't find any metrics. Hence , customer might see delays.
This is expected.

