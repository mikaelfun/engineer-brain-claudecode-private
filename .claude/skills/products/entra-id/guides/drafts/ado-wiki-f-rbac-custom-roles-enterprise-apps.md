---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Roles and Administrators/Azure AD RBAC Custom Roles for Enterprise Apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Roles%20and%20Administrators%2FAzure%20AD%20RBAC%20Custom%20Roles%20for%20Enterprise%20Apps"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD RBAC Custom Roles for Enterprise Apps

## Summary

Custom Microsoft Entra ID RBAC roles support fine-grained permissions for Enterprise Application management. Two key personas:

- **App buyer** — permission to delegate access to applications, but NOT manage technical configuration
- **App creator/manager** — permission to configure applications, but NOT delegate access

## Supported Scenarios

- Provisioning new gallery apps
- Reading Sign-in reports and Audit logs
- Managing basic configuration (Display name)
- Managing user and group assignments
- Managing credentials
- Managing provisioning settings
- Deleting enterprise apps

## Requirements

- Global administrators can create, manage, and assign custom roles via Portal, PowerShell, or Graph API

## Limitations

- Maximum **30** custom roles per tenant
- Members of Custom roles for Enterprise Applications get permission limited to Enterprise Management blade
- Administrative Units scoping is supported
- Read permissions cannot be restricted
- Enterprise App Owners get full permissions (additive) — cannot be changed
- Custom Roles can only contain permissions related to Enterprise Apps and Application Registration management
- Setting "Users can register applications" to "No" does NOT impact custom role members with create permissions (permissions are additive)
- Custom role members cannot access Entra admin portal when "Restrict access to Microsoft Entra ID administration portal" = "Yes"

## Known Issues

### Issue 1: Custom roles not listed under Enterprise Apps > Roles and administrators

**By design**, only roles containing these permission prefixes appear under Enterprise Applications:

```
"microsoft.aad.directory/applications"
"microsoft.aad.directory/applicationPolicies"
"microsoft.aad.directory/servicePrincipals"
```

## Creating Custom Roles

### Portal

1. Login as Global Administrator → Microsoft Entra ID → Roles and administrators → **New custom role**
2. Basics tab: Enter Name, Description; choose "Start from scratch" or "Clone from a custom role"
3. Permissions tab: Select desired permissions; can search by permission name
4. Review + create → Create

### PowerShell (Microsoft Graph Module)

```powershell
Install-Module Microsoft.Graph -Scope AllUsers -Repository PSGallery -Force

# Create role definition
$allowedResourceAction = @()
$allowedResourceAction += @("microsoft.directory/signInReports/allProperties/read")
$rolePermission = @{'allowedResourceActions' = $allowedResourceAction}
$rolePermissions = @()
$rolePermissions += $rolePermission
$resourceScopes = @()
$resourceScopes += '/'

New-MgRoleManagementDirectoryRoleDefinition -RolePermissions $rolePermissions -IsEnabled $true -DisplayName 'Can read sign-in reports for Enterprise Apps' -ResourceScope $resourceScopes
```

### Scoped Role Assignment

| Scopes (PowerShell) | Scopes (UI) |
| --- | --- |
| `/` | Directory-Wide |
| `/` + `$Application.ObjectId` | Enterprise Application |
| `/` + `$AdminUnit.ObjectId` | Administrative Unit |

```powershell
$user = Get-MgUser -UserId "manny@contoso.org"
$App = Get-MgApplication -SearchString "DumpToken"
$roleDefinition = Get-MgRoleManagementDirectoryRoleDefinition | Where-Object {$_.displayName -eq "MyCustomRoleDefinition"}
$resourceScopes = '/' + $App.Id
New-MgRoleManagementDirectoryRoleAssignment -ResourceScope $resourceScopes -RoleDefinitionId $roleDefinition.Id -PrincipalId $user.ObjectId
```

### Graph API

**Create Role:**
```
POST https://graph.microsoft.com/beta/roleManagement/directory/roleDefinitions

{
  "description": "Can manage basic aspects of application registrations.",
  "displayName": "Application Support Administrator",
  "isEnabled": true,
  "templateId": "<GUID>",
  "rolePermissions": [
    {
      "allowedResourceActions": [
        "microsoft.directory/applications/basic/update",
        "microsoft.directory/applications/credentials/update"
      ]
    }
  ]
}
```

**Create Role Assignment:**
```
POST https://graph.microsoft.com/beta/roleManagement/directory/roleDefinitions/roleAssignments

{
  "principalId": "<GUID OF USER>",
  "roleDefinitionId": "<GUID OF ROLE DEFINITION>",
  "resourceScopes": ["/<GUID OF APPLICATION REGISTRATION>"]
}
```

## Common Custom Role: Manage User and Group Assignments

1. Microsoft Entra ID admin center → Roles and administrators → New custom role
2. Name: "Manage user and group assignments"
3. Permissions: `microsoft.directory/servicePrincipals/appRoleAssignedTo/read` and `/update`
4. Create

## Troubleshooting

### Audit Logs

Events appear in Entra ID Audit logs under Category: **RoleManagement**

Recorded activities:
- Add/Update/Delete role definition
- Add/Remove role assignment to/from role definition

**Important**: Permission denied errors at the authorization layer (before backend) are NOT recorded in Audit logs.

### Azure Support Center (ASC)

**User Investigation:**
1. Tenant Explorer → User node → search by ObjectId → Assigned roles tile
2. Active assignments / Eligible membership (PIM)
3. Directory Scopes: `/` = Tenant-wide, `/administrativeUnits/{id}` = AU, `/{id}` = Resource-specific

**Role Definitions:**
1. Tenant Explorer → Directory Roles → Run (empty = list all)
2. Filter: Built-in / Custom / All
3. View details: displayName, roleDefinitionId, resourceScopes, rolePermissions, templateId

**Role Assignments:**
- Copy roleDefinitionId → Directory Roles > Role Assignments → Search by roleDefinitionID

### Kusto Tracing (MSODS)

**Cluster**: `msodsuswest.kusto.windows.net:443`
**Database**: MSODS

#### Tracing Resource Access Issues

**Step 1**: Find correlation using resource objectId:
```kql
let delta = 2m;
let t = datetime("2019-01-17 22:31:52");
GlobalIfxUlsEvents
| where env_time > t - delta and env_time < t + delta
| where message contains "<resource_objectId>"
| project env_time, env_cloud_role, correlationId, contextId, internalCorrelationId, tagId, message
```

**Step 2**: Trace with internalCorrelationId:
```kql
let delta = 2m;
let t = datetime("2019-01-17 22:31:52");
GlobalIfxUlsEvents
| where env_time > t - delta and env_time < t + delta
| where internalCorrelationId == "<id_from_step1>"
| project env_time, env_cloud_role, correlationId, contextId, internalCorrelationId, tagId, message
```

**Step 3**: Check GRANTED vs DENIED:
```kql
let delta = 2m;
let t = datetime("2019-01-17 22:31:52");
Global("IfxBECAuthorizationManager")
| where env_time > t - delta and env_time < t + delta
| where internalCorrelationId == "<id>"
| where tagId == "9xy6"  // Access Denied (use "0azf" for Granted)
| project env_time, env_cloud_role, correlationId, contextId, internalCorrelationId, tagId, task, result
```

**Key tagIds:**
| tagId | Meaning |
| --- | --- |
| `03jm` | Initial request info (ResourcePath, HttpMethod) |
| `0meo` | Calling app info (appId, scopes, roles) |
| `0azf` | Access GRANTED |
| `9xy6` | Access DENIED |

**RBACv1 vs RBACv2:**
- RBACv1: AUTHZ message contains `[Task: *]`
- RBACv2: AUTHZ message contains `[Action: *]`

RBACv1 takes precedence; RBACv2 is a fallback after RBACv1 denies access.

### Role Management Issues

Check IfxUlsEvents logs in MSODS using the correlationId.

## ICM Escalation Path

**Service (L1)**: Microsoft Entra Directory Directories, Domains, and Objects
**Problem (L2)**: RBAC
**Subproblem (L3)**: Problems with custom roles

**Target ICM Team (for TAs):**
- Owning Service: Enterprise App Management
- Owning Team: Enterprise App Management

Note: For custom roles for Enterprise Apps, Enterprise Apps team should be involved first. Entra RBAC team engaged by Enterprise Apps team if needed.

## Available Permissions Reference

Permissions are **additive** — the least restrictive permission gets enforced.

### Create Permissions
- `microsoft.directory/applicationPolicies/create` / `createAsOwner`
- `microsoft.directory/connectorGroups/create`
- `microsoft.directory/connectors/create`
- `microsoft.directory/servicePrincipals/create` / `createAsOwner`

### Read Permissions
- `microsoft.directory/applicationPolicies/allProperties/read` / `owners/read` / `policyAppliedTo/read` / `standard/read`
- `microsoft.directory/applications/applicationProxy/read`
- `microsoft.directory/auditLogs/allProperties/read`
- `microsoft.directory/connectorGroups/allProperties/read`
- `microsoft.directory/connectors/allProperties/read`
- `microsoft.directory/servicePrincipals/allProperties/read` / `appRoleAssignedTo/read` / `appRoleAssignments/read` / `owners/read` / `policies/read` / `standard/read`
- `microsoft.directory/servicePrincipals/getPasswordSingleSignOnCredentials`
- `microsoft.directory/servicePrincipals/oAuth2PermissionGrants/read`
- `microsoft.directory/signInReports/allProperties/read`

### Update Permissions
- `microsoft.directory/applicationPolicies/allProperties/update` / `basic/update` / `owners/update`
- `microsoft.directory/applications/applicationProxy/update` / `applicationProxyAuthentication/update` / `applicationProxySslCertificate/update` / `applicationProxyUrlSettings/update`
- `microsoft.directory/connectorGroups/allProperties/update`
- `microsoft.directory/connectors/allProperties/update`
- `microsoft.directory/servicePrincipals/allProperties/update` / `appRoleAssignedTo/update` / `audience/update` / `authentication/update` / `basic/update` / `credentials/update` / `disable` / `enable` / `owners/update` / `permissions/update` / `policies/update` / `tag/update`
- `microsoft.directory/servicePrincipals/managePasswordSingleSignOnCredentials`

### Delete Permissions
- `microsoft.directory/applicationPolicies/delete`
- `microsoft.directory/connectorGroups/delete`
- `microsoft.directory/servicePrincipals/delete`
