# ENTRA-ID OAuth2/OIDC Protocol — Detailed Troubleshooting Guide

**Entries**: 85 | **Drafts fused**: 9 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-lab-oauth-flows-insomnia-fiddler.md, ado-wiki-b-single-logout-scenario-oidc.md, ado-wiki-c-insomnia-oauth-testing-setup.md, ado-wiki-c-jwt-ms-oauth-testing-guide.md, ado-wiki-c-lab-jwt-ms-saas-oauth2-testing.md, ado-wiki-c-lab-oauth2-client-resource-applications.md, ado-wiki-e-Custom-OIDC-External-Identity-Federation.md, ado-wiki-e-encrypt-decrypt-oauth2-tokens.md, onenote-workload-identity-federation-oidc.md
**Generated**: 2026-04-07

---

## Phase 1: Oauth2
> 9 related entries

### Client Credential flow using certificate fails with authentication error - script cannot find or authenticate with the certificate
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Certificate thumbprint in the script does not match the actual thumbprint of the certificate in the certificate store

**Solution**: Run 'Get-ChildItem -Path Cert:\CurrentUser\My\' to list all certificates with thumbprints and verify exact match. Use: Get-ChildItem -Path Cert:\CurrentUser\My\ | Where-Object -Property Thumbprint -EQ '{thumbprint}'

---

### Client Credential flow with certificate fails - token request rejected with invalid_client or unauthorized_client error
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Client ID (Application ID) in the script does not match the application registration that has the certificate uploaded in Entra ID

**Solution**: In Azure portal -> App registrations, locate the app associated with the certificate and copy the correct Application (client) ID. Verify the certificate thumbprint is uploaded under that app's Certificates & secrets.

---

### Client Credential flow with certificate fails - token endpoint returns error about tenant not found or invalid tenant
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Tenant ID in the script does not match the tenant where the client application is registered

**Solution**: In Azure portal -> App registrations, find the app and verify the Directory (tenant) ID in the Overview blade. Use the correct tenant ID or tenant domain (yourtenant.onmicrosoft.com) in the token endpoint URL.

---

### Client Credential flow with certificate fails - POST to token endpoint returns 404 or endpoint not found
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Token endpoint URL is incorrect or uses wrong API version path

**Solution**: Use the correct token endpoint format: https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token (v2.0 endpoint). For v1.0: https://login.microsoftonline.com/{tenant}/oauth2/token

---

### Client Credential flow with certificate fails - Get-Item Cert:\CurrentUser\My\{thumbprint} returns nothing or certificate not found
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Certificate (with private key) is not imported to the CurrentUser\My certificate store on the machine executing the script

**Solution**: Import the certificate .pfx file to the CurrentUser\My store via certmgr.msc or PowerShell. Alternatively, use Microsoft Graph PowerShell SDK v2 which supports both CurrentUser and LocalMachine certificate stores: Connect-MgGraph -ClientId '{clientId}' -TenantId '{tenant}' -CertificateThumbprint '{thumbprint}'

---

### Client Credential flow with certificate - client_assertion JWT is rejected by Entra ID token endpoint with invalid signature or invalid_client error
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: JWT client_assertion is incorrectly constructed: not signed with the certificate private key, wrong x5t header value (should be base64url-encoded SHA1 cert hash), or wrong signing algorithm

**Solution**: Ensure the JWT: (1) uses RS256 algorithm in header, (2) x5t header = base64url(SHA1(cert)) replacing +->- /->_ removing =, (3) signed using RSA private key with PKCS1 padding + SHA256. Decode the JWT at jwt.ms to verify header and payload. The aud claim in payload must be the token endpoint URL.

---

### Client Credential flow with certificate fails with AADSTS70011 or certificate error - previously working flow suddenly fails
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Certificate used for client authentication has expired or been revoked

**Solution**: Verify certificate validity: run 'certutil -verify -urlfetch {certificatename}' or 'certutil -URL {certificatename}'. If expired or revoked, create a new self-signed certificate (New-SelfSignedCertificate in PowerShell), upload the new public key (.cer) to Entra ID app registration under Certificates & secrets.

---

### AADSTS error when using Insomnia to retrieve OAuth2.0 token - error indicates grant_type parameter is missing or not recognized in the request
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Insomnia request body is not set to 'Form Data' format; when body type is set to JSON or raw, parameters including grant_type are not sent as application/x-www-form-urlencoded which is required by OAuth2 token endpoints

**Solution**: In Insomnia, on the request body tab, click the format dropdown and change selection to 'Form Data'. This ensures the token request body is sent as application/x-www-form-urlencoded as required by Entra ID token endpoints.

---

### Native apps relying on OAuth 2.0 Authorization Code Grant flow break after security update. Browser shows warning page instead of blank page with a...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Security update from Dec 2025. Auth codes previously visible in browser address bar indefinitely (phishing risk). New: warning page then auto-redirect removes the code.

**Solution**: Native apps must retrieve the authorization code from browser in under 3 seconds automatically. Must NOT rely on manual code retrieval. ICM path: eSTS team.

---

## Phase 2: Oidc
> 8 related entries

### AADSTS50146 error when using claims mapping policy to add custom claims (e.g. onPremiseSamAccountName) to OIDC tokens.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Application manifest missing acceptMappedClaims=true. Required for single-tenant apps using claims mapping policy.

**Solution**: 1) Create claims mapping policy with ClaimsSchema. 2) Assign to service principal. 3) Set acceptMappedClaims=true in app manifest to fix AADSTS50146.

---

### HTTP 404 (404.15 Request Filtering: Query String Too Long) during OpenID Connect authentication redirects in IIS-hosted apps
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Authorization code payload increased due to security fix MSRC 103168 adding VSMBindingKeyHash2 (~44 chars) for device-binding, pushing apps near 2048-char URL query string limit over the edge

**Solution**: Increase IIS Request Filtering maxQueryStringLength in web.config; configure OIDC/OAuth clients to use response_mode=form_post to deliver auth response via HTTP POST body instead of URL query parameters.

---

### HTTP 404.15 Query String Too Long during OIDC authentication redirects in IIS-hosted apps
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Auth code payload increased due to security fix MSRC 103168 adding VSMBindingKeyHash2 (~44 chars) pushing near 2048-char limit

**Solution**: Increase IIS maxQueryStringLength in web.config; use response_mode=form_post for auth response via POST body.

---

### Calling OIDC UserInfo endpoint fails with AADSTS9001014: 'This token was not issued for the UserInfo endpoint. This may have been a token for Graph...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Token was issued targeting the wrong endpoint version. V1 token used with V2 UserInfo endpoint (https://graph.microsoft.com/oidc/userinfo) or V2 token used with V1 endpoint. The audience (aud) in the token does not match the target UserInfo endpoint.

**Solution**: Match token version to UserInfo endpoint: V1 → obtain token via /oauth2/token, call https://login.microsoftonline.com/common/openid/userinfo; V2 → obtain token via /oauth2/v2.0/token with openid scope, call https://graph.microsoft.com/oidc/userinfo. Use openid-configuration metadata endpoint to discover the correct userinfo_endpoint.

---

### OIDC UserInfo endpoint call fails with AADSTS9002313: 'Invalid request. Request is malformed or invalid.'
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Authorization header is malformed: double space between 'Bearer' and token value, no space at all, or incorrect header name.

**Solution**: Ensure Authorization header is correctly formatted: 'Authorization: Bearer <token>' with exactly one space between 'Bearer' and the token. Verify header name is exactly 'Authorization'.

---

### Calling OIDC UserInfo endpoint returns AADSTS9001014: 'This token was not issued for the UserInfo endpoint'
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Token version mismatch: using a V2 token with the V1 UserInfo endpoint (login.microsoftonline.com/common/openid/userinfo) or vice versa. V1 and V2 endpoints issue tokens with different audiences and cannot be used interchangeably.

**Solution**: Use the correct endpoint version: V2 tokens -> https://graph.microsoft.com/oidc/userinfo; V1 tokens -> https://login.microsoftonline.com/common/openid/userinfo. Check the openid-configuration metadata (/.well-known/openid-configuration) to confirm the correct userinfo_endpoint value.

---

### UserInfo endpoint call returns AADSTS9002313: 'Invalid request. Request is malformed or invalid'
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Incorrect Authorization header format: double space between 'Bearer' and token, missing space, or incorrect header name

**Solution**: Ensure Authorization header is exactly: 'Authorization: Bearer {token}' with a single space between 'Bearer' and the token value. Verify the header name is spelled correctly as 'Authorization'.

---

### Infinite redirection loop between OIDC app and Microsoft Entra ID when browsing via HTTP (works fine with HTTPS)
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: .AspNet.Cookies cookie has secure attribute set, so it is not sent in HTTP requests, causing repeated auth redirects

**Solution**: Enforce HTTPS navigation for the site. If HTTP required temporarily, set CookieSecure = CookieSecureOption.Never in CookieAuthenticationOptions (not recommended for production).

---

## Phase 3: Adfs
> 7 related entries

### Event ID 1021 'Encountered error during OAuth token request' appears in ADFS Admin logs on Server 2016/2019 when Hybrid Azure AD Joined devices aut...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Windows 10 client sends OAuth JWT Bearer request (OAuth 2.0 Protocol Extensions for Broker Clients) irrespective of whether device authentication is enabled on ADFS. ADFS expects the request from a registered device and checks AD, but device writeback is not enabled or device authentication is not configured, causing the error.

**Solution**: This error can be safely ignored for Hybrid AD Joined devices. To suppress: (1) On Server 2016 only: disable OpenIDConfig endpoint, (2) If no OAuth/OIDC apps configured: disable ADFS/OAuth endpoint, (3) Set registry HKLM\SOFTWARE\Microsoft\IdentityStore\LoadParameters\{B16898C6-A148-4967-9171-64D755DA8520} EnterpriseSTSTokenDisabled=dword:1, (4) Enable Device Registration and Device Writeback in ADFS.

---

### ADFS MFA fails for OpenID/OAuth2 applications when Okta MFA Adapter is configured. Error MSIS7065: There are no registered protocol handlers on pat...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Okta MFA adapter posts a State parameter in the form body that conflicts with the State parameter already in the authorization request URL. ADFS creates a named collection with duplicate State values, triggering MSIS9460: Invalid Authorization Message with multiple values.

**Solution**: Contact Okta support to fix the conflicting State parameter (known issue since Nov 2021). Alternatively, migrate to Azure MFA adapter which does not have this conflict.

---

### ADFS sub claim issued in ID_Tokens changes value randomly for the same user across subsequent authentication requests to the same OpenID/OAuth2 app...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The sub claim is a hash of ClientID + sourceanchor + PrivacyEntropy. The sourceanchor (WindowsAccountName) is resolved via LSA LookupCache which is case-insensitive for lookups but case-sensitive for storage. Cached values may have inconsistent casing causing different hash outputs.

**Solution**: Disable LSA Lookup Caching on all ADFS servers: Registry HKLM\SYSTEM\CurrentControlSet\Control\Lsa -> create DWORD LsaLookupCacheMaxSize = 0, then restart servers.

---

### ADFS 2016: post_logout_redirect_uri is not honored when an External Claims Provider (SAML IDP) is used. User is not redirected to specified destina...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When ADFS processes logout through an external SAML Claims Provider, after receiving the LogoutResponse, the post_logout_redirect_uri from the original OAuth2 logout request is lost. ADFS constructs a new URI with only client-request-id.

**Solution**: Known bug in Server 2016 (won't fix). Fixed in Server 2019 via KB5005625. Upgrade ADFS to 2019+ and apply KB5005625.

---

### MSIS9426: Received invalid Oauth JWT Bearer. The JWT Bearer payload must contain scope. Logged in ADFS admin/debug logs.
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: A Windows service on the client device makes OAuth calls to cloud resources through ADFS without including the required scope claim in the JWT Bearer payload.

**Solution**: Check ADFS Debug logs Event ID 178 for request details and Event ID 151 for claims/displayname to identify the calling device. Disable unnecessary Windows call-home features on the offending device.

---

### OAuth2/OIDC authentication fails with ADFS. The state parameter containing URL-encoded + (%2B) is returned by ADFS unencoded as literal + in the au...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Technical defect in ADFS 2016/2019/2022 where the OAuth2 authorization code response does not preserve URL encoding of the + character in the state parameter. ADFS decodes %2B to + before returning it.

**Solution**: Application-side workaround: handle both encoded (%2B) and unencoded (+) versions when comparing state values, or avoid using + characters in state parameter values. This is a known ADFS product defect. Use Postman with the provided template to reproduce.

---

### ADFS error MSIS9921: Received invalid UserInfo request. Audience in the access token is not same as the identifier of the UserInfo relying party tr...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: When OIDC client uses a WebAPI resource identifier (introduced via ALLAccessTokenClaims feature in KB4019472), ADFS issues the access token with the WebAPI audience instead of the built-in UserInfo audience (urn:microsoft:userinfo). The UserInfo endpoint rejects the token because audience does not match.

**Solution**: Install the fix: KB5034770 (Server 2022) or KB5034768 (Server 2019), EnabledByDefault from June 2024 CU (KB5039227/KB5039217). Server 2016 not supported - must upgrade ADFS. If still DisabledByDefault, enable via GPO (install enablement MSI then configure in gpedit.msc) or registry: Server 2022 value 19489421, Server 2019 value 3544162445 under HKLM\SYSTEM\CurrentControlSet\Policies\Microsoft\FeatureManagement\Overrides set to DWORD 1. Verify fix by checking AccessToken aud matches appid and new

---

## Phase 4: B2C
> 6 related entries

### Error AADB2C90240: The provided token is malformed - external OpenID Connect identity provider issues JWE (JSON Web Encrypted) tokens to Azure AD B2C
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The external identity provider issues JWE tokens. Azure AD B2C does not support JWE tokens. The JWT header contains an enc parameter indicating encryption.

**Solution**: Azure AD B2C does not support JWE tokens. Verify by base64-decoding the JWT header - if it contains an enc parameter (e.g. A256CBC-HS512), the token is JWE. The external IdP must issue standard JWT (JWS) tokens instead. Feature request is tracked.

---

### Azure AD B2C OpenIdConnect ClaimsProvider does not retrieve claims from external IDP user info endpoint. Claims like email, name are missing after ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design, OpenIdConnect technical profiles do NOT call the user info endpoint. OIDC validates tokens using certificate public key via well-known configuration endpoint, unlike OAuth2 which calls userinfo.

**Solution**: Use OAuth2 technical profile instead of OpenIdConnect if userinfo endpoint claims are needed. Alternatively, use RESTful technical profile to call the userinfo endpoint with the access token. See: https://learn.microsoft.com/azure/active-directory-b2c/secure-rest-api and https://learn.microsoft.com/azure/active-directory-b2c/idp-pass-through-user-flow

---

### Azure AD B2C OIDC federation with Amazon as Identity Provider fails. Amazon IDP provides incorrect modulus during key exchange, causing invalid dec...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Amazon has an identified issue where the third-party IDP fails to provide a correct modulus, resulting in invalid decryption during the key exchange process.

**Solution**: Temporary workaround: Set Item Key Metadata Response Types to Id_Token (less secure, requires customer approval) to circumvent the key exchange. Permanent solution: Customer must work with Amazon to obtain the correct modulus. Ref ICM: 564151847, 407748942, 550082381.

---

### After B2C logout when AAD is a federated identity provider, AAD session cookies are not cleared; user is not fully signed out from AAD and can re-a...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: B2C sends the logout request to the AAD v2 endpoint which does not clear AAD cookies; only the v1 endpoint clears AAD session cookies

**Solution**: Set the v1 AAD endpoint as the Logout URL in the B2C Technical Profile for the AAD federated IDP. v1 endpoint format: https://login.microsoftonline.com/{tenant}/oauth2/logout. Future fix tracked in Bug 1617289 (add support for logout_hint)

---

### Azure AD B2C Mooncake (21Vianet): Custom Policies with OpenID Connect authentication suddenly stops working or fails during initial setup. Users ca...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: The ProviderName key behavior changed in Mooncake. The value https://sts.chinacloudapi.cn/ alone is no longer sufficient; it now requires the tenant ID appended.

**Solution**: Change the ProviderName metadata in the OIDC technical profile from <Item Key="ProviderName">https://sts.chinacloudapi.cn/</Item> to <Item Key="ProviderName">https://sts.chinacloudapi.cn/{tenantId}</Item>. Ref ICM: 402958181.

---

### Azure AD B2C returns 404 error on POST to /authresp endpoint when using custom OIDC IDP. RouteException: The request contained an invalid or missin...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: The STATE parameter is being passed in the body of the POST request instead of as a query string parameter. B2C backend cannot parse the state parameter when sent in the request body.

**Solution**: Pass the state parameter as query string when sending the POST request to the authresp endpoint, not in the body of the request.

---

## Phase 5: Msal Js
> 3 related entries

### BrowserAuthError: hash_empty_error - "Hash value cannot be processed because it is empty." The redirectUri clears the hash fragment before MSAL pro...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application or framework router updates window.location and clears URL hash fragment (#) before MSAL reads the authorization code. Common with Angular/React routers.

**Solution**: Configure redirect_uri to a static callback page without router logic. Angular: create empty auth.html in assets. React: <Route exact path="/callback" render={() => <div>Completing auth</div>} />.

---

### Angular routing error: "Cannot match any routes. URL Segment: state". Occurs after Azure AD redirects back with state and code query parameters.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Angular router has no routes for "state" and "code" URL segments appended by Azure AD during OAuth redirect.

**Solution**: Add routes in app-routing.module.ts: { path: "code", component: HomeComponent } and { path: "state", component: HomeComponent }.

---

### Customer wants MSAL.js to not request refresh token or needs to remove offline_access from default OIDC scopes
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: MSAL.js includes offline_access in OIDC_DEFAULT_SCOPES array by default, which always requests a refresh token

**Solution**: Remove offline_access from OIDC_DEFAULT_SCOPES: import { OIDC_DEFAULT_SCOPES } from '@azure/msal-common'; OIDC_DEFAULT_SCOPES.splice(OIDC_DEFAULT_SCOPES.indexOf('offline_access'), 1);

---

## Phase 6: Identity Protection
> 3 related entries

### RepMAP disabled 'Tutorial Sample App' (6731de76-14a6-49ae-97bc-6eba6914391e) triggering high-risk 'Malicious Application' event across ~40K tenants.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft RepMAP team proactively disabled app whose live secret was exposed in public OAuth documentation. Disablement triggered Application Disablement Action in AADIP.

**Solution**: Share prepared customer communication. Customer should review privileges granted and check logs. App cannot be deleted (by design).

---

### Admin cannot delete an OAuth application disabled by Microsoft (disabledByMicrosoftStatus set). Delete option is unavailable in Enterprise Apps.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design: preventing deletion avoids a security loophole where disabled apps could be re-instantiated in the tenant.

**Solution**: Do not file ICM for this. If the disabled app causes a functional problem, file ICM to PG. If admin just does not want to see it, track via PG Excel spreadsheet. Deletion of Microsoft-disabled apps is not supported.

---

### Application Tutorial Sample App (AppId 6731de76-14a6-49ae-97bc-6eba6914391e) appears disabled in tenant with Identity Protection Malicious Applicat...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft RepMap team globally disabled the app because its live client secret was exposed in public OAuth documentation. The disablement triggered an Application Disablement Action risk event in AADIP.

**Solution**: Inform customer: no evidence of malicious activity, action was precautionary. Customer should review audit logs for unusual behavior by the app Service Principal, check if additional privileges were granted, and review Microsoft notification sent 2023-09-22.

---

## Phase 7: Domain Verification
> 2 related entries

### Cannot verify custom domain in Microsoft Entra ID - domain is already verified in another managed tenant
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The custom domain is already registered and verified on a different Entra ID tenant. A domain can only be verified on one tenant at a time.

**Solution**: 1) Identify which tenant owns the domain: use OIDC endpoint https://login.microsoftonline.com/{domain}/.well-known/openid-configuration to get tenant ID. 2) Or use ASC Tenant Explorer with domain name. 3) If customer owns the domain, contact Data Protection team to remove it from the other tenant (VKB: https://internal.evergreen.microsoft.com/en-us/help/2905700). 4) If domain was removed from another tenant, check if Source of Authority is still Microsoft - may need escalation to O365 team.

---

### Cannot verify custom domain - already verified in another managed tenant
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Custom domain registered on different Entra ID tenant. Domain can only be verified on one tenant at a time.

**Solution**: 1) OIDC endpoint: https://login.microsoftonline.com/{domain}/.well-known/openid-configuration. 2) ASC Tenant Explorer. 3) Contact Data Protection team. VKB: https://internal.evergreen.microsoft.com/en-us/help/2905700.

---

## Phase 8: Token
> 2 related entries

### IDX14100 JWT is not well formed, there are no dots (.) error when calling /userinfo endpoint or from application logs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application sends a V1 access token to the V2 userinfo endpoint (https://graph.microsoft.com/oidc/userinfo) which expects a V2 JWT token

**Solution**: Either request a V2 access token for https://graph.microsoft.com/oidc/userinfo, or send V1 access token to V1 userinfo endpoint at https://login.microsoftonline.com/common/openid/userinfo

---

### IDX14100 JWT is not well formed, there are no dots (.) error when calling /userinfo endpoint
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application sends V1 access token to V2 userinfo endpoint which expects V2 JWT token

**Solution**: Request V2 access token for graph.microsoft.com/oidc/userinfo, or send V1 token to V1 endpoint at login.microsoftonline.com/common/openid/userinfo

---

## Phase 9: Client Credentials
> 2 related entries

### Client credentials flow using certificate-based authentication fails with authentication error when acquiring token.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Certificate thumbprint specified in the authentication script does not match the thumbprint of the certificate registered in the app registration or present in the certificate store.

**Solution**: Verify thumbprint using PowerShell: Get-ChildItem -Path Cert:\CurrentUser\My\ | Where-Object -Property Thumbprint -EQ "<thumbprint>" or list all certs with Get-ChildItem -Path Cert:\CurrentUser\My\. Ensure the thumbprint used in the script exactly matches the certificate registered in Azure Portal under Certificates & Secrets.

---

### Client credentials flow using certificate fails at token acquisition; JWT client_assertion validation error.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Token endpoint URL in the authentication script is incorrect or uses the wrong version; the JWT client_assertion 'aud' claim must match the token endpoint URL used.

**Solution**: Use correct token endpoint format: V2 → https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token; V1 → https://login.microsoftonline.com/{tenant}/oauth2/token. Ensure JWT client_assertion 'aud' claim matches the endpoint URL exactly (e.g., aud: 'https://login.microsoftonline.com/{tenant}/oauth2/token' for V1).

---

## Phase 10: Aadsts50011
> 2 related entries

### Authentication fails with AADSTS50011 error — 'The reply URL / redirect URI does not match the redirect URIs configured for the application'
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Reply URL (SAML) or redirect_uri (OAuth2/OIDC) in the authentication request does not match any of the configured values in the app registration; common for misconfigured SaaS apps or when URLs include trailing slashes, different casings, or query strings

**Solution**: For OAuth2/OIDC: align the redirect_uri in the request with app registration Redirect URIs per https://learn.microsoft.com/en-us/troubleshoot/azure/entra-id/app-integration/error-code-aadsts50011-redirect-uri-mismatch; for SAML: align the Reply URL (ACS URL) per https://learn.microsoft.com/en-us/troubleshoot/azure/entra-id/app-integration/error-code-aadsts50011-reply-url-mismatch; also check internal wiki AADSTS50011 article (Supportability wiki page 311747) for additional guidance

---

### AADSTS50011 error: Redirect URI mismatch in OIDC/OAuth2 — redirect URI in request does not match registered URIs
**Score**: 🔵 7.5 | **Source**: MS Learn

**Root Cause**: Redirect URI in application code does not match any URI registered in Entra ID app registration.

**Solution**: Add redirect URI from error message to app registration Authentication > Platform configurations > Add URI. Or update application code if the URI is wrong. Wait 3-5 min after saving.

---

## Phase 11: Application Proxy
> 2 related entries

### Web app using Microsoft Identity Web / OIDC Middleware behind Entra ID Application Proxy encounters authentication failures or redirect issues. Dua...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Using both OIDC Middleware/Microsoft Identity Web AND Application Proxy pre-authentication is contradictory. App Proxy is designed for apps that cannot authenticate themselves; when both are active, they conflict on redirect URIs and session management.

**Solution**: Choose one: (1) Use OIDC Middleware and configure App Proxy to bypass authentication, OR (2) Remove OIDC Middleware and let App Proxy handle auth. If using OIDC with App Proxy passthrough, configure explicit redirect_uri via ConfidentialClientApplicationOptions and pass client_info=1 via OnRedirectToIdentityProvider.

---

### Starting February 8 2020, empty fragments (#) are appended to every HTTP redirect from login.microsoftonline.com login endpoint, potentially breaki...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft intentionally appends an empty fragment to the reply URL in HTTP redirects from the login endpoint to prevent a class of redirect attacks by ensuring the browser wipes out any existing fragment in the authentication request. Affects both v1.0 and v2.0 endpoints using response_type=query

**Solution**: This is by-design behavior (breaking change). Applications must not depend on the absence of empty fragments in redirect responses. If an application breaks, update the application code to handle empty fragments in the redirect URL

---

## Phase 12: Aadsts65005
> 2 related entries

### AADSTS65005: The application asked for scope that does not exist. Occurs when app was created as SAML SSO (has applicationTemplateId for non-galler...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application was created as a SAML SSO application via applicationTemplateId. SAML apps cannot expose or use OAuth2 scopes.

**Solution**: Recreate the application as an OAuth2 application using the App Registration portal or Microsoft Graph create Application API. Do not use applicationTemplate instantiate for OAuth2 apps.

---

### AADSTS65005: The application asked for scope that does not exist on the resource. OAuth2 sign-in request specifying a scope fails even though the s...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The application was created as a SAML SSO app (has applicationTemplateId for non-gallery SAML SSO template 8adf8e6e-67b2-4cf2-a259-e3dc5476c621). SAML-created apps cannot use OAuth2 scopes.

**Solution**: Recreate the application as an OAuth2 application using the App Registration portal or Microsoft Graph POST /applications API. Do not use applicationTemplate instantiate for OAuth2 apps.

---

## Phase 13: Aadsts650053
> 2 related entries

### AADSTS650053 Scenario 1: Scope does not exist on the resource. Auth request sends scope parameter with incorrect format (commas instead of spaces s...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The scope parameter in the OAuth2 authorization request uses incorrect separator characters (commas instead of spaces/%20) or contains special characters not recognized by Entra ID.

**Solution**: Fix the scope parameter format: use spaces (%20 in URL encoding) to separate multiple scope values, not commas or other delimiters. Reference: OAuth 2.0 authorization code flow documentation.

---

### AADSTS650053: The application asked for scope that does not exist on the resource. Scope parameter uses commas instead of spaces to separate values.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Invalid scope parameter format in the OAuth2 authentication request. The app developer used commas to separate scope values instead of spaces (space = %20 in URL encoding).

**Solution**: Update the authentication request to use spaces (not commas) to separate scope values in the scope parameter. Reference: Microsoft identity platform OAuth 2.0 authorization code flow documentation.

---

## Phase 14: Aspnet Core
> 2 related entries

### ASP.NET Core web app hosted in multi-instance environment throws 'Unable to unprotect the message.State' or 'The oauth state was missing or invalid...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multiple app instances use different Data Protection Keys. Instance A encrypts the OAuth state parameter, but after authentication the Identity Provider redirects to Instance B which cannot decrypt with a different key.

**Solution**: Solution 1: Configure ARR Affinity to ensure same instance handles the full flow. Solution 2: Configure a central Data Protection Store (e.g. Azure Blob Storage + Key Vault). Solution 3: Host only one instance. Note: This is an ASP.NET Core middleware issue, not Entra ID — route to ASP.NET support team if customer needs deeper help.

---

### ASP.NET Core web app hosted in multi-instance environment throws 'Unable to unprotect the message.State' or 'The oauth state was missing or invalid...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multiple app instances use different Data Protection Keys. Instance A encrypts the OAuth state parameter, but after authentication the Identity Provider redirects to Instance B which cannot decrypt with a different key.

**Solution**: Solution 1: Configure ARR Affinity to ensure same instance handles the full flow. Solution 2: Configure a central Data Protection Store (e.g. Azure Blob Storage + Key Vault). Solution 3: Host only one instance. Note: This is an ASP.NET Core middleware issue, not Entra ID - route to ASP.NET support team if customer needs deeper help.

---

## Phase 15: Aadsts Error
> 2 related entries

### Applications integrated with Entra ID fail during sign-in using OAuth 2.0 Authorization Code flow with error: AADSTS9002325: Proof Key for Code Exc...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The application is configured as a public client (SPA) with redirect URI under Single Page Application, but attempts to redeem the authorization code without using PKCE (Proof Key for Code Exchange).

**Solution**: For SPA/public client: implement the Authorization Code flow with PKCE. Reference: https://learn.microsoft.com/en-us/entra/identity-platform/reference-third-party-cookies-spas

---

### Confidential client (Web App) using client secret for authorization code redemption gets error AADSTS9002325: Proof Key for Code Exchange is requir...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The redirect URI is incorrectly configured under SPA section in the app registration instead of Web, causing Entra ID to treat the confidential client as a public client requiring PKCE.

**Solution**: Remove the redirect URI from the SPA configuration and add it under Web in the application registration. This ensures Entra ID correctly treats the app as a confidential client, allowing authorization code redemption with client secret.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AADSTS50146 error when using claims mapping policy to add custom claims (e.g.... | Application manifest missing acceptMappedClaims=true. Req... | 1) Create claims mapping policy with ClaimsSchema. 2) Ass... | 🟢 9.0 | OneNote |
| 2 | OAuth ROPC grant fails for federated users against Azure AD. Error code 80047... | Azure AD does not forward password to AD FS for ROPC flow... | Enable Password Hash Sync (PHS) for federated users who n... | 🟢 9.0 | OneNote |
| 3 | ADSTS700021: No matching federated identity record found for presented assert... | The issuer, subject, or audience claim in the external OI... | 1) Verify the FIC configuration matches exactly: issuer U... | 🟢 8.5 | ADO Wiki |
| 4 | ADSTS700021: No matching federated identity record found for presented assert... | Issuer, subject, or audience claim mismatch with FIC conf... | Verify FIC issuer URL, subject identifier, and audience m... | 🟢 8.5 | ADO Wiki |
| 5 | Azure AD B2C 配置 LinkedIn 作为身份提供商时报错 AAD2C90273: An invalid response was recei... | LinkedIn 已停止为新应用支持 OAuth2 协议作为 IdP。2023年8月1日后创建的新配置使用旧的 O... | 改用 OpenID Connect (OIDC) 协议配置 LinkedIn IdP：1) 在 LinkedIn ... | 🟢 8.5 | ADO Wiki |
| 6 | Cannot verify custom domain in Microsoft Entra ID - domain is already verifie... | The custom domain is already registered and verified on a... | 1) Identify which tenant owns the domain: use OIDC endpoi... | 🟢 8.5 | ADO Wiki |
| 7 | IDX14100 JWT is not well formed, there are no dots (.) error when calling /us... | Application sends a V1 access token to the V2 userinfo en... | Either request a V2 access token for https://graph.micros... | 🟢 8.5 | ADO Wiki |
| 8 | HTTP 404 (404.15 Request Filtering: Query String Too Long) during OpenID Conn... | Authorization code payload increased due to security fix ... | Increase IIS Request Filtering maxQueryStringLength in we... | 🟢 8.5 | ADO Wiki |
| 9 | Cannot verify custom domain - already verified in another managed tenant | Custom domain registered on different Entra ID tenant. Do... | 1) OIDC endpoint: https://login.microsoftonline.com/{doma... | 🟢 8.5 | ADO Wiki |
| 10 | IDX14100 JWT is not well formed, there are no dots (.) error when calling /us... | Application sends V1 access token to V2 userinfo endpoint... | Request V2 access token for graph.microsoft.com/oidc/user... | 🟢 8.5 | ADO Wiki |
| 11 | HTTP 404.15 Query String Too Long during OIDC authentication redirects in IIS... | Auth code payload increased due to security fix MSRC 1031... | Increase IIS maxQueryStringLength in web.config; use resp... | 🟢 8.5 | ADO Wiki |
| 12 | Adding API permissions to an Agent Identity Blueprint app fails in the Micros... | The Entra ID portal uses Microsoft Graph v1.0 for permiss... | Add API permissions directly using Microsoft Graph beta e... | 🟢 8.5 | ADO Wiki |
| 13 | Multi-value claims transformation only applies to the first value, not all va... | JWTs on implicit grant flows have limited token size; onl... | Avoid implicit grant flows when using large multi-valued ... | 🟢 8.5 | ADO Wiki |
| 14 | Multi-value claim transform only applied to first value (TraceCode=29934), or... | TraceCode=29934: JWT tokens in implicit grant flows have ... | For TraceCode=29934: use authorization code flow instead ... | 🟢 8.5 | ADO Wiki |
| 15 | Calling OIDC UserInfo endpoint fails with AADSTS9001014: 'This token was not ... | Token was issued targeting the wrong endpoint version. V1... | Match token version to UserInfo endpoint: V1 → obtain tok... | 🟢 8.5 | ADO Wiki |
| 16 | OIDC UserInfo endpoint call fails with AADSTS9002313: 'Invalid request. Reque... | Authorization header is malformed: double space between '... | Ensure Authorization header is correctly formatted: 'Auth... | 🟢 8.5 | ADO Wiki |
| 17 | Client credentials flow using certificate-based authentication fails with aut... | Certificate thumbprint specified in the authentication sc... | Verify thumbprint using PowerShell: Get-ChildItem -Path C... | 🟢 8.5 | ADO Wiki |
| 18 | Client credentials flow using certificate fails at token acquisition; JWT cli... | Token endpoint URL in the authentication script is incorr... | Use correct token endpoint format: V2 → https://login.mic... | 🟢 8.5 | ADO Wiki |
| 19 | Authentication fails with AADSTS50011 error — 'The reply URL / redirect URI d... | The Reply URL (SAML) or redirect_uri (OAuth2/OIDC) in the... | For OAuth2/OIDC: align the redirect_uri in the request wi... | 🟢 8.5 | ADO Wiki |
| 20 | Calling OIDC UserInfo endpoint returns AADSTS9001014: 'This token was not iss... | Token version mismatch: using a V2 token with the V1 User... | Use the correct endpoint version: V2 tokens -> https://gr... | 🟢 8.5 | ADO Wiki |
| 21 | UserInfo endpoint call returns AADSTS9002313: 'Invalid request. Request is ma... | Incorrect Authorization header format: double space betwe... | Ensure Authorization header is exactly: 'Authorization: B... | 🟢 8.5 | ADO Wiki |
| 22 | Client Credential flow using certificate fails with authentication error - sc... | Certificate thumbprint in the script does not match the a... | Run 'Get-ChildItem -Path Cert:\CurrentUser\My\' to list a... | 🟢 8.5 | ADO Wiki |
| 23 | Client Credential flow with certificate fails - token request rejected with i... | Client ID (Application ID) in the script does not match t... | In Azure portal -> App registrations, locate the app asso... | 🟢 8.5 | ADO Wiki |
| 24 | Client Credential flow with certificate fails - token endpoint returns error ... | Tenant ID in the script does not match the tenant where t... | In Azure portal -> App registrations, find the app and ve... | 🟢 8.5 | ADO Wiki |
| 25 | Client Credential flow with certificate fails - POST to token endpoint return... | Token endpoint URL is incorrect or uses wrong API version... | Use the correct token endpoint format: https://login.micr... | 🟢 8.5 | ADO Wiki |
| 26 | Client Credential flow with certificate fails - Get-Item Cert:\CurrentUser\My... | Certificate (with private key) is not imported to the Cur... | Import the certificate .pfx file to the CurrentUser\My st... | 🟢 8.5 | ADO Wiki |
| 27 | Client Credential flow with certificate - client_assertion JWT is rejected by... | JWT client_assertion is incorrectly constructed: not sign... | Ensure the JWT: (1) uses RS256 algorithm in header, (2) x... | 🟢 8.5 | ADO Wiki |
| 28 | Client Credential flow with certificate fails with AADSTS70011 or certificate... | Certificate used for client authentication has expired or... | Verify certificate validity: run 'certutil -verify -urlfe... | 🟢 8.5 | ADO Wiki |
| 29 | AADSTS error when using Insomnia to retrieve OAuth2.0 token - error indicates... | Insomnia request body is not set to 'Form Data' format; w... | In Insomnia, on the request body tab, click the format dr... | 🟢 8.5 | ADO Wiki |
| 30 | Group claims missing or incomplete in tokens obtained via OAuth2 implicit flo... | Implicit flow has a 5-group limit for group claims. If us... | Switch from implicit flow to authorization code flow, or ... | 🟢 8.5 | ADO Wiki |
