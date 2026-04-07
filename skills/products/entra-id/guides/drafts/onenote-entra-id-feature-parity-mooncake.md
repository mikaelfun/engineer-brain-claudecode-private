# Entra ID Feature Parity in Mooncake (21Vianet)

> Source: OneNote - Microsoft Entra ID feature parity in Mooncake
> Status: draft (auto-extracted)

## Overview
Not all Entra ID features in Global Azure are available in Mooncake.

**Rules for field communication:**
- Do NOT share entire table with field/customers
- Only share the specific feature asked about
- Only share first 6 columns (exclude Notes and ETA)
- Use aka.ms/mcentracxask for customer-requested features and PG owners

## Key Feature Gaps (as of 2026-03)

| Feature | Status | Notes |
|---------|--------|-------|
| Pass-through Authentication | Not Available | Only PHS supported |
| Seamless SSO | Public Preview | Works via PowerShell |
| Authenticator Phone Sign-in | Not Available | ~2027 |
| FIDO2 Security Keys | Not Available | ~2027 |
| CBA | Not Available | Same prereq as FIDO2 |
| Number Matching (Authenticator) | Not Available | No ETA |
| TAP (UI) | Not Available | No ETA |
| Email OTP for non-MSA B2B | Not Available | PBI 3362888 |
| SSPR OTP | Not Available | PBI 3316633 |
| SCIM (non-gallery app) | GA (Feb 2025) | Gallery apps pending |
| SAML App SSO | GA | Available |
| Federated Authentication | GA | Available |

## Pricing Reference
https://www.microsoft.com/en-us/security/business/microsoft-entra-pricing
