---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/ACE Identity TSGs/Identity Technical Wiki/AAD Connect - Synchronization/How To: Hard Match Sync"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FAAD%20Connect%20-%20Synchronization%2FHow%20To%3A%20Hard%20Match%20Sync"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How To: Hard Match Sync

## ⚠️ Update March 10, 2026: Hard Match Security Hardening Changes

Beginning **July 1, 2026**, Microsoft Entra ID will **block** hard match attempts to reassociate an on-premises AD account with an existing cloud account where **one or more** of the following are true:

- Has `onPremisesObjectIdentifier` set (not null)
- Is **assigned** one or more privileged roles
- Is **eligible** to be assigned one or more privileged roles

These safeguards prevent attackers from taking over a privileged cloud account by manipulating synchronization attributes.

### Error Message (when blocked)
```
Hard match operation blocked due to security hardening. Review OnPremisesObjectIdentifier mapping
```

### What is NOT changing
- Initial hard match operations for new users remain fully supported
- Hard match for non-privileged accounts are not affected
- Soft match behavior is unchanged (governed by BlockSoftMatch)
- Cloud-managed accounts with writeback enabled are excluded
- Hard match using `onPremisesImmutableId` is NOT being blocked

### Recovery: Clear onPremisesObjectIdentifier (Graph API)
```http
PATCH https://graph.microsoft.com/beta/users/{userId}
{
  "onPremisesObjectIdentifier": null
}
```
Required permissions: `User.OnPremisesSync.ReadWrite.All` + Global Administrator or Hybrid Identity Administrator role.

### Recovery: Privileged Role Blocks
Temporarily remove the role assignment/eligibility → perform hard match → re-add the role.

---

## How to Hard Match

Sometimes Soft Matching (based on UserPrincipalName) can fail — for example when:
- A company using M365 and local AD accounts with the same username decides to start syncing
- Users previously synced have an on-prem AD restore, making the restored account appear different

In these cases, Hard Matching via the account's ImmutableID/Source Anchor can be used.

### Prerequisites
1. Install PowerShell package:
   ```powershell
   Install-Module Microsoft.Entra
   ```
2. Connect to a Domain Joined Windows Server or machine with the AD Module for PowerShell:
   ```powershell
   Add-WindowsFeature RSAT-AD-PowerShell
   Import-Module ActiveDirectory
   ```

### Individual Account
```powershell
$ADUser = "Onprem SamAccountName"
$AADUser = "username@onmicrosoft.com"
$guid = (Get-ADUser $ADUser).Objectguid
$immutableID = [system.convert]::ToBase64String($guid.tobytearray())
Set-EntraUser -UserId "$AADUser" -ImmutableId $immutableID
```

### Multiple Accounts (Bulk)
1. Export users to CSV:
   ```powershell
   $OUpath = 'OU=Real Users,DC=contoso,DC=com'
   $ExportPath = 'C:\testing\hard_match_users.csv'
   Get-ADUser -Filter * -SearchBase $OUpath | Select-Object SamAccountName | Export-Csv -NoType $ExportPath
   ```
2. Run hard match script:
   ```powershell
   Connect-Entra
   Import-Csv .\users.csv | ForEach-Object {
       $username = $_.SamAccountName
       $365User = "$username@emaildomainname.com"
       $guid = (Get-ADUser $username).Objectguid
       $immutableID = [system.convert]::ToBase64String($guid.tobytearray())
       Set-EntraUser -UserId "$365User" -ImmutableId $immutableID
   }
   ```
3. Trigger sync:
   ```powershell
   Start-ADSyncSyncCycle              # Delta sync
   Start-ADSyncSyncCycle -PolicyType Initial   # Full sync
   ```

### References
- https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-install-existing-tenant#hard-match-vs-soft-match
- https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/tshoot-connect-sync-errors#invalidhardmatch
