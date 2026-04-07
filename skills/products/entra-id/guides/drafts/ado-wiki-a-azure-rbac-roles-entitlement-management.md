---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Azure RBAC Roles in Entitlement Management"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FAzure%20RBAC%20Roles%20in%20Entitlement%20Management"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure RBAC Roles in Entitlement Management

Entitlement Management supports governing Azure RBAC role assignments in Access Packages at Management Group (except root), Subscription, and Resource Group levels. Individual resource scope is not supported.

## Permissions

Catalog administrator must have at scope:
- `Microsoft.Authorization/roleassignments/read`
- `Microsoft.Authorization/roleassignments/write`
- `Microsoft.Authorization/roleassignments/delete`

## Licenses

- Entra ID Governance (EIG) or Entra Suite

## Supported Scenarios

| Catalog Scope | Access Package Scope | What End Users Receive |
|---|---|---|
| Management Group | Management Group | Eligible or active Azure roles at MG scope |
| Subscription | Subscription | Eligible or active Azure roles at Sub scope |
| Subscription | Resource Group | Eligible or active Azure roles at RG scope |

## Configuration Steps

1. Go to Entitlement Management > Catalogs
2. In Resources blade, click + Azure Resources > Azure Resources (Preview)
3. Select Management Group or Subscription as highest scope
4. In Access Packages > New > Resource roles tab, select Azure Resources (Preview)
5. Choose Resource Type, Scope, Role Type (Eligible/Active), and Role
6. Complete wizard

## ICM Path

**Owning Service**: Entra ID Entitlement Lifecycle Management
**Owning Team**: Triage
