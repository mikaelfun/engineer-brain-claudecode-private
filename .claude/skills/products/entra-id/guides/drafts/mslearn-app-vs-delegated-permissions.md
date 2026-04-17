# Application vs Delegated Permissions Reference

> Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/application-delegated-permission-access-tokens-identity-platform

## Key Difference

| Aspect | Delegated Permissions | Application Permissions |
|--------|----------------------|------------------------|
| User sign-in | Required | Not required |
| Token claim | `scp` claim | `roles` claim |
| Auth flows | Auth code, implicit, OBO, device code, ROPC | Client credentials only |
| Consent | User or admin | Admin only |

## Identifying Token Type

Decode token at https://jwt.ms/

- **Application token**: has `roles` claim, no `scp` claim
- **Delegated token**: has `scp` claim (may also have `roles` for user role assignments)

## OAuth2 Flows → Permission Types

| Flow | Permission Type |
|------|----------------|
| Client Credentials | Application |
| Authorization Code | Delegated |
| Implicit | Delegated |
| On-Behalf-Of | Delegated |
| Device Authorization | Delegated |
| ROPC | Delegated |

## Troubleshooting API Calls

Common cause of 400/401/403/500 errors: using wrong permission type for API endpoint.

**Checklist:**
1. Check what permission type the API endpoint supports (docs)
2. Verify the auth flow used generates the correct token type
3. Inspect token claims to confirm permission type
4. Note: Some APIs support both types but with different available permissions (e.g., Power BI)

**Example**: Graph Explorer always uses delegated tokens. If your app uses client credentials (application tokens), the same endpoint may behave differently or fail.
