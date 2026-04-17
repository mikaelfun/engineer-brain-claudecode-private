---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Privilege Identity Management (PIM)/Azure RBAC PIM for Azure Lighthouse"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FPrivilege%20Identity%20Management%20%28PIM%29%2FAzure%20RBAC%20PIM%20for%20Azure%20Lighthouse"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure RBAC PIM for Azure Lighthouse

## Summary

Azure Lighthouse allows delegated resource management of Azure Subscriptions and Resource Groups to a Managed Service Provider (MSP) tenant. PIM integration enables eligible authorizations for just-in-time RBAC role access with optional approvers.

## Case Management / Routing

| Scenario | Support Team | SAP Path | Escalation |
|---|---|---|---|
| Managing permanent/eligible authorizations in Lighthouse Deployment (CRUD) | MSaaS POD Azure Dev ARM Prem | Azure\Lighthouse | Lighthouse PG |
| Eligible Role Activation/deactivation issues | MSaaS AAD - Account Management | Azure\Azure Active Directory Governance...\PIM | Azure PIM PG |
| Governance API issue at deployment | MSaaS AAD - Account Management | Azure\Azure Active Directory Governance...\PIM | Azure PIM PG |

## License Requirements

- **Before July 1, 2023**: Azure AD Premium P2 or EMS E5
- **After July 1, 2023**: AAD P2 customers do NOT need the new Entra ID Governance license for PIM (GA before cutoff). New features in Preview after July 1, 2023 require the Governance license.
- MSP tenant must be licensed (EMS E5 or AAD P2). Customer tenant has no license requirement.

## Requirements

1. Minimum one Permanent Authorization required (no plans to remove this limitation)
2. EMS E5 or AAD P2 on MSP tenant
3. Microsoft.ManagedServices resource provider enabled on customer subscription
4. Owner RBAC role on customer tenant for delegation
5. Deployment via Azure CLI, Az PowerShell, Terraform, REST APIs, or auto-deploy templates

## Limitations (Critical)

1. Minimum one Permanent Authorization always required
2. Eligible authorizations do NOT work with service principals
3. Custom roles and classic subscription admin roles NOT supported
4. Built-in roles with DataActions NOT supported
5. Owner role CANNOT be delegated (permanent or eligible)
6. User Access Administrator only supported as permanent Authorization (not eligible) - requires delegatedRoleDefinitionIds
7. Maximum activation duration: 8 hours
8. Only Azure AD Security groups supported (not O365 groups)
9. Customers cannot see delegated assignments in IAM blade (must use Azure Lighthouse blade)
10. Approvers must be in managing tenant - B2B accounts will NOT see approval requests or receive emails

## Deployment Templates

- [Subscription Deployment](https://github.com/Azure/Azure-Lighthouse-samples/tree/master/templates/delegated-resource-management-eligible-authorizations/subscription)
- [Resource Group Deployment](https://github.com/Azure/Azure-Lighthouse-samples/tree/master/templates/delegated-resource-management-eligible-authorizations/rg)
- [Multiple Resource Group Deployment](https://github.com/Azure/Azure-Lighthouse-samples/tree/master/templates/delegated-resource-management-eligible-authorizations/rg)

## Public Documentation

- [Create eligible authorizations](https://docs.microsoft.com/en-us/azure/lighthouse/how-to/create-eligible-authorizations)
- [Onboard a customer to Azure Lighthouse](https://docs.microsoft.com/en-us/azure/lighthouse/how-to/onboard-customer)
