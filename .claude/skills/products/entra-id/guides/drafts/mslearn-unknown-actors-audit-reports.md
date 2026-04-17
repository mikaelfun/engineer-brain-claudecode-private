# Unknown Actors in Microsoft Entra Audit Reports

Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/governance/unknown-actors-in-audit-reports

## Summary

Reference table of common Microsoft first-party service principal actors found in Entra audit logs.

## Common Unknown Actors

| Actor Name | Service | Description |
|---|---|---|
| Azure Credential Configuration Endpoint Service | Auth Methods Registration | Appears when authentication methods are registered (combined registration) |
| cxpweb_service@support.onmicrosoft.com | CXP | Internal Microsoft Support tenant account for support case migration |
| DaRT Team | Partner Center | DAP termination by Microsoft (Microsoft-led DAP deprecation) |
| fim_password_service@support.onmicrosoft.com | SSPR | Performs Self Service Password Reset operations |
| Microsoft Approval Management | SSGM | Dynamic groups and Office 365 Group expiration policy |
| Microsoft Azure AD Internal - Jit Provisioning | Entra ID | Auto-create/update service principals for Microsoft services |
| Microsoft Azure Management | ARM | Manages Service Administrator accounts for Azure subscriptions |
| Microsoft Entra Subscription Lifecycle Process | License Manager | Removes licenses/subscriptions when expired |
| Microsoft Exchange Online Protection | SCC | EOP writes changes (e.g., MIP labels) to Entra ID |
| Microsoft Managed Policy Manager | Conditional Access | Creates/manages Microsoft-managed CA policies |
| Microsoft Substrate Management | Exchange | Dual write operations from Exchange Online to Entra ID |
| MS-CE-CXG-MAC-AadShadowRoleWriter | License/Purchase | Assigns M365 commerce role permissions (e.g., Modern Commerce Admin) |
| Signup | Commerce Licensing | Self-service subscription signup |
| spo_service@support.onmicrosoft.com | SharePoint Online | Creates ACS principles for SharePoint apps |
| Windows Azure Service Management API | ARM | Maintains access for Azure subscriptions, resource provider registration |

## Key Identifiers

- Microsoft Services Tenant ID: `f8cdef31-a31e-4b4a-93e4-5f571e91255a`
- Microsoft Corp Tenant ID: `72f988bf-86f1-41af-91ab-2d7cd011db47`
