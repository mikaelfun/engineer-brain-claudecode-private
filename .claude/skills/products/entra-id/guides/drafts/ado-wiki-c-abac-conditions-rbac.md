---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure RBAC for Resources/ABAC Conditions On Azure RBAC Role Assignments"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20RBAC%20for%20Resources/ABAC%20Conditions%20On%20Azure%20RBAC%20Role%20Assignments"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ABAC Conditions on Azure RBAC Role Assignments

## Summary

Attribute Based Access Control (ABAC) provides fine-grained access management to Azure resources. ABAC Conditions can be written on specific DataAction permissions for Azure Blob Services. Only when the condition is satisfied will the resource provider grant or deny access.

**NOTE**: ABAC Conditions on Azure RBAC Role Assignments is NOT applicable to Azure AD RBAC role assignments.

## Support Boundaries

| Scenario | Supported By |
|-----|-----|
| CRUD operations of Azure RBAC Roles and ABAC Conditions | Microsoft Entra ID - Account Management |
| RBAC Role Assignment correct but access not granted/unexpectedly granted | Target resource team (e.g., MSaaS POD Azure IaaS Storage) |

Storage Authentication issues route to **MSaaS POD Azure IaaS Storage**. The Identity team handles ABAC condition CRUD + attributes/data actions/scope questions.

## Supported Roles and DataActions

ABAC Conditions apply to DataAction permissions on these roles:
- **Storage Blob Data Contributor**: delete, read, write, move, add
- **Storage Blob Data Owner**: full blob permissions (*)
- **Storage Blob Data Reader**: read

## Scoping

ABAC Conditions can be defined at:
- Management Group
- Subscription
- Resource Group

**NOT supported** directly on Azure Storage accounts or Containers.

## Known Issues

### Issue 1: Blob Index Tags Don't Persist On Upload
Uploading page blobs with index tags doesn't persist the tags. **Fix**: Set tags after uploading.

### Issue 2: @container Filter Only Works with Equality Checks
The `@container` filter expression only works if all index tags in the expression are equality checks (`key=value`).

### Issue 3: Range Operators Fail with Different Index Tags
Range operators with AND only work when the same index tag key is used (e.g., `"Age" > '013' AND "Age" < '100'`).

### Issue 4: Versioning and Blob Index Not Supported
Blob index tags are preserved for versions but aren't passed to the blob index engine.

### Issue 5: "The given role assignment condition is invalid"
Common cause: defining a Scope at Storage account or Container level. Move to Management Group, Subscription, or Resource Group.

### Issue 6: Condition Column Missing from Access Control (IAM)
Same scope issue - Storage doesn't support scoping to account or Container level.

## IAM ABAC Failure Reasons

| Failure Reason | Description |
|-----|-----|
| GrantedByRBAC | Granted by RBAC |
| GrantedByABAC | Granted by ABAC |
| DeniedWithNoValidRBAC | No role assignment can grant permission, no ABAC condition exists |
| DeniedByDenyAssignment | Denied by deny assignment without ABAC |
| DeniedWithABACEvaluationInRA | No role assignment grants permission, at least one has ABAC condition evaluated |
| DeniedWithMissingAttributesInRA | ABAC condition evaluated but required attributes not provided by PEP |

## Managing ABAC Conditions

Navigate to **Access Control (IAM)** > **Role assignments** tab. The **Conditions** column states:
- **None**: Role doesn't support DataActions
- **Add**: No condition set, but role supports DataActions
- **View**: Inherited condition from different scope (read-only)
- **View/Edit**: Condition set at current scope (editable)

## PIM Integration

PIM supports creating ABAC Conditions on Azure resource role assignments. When creating a role assignment for a DataAction-supporting role, the **Settings** blade exposes **Role assignment conditions** with an **+Add condition** link.
