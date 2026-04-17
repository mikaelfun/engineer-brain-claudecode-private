---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Data export/Log Analytics workspace Data Export  - Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FData%20export%2FLog%20Analytics%20workspace%20Data%20Export%20%20-%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::


[[_TOC_]]

  <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
   
   **Note**

Please select the right feature area if you are advised to escalate to product group depending on the troubleshooting steps, there are 2 feature area for data export configuration and another for data export ingestion.  
   </div>

# Where to find the documentation for Log Analytics workspace data export in Azure Monitor Docs
---
[Log Analytics workspace data export in Azure Monitor](https://learn.microsoft.com/azure/azure-monitor/logs/logs-data-export?tabs=portal)



#Where can I find the limitations for this feature.
--- 
Limitations are [documented here](https://learn.microsoft.com//azure/azure-monitor/logs/logs-data-export?tabs=portal#limitations)



#Data export behaviour when transformation is defined in workspace
---
In a workspace, setting up transformations on online tables allows for the filtering and modification of the data structure within those tables. When data export is initiated from a table that has undergone workspace transformation, the transformation is preserved during the export process. As a result, the data exported to a storage account or an Event Hub (EH) is consistent with the transformed data present in the workspace. 

To summarize, transformations defined in the workspace are processed prior to the export of data. Any transformations you implement will be reflected not only within the workspace but also in the subsequent data export, ensuring consistency in the data stored during the post-go-live (PG) testing phase. 

#TimeGenerated on Data Export
---
TimeGenerated column can sometimes be adjusted on LA pipeline because its value cannot be older than 2 days before received time or more than a day in the future, as documented [here](https://learn.microsoft.com/azure/azure-monitor/logs/log-standard-columns#timegenerated). However, **these adjustments are not reflected on data that gets exported**.

This can cause discrepancies when comparing exported data and data present on the workspace.

More information on this and how to workaround it can be found in this wiki article - [TimeGenerated adjustments on Data Export](/Log-Analytics/Common-Concepts/Ingestion-Pipeline/TimeGenerated-adjustments-on-Data-Export).

#Data is not exported for unsupported tables
---
When an unsupported table is included in a data export rule, the configuration process may complete successfully; however, the export of data for that specific table will not occur. Should the status of the table change to supported at a later date, data export will commence accordingly. This can be found stated in the documentation [here](https://learn.microsoft.com//azure/azure-monitor/logs/logs-data-export?tabs=portal#unsupported-tables)

To verify the compatibility of a table with the export feature, consult the list of unsupported tables [here](https://learn.microsoft.com//azure/azure-monitor/platform/logs-data-export?tabs=portal#supported-tables). It is essential to **ensure that the table in question is not under the unsupported list before proceeding with the data export troubleshooting**.
Unsupported tables are currently limited to those [specified in the link](https://learn.microsoft.com//azure/azure-monitor/platform/logs-data-export?tabs=portal#supported-tables). 



#Customer is seeing error "Table does not exist in the workspace"
---
If the data export rule includes a table that doesn't exist, it will fail with the error "Table does not exist in the workspace".



#How to view Data Export rule configuration in ASC
---
In ASC, on the main workspace view, theres a table with all the data export rules that are configured for the workspace, 
For example:
![DataExport1.png](/.attachments/DataExport1-75724854-3516-418c-aef6-5ffe270b5d40.png)


**Customer can use following command to view all data export rules in a workspace using CLI.**

- az monitor log-analytics workspace data-export list --resource-group _resourceGroupName_ --workspace-name _workspaceName_

Documentation on this can be found [here](https://learn.microsoft.com/cli/azure/monitor/log-analytics/workspace/data-export?view=azure-cli-latest).



#How to disable an export rule
---
Export rules can be disabled to let you stop the export when you dont need to retain data for a certain period such as when testing is being performed. Besides the toggle option on the portal UI to enable/disable a data export rule. customers can use the following command to disable a data export rule using CLI.

- az monitor log-analytics workspace data-export update --resource-group _resourceGroupName_ --workspace-name _workspaceName_ --name _ruleName_ --enable false

Documentation on this can be found [here](https://learn.microsoft.com/cli/azure/monitor/log-analytics/workspace/data-export?view=azure-cli-latest).



#How to delete an export rule 
---
Besides the portal UI, customers can rely on the following command to delete a data export rule using CLI.

- az monitor log-analytics workspace data-export delete --resource-group _resourceGroupName_ --workspace-name _workspaceName_ --name _ruleName_

Documentation on this can be found [here](https://learn.microsoft.com/cli/azure/monitor/log-analytics/workspace/data-export?view=azure-cli-latest#az-monitor-log-analytics-workspace-data-export-delete).



#Does data export try to resend if the destination is not available?
---
In instances where the export destination is not accessible, the data export process will automatically attempt to resend data for a duration of up to 12 hours. If the destination remains unreachable after this period, the export process will halt, and any unsent data will be discarded until the destination is accessible again. It is the responsibility of the customer to periodically verify the availability of the export destination.



 #Troubleshooting Scenarios
---

## Before you start troubleshooting:
Make sure the customer has correctly enabled data export (click each item for more details)
- [ ] [Register resource provider](https://learn.microsoft.com/azure/azure-monitor/logs/logs-data-export?tabs=portal#register-the-resource-provider)
- [ ] [Allow trusted Microsoft services](https://learn.microsoft.com//azure/azure-monitor/logs/logs-data-export?tabs=portal#allow-trusted-microsoft-services)
- [ ] [Create one or more data export rules that define the tables to export and their destination](https://learn.microsoft.com/azure/azure-monitor/logs/logs-data-export?tabs=portal#create-or-update-a-data-export-rule)
- [ ] **It is recommended to follow the Troubleshooter in ASC**

Once a case is created under support topic "Log Analytics\Log Analytics workspace management\Log Analytics data export to Storage Account or Event Hub" a **Troubleshooter** will be triggered for assistance debug. 

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

Make sure you have access to the relevant Kusto clusters before you start troubleshooting: [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer)
</div>



##**Scenario 1:** Error Setting Up Data Export with PowerShell/Azure CLI

**Issue Description**: 
The customer encounters errors while setting up Data Export using PowerShell or Azure CLI. 

**Resolution Steps**: 
1. Verify the specific error message or issue the customer is experiencing. 
2. Try to repro the issue on your lab environment.
3. If the issue persists, reach out to a LA SME/raise an Incident Creation and Management (IcM) using the Azure Support Center (ASC). 
4. In ASC, select the 'Azure Log Analytics - Core' template. 
5. Choose 'Data Export - Configuration' as the feature area for the IcM. 


##**Scenario 2:** Issues with Data Export to Destinations
**Issue Description:**
The customer has successfully set up export for **supported** tables, but the data is not exporting to the designated destinations.

Make sure that you collect the following information from customer:
1. Confirm that the export setup was successful, ensuring Scenario 1 issues are not present. 
2. Obtain the Workspace ID, location, and names of the tables where the export is failing.
3. Request the Resource ID of the destination storage account or event hub.
4. Determine the timeframe during which the data export issue was observed.
5. Confirm that the data not being exported is present in the workspace. If some records are visible in the workspace but not in the export destinations, request sample records (including all columns) for further analysis.



<details closed>

**<summary>Step 1: Data availability in LA workspace</summary>**

Verify that the data is indeed available to be exported in LA workspace by running the query in ASC for the relevant table:

![kusto.jpg](/.attachments/kusto-26fd4dd3-601c-4630-9902-dd824ff3cb0d.jpg)

</details>



<details closed>

**<summary>Step 2: Verification of table support </summary>**

Confirm that the table you are working with is included in the [list of supported tables](https://learn.microsoft.com//azure/azure-monitor/platform/logs-data-export?tabs=portal#supported-tables). The current selection of supported tables is limited to those detailed in the provided link. Data export will proceed for all data in the table unless specific limitations are noted.

Once you have confirmed the table's support status and any applicable limitations, please proceed with the subsequent instructions. Have in mind that the IcM path might differ on each of the steps.

**Important note:** Should you encounter difficulties in following any of the subsequent steps, it is essential to contact your Technical Advisor (TA) or Subject Matter Experts (SMEs) in Log Analytics for further guidance.

</details>



<details closed>

**<summary>Step 3: AMS Setup </summary>**

Find if workspace is enabled for data export using the below query:

:::template /.templates/Launch-Kusto-Single-Indent.md
:::
   ```
cluster("oibeftprdflwr").database("AMSTelemetry").WorkspaceSnapshot
| where SnapshotTimestamp > ago(6h)
| where WorkspaceId == "00000000-0000-0000-0000-000000000000"
| distinct ExportData
   ```

Output example of a workspace with 3 data export rules enabled:
![image.png](/.attachments/image-93962251-1bbb-4448-94f6-12dd6490bcca.png)

Verify that the workspace has the export rules configured correctly. Enable must be true for the destination customer is mentioning that no data is being exported to - "enabled": "1".

Is either of these are set to False?

<details closed>
<summary>Yes </summary>

Double check that on customer portal the same data export rule is showing as enabled. Have in mind that the above query output is from a workspace snapshot and that **recent changes might only be reflected on the next snapshot**. 
If this is confirmed, perform an [ARM sync](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750204/How-To-Synchronize-ARM-subscription-resources-(individual-providers)) and validate if it sorts any effect. If it doesn't, create a swarming post on [Log Analytics swarming channel](https://teams.microsoft.com/l/channel/19%3Acdcfaced2e9a4739b3786b8af3ba22f9%40thread.tacv2/Log%20Analytics?groupId=2fb9049b-bc9c-4cca-a900-84f22c86116c&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) and/or reach out to your TA/PTA.

</details>
<details closed>
<summary>No</summary>
Go to Step 4, Geneva GDS processing.
</details>
<br>

</details>



<details closed>

**<summary>Step 4: Geneva GDS Processing</summary>**

Find the list of **InputType** for the table set up for export for the region. (Replace OutputType ==  in below query with the correct event name)

Jarvis query link: https://portal.microsoftgeneva.com/s/A342DE90

![image.png](/.attachments/image-ac7b70cb-e0e3-4e2c-8609-3ee7d4a7aeb1.png)

From [PartnerOnboardingDoc](https://msazure.visualstudio.com/One/_git/EngSys-MDA-Pipeline-Delivery?path=/src/Delivery/PartnerOnboarding.md&_a=preview), find the Geneva GDS cluster which is processing data for that region. In most of the cases the GDS cluster should be found under **"GDS Production deployment"** - check the other lists if in your case traffic flows from Fairfax or Mooncake. 
For example, australiaeast traffic is processed by DeliveryAusEc2 cluster:

![image.png](/.attachments/image-3f2f1215-eec0-410c-a678-201f3944ee12.png)

Use this to filter the [OBO Events dashboard](https://portal.microsoftgeneva.com/s/A536A5E0) by using the EventName filter and the "ScaleUnit" filter. 
- Remove the underscores from the InputType field when you fill in the EventName. 
- The "ScaleUnit" name would be the GDS cluster you got from the [PartnerOnboardingDoc](https://msazure.visualstudio.com/One/_git/EngSys-MDA-Pipeline-Delivery?path=/src/Delivery/PartnerOnboarding.md&_a=preview). 

![image.png](/.attachments/image-27c34431-5913-4f83-b265-c35bb6e69a81.png)


Do you see any significant drop?

<details closed>
<summary>No </summary>

If you do not see a significant drop, continue to [Scenario 4](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1507320/DRAFT-review-data-export-TSG?anchor=**scenario-4%3A**-if-customer-complains-that-data-export-to-eventhub-stopped-working-and-they-didn%27t-make-any-changes-to-data-export-rule) of this TSG, and the subsequent section of [How to check if the data is exported to Event Hub or Storage](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1507320/DRAFT-review-data-export-TSG?anchor=how-to-check-if-the-data-is-exported-to-event-hub-or-storage).

</details>
<details closed>
<summary>Yes</summary>
If you see no entries or a significant drop, go to Step 5: ODS Processing.
</details>
<br>

</details>



<details closed>

**<summary>Step 5: ODS Processing</summary>**

Confirm that the data type under question is being processed by the NorthStar Pipeline. 

**Investigation steps:** 

- Figure out which pipeline is processing data for this customer and data type by using [ODS query](https://jarvis-west.dc.ad.msft.net/6533EF0B) 
  - Adjust time range for the relevant period.
  - Update Environment - [HT: Find the abbreviations of Azure regions (Environment) for Kusto or Jarvis](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750200/HT-Find-the-abbreviations-of-Azure-regions-(Environment)-for-Kusto-or-Jarvis)
  - Update the workspace ID.
  - Update DataType - to determine it, follow the steps on [this wiki article](/Log-Analytics/How%2DTo-Guides/Ingestion/HT:-Find-the-data-type-corresponding-to-a-specific-table-name).

![image.png](/.attachments/image-9a5b0b05-02e2-4dde-a99f-e37ba9b69277.png)


<details closed>

<summary>If NorthStarPipelineProcessingFlag has "Process" has value</summary>
 
North star pipeline is processing it, continue to Step 6: GIG Processing.

</details>
<details closed>

<summary>If LegacyPipelineProcessingFlag has "Process" has value</summary>

Legacy pipeline is processing and is not supported for data export, please raise an IcM by using Azure Support Center (ASC) and using the 'Azure Log Analytics - Core' template and selecting 'Data Export - Ingestion' as the feature area.

</details>
<br>
</details>



<details closed>

**<summary>Step 6: GIG Processing</summary>**


Go to appropriate [GIG dashboard](https://jarvis-west.dc.ad.msft.net/dashboard/GenevaLAIngestion/Aggregator/QoS/TenantDrilldown?overrides=%5B%7B%22query%22%3A%22%2F%2F*%5Bid%3D%27Environment%27%5D%22%2C%22key%22%3A%22value%22%2C%22replacement%22%3A%22prod%22%7D%2C%7B%22query%22%3A%22%2F%2F*%5Bid%3D%27Tenant%27%5D%22%2C%22key%22%3A%22value%22%2C%22replacement%22%3A%22East-US-2-EUAP-0%22%7D%5D%20)and verify that GIG aggregator is producing the blobs for the datatype in question:

- Select the all the "Tenant" regions that are the same as the workspace.
- Choose the "Event" with your data type.
- For "TenantOrigins" there are two possible options to select:
  - Choose "DCR" if the data being exported is coming from a DCR source (for example: AMA or Logs Ingestion API).
  - Choose "LA" if the data being exported is coming from a Diagnostic Setting or other source different than DCR.
- Find the "Blob Count" and analyse if there are blobs for the selected tenants.

![image.png](/.attachments/image-4a594847-30e4-4e8a-b79e-da0775975b73.png)

Do you see the blob count drops for the tenant region?

<details closed>
<summary>Yes </summary>
Go to Step 7.
</details>
<details closed>
<summary>No</summary>
Please raise an IcM by using Azure Support Center (ASC): use the 'Azure Log Analytics - Core' template and then select 'Data Export - Ingestion' as the feature area.
</details>
<br>
</details>


<details closed>

**<summary>Step 7: GT Processing</summary>**

Confirm that GT is producing blobs for the data type in [dashboard](https://jarvis-west.dc.ad.msft.net/dashboard/GenevaLATransform/Overview?overrides=[{%22query%22:%22//*[id=%27Environment%27]%22,%22key%22:%22value%22,%22replacement%22:%22prod%22},{%22query%22:%22//*[id=%27Tenant%27]%22,%22key%22:%22value%22,%22replacement%22:%22Australia-Central-0%22},{%22query%22:%22//*[id=%27Role%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id=%27Service%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22}]%20). 

- Choose the same "TenantRegion" as the workspace's region.
- For "Tenant", select all belonging to the same workspace region.
- Find the "Rows Processed by Dataype" dashboard and click on its cogwheel.
- Filter by the DataType on its options, as per the screenshot below:

![image.png](/.attachments/image-884ec803-05cb-4e94-b2b7-111bc56a5c5f.png)

If you don't see that GT is producing blobs for the data type, please raise an IcM by using Azure Support Center (ASC): use the 'Azure Log Analytics - Core' template and then select 'Data Export - Ingestion' as the feature area.

</details>

##**Scenario 3:** If customer complains that **some records/columns** are present in LA workspace but either missing or are duplicated in export destinations (storage, EventHub)  

**_NOTE_** - Log Analytics Data Export sends data in **batches**.  If you are seeing a different number of records reported by Event Hub compared to records in the workspace, it is probably because multiple records are being sent in each batch to reduce overhead.

The following TSG will walk you through verifying that all records from LA arrived in EH:
[Did all my LA data make it to Event Hub using Data Export?](/Log-Analytics/Troubleshooting-Guides/Data-export/Did-all-my-LA-data-make-it-to-Event-Hub-using-Data-Export?)


1. Confirm that you do not see any significant drop in the Geneva GDS dashboard described above. 

2. Ask customer for some sample records (all columns) that are missing. Once you have those records, discuss with your SME/PTA and raise an IcM by using Azure Support Center (ASC): 'Azure Log Analytics - Core' template and then select 'Data Export - Ingestion' as the feature area.



##**Scenario 4:** If customer complains that data export to EventHub stopped working and they didn't make any changes to Data Export rule.

Sometimes product team can block the workspace if the EventHub is not correctly configured and is causing severe backlog in our service and impacting other customers as well. You can verify if workspace is blocked using below steps. 

1) Open the respective file depending on public or Sovereign cloud 
[**For Public Cloud**](https://msazure.visualstudio.com/One/_git/EngSys-MDA-OBO?path=/src/ServiceGroupRoot/Tenants/Tenants-Prod.json&_a=contents&version=GBdev)
[**For FairFax:**](https://msazure.visualstudio.com/One/_git/EngSys-MDA-OBO?path=/src/ServiceGroupRoot/Tenants/Tenants-FAIRFAX.json&version=GBdev)
[**For `Mooncake**](https://msazure.visualstudio.com/One/_git/EngSys-MDA-OBO?path=/src/ServiceGroupRoot/Tenants/Tenants-MOONCAKE.json&version=GBdev
) 
[**For BlackForest**](https://msazure.visualstudio.com/One/_git/EngSys-MDA-OBO?path=/src/ServiceGroupRoot/Tenants/Tenants-BLACKFOREST.json&version=GBdev)
2) Search this file by LA workspaceID and see if it's part of a config called _'Blocked.FirstTags'_
3) If present, it means the LA workspaceID is blocklisted.  Please reach out to a LA SME/raise an IcM to **_ICM = Azure Monitor Essentials  Sev3 CRI - Diagnostic Logs on-call._**
 

#How to check if the data is exported to Event Hub or Storage

You can use the following query to determine if the data is in event hub or Storage. 

```
VERY IMPORTANT : In both of the cases below, you are required to get the blob path of the missing record. Without that, you cannot pin-point the error.
After you obtain the blob paths, run the queries respectively and it should very clear if the export successfull or not. Use "IsFAILED" Column.

If you still have questions, please use this channel [Autoscale, Activity Logs and Resource Logs | AzMon POD Swarming | Microsoft Teams](https://teams.microsoft.com/l/channel/19%3Ae8340fd5f1784ae186e8873be02b9053%40thread.tacv2/Autoscale%2C%20Activity%20Logs%20and%20Resource%20Logs?groupId=2fb9049b-bc9c-4cca-a900-84f22c86116c&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

No ICM's should be created to Azure monitor essentials/diagnostic settings queue without following the steps outlined and unless there is an issue with service.
```

## Export to Storage
Execute in [Web](https://dataexplorer.azure.com/clusters/azureinsights/databases/Insights?query=H4sIAAAAAAAAA2WQQUvDQBCF7%2F6KISeF4OLdFtIaS6C0oQmox81mmq5tdpeZSUtA%2FO0maFvF08C89zFvXiGedIOJMb5zkoSArp4dvNmXeMAWhfqbDzjtkBByQmMZS9tiIboNMAXd%2BNuH3d3FwkhHazCr0YmVHiYTiJbrRbJKlm9lNi%2FyLE%2BX2SqdJUX6lL7m600ZXeCtJZZck%2FRDgCrXsgPjnWjrGCB6nEaglHWhE6gGHcJguLCE7DsaL8PkEyLFXcWGbBDrHauiq7JanT0N%2BS6w2iycblEF8kdbI7FqrSHPfiv3PiDpEdWH4bhtdsLq5GnPQRtk9VKM5Bh8gN%2FRyL9qYjAdi2%2BRij%2F9rgbuqs2%2Fv0P6WWvBxlMfg%2BVnbQ9Yx7AdZke4Qc3eXclzQfGvx78ALnYEdsoBAAA%3D) [cluster('azureinsights.kusto.windows.net').database('Insights')]
```
StorageAccountAppendBlockTelemetry
| where PreciseTimeStamp > ago(1h)
| where serviceIdentity == "LOGANALYTICSPIPELINEBASEDEXPORT"
| where firstPartyBlobPath contains "<>" //input blob path
| where resourceId =~ "/subscriptions/SubId/resourcegroups/RGname/providers/microsoft.operationalinsights/workspaces/WSname"
| project PreciseTimeStamp, customerStorageAccountName, customerContainerName, category, isFailed, failureReason, customerBlobPath, resourceId
```
Details of the projected properties:
- PreciseTimeStamp: Timestamp of the record being sent by OBO to the destination.
- customerStorageAccountName: Destination Storage Account name.
- customerContainerName: Destination Blob name of the storage account.
- category: Type of data exported.
- customerBlobPath: Exact blob path of where the data is written in the storage account's blob.
- resourceId: LA workspace ID where the data is coming from.

## Export to EventHub
Execute in [Web](https://dataexplorer.azure.com/clusters/azureinsights/databases/Insights?query=H4sIAAAAAAAAAz3OzUoDMRSG4b1XEbpqRQxeQIWphhqYtkMTUFeSyRxngs0P5yRTR7x4Owu7f5%2BPT4wQ8ktpFYRuY7IdNJzAQ8aJ3fyy8wAIrEGwjkA7Dyobn9gjM31cPgyra0KAo7Mgu8uayxNbr9miPmyrfVW%2Fa%2FmkGtmIWu7FplLiWbw1h6NeXDECxYKzZjaGbFwgtuBUWrLoUnYxEFellR3%2FL3uMJRE%2FboPxwBPG0XWAxL2zGCl%2B5vuYAM1Mzeky5%2FohEz9H%2FKJkLBB%2FVbOcL1Dx3qD7AWaw%2F%2FDme6nlTihd7Zq72xVrJ2ZNhj7i9AfFWmYdKwEAAA%3D%3D) [cluster('azureinsights.kusto.windows.net').database('Insights')]
```
EventHubSendBatchTelemetry 
| where PreciseTimeStamp > ago(1h)
| where serviceIdentity == "LOGANALYTICSPIPELINEBASEDEXPORT"
| where resourceId contains "/subscriptions/SubId/resourcegroups/RGname/providers/microsoft.operationalinsights/workspaces/WSname"
| where firstPartyBlobPath contains  "<>" //input blob path
| project PreciseTimeStamp, eventHubNamespace, eventHubName, category, isFailed, failureReason, resourceId
```

Details of the projected properties:
- PreciseTimeStamp: Timestamp of the record being sent by OBO to the destination.
- eventHubNamespace: Destination Event Hub resource name.
- eventHubName: Destination event hub.
- category: Type of data exported.
- resourceId: LA workspace ID where the data is coming from.


**If there are any failures reported in the "failureReason" column, please refer below for next steps:**
- If failureReason equals "UnauthorizedAccess" - Customer needs to provide permissions on the EventHub for the azure monitor service. Here are the instructions on how to perform this - [Destination Limitations](https://learn.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings?tabs=portal#destination-limitations)
- If failureReason contains "Throttling" - Customers need to increase their available TU's in their EventHub. Raise a collaboration with the EventHub team to estimate the amount of TU's required.
- If there are no failures reported , raise a collab with EventHub team to help further investigating why the logs are not available in EH.

##**Scenario 5:** If customer complains that Data exported by Data export rule being larger than the data as it is stored in LA workspace.

When comparing the size reported by LA to what appears in the storage account, youll notice substantial differences.
Data exported being larger than the data as it is stored in LA workspace.

[Known Issue-Data exported by Data export rule being larger than the data as it is stored in LA workspace](https://supportability.visualstudio.com/AzureMonitor/_workitems/edit/145202)

##**Scenario 6:** If you encounter "StorageException" error message while investigating export to Storage.


This may be related to the immutable policy configured on the destination storage account. Please make sure to review the known issue below.

[Known Issue 10952 PT1H.json files with 0 bytes written to Azure Storage blobs by diagnostic settings : This operation is not permitted as the blob...](https://supportability.visualstudio.com/AzureMonitor/_workitems/edit/10952)

---
#Increasing Azure Storage Account destination limits
When there is a need to increase the ingress limit of the destination Azure Storage Account, a collab\case should be opened to the Subscription team (not to the Storage team), as this is a limit of the destination entity rather then Log Analytics. This can be considered as part of Data Export Support Boundaries.
The right SAP to open a collab\have a case on with such a request is:
![image.png](/.attachments/image-bdb91312-8385-42f3-ad7e-8c7255ffe022.png)
Customer facing information can be found here: [Monitor destinations](https://learn.microsoft.com//azure/azure-monitor/logs/logs-data-export?tabs=portal#monitor-destinations)