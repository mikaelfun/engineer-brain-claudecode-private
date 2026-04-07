---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Azure AD Federated SSO"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FAzure%20AD%20Federated%20SSO"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Federated SSO Troubleshooting Guide

## Feature Overview

Azure AD supports the following authentication protocols for single sign-on:
- OAuth 2.0
- OpenID Connect 1.0
- SAML Protocol
- WS-Federation 1.2

All federated SSO features are tested for SAML protocol only. Other protocols may work but are not officially tested.

### Types of SSO Initiation

- **SP Initiated SSO**: Preferred. Supports deep linking and mobile applications natively.
- **IDP Initiated SSO**: Fallback when SaaS application does not support SP initiated SSO.

## Data Collection for Troubleshooting

### Required Data from Customer

1. **Application details**: Precise app name, sign-on URL, whether from gallery or custom app
2. **Tenant info**: Azure AD tenant ID or verified domain
3. **User info**: UPN and User ID of affected user
4. **Error details**: Time range, error messages, screenshots
5. **Network trace**: Fiddler capture or Firefox SAML tracer plugin
6. **IDP errors**: Full error message with correlationID and timestamp
7. **AADSTS error codes**: If error code (AADSTS*XXXXX*) is shown, typically indicates configuration issues

### Common Configuration Issues (AADSTS Error Codes)

- AAD URLs not configured correctly inside the app
- App URLs not configured correctly in Azure AD
- User not assigned to app in Azure AD

### Post-AAD Sign-in Issues

If user is redirected to app after Azure AD sign-in but not signed in:
- User account may not have been provisioned to the application
- User ID sent by Azure AD may not match the provisioned user account
- Azure AD certificate may not be configured correctly in app

## Investigation Steps

1. Determine Source of Initiation (SP vs IDP)
2. Identify Type of Application (gallery vs custom)
3. Verify configuration tutorial was followed for gallery apps
4. Deduce location and cause of failure:
   - Component generating the SAML request (SaaS app or IAMUX)
   - Component consuming the SAML request (ESTS)
   - Component generating the SAML response (ESTS)
   - Component consuming the SAML response (SaaS app)
5. Keep public documentation and metadata.json handy
6. Compare Expected vs Actual Issuer and ReplyUrls

## Known Issues

### Sign-on URL SAML SSO Reverts After Update

After updating the sign-on URL in Azure portal, the page reverts to the previous value on refresh.

**Workaround** (ICM 173860105):
1. Disable single sign-on, then set it back to SAML
2. Set only Identifiers and Reply URLs first, then save
3. Add the needed Sign-on URL separately, then save again
