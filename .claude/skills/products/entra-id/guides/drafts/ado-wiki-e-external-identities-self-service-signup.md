---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2B/External Identities Self Service Sign Up In Workforce Tenants"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2B%2FExternal%20Identities%20Self%20Service%20Sign%20Up%20In%20Workforce%20Tenants"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# External Identities Self-Service Sign Up in Workforce Tenants

## Overview
Self-service sign-up allows external/guest users to sign up to an Entra ID tenant via an application. Brings B2C capabilities into Entra ID: new identity providers, custom attributes, user flows.

## Key Points
- Only customer-developed apps support self-service sign up (not 1st party like SharePoint/Teams)
- Supported providers: Entra ID, Google, Facebook (limited: Facebook users can only sign in to apps configured with self-service sign up)
- App must have User.Read permission granted
- Microsoft Account not supported for sign-up
- Custom attributes cannot be returned in token
- API connector returned attributes not stored unless also collected via User Attributes

## Troubleshooting

### Authentication Issues
1. Get correlation ID / timestamp from customer
2. Use ASC Auth Troubleshooter > Expert View > Diagnostic Logs and SignupSignInConfigurationPolicy tabs
3. Find IEFPolicy name, configuration, client app details

### Correlating ESTS and CPIM
- CPIM requestTrackingId = ESTS correlation ID
- Use this to correlate data across both databases
- Follow B2C Kusto Queries wiki for CPIM logs

### User Flow Lookup
- ASC Tenant Explorer > AAD ExtId menu > Self Service Sign-Up
- ASC Tenant Explorer > AAD ExtId menu > Identity Providers
- ASC Tenant Explorer > AAD ExtId menu > User Flows
- ASC Tenant Explorer > AAD ExtId menu > Application - User Flows
- ASC Graph Explorer: GET /identity/b2xUserFlows?$expand=*

### Testing User Flow
Build OAuth authorization request with Application ID from ASC and valid redirect URL.

### API Connector Debugging
- Check ESTS/CPIM diagnostic data for what service receives
- Ask customer for API logs to verify request format
- Validate against expected format

## Case Handling
- Queue: MSaaS AAD - Account Management Professional/Premier
- May impact: MSaaS AAD - Developer

## Public Docs
- [Self-service signup overview](https://learn.microsoft.com/entra/external-id/self-service-sign-up-overview)
- [Add sign-up user flow](https://learn.microsoft.com/entra/external-id/self-service-sign-up-user-flow)
- [API connectors overview](https://learn.microsoft.com/entra/external-id/api-connectors-overview)
