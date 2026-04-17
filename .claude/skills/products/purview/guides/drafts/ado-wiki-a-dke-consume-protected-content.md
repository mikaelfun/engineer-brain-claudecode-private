---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AIP Service/Troubleshooting Scenarios: AipService/Scenario: Unable to consume DKE protected content"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Unable%20to%20consume%20DKE%20protected%20content"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Unable to Consume DKE Protected Content

## Issue

User unable to open the DKE protected file as the Authentication fails.

## Things to Check

### appsettings.json

Ensure the user email and/or LDAP server configuration is correct in the DKE `appsettings.json`.

### AAD App Registration

Please check the `AAD App Registration -> Expose an API`.
Make sure the Application ID URI is set to the DKE service URL.

> ⚠️ This is commonly missing from documentation — the Application ID URI must match the DKE service URL exactly.

## Additional DKE Troubleshooting Tips

- Are they hosting the DKE service in IIS or in Azure App service?
- Is the client machine able to browse the DKE service URL?
- If the DKE is hosted in IIS, ensure there are no certificate errors while browsing the URL.
- The `JwtAudience` URL configured in the appsettings.json should be the one configured in AAD App Registration and in the Sensitivity Label.

## DKE Troubleshooting Guide

Full community guide: https://techcommunity.microsoft.com/t5/security-compliance-identity/dke-troubleshooting/ba-p/2234252
