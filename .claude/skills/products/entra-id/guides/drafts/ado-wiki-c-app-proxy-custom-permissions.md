---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Custom Permissions and Sample Script for Configuring them"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Custom%20Permissions%20and%20Sample%20Script%20for%20Configuring%20them"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Custom Permissions and Sample Script

This is a sample script for creating a custom role with all the permissions needed to administer Azure AD Application Proxy.

```powershell
# Requires: AzureAD PowerShell module
# Ref.: https://learn.microsoft.com/powershell/module/azuread/?view=azureadps-2.0

# Basic role information
$displayName = "Azure AD Application Proxy Administrator role"
$description = "Custom role"
$templateId = (New-Guid).Guid

# Set of permissions to grant
$allowedResourceAction =
@(
    "microsoft.directory/applicationPolicies/basic/update",
    "microsoft.directory/applicationPolicies/create"
    "microsoft.directory/applicationPolicies/delete"
    "microsoft.directory/applicationPolicies/owners/read"
    "microsoft.directory/applicationPolicies/owners/update"
    "microsoft.directory/applicationPolicies/policyAppliedTo/read"
    "microsoft.directory/applicationPolicies/standard/read"
    "microsoft.directory/applications/applicationProxy/read"
    "microsoft.directory/applications/applicationProxy/update"
    "microsoft.directory/applications/applicationProxyAuthentication/update"
    "microsoft.directory/applications/applicationProxySslCertificate/update"
    "microsoft.directory/applications/applicationProxyUrlSettings/update"
    "microsoft.directory/applications/appRoles/update"
    "microsoft.directory/applications/audience/update"
    "microsoft.directory/applications/authentication/update"
    "microsoft.directory/applications/basic/update"
    "microsoft.directory/applications/create"
    "microsoft.directory/applications/owners/update"
    "microsoft.directory/applications/permissions/update"
    "microsoft.directory/applications/synchronization/standard/read"
    "microsoft.directory/applicationTemplates/instantiate"
    "microsoft.directory/auditLogs/allProperties/read"
    "microsoft.directory/connectorGroups/allProperties/read"
    "microsoft.directory/connectorGroups/allProperties/update"
    "microsoft.directory/connectorGroups/create"
    "microsoft.directory/connectorGroups/delete"
    "microsoft.directory/connectors/allProperties/read"
    "microsoft.directory/connectors/create"
    "microsoft.directory/provisioningLogs/allProperties/read"
    "microsoft.directory/servicePrincipals/appRoleAssignedTo/update"
    "microsoft.directory/servicePrincipals/audience/update"
    "microsoft.directory/servicePrincipals/authentication/update"
    "microsoft.directory/servicePrincipals/basic/update"
    "microsoft.directory/servicePrincipals/create"
    "microsoft.directory/servicePrincipals/getPasswordSingleSignOnCredentials"
    "microsoft.directory/servicePrincipals/managePasswordSingleSignOnCredentials"
    "microsoft.directory/servicePrincipals/owners/update"
    "microsoft.directory/servicePrincipals/policies/update"
    "microsoft.directory/servicePrincipals/synchronization/standard/read"
    "microsoft.directory/servicePrincipals/synchronizationJobs/manage"
    "microsoft.directory/servicePrincipals/tag/update"
)
$rolePermissions = @{'allowedResourceActions'= $allowedResourceAction}

# Create new custom admin role
$customAdmin = New-MgRoleManagementDirectoryRoleDefinition -RolePermissions $rolePermissions -DisplayName $displayName -Description $description -TemplateId $templateId -IsEnabled
```
