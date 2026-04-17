---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Troubleshooting/ADFS - OAuth Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/ADFS%20and%20WAP/ADFS%20Troubleshooting/ADFS%20-%20OAuth%20Troubleshooting%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS OAuth Troubleshooting Guide

## Overview

Comprehensive guide covering ADFS OAuth2 scenarios, general troubleshooting, and common issues. Includes guidance for building sample apps with ADFS in most common OAuth2 app scenarios.

## Supported OAuth Flows by ADFS Version

### ADFS 2012 R2 vs 2016+

| OAuth/OIDC Flow | ADFS 2012R2 | ADFS 2016+ |
|----------------|-------------|------------|
| Authorization code grant | Yes | Yes |
| Implicit grant | No | Yes |
| ROPC | No | Yes |
| Client credential grant | No | Yes |
| OpenID Connect | No | Yes |
| On behalf of flow | No | Yes |

Client types: 2012R2 supports Public only; 2016+ supports both Public and Confidential.

> If customer uses ADFS 2012R2 for unsupported flows/client types, recommend migration to ADFS 2019+.

> ADFS 2012R2 has **no GUI** for OAuth app configuration - only PowerShell cmdlets. 2016+ recommends **Application Group**.

### ADFS 2016 vs 2019+

| OAuth Flow | ADFS 2016 | ADFS 2019+ |
|-----------|-----------|------------|
| Device code grant | No | Yes |
| Auth code grant with PKCE | No | Yes |

> ADFS 2016 is not fully compatible with OIDC standard and MSAL library. For new deployments, recommend ADFS 2019+.

### Scope Parameter (ADFS 2019+)

- ADFS 2016: Uses `resource` parameter (like AAD v1.0); `scope` is ignored
- ADFS 2019+: Supports `scope` parameter (like AAD v2.0); space-separated list of scopes
- Only scopes in request AND in ADFS client permissions appear in `scp` claim of Access Token

## Auth Libraries Compatibility

| Scenario | Libraries | OAuth2 Flow | Client Type |
|----------|-----------|-------------|-------------|
| Single-page app | ADAL/MSAL | Implicit/AuthCode | Public |
| Web App signs in users | OWIN/Microsoft.Identity.Web | AuthCode | Public, Confidential |
| Native App calls Web API | ADAL/MSAL | AuthCode | Public |
| Web App calls Web API | OWIN/Microsoft.Identity.Web | AuthCode | Confidential |
| Web API calls Web API (OBO) | ADAL/MSAL | On-behalf-of | Confidential |
| Daemon App calls Web API | - | Client credentials | Confidential |
| ROPC flow | - | ROPC | Public, Confidential |
| Browserless App | - | Device code | Public, Confidential |

> Use ADAL for ADFS 2016 only. Use MSAL/Microsoft.Identity.Web for ADFS 2019+.

## SPA Sample Code Notes (ADFS 2019+)

For Azure AD SPA sample with PKCE Authorization Code flow on ADFS 2019+:
- Configure authConfig.js with ADFS authority and endpoints
- Customize token validation for ADFS-specific claims

## Common Troubleshooting Steps

1. Check ADFS Admin/Debug logs for OAuth-specific error events
2. Use Fiddler to capture OAuth flow and inspect redirect URLs, tokens
3. Verify Application Group configuration matches expected flows
4. Validate scope/resource parameters match ADFS configuration
5. Check certificate trust chain for confidential client assertions
6. For token validation issues, decode JWT and verify claims (iss, aud, scp)

## References

- https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/development/ad-fs-openid-connect-oauth-concepts
- https://learn.microsoft.com/en-us/archive/blogs/nicold/oauth-2-0-protocol-support-level-for-adfs-2012r2-vs-adfs-2016
