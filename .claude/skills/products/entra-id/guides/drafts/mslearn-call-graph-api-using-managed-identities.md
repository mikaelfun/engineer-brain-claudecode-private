# Use Managed Identities to Call Microsoft Graph APIs

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/users-groups-entra-apis/call-graph-api-using-managed-dentities)
> ID: entra-id-mslearn-132

## Overview

How to use managed identities (User Assigned or System Assigned) to obtain access tokens for calling Microsoft Graph APIs in VB.Net and C#.

## Prerequisites

- Managed identity (User Assigned or System Assigned) configured on the Azure resource
- Microsoft.Graph PowerShell module installed

## Step 1: Configure Permissions for Managed Identity

All managed identities have a service principal visible in the Enterprise Apps blade. Grant Microsoft Graph permissions via OAuth Permission Grant using PowerShell:

```powershell
$TenantID = "{your tenant id}"
$DisplayNameOfApp = "{your managed identity name}"
$Permissions = @("User.Read.All")
$MSGraphAppId = "00000003-0000-0000-c000-000000000000"

Connect-MgGraph -TenantId $TenantID -scopes Application.ReadWrite.All

$sp = (Get-MgServicePrincipal -Filter "displayName eq '$DisplayNameOfApp'")
$GraphServicePrincipal = Get-MgServicePrincipal -Filter "appId eq '$MSGraphAppId'"

foreach($permission in $Permissions) {
    $AppRole = $GraphServicePrincipal.AppRoles | Where-Object {$_.Value -eq $permission -and $_.AllowedMemberTypes -contains "Application"}
    New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.Id -PrincipalId $sp.Id -ResourceId $GraphServicePrincipal.Id -AppRoleId $AppRole.Id
}
```

## Step 2: Get Access Token

Request token from resource `https://graph.microsoft.com`.

> **Note:** After requesting a token, the same token is cached for 24 hours. Permission changes won't reflect until the current token expires.

```vbnet
Dim at As AccessToken = credential.GetToken(New TokenRequestContext(New String() {"https://graph.microsoft.com"}))
```

## Key Points

- Works with both User Assigned and System Assigned managed identities
- Permissions must be granted via PowerShell (not portal) for managed identities
- Token caching is 24 hours — new permissions require token expiry first
- 21V applicability: Yes (managed identities work in 21Vianet with Graph China endpoint)
