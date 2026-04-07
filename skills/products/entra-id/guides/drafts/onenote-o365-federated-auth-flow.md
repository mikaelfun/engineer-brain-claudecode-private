# O365 Federated Authentication Flow with ADFS

> Source: Mooncake POD Support Notebook - ADFS Concepts
> Quality: draft | Needs: diagram update, modern auth additions

## Passive/Web Profile Flow (Browser)

Used by: SharePoint Online, OWA, browser-based O365 services

1. User hits O365 service → HTTP 302 redirect to O365 sign-in service
2. Sign-in service identifies federated domain → HTTP 302 redirect to ADFS passive endpoint (`/adfs/ls/`)
3. ADFS authenticates user via WIA (Kerberos/NTLMv2) against on-prem AD → issues SAML 1.1 token (UPN + ImmutableID), signed with X.509 token signing certificate
4. Client POSTs signed SAML token to O365 sign-in service → verifies signature via shared public key → converts Source ID to Unique ID → issues authentication token
5. Authentication token presented to O365 service → access granted

**Key Points:**
- No user interaction required (SSO via WIA)
- Token contains UPN + Source ID (ImmutableID)
- Signing verified via public key shared during federation trust setup

## EAS Basic Auth/Active Profile Flow (Outlook/ActiveSync)

Used by: Outlook desktop (pre-modern auth), Exchange ActiveSync

1. User opens Outlook → Exchange Online challenges for Basic Auth
2. User provides UPN + password (prompted first time, can save)
3. Exchange Online creates shadow user representation → sends domain to O365 sign-in service
4. Sign-in service returns ADFS active endpoint URL (`/adfs/services/trust/2005/usernamemixed`)
5. Exchange Online sends Basic Auth credentials to ADFS active endpoint
6. ADFS authenticates against on-prem AD → issues SAML 1.1 logon token
7. Exchange Online sends token to O365 sign-in service → converted to authentication token
8. Shadow user representation deleted after successful auth

**Key Points:**
- "Proxy Auth" pattern — Exchange Online proxies credentials to ADFS
- ADFS active endpoint is critical — if disabled, Basic Auth fails entirely
- This is the flow affected by Extranet Lockout issues (see entra-id-onenote-139)

## Troubleshooting Implications

| Symptom | Check |
|---------|-------|
| Browser SSO fails | ADFS passive endpoint `/adfs/ls/`, WIA config, IDP-initiated page |
| Basic Auth fails, Modern works | ADFS active endpoint `usernamemixed`, Extranet Lockout, PDC connectivity |
| Token validation fails | Signing certificate match, IssuerUri, federation trust metadata |
