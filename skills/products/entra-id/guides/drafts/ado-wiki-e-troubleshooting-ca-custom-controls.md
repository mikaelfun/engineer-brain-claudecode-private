---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Troubleshooting Conditional Access Custom Controls"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FTroubleshooting%20Conditional%20Access%20Custom%20Controls"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Conditional Access Custom Controls

This page covers troubleshooting Custom Controls which leverages 3rd party partner MFA as an Access Control option for Conditional Access policies.

## MFA proof-up for Conditional Access fails, but proof-up outside of Conditional Access Works

- Verify the partner's Custom Access Control is selected in the CA policy
- Verify that the user is included in the policy
- Verify some other Condition, like group membership, application, platform, or location is not Excluded and causing the policy conditions to not be satisfied.
- Have the user attempt a different proof-up method provided by the vendor. If they are using PhoneCall, have them attempt a Passcode or Push.

## Verify the AppID of the Partner's service principal listed on the JSON block is present in the customer's tenant

```powershell
Get-MgServicePrincipalByAppId -AppId 21249e6b-bc2a-4dcd-9dd9-d6cbd7496814 | fl
```

Check that `AccountEnabled` is `True` and the `AppDisplayName` matches the expected partner service (e.g., "Duo Azure Authentication").

## Verify the OpenID Connect Configuration document is Accessible by navigating to the 'DiscoveryURL'

The DiscoveryURL is listed in the JSON block. This URL directs Azure AD to the OpenID Connect Configuration (OIDC) document, which contains the provider's metadata.

Example JSON block fields:
- **Name**: Partner name (e.g., "Duo Security")
- **AppId**: Partner application ID
- **ClientId**: Base64-encoded client identifier
- **DiscoveryUrl**: OIDC discovery endpoint (e.g., `https://us.azureauth.duosecurity.com/.well-known/openid-configuration`)
- **Controls**: Required claim types

## Verify the "jwks_uri" is Accessible

The OIDC document contains a `jwks_uri` URL where Azure AD finds the public keys needed to verify signatures issued by the provider.

- Navigate to the `jwks_uri` URL to verify it is accessible
- The `kid` shows which signing key ESTS should use for validating signatures

## Verify the "authorization_endpoint" is Accessible

The `authorization_endpoint` is the endpoint Azure AD uses to communicate with the vendor for authorization.

- Navigate to the URL and verify it returns a valid error page indicating it is 'Live'
- Expected response: `{"error_description": "Missing \"client_id\"", "error": "invalid_request"}`

## Verify the Claim 'Type' on the JSON Block Matches the "id_token" in the OIDC Document

The 'Type' of claim specified on the JSON block must match the value specified as the `id_token` claim in the OIDC document.

## Escalation

For Custom Controls issues that cannot be resolved through the above steps, escalate to the Conditional Access engineering team via ICM.
