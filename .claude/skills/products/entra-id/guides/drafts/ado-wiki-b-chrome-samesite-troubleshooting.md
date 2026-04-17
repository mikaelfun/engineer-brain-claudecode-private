---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Chrome SameSite"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FChrome%20SameSite"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Chrome SameSite Cookie Troubleshooting Guide

## Overview

Starting with Chrome 80 (February 4, 2020), Chrome enforces SameSite cookie attribute changes that can break Azure AD and ADFS authentication flows. This guide helps determine if SameSite is the root cause and provides remediation steps.

## Likely Support Topics

Customers will file under:
- Office 365, Azure AD, Azure AD Premium, or EMS: authentication/sign-in issues
- Azure AD B2C: authentication issues

## Likely Symptoms

- Applications logging in to Azure AD go into browser redirect loop
- Applications return broken/partially rendered pages after sign-in
- Plugins/embedded apps in Teams, SharePoint don't render or show errors
- Sign-out scenarios not working
- Customer explicitly cites SameSite or related error messages

## Troubleshooting Decision Tree

1. **Does the problem repro on Edge/IE/Edge Chromium or Firefox?**
   - YES -> **Not a SameSite issue.** Debug as normal sign-in issue.
   - NO -> Continue

2. **Is Chrome version 80+?** (Check at chrome://settings/help)
   - NO -> SameSite is off by default. For Chrome 77-79, check chrome://flags for SameSite flags.
   - YES -> Continue

3. **Is only a small set of users affected?**
   - YES -> Likely NOT SameSite (SameSite breaks for most Chrome 80+ users)
   - NO -> Continue

4. **Validate via Chrome DevTools (F12):**
   - Open Console: look for cookie warnings
   - Ignore warnings for login.microsoftonline.com domains
   - Check Applications tab > Cookies:
     - ASP.NET: OpenIdConnect cookie MUST have `SameSite=None` and `Secure` set
     - Other frameworks: check Nonce, State, Oidc, OpenID cookies
     - Any cookie without `SameSite=None` and `Secure` is a potential cause

## Remediation

If confirmed SameSite issue:

### Customer-developed or customer-configured 3rd party app:
1. **Temporary:** Don't use Chrome while updating the site
2. **Admin workaround:** Set Chrome group policy to disable SameSite change
3. **Permanent fix:** Update website per:
   - [Chrome SameSite cookie recipes](https://web.dev/samesite-cookie-recipes/)
   - ASP.NET guidelines for SameSite cookies

### Microsoft Application:
- If a Microsoft app/service is broken due to SameSite, file an ICM urgently to the ESTS team (note to engage Hirsch Singhal)

## Reference

- [Chrome behavior affects applications](https://docs.microsoft.com/en-us/office365/troubleshoot/miscellaneous/chrome-behavior-affects-applications)
