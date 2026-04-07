---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Roles and Administrators/Azure AD RBAC Custom Roles"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Roles%20and%20Administrators%2FAzure%20AD%20RBAC%20Custom%20Roles"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Entra ID RBAC Custom Roles - Support Guide

## Summary

Custom roles in Microsoft Entra ID (formerly Azure AD RBAC) allow fine-grained permissions beyond built-in roles. Custom roles are based on Microsoft Graph (not Azure Resource Manager).

## Key Limitations

- Maximum **100 custom roles** per tenant
- Role assignment can be scoped to: directory-wide, Administrative Units, or specific resources (App Registrations, Enterprise Apps)
- Custom roles are for Azure Identity/AAD targets - for non-AAD first-party services, route to that service's team

## Area of Influence (Scope)

| Scope Level | Description |
|---|---|
| Directory-wide | Full tenant scope (traditional behavior) |
| Administrative Unit | Scoped to one or more AUs |
| Resource-specific | Scoped to specific App Registrations or Enterprise Apps |

## Support Boundaries

| Scenario | Owner | Support Path | PG Escalation |
|---|---|---|---|
| Troubleshooting AAD RBAC denied (403) errors | MSaaS AAD Account Management | Azure/Microsoft Entra Directories, Domains and Objects/RBAC for Azure Resources(IAM)\Problem with custom roles | ICM: AAD Distributed Directory Services/RBAC Graph API |
| Troubleshooting custom role creation when permissions are known | MSaaS AAD Account Management | Same | Same |
| Troubleshooting permissions for Azure Identity/AAD target service | MSaaS AAD Account Management | Same | Same |
| Troubleshooting permissions for non-Azure Identity first-party service | 1st Party Service Support Team | SAP for 1st party | 1st Party Service PG |

## CSS Workflows

- [Microsoft Entra ID RBAC Custom Roles for App Registrations](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageID=183977)
- [Microsoft Entra ID RBAC Custom Roles for Enterprise Apps](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageID=275839)

## ICM Escalation Path

- **Owning Service**: AAD Distributed Directory Services
- **Owning Team**: RBAC Graph API
