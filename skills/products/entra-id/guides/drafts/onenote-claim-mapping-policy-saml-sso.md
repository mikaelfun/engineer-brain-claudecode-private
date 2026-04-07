# Claim Mapping Policy for SAML SSO Apps in Mooncake

## Overview
In public Azure AD, enterprise app gallery templates include pre-configured SAML claim mappings. Mooncake lacks these templates, requiring manual creation of ClaimsMappingPolicy via Graph API.

## Key Concepts
- **Claim mapping policy** takes precedence over claims configured in application templates
- Claims can map user attributes (givenName, surname, mail, UPN) to SAML claim types
- NameID format can be specified (e.g., `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`)

## How to Determine Required Claims
1. Find the equivalent app in public AAD app gallery
2. Use browser developer tools to capture the `FederatedSsoClaimsPolicyV2` payload in the SSO configuration API call
3. Map the `defaultClaimIssuancePolicy` attributes to ClaimsSchema entries

## Example: Alicloud Claim Mapping Policy

```json
{
    "ClaimsMappingPolicy": {
        "Version": 1,
        "IncludeBasicClaimSet": "true",
        "ClaimsSchema": [
            {
                "Source": "user",
                "ID": "givenName",
                "SamlClaimType": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
            },
            {
                "Source": "user",
                "ID": "surname",
                "SamlClaimType": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
            },
            {
                "Source": "user",
                "ID": "mail",
                "SamlClaimType": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
            },
            {
                "Source": "user",
                "ID": "userprincipalname",
                "SamlClaimType": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            },
            {
                "Source": "user",
                "ID": "userprincipalname",
                "SamlClaimType": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
                "samlNameIdFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
            }
        ]
    }
}
```

## Apply via Graph API

```json
POST /policies/claimsMappingPolicies
{
    "definition": [
        "{\"ClaimsMappingPolicy\":{\"Version\":1,\"IncludeBasicClaimSet\":\"true\",\"ClaimsSchema\":[...]}}"
    ],
    "displayName": "Alicloud SAML Claims Policy",
    "isOrganizationDefault": false
}
```

Then assign to the service principal:
```
POST /servicePrincipals/{sp-id}/claimsMappingPolicies/$ref
{ "@odata.id": "https://graph.microsoft.com/v1.0/policies/claimsMappingPolicies/{policy-id}" }
```

## References
- [Claims mapping policy type | Azure Docs](https://docs.azure.cn/zh-cn/entra/identity-platform/reference-claims-mapping-policy-type)
- [Configure SAML SSO via Graph API | MS Learn](https://learn.microsoft.com/en-us/graph/application-saml-sso-configure-api)

## Source
- OneNote: `Azure AD _ Ms Entra ID/Authentication/Application mgmt and config/SAML App SSO/Claim mapping policy for SAML SSO app.md`
