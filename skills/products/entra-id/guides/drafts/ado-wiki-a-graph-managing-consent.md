---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Microsoft Graph Managing Consent"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FMicrosoft%20Graph%20Managing%20Consent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Scripts to help you manage Consent using Microsoft Graph PowerShell

## Overview

Sample scripts for managing API permissions and consent (delegated and application).

## Scenario: Add and Remove Delegated permissions

```powershell
# USAGE
# Remove Microsoft Graph API permissions from Microsoft Graph Command Line Tools...
Update-EntraDelegatedConsent -ClientId "14d82eec-204b-4c2f-b7e8-296a70dab67e" -ResourceId "00000003-0000-0000-c000-000000000000" -RemovePermissions "write.shared, chat.read"

# Add permissions for a custom client and custom API...
Update-EntraDelegatedConsent -ClientId "5bb296ce-338f-4443-97ca-f4f97e538c36" -ResourceId "d7fcb16b-b908-455f-b601-eb6cbed6bf56" -AddPermissions "read"

function Update-EntraDelegatedConsent {
    [CmdletBinding(DefaultParameterSetName="DefaultSet")] 
    param (
        [Parameter(mandatory=$false)]
        [string]$ClientId="14d82eec-204b-4c2f-b7e8-296a70dab67e",
        [Parameter(mandatory=$false)]
        [string]$ResourceId="00000003-0000-0000-c000-000000000000",
        [Parameter(mandatory=$false)]
        $AddPermissions = @(),
        [Parameter(mandatory=$false)]
        $RemovePermissions = @(),
        [Parameter(mandatory=$false)]
        [ValidateSet('Admin','User')]
        $ConsentType="Admin",
        [string]$UserId = $null
    )

    Connect-Graph -scopes "Directory.Read.All DelegatedPermissionGrant.ReadWrite.All" 

    $_consentType = $null
    switch ($ConsentType) {
      "Admin" { $_consentType = "AllPrincipals" }
      "User" { $_consentType = "Principal" }
    }

    if($AddPermissions -is [string] ) { $AddPermissions = $AddPermissions -split "," }
    if($RemovePermissions -is [string] ) { $RemovePermissions = $RemovePermissions -split "," }

    $appPrincipal = Get-MgServicePrincipal -Filter "appId eq '$($ClientId)' or Id eq '$($ClientId)'"
    $ResourceServicePrincipal = Get-MgServicePrincipal -Filter "appId eq '$($ResourceId)' or Id eq '$($ResourceId)'"

    if("" -ne $UserId) { $UserPrincipal = Get-MgUser -UserId $UserId }

    if($UserId) {
      $grants = Get-MgOauth2PermissionGrant -Filter "clientId eq '$($appPrincipal.id)' and resourceId eq '$($ResourceServicePrincipal.id)' and principalId eq '$($UserPrincipal.id)'"
    } else{
      $grants = Get-MgOauth2PermissionGrant -Filter "clientId eq '$($appPrincipal.id)' and resourceId eq '$($ResourceServicePrincipal.id)' and ConsentType eq '$($_consentType)'"
    }

    $RemovePermissions += $AddPermissions
    foreach($grant in $grants) {
      foreach($permission in $RemovePermissions) {
        $grant.scope = $grant.scope.toLower()
        $grant.scope = $grant.scope.Replace($permission.toLower(), "")
      }
      foreach($permission in $AddPermissions) { $grant.scope += $permission + " " }
      Update-MgOauth2PermissionGrant -OAuth2PermissionGrantId $grant.id -Scope $grant.scope.Trim()
    }

    $ScopeString = $AddPermissions -join " "
    If(!$grants) {
      if($UserId) {
        New-MgOauth2PermissionGrant -ClientId $appPrincipal.id -ResourceId $ResourceServicePrincipal.id -Scope $ScopeString -ConsentType Principal -PrincipalId $UserPrincipal.id
      } else {
        New-MgOauth2PermissionGrant -ClientId $appPrincipal.id -ResourceId $ResourceServicePrincipal.id -Scope $ScopeString -ConsentType AllPrincipals
      }
    }
}
```

## Add Application permissions to a servicePrincipal

```powershell
$TenantID = "YOUR TENANT ID"
$AppId= "YOUR_APP_ID" 
$Permissions = @("Organization.Read.All","AuditLog.Read.All")
$ResourceId = "00000003-0000-0000-c000-000000000000" # MS GRAPH

Connect-MgGraph -TenantId $TenantID -scopes Application.ReadWrite.All
$sp = (Get-MgServicePrincipal -Filter "appId eq '$AppId'")
$ResourceServicePrincipal = Get-MgServicePrincipal -Filter "appId eq '$ResourceId'"
$AppRoleAssignments = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.id -Filter "resourceId eq $($ResourceServicePrincipal.id)" 

foreach($permission in $Permissions) {
  $AppRole = $ResourceServicePrincipal.AppRoles | Where-Object {$_.Value -eq $permission -and $_.AllowedMemberTypes -contains "Application"}
  if(!$AppRoleAssignments.AppRoleId -contains $AppRole.id) {
    New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.Id -PrincipalId $sp.Id -ResourceId $ResourceServicePrincipal.Id -AppRoleId $AppRole.Id
  }
}
```

## Remove Application permissions from a servicePrincipal

```powershell
$TenantID = "YOUR TENANT ID"
$AppId= "YOUR_APP_ID" 
$Permissions = @("Organization.Read.All","AuditLog.Read.All")
$ResourceId = "00000003-0000-0000-c000-000000000000"

$ResourceServicePrincipal = Get-MgServicePrincipal -Filter "appId eq '$ResourceId'"
$AppRoleAssignments = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.id -Filter "resourceId eq $($ResourceServicePrincipal.id)" 

foreach($permission in $Permissions) {
  $AppRole = $ResourceServicePrincipal.AppRoles | Where-Object {$_.Value -eq $permission -and $_.AllowedMemberTypes -contains "Application"}
  foreach($AppRoleAssignment in $AppRoleAssignments) {
    if($AppRole.Id -eq $AppRoleAssignment.AppRoleId) {
      Remove-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.Id -AppRoleAssignmentId $AppRoleAssignment.id
    }
  }
}
```

## Remove all users assigned to the application

```powershell
$sp = Get-MgServicePrincipal -ServicePrincipalId $spObjectId
$assignments = Get-MgServicePrincipalAppRoleAssignedTo -ServicePrincipalId $sp.Id -All

$assignments | ForEach-Object {
    if ($_.PrincipalType -eq "User") {
        Remove-MgUserAppRoleAssignment -UserId $_.PrincipalId -AppRoleAssignmentId $_.Id
    } elseif ($_.PrincipalType -eq "Group") {
        Remove-MgGroupAppRoleAssignment -GroupId $_.PrincipalId -AppRoleAssignmentId $_.Id
    }
}
```

## Revoke all permissions granted to the application

```powershell
$sp = Get-MgServicePrincipal -ServicePrincipalId $spObjectId

# Remove all delegated permissions
Get-MgServicePrincipalOauth2PermissionGrant -ServicePrincipalId $sp.Id -All | ForEach-Object {
    Remove-MgOauth2PermissionGrant -OAuth2PermissionGrantId $_.Id
}

# Remove all application permissions
Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.Id | ForEach-Object {
    Remove-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $_.PrincipalId -AppRoleAssignmentId $_.Id
}
```

## Remove consents for a specific user (Compromised User)

```powershell
$AppId = "14d82eec-204b-4c2f-b7e8-296a70dab67e"
$ResourceId = "00000003-0000-0000-c000-000000000000"

$sp = Get-MgServicePrincipal -Filter "appId eq '$($AppId)'"
$user = Get-MgUser -UserId "USER_ID"

$grants = Get-MgServicePrincipalOauth2PermissionGrant -ServicePrincipalId $sp.id | where PrincipalId -eq $($user.id)

foreach($grant in $grants) {
    Remove-MgOauth2PermissionGrant -OAuth2PermissionGrantId $grant.id
}
```

## Get list of apps with specific delegated permissions

```powershell
$Permissions = @("Mail.Send", "Calendars.ReadWrite")
$resourceId = "00000003-0000-0000-c000-000000000000"
$MsGraphResource = Get-MgServicePrincipal -Filter "appId eq '$resourceId'"
$Grants = Get-MgOauth2PermissionGrant -All -Filter "resourceId eq '$($MsGraphResource.id)'"

$appsFound = @()
foreach($grant in $Grants) {
  foreach($permission in $Permissions) {
    if($grant.scope.split(" ") -contains $permission) {
      $appsFound += [pscustomobject]@{
        ApplicationId = $grant.ClientId
        Permission = $permission
        PermissionType = "Delegated"
        ConsentType = $grant.ConsentType
        PrincipalId = $grant.PrincipalId
      }
    }
  }
}
$appsFound | Sort-object ApplicationId,Permission
```

## Get list of apps with specific application permissions

```powershell
$Permissions = @("User.ReadWrite.All", "AccessReview.Read.All")
$resourceId = "00000003-0000-0000-c000-000000000000"
$AppRoles = (Get-MgServicePrincipal -Filter "appId eq '$resourceId'" -Select AppRoles).AppRoles
$apps = Get-MgServicePrincipal -All -Select id,displayName -Expand appRoleAssignments

$appsFound = @()
foreach($app in $Apps) {
  foreach($permission in $Permissions) {
    $AppRoleId = ($AppRoles | where {$_.Value -eq "$permission"}).id
    if($app.appRoleAssignments.AppRoleId -contains $AppRoleId) {
      $appsFound += [pscustomobject]@{
        ApplicationId = $app.id
        Permission = $permission
        Type = "Application"
        ConsentType = "AllPrincipals"
      }
    }
  }
}
$appsFound | Sort-object ApplicationId,Permission
```

## Revoke all permissions for a specific resource

```powershell
$AppName = "custom web app"
$app = Get-MgServicePrincipal -Filter "displayName eq '$AppName'"
$resourceId = "00000003-0000-0000-c000-000000000000"
$resourceApp = Get-MgServicePrincipal -Filter "appId eq '$resourceId' or id eq '$resourceId'"

$delegatedPermissions = Get-MgServicePrincipalOauth2PermissionGrant -ServicePrincipalId $app.id | where {$_.resourceId -eq $resourceApp.id}
$applicationPermissions = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $app.id | where {$_.resourceId -eq $resourceApp.id}

$delegatedPermissions | %{Remove-MgOauth2PermissionGrant -OAuth2PermissionGrantId $_.id}
$applicationPermissions | %{Remove-MgServicePrincipalAppRoleAssignment -AppRoleAssignmentId $_.id -ServicePrincipalId $app.id}
```
