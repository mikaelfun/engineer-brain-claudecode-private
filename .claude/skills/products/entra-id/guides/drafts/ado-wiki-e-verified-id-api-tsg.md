---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Verified ID (Dev)/Verified Id Api TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FVerified%20ID%20(Dev)%2FVerified%20Id%20Api%20TSG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Verified ID API Troubleshooting Guide

## Overview

Two sets of Verified ID APIs:
- **Request Service API**: https://docs.microsoft.com/en-us/azure/active-directory/verifiable-credentials/issuance-request-api
- **Admin API**: https://hackmd.io/VCnu3Zt6T7mbxBzkfLQKVQ?view

Samples: https://github.com/Azure-Samples/active-directory-verifiable-credentials-dotnet

## Getting a Token

The Verified ID Request Service API only accepts **app-only access tokens**.

- Required permission: `VerifiableCredential.Create.All`
- Resource: **Verifiable Credentials Service Request** (AppId: `3db474b9-6a0c-4840-96ac-1fceb342124f`)

```csharp
app = ConfidentialClientApplicationBuilder.Create(ClientId)
    .WithClientSecret(ClientSecret)
    .WithAuthority(new Uri(Authority))
    .Build();

string[] scopes = new string[] { "3db474b9-6a0c-4840-96ac-1fceb342124f/.default" };
result = await app.AcquireTokenForClient(scopes).ExecuteAsync();
```

## API Endpoint

```
POST https://did.msidentity.com/v1.0/{tenant-id}/verifiablecredentials/request
Content-Type: application/json
Authorization: Bearer <token>
```

## Issuance Request

Key fields:
- `callback.url`: Must be reachable by Verified ID service
- `authority`: Your DID (did:ion:...)
- `issuance.type`: Credential type name
- `issuance.manifest`: Manifest URL
- `issuance.pin`: Optional PIN for verification
- `issuance.claims`: Claims to include in credential

## Presentation Request

Same endpoint, same structure but with `presentation` instead of `issuance`.

## Callback Handling

### Issuance Callback Events
- `request_retrieved`: User scanned QR code or clicked link
- `issuance_successful`: Credential issuance completed
- `issuance_error`: Error during issuance (check error property)

### Presentation Callback Events
- `request_retrieved`: User scanned QR code or clicked link
- `presentation_verified`: Credential validation successful

### Not Receiving Callbacks

1. Verify callback URL is accessible (paste in browser)
2. Check web server logs
3. For local dev, use ngrok or similar tunnel
4. Review Microsoft Authenticator and Verified ID logs

## Common Errors

### unauthorized: Access token not found
No access token passed. Must use format: `Bearer access_token`

### unauthorized: Failed to authenticate the request
Expired token or invalid token audience.

### invalid_aad_access_token: No acceptable roles
Token missing required `VerifiableCredential.Create.All` permission. Ensure the app registration has the correct API permission for the Verifiable Credentials Service Request resource.
