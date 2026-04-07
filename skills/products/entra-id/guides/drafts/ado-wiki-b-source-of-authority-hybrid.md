---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Object sync/Source Of Authority in hybrid environments"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FObject%20sync%2FSource%20Of%20Authority%20in%20hybrid%20environments"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Source Of Authority in Hybrid Environments

## Key Concept

A common misconception: you CANNOT transfer the SoA of a single synchronized user from on-premises AD to Entra ID by filtering it out of sync scope and recovering from Recycle Bin.

An object in this state shows DirSyncEnabled=False ("Cloud Only" in portal), but retains ALL on-premises Shadow attributes. It is a **disconnected synchronized object**, NOT a true managed (cloud-only) object.

**IMPORTANT**: Never advise disabling DirSync on the tenant as a troubleshooting step. DirSync should only be disabled for permanent migration.

## Retained Properties on Disconnected Objects

When an object is synchronized from on-prem with Exchange extended schema, these properties persist even after disconnection:
- MSExchArchiveGuid
- MSExchArchiveName
- MSExchRecipientDisplayType
- MSExchRecipientTypeDetails
- MSExchRemoteRecipientType

These are retained because the object can be reconnected, and clearing them could affect user data (Mailbox, MailboxArchive, etc).

## How to Distinguish Object Types

### Disconnected Synchronized Object
- DirSyncEnabled (onPremisesSyncEnabled): **False**
- LastDirSyncTime (onPremisesLastSyncDateTime): **has a date/time value**

```powershell
Get-MgUser -UserId {objectId} | Format-List onPremisesSyncEnabled, onPremisesLastSyncDateTime
# Returns: onPremisesSyncEnabled: False, onPremisesLastSyncDateTime: 12/6/2021 2:58:43 PM
```

### True Managed Object (Cloud Only)
- DirSyncEnabled (onPremisesSyncEnabled): **null**
- LastDirSyncTime (onPremisesLastSyncDateTime): **null**
- May still have ImmutableId if previously synced (no need to clean up)

```powershell
Get-MgUser -UserId {objectId} | Format-List onPremisesSyncEnabled, onPremisesLastSyncDateTime, onPremisesImmutableId
# Returns: onPremisesSyncEnabled: (null), onPremisesLastSyncDateTime: (null)
```

## Correct Method for Hard-Matching

Do NOT manually restore soft-deleted synced objects to rewrite ImmutableId.

**Supported method**: Write the Entra ID ImmutableId into ms-DS-ConsistencyGuid using ADSyncTools:

```powershell
Import-Module "C:\Program Files\Microsoft Entra ID Connect\Tools\AdSyncTools.psm1"

# Get current value
Get-ADSyncToolsMsDsConsistencyGuid User01@Contoso.com

# Set by sAMAccountName (same domain only)
Set-ADSyncToolsMsDsConsistencyGuid -Identity User01 -Value '88666888-0101-1111-bbbb-1234567890ab'

# Set by DN with Base64 ImmutableId (cross-domain)
Set-ADSyncToolsMsDsConsistencyGuid -Identity 'CN=User1,OU=Sync,DC=Contoso,DC=com' -Value 'GGhsjYwBEU+buBsE4sqhtg=='
```

Recommend selecting ms-DS-ConsistencyGuid as source anchor during AADConnect initial setup.

## Key Takeaways

1. Disconnected synced objects retain SoA in on-premises AD
2. Never disable DirSync as a troubleshooting/mitigation method
3. Filtering out + restoring from Recycle Bin does NOT convert SoA
4. Use ADSyncTools Set-ADSyncToolsMsDsConsistencyGuid for hard-matching
