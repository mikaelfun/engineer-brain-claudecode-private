# CORS Troubleshooting with Microsoft Entra ID

Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/troubleshoot-cross-origin-resource-sharing-issues

## Key Concept

Microsoft Entra ID does NOT support CORS for interactive sign-in. CORS errors occur when XMLHttpRequest/AJAX calls trigger a 302 redirect to login.microsoftonline.com.

## Diagnosis

Capture Fiddler trace → find XMLHttpRequest → look for 302 redirect to login.microsoftonline.com → request has `Origin` header but response lacks `Access-Control-Allow-Origin`.

## Scenario-Based Solutions

### Scenario 1: Web App + Web API Using Auth Cookies
- XMLHttpRequest to API uses .AspNet.Cookies
- Session cookie expired → API redirects to Entra ID → CORS error
- **Fix**: Configure OpenIdConnectOptions to return 401 instead of redirect when Origin header present; implement client-side reload logic

### Scenario 2: Standalone API Using Access Tokens
- XMLHttpRequest includes Bearer token in Authorization header
- Token expired → redirect → CORS error
- **Fix**: Always use `acquireTokenSilent` before API calls; use JWT Bearer auth (returns 401) instead of OpenID Connect auth (does redirect)

### Scenario 3: MSAL.js with B2C/Third-Party IdP
- Misconfigured authority/knownAuthorities/protocolMode
- **Fix**: Set correct `authority`, `knownAuthorities`, and `protocolMode: ProtocolMode.OIDC`

### Scenario 4: App Behind Load Balancer
- Session persistence/affinity settings causing auth state loss
- **Fix**: Check load balancer session lifetime settings

### Scenario 5: CORS Error on Token Endpoint
- Using unsupported flow in SPA (ROPC, Client Credentials, OBO)
- **Fix**: Only use Authorization Code Flow with PKCE + Refresh Token Flow for SPAs

### Scenario 6: Entra Application Proxy
- Complex app with multiple origins
- **Fix**: See Application Proxy complex applications guide

## General Solution

Follow OAuth2/OIDC standards: front-end acquires access token → includes in Authorization header → API validates token → returns 401 on failure (not redirect).
