---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Verifiable Credentials in Entitlement Management"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FVerifiable%20Credentials%20in%20Entitlement%20Management"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Verifiable Credentials in Entitlement Management

## Summary

Entitlement Management admins can add Verifiable Credential requirements to access package policies. Users must present Verifiable Credentials during the access request process. Approvers can view VC validation status.

## Support Boundaries

| Scenario | Supported Team | Support Area Path |
|-----|-----|-----|
| Management of Catalogs and Access Packages, Resources, Policies | AAD - Account Management | Azure/Microsoft Entra Governance, Compliance and reporting/Entitlement Management |
| Custom extension (Logic App) failure to update SaaS app | LogicApps | Azure\Logic App\Connectors |
| Domain publishing and verification with Verified ID Service | Account Management | Azure\Microsoft Entra Governance, Compliance and Reporting\Verified Id\Configuring Organization settings and Domains |
| Verified ID integration with Azure AD B2C | B2C configuration | Account Management |
| Marketplace/Third-party identity verifiers | Partner Center | Partner Center/Marketplace offers/Security Store and Sign-up |

## Configure Access Package Policy with Verifiable Credentials

1. Navigate to the **Policies** blade of an existing access package.
2. Select *Initial Policy* → click **Edit**.
3. In the wizard, select the **Requests** blade.
4. Under the *Enable* section, click **Add issuer** next to **Required Verifiable Credentials**.

### Face Check Verification
- Requires **Entra Suite** or **ID Governance standalone** SKU license.
- Requires user to have a Verified ID credential containing a `photo` claim.
- Facial scan is compared to the `photo` claim; access approved/denied based on the check.

### Select Issuer Wizard (Updated)

**Step 1 - Select type of issuer:**
- **Entra Verified ID network**: Enter issuer + credential type (original flow).
- **Security Partners (Third-party providers)**: Exposes third-party provider selection.

**Step 2 - Search or select an identity verification partner:**
- Identity Verification by TrueCredential from whoami.ai (Public)
- Identity Verification by AU10TIX from Au10tix (Public)
- Identity Verification by IDEMIA from IDEMIA (Public)

If offer not yet purchased: a purple banner appears with a link to Security Store Marketplace. The **Add** button is inactive until purchase is complete.

## Purchase 3P Id Verifier

1. Click the link in the purple banner to open Security Store Marketplace.
2. Select **Get solution**, choose a resource group, then click **Place order**.
