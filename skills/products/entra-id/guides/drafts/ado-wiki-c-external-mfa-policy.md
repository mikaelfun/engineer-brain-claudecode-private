---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD MFA/External MFA Policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20MFA/External%20MFA%20Policy"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# External MFA Policy (EMFA/EAM)

> Full content (103K+ chars) available at source wiki page.

## Summary

External Authentication Methods (EAM), rebranded to External MFA (EMFA), is now GA. Uses OIDC to integrate external authentication providers into Entra ID tenant. Users can satisfy MFA requirements using external provider methods.

## Key Concepts

- EMFA replaces Custom Controls
- Satisfies MFA for: Conditional Access, Identity Protection sign-in risk, PIM activation, WHFB bootstrapping
- User identity originated in Entra ID (differs from federation)
- Does NOT work with SSPR currently

## Configuration

1. Register external provider app in Entra ID
2. Configure Authentication Methods Policy
3. Set up Conditional Access policies
4. Test with scoped user groups

## Common Issues

- OIDC metadata validation failures (issuer must match discovery URL)
- Token validation errors between Entra and external provider
- Custom Controls migration to EMFA
- Auth Strengths not yet supported with EMFA
- Default sign-in method and System Preferred MFA interaction
