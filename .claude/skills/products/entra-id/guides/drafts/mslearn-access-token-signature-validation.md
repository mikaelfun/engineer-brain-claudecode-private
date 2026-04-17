# Troubleshoot Access Token Signature Validation Errors

> Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/troubleshooting-signature-validation-errors)

## When to Use

When a resource provider (custom API, Azure API Management, etc.) fails to validate the signature of an Entra ID access token.

## Step-by-Step Troubleshooting

### Step 1: Decode the Access Token
- Use https://jwt.ms to decode the token
- Key claims to check: `aud` (audience), `iss` (issuer), `kid` (key ID)

### Step 2: Validate Audience (`aud`) Claim
- If `aud` is a Microsoft Graph value (`https://graph.microsoft.com`, `00000003-...`), the token is for Graph only — other APIs cannot validate it
- Fix: Acquire token with correct scope for target API (e.g., `https://api.contoso.com/read`)

### Step 3: Validate Signing Key
- Resource provider fetches signing keys from OpenID Connect Metadata `jwks_uri`
- `kid` in token must match a key in the discovery keys endpoint
- Common issue: cached/hardcoded keys become stale due to regular key rotation

| Metadata Endpoint | Discovery Keys Endpoint |
|---|---|
| `.../common/v2.0/.well-known/openid-configuration` | `.../common/discovery/v2.0/keys` |
| `.../{tenant-id}/v2.0/.well-known/openid-configuration` | `.../{tenant-id}/discovery/v2.0/keys` |
| B2C: `.../{tenant-id}/{policy}/v2.0/...` | `.../{tenant-id}/{policy}/discovery/v2.0/keys` |

### Step 4: Validate Issuer (`iss`) Claim
**Scenario A: Entra ID vs B2C keys differ**
- Entra ID v1: `https://sts.windows.net/{tenant-id}`
- Entra ID v2: `https://login.microsoftonline.com/{tenant-id}/v2.0`
- External ID: `https://{domain}.ciamlogin.com/{tenant-id}/v2.0/`
- B2C: `https://{domain}.b2clogin.com/tfp/{tenant-id}/{policy-id}/v2.0/`
- Fix: Configure correct OpenID Connect Metadata URL matching the issuer

**Scenario B: SAML SSO enabled on same app**
- SAML signing cert is different from OAuth2 signing keys
- `kid` won't match default discovery keys
- Fix: Create separate app registration for OAuth2 (recommended), or add `?appid={app-id}` to metadata URL

## Configuration Examples

### Microsoft Identity Web
```csharp
options.MetadataAddress = "https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration";
```

### ASP.NET OWIN
```csharp
Authority = "https://login.microsoftonline.com/{tenant-id}/v2.0";
// or
MetadataAddress = "https://login.microsoftonline.com/{tenant-id}/v2.0/.well-known/openid-configuration";
```

## 21V (Mooncake) Notes

- Use `https://login.partner.microsoftonline.cn` instead of `login.microsoftonline.com`
- Discovery keys: `https://login.partner.microsoftonline.cn/{tenant-id}/discovery/v2.0/keys`
- B2C not available in 21V
