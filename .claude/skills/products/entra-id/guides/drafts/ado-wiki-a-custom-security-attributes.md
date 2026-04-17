---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD User Management/Azure AD Custom Security Attributes"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20User%20Management%2FAzure%20AD%20Custom%20Security%20Attributes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Azure AD Custom Security Attributes - TSG

## Overview

Custom security attributes are business-specific key-value pairs defined in Azure AD for Attribute Based Access Control (ABAC). They support:
- Data types: Boolean, integer, string
- Predefined or free-form values
- Single or multi-valued
- Supported objects: Users, Enterprise applications (service principals), Managed identities

## Key Roles (Critical - Not Default!)

| Role | Purpose |
|------|---------|
| **Attribute Definition Administrator** | View/create attribute definitions and sets |
| **Attribute Assignment Administrator** | Assign attributes to users/apps |
| **Attribute Log Reader** | View custom security attribute audit logs |
| **Attribute Log Administrator** | View + configure diagnostic settings for attribute audit logs |

> **CRITICAL**: Global Administrator and Global Reader do NOT have permissions for Custom Security Attributes by design. This is an intentional security boundary.

## Architecture Limits

| Resource | Limit |
|----------|-------|
| Attributes per attribute set | 500 |
| Attribute name length | 32 characters (unicode) |
| Attribute description | 128 characters |
| Attribute set name length | 32 characters (unicode) |
| Predefined values per attribute | 100 |
| Values assignable per principal | 50 (across single and multi-valued) |

## Naming Constraints
- Attribute set names: NO spaces allowed
- Attribute names: NO spaces allowed
- Use camelCase or underscores instead

## Limitations

1. **No view showing all users assigned to a specific attribute** - must query via Graph API
2. **On-premises synced users not supported** - cloud-only users and B2B guests only
3. **Not supported in B2C tenants**
4. **Dynamic membership rules not supported** with custom security attributes
5. **No spaces** in AttributeName or AttributeSet values

## MSODS Architecture

### Attribute Definitions
- Top-level node: CustomSecurityAttribute
- Contains objects with AttributeSet and CustomSecurityAttributeName
- No links on objects

### Principals
- Each assigned attribute creates a new attribute on the principal
- Named sequentially: CustomSecurityAttribute1, CustomSecurityAttribute2, etc.

## Custom Security Attributes vs Schema Extensions

| Aspect | Custom Security Attributes | Schema Extensions |
|--------|---------------------------|-------------------|
| Authorization | Separate permissions via dedicated roles | Access tied to Azure AD object |
| Lifecycle | Independent of applications | Tied to app lifecycle |
| Use case | ABAC, authorization scenarios | Data storage, non-auth scenarios |

## Steps to Use

1. Define custom security attributes in Azure AD
2. Assign Attribute Definition Administrator and Attribute Assignment Administrator roles
3. Assign attributes to users and Azure AD objects
4. Use for authorization (ABAC conditions on Azure RBAC role assignments)

## Troubleshooting

### Global Admin cannot manage attributes
- **Expected behavior** - assign Attribute Definition/Assignment Administrator roles instead
- Global Reader also cannot read attributes

### Cannot assign to on-prem synced user
- **By design** - only cloud-only users, B2B guests, SPs, and managed identities supported
- Use directory extension attributes via Azure AD Connect for on-prem synced users

### Attribute creation fails with spaces
- Remove spaces from attribute set and attribute names
- Use camelCase or underscores

### Cannot find which users have a specific attribute
- Use Microsoft Graph API: GET /users?$filter=customSecurityAttributes/{attributeSet}/{attributeName} eq '{value}'
- No portal view exists for this query

## Public Documentation
- [Custom security attributes overview](https://learn.microsoft.com/entra/fundamentals/custom-security-attributes-overview)
- [Add/deactivate attribute definitions](https://learn.microsoft.com/entra/fundamentals/custom-security-attributes-add)
- [ABAC conditions on Azure RBAC](https://learn.microsoft.com/azure/role-based-access-control/conditions-format)
