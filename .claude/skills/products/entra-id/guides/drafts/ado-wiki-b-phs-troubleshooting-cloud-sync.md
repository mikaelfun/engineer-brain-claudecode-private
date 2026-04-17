---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Cloud Sync/Passsword Management/Password Hash Sync (PHS)/PHS troubleshooting in Cloud Sync"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD/pages?pagePath=/Sync%20Provisioning/Cloud%20Sync/Passsword%20Management/Password%20Hash%20Sync%20%28PHS%29/PHS%20troubleshooting%20in%20Cloud%20Sync"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD Synchronization
- cw.AAD Workflow
- cw.AzureAD
- cw.AAD Password
---

:::template /.templates/Shared/MBIInfo.md
:::   

:::template /.templates/Shared/compliance-notice.md
:::

[[_TOC_]]

--- 

# Introduction

Password-hash Sync issues in a Cloud Sync have a different troubleshooting than those related to Entra Connect.
Application event log does not contain any password operation for Cloud Sync, and you cannot enable verbose logging for PHS as you do in Entra Connect.

Cloud Sync has different SyncFabric job for the parallel operations it performs, such as PHS:
- AD2AADProvisioning (User, Group, Contact)
- AD2AADPasswordHash (PHS)
- AAD2ADExchangeHybridWriteback (Exchange Hybrid Writeback)
- AAD2ADGroupProvisioning (Group writeback)

By getting the AD2AADPasswordHash provisioning job, you will be able to check the password operations from Kusto Web UX like any other SyncFabric application.

# Objective

The objective to this article is to provide a comprehensive troubleshooting guide of PHS issues with Cloud Sync.

# Troubleshooting

## 1. Get the PHS run profile ID

1. Go to ASC, open Tenant Explorer and navigate to AAD Cloud Sync menu.

2. Choose the proper domain, there copy and save the Service Principal Identifier of the Cloud Sync application.

[IMAGE]

3. Then navigate to Graph Explorer tab and run the following query by setting the previously copied Service Principal Identifier

```
/servicePrincipals/<<ServicePrincipalID>>/synchronization/jobs
```

[IMAGE]

4. This will return all the provisioning jobs associated to that Cloud Sync enabled domain:

[IMAGE]

## 2. Check the logs in Kusto Web UX

1. Navigate to Kusto Web UX tab and open Kusto.

2. Connect to cluster "idsharedwus" and choose table "AADFSprod"

3. Use query. Change runProfileIdentifier and reportableIdentifier to the relevant ones

```
// CHECK EVENTS FOR USERS/GROUPS/ETC //
GlobalIfxAuditEvent
| where runProfileIdentifier == "AD2AADPasswordHash.744e522c465d4c96b3XXXXXXXXXXX.8e2fb274-b554-49e3-XXXXXXXXXXXXXXXXXX" // Job ID collected previously
| where env_time > ago(30d)
//| where reportableIdentifier == "Jose.Garcia@newsync.local" // on-premises UPN of the user 
//| where sourceAnchor == "bdf8237e-60bd-43be-XXXXXXXXXXXXXXXX"
| project env_time, correlationId, provisioningMode, reportableIdentifier , sourceAnchor, targetAnchor, eventName , description , ['details'], servicePrincipalDisplayName
```

4. You will find the password hash sync operations for the given user

| env_time                     | correlationId                           | provisioningMode | reportableIdentifier       | sourceAnchor                              | targetAnchor                              | eventName         | description                                                                                                   | details                                                                                                                                                                                                                      | servicePrincipalDisplayName |
|-----------------------------|----------------------------------------|-------------------|----------------------------|-------------------------------------------|-------------------------------------------|--------------------|----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| 10/28/2025, 8:12:16.1004173 AM | b780e980-ccb2-4207-9080-f8325eb0a041 |                   | Jose.Garcia@newsync.local | b36d377a-c4eb-4775-aa32-7678707b75f6     |                                           | EntryImportUpdate | Received ?-AF5CEBF5-81E9-4A85-9DA7-2277F1A6CBEF-? 'Jose.Garcia@newsync.local' change of type (Update) from Active Directory | ADD: {"PasswordHash":"'[Redacted]'","PasswordChangeDate":"2025-10-28T08:10:44.6918252Z","whenChanged":"20251028081044.0Z","userPrincipalName":"Jose.Garcia@newsync.local","originatingReplicaToken":"'[Redacted]'"} | newsync.local               |
| 10/28/2025, 8:12:16.5036963 AM | b780e980-ccb2-4207-9080-f8325eb0a041 |                   | Jose.Garcia@newsync.local | b36d377a-c4eb-4775-aa32-7678707b75f6     | a72a3a76-5d86-46d5-8e44-670c36ce5717     | EntryExportUpdate | User 'Jose.Garcia@newsync.local' was updated in Microsoft Entra ID                                           | ADD: {"ChangeDate":"2025-10-28T08:10:44.6918252Z","CredentialData":"'[Redacted]'"}                                                                                                  | newsync.local               |

