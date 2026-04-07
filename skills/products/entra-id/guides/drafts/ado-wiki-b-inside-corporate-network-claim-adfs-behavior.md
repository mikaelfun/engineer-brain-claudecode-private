---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/ACE Identity TSGs/Identity Technical Wiki/Azure AD Authentication/Azure AD Judgment when InsideCorporateNetwork Claim with ADFS is used"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD.wiki?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FAzure%20AD%20Authentication%2FAzure%20AD%20Judgment%20when%20InsideCorporateNetwork%20Claim%20with%20ADFS%20is%20used"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD Judgment when InsideCorporateNetwork Claim with ADFS is Used

This article explains scenarios where the **InsideCorporateNetwork** claim may behave unexpectedly, particularly with Conditional Access policies requiring MFA based on network location.

## Overview

When a domain is federated and ADFS is deployed on-premises, Azure AD redirects all authentication requests to ADFS (externally through WAP) to obtain a token. Some customers configure Conditional Access to skip MFA when users are on the internal corporate network, relying on the `InsideCorporateNetwork` claim.

## What is InsideCorporateNetwork?

`InsideCorporateNetwork` is a claim issued by ADFS:
- **True** = Authentication request hit ADFS directly (internal path)
- **False** = Authentication request hit WAP first (external path)

> **Important caveats:**
> - If ADFS is published directly to the internet → claim is always **True** (even for external users)
> - If internal DNS forces all traffic through WAP → claim is always **False** (even for internal users)

## Example Scenario

- Target service: Exchange Online
- Client: Outlook
- Domain: federated with ADFS
- CA policy: Require MFA from any location EXCEPT trusted locations (All Trusted Locations = InsideCorporateNetwork=True)

## How Azure AD Stores This Claim

When a user authenticates through ADFS:
1. Azure AD receives the SAML token with the `InsideCorporateNetwork` claim value
2. Azure AD issues **Refresh Token** (14-90 days) and **Access Token** (1 hour)
3. Azure AD stores the `InsideCorporateNetwork` value **inside the refresh token**
4. Azure AD records the **source public IP** of the original authentication request

## The Core Problem: Refresh Token Caching

When the user subsequently opens Outlook (without re-authenticating):
1. Outlook uses the existing refresh token
2. If the refresh token is still valid and not revoked → Azure AD issues a new access token **without re-contacting ADFS**
3. Azure AD re-evaluates CA using the **cached** `InsideCorporateNetwork` value in the refresh token
4. If the original token was issued on-premises (InsideCorporateNetwork=True), **MFA is NOT triggered even if the user is now at home**

## When Azure AD Re-Evaluates the Location

Azure AD will only reset `InsideCorporateNetwork` to False in two cases:

| Trigger | Behavior |
|---------|----------|
| First 3 octets of source public IP changed | Azure AD detects possible location change → sets InsideCorporateNetwork=False → MFA triggered |
| Refresh token expired or revoked | Full re-authentication through ADFS → ADFS issues fresh claim based on actual network path |

## Known Issues

1. **MFA not triggered when user moves home**: If the user's home IP shares the first 3 octets with the corporate IP (rare but possible with some ISPs/VPNs), InsideCorporateNetwork remains True and MFA is skipped.

2. **MFA triggered too frequently**: If the corporate network has multiple public IPs that change the first 3 octets frequently (e.g., load balancers, SNAT pools), users experience repeated MFA prompts even while staying on the corporate network.

## Conclusion and Recommendations

Using InsideCorporateNetwork claim for CA location judgments has inherent limitations due to refresh token caching. Azure AD can only re-evaluate when:
1. The first 3 octets of the source public IP change
2. The refresh token is expired or revoked

**Recommended alternatives:**
- Use **Named Locations** (IP ranges) in Conditional Access instead of relying on InsideCorporateNetwork claim
- Reference: https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/location-condition
- Consider **Continuous Access Evaluation (CAE)** for more real-time enforcement

## Related Documentation

- [Conditional Access overview](https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/overview)
- [Named locations in Conditional Access](https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/location-condition)
- [MFA service settings - trusted IPs](https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-mfa-mfasettings#mfa-service-settings)
- [Configurable token lifetimes](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-configurable-token-lifetimes)
- [Modern vs Legacy Authentication](https://docs.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/enable-or-disable-modern-authentication-in-exchange-online)
