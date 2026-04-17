---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/Troubleshooting Guides/Troubleshooting Resource Log data not being received by target destinations"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/Troubleshooting%20Guides/Troubleshooting%20Resource%20Log%20data%20not%20being%20received%20by%20target%20destinations"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

<div style="border:6px solid; margin-bottom:20px; padding:10px; min-width:500px; width:75%; border-radius:10px; color:black; background-color:#7BD689">

Try the new Diagnostic Settings dashboard for troubleshooting Diagnostic Settings cases:
<span style="background-color: #DDFFE2">(https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1666481/-TSG-Diagnostic-Settings-Telemetry)</span>

</div>

[[_TOC_]]

# Scenario
---
This troubleshooting guide applies to Resource Log data that has not been received as expected by one or more [target destinations](https://docs.microsoft.com/azure/azure-monitor/platform/diagnostic-settings#destinations) as defined by [Diagnostic Settings](https://docs.microsoft.com/azure/azure-monitor/platform/diagnostic-settings).

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important** 

This article deals exclusively with Diagnostic Settings and data delivered by the associated Diagnostics Pipeline.  If the customer is collecting data to their Log Analytics Workspace using a solution that does not use this process, such as one of the legacy Activity Log collection methods: [Log Profiles](https://docs.microsoft.com/azure/azure-monitor/essentials/activity-log#log-profiles) or [Activity Log solution in Log Analytics](https://docs.microsoft.com/azure/azure-monitor/essentials/activity-log#activity-log-analytics-monitoring-solution), this article should **NOT** be followed.

- For Azure Activity Log solution in Log Analytics, see article: [No AzureActivity data coming for one or more subscriptions](https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/438729/TSG-No-AzureActivity-data-coming-from-one-or-more-subscriptions).
</div>

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

This article deals with data that flows from an Azure resource, subscription or tenant via the [Diagnostic Setting service](https://docs.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings) and is **NOT** related to the use of Windows Azure Diagnostics (WAD) or Linux Azure Diagnostics (LAD) which are configured via the diagnostic settings blade for Azure Virtual Machines.
</div>

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:yellow">

**Important**

You are required seek help via Azure monitor swarming channel to validate your findings after executing this TSG.
[AzMon POD Swarming | Autoscale, Activity Logs and Resource Logs | Microsoft Teams](https://teams.microsoft.com/l/channel/19%3Ae8340fd5f1784ae186e8873be02b9053%40thread.tacv2/Autoscale%2C%20Activity%20Logs%20and%20Resource%20Logs?groupId=2fb9049b-bc9c-4cca-a900-84f22c86116c&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

Any escalation via ICM to PG without concrete investigation will be mitigated without further investigation. 
</div>

# Support Boundaries
---
- [Diagnostic Settings - Support Boundaries](/Monitoring-Essentials/Diagnostic-Settings#support-boundaries)

# Information you will need
---
- The Resource Id of the Azure resource that is sending data to one or more of the Diagnostic Settings target destinations.

   [How to get the ResourceId value of an Azure resource from Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-get-the-ResourceId-value-of-an-Azure-resource-from-Azure-Support-Center)

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
   
   **Note**

   For Entra / Azure Active Directory (tenant) Diagnostic Settings, the Resource Id is the Tenant Id.
   For Azure Activity Logs (subscription) Diagnostic Settings, the Resource Id is the Subscription Id.
   </div>

- Azure resourceId of target destination(s) where data was expected but was not received
   - Log Analytics Workspace 
   - Event Hub Namespace
   - Storage Account
   - Partner Solution

   [How to get the ResourceId value of an Azure resource from Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-get-the-ResourceId-value-of-an-Azure-resource-from-Azure-Support-Center)

- A time window during which data was expected but was not received.
- Details on how the customer has identified that data is not being received at the target destination(s).
-  Category of the log which is missing. Is that log category enabled for export?


::: template /.templates/TSG-KnownIssues-DiagnosticSettings.md
:::
- #10952
- #15089
- #10953
- #20324
- #29896

# Troubleshooting
---
Progress through the troubleshooting steps by clicking on lines that have a twisty (looks like a filled in triangle) at the left to expand that content.

<div style="margin:25px">

<details closed>
<summary><b>Step 1: Check diagnostic settings configuration.</b> (click to expand)</summary>
<div style="margin:25px">

It is important to verify the Diagnostic Setting exists in the backend as intended by the customer. This can be checked in several locations: 

Kusto Explorer (KQL)
- [How to get diagnostic settings for Azure resources from Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-diagnostic-settings-for-Azure-resources-from-Kusto)
- gives the best historical view of changes made to the Diagnostic Setting, or point-in-time views of how the configuration appeared in the past. 
- has a limitation that the records are only updated every 6-12 hours, so very recent or many quick repeated changes will not be observable.

ASC (API)
- [How to get diagnostic settings for Azure resources from Azure Support Center](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-diagnostic-settings-for-Azure-resources-from-Azure-Support-Center)
- Use the above given ASC feature to get the tenant level diagnostic settings. for example : Azure Active Directory (AAD) [here] (https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1082153/How-to-get-Tenant-level-diagnostic-settings-for-an-Azure-tenant-from-Azure-Support-center)
- gives the most up-to-date view for changes made very recently, as it is a fresh GET call to the Diagnostic Setting configuration.
- does not include a resource change history breakdown of historical updates to the Diagnostic Setting, so the configuration may be different when queried live than it was when their reported issue occurred.

<div style="margin:25px">





<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

**Note**

MOST IMPORTANT :
"registrationTelemetry" table is a snapshot table. If the customer has created a support ticket just after creating the diagnostic setting(within hours) then you might NOT be able to see diagnostic settings in the table.  In order to see the newly created diagnostic settings, please use this TSG https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480507/How-to-get-diagnostic-settings-for-Azure-resources-from-Azure-Support-Center
</div>


<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

**Note**

If using the Kusto method, ensure the PreciseTimeStamp value is current as this method will show you data for diagnostic settings that have been recently deleted.
</div>




<details closed>
<summary>No, a diagnostic setting does not exist</summary>
<div style="margin:25px">

Have the customer create a diagnostic setting to send the desired data to their target destination(s): https://docs.microsoft.com/azure/azure-monitor/platform/diagnostic-settings.

</div>
</details>
<details closed>
<summary>Yes, one or more diagnostic settings do exist</summary>
<div style="margin:25px">

**Are any of the diagnostic settings configured to send the desired logs to the desired target destinations?**

<div style="margin:25px">

If the target destination is a Log Analytics workspace and the customer has reported that data stopped flowing, check to see if the workspace was recently created (see article [Azure Support Center - Find basic Log Analytics Workspace information](/Monitor-Agents/Agents/How%2DTo/General/Azure-Support-Center-%2D-Find-basic-Log-Analytics-Workspace-information) for details).  If the workspace was recently created, have the customer edit the diagnostic setting to remove the workspace as a target, save the change, then add the workspace back and save the change.  This will update the internal workspace details that were pointing to the older instance of the workspace.


There are limitations in configuring the diagnostic settings on certain resource types. Please refer to the links below 
https://supportability.visualstudio.com/AzureMonitor/_workitems/edit/20324
https://supportability.visualstudio.com/AzureMonitor/_workitems/edit/22646

<details closed>
<summary>No, none of the diagnostic settings have the right configuration.</summary>
<div style="margin:25px">

Have the customer create a new diagnostic setting or update an existing diagnostic setting to send the desired data to their target destination(s): https://docs.microsoft.com/azure/azure-monitor/platform/diagnostic-settings.




</div>
</details>
<details closed>
<summary>Yes, a diagnostic setting is correctly configured.</summary>
<div style="margin:25px">

Get the following questions clarified by the customer.
1. Are all the logs are missing? Or logs were missed between specific time frame. Make sure, time frame is in last 30days.
**Go to Step 2**
2. If a specific log is missing, following questions can come to mind.
 - Customer should provide unique identifier of the log such that you can work with RP CSS team to get the blob path.
 - In this case, directly work with RP CSS team and get the blob path and then proceed with **Go to Step 2** 


</div>
</details>

</div>

</div>
</details>
</div>
</div>
</details>

<details closed>
<summary><b>Step 2: Check for data received by OBO from Azure resource provider.</b> (click to expand)</summary>
<div style="margin:25px">

Each resource provider submits data to the OnBehalfOf (OBO) service by writing data to a blob in a storage account and then sending a message to OBO identifying the location of the blob.  When OBO receives the message, it unpacks the blob and captures details about the data that has been sent such as which resource(s) are included, which log categories and how many records.

Is the missing data **one or more individual record(s)** or is it **blocks of missing data across time ranges?**
<div style="margin:25px">

<details closed>
<summary>The missing data is blocks of missing data across time ranges. (such as all data being missing, or all data of a specific category)</summary>
<div style="margin:25px">

**Has data been received by the OnBehalfOf service (aka OBO or Shoebox) from the Azure resource provider?**
<div style="margin:25px">

[How to check if resource provider sent data to OnBehalfOf service in Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-check-if-resource-provider-sent-data-to-OnBehalfOf-service-in-Kusto)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

**Note**

Check the categories of data returned as often there will be some data that is being emitted by the resource provider but other data that is not, so even if you do get results, you may not see results for the category of data that the customer has identified as missing. A good way to do this is to utilize the "Advanced" query in the above linked How-To article.
</div>

<details closed>
<summary>No, data has not been received for the Azure resource in the desired data category.</summary>
<div style="margin:25px">

In this case, it is up to the Azure resource provider team to confirm to us that they did send us data.  
**Note:
If the resource provider is "Microsoft.Cdn/profiles" then, please refer here https://supportability.visualstudio.com/AzureMonitor/_workitems/edit/86044

If the resource provider is "Microsoft.Network/applicationGateways", then please refer here
https://supportability.visualstudio.com/AzureMonitor/_workitems/edit/48586**


Open a collaboration case with the relevant CSS team and request that they provide us with the following information:

- The timestamp in UTC when the data was written to OBO.
- The blob path where the data was written.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

**Note**

CSS teams will often not be aware of, or not have access to how to find the logging needed to identify when data was written to OBO.  They will probably need an ICM to their product group to acquire the blob path and timestamp that is needed.
</div>

In most cases, the resource provider will find that they did not write the data to OBO however if the resource provider team does return with a timestamp and blob path where they wrote the data, check the processing history of that blob.

[How to get OnBehalfOf blob processing history for an Azure resource in Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-OnBehalfOf-blob-processing-history-for-an-Azure-resource-in-Kusto)

- If the processing history returns no results, reach out to the swarming channel for help reconciling our lack of data with the resource provider saying they wrote data successfully.
- If the processing history shows that the data was not sent due to errors, go to Step 3.
- If the processing history shows that the data was successfully sent to the target destination, go to Step 4.

Related resource provider articles:

:::template /.templates/TSG-DiagnosticSettings-OBORPArticles.md
:::

</div>
</details>

<details closed>
<summary>Yes, data has been received for the Azure resource in the desired data category.</summary>
<div style="margin:25px">

Go to Step 3.

</div>
</details>

</div>
</details>
<details closed>
<summary>The data not being received is one or more individual record(s).</summary>
<div style="margin:25px">

An example of this scenario would be a customer receiving thousands of logs of type X, but are missing one specific record with a unique correlation ID, or unique Run Id, etc.

In this case, since we do not inspect and log details about the contents of individual records, it is up to the Azure resource provider team to confirm to us that they did send us data for the records that are identified as missing.  

Open a collaboration case with the relevant CSS team and request that they provide us with the following information regarding the missing records:

- The timestamp in UTC when the data was written to OBO.
- The blob path where the data was written.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

**Note**

CSS teams will often have no idea how to find the logging needed to identify when data was written to OBO.  They will probably need an ICM to their product group to acquire the blob path and timestamp that is needed.
</div>

In most cases, the resource provider will find that they did not write the data to OBO however if the resource provider team does return with a timestamp and blob path where they wrote the data, check the processing history of that blob.

[How to get OnBehalfOf blob processing history for an Azure resource in Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-OnBehalfOf-blob-processing-history-for-an-Azure-resource-in-Kusto)

- If the processing history returns no results, reach out to the swarming channel for help reconciling our lack of data with the resource provider saying they wrote data successfully.
- If the processing history shows that the data was not sent due to errors, go to Step 3.
- If the processing history shows that the data was successfully sent to the target destination, go to Step 4.

Related resource provider articles:

:::template /.templates/TSG-DiagnosticSettings-OBORPArticles.md
:::

</div>
</details>

</div>
</div>
</details>
<details closed>
<summary><b>Step 3: Check for errors sending data to target endpoints.</b> (click to expand)</summary>
<div style="margin:25px">

**Were there any errors sending the data to the desired target destination?**
<div style="margin:25px">

[How to check for errors sending data to target endpoints for an Azure resource in Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-check-for-errors-sending-data-to-target-endpoints-for-an-Azure-resource-in-Kusto)
[How to get OnBehalfOf blob processing history for an Azure resource in Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-OnBehalfOf-blob-processing-history-for-an-Azure-resource-in-Kusto)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

There is currently no telemetry for failures to write data for Partner Solution targets.  If you are troubleshooting missing data in a Partner Solution target, go to Step 4.
</div>

<details closed>
<summary>No, there were not any errors sending the data to the target destination.</summary>
<div style="margin:25px">

Go to Step 4.

</div>
</details>

<details closed>
<summary>Yes, there were errors sending the data to the target destination.</summary>
<div style="margin:25px">

Transient errors are normal in any client/server service and Azure is no exception.  Data flowing through diagnostic settings have two sets of retry mechanisms built in.  The first is to make up to 4 attempts at the overall processing of each blob at a 10 minute retry interval.  The second is for each attempt if an error is encountered the process waits a moment and then tries again.  See article [How to check for errors sending data to target endpoints for an Azure resource in Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-check-for-errors-sending-data-to-target-endpoints-for-an-Azure-resource-in-Kusto) for details on returned properties attempt and sendRetryCount.

When data is missing, what we are looking for is whether or not all attempts have been made to send the data and failed.  This means we want to take a sample of the records where "isFailed" equaled 1, save the blobpaths provided via these records, and investigate the processing history of these specific blobpaths individually. This will allow us to see if the failures are irrelevant (ie: they failed initially, but succeeded on a retry), or if the failure represents a true failure that never succeeded afterward. To confirm that a particular blob failed entirely on all attempts, see article [How to get OnBehalfOf blob processing history for an Azure resource in Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-OnBehalfOf-blob-processing-history-for-an-Azure-resource-in-Kusto).

**Were there any errors sending the data where all attempts have failed?**
<div style="margin:25px">
<details closed>
<summary>No, all data was eventually sent during one or more attempts.</summary>
<div style="margin:25px">

Go to Step 4.

</div>
</details>

<details closed>
<summary>Yes, there were errors where all attempts to send the data have failed.</summary>
<div style="margin:25px">

Errors indicate a problem with sending the data to the target destination so reaching the point where all attempts are failing suggests there is a problem with the target resource or service.

The most common reasons for all attempts failing to send to the target destination are:
- (OdsError_BadRequest) -  If the resource id field has any Unicode characters, then no logs will be exported. By design. refer to https://supportability.visualstudio.com/AzureMonitor/_workitems/edit/172745
- (NotFound) The target resource cannot be found (for example somebody has deleted the target resource).
- (Forbidden or 403) Forbidden response when connecting to the target resource.  Usually means that network configuration of the target resource is not configured to allow trusted Microsoft services.
- Service disruption affecting the target resource.
- (HttpError_NameResolutionFailure) Use this TSG to investigate: [NameResolutionError TSG](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/800795/HT-Investigate-HttpError_NameResolutionFailure-errors-generated-in-OBO-when-sending-data-to-a-workspace). Creating an ICM should performed only after entire investigation is completed. Usually, this error means the DNS entries for the LA workspace are missing. **Please work with Log analytics team**
- Event Hub is Basic SKU and the export attempts are too large to be accepted by the Event Hub: [How to identify Event Hub failures related to publication size](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1986481/How-to-identify-Event-Hub-failures-related-to-publication-size)
- UnauthorizedAccess : This occurs because the customer may have disabled the Azure Monitor firstparty application in their subscription. This application is required, as the pipeline relies on it to authenticate to the customers destination. The app is automatically used when customers register the_Microsoft.Insights_resource provider. https://supportability.visualstudio.com/AzureMonitor/_workitems/edit/166938

From here, troubleshooting needs to continue from the **RP of the target destination** to identify why OBO was unable to send the data.

| Target Destination | Directions |
|:-------------------|:-----------|
| Log Analytics | Update the Support Area Path (SAP) for your case to **Azure/Log Analytics/Query Execution and visualization/My query does not return any results** and then follow article [How to check if diagnostics data arrived in InMem](https://aka.ms/azmon/la/azurediagnostics) for further guidance.  |
| Storage | Please query "StorageAccountAppendBlockTelemetry" and filter the table with resource id(on which diagnostic setting is created) and isfailed==false 
Use the column values from the "customerBlobPath" and ask the customer to navigate to that file path in the storage account and ask them open the PT1H.JSON file. Logs should be present. if you still don't see it. collabrate with with Azure Storage team (SAP = Azure\Blob Storage). 
| Event Hub | Collaborate with Azure Event Hubs team (SAP = Azure/Event Hubs/Monitoring and Diagnostics/Not receiving diagnostics or Log data). |

</div>
</details>
</div>

</div>
</details>

</div>
</div>
</details>

<details closed>
<summary><b>Step 4: Check for successful delivery of data to target destination.</b> (click to expand)</summary>
<div style="margin:25px">

**Is the data being successfully written to the target destination?**
<div style="margin:25px">

To view data being successfully written to the target destination across time ranges, see article [How to get diagnostic log and metrics telemetry for an Azure resource from Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-diagnostic-log-and-metrics-telemetry-for-an-Azure-resource-from-Kusto).

If and only if the processing history of an individual blob was checked in previous steps (see article [How to get OnBehalfOf blob processing history for an Azure resource in Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-OnBehalfOf-blob-processing-history-for-an-Azure-resource-in-Kusto)) and you progressed here, the data has been successfully written to the target destination.

<details closed>
<summary>No, data is not being written to the target destination.</summary>
<div style="margin:25px">

Since we have confirmed that we are receiving data in OBO but we do not see any data either failing to be sent or being sent successfully, something in the OBO service must not be picking up the data as expected and processing it.

Reach out for assistance on the swarming channel or if appropriate open a CRI by following article [Product Group Escalation](/Azure-Monitor/Collaboration-Guides/Product-Group-Escalation).

</div>
</details>

<details closed>
<summary>Yes, data is being written to the target destination.</summary>
<div style="margin:25px">

At this point data is observed as being written to the target destination and no errors identified where all attempts to deliver the data failed, so the processing of the data by OBO is considered successful to the target destination.  

From here, troubleshooting would need to shift focus to the resource provider of the target destination to ensure that the data was processed correctly after being accepted from OBO.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

**Note**

Resource logs being sent to Log Analytics can be sent to either the table AzureDiagnostics or to a resource specific table.  To determine which, see the odsDataTypeId property when confirming that data was successfully sent to the target Log Analytics workspace as per article [How to get OnBehalfOf blob processing history for an Azure resource in Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-OnBehalfOf-blob-processing-history-for-an-Azure-resource-in-Kusto#reviewing-the-results).
</div>

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

**Note**

As the resource logs are being exported successfully. There should be NO escalations to diagnostic settings ICM queue. please use the information given below for more guidance.

Depending on the type of the destination. please work with respective CSS teams to investigate more.
If you still need help, please swarming channel to clarify your questions. link to channel is given below.
https://teams.microsoft.com/l/channel/19%3Ae8340fd5f1784ae186e8873be02b9053%40thread.tacv2/Autoscale%2C%20Activity%20Logs%20and%20Resource%20Logs?groupId=2fb9049b-bc9c-4cca-a900-84f22c86116c&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47
</div>

| Target Destination | Directions |
|:-------------------|:-----------|
| Log Analytics | Azure Log Analytics performs parsing of any data it receives as part of the ingestion process.  Update the Support Area Path (SAP) for your case to **Azure/Log Analytics/Query Execution and visualization/My query does not return any results** and then follow article [How-to: Check if Diagnostics data arrived in InMem](https://aka.ms/azmon/la/azurediagnostics).<br><br>Please try and check, if the customer's workspace is "OverQuota".[Validate Quota via ASC](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750256/How-to-Check-if-the-daily-cap-was-reached).[TSG for Quota Issues](https://dev.azure.com/SAZMM/Monitor/_wiki/wikis/Azure-Monitor-EEE/147/Managing-Data-Ingestion-Costs-with-Daily-Cap-in-Azure-Log-Analytics).In this case, no logs will be ingested in Log analytics workspace.</br> <br><br>In order for Log Analytics to trace what happened to the data sent to the ODS endpoint you will need to provide the following information: <ul><li>CorrelationId resulting from OBO sending the data to ODS.</li><li>WorkspaceId of the Log Analytics workspace.</li><li>Timestamp of when the transaction occurred.</li></ul>See article [How to get OnBehalfOf blob processing history for an Azure resource in Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-OnBehalfOf-blob-processing-history-for-an-Azure-resource-in-Kusto) to get the processing history of any given blob which includes the correlationId, workspaceId and the timestamp. |
| Storage | Please run the below query and use the column values from "customerBlobPath" column and ask customer to navigate to that file path. They should see a PT1M or PT1H.json file which they can open validate the existence of the log.-Collaborate with Azure Storage team (SAP = Azure\Blob Storage).
| Event Hub | Collaborate with Azure Event Hubs team (SAP = Azure/Event Hubs/Monitoring and Diagnostics/Not receiving diagnostics or Log data). |

</div>
</details>

</div>
</div>
</details>

</div>

## Getting Help
:::template /.templates/TSG-GettingHelp-DiagnosticSettings.md
:::

# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::
