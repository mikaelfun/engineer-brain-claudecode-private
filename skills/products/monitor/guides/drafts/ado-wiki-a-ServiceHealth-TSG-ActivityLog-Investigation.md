---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Service Health/Investigating Service Or Resource Health Issues with Activity logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FService%20Health%2FInvestigating%20Service%20Or%20Resource%20Health%20Issues%20with%20Activity%20logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---


:::template /.templates/Common-Header.md
:::


# Symptoms:
---
This TSG can be used to investigate when the customer states the following.
- Service or Resource health not seen in Activity logs.
- Service or Resource health are delayed.

# Product Group TSG :
---
[https://eng.ms/docs/cloud-ai-platform/azure-cxp/cxp-product-and-platform/trusted-cloud-engineering-tce/azure-service-health/azure-service-health/troubleshooting/cris/servicehealthalerting]()

# Latency Expectation from OBO/ Diagnostic settings pipeline
---
- Service or Resource health are expected to be delayed up to ~15mins. 
- If a number of the unique first tag is greater than > 4k in a given blob path, then latency is expected.
please use the below query to determine.

https://azureinsights.kusto.windows.net/Insights?query=H4sIAAAAAAAEAI2PsQrCQBBEe8F%2fWK7S0g%2fQIoJgIQYNWq%2bXNXd4uQ17e4ogfrsGxFhavzczzDp2WYvAp5WXpBU2G1KsUXH0gJsjISiFrE9U%2bZb2im0HC8CGJ7N6Ov46Ow4E86fZxoIchvOR5UJiYDDeJSz1knPU4r5EpYbFUwLLUdHHBEYocRZLjjCoM8DyRyiRXP2QGfZO70slqvtxTU9rn9RHq3D%2b%2fD1gyNQT28%2b8ADhrwnoPAQAA&web=0

InputBlobFirstTagMetadata
| where PreciseTimeStamp > ago(1d) //change accordingly
| where Role =~"OnBehalfWorker" 
| where recordCountByCategories contains "resourcehealth" or recordCountByCategories contains "servicehealth" 
| where blobPath contains "" //you will follow the steps below to get the blob path
| distinct firstTagValue
| count

# Prerequisites:
---

1. Co-relation id of the Service or Resource Health event. **Note** : PLEASE MAKE SURE YOU HAVE INFORMATION BEFORE YOU BEGIN INVESTIGATION OR ESCALATING TO PG.
2. Subscription Id
3. Date and time stamp.
4. All the above information should be in the range of last 30 days.

# Investigation Steps:
---

1.  Check if the activity log API returns the given service or resource health event.
Use Azure Support center to see, if the resource /service health is available for the customer to see in the portal
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480451/How-to-get-Activity-Log-events-from-Azure-Support-Center

If any records are returned and if you are able to determine , the record was late and its under 15mins, then this latency is expected. If its more, then more investigation is required.

# Section : If Service or Resource health event is not seen in activity logs.
---

1. Check if this health event was emitted by the service team.
2. For service health use this DGREP: https://portal.microsoftgeneva.com/s/DD3701EE
- Fairfax DGREP: https://portal.microsoftgeneva.com/s/89018432
3. For resource health use this DGREP : https://portal.microsoftgeneva.com/s/58A214C2
![image.png](/.attachments/image-4e03f5a1-9e61-4c86-888b-241f405572e0.png)

4. Change/update the highlighted regions in the DGREP and click on the search.
5. Time Column : This indicates When the service/resource health was created by team.
6. Precise Timestamp : This indicate when it was made available for OBO to read it.  
7. blob : This is very useful, we will use in next steps.
8. Other columns : Will be useful to verification, if you and customer are talking about same event. 
9. If the query doesn't yield any results. ( at least in the case of service health event - we have seen some cases where some events were not generated due to monitoring agent issue). 
lets engage the "Azure CXP Engineering Platform/ACM"

Please work with below ICM queue
**Resource health**
![image.png](/.attachments/image-91186d0a-dda2-4627-bd51-7bc8feea8723.png)
**Service health**
![image.png](/.attachments/image-46c5a9f0-037b-4169-bd39-38045946b0ea.png)
10. If you are seeing results, please extract the blob paths and use the below 
https://azureinsights.kusto.windows.net/Insights?query=H4sIAAAAAAAEAI3PsQrCQAwG4F3wHcJNOvoCDi0IDkLB0j3txV6gvZRcThF8eCuIdXBwDd%2fP%2f%2bcYp2zFIO2BNVmN%2fYkMPRquHnALpASVUseJah7pbDhOsAfsZbPz2%2fXHzETUl5KjFfcSjXpRpgSdREOOCZxSkqwdBcLBggPRP0KJ9MpLZulr58EVWviy6D1M8ynBS7jFXt6PNThk%2brEI2Lsn9OEBtgYBAAA%3d&web=0

InputBlobFirstTagMetadata
| where PreciseTimeStamp > ago(1d)
| where recordCountByCategories contains "resourcehealth" or recordCountByCategories contains "servicehealth" 
| where Role =~"OnBehalfWorker" 
| where blobPath contains "add paths here"
| where firstTagValue contains "resource id"

12. If you are seeing results via above query, then OBO service has received it.
13. if no results, then engage the Azure Service health team to check why event was not forwarded to OBO.
14. Next to see event was exported to Activity logs.
https://azureinsights.kusto.windows.net/Insights?query=H4sIAAAAAAAEAE3LPQrCQBBA4T6QOwyptPQCQqy0W0gusD%2bjGcjuLDMTJODh3SraPt5358CO1WZcMaPJ3n3gvaAgOMFIijNlnMznClfwLz5d0rk%2fnieJmvNi%2b23l4LwtELmYp6IwjClBaBlq6zr8VNzUOKM8EhYjI9Q%2fNW1Bo1A1Iy5Aqbm%2b%2bwLDZTV1pgAAAA%3d%3d&web=0

HoboPostTelemetry
| where PreciseTimeStamp > ago(1d)  // adjust the timestamp depending on the issue repro 
| where firstPartyBlobPath contains "Add blob paths"
| where customerIdentities contains "Subscription id"
| project-reorder PreciseTimeStamp, workspaceId, customerIdentities,isFailed, firstPartyBlobPath

15. If this query yield returns, then record was exported to activity logs. If still the record is not fetch via ASC (Investigation Steps). you will need to work Log analytics team to check the ingestion of the event. 

16. If the resultant dataset contains "IsFailed = True", then engage Activity log PG over an ICM. 
    **Important** - When escalating to the Activity logs PG, you will need to provide the blob path of the event obtained from the previous steps.
     

# Section : If Service or Resource health event are latent.
---

1. For service health use this DGREP: https://portal.microsoftgeneva.com/s/DD3701EE
2. For resource health use this DGREP : https://portal.microsoftgeneva.com/s/58A214C2
3. In the results will be "Time" Column and "Precise Timestamp" column.
Time - Indicates when the event was created.
Precise Timestamp - Is when the event was published and made available for OBO to read it.
4. If the difference in the above two dates are very high, then record is delayed upstream to OBO. There is a known issue upstream and details can be found here https://portal.microsofticm.com/imp/v3/incidents/details/491802323/home / https://msazure.visualstudio.com/One/_workitems/edit/13057965

**please work VIA ICM and ask for ETA on the fix. But, it may be mitigated by by design**
**Resource health**
![image.png](/.attachments/image-91186d0a-dda2-4627-bd51-7bc8feea8723.png)
**Service health**
![image.png](/.attachments/image-89f6fdab-40cb-4df6-8fa4-b5f8775ba0e3.png)

5. If there is minimal delay, then run the below query section to see if the OBO induced latency
6. The "PreciseTimeStamp" in step 2 and "PreciseTimeStamp" using the below should be more or less be equal with very minimal difference.

InputBlobFirstTagMetadata
| where PreciseTimeStamp > ago(1d) // adjust the timestamp depending on the issue repro 
| where recordCountByCategories contains "resourcehealth" or recordCountByCategories contains "servicehealth" 
| where Role =~"OnBehalfWorker" 
| where blobPath contains "add paths here"
| where firstTagValue contains "resource id

7. Observe the "PreciseTimeStamp" by running the below query and see if the difference between  "PreciseTimeStamp" obtained in Step 5 is in between 15mins. then, latency is expected. If its more than, please work with Azure Monitor Essentials\ Activity logs team indicating these time lines with all the links. Screenshots are **not** helpful in the ICM. 

HoboPostTelemetry
| where PreciseTimeStamp > ago(1d) // adjust the timestamp depending on the issue repro 
| where firstPartyBlobPath contains "Add blob paths"
| where customerIdentities contains "Subscription id"
| project-reorder PreciseTimeStamp, workspaceId, customerIdentities,isFailed, firstPartyBlobPath


