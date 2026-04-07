---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Continuous Access Evaluation in the MSGraph API"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FContinuous%20Access%20Evaluation%20in%20the%20MSGraph%20API"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Continuous Access Evaluation (CAE) in Microsoft Graph API - Troubleshooting Guide

## Feature Overview

CAE enables services (like MS Graph) to subscribe to critical Azure AD events and enforce them near real-time. Critical events evaluated:
- User account deleted or disabled
- Password changed or reset
- Location (IP address) change
- Admin explicitly revokes all refresh tokens

CAE introduces **claim challenges**: when a resource provider rejects a non-expired token, the client must bypass its cache and request a new token from Azure AD.

## Key Token Claims for CAE

- **xms_cc**: client app requested a long-lived (CAE) token
- **xms_ssm**: resource is CAE-capable
- **capolids_latebind**: Policy IDs of CA Policies with late-bound conditions

## Enabling CAE in Applications

### JavaScript/MSAL.js
```javascript
const msalConfig = {
    auth: {
        clientId: 'Enter_the_Application_Id_Here',
        clientCapabilities: ["CP1"]
    }
};
```

Handle claim challenges:
```javascript
if (response.status === 401 && response.headers.get('www-authenticate')) {
    const authenticateHeader = response.headers.get('www-authenticate');
    const claimsChallenge = parseChallenges(authenticateHeader).claims;
    const tokenRequest = {
        claims: window.atob(claimsChallenge),
        scopes: ['User.Read'],
        account: msalInstance.getActiveAccount()
    };
    // Re-acquire token with claims challenge
}
```

### C#/.NET
```csharp
_clientApp = PublicClientApplicationBuilder.Create(App.ClientId)
    .WithDefaultRedirectUri()
    .WithAuthority(authority)
    .WithClientCapabilities(new [] {"cp1"})
    .Build();

// Handle claim challenge
authResult = await _clientApp.AcquireTokenSilent(scopes, firstAccount)
    .WithClaims(claimChallenge)
    .ExecuteAsync();
```

## Common CAE Errors

### LocationConditionEvaluationSatisfied
- **Cause**: Token presented from different IP than where it was obtained, blocked by CA location policy
- **Key diagnostic**: Decode claims from WWW-Authenticate header to find `xms_rp_ipaddr` (IP seen by Graph)
- **Fix**: Sign in again; check for split tunneling

### TokenCreatedWithOutdatedPolicies
- **Cause**: CA policies (location or multi-conditional) created/updated after token issuance (2-hour grace)
- **Fix**: Sign out, clear cache, sign in again

### TokenIssuedBeforeRevocationTimestamp
- **Cause**: Token issued before admin revocation of user sessions
- **Fix**: Sign out and sign in again

## Known Issue: Non-CAE-capable SDKs Requesting CAE Tokens

Azure Identity SDK includes `cp1` automatically. Disable with:

| Platform | How to Disable |
|----------|---------------|
| Python/CLI | `export AZURE_IDENTITY_DISABLE_CP1="true"` |
| .NET | `Environment.SetEnvironmentVariable("AZURE_IDENTITY_DISABLE_CP1", "true")` |
| Java | `System.setProperty("AZURE_IDENTITY_DISABLE_CP1", "true")` |
| Java Graph SDK | Pass `false` for `isCAEEnabled` in `AzureIdentityAuthenticationProvider` |
| MS Graph PowerShell | Cannot disable CP1; must resolve CA policy root cause, then Disconnect + clear cache + reconnect |
| Azure PowerShell | CP1 disable no longer supported; resolve CA policy root cause |

## Case Routing
CAE cases should be driven by MSaaS AAD - Authorization Premier queue.

## References
- CAE overview: https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/concept-continuous-access-evaluation
- App resilience with CAE: https://learn.microsoft.com/en-us/entra/identity-platform/app-resilience-continuous-access-evaluation
- Claims challenges: https://learn.microsoft.com/en-us/azure/active-directory/develop/claims-challenge
