---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Entitlement Management Catalog Privilege Levels"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FEntitlement%20Management%20Catalog%20Privilege%20Levels"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Entitlement Management Catalog Privilege Levels

## Privilege Levels

### Standard Catalog
- Default type for most catalogs
- Remains standard if no privileged resources added
- Supports all catalog management actions

### Privileged Catalog
- Auto-assigned when catalog contains: Microsoft Entra roles, Application API permissions
- Stricter access and governance controls

## Privileged Catalog Restrictions

- **Application access**: Must have directory role management permissions to write
- **User access**: Only Global Admins or Privileged Role Admins + Identity Governance Admin can create/update/delete
- **Auto-assignment policies**: Cannot create new auto-assignment policies for privileged catalogs

## Updating Privilege Level

1. Sign in as Identity Governance Administrator (or Catalog creator)
2. Browse to ID Governance > Catalogs
3. Open catalog > Privilege level (Preview) > select level > Save

### Programmatic Update
Update `PrivilegeLevel` setting via Microsoft Graph with `EntitlementManagement.ReadWrite.All` delegated permission.

## ICM Path

**Owning Service**: Azure AD Entitlement Lifecycle Management
**Owning Team**: Triage
