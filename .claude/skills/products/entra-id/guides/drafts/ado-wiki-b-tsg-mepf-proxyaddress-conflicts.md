---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Object sync/TSG Resolving conflicts with orphaned (MEPF) objects in Entra ID"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FObject%20sync%2FTSG%20Resolving%20conflicts%20with%20orphaned%20(MEPF)%20objects%20in%20Entra%20ID"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TSG: Resolving Conflicts with Orphaned (MEPF) Objects in Entra ID

## Description

This guide covers identifying and resolving sync issues with conflicting ProxyAddresses, including conflicts with orphaned objects and Mail-Enabled Public Folders (MEPF) in Entra ID.

## Troubleshooting

### Identifying the Conflict Source

**Entra Connect Export Error**: Shows objectId and AttributeConflictValues on first occurrence. After first attempt, duplicate attribute resiliency quarantines conflicts (DirSyncProvisioningError).

**Connect Health Duplicate Attribute Error**: May not show Existing Object properties for MEPF conflicts (no standard APIs to retrieve MEPF objects from Entra ID).

**IMPORTANT**: Conflict resolution in Connect Health and M365 Admin Center is not real-time - background task re-evaluates conflicts periodically.

### Checking via PowerShell

```powershell
Connect-MgGraph -Scopes "Directory.ReadWrite.All", "User.ReadWrite.All, Group.ReadWrite.All, OrgContact.Read.All"

# Users with provisioning errors
$props = @('Id', 'UserPrincipalName', 'DisplayName', 'Mail', 'ProxyAddresses', 'onPremisesLastSyncDateTime', 'onPremisesSyncEnabled', 'OnPremisesSecurityIdentifier', 'onPremisesProvisioningErrors')
Get-MgUser -Filter "onPremisesProvisioningErrors/any(o:o/category eq 'PropertyConflict')" -All -Property $props | Select-Object $props

# Groups with provisioning errors
Get-MgGroup -Filter "onPremisesProvisioningErrors/any(o:o/category eq 'PropertyConflict')" -All

# Contacts with provisioning errors
Get-MgContact -Filter "onPremisesProvisioningErrors/any(o:o/category eq 'PropertyConflict')" -All
```

### Searching for Conflicting Objects

**By ProxyAddress in on-prem AD**:
```powershell
$conflictingAddress = 'SMTP:Conflict@Contoso.com'
Get-ADObject -Filter "proxyAddresses -eq '$conflictingAddress'"
```

**By ProxyAddress in on-prem Exchange**:
```powershell
$conflictingAddress = 'Conflict@Contoso.com'  # No smtp: prefix needed
Get-Recipient $conflictingAddress | fl Name, Alias, EmailAddresses, RecipientType, RecipientTypeDetails, DistinguishedName
```

**By ProxyAddress via MS Graph**:
```powershell
# Users
Get-MgUser -Filter "proxyAddresses/any(c:c eq 'SMTP:Conflict@Contoso.com')"

# Contacts
Get-MgContact -Filter "proxyAddresses/any(c:c eq 'SMTP:Conflict@Contoso.com')"

# Groups
Get-MgGroup -Filter "proxyAddresses/any(p:p eq 'SMTP:Conflict@Contoso.com')"
```

### Searching for MEPF Objects (requires ADSyncTools)

```powershell
Install-Module ADSyncTools -Force
Import-Module ADSyncTools
$creds = Get-Credential  # MFA/CA not supported

# Search by ObjectId
$mepfs = Get-ADSyncToolsAadObject -Credentials $creds -SyncObjectType PublicFolder
$mepfs | Where-Object {$_.ObjectId -eq $conflictingObjId}

# Search by ProxyAddress
$mepfs | Where-Object {$_.ProxyAddresses -icontains "SMTP:Conflict@Contoso.com"}
```

## Solution

### Removing User/Group/Contact Objects

```powershell
# Remove User (soft-delete)
Remove-MgUser -UserId $conflictingObjId

# Remove Contact (must use Beta - v1.0 cannot delete OrgContact)
Remove-MgBetaContact -OrgContactId $conflictingObjId

# Remove Group
Remove-MgGroup -GroupId $conflictingObjId
```

### Removing MEPF Objects

```powershell
# By SourceAnchor
Remove-ADSyncToolsAadPublicFolders -Credential $creds -SourceAnchor $conflictingObjSA

# By ObjectId (get SourceAnchor first)
$mepfSA = $mepfs | Where-Object {$_.ObjectId -eq $conflictingObjId} | select -ExpandProperty SourceAnchor
Remove-ADSyncToolsAadPublicFolders -Credential $creds -SourceAnchor $mepfSA

# Bulk removal via CSV
Export-ADSyncToolsAadPublicFolders -Credential $creds -Path .\MEPFs.csv
# Review and edit CSV, remove objects you want to keep
Remove-ADSyncToolsAadPublicFolders -Credential $creds -InputCsvFilename .\MEPFs.csv
```

### For Orphaned Synced Objects

- If object no longer needed: delete directly from cloud
- If object is DirSyncEnabled=True and needs updating: recreate same object on-prem (same UPN/ProxyAddress), sync to match, then update conflicting value
- If Entra Connect decommissioned: disable DirSync on tenant to convert all objects to cloud-managed, then manage directly (except MEPF which still needs ADSyncTools)

### ADSyncTools Known Issues

1. Requires DirSync enabled on tenant. If DirSync disabled, temporarily re-enable.
2. Network connectivity issues block access to service endpoint.
3. Incorrect credentials error if password wrong.
4. MFA/conditional access not supported - create temp GA without MFA, excluded from CA.

## References

- [Identity synchronization and duplicate attribute resiliency](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-syncservice-duplicate-attribute-resiliency)
- [ADSyncTools PowerShell Reference](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/reference-connect-adsynctools)
- [Proxy address conflict in Exchange Online](https://learn.microsoft.com/en-us/exchange/troubleshoot/email-alias/proxy-address-being-used)
