---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/ACE Identity TSGs/Identity Technical Wiki/Azure AD Authentication/AAD Connect architecture and troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD.wiki?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FAzure%20AD%20Authentication%2FAAD%20Connect%20architecture%20and%20troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

#Objective: 

This document walks through the steps and PowerShell shared in the AAD connect troubleshooting training along with the recording and other PowerShell scripts for day to day troubleshooting sync cases.

**Recording:** https://microsoft-my.sharepoint.com/personal/yumunaga_microsoft_com/_layouts/15/stream.aspx?id=%2Fpersonal%2Fyumunaga%5Fmicrosoft%5Fcom%2FDocuments%2FRecordings%2FIdentity%20DU%20%2D%20Weekly%20team%20meeting%2D20220721%5F080734%2DMeeting%20Recording%2Emp4&ga=1

**PowerPoint:** https://microsoft-my.sharepoint.com/:p:/r/personal/oudiallo_microsoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BE1583D27-AB42-45E3-9029-453EF564B2D7%7D&file=AAD%20connect%20troubleshooting.pptx&action=edit&mobileredirect=true

## Duplicate Attribute Resiliency

Duplicate Attribute Resiliency is a feature in Azure Active Directory that eliminates friction caused by UserPrincipalName and SMTP ProxyAddress conflicts when running one of Microsoft's synchronization tools.

> **Note:** For newly created tenants this feature is enabled by default.

### Enabling Duplicate Attribute Resiliency

```powershell
Connect-Entra
Get-EntraDirSyncFeature -Feature DuplicateUPNResiliency
Get-EntraDirSyncFeature -Feature DuplicateProxyAddressResiliency
```

## Remove Immutable ID from Recovered Cloud Object

If a cloud object was synced then deleted and recovered, remove the immutable ID:

```powershell
Set-EntraUser -UserId adminsyncuser@contoso.com -ImmutableId:$null
```

## Customize Azure AD Password Policies

By default, Azure AD does not expire passwords. To configure password expiration:

> **Warning:** If you change from `DisablePasswordExpiration` to `None`, all passwords with a `pwdLastSet` older than 90 days will require a reset on next sign-in.

### Check password expiration policy for a user

```powershell
Get-EntraUser -UserId admin@contoso.com | Select-Object @{N="PasswordNeverExpires";E={$_.PasswordPolicies -contains "DisablePasswordExpiration"}}
```

### Set a password to expire

```powershell
Set-EntraUser -UserId user@contoso.com -PasswordPolicies none
# Or for all users:
Get-EntraUser -All | Set-EntraUser -PasswordPolicies none
```

### Set a password to never expire

```powershell
Set-EntraUser -UserId user@contoso.com -PasswordPolicies DisablePasswordExpiration
# Or for all users:
Get-EntraUser -All | Set-EntraUser -PasswordPolicies DisablePasswordExpiration
```

## Remove Extension Attribute for Multiple Users

Directory extensions extend the Azure AD schema with custom attributes from on-premises AD.

```powershell
foreach ($user in (Get-MgUser).UserId) {
    Remove-MgUserExtension -UserId $user.id -ExtensionId "extension_{AppGUID}_TestExtension"
}
```

## Reference Links

| Topic | URL |
|-------|-----|
| AAD Connect architecture | https://docs.microsoft.com/en-us/azure/active-directory/hybrid/concept-azure-ad-connect-sync-architecture |
| Identity synchronization and duplicate attribute resiliency | https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-syncservice-duplicate-attribute-resiliency |
| How the proxy address is calculated | https://docs.microsoft.com/en-us/troubleshoot/azure/active-directory/proxyaddresses-attribute-populate |
| Data validation failed | https://docs.microsoft.com/en-us/microsoft-365/enterprise/prepare-for-directory-synchronization |
| Sync with existing users in AAD connect | https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-install-existing-tenant |
| Extension attributes | https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-sync-feature-directory-extensions |
| Azure AD service limits | https://docs.microsoft.com/en-us/azure/active-directory/enterprise-users/directory-service-limits-restrictions |
