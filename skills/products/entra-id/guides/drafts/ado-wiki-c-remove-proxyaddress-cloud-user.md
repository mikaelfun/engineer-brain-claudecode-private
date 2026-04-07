---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD User Management/TSG - Remove unwanted proxyAddress from cloud-only user without Exchange license"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20User%20Management/TSG%20-%20Remove%20unwanted%20proxyAddress%20from%20cloud-only%20user%20without%20Exchange%20license"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Remove unwanted proxyAddress from cloud-only user without Exchange license

This process can be used by customers to remove unwanted proxyAddresses from cloud-only users who have no Exchange Online license assigned. The users must also not be Mail Enabled.

**Pre-check**: Check ASC and look at the RemoteRecipientType (may be called MSExchRemoteRecipientType) property on the user. If it is anything but NULL, this process will NOT work as any address entered in the Email property will be sanitized by Proxy Calc.

To fully remove all Exchange properties from a user, consult with an Exchange support engineer first:
- [Set-User -PermanentlyClearPreviousMailboxInfo](https://learn.microsoft.com/en-ca/powershell/module/exchangepowershell/set-user?view=exchange-ps#-permanentlyclearpreviousmailboxinfo)
- [Permanently Clear Previous Mailbox Info](https://techcommunity.microsoft.com/blog/exchange/permanently-clear-previous-mailbox-info/607619)

## Option 1 (Preferred): MS Graph Beta PATCH call

### Steps
1. Use a Global Administrator account to connect to MS Graph (e.g., Graph Explorer at https://aka.ms/ge) with `User.ReadWrite.All` permissions
2. Change endpoint from v1.0 to **BETA**
3. GET the user: `GET https://graph.microsoft.com/beta/users/{userId}?$select=userPrincipalName,mail,proxyAddresses,assignedPlans,onPremisesSyncEnabled`
4. Confirm `onPremisesSyncEnabled` is NOT `true` (if true, use on-prem AD instead)
5. Confirm no enabled Exchange plans in `assignedPlans` (if present, use Exchange management tools)
6. Copy `proxyAddresses` from response, remove the unwanted address
7. PATCH: `PATCH https://graph.microsoft.com/beta/users/{userId}`
   ```json
   { "proxyAddresses": ["SMTP:user@tenant.onmicrosoft.com", "smtp:keepthis@domain.com"] }
   ```
   To clear all: `{ "proxyAddresses": [] }`

**NOTE**: You cannot remove the proxyAddress matching the user's UPN - proxyCalc will add it back.

## Option 2: Temporary Account Method

1. Using a Global Admin, log into Azure portal
2. Create a dummy user (e.g., `dummy@tenant.onmicrosoft.com`)
3. Soft-delete the target user
4. Change dummy user's **mail** attribute to the unwanted proxy address
5. Restore the deleted user with proxy conflict auto-reconciliation:
   ```powershell
   Connect-Entra -Scopes Users.ReadWrite.All
   $user = Get-EntraDeletedUser -Filter "userPrincipalName eq 'user@contoso.onmicrosoft.com'"
   Restore-EntraDeletedDirectoryObject -Id $user.id -AutoReconcileProxyConflict
   ```
6. Verify proxy removal, then delete the dummy user

## GCCH Customers

GCCH customers cannot use Graph Explorer. Use PowerShell instead:
```powershell
Install-Module Microsoft.Graph.Authentication -Scope CurrentUser -Force -AllowClobber
Install-Module Microsoft.Graph.Beta -Scope CurrentUser -Force -AllowClobber
Connect-MgGraph -Environment USGov -Scopes "Directory.ReadWrite.All"

$userId = "<user-object-id-or-upn>"
$uri = "https://graph.microsoft.us/beta/users/$userId?`$select=userPrincipalName,mail,proxyAddresses"
$user = Invoke-MgGraphRequest -Method GET -Uri $uri

$remove = "smtp:unwanted@domain.com"   # MUST match exact string (case + prefix)
$updated = @($user.proxyAddresses) | Where-Object { $_ -ne $remove }

$patchUri = "https://graph.microsoft.us/beta/users/$userId"
$body = @{ proxyAddresses = $updated } | ConvertTo-Json -Depth 5
Invoke-MgGraphRequest -Method PATCH -Uri $patchUri -Body $body -ContentType "application/json"
```

## Synced Users or Exchange Online Licensed Users

- Assign a temporary Exchange Online license, then remove proxyAddress via EXO management:
  ```powershell
  Set-MailUser "Alias" -EmailAddresses @{remove="proxyaddresstoremove@domain.com"}
  ```
- For on-prem synced users: remove proxyAddress from on-prem AD and sync

## Escalation

If none of the above options work, request business justification and file an ICM for Cloud Identity TA review. If approved, transfer to "IAM Services / Users Graph API" queue.
