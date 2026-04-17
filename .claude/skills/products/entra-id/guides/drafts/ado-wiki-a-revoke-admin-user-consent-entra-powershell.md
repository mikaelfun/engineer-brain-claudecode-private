---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_Consent_Experiences/Labs/LAB - Revoking admin or user consent using Microsoft Entra PowerShell"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_Consent_Experiences%2FLabs%2FLAB%20-%20Revoking%20admin%20or%20user%20consent%20using%20Microsoft%20Entra%20PowerShell"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Revoking Admin or User Consent Using Microsoft Entra PowerShell

## Prerequisites

- PowerShell 7+
- Microsoft Entra PowerShell module:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  Install-Module -Name Microsoft.Graph.Entra -Repository PSGallery -Scope CurrentUser -AllowPrerelease -Force
  ```
- Role: Global Administrator / Privileged Role Administrator / Application Administrator / Cloud Application Administrator

## Check Consented Permissions Before Revoking

Azure Portal: **Enterprise Applications** → select app → **Permissions** → Admin Consent / User Consent tabs

## Scenario 1 — Revoke ALL delegated permissions for the service principal

```powershell
Connect-Entra -Scopes "Application.ReadWrite.All", "DelegatedPermissionGrant.ReadWrite.All"

$clientSP = Get-EntraServicePrincipal -Filter "displayName eq 'MyApplication'"
Get-EntraOAuth2PermissionGrant |
  Where-Object { $_.ClientId -eq $clientSP.Id } |
  Remove-EntraOauth2PermissionGrant
```

## Scenario 2 — Revoke user-consented permissions for ALL users

```powershell
Connect-Entra -Scopes "Application.ReadWrite.All", "DelegatedPermissionGrant.ReadWrite.All"

$clientSP = Get-EntraServicePrincipal -Filter "displayName eq 'MyApplication'"
Get-EntraOAuth2PermissionGrant |
  Where-Object { $_.ClientId -eq $clientSP.Id -and $_.ConsentType -eq 'Principal' } |
  Remove-EntraOauth2PermissionGrant
```

## Scenario 3 — Revoke user-consented permissions for a SINGLE user

```powershell
Connect-Entra -Scopes "Application.ReadWrite.All", "DelegatedPermissionGrant.ReadWrite.All"

$user = Get-EntraUser -Filter "userPrincipalName eq 'user@contoso.com'"
$clientSP = Get-EntraServicePrincipal -Filter "displayName eq 'MyApplication'"
Get-EntraOAuth2PermissionGrant |
  Where-Object { $_.ClientId -eq $clientSP.Id -and $_.PrincipalId -eq $user.Id } |
  Remove-EntraOauth2PermissionGrant
```

## Verify Revocation

Azure Portal: Enterprise Applications → select app → Permissions → confirm Admin/User Consent tabs are empty.

## Reference

[Grant and revoke API permissions programmatically — Microsoft Entra PowerShell](https://learn.microsoft.com/en-us/powershell/entra-powershell/how-to-grant-revoke-api-permissions?view=entra-powershell&pivots=grant-delegated-permissions)
