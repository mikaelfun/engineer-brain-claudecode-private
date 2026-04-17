---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Entra External ID for Customers (CIAM) - Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20%28CIAM%29%2FEntra%20External%20ID%20for%20Customers%20%28CIAM%29%20-%20Data%20Collection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Entra External ID (CIAM) Data Collection Guide

## 1. Request Azure Support Center Consent to CIAM Tenant

ASC access to the CIAM tenant is almost always required. Two methods:

### Method A: From Workforce Tenant

1. Open support case at https://aka.ms/azuresupportrequest
2. Issue type: Technical
3. Service Type: Microsoft Entra External ID
4. Specify CIAM tenant ID/domain
5. Advanced diagnostic information: **Yes**

### Method B: From CIAM Tenant Directly

1. Sign into CIAM tenant via Azure Portal
2. Open Help+Support > Create support request
3. Describe: "CIAM diagnostic consent for SRXXXXXXXXX"
4. Service: Entra External ID for Customers
5. Issue type: Subscription management
6. Advanced Diagnostic Information: **YES** (critical step)
7. Share new SR# with support engineer

## 2. Reviewing CIAM Tenant in ASC

1. Visit https://aka.ms/azuresupportcenter
2. Enter support case number
3. Tenant Explorer > Add Tenant (CIAM tenant ID)
4. Verify Tenant Config: **CIAM Enabled = True**
5. Use Graph Explorer endpoints:

| Name | Graph Endpoint |
|---|---|
| User Flows | `/identity/authenticationEventsFlows` |
| User Flows by Name | `/identity/authenticationEventsFlows?$filter=displayName eq 'MySignUpSignIn'` |
| User Flows by App ID | `/identity/authenticationEventsFlows?$filter=...includeApplications/any(appId:appId/appId eq '{appId}')` |
| Identity Providers | `/identity/identityProviders` or `/directory/federationConfigurations/graph.samlOrWsFedExternalDomainFederation` |
| Application Conditions | `/identity/authenticationEventsFlows/{id}/conditions/applications/includeApplications/` |

## 3. Sign-in Logs

Collect correlation ID and timestamp for effective troubleshooting of sign-in issues.
