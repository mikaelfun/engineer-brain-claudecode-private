# Grant App Roles to MSI (Service Principal)

> Source: OneNote - Application mgmt and config / Common configurations
> Status: draft

## Overview

How to grant application permissions (AppRoles) from a resource app to a Managed Identity (Service Principal) in Mooncake.

## Prerequisites

- AzureAD PowerShell module or Microsoft.Graph PowerShell module
- AAD Global Administrator or appropriate role

## Steps (AzureAD Module)

```powershell
Connect-AzureAD -AzureEnvironmentName AzureChinaCloud -Credential $cred

# Get resource app SP (e.g., Microsoft Graph)
$AAD_SP = Get-AzureADServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'"

# Get MSI SP
$MSIName = "yourMSIName"
$MSI = Get-AzureADServicePrincipal -Filter "DisplayName eq '$MSIName'"
if ($MSI.Count -gt 1) {
    Write-Output "Multiple principals found. Use -ObjectId to select the correct one."
    Exit
}

# Assign app roles
$AAD_AppRole = $AAD_SP.AppRoles | Where-Object {$_.Value -eq "User.Read.All"}
New-AzureADServiceAppRoleAssignment -ObjectId $AAD_SP.ObjectId -PrincipalId $MSI.ObjectId -ResourceId $AAD_SP.ObjectId -Id $AAD_AppRole.Id
```

## Steps (Microsoft.Graph Module)

```powershell
New-MgServicePrincipalAppRoleAssignment `
    -ServicePrincipalId $serverServicePrincipalObjectId `
    -PrincipalId $managedIdentityObjectId `
    -ResourceId $serverServicePrincipalObjectId `
    -AppRoleId $appRoleId
```

## Key Notes

- AppRoles are defined on the resource app's service principal
- The `-ObjectId` and `-ResourceId` should both be the resource app's SP ObjectId
- The `-PrincipalId` is the MSI's SP ObjectId
