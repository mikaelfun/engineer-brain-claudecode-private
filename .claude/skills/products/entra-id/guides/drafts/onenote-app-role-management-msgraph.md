# App Role Management via Microsoft.Graph PowerShell

## Overview

Guide for creating, updating, deleting, and assigning App Roles using Microsoft.Graph PowerShell module.

## Prerequisites

- `Microsoft.Graph.Applications` module installed
- Service Principal must have `Application.ReadWrite.All` permission

## Create App Role

```powershell
$approle = [Microsoft.Graph.PowerShell.Models.MicrosoftGraphAppRole]::new()
$approle.DisplayName = "NewAppRoleForApp"
$approle.AllowedMemberTypes = @('User', 'Application')
$approle.Value = "Task.Create"
$approle.Id = New-Guid
$approle.IsEnabled = "True"
$approle.Description = "Description of the role"
```

## Assign Role to New Application

```powershell
$app = New-MgApplication -DisplayName "MyApp" -AppRoles $approle
```

## Append Role to Existing Application

```powershell
# Option 1: Specify all roles
Update-MgApplication -ApplicationId $app.Id -AppRoles $approle1, $approle

# Option 2: Get existing + append
$existingrole = (Get-MgApplication -ApplicationId $app.Id).AppRoles
$existingrole += $newRole
Update-MgApplication -ApplicationId $app.Id -AppRoles $existingrole
```

## Delete App Role

Must disable first, then remove:

```powershell
# Step 1: Disable
$app = Get-MgApplication -ApplicationId $app.Id
$app.AppRoles[0].IsEnabled = $False
Update-MgApplication -ApplicationId $app.Id -AppRoles $app.AppRoles

# Step 2: Remove (exclude the disabled role)
$app = Get-MgApplication -ApplicationId $app.Id
Update-MgApplication -ApplicationId $app.Id -AppRoles $app.AppRoles[1]
```

## Assign App Role to AAD Group

**IMPORTANT**: Assignment must be on Service Principal, NOT Application.

- If app was created in Portal → SP created automatically
- If created via PowerShell → must create SP with `New-MgServicePrincipal`

```powershell
New-MgGroupAppRoleAssignment `
  -GroupId "<group-object-id>" `
  -AppRoleId "<approle-id>" `
  -Id "<application-object-id>" `
  -ResourceId "<service-principal-object-id>" `
  -PrincipalId "<group-object-id>"
```

**Note**: `AllowedMemberTypes` must include `User` for group assignment to work.

## Common Issues

1. **App role assignment fails without Service Principal**: Must create SP first via `New-MgServicePrincipal`. Error shown if SP doesn't exist.
2. **Same app role GUID can be assigned to different applications** - this is supported.
3. **Orphaned role assignments**: Remove group assignments BEFORE deleting the app role. Leftover assignments won't grant access but cause confusion.
4. **Best practice**: Always delete role assignments before deleting the role itself.

## References

- [New-MgApplication](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/new-mgapplication)

## Source

- OneNote: Mooncake POD Support Notebook / Azure AD / Account management / AAD PowerShell / Microsoft.Graph / App Role Management
