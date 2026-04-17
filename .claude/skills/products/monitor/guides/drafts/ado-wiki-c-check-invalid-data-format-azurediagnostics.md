---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Ingestion/HT: Check for Invalid Data Format in AzureDiagnostics data ingestion process"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FIngestion%2FHT%3A%20Check%20for%20Invalid%20Data%20Format%20in%20AzureDiagnostics%20data%20ingestion%20process"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

<table style="border:0px;" width="100%">
       <tr>
          <td style="border=0px;background-color:#d7eaf8">
             <p><b>Important:</b></p> 
This page covers only the <b>Invalid Data Format</b> scenario on the <b>AzureDiagnostics</b> table.
<p> If you're not sure if you're on the right place, please start your troubleshooting on this page: <a href="https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750172/How-to-Check-if-Diagnostics-data-arrived-in-InMem">How-to: Check if Diagnostics data arrived in InMem</a></p>
          </td>
       </tr>
    </table>

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#efd9fd">

**Note** <br>

**MOST DATA (99%) FLOWS THROUGH NORTHSTAR TODAY, NOT THE LEGACY PIPELINE.**
This article is suitable for data ingested through our **legacy pipeline** (InMem). If data is ingested through our new pipeline (Northstar), please refer to the following article [How-to: Check if Diagnostics data arrived in Northstar Pipeline (GT)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1203380/How-to-Check-if-Diagnostics-data-arrived-in-Northstar-Pipeline-(GT)).

 To check which pipeline is actually processing the data, please follow this article: [HT: Determine which pipeline is processing a given data type](/Log-Analytics/How%2DTo-Guides/Ingestion/HT:-Determine-which-pipeline-is-processing-a-given-data-type)

   </div>

# Scenario
---
While troubleshooting potential ingestion issues related with AzureDiagnostics data type, one of the first steps is to check if the data format is valid. If the data format is not valid, then we need to route the issue to the Resource Provider team (PG and\or CSS).

You may be troubleshooting different scenarios, like missing or partial data or ingestion errors logged on the workspace's 'Operation' table or the 'Log Analytics Workspace Insights' workbook. One example of such errors is the following one:

`Data of type AzureDiagnostics is being dropped due to incorrect format at lineOffset: -1. Exception message: Unexpected character encountered while parsing value: . Path 'records[0].properties.partitionKey', line 1, position 441. `








# Pre-requisites
---
To be able to run the Kusto queries mentioned bellow, you'll need access to the relevant Kusto database/cluster, so please follow the procedure described in [How-To: Connect to Log Analytics Kusto clusters](/Log-Analytics/How%2DTo-Guides/Kusto-Data/How%2DTo:-Connect-to-Log-Analytics-Kusto-clusters).

To be able to run the Jarvis queries mentioned bellow, you'll need access to the relevant namespace, so please follow the procedure described in
[HT: Get access to ODS telemetry namespace in Jarvis](/Log-Analytics/How%2DTo-Guides/Jarvis/HT:-Get-access-to-ODS-telemetry-namespace-in-Jarvis)

You will need the following information:
- [ ] Azure Resource ID of the resource configured to send diagnostic data (see **Note**)
- [ ] Time range (preferably in UTC)

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
  
   **Note**<br>
In case you're troubleshooting errors on the **Operation** table, you may not know the Azure Resource ID of the relevant resource.

   </div>


# Check for Invalid Data Format in the InMem pipeline
---

## Check 'Invalid Data Format' errors for a specific resource
---
To check the number of invalid data format errors for a specific Azure Resource , you can use the following Kusto query:
**Direct links**: [**Web**](https://dataexplorer.azure.com/clusters/omsgenevainmemprod.eastus/databases/OperationInsights_InMem_PROD?query=H4sIAAAAAAAAA4VSwW7iMBC9I/EPI5+gKiTLsV1WSiGtspJJ5IReqmplkqFESuxo7ICo9uNrKBRWtF3L8tgz79nPz67QQmol2am0CGMoXLBljb2RPxoNfviDkQ++f7Pv/dtup3L4UBX/QY/O0AKNbinHaOoIzEvnd+lEREkWxbPU8w9t8MlwbJ4I03guJuGDiOdJ6okHLxHxYzQNRerxaCLiNL7Phj9FMgt4+MtLQ/G4K73HXY7dgucRNpXMETalXYFdIRBWuJbKusmHwiXpel/MW2N1jdTtBLkt16XdTnTduPtgEa5R2W7nL2xWSAhZxMM0C3gCC7QbRAW9k6HD4dGt/onRkG6QbIkGVtKA1W3j1r2TUWdYoStntDMuUhxrTduMpDJLJC6VfEHa1Rmc8PKgdibrA49nxIccjXHwhHTuZpqOlznk2ZfiWPDaEk5L+aK0sWVu/gRJxEDTBRC4LpyjReBySyfjBvZUjpYc7ZsTDhqcabY146dIrWVV7jyT95pqaZ/33EaS+Ye7f8crYB+2FeMndvptBbBnBlffUn8bre4qvRAoi5BI026HiySwawbvO5m2riWVr+5/6FbZXh8W27Mjry/JbzGgVmNgAwAA)[**Desktop**](https://omsgenevainmemprod.eastus.kustomfa.windows.net/OperationInsights_InMem_PROD?query=H4sIAAAAAAAAA4VSwW7iMBC9I/EPI5+gKiTLsV1WSiGtspJJ5IReqmplkqFESuxo7ICo9uNrKBRWtF3L8tgz79nPz67QQmol2am0CGMoXLBljb2RPxoNfviDkQ++f7Pv/dtup3L4UBX/QY/O0AKNbinHaOoIzEvnd+lEREkWxbPU8w9t8MlwbJ4I03guJuGDiOdJ6okHLxHxYzQNRerxaCLiNL7Phj9FMgt4+MtLQ/G4K73HXY7dgucRNpXMETalXYFdIRBWuJbKusmHwiXpel/MW2N1jdTtBLkt16XdTnTduPtgEa5R2W7nL2xWSAhZxMM0C3gCC7QbRAW9k6HD4dGt/onRkG6QbIkGVtKA1W3j1r2TUWdYoStntDMuUhxrTduMpDJLJC6VfEHa1Rmc8PKgdibrA49nxIccjXHwhHTuZpqOlznk2ZfiWPDaEk5L+aK0sWVu/gRJxEDTBRC4LpyjReBySyfjBvZUjpYc7ZsTDhqcabY146dIrWVV7jyT95pqaZ/33EaS+Ye7f8crYB+2FeMndvptBbBnBlffUn8bre4qvRAoi5BI026HiySwawbvO5m2riWVr+5/6FbZXh8W27Mjry/JbzGgVmNgAwAA&web=0)

**Kusto cluster and database:** https://omsgenevainmemprod.eastus.kustomfa.windows.net/OperationInsights_InMem_PROD
**Query used:** 
<table style="border:0px;" width="100%">
  <tr>
    <td style="border=0px;background-color:lightgrey">
let StartDate = datetime(2022-10-20 00:00:00);<br>
let EndDate = datetime(2022-10-20 00:02:00);<br>
let ResourceID = "/SUBSCRIPTIONS/00000000-0000-0000-0000-000000000000/RESOURCEGROUPS/RG/PROVIDERS/MICROSOFT.<RPNAME>/SERVERS/SERVERNAME"; //replace with the relevant resourceID from the customer<br>
ActivityCompletedEvent<br>
| where TIMESTAMP between (StartDate .. EndDate)<br>
| where properties has toupper(ResourceID)<br>
| where Role == "InMemoryTransferManagerRole" <br>
| where activityName == "IMTrM.MessageProcessorCompleteMessage"<br>
| where properties has "AzureDiagnostics_API" or properties has " ModeledArtifact: AzureMetrics"<br>
| where properties has "MessageStatus=[InvalidDataFormat]"<br>
| parse properties with * "ResourceId=[" ResourceId "]" *<br>
| parse properties with * "JsonBlobReadError=[" JsonBlobReadError ","  *<br>
| summarize count() by ResourceId, JsonBlobReadError<br>
    </td>
  </tr>
</table>

### Interpreting the results
---
Once you successfully run the above, you will see an output similar to this one, that will show the affected resourceID, the different errors and the column where the issue is:

|![image.png](/.attachments/image-311cda63-0c84-4887-9f04-c83504bf0db3.png)|
|--|

In the above example, the issue is an invalid character in the '**message**' column.

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
  
   **Note**<br>
You will still need to follow the below section to collect the needed information to engage the OBO and\or RP PG teams

   </div>

## Check 'Invalid Data Format' errors for a specific workspace
---
In case you don't know the resourceID (which may happen if the case was reported about messages on the 'Operation' table) **OR you need to engage the RP team**, then you'll need to use the following query and then check the '**Interpreting the results**' section below:

**Direct links**: [**Web**](https://dataexplorer.azure.com/clusters/omsgenevainmemprod.eastus/databases/OperationInsights_InMem_PROD?query=H4sIAAAAAAAAA31UUWvbQAx+L/Q/CL8kKZndtGxsLR10aQYeeA1pYA9jlKutxLfap0x3dhbYj5/OsZd0TWuwLd9J3yd9JzmKxkVlHTJ8VSVeQLr96veotEs0WCttSixXTFmIyrrKho/iQeFam4zWNjToeoMwU049KIv93u0KWTlNJjZWL3Nn72OTYHk/nd3e9AbHR1Hkb5jn2sKvCnkDYtT+zWip4hRBG4cSXCMok8FaFwU4XSJQ5WCdowGX43ZloQufuiCQQMAIckEIG4J4ARuqIFceBuwKU73QaRO2YCm12TWIGTiCgugRlBsCGo8n/k6xm3sKnwKazNv/gD2/trbyT0jJiLdxxQYoTStmbZYNeKqMbJalYDap+6iDuI1dWWw8PoJaUn+wX1/YqXZ8VKDbw7gS2dE79s+jd9HZ6dk5fLg4fX9xNoJpMrjcunckB51Hb586fyN+tCuVYpzBFQSn7fXmwKO7gkuIokmrW60KLUfWoUB8c3x0nTpda7cZU7kSDswmtUji6/njj5MR5nEyuZtfJ9O2+lE+EMzxnnbNsVfWS3tYwqdyPQd+QLdGNP1ddBh2wa+QvXwiHcWMCtFWtGranHgzZ2XsAjlRRi2R/X6wc1etGH7atmHJnJMwQWvFe8qUikXcadWuNwArxdIjMokyYU6jlclwOZxAMPYDWSLH2dX3YE/84EcAJzvq3Ybw7h30q9htAndOyeh7+K31P3a7utWhaYIb+SN8Ji6Vez35WTv12+R3XzuGF0O/WDKfCnqYocomzMQe4dkiBMMOiOknpm7XFcM9vmFbwxAmptZMxrfD0E+3w99iPMP9CwHI0tI6BQAA)[**Desktop**](https://omsgenevainmemprod.eastus.kustomfa.windows.net/OperationInsights_InMem_PROD?query=H4sIAAAAAAAAA31UUWvbQAx+L/Q/CL8kKZndtGxsLR10aQYeeA1pYA9jlKutxLfap0x3dhbYj5/OsZd0TWuwLd9J3yd9JzmKxkVlHTJ8VSVeQLr96veotEs0WCttSixXTFmIyrrKho/iQeFam4zWNjToeoMwU049KIv93u0KWTlNJjZWL3Nn72OTYHk/nd3e9AbHR1Hkb5jn2sKvCnkDYtT+zWip4hRBG4cSXCMok8FaFwU4XSJQ5WCdowGX43ZloQufuiCQQMAIckEIG4J4ARuqIFceBuwKU73QaRO2YCm12TWIGTiCgugRlBsCGo8n/k6xm3sKnwKazNv/gD2/trbyT0jJiLdxxQYoTStmbZYNeKqMbJalYDap+6iDuI1dWWw8PoJaUn+wX1/YqXZ8VKDbw7gS2dE79s+jd9HZ6dk5fLg4fX9xNoJpMrjcunckB51Hb586fyN+tCuVYpzBFQSn7fXmwKO7gkuIokmrW60KLUfWoUB8c3x0nTpda7cZU7kSDswmtUji6/njj5MR5nEyuZtfJ9O2+lE+EMzxnnbNsVfWS3tYwqdyPQd+QLdGNP1ddBh2wa+QvXwiHcWMCtFWtGranHgzZ2XsAjlRRi2R/X6wc1etGH7atmHJnJMwQWvFe8qUikXcadWuNwArxdIjMokyYU6jlclwOZxAMPYDWSLH2dX3YE/84EcAJzvq3Ybw7h30q9htAndOyeh7+K31P3a7utWhaYIb+SN8Ji6Vez35WTv12+R3XzuGF0O/WDKfCnqYocomzMQe4dkiBMMOiOknpm7XFcM9vmFbwxAmptZMxrfD0E+3w99iPMP9CwHI0tI6BQAA)

**Kusto cluster and database:** https://omsgenevainmemprod.eastus.kustomfa.windows.net/OperationInsights_InMem_PROD
**Query used:** 
<table style="border:0px;" width="100%">
  <tr>
    <td style="border=0px;background-color:lightgrey">
//Cluster Name: cluster('omsgenevainmemprod.eastus.kusto.windows.net').database('OperationInsights_InMem_PROD')<br>
//<br>
// This query is very resource intensive and will time out when the time filter is over 1 hour.<br>
// If you have a specific timeframe you need to look at, enter a startTime and endTime.<br>
// If the issue is constantly occurring you can comment out the startTime and endTime and use the > ago() time filter.<br>
//<br>
//<br>
let startTime =datetime(3/6/2023 9:08:21 PM);<br>
let endTime =datetime(3/6/2023 9:15:21 PM);<br>
let WorkspaceId = "00000000-0000-0000-0000-000000000000"; //Enter a valid workspace ID<br>
ActivityCompletedEvent<br>
//| where TIMESTAMP > ago(1h) //Comment out when using startTime and endTime time filter.<br>
| where TIMESTAMP between(startTime .. endTime) //Comment out when using the > ago() time filter.<br>
| where properties contains WorkspaceId and properties contains "InvalidDataFormat"<br>
| where Role == "InMemoryTransferManagerRole"<br>
| where activityName == "IMTrM.MessageProcessorCompleteMessage"<br>
| parse properties with * "CustomerId=[" workspace "]" *<br>
| where workspace == WorkspaceId<br>
| parse properties with * "MessageStatus=[" Status "]" *<br>
| where Status == "InvalidDataFormat"<br>
| parse properties with * "ResourceId=[" ResourceId "]" *<br>
| parse properties with * "JsonBlobReadError=[" JsonBlobReadError "," *<br>
| project TIMESTAMP, ResourceId, Status, Environment, context, JsonBlobReadError<br>
    </td>
  </tr>
</table>

### Interpreting the results
---
Once you successfully ran one of the above, you will see an output similar to this one, that will show the affected **TIMESTAMP** (1), the **ResourceId** (2) and the **Context**(5) (which you will need on the next section)

![image.png](/.attachments/image-b8a1a6e9-fee5-43be-8dcd-357da6816616.png)

#### If ResourceID field is blank OR you need to engage the OBO or RP PG team
---
In case the **ResourceId** field is empty like in the above screenshot or you need to engage the OBO or RP PG team, you'll need to get the **TIMESTAMP** (1), the **context** (5) and the **Environment** (4) column values from above and then run the following Jarvis query:

Jarvis Link: https://portal.microsoftgeneva.com/s/A2288715

Parameters:
1 - Time range: please use the TIMESTAMP value you got from the previous query (1)
2 - Environment: please use the Environment value you got from the previous query (4)
3 - Context: please use the Context value you got from the previous query (5)
4 - Client Query Used:
`source`
`| extend DataType = extract(@"Log-Type:([^]\;]*)", 1, properties)`
`| extend ResourceId = extract(@"x-ms-AzureResourceId:([^]\;]*)", 1, properties)`
`| extend odsCorrelationId= extract(@"RequestId=\[([^]\;]*)", 1, properties)`
`| project TIMESTAMP, DataType, ResourceId, odsCorrelationId`


![image.png](/.attachments/image-ca464596-772d-4adb-b02e-e036f64b4880.png)

##### Interpreting the results
---
If you filled in the correct parameters, the output of the query will show you the resource ID and the OBO Correlation ID:

| ![image.png](/.attachments/image-d122747a-7f56-4dec-ad6a-9e443000df44.png)|
|--|

### Collaborating with RP team. Required Step
---
A malformed payload can be correlated from InMem to ODS and then correlated to OBO, to walk backwards to the MDS table/event name to produce a Jarvis/DGrep link that can be used by the RP team to investigate the issue on their end. 

The first information needed to start this process is the **odsCorrelationId**, which you got on the previous step. Use this TSG to perform this https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1857668/Investigate-the-invalid-json-records-exported-via-diagnostic-setting

# Resolution
---
It's up for the Resource Provider team to fix this on their end, so please follow-up the process to either transfer the case to them or a collaboration task.
If you keep the case, the SAP and Root cause should be set on the RP product and not on Log Analytics.






# Known issues
---
- [ ] Microsoft's **Storage** resource provider, sending logs to Log Analytics workspaces (If configured), has a known issue around InvalidJsonFormat.
ETA for a fix is a couple of months, however any additional questions as for follow ups and state update should be done via a collaboration task to the Storage CSS team.
   - How to identify:
 Data of type XSTORE_STORAGEWRITE_MICROSOFTSTORAGESTORAGEACCOUNTSFILESERVICES is being dropped due to incorrect format at lineOffset: -1. Exception message: After parsing a value an unexpected character was encountered: l. Path 'records[453].properties.objectKey', line 1, position 760064.
CRI: https://portal.microsofticm.com/imp/v3/incidents/details/261506155/home

<!--- Reference (DO NOT DELETE -->
<!--- https://portal.microsofticm.com/imp/v3/incidents/details/230016341/home -->
