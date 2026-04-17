---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Conditional Access Application Dependencies"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20Conditional%20Access%20Policy/Azure%20AD%20Conditional%20Access%20Application%20Dependencies"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Conditional Access Application Dependencies

## How CA Evaluates Applications

The applications condition in a CA policy is evaluated for the **audience** of every token being issued. For example, if an email app requests an id_token for itself AND an auth_code for Exchange Online, CA policies are evaluated for BOTH.

The list of audience app IDs appears in "Data used for policy evaluation" in the CA Details tab of Sign-Ins Explorer in ASC.

## Dependency Types

### 1. Static Dependencies
Included in ESTS code for first-party apps. Teams owning apps declare that their primary functionality depends on other resources. ESTS evaluates CA policies for these dependent resources when issuing tokens.

Source of truth: `https://dev.azure.com/msazure/One/_git/ESTS-Main?path=/src/Product/ESTSFE/Configuration/settings.ini`

### Key Static Dependency Mappings

**Resource IDs:**
| ResourceId | Name |
|---|---|
| 00000002-0000-0ff1-ce00-000000000000 | Exchange Online |
| 00000003-0000-0ff1-ce00-000000000000 | SharePoint Online |
| 00000004-0000-0ff1-ce00-000000000000 | Skype for Business |
| 797f4846-ba00-4fd7-ba43-dac1f8f63013 | Windows Azure Service Management API |
| 00000003-0000-0000-c000-000000000000 | Microsoft Graph |
| 00000009-0000-0000-c000-000000000000 | Power BI Service |
| 0f698dd4-f011-4d23-a33e-b36416dcb1e6 | officeapps.live.com |
| cc15fd57-2c6c-4117-a88c-83b1d56b4bbe | Microsoft Teams service |

**Key App Dependencies:**
| App | Depends On |
|---|---|
| Teams web client (5e3ce6c0) | Exchange, SharePoint, Skype, Teams service |
| Teams mobile (1fec8e78) | Exchange, SharePoint, officeapps.live.com |
| Teams service (cc15fd57) | Exchange, SharePoint, Skype |
| PowerApps (d1208c34) | PowerApps Service RP, Azure Mgmt API, AAD Graph |
| Power BI Web (871c010f) | Power BI Service |
| Power BI Desktop (7f67af8a) | Power BI Service |
| Planner (09abbdfd) | Microsoft Graph |
| Microsoft Forms (c9a559d2) | Microsoft Graph |

## Troubleshooting Unexpected CA Policy Application

When a CA policy unexpectedly applies to a sign-in:
1. Check the **AudienceAppIds** in the **DataForConditionEvaluation** Message in Kusto/Logsminor
2. Look for dependent resource IDs that may be triggering additional CA policy evaluation
3. Common scenario: "Block All cloud apps" with app exclusion — the excluded app may call back-end resources (e.g., AAD Graph) that ARE covered by the Block policy
