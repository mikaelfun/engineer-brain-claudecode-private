---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C with Custom Policies/Frequently Asked Questions in B2C Custom Policies"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAzure%20AD%20B2C%20with%20Custom%20Policies%2FFrequently%20Asked%20Questions%20in%20B2C%20Custom%20Policies"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# B2C Custom Policies - Frequently Asked Questions

## 1. Why is B2C not displaying First Name and Last Name text boxes when added as outputs of a Validation technical profile?

When givenName and surName are listed as OutputClaims in a self-asserted TP but the values come from a REST API Validation TP, B2C will not render input fields for them. The user won't see the text boxes.

**Solution**: Move givenName/surName to the OutputClaims of the self-asserted TP (not the validation TP) and ensure they have `Required="true"`. If the REST API also returns these values, use PartnerClaimType mapping.

## Key Topics Covered (partial list from 47K char FAQ)

- REST API integration in custom policies (InputClaims, OutputClaims, error handling)
- Claim transformations (string, date, JSON, collection operations)
- Orchestration step ordering and conditional execution
- Session management (SM-AAD, SM-MFA, SM-Noop)
- ContentDefinition configuration for custom UI
- Multi-tenant B2C custom policies
- Debugging with Application Insights

> **Note**: Full content (47975 chars) available at source wiki page. This is a partial extraction.
