---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Reporting for Conditional Access Audiences"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20Conditional%20Access%20Policy/Azure%20AD%20Reporting%20for%20Conditional%20Access%20Audiences"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Conditional Access Audience Reporting

When users sign into an application like Microsoft Teams, they think of it as accessing a single service. In reality, Teams requests tokens for multiple resources: Teams Services, Exchange Online (calendar), SharePoint Online (files), Microsoft Graph (profile picture), and more.

Conditional Access must evaluate policies against ALL audiences (resources) requested during a sign-in, not just the primary application. This means a CA policy targeting Excel/SharePoint can affect a Teams sign-in because Teams requests access to SharePoint.

## Audience Information in CA Policy Details

The audience information is displayed under a collapsible within the application section in the policy details pane:

- **First column**: Name of the audience (resource)
- **Second column**: Resource ID of the audience
- **Tooltip**: "Audience refers to the list of resources that are evaluated for Conditional Access as a part of this sign-in event."

## Key Concepts

- A sign-in to Teams may trigger CA evaluation for Teams Services, EXO, SPO, and Graph APIs simultaneously
- If ANY policy matches ANY requested audience, the CA controls are enforced
- Admins can use audience information to configure policy exclusions accordingly

## ICM Escalation

- **Owning Service**: ESTS
- **Owning Team**: Conditional Access
- **ICM Template**: [Support Engineer ICM Template](https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=83L3k1)

## Documentation

- [Conditional Access policy details](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies)
