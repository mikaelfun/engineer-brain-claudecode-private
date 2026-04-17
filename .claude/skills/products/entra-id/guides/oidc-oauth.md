# ENTRA-ID OAuth2/OIDC Protocol — Quick Reference

**Entries**: 85 | **21V**: Partial (81/85)
**Last updated**: 2026-04-07
**Keywords**: oauth2, oidc, client-credentials, certificate, adfs, oauth

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/oidc-oauth.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | AADSTS50146 error when using claims mapping policy to add custom claims (e.g. onPremiseSamAccount... | Application manifest missing acceptMappedClaims=true. Required for single-ten... | 1) Create claims mapping policy with ClaimsSchema. 2) Assign to service princ... | 🟢 9.0 | OneNote |
| 2 📋 | OAuth ROPC grant fails for federated users against Azure AD. Error code 80047860 in EvoSTS LoginR... | Azure AD does not forward password to AD FS for ROPC flow. Federated users mu... | Enable Password Hash Sync (PHS) for federated users who need ROPC. For ADFS 2... | 🟢 9.0 | OneNote |
| 3 📋 | ADSTS700021: No matching federated identity record found for presented assertion. Occurs when usi... | The issuer, subject, or audience claim in the external OIDC token does not ma... | 1) Verify the FIC configuration matches exactly: issuer URL (e.g., https://to... | 🟢 8.5 | ADO Wiki |
| 4 📋 | ADSTS700021: No matching federated identity record found for presented assertion when using workl... | Issuer, subject, or audience claim mismatch with FIC configuration. | Verify FIC issuer URL, subject identifier, and audience match exactly. For Gi... | 🟢 8.5 | ADO Wiki |
| 5 📋 | Azure AD B2C 配置 LinkedIn 作为身份提供商时报错 AAD2C90273: An invalid response was received: Error: unauthor... | LinkedIn 已停止为新应用支持 OAuth2 协议作为 IdP。2023年8月1日后创建的新配置使用旧的 OAuth2 scope（如 r_emai... | 改用 OpenID Connect (OIDC) 协议配置 LinkedIn IdP：1) 在 LinkedIn Developer Portal 启用 ... | 🟢 8.5 | ADO Wiki |
| 6 📋 | Cannot verify custom domain in Microsoft Entra ID - domain is already verified in another managed... | The custom domain is already registered and verified on a different Entra ID ... | 1) Identify which tenant owns the domain: use OIDC endpoint https://login.mic... | 🟢 8.5 | ADO Wiki |
| 7 📋 | IDX14100 JWT is not well formed, there are no dots (.) error when calling /userinfo endpoint or f... | Application sends a V1 access token to the V2 userinfo endpoint (https://grap... | Either request a V2 access token for https://graph.microsoft.com/oidc/userinf... | 🟢 8.5 | ADO Wiki |
| 8 📋 | HTTP 404 (404.15 Request Filtering: Query String Too Long) during OpenID Connect authentication r... | Authorization code payload increased due to security fix MSRC 103168 adding V... | Increase IIS Request Filtering maxQueryStringLength in web.config; configure ... | 🟢 8.5 | ADO Wiki |
| 9 📋 | Cannot verify custom domain - already verified in another managed tenant | Custom domain registered on different Entra ID tenant. Domain can only be ver... | 1) OIDC endpoint: https://login.microsoftonline.com/{domain}/.well-known/open... | 🟢 8.5 | ADO Wiki |
| 10 📋 | IDX14100 JWT is not well formed, there are no dots (.) error when calling /userinfo endpoint | Application sends V1 access token to V2 userinfo endpoint which expects V2 JW... | Request V2 access token for graph.microsoft.com/oidc/userinfo, or send V1 tok... | 🟢 8.5 | ADO Wiki |
| 11 📋 | HTTP 404.15 Query String Too Long during OIDC authentication redirects in IIS-hosted apps | Auth code payload increased due to security fix MSRC 103168 adding VSMBinding... | Increase IIS maxQueryStringLength in web.config; use response_mode=form_post ... | 🟢 8.5 | ADO Wiki |
| 12 📋 | Adding API permissions to an Agent Identity Blueprint app fails in the Microsoft Entra ID portal;... | The Entra ID portal uses Microsoft Graph v1.0 for permission management, but ... | Add API permissions directly using Microsoft Graph beta endpoint. Use Graph E... | 🟢 8.5 | ADO Wiki |
| 13 📋 | Multi-value claims transformation only applies to the first value, not all values. TraceCode 2993... | JWTs on implicit grant flows have limited token size; only first value is tra... | Avoid implicit grant flows when using large multi-valued attributes. Switch t... | 🟢 8.5 | ADO Wiki |
| 14 📋 | Multi-value claim transform only applied to first value (TraceCode=29934), or join transformation... | TraceCode=29934: JWT tokens in implicit grant flows have limited token size; ... | For TraceCode=29934: use authorization code flow instead of implicit grant to... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Calling OIDC UserInfo endpoint fails with AADSTS9001014: 'This token was not issued for the UserI... | Token was issued targeting the wrong endpoint version. V1 token used with V2 ... | Match token version to UserInfo endpoint: V1 → obtain token via /oauth2/token... | 🟢 8.5 | ADO Wiki |
| 16 📋 | OIDC UserInfo endpoint call fails with AADSTS9002313: 'Invalid request. Request is malformed or i... | Authorization header is malformed: double space between 'Bearer' and token va... | Ensure Authorization header is correctly formatted: 'Authorization: Bearer <t... | 🟢 8.5 | ADO Wiki |
| 17 📋 | Client credentials flow using certificate-based authentication fails with authentication error wh... | Certificate thumbprint specified in the authentication script does not match ... | Verify thumbprint using PowerShell: Get-ChildItem -Path Cert:\CurrentUser\My\... | 🟢 8.5 | ADO Wiki |
| 18 📋 | Client credentials flow using certificate fails at token acquisition; JWT client_assertion valida... | Token endpoint URL in the authentication script is incorrect or uses the wron... | Use correct token endpoint format: V2 → https://login.microsoftonline.com/{te... | 🟢 8.5 | ADO Wiki |
| 19 📋 | Authentication fails with AADSTS50011 error — 'The reply URL / redirect URI does not match the re... | The Reply URL (SAML) or redirect_uri (OAuth2/OIDC) in the authentication requ... | For OAuth2/OIDC: align the redirect_uri in the request with app registration ... | 🟢 8.5 | ADO Wiki |
| 20 📋 | Calling OIDC UserInfo endpoint returns AADSTS9001014: 'This token was not issued for the UserInfo... | Token version mismatch: using a V2 token with the V1 UserInfo endpoint (login... | Use the correct endpoint version: V2 tokens -> https://graph.microsoft.com/oi... | 🟢 8.5 | ADO Wiki |
| 21 📋 | UserInfo endpoint call returns AADSTS9002313: 'Invalid request. Request is malformed or invalid' | Incorrect Authorization header format: double space between 'Bearer' and toke... | Ensure Authorization header is exactly: 'Authorization: Bearer {token}' with ... | 🟢 8.5 | ADO Wiki |
| 22 📋 | Client Credential flow using certificate fails with authentication error - script cannot find or ... | Certificate thumbprint in the script does not match the actual thumbprint of ... | Run 'Get-ChildItem -Path Cert:\CurrentUser\My\' to list all certificates with... | 🟢 8.5 | ADO Wiki |
| 23 📋 | Client Credential flow with certificate fails - token request rejected with invalid_client or una... | Client ID (Application ID) in the script does not match the application regis... | In Azure portal -> App registrations, locate the app associated with the cert... | 🟢 8.5 | ADO Wiki |
| 24 📋 | Client Credential flow with certificate fails - token endpoint returns error about tenant not fou... | Tenant ID in the script does not match the tenant where the client applicatio... | In Azure portal -> App registrations, find the app and verify the Directory (... | 🟢 8.5 | ADO Wiki |
| 25 📋 | Client Credential flow with certificate fails - POST to token endpoint returns 404 or endpoint no... | Token endpoint URL is incorrect or uses wrong API version path | Use the correct token endpoint format: https://login.microsoftonline.com/{ten... | 🟢 8.5 | ADO Wiki |
| 26 📋 | Client Credential flow with certificate fails - Get-Item Cert:\CurrentUser\My\{thumbprint} return... | Certificate (with private key) is not imported to the CurrentUser\My certific... | Import the certificate .pfx file to the CurrentUser\My store via certmgr.msc ... | 🟢 8.5 | ADO Wiki |
| 27 📋 | Client Credential flow with certificate - client_assertion JWT is rejected by Entra ID token endp... | JWT client_assertion is incorrectly constructed: not signed with the certific... | Ensure the JWT: (1) uses RS256 algorithm in header, (2) x5t header = base64ur... | 🟢 8.5 | ADO Wiki |
| 28 📋 | Client Credential flow with certificate fails with AADSTS70011 or certificate error - previously ... | Certificate used for client authentication has expired or been revoked | Verify certificate validity: run 'certutil -verify -urlfetch {certificatename... | 🟢 8.5 | ADO Wiki |
| 29 📋 | AADSTS error when using Insomnia to retrieve OAuth2.0 token - error indicates grant_type paramete... | Insomnia request body is not set to 'Form Data' format; when body type is set... | In Insomnia, on the request body tab, click the format dropdown and change se... | 🟢 8.5 | ADO Wiki |
| 30 📋 | Group claims missing or incomplete in tokens obtained via OAuth2 implicit flow - only 5 groups ap... | Implicit flow has a 5-group limit for group claims. If user is member of more... | Switch from implicit flow to authorization code flow, or use the overage indi... | 🟢 8.5 | ADO Wiki |
| 31 📋 | ASP.NET/ASP.NET Core web app fails to complete authentication after successful Entra ID sign-in. ... | SameSite cookie attribute not set to None. OpenID Connect redirect from login... | Set SameSite=None on cookies. ASP.NET Core: ConfigureExternalCookie and Confi... | 🟢 8.5 | ADO Wiki |
| 32 📋 | Web app enters infinite redirect loop (~15 cycles) between app and Entra ID (login.microsoftonlin... | Redirect URI hostname or scheme mismatch between the app access URL and the c... | Verify redirect_uri passed to login.microsoftonline.com matches the app hostn... | 🟢 8.5 | ADO Wiki |
| 33 📋 | Web app using Microsoft Identity Web / OIDC Middleware behind Entra ID Application Proxy encounte... | Using both OIDC Middleware/Microsoft Identity Web AND Application Proxy pre-a... | Choose one: (1) Use OIDC Middleware and configure App Proxy to bypass authent... | 🟢 8.5 | ADO Wiki |
| 34 📋 | BrowserAuthError: hash_empty_error - "Hash value cannot be processed because it is empty." The re... | Application or framework router updates window.location and clears URL hash f... | Configure redirect_uri to a static callback page without router logic. Angula... | 🟢 8.5 | ADO Wiki |
| 35 📋 | Angular routing error: "Cannot match any routes. URL Segment: state". Occurs after Azure AD redir... | Angular router has no routes for "state" and "code" URL segments appended by ... | Add routes in app-routing.module.ts: { path: "code", component: HomeComponent... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Error AADB2C90240: The provided token is malformed - external OpenID Connect identity provider is... | The external identity provider issues JWE tokens. Azure AD B2C does not suppo... | Azure AD B2C does not support JWE tokens. Verify by base64-decoding the JWT h... | 🟢 8.5 | ADO Wiki |
| 37 📋 | Azure AD B2C OpenIdConnect ClaimsProvider does not retrieve claims from external IDP user info en... | By design, OpenIdConnect technical profiles do NOT call the user info endpoin... | Use OAuth2 technical profile instead of OpenIdConnect if userinfo endpoint cl... | 🟢 8.5 | ADO Wiki |
| 38 📋 | Azure AD B2C OIDC federation with Amazon as Identity Provider fails. Amazon IDP provides incorrec... | Amazon has an identified issue where the third-party IDP fails to provide a c... | Temporary workaround: Set Item Key Metadata Response Types to Id_Token (less ... | 🟢 8.5 | ADO Wiki |
| 39 📋 | Applications fail to authenticate with AADSTS90002 Tenant not found error after Microsoft Cloud D... | Tenant migrated to Stage 5 (Phase 10) where blackforest endpoints are decommi... | Customer must update all Authentication, Azure AD Graph, and MS Graph endpoin... | 🟢 8.5 | ADO Wiki |
| 40 📋 | ServiceNow App for Entra Permissions Management: Validate Credentials fails during configuration.... | Incorrect Client Secret value or Tenant ID in ServiceNow OAuth Application Re... | Verify Client ID and Client Secret match App Registration in Entra. Verify Au... | 🟢 8.5 | ADO Wiki |
| ... | *45 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **oidc** related issues (8 entries) `[onenote]`
2. Check **userinfo** related issues (3 entries) `[ado-wiki]`
3. Check **fic** related issues (2 entries) `[ado-wiki]`
4. Check **domain-verification** related issues (2 entries) `[ado-wiki]`
5. Check **domain-conflict** related issues (2 entries) `[ado-wiki]`
6. Check **oidc-metadata** related issues (2 entries) `[ado-wiki]`
7. Check **token** related issues (2 entries) `[ado-wiki]`
8. Check **idx14100** related issues (2 entries) `[ado-wiki]`
