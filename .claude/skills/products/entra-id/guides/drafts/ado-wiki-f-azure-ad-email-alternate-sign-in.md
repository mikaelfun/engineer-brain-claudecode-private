---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Azure AD Email as an Alternate Sign-in Identifier"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FAzure%20AD%20Email%20as%20an%20Alternate%20Sign-in%20Identifier"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Email as Alternate Sign-in Identifier

## Summary

Entra ID Email as an Alternate Sign-in Identifier gives users the ability to sign in with their email address as well as their UPN. Tenant administrators configure a Home Realm Discovery (HRD) policy to allow the common Azure AD login endpoint to accept the user's Proxy Email address (Primary or Alias) as their sign-in name.

This works for non-federated accounts whose email belongs to a verified domain.

## Requirements

- Email addresses must align with Verified domains
- Global Administrator credentials
- Azure AD Preview PowerShell Module

## Licensing

None required.

## Supported Topologies

| Technology | Supportability |
|-----------|---------------|
| AD FS (Active Directory Federation Service) | **Not supported** |
| PHS (Password Hash Sync) | Supported |
| PTA (Pass-through Authentication) | Supported |
| Managed | Supported |

Federated customers can deploy Staged Rollout of Seamless SSO and PTA to test.

## Limitations

- Not compatible with Skype for Business
- Users may see their UPN even when signed in with email
- Identity Protection: Leaked Credentials do not match proxy addresses for risk detection
- Audit Logs: HRD policy updates are not recorded; only create/delete events are logged
- Sign-In Logs: "Alternate sign-in name" field is not a consistent indicator
- Tenant administrator role required to configure

## Basic Troubleshooting

1. Direct users to test sign-in using email
2. If email sign-in fails, have them test the same sign-in using their UPN
3. If UPN works but email does not, engage PG for email sign-in investigation

**NOTE**: If UPN sign-in succeeds, the issue is likely due to the application incorrectly assuming the `unique_name` or `preferred_username` claim contains the alternate ID and authorization is failing.

## Configuration

To update Policies, use Microsoft Graph API. See Microsoft Entra policy overview documentation.

## Deployment with Staged Rollout

Customers should perform initial testing using Staged Rollout to specific groups before deploying tenant-wide.
