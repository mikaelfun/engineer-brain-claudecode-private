---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/External ID Machine to Machine (M2M) Authentication Add on"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20(CIAM)%2FExternal%20ID%20Machine%20to%20Machine%20(M2M)%20Authentication%20Add%20on"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# External ID - Machine-to-Machine (M2M) Authentication Add-on

## Overview

M2M authentication uses OAuth2.0 client credentials flow for scenarios without user interaction. Backend services authenticate directly with Entra ID to request access tokens and call APIs.

**Important**: Requires the M2M Premium addon. Review pricing and licensing: https://www.microsoft.com/security/pricing/microsoft-entra-external-id/

## Key Concepts

- Uses client credentials flow (client secret or certificate)
- No user interaction - app authenticates as itself
- Permissions granted directly to the application by administrator (not delegated)
- Refresh tokens are never issued (client_id + client_secret can always get new access token)

## Authorization Methods

1. **Access Control Lists (ACL)**: Resource checks app ID against maintained list
2. **Application Permissions**: Admin grants app permissions via Microsoft Entra ID (recommended)

## Token Request

### With Client Secret

```
POST /{tenant}/oauth2/v2.0/token
Content-Type: application/x-www-form-urlencoded

client_id={id}&scope={scope}/.default&client_secret={secret}&grant_type=client_credentials
```

### With Certificate

- Create JWT assertion signed with certificate private key
- Include `x5t` header (base64url-encoded SHA-1 thumbprint)
- JWT claims: `iss`=client_id, `sub`=client_id, `aud`=token endpoint, `jti`=random GUID, `exp`/`nbf`/`iat`

## Troubleshooting Tips

- Token endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
- Scope must use `.default` suffix for client credentials
- Certificate must be registered in app registration
- Ensure application permissions (not delegated) are configured and admin-consented
- For CIAM tenants: ensure M2M Premium addon is active

## ICM Escalation

Queue: CPIM/CIAM-CRI-Triage (via ASC, reviewed by TAs/PTAs first)
