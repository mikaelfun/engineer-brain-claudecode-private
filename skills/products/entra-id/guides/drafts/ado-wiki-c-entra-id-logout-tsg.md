---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Entra ID Logout TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FEntra%20ID%20Logout%20TSG"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Entra ID Logout Troubleshooting Guide

## Data Collection
1. Fiddler (preferred) or HAR capture while logging out and reproducing the issue
2. Fiddler (preferred) or HAR capture if there is a working session
3. Compare working vs non-working: source app, logout URL, SamlRequest params, cookies, request body

## Logout Flow

### Step 1: Application Sends Logout Request

**OIDC logout URLs:**
- v2: `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=...`
- v1: `https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=...`

**SAML2 logout URL:**
- `https://login.microsoftonline.com/{tenant-id}/saml2?SamlRequest=xxx`
- SamlRequest must include: ID, Version (2.0), IssueInstant, Issuer (must match App ID URI), NameID (required but not validated)

**Key diagnostic:** Check `function InitiatorRedirect()` in response source to determine next hop.

**Issues:**
- App not redirecting to Entra for logout: Application may not be sending logout request to Entra
- Prompted to select account: See MS Learn article on logging out without user selection prompt

### Step 2: Session Logouts

- **v2 without logout_hint** → redirects to logoutsession endpoint
- **v1 or v2 with logout_hint** → stays on logout page

**Front Channel Logout:**
- Entra ID sends POST calls in hidden iframes to all configured Front Channel Logout URLs
- Requests include `sid` query parameter
- Identify by looking for `sid` param in requests

**Issues:**

#### AADSTS90023: Invalid request (session id without issuer)
- **Cause**: App registration has Front Channel Logout URL pointing to Entra ID endpoints
- **Fix**: Remove the URL pointing to login.microsoftonline.com or login.windows.net. Wait 30 min.

#### Invalid Front Channel Logout URL (404)
- **Cause**: Misconfigured or dead Front Channel Logout URL
- **Diagnosis**: Check Fiddler for `sid` parameter requests returning errors after logoutsession
- **Fix**: Use PowerShell to find all apps with matching logoutUrl:
```powershell
$logoutUrl = 'app.contoso.com'
Connect-MgGraph -Scopes Application.Read.All
$apps = Get-MgApplication -All -Pagesize 999
$sps = Get-MgServicePrincipal -All -Pagesize 999
# ... enumerate and filter by logoutUrl
$results | where logoutUrl -match $logoutUrl
```
Update or remove the URL. Wait 30 min for propagation.

### Step 3: Federated Domain Redirect
- Only applies if domain is federated
- Redirects to federated signOutUri from internalDomainFederation
- SAML LogoutRequest sent with wa=wsignout1.0

## Key Troubleshooting Tips
- Always check InitiatorRedirect() in response source
- Front Channel Logout identified by `sid` parameter
- Compare working vs non-working captures
- Changes take up to 30 minutes to propagate
