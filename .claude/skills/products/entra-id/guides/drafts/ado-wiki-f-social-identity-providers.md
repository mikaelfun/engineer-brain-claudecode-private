---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Entra External ID for Customers (CIAM) - Social Identity Providers"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20(CIAM)%2FEntra%20External%20ID%20for%20Customers%20(CIAM)%20-%20Social%20Identity%20Providers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Entra External ID - Social Identity Providers

## Supported Providers (as of Dec 2024)

- Apple
- Facebook
- Google

## Key Behavior

- When sign-in methods change, only **new users** are affected. Existing users continue with their original method.
- Example: switching from email+password to email+OTP only affects new sign-ups.

## Case Routing

| Scenario | Support Path | PG Escalation |
|---|---|---|
| Setting up External Identity Provider | Azure/Microsoft Entra External ID/External Identity Providers/Configuring external identity provider | CPIM/CIAM-CRI-Triage |
| Setting up User Flows | Azure/Microsoft Entra External ID/User Flows/User flow setup | CPIM/CIAM-CRI-Triage |
| Configuring User Flow Attributes | Azure/Microsoft Entra External ID/User Flows/User attributes | CPIM/CIAM-CRI-Triage |
| Trouble authenticating with external IDP | Azure/Microsoft Entra External ID/External Identity Providers/Problems signing in via external identity provider | ESTS |

## Important Notes

- CIAM tenants use standard MSODS and eSTS for everything **except** external/social identity providers
- Local user authentication troubleshooting follows standard AAD patterns
- CIAM sign-up logs NOT available to customers or in ASC Tenant Explorer audit logs (pending fix)

## Region Availability

- Public: Available
- Fairfax/Arlington: TBD
- Gallatin/Mooncake: TBD

## Graph APIs

- List available provider types: `GET identityproviderbase/availableprovidertypes`
- List configured providers: `GET identitycontainer/identityproviders`
- Create provider: `POST identitycontainer/identityproviders`

## Docs

- Apple: https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-apple-federation-customers
- Facebook: https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-facebook-federation-customers
- Google: https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-google-federation-customers
