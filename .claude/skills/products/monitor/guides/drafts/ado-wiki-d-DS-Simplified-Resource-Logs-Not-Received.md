---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/Troubleshooting Guides/Simplified : Troubleshooting Resource Log data not being received by target destinations"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/Troubleshooting%20Guides/Simplified%20%3A%20Troubleshooting%20Resource%20Log%20data%20not%20being%20received%20by%20target%20destinations"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#7BD689">

Try the new Diagnostic Settings dashboard for troubleshooting Diagnostic Settings cases:
<span style="background-color: #DDFFE2">(https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1666481/-TSG-Diagnostic-Settings-Telemetry)</span>

</div>


**Scenario:**
Customer raises a support ticket indicating that platform logs for their resource are missing.

**Collaboration with other CSS teams**

**For the Support cases related to azure data factory logs missing.** 
All CSS engineers are required to work with ADF CSS team to get the blob path. To reach ADF CSS , please follow this [teams channel](https://teams.microsoft.com/l/channel/19%3a768c7b4fcda64cd3acc29bc91eb98bfc%40thread.skype/General?groupId=97f0bf0e-fe36-422a-9083-3e59230b5715&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) + [ADF TSG](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/434293/Log-Analytics-doesn't-show-the-ADF-data)

**For the Support cases related to the logs missing from Event hub's.** 
All the CSS engineers are required to work with Event Hub CSS. Use the below teams channel.
[Event Hub CSS](https://teams.microsoft.com/l/channel/19%3a2b752ae8cc7349358fada5e0956540f7%40thread.skype/Event%2520Grid?groupId=8a6a0fe1-0d7d-41a0-93f0-0fd7af9ac2c8&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)


For others resource providers, I will continue to add more information.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:yellow">

**Important**

You are required seek help via Azure monitor swarming channel to validate your findings after executing this TSG.
[AzMon POD Swarming | Autoscale, Activity Logs and Resource Logs | Microsoft Teams](https://teams.microsoft.com/l/channel/19%3Ae8340fd5f1784ae186e8873be02b9053%40thread.tacv2/Autoscale%2C%20Activity%20Logs%20and%20Resource%20Logs?groupId=2fb9049b-bc9c-4cca-a900-84f22c86116c&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

Any escalation via ICM to PG without concrete investigation will be mitigated without further investigation. 
</div>

**Note:**
1. The below investigation steps are common which are explained [here](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480552/Troubleshooting-Resource-Log-data-not-being-received-by-target-destinations). however, this article explains it in simpler way.

2. Before you start the investigation, please read this carefully and these steps should be able to help you investigate **without** raising an ICM.

3. Please read this TSG before attempting to execute this TSG it such that - you have a clear with understanding.

4. If you still have questions or improvements. Please feel free to ping/email me vikamala@microsoft.com and CC : jfanjoy@microsoft.com

**Information needed from customer**

1. Resource Id : On which diagnostic setting is created.
2. Diagnostic setting Name : take a screenshot of the diagnostic setting from the customer or please use ASC to check.
3. Categories of logs : Check if the required categories of logs are enabled.
4. **Most Important** : 
a. How did they determine the logs is missing? 
b. Time frame : Only last 30days.
c. Ask the customer a unique identifier of the record which they claim to be missing.
d. Are none of the logs missing or just one/few records are missing? If none, you can comment the blobpath column from the queries listed below and continue with investigation
5. Once you have the above information verified, 
a. Try and query the customer LA Workspace using ASC. if you able to find the missing record. please work with customer. or proceed with below steps
b. You might not able to query the storage account / Event hub. incase, they are exporting to these destinations. then, proceed with the below steps.

**OBO aka Diagnostic settings feature aka shoebox**
1. Background, this feature enables the customer to export the diagnostic logs for the resources for alerting and other purposes. 
This feature , doesn't store or create or emit or change or edit any logs. IT ONLY EXPORTS THE LOGS/METRICS. 
It is only responsible to export whatever the resource provider has emitted.

**Investigation Steps:**

1. Lets say, customer indicates that one of the log missing and they provided a unique identifier of the record which is missing in target destinations.
2. As explained above, this feature doesn't store any data. we would need to work with Resource provider CSS or PG group to provide us the blob paths.
3. Please create a collab case with relevant resource provider CSS team and ask them - If the logs were emitted for the resource and can they locate this specific record and share the blob paths. please ask them, to share these blob paths via spreadsheet. We cannot query their tables in jarvis.
4. Resource provider CSS might ask how to get the blob paths. Please ask them to use the below KQL and add in the box shown below. For more detailed steps for this use this [TSG](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/809183/Get-the-blob-paths-of-the-emitted-logs-by-resource-provider)


**| extend blob= blob_name()**
below is the sample query to query the AAD logs. 
![MicrosoftTeams-image (36).png](/.attachments/MicrosoftTeams-image%20(36)-40033667-5ca4-4af8-8c8c-becd32995ecc.png)
5. Assuming , we have received the blob paths. Please use the below queries to determine, if OBO has received it or not.
https://azureinsights.kusto.windows.net/Insights?query=H4sIAAAAAAAEAE1PTUsDMRC9F%2fwPoSc9pKlSdrcHhYpUPBQKFu%2bTZLKbsrsJMxNFEH%2b7uyLqad7wPnjvacxF7vtk95FYTtAeUMCDwMXiQ711SKiOhC4ynuKAzwJDVncK2nR57a%2bUMTt%2fLixKushKJkUgGPDXGn5CX6AvqG4%2fl4aLZUcxS0wjmy3WrrYbrysMld7UsNbNjV9r9E1wFTZ229SGkFMhh4%2bUSmYjVHSvwQdNrcmUXqNHYnOIjhKnIKuHqf0enCR6N%2bH7RvxvwzIu%2f9bZafsRpJvbzVjl%2bZmpSbT4AtKhT2MfAQAA&web=0


RegistrationTelemetry
| where PreciseTimeStamp > ago(1d) //adjust the timestamp
| where resourceId =~"" //Add the resource id
| extend firstTagValueEval = iff(usingInternalId==true, firstTagValue,resourceId)
| summarize max(PreciseTimeStamp) by firstTagValue,serviceIdentity
| join  (
InputBlobFirstTagMetadata
| where PreciseTimeStamp > ago(7d)
| where Role =~"OnBehalfWorker"
| extend categoriesComputed = substring(recordCountByCategories,0, indexof(recordCountByCategories,'('))) on firstTagValue
| where firstTagValue contains firstTagValue1
| where serviceIdentity =~ serviceIdentity1
| where blobPath =~"blob path here"

**Understanding this query output.**
1. This query should indicate that - OBO has received the blob paths depending on the results. 
If there are no results. please make sure, if you have adjust the timeframe. Still, if you don't see it then, OBO has not received that particular path. there could also be another possibility, that blob paths which we received , didn't contain the logs for the resource id in question. you can remove the "firsttagvalue" filter condition from the above query and re-run. if you see the results, work with resource provider CSS team showing this. if no results , then blob didn't reach the OBO service. Ask the resource provider CSS CSS to work with their PG to investigate it.

2.  Assuming, OBO has received the logs. then use the below queries and determine if the export was successful.

**If the destination is Log analytics workspace**

https://azureinsights.kusto.windows.net/Insights?query=H4sIAAAAAAAEAE1QwUrEQAy9L%2bw%2fhD0plB3Bs8JqrfRQLLY%2fkE4z7mi7GZKpS0H8dtvC2s0leeEleS9vaVWyxpo66inKuPmB85GEoBSyXqn2PVUR%2bwCPgB98c3%2fX3gJs%2f2lCyoNYylt4%2bN0ZHRq14kP0fFKzn8JcGK%2fCQ1h6Jgh%2f%2b5ZETeGtsLKL%2bxQjZmgjy2jckj0t7N16zHnRWKLE8anjpsR4nI82Uw1hBk64h0OawXNVXY2dWb404EXkCtOFNKn5JBuhzouXqj4UZeI1Q99Rm6zuEjd1BqF3QuVTcrUysSxCHc6W83a7gfk9f6SQdrpXAQAA&web=0

ODSPostTelemetry
| where PreciseTimeStamp > ago(30d)  
| where resourceId =~"resource id"
| where isFailed==false
| where firstPartyBlobPath =~"blob path from resource provider" //optional when all the logs are missing
| where workspaceId =~"workspaceID" //you will need to refer to the diagnostic setting to get this information
| project TIMESTAMP,isFailed,resourceId,failureReason,workspaceId,correlationId
   
1. OBO has a re-try mechanism 4 times. Pay extra attention on the "Isfailed" column.
for the records which are isFailed=false, please collect the "correlationId" and work with Log analytics CSS team to verify the ingestion status.
At this point , investigation ends with diagnostic settings/Azure monitor CSS team.

**2. Most Important** : Once you are made sure the records are being exported correctly, it also be good to verify if the customer's Log analytics workspace is encountering "OverQuota" issues. please work with log analytics CSS teams to investigate it.

**If the destination is storage account**
https://azureinsights.kusto.windows.net/Insights?query=H4sIAAAAAAAEAFVQTUvDQBC9B%2fIfhp4UQlfwrBBbIz1Egskf2Gxmm61JZpmdKAHxt7sNtMW5zNd7vHlTC7E%2bYm4MzZPk3uPUvQxkPhsccEThJfmB7x4ZoWI0LmDjRqxFjx6eQR%2fp7vGhuwdQMfLuNAcB6V0AiSjLesT0ymcMNLPBQwdPvxsV5jYYdl4cTUFtY6gL4o1p9utMeaYv1yEHVTrDFMjKdq9FF9rEyxdl1%2bxwRW9uYtZxkEqzLNFNW2npz6JtrMGfG8s0Qr4vYFfXKy0KndAINIfytW7ysspcKLQbsMtuh2c2TmbGD9SBpsxEuzQi1%2f%2be%2bB5dX1cX9TQBgDT5A5z9%2fPFvAQAA&web=0

_StorageAccountAppendBlockTelemetry
| where PreciseTimeStamp > ago(30d)  ////Adjust this timeframe
| where resourceId =~ "resource id"
| where isFailed==false
| where firstPartyBlobPath =~ "blob path from resource provider" //optional when all the logs are missing
| where customerStorageAccountName =~"customer storage name"
| project TIMESTAMP,isFailed,resourceId,failureReason,customerStorageAccountName,customerBlobPath
   


**For the Support cases related to the logs missing from Event hub's.** 
All the CSS engineers are required to work with Event Hub CSS. Use the below teams channel.
[Event Hub CSS](https://teams.microsoft.com/l/channel/19%3a2b752ae8cc7349358fada5e0956540f7%40thread.skype/Event%2520Grid?groupId=8a6a0fe1-0d7d-41a0-93f0-0fd7af9ac2c8&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

EventHubSendBatchTelemetry
| where PreciseTimeStamp > ago(30d)  ////Adjust this timeframe
| where resourceId =~"resource id"
| where firstPartyBlobPath =~"blob path from resource provider" //optional when all the logs are missing
| where isFailed==false
| where eventHubName =~"eventHubName"
| project TIMESTAMP,isFailed,resourceId,failureReason,eventHubName,eventHubNamespace


OBO has a re-try mechanism 4 times. Pay extra attention on the "Isfailed" column.
We cannot query event hub . So, please work with event hub CSS to determine, if this record was written.
At this point , investigation ends with diagnostic settings/Azure monitor CSS team.

