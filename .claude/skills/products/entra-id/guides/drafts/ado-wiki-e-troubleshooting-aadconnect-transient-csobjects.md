---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Object sync/Troubleshooting AADConnect Transient CSObjects"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FObject%20sync%2FTroubleshooting%20AADConnect%20Transient%20CSObjects"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Synchronization
- cw.AAD-Sync
- cw.AAD-Connect
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

<style type="text/css">
<!--
 .tab { margin-left: 40px; }
-->
</style>

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Synchronization](/Tags/AAD%2DSynchronization) [AAD-Sync](/Tags/AAD%2DSync) [AAD-Connect](/Tags/AAD%2DConnect) 

[[_TOC_]]

# What are transients?

Transient objects are created during the import process from a connected directory to the connector space. During the import process the sync engine first tries to locate a representation of the object in the connector space. It examines all staging objects and tries to find a corresponding staging object that has a matching anchor attribute value. If no object is found with a matching anchor attribute value, the sync engine tries to find a corresponding staging object with the same distinguished name.
When the sync engine finds a staging object that matches by distinguished name but not by anchor, a transient object is automatically created if the object located in the connector space has an anchor, in which case the sync engine assumes that this object has either been renamed or deleted in the connected directory. It assigns a temporary, new distinguished name for the connector space object so that it can stage the incoming object. The old object then becomes transient, waiting for the Connector to import the rename or deletion to resolve the situation.

Transient objects are then dealt within three ways

1) A Full import obsoletes it (Deleted)
2) Delta import eventually brings in the rename of the old object. This will get a new DN and will stop being a transient
3) If neither action is applied, you get a completed-transient-objects status at the end of the run cycle.

<u>Note about transient CS Objects</u>:

Much like _exported-change-not-reimported_ warnings, transient CS objects aren't always a problem. You may see them even in a healthy environment. These become a problem only if there are too many of such objects and are not getting cleaned up on subsequent sync runs eventually, or if they are causing problems such as group exports failing. On the AAD Connector, these can be cleaned up if required.

With SyncV2 API, these should get cleaned up eventually in the next delta cycle after the full import that created them.

Public description of a transient object can be found at the following link</br>
[Concept Azure AD Connect Sync Architecture - Import Process](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/concept-azure-ad-connect-sync-architecture#import-process)

# Transient CS objects on Staging mode servers

Transient object may become stale on Staging mode servers after SysAdmin manually hard-deletes Hybrid objects directly from AAD and later re-sync the on-prem object to AAD with AADConnect. To clear the transients execute the following:

1) Execute a Full Import just at the connector the transients are staled.
2) Execute a Delta Cycle from powershell.

# Manually remove transient CS Objects

Since Azure AD Connect version 1.5.18.0 the 'csdelete.exe' tool has been removed and the cmdlets 'Remove-ADSyncCSObject' and 'Get-ADSyncCSObject' have been added.

These cmdlets can now be used to resolve transient object run step warnings reported by customers.

# Scenario

Transient objects can occur more frequently and persist on configurations still using DirSyncWebServices V1 API due to a bug with that older version of the API which occurs when AADConnect is running a long import from Azure AD and, at the same time, theres object deletes occurring in AAD. In some rare occasions the directory misses some of the object deletes in the client import stream, causing these transient objects.

Introduction SyncV2 API service (in MSODS) have fix this issue.

Customers can prevent these transients by avoiding delete operations directly in the cloud (e.g. Remove-MgUser) while AAD Connect is running an Import from AAD.

Customers hitting this problem will see the following status warning in the import profile results of a connector with affected objects

![IMG1](.attachments\AAD-Synchronization\396529\IMG1.jpg)

![IMG2](.attachments\AAD-Synchronization\396529\IMG2.jpg)

# CMDLET Syntax

<u>**Syntax Get-ADSyncCSObject:**</u>

1. `Get-ADSyncCSObject [-Identifier] <guid>`
2. `Get-ADSyncCSObject [-ConnectorIdentifier] <guid>     [-DistinguishedName] <string> [-SkipDNValidation] [-Transient]`
3. `Get-ADSyncCSObject [-ConnectorIdentifier] <guid> [-Transient]     [-StartIndex <int>] [-MaxResultCount <int>]`
4. `Get-ADSyncCSObject [-ConnectorName] <string> [-DistinguishedName]     <string> [-SkipDNValidation] [-Transient]`
5. `Get-ADSyncCSObject [-ConnectorName] <string> [-Transient]     [-StartIndex <int>] [-MaxResultCount <int>]`

<u>**Syntax Remove-ADSyncCSObject:**</u>

1. `Remove-ADSyncCSObject [-CsObject] <CsObject> [-Force]     [-WhatIf] [-Confirm]`
2. `Remove-ADSyncCSObject [-Identifier] <guid> [-Force] [-WhatIf]     [-Confirm]`
3. `Remove-ADSyncCSObject [-ConnectorIdentifier] <guid>     [-DistinguishedName] <string> [-SkipDNValidation] [-Transient]     [-Force] [-WhatIf] [-Confirm]`
4. `Remove-ADSyncCSObject [-ConnectorName] <string>     [-DistinguishedName] <string> [-SkipDNValidation] [-Transient]     [-Force] [-WhatIf] [-Confirm]`

# Steps to delete transient CS Objects using this cmdlet

Follow the next steps in order:

1. Stop the AADConnect scheduler

   `Set-ADSyncScheduler -SyncCycleEnabled $false`

2. Make sure there's a backup of the AADConnect Database

3. Query the affected connector to get the details of the transient objects present. Use the following commamd:

   `Get-ADSyncCSObject -ConnectorName "nameOfTheConnector" -Transient`

![IMG3](.attachments\AAD-Synchronization\396529\IMG3.jpg)

4. Get the cs object details (highlighted in the image above) and Distinguished Name (DN) of the transient object, retrieved in the previous step, run the following command to remove it from the connector space:

   `Remove-ADSyncCSObject -ConnectorName "contoso.onmicrosoft.com - AAD" -DistinguishedName "GUID" -Transient`

![IMG4](.attachments\AAD-Synchronization\396529\IMG4.jpg)

5. Once complete, manually start a full import on the affected connector through the Synchronization Service Manager:

   a. From Synchronization Service Manager, go to Connectors and right click the connector from which you have just deleted the transient object from. Select Run.

   ![IMG5](.attachments\AAD-Synchronization\396529\IMG5.jpg)

   b. Select "Full Import" and click "OK"

   ![IMG6](.attachments\AAD-Synchronization\396529\IMG6.jpg)

   c. Confirm the transient object status warning is gone:

   ![IMG7](.attachments\AAD-Synchronization\396529\IMG7.jpg)

   ![IMG8](.attachments\AAD-Synchronization\396529\IMG8.jpg)

6. Re-enable the AADConnect scheduler

   `Set-ADSyncScheduler -SyncCycleEnabled $true`

# Removing multiple objects

This tsg exemplifies the process to remove a single transient object. It is also possible to remove multiple objects at once as the "Remove- ADSyncCSObject" cmdlet can be used to delete the CS object returned by the "Get-ADSyncCSObject" cmdlet. This should be used with caution and you should always first run the command "**Get-ADSyncCSObject -ConnectorName "nameOfTheConnector" -Transient**" first, exporting the list of objects and analyzing carefully before proceeding to deleting them.

**Usage:**

Remove multiple transient CS objects in a Connector

1. Get the transient CS objects using:   **Connector identifier** or **Name** + **Transient** switch
2. Remove the transient CS objects using: **CsObject** or **Identifier**

<u>Examples</u>:

a. `Get-ADSyncCSObject -ConnectorName "contoso.com" -Transient | ForEach-Object { Remove-ADSyncCSObject -Identifier $_.ObjectId -Force:$true }`

b. `Get-ADSyncCSObject -ConnectorIdentifier "951984ca-b2f3-ea11-b80e-00155df06f31" -Transient | ForEach-Object { Remove-ADSyncCSObject -Identifier $_.ObjectId -Force:$true }`

<br />

