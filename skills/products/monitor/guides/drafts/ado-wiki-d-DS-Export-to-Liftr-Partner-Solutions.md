---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/Troubleshooting Guides/Troubleshooting Export to Liftr destination via diagnostic settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/Troubleshooting%20Guides/Troubleshooting%20Export%20to%20Liftr%20destination%20via%20diagnostic%20settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---


:::template /.templates/Common-Header.md
:::

:::template /.templates/PartnerSolutions-Header.md
:::

To investigate the export to liftr(Partner Solution) destination via diagnostic setting. 

This troubleshooting guide applies to Resource Log data that has not been received as expected by partner solution(datadog) as defined by Diagnostic Settings .

**Types of Partner solutions:**

Datadog, Dynatrace, Elastic,Logz.io & New Relic.
Liftr : It is a internal name for this feature.

**Supported Environments**
1. Public Cloud.

**Non - Supported Environments**
1. MoonCake
2. Fairfax

**Note: Only Logs are Supported to be exported to partner solutions. Metrics export is NOT supported**
**Note: please remember it will at least take 30mins for the newly created diagnostic setting to start export the logs to destinations**

**Requirements:**

You would need access to AZURE Insights Kusto cluster to in order to use the below TSG.
Use this link to request access https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azmonessenti-b503
Cluster : [https://azureinsights.kusto.windows.net](https://azureinsights.kusto.windows.net/)

**Step 1:**
Please check the existence of the diagnostic setting by querying the below table. This table is updated twice a day. 
```
RegistrationTelemetry
| where PreciseTimeStamp > ago(3d)
| where resourceId contains "<replace with resource id>"
| summarize max(PreciseTimeStamp) by resourceId,firstTagValue,usingInternalId,marketplacePartnerId,marketplacePartnerIdLocation,categories
```
marketplacePartnerId -> To which customer's resource logs are being exported.

**Step 2:**
Please check If the OBO aka diagnostic setting aka shoebox is exporting the data to partner solution.
Use the Resource ID of the source, not the destination (ie: using the URI of the Key Vault writing the data, not the Datadog resource receiving it).  
```
MarketplaceFirstTagTelemetry
| where PreciseTimeStamp > ago(2d)
| where resourceId =~"<replace with resource id of the source resource>"
| project PreciseTimeStamp,customerFirstTagId,resourceId,correlationId,marketplaceLocation,category,firstPartyBlobPath
```

**Advanced Query** 
Please run this query if you need additional evidence that OBO is exporting logs to LIFTR.  
If the LIFTR team requests further proof, share the output of this query and point them to the entries listed under the **_marketplaceStorageAccountId_** column, which confirm that the pipeline has written logs to the specified destination.
```
MarketplaceFirstTagTelemetry
| where PreciseTimeStamp > ago(1d)//change this
| where resourceId contains "" // add the resource id on which diagnostic setting is created
| join kind=inner (
� ��MarketplaceTelemetry
� ��| project ActivityId, marketplaceBlobName, marketplaceStorageAccountId
) on ActivityId
| project PreciseTimeStamp, correlationId, ActivityId,category,  resourceId, marketplaceBlobName, marketplaceStorageAccountId
```

**If you are seeing results after running the above query, then export is successful, as this table only records successful exports.
Note: If there are no results returned from the above query. then OBO aka diagnostic setting pipeline might not be receiving any logs.
please JUMP to STEP 4**

**Step 3:**

Next step, To engage the liftr team and share the results of the query in the step 2 + **Advanced Query** and ask them to investigate why the records are not available.

Follow article [Product Group Escalation](/Azure-Monitor/Collaboration-Guides/Product-Group-Escalation) for details on creating ICMs.  Escalation template to use will be based on the partner solution (for example, Partner Solutions \| Datadog).

**Step 4:**

If the customer state that they are missing a specific log or ALL LOGS in the partner solution (that is, datadog),
then you will need to work with customer and understand which specific record is missing(by getting unique information about the record) by which you can ask the resource provider to give you the blob path ([BLOB PATH TSG](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/809183/Get-the-blob-paths-of-the-emitted-logs-by-resource-provider)).
Once you have blob path , you can check if the OBO has received it via below query

**Note : If the above is true in your case, then you should create a CSS collab with Resource provider and ask for blob path.
There should be NO ICM for diagnostic settings or LIFTR PG**
For additional questions, post a message here [AzMon POD Swarming | Autoscale, Activity Logs and Resource Logs | Microsoft Teams](https://teams.microsoft.com/l/channel/19%3Ae8340fd5f1784ae186e8873be02b9053%40thread.tacv2/Autoscale%2C%20Activity%20Logs%20and%20Resource%20Logs?groupId=2fb9049b-bc9c-4cca-a900-84f22c86116c&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) and seek help

**This query should indicate , if OBO has received it** 

Note: You should also understand that - 

 - if some logs are missing from destination, then you should work using the using this TSG
How to get the blob path [How to get the blob paths of the emitted logs by resource provider - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/809183/How-to-get-the-blob-paths-of-the-emitted-logs-by-resource-provider)

 - If there no export at all, then you can remove the "blobPath" filter parameter from the below query and see, if pipeline is receiving any logs from customer and you can take sample blobs and continue investigation.

```
InputBlobFirstTagMetadata
| where PreciseTimeStamp > ago(1d) //adjust this accordingly
| where firstTagValue contains "replace with resource id"
| where serviceIdentity !="AzureResourceManager"
| where blobPath contains "replace with blob path via RP"
```
**This query should indicate if the particular log is exported successfully or not.**
**if exported successfully, then follow (step 3). If NOT raise an ICM to Azure MONITOR Essentials \ diagnostic settings with all these information.**
```
MarketplaceFirstTagTelemetry
| where PreciseTimeStamp > ago(2d)
| where resourceId =~"<replace with resource id>"
| where firstPartyBlobPath =~"replace with blob path via RP"
| project PreciseTimeStamp,customerFirstTagId,resourceId,correlationId,marketplaceLocation,category,firstPartyBlobPath
```
**END**