---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Microsoft Graph RBAC APIs/Unified RBAC API Trouble Shooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FMicrosoft%20Graph%20RBAC%20APIs%2FUnified%20RBAC%20API%20Trouble%20Shooting%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Unified RBAC API Troubleshooting Guide

## Introduction

This article contains information on how to troubleshoot common Unified RBAC API scenarios.

### Prerequisite Reading

- [Unified RBAC Onboarding Guide](https://aka.ms/unifiedrbaconboarding)
- [Unified RBAC API documentation](https://docs.microsoft.com/en-us/graph/api/resources/rolemanagement?view=graph-rest-beta)

## How does the RBAC API work?

The RBAC API system flows data between components:
1. Client sends request to MS Graph RBAC API
2. Graph routes to the appropriate RBAC provider (Azure AD, Intune, Exchange, etc.)
3. Provider processes the request and returns results

## Customer Scenarios

### How does the MS Graph HTTP call look like?

```
GET https://graph.microsoft.com/beta/roleManagement/directory/roleAssignments?$filter=roleDefinitionId eq 'c2cb59a3-2d01-4176-a458-95b0e674966f'

GET https://graph.microsoft.com/beta/roleManagement/deviceManagement/roleAssignments?$filter=roleDefinitionId eq 'c2cb59a3-2d01-4176-a458-95b0e674966f'
```

### Why is there a separate role assignment object (unifiedRoleAssignmentMultiple) for Intune?

Intune supports multiple security principals and multiple scopes in a single role assignment. This is different from Azure AD and other RBAC providers which support only one principal and one scope. That is why a separate schema (unifiedRoleAssignmentMultiple) was created for Intune.

### Why are there 2 different types of scopes - directoryScopeId and appScopeId?

- **directoryScopeId** references Azure AD objects (tenant, admin units, groups, etc.)
- **appScopeId** references scopes native to an application (non-Azure AD objects), used by Intune and other RBAC providers

> **Note:** Providing one of directoryScopeId or appScopeId when creating a role assignment is **mandatory**.

### Can I use resourceScopes?

**Not recommended.** The `resourceScopes` attribute will be deprecated soon. Use `directoryScopeId` or `appScopeId` instead.

### What is the meaning of "/" in the documentation?

`/` means the entire tenant when used as a `directoryScopeId` value.

Example - Assigning Password Admin role at tenant level:

```json
POST https://graph.microsoft.com/beta/roleManagement/directory/roleAssignments 
Content-type: application/json 
{
    "@odata.type": "#microsoft.graph.unifiedRoleAssignment", 
    "roleDefinitionId": "966707d0-3269-4727-9be2-8c3a10f19b9d", 
    "principalId": "f8ca5a85-xxxx-xxxx-xxxx-xxxxxxxxxxxx", 
    "directoryScopeId": "/"
}
```

### What permissions do I need to manage roles via an application?

In **delegated flow**, effective permission = intersection of user permissions AND app permissions:
- **User**: Must be Privileged Role Admin or Global Admin
- **App**: Must have `RoleManagement.ReadWrite.Directory` or `Directory.ReadWrite.All` OAuth scope

Similarly, for Intune, Exchange and other workloads, use the corresponding workload-specific permissions.

### How to get the full list of permissions for custom roles?

- **Intune**: Use `List resourceOperations` API (old Intune API, not part of unified model)
- **Azure AD**: Check Azure portal > Azure AD > Roles & admin > New custom role > Permissions

### How to get the full list of RBAC providers?

Currently no programmatic mechanism. Plans to add this functionality in the future.

### How to make eligible role assignments via PIM?

PIM onboarding to Unified RBAC API was planned for FY20Q4.

## Error Scenarios

### Azure AD Provider Errors

#### RoleAssignment API Errors
(See ADO Wiki for detailed error tables via templates)

#### RoleDefinitions API Errors
(See ADO Wiki for detailed error tables via templates)

### Intune Provider Errors

#### RoleAssignment API Errors
(See ADO Wiki for detailed error tables via templates)

#### RoleDefinition API Errors
(See ADO Wiki for detailed error tables via templates)

## Kusto Queries

For detailed Kusto log investigation, review:
[Kusto Tracing of RBAC V1 or V2 Authorization Success](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183977&&anchor=kusto-tracing-of-rbacv1-or-v2-authorization-success-%26-error)
