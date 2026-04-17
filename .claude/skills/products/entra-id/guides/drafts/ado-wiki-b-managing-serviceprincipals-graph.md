---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Microsoft Graph Managing ServicePrincipals"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FMicrosoft%20Graph%20Managing%20ServicePrincipals"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Managing ServicePrincipals using Microsoft Graph PowerShell

## Assign Admin Roles to Service Principals
```powershell
Connect-MgGraph -Scopes RoleManagement.ReadWrite.Directory, Application.ReadWrite.All

$AppId = "YOUR_APP_ID"
$sp = Get-MgServicePrincipal -Filter "appId eq '$AppId'"
$UserAdminRole = Get-MgDirectoryRole -filter "displayName eq 'User Administrator'" | Select id,roleTemplateId,displayName

$params = @{
    "@odata.id" = "https://graph.microsoft.com/v1.0/directoryObjects/$($sp.id)"
}
New-MgDirectoryRoleMemberByRef -DirectoryRoleId $UserAdminRole.id -BodyParameter $params
```

## Get list of SSO enabled apps
```powershell
Get-MgServicePrincipal -Filter "preferredSingleSignOnMode+eq+'saml'"
```

## Find SAML apps and update notificationEmailAddresses
```powershell
Get-MgServicePrincipal -all -Filter "preferredSingleSignOnMode eq 'saml'" |% {
  if(!$_.NotificationEmailAddresses.contains("admin@contoso.com")) {
   Update-MgServicePrincipal -ServicePrincipalId $_.id -NotificationEmailAddresses ($_.NotificationEmailAddresses += "admin@contoso.com")
  }
}
```

## Restart servicePrincipal synchronization job
```powershell
Connect-MgGraph -Scopes "Directory.ReadWrite.All"
Select-MgProfile Beta

$ApplicationId = "APPLICATION_ID"
$servicePrincipalId = (Get-MgServicePrincipal -Filter "appId eq '$ApplicationId'").id
$synchronizationJobId = Get-MgServicePrincipalSynchronizationJob -ServicePrincipalId $servicePrincipalId

$params = @{
  Criteria = @{
    ResetScope = "Watermark, Escrows, QuarantineState"
  }
}
Restart-MgServicePrincipalSynchronizationJob -ServicePrincipalId $servicePrincipalId -SynchronizationJobId $synchronizationJobId -BodyParameter $params
```

## List Verified vs Non-Verified Publisher Apps
```powershell
# Verified Publisher apps
Get-MgServicePrincipal -All -Select appDisplayName,verifiedPublisher,appOwnerOrganizationId | Select appDisplayName,appOwnerOrganizationId -Expand verifiedPublisher | where {$_.VerifiedPublisherId -ne $null}

# Third-party non-Verified Publisher Apps
$FirstPartyTenantIds = @(
  "f8cdef31-a31e-4b4a-93e4-5f571e91255a",
  "47df5bb7-e6bc-4256-afb0-dd8c8e3c1ce8",
  "33e01921-4d64-4f8c-a055-5bdaffd5e33d",
  "72f988bf-86f1-41af-91ab-2d7cd011db47",
  (Get-MgContext).TenantId,
  $null
)
Get-MgServicePrincipal -All -Select displayName,appDisplayName,verifiedPublisher,appOwnerOrganizationId | where { $_.appOwnerOrganizationId -notin $FirstPartyTenantIds } | select displayName,appDisplayName,appOwnerOrganizationId
```
