---
title: Unknown Actors in Microsoft Entra Audit Reports
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/governance/unknown-actors-in-audit-reports
product: entra-id
date: 2026-04-18
type: reference-table
21vApplicable: true
---

# Unknown Actors in Microsoft Entra Audit Reports

Reference table of common Microsoft first-party service principal actors found in Entra audit logs.

## Key Actors

| Actor | Service | Purpose |
|-------|---------|---------|
| Azure Credential Configuration Endpoint Service | Auth Methods | Authentication method registration (combined registration) |
| cxpweb_service@support.onmicrosoft.com | CXP | Microsoft Support tenant, support case migration |
| DaRT Team | Partner Center | DAP termination by Microsoft (DAP deprecation) |
| fim_password_service@support.onmicrosoft.com | SSPR | Self-Service Password Reset operations |
| Microsoft Approval Management | SSGM | Dynamic groups, Office 365 Group expiration |
| Microsoft Azure AD Internal - Jit Provisioning | Entra ID | Auto-create/update service principals for Microsoft services |
| Microsoft Azure Management | ARM | Ensures subscription Service Admins have Entra accounts |
| Microsoft Entra Subscription Lifecycle Process | License Manager | Remove licenses/subscriptions when expired |
| Microsoft Exchange Online Protection | SCC | Push MIP labels from SCC to Entra |
| Microsoft Managed Policy Manager | CA | Microsoft-managed Conditional Access policies |
| Microsoft Substrate Management | Exchange | Exchange Online dual-write to Entra ID |
| MS-CE-CXG-MAC-AadShadowRoleWriter | Commerce | Assign commerce roles (e.g., Modern Commerce Administrator) |
| Signup | Commerce Licensing | Self-service subscription signup |
| spo_service@support.onmicrosoft.com | SharePoint | Azure ACS principals for SharePoint apps |
| Windows Azure Service Management API | ARM | Maintain access for Azure subscriptions, resource provider registration |

## Troubleshooting Tips
- If you see an unknown actor in audit logs, check this table first
- Microsoft tenant ID for first-party apps: f8cdef31-a31e-4b4a-93e4-5f571e91255a (Microsoft Services) or 72f988bf-86f1-41af-91ab-2d7cd011db47 (Microsoft Corp)
- Not all first-party actors are listed here; the list is a subset of examples
