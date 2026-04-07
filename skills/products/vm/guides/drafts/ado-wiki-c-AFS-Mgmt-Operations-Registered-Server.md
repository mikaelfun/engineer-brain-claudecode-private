---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/How Tos/How To Find AFS Mgmt Operations On Registered Server_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FHow%20Tos%2FHow%20To%20Find%20AFS%20Mgmt%20Operations%20On%20Registered%20Server_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.Azure-Files-Sync

- cw.How-To

- cw.Reviewed-04-2025

---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::




[[_TOC_]]



# Scenario

Customers report a missing registered server in their sync group. Follow these steps to identify what operations were performed on the registered server, when the server was registered, if it was unregistered earlier, and when.



# Troubleshooting



## Step 1: Find the Registered Server ID



### Using PowerShell



```powershell

Get-AzStorageSyncServerEndpoint -ResourceGroupName "Enter_resourcegroup_name" -StorageSyncServiceName "Enter_syncservice_name" -SyncGroupName "Enter_syncgroup_name"

```



Sample output:  

![HowTo-AFSMgmtWorkflow1.png](/.attachments/SME-Topics/Azure-Files-Sync/HowTo-AFSMgmtWorkflow1_New.png)



### Registered Server Event Logs



1. Log in to the registered server and open **Event Viewer**.

2. Navigate to **Application and Services Logs** > **Microsoft** > **FileSync** > **Management** > **Operational**.



   ![HowTo-AFSMgmtWorkflow2.png](/.attachments/SME-Topics/Azure-Files-Sync/HowTo-AFSMgmtWorkflow2_New.png =230x300)



3. Search for Event **1001** or **5208**, as these events include the ServerId.  



   **Event 1001**  

   ![HowTo-AFSMgmtWorkflow3.png](/.attachments/SME-Topics/Azure-Files-Sync/HowTo-AFSMgmtWorkflow3_New.png =430x220)  



   **Event 5208**  

   ![HowTo-AFSMgmtWorkflow4.png](/.attachments/SME-Topics/Azure-Files-Sync/HowTo-AFSMgmtWorkflow4_New.png =430x220)



## Step 2: Check Management Operations in Kusto



Use the ServerID obtained in Step 1.



- The `taskState` column indicates the status of the operation.  

- The `context` column provides information about the registered server.



```k

cluster("xfiles.westcentralus").database("xsynctelemetrysf").AFSManagementWorkflowsInfo

| where subscriptionId =~ "Enter_SubscriptionID_Here" // Enter subscription ID here

| where context contains "Enter_ServerID_Here" // Enter server ID here

| where taskState in ("TaskSucceeded")

| project TIMESTAMP, workflowCommand, context, taskState, TaskName, taskResult

```



| Column                          | Description                                     |

|---------------------------------|-------------------------------------------------|

| ICreateRegisteredServerWorkflow | Indicates the server registration was initiated.|

| ICreateServerEndpointWorkflow3  | Indicates creation of a server endpoint.        |

| IDeleteServerEndpointWorkflow3  | Indicates server endpoint deletion.             |

| IUnregisterServerWorkflow2      | Indicates server unregister operation.          |



### Sample Kusto Logs



| TIMESTAMP                   | Workflow Command                  | Context                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Task State    | Task Name                             | Task Result   |

|-----------------------------|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|----------------------------------------|---------------|

| 2024-11-08 09:18:00.6579977 | ICreateRegisteredServerWorkflow   | SubscriptionId=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  ResourceGroupName=sjrg  StorageSyncServiceName=sjtestsyncsvc  StorageSyncServiceUid=bea68f04-xxxx-xxxx-xxxx-xxxxxxxxxxxx  Name=2a414bbf-xxxx-xxxx-xxxx-xxxxxxxxxxxx  FriendlyName=abc.xyz.tld  ServerId=2a414bbf-xxxx-xxxx-xxxx-xxxxxxxxxxxx  ServerRole=Standalone  ClusterId=00000000-0000-0000-0000-000000000000  ClusterName=  AgentVersion=19.1.0.0  ServerOSVersion=10.0.17763.0  Thumbprint=7E85B35721B83A5619EC1145879FD78C0287523C               | TaskSucceeded | CounterAFSManagementScheduledTaskInfo | TaskSucceeded |

| 2024-11-08 09:23:02.1350778 | ICreateServerEndpointWorkflow3    | SubscriptionId=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  ResourceGroupName=sjrg  StorageSyncServiceName=sjtestsyncsvc  StorageSyncServiceUid=bea68f04-xxxx-xxxx-xxxx-xxxxxxxxxxxx  SyncGroupName=sjsyncgrp1  AllowMultipleEndpointsPerServer=False  ServerJobScopeId=  SyncUris=https://sjtestsyncsvcsyncp.centralindia.afs.azure.net/  Name=c6430925-24e7-4e74-b14f-0e84d7f5acf1  FriendlyName=abc.xyz.tld  ServerId=2a414bbf-xxxx-xxxx-xxxx-xxxxxxxxxxxx  ServerLocalPath=E:\SyncDir1  CloudTiering=On  VolumeFreeSpacePercent=90  InitialDownloadPolicy=NamespaceOnly  LocalCacheMode=UpdateLocallyCachedFiles  InitialUploadPolicy=Merge | TaskSucceeded | CounterAFSManagementScheduledTaskInfo | TaskSucceeded |

| 2024-11-27 03:20:44.0556076 | IUnregisterServerWorkflow2        | SubscriptionId=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  ResourceGroupName=sjrg  StorageSyncServiceName=sjtestsyncsvc  StorageSyncServiceUid=bea68f04-xxxx-xxxx-xxxx-xxxxxxxxxxxx  Name=2a414bbf-xxxx-xxxx-xxxx-xxxxxxxxxxxx  FriendlyName=  ServerId=2a414bbf-xxxx-xxxx-xxxx-xxxxxxxxxxxx  ServerRole=Standalone  ClusterId=00000000-0000-0000-0000-000000000000  ClusterName=  AgentVersion=  ServerOSVersion= | TaskSucceeded | CounterAFSManagementScheduledTaskInfo | TaskSucceeded |



# Additional resources

We can also identify AFS management operations using AFS Dashboard.



Dashboard link: [AFS Dashboard](https://portal.microsoftgeneva.com/dashboard/XEEE-Dashboards/FileSync)



Please start by entering the Subscription Id and then selecting appropriate fields from all the available dropdowns in the Parameters section.



We currently have 4 dashboards available:



| Dashboard | Description |

|-----------|-------------|

| [Tiering and Recall](https://jarvis-west.dc.ad.msft.net/dashboard/XEEE-Dashboards/FileSync/Tiering%2520and%2520Recall?overrides=[{%22query%22:%22//*[id=%27SubscriptionId%27]%22,%22key%22:%22value%22,%22replacement%22:%22a5b09723-7758-4de6-a1f7-a087567037b8%22},{%22query%22:%22//*[id=%27SyncServiceName%27]%22,%22key%22:%22value%22,%22replacement%22:%22sync-prod-eastus%22},{%22query%22:%22//*[id=%27SyncGroupName%27]%22,%22key%22:%22value%22,%22replacement%22:%22noram-prod-shares%22},{%22query%22:%22//*[id=%27ServerEndpoint%27]%22,%22key%22:%22value%22,%22replacement%22:%22chssrvafs01p.mcjunkinredman.com%22},{%22query%22:%22//*[id=%27Volume%27]%22,%22key%22:%22value%22,%22replacement%22:%22f%22}]%20) | Used for Sync Tiering and Recall scenarios when Cloud Tiering is On. |

| [Sync Progress & Performance](https://jarvis-west.dc.ad.msft.net/dashboard/XEEE-Dashboards/FileSync/Sync%2520Progress%2520%2526%2520Performance?overrides=[{%22query%22:%22//*[id=%27SubscriptionId%27]%22,%22key%22:%22value%22,%22replacement%22:%22a5b09723-7758-4de6-a1f7-a087567037b8%22},{%22query%22:%22//*[id=%27SyncServiceName%27]%22,%22key%22:%22value%22,%22replacement%22:%22sync-prod-eastus%22},{%22query%22:%22//*[id=%27SyncGroupName%27]%22,%22key%22:%22value%22,%22replacement%22:%22noram-prod-shares-3%22},{%22query%22:%22//*[id=%27ServerEndpoint%27]%22,%22key%22:%22value%22,%22replacement%22:%22chssrvafs01p.mcjunkinredman.com%22},{%22query%22:%22//*[id=%27SyncDirection%27]%22,%22key%22:%22value%22,%22replacement%22:%22Upload%22}]%20) | Used for tracking Sync Progress - both Upload and Download scenarios from SEP as well as Cloud-side Enumeration. |

| [Server Agent Health](https://jarvis-west.dc.ad.msft.net/dashboard?overrides=[{%22query%22:%22//*[id=%27SubscriptionId%27]%22,%22key%22:%22value%22,%22replacement%22:%22a5b09723-7758-4de6-a1f7-a087567037b8%22},{%22query%22:%22//*[id=%27ServerEndpoint%27]%22,%22key%22:%22value%22,%22replacement%22:%22chssrvafs02p.mcjunkinredman.com%22}]%20) | Used for viewing Agent and Filter details on SEP. |

| [AFS Management](https://jarvis-west.dc.ad.msft.net/dashboard/XEEE-Dashboards/FileSync/AFS%2520Management?overrides=[{%22query%22:%22//*[id=%27SubscriptionId%27]%22,%22key%22:%22value%22,%22replacement%22:%22a5b09723-7758-4de6-a1f7-a087567037b8%22}]%20) | Used for viewing AFS Management operations. |



To learn more, please refer [Access-to-File-Sync-Dashboards_Storage](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495815/Access-to-File-Sync-Dashboards_Storage)





**Contributor**:

   ssamadder@microsoft.com



::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md

:::


