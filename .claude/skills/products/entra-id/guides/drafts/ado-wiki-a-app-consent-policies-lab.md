---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_Consent_Experiences/Labs/LAB - Application Consent Policies Lab"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_Consent_Experiences%2FLabs%2FLAB%20-%20Application%20Consent%20Policies%20Lab"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# LAB — Application Consent Policies

## Overview

App Consent Policy is a set of configurable permissions assignable to a user, enabling them to grant either tenant-wide admin consent or user consent — **without** the Privileged Administrator role.

**Benefits:**
- Configurable for delegated or application permissions (or both)
- Can be restricted to specific apps
- No full Application Admin/Global Admin role required

**App consent permissions:**

| Permission | Description |
|---|---|
| `microsoft.directory/servicePrincipals/managePermissionGrantsForSelf.{policyId}` | Allow user to consent on behalf of self |
| `microsoft.directory/servicePrincipals/managePermissionGrantsForAll.{policyId}` | Allow user to grant tenant-wide admin consent |

## Scenario 1 — Certain users need to consent for themselves for specific apps

> Use case: Tenant has disabled user consent but needs certain users to self-consent for delegated permissions on a specific app.

```powershell
Connect-MgGraph -Scopes "Policy.ReadWrite.PermissionGrant"

# Create new policy
New-MgPolicyPermissionGrantPolicy `
  -Id "AdminConsentPolicy-Delegated" `
  -DisplayName "AdminConsentPolicy-Delegated" `
  -Description "AdminConsentPolicy-Delegated"

# Add include conditions (restrict to specific app by ClientApplicationIds)
New-MgPolicyPermissionGrantPolicyInclude `
  -PermissionGrantPolicyId "AdminConsentPolicy-Delegated" `
  -PermissionType "delegated" `
  -PermissionClassification "all" `
  -ClientApplicationsFromVerifiedPublisherOnly:$false `
  -ClientApplicationIds "38f72c76-eb07-47f8-adf0-b26107b94930"

# Create custom role referencing this policy
$params = @{
  description = "AdminConsentPolicy-DelegatedPermssions"
  displayName = "AdminConsentPolicy-DelegatedPermssions"
  rolePermissions = @(@{
    allowedResourceActions = @(
      "microsoft.directory/servicePrincipals/managePermissionGrantsForSelf.AdminConsentPolicy-Delegated"
    )
  })
  isEnabled = $true
}
New-MgRoleManagementDirectoryRoleDefinition -BodyParameter $params
```

Then assign the custom role to the target user via Azure Portal.

## Scenario 2 — Certain users need to grant consent to other users

> Use case: Tenant needs users to grant consent for both delegated AND application permissions across all apps, without Global Admin.

```powershell
Connect-MgGraph -Scopes "Policy.ReadWrite.PermissionGrant"

New-MgPolicyPermissionGrantPolicy `
  -Id "AdminConsentPolicy-Delegated-App-Permssions" `
  -DisplayName "AdminConsentPolicy-Delegated-App-Permssions" `
  -Description "AdminConsentPolicy-Delegated-App-Permssions"

# Include delegated permissions
New-MgPolicyPermissionGrantPolicyInclude `
  -PermissionGrantPolicyId "AdminConsentPolicy-Delegated-App-Permssions" `
  -PermissionType "delegated" `
  -PermissionClassification "all" `
  -ClientApplicationsFromVerifiedPublisherOnly:$false

# Include application permissions
New-MgPolicyPermissionGrantPolicyInclude `
  -PermissionGrantPolicyId "AdminConsentPolicy-Delegated-App-Permssions" `
  -PermissionType "application" `
  -PermissionClassification "all" `
  -ClientApplicationsFromVerifiedPublisherOnly:$false

# Create custom role
$params = @{
  description = "AdminConsentPolicy-Delegated-App-Permssions"
  displayName = "AdminConsentPolicy-Delegated-App-Permssions"
  rolePermissions = @(@{
    allowedResourceActions = @(
      "microsoft.directory/servicePrincipals/managePermissionGrantsForAll.AdminConsentPolicy-Delegated-App-Permssions"
    )
  })
  isEnabled = $true
}
New-MgRoleManagementDirectoryRoleDefinition -BodyParameter $params
```

## Scenario 3 — Service principal automation grants consent for specific permissions

> Use case: Automation script using service principal to grant admin consent for Group.Read.All only.

Key permission IDs:
- Group.Read.All (delegated): `5f8c59db-677d-491f-a6b8-5f174b11ec1d`
- Group.Read.All (application): `5b567255-7703-4780-807c-7be8301ae99b`
- Microsoft Graph appId: `00000003-0000-0000-c000-000000000000`

```powershell
Connect-MgGraph -Scope Policy.ReadWrite.PermissionGrant, "RoleManagement.ReadWrite.Directory"

# Create policy restricted to Group.Read.All delegated
New-MgPolicyPermissionGrantPolicy `
  -Id "my-custom-policy-restricted" `
  -DisplayName "Custom consent policy with restrictions" `
  -Description "Custom consent policy with restrictions."

New-MgPolicyPermissionGrantPolicyInclude `
  -PermissionGrantPolicyId "my-custom-policy-restricted" `
  -Permissions '5f8c59db-677d-491f-a6b8-5f174b11ec1d' `
  -PermissionType "delegated" `
  -ResourceApplication '00000003-0000-0000-c000-000000000000'

# Create custom role
$allowedResourceAction = @("microsoft.directory/servicePrincipals/managePermissionGrantsForAll.my-custom-policy-restricted")
$rolePermissions = @(@{AllowedResourceActions = $allowedResourceAction})
New-MgRoleManagementDirectoryRoleDefinition -RolePermissions $rolePermissions `
  -DisplayName "Custom Role. Allows grant consent for Group.Read.All" `
  -IsEnabled -Description "Can manage basic aspects of application registrations." `
  -TemplateId (New-Guid).Guid

# Assign role to service principal
$roleDefinition = Get-MgRoleManagementDirectoryRoleDefinition -Filter "DisplayName eq 'Custom Role. Allows grant consent for Group.Read.All'"
$spactor = Get-MgServicePrincipal -Filter "displayname eq 'ConsentActor'"
New-MgRoleManagementDirectoryRoleAssignment -DirectoryScopeId '/' -RoleDefinitionId $roleDefinition.Id -PrincipalId $spactor.id
```

## Scenario 4 — Grant consent for ALL pre-configured API permissions programmatically

```powershell
$targetAppId = "TARGET_APP_ID"
$consentActorAppId = "ACTOR_APP_ID"
$clientSecret = "CLIENT_SECRET"
$tenantId = "TENANT_ID"

$SecureClientSecret = ConvertTo-SecureString $clientSecret -AsPlainText -Force
$ClientCredential = New-Object System.Management.Automation.PSCredential($consentActorAppId, $SecureClientSecret)
Connect-MgGraph -TenantId $tenantId -ClientSecretCredential $ClientCredential

$targetSp = Get-MgServicePrincipal -Filter "appId eq '$targetAppId'"
$appReg = Get-MgApplication -Filter "appId eq '$targetAppId'"

foreach ($resource in $appReg.RequiredResourceAccess) {
  $resourceSp = Get-MgServicePrincipal -Filter "appId eq '$($resource.ResourceAppId)'"
  $delegatedPerms = $resource.ResourceAccess | Where-Object { $_.Type -eq "Scope" }
  if ($delegatedPerms) {
    $scopeNames = $delegatedPerms | ForEach-Object {
      ($resourceSp.Oauth2PermissionScopes | Where-Object { $_.Id -eq $_.Id }).Value
    }
    if ($scopeNames) {
      New-MgOauth2PermissionGrant -BodyParameter @{
        clientId = $targetSp.Id; consentType = "AllPrincipals"
        resourceId = $resourceSp.Id; scope = $scopeNames -join " "
      }
    }
  }
  foreach ($perm in ($resource.ResourceAccess | Where-Object { $_.Type -eq "Role" })) {
    New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $targetSp.Id `
      -PrincipalId $targetSp.Id -ResourceId $resourceSp.Id -AppRoleId $perm.Id
  }
}
```

## Reference

- [App consent permissions for custom roles](https://learn.microsoft.com/en-us/azure/active-directory/roles/custom-consent-permissions)
- [Manage app consent policies](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/manage-app-consent-policies)
