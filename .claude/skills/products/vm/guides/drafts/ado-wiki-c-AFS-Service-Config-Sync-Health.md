---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/How Tos/File Sync_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FHow%20Tos%2FFile%20Sync_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-Sync
- cw.How-To
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]

# HowTo

## View service configuration and sync health using Azure Support Center (ASC)

1.  Go to [Azure Support Center](https://azuresupportcenter.msftcloudes.com/caseoverview)
2.  Click Resource Explorer
3.  Click Resource Providers
4.  Expand **Microsoft.StorageSync** and select the appropriate Storage Sync Service<br>
    ![ASCSyncStatus.jpg](/.attachments/SME-Topics/Azure-Files-Sync/a3e8cc8f-9039-f241-fe2f-be68f8438451700px-ASCSyncStatus.jpg)

**Azure Support Center Overview (Jeff Patterson, Jawahar Ali)**

  - Skype Recording: [Introducing Azure Support Center for Azure File Sync - Tuesday, July 31, 2018](https://microsoft.sharepoint.com/teams/IaaSVMPODEMEA/Shared%20Documents1/Forms/AllItems.aspx?id=%2Fteams%2FIaaSVMPODEMEA%2FShared%20Documents1%2FBrownbag%20recordings%2FIntroducing%20Azure%20Support%20Center%20for%20AFS%28Azure%20File%20Sync%29%2Emp4&parent=%2Fteams%2FIaaSVMPODEMEA%2FShared%20Documents1%2FBrownbag%20recordings&p=true&slrid=3525829e-e03b-0000-a5ec-d71a33677e7b)

## View service configuration and sync progress using Geneva Logs

**Note**: Use Azure Support Center to view service configuration. If ASC is not available, the queries below can be used to understand the service configuration and sync progress.

| Name Space | Events                                | Provided Information                                                                                                                                                                                                                                                                                                                                                                        | Jarvis Query                                  |
| ---------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| KailaniSvc | CounterAFSBillingMeterInfo            | View server names, server IDs, storage sync services, and resource groups                                                                                                                                                                                                                                                                                                                   | <https://jarvis-west.dc.ad.msft.net/2950FE0B> |
| KailaniSvc | CounterAFSManagementEndpointInfo      | View sync group name, endpoint names (displayName) and types (endpointType � cloud vs server), and which server the server endpoints are on (maps to serverId, not friendly server name)                                                                                                                                                                                                    | <https://jarvis-west.dc.ad.msft.net/21310718> |
| KailaniSvc | AFSSyncFolderLevelMetrics             | View totalFileCount, totalByteCount, and totalDirectoryCount. ShareId maps to syncGroupUid in the CounterAFSManagementEndpointInfoTable (the query immediately above), which is tied to the sync group name. In other words, you can map the shareId to the sync group name, and from this, show how much data is stored in each sync group. This query also gives you storage account name | <https://jarvis-west.dc.ad.msft.net/76E7E79C> |
| KailaniSvc | ACounterAFSManagementSubscriptionInfo | View \# of server endpoints, \# of cloud endpoints, and \# of sync groups.                                                                                                                                                                                                                                                                                                                  | <https://jarvis-west.dc.ad.msft.net/5A329650> |
| KailaniSvc | ServerTelemetryEvents                 | View sync progress based on ServerEventID 9302, \# of items to be synced\#, \# of items have been synced sofar, PerItemErrorCount.                                                                                                                                                                                                                                                          | <https://jarvis-west.dc.ad.msft.net/9F0A1CDF> |

## Monitor progress of a current sync session using Geneva Logs

EventID 9302 indicates the state of the current sync session.

1.  Launch [Jarvis](https://jarvis-west.dc.ad.msft.net/34450D83)
2.  Look at the most recent ServerEventID 9302 in the ServerTelemetryEvents log.
3.  If you know the syncgroup name you can filter by it in the ClientQuery section.
    1.  For example, **where it.any("AFS\_Build\_SyncGroup")**
    2.  AFS\_Build\_SyncGroup is the customer's sync group name
4.  Expand EventDescription
    1.  TotalItemCount denotes how many files are to be synced,
    2.  AppliedItemCount the number of files that have been synced so far
    3.  PerItemErrorCount the number of files that are failing to sync.
    4.  SyncDirection indicates the direction of syncing, upload or download. There should be a row for each direction.<br>
        ![Jarvis EventID9302.jpg](/.attachments/SME-Topics/Azure-Files-Sync/5ebbd188-2623-05de-acad-e3ddc485f3dc800px-Jarvis_EventID9302.jpg)

Example Event ID 9302:

  - Replica Sync Progress.
  - ServerEndpointName: \<CI\>Re3lD/6oY3c=\</CI\>, SyncGroupName: \<CI\>gUNJXpuOy7Y=\</CI\>, ReplicaName: \<CI\>w90mnLsjy/E=\</CI\>, SyncDirection: Upload, CorrelationId: {AB4BA07D-5B5C-461D-AAE6-4ED724762B65}.
  - AppliedItemCount: 172473, TotalItemCount: 624196.
  - AppliedBytes: 51473711577, TotalBytes: 293363829906.
  - AreTotalCountsFinal: true.
  - PerItemErrorCount: 1006.

## Look up for sync errors using Geneva Logs

1.  Launch [Jarvis](https://jarvis-west.dc.ad.msft.net/D17114CA) and change the subscription & time accordingly
2.  Check the HResult under Aggregates area and copy the error code with the most count as this is the most likely reason why sync is not completed<br>
    ![7a93032a-2fd2-8610-00fc-f61addefa621600px-Jarvis_HResult.jpg](/.attachments/SME-Topics/Azure-Files-Sync/7a93032a-2fd2-8610-00fc-f61addefa621600px-Jarvis_HResult.jpg)
4.  Go to <http://errors> and paste the error copied from step above to look up the error

::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md
:::

