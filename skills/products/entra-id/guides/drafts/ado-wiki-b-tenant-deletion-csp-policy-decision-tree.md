---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Azure AD Directory Deletion/Tenant Deletion - CSP Policy Decision Tree"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FAzure%20AD%20Directory%20Deletion%2FTenant%20Deletion%20-%20CSP%20Policy%20Decision%20Tree"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Tenant Deletion - CSP Policy Decision Tree

Used by Azure Identity TAs when assisting with tenant deletion requests **blocked by CSP relationships**.

## Decision Tree

1. **Is the partner account in an active enrollment state?** (Not terminated/suspended)

   - **YES (Partner is Active)** - Are there active subscriptions?
     - **YES** - Tell customer to work with their partner. **DO NOT PROCEED**
     - **NO** - Does partner have GDAP access?
       - **YES GDAP** - Advise customer to remove Administrative access before requesting to break CSP relationship. **PROCEED with tenant deletion**
       - **NO GDAP** - Request customer provide evidence of attempting to contact partner + written confirmation. Request break of CSP relationship. **PROCEED with tenant deletion**

   - **NO (Partner is Not Active)** - Are there active subscriptions?
     - **YES** - Are subscriptions still required?
       - **YES** - Send info on moving to different partner or web direct. **DO NOT PROCEED**
       - **NO** - Get written confirmation + cancel subscriptions. Remove admin access, break CSP relationship. **PROCEED with tenant deletion**
     - **NO** - Does partner have GDAP access?
       - **YES GDAP** - Advise customer to remove Administrative access. **PROCEED**
       - **NO GDAP** - Request break of CSP relationship. **PROCEED**

## Process: Confirm if Partner is Active
1. Query CSP partner tenant ID in [CST portal](https://cst.azure.com)
2. Review: Billing Account -> Partner Profile -> **Partner Status**
3. Screenshot and attach to tenant deletion ICM as evidence

## Process: Confirm if Subscriptions are Active
1. Open CMAT with customer Domain Name or Tenant GUID
2. Note each CSP Reseller Tenant ID from Partner + Customer Relationship tab
3. In CST, look up each CSP Reseller tenant ID -> find "Partner center billing group for commerce root" account
4. From Products + Subscriptions tab, filter by Customer Search for the customer org name
5. Verify no non-deleted subscriptions present; screenshot and attach to ICM

## Process: Determine CSP Relationship Type to Remove
1. Use [SMRT Tool](https://smrttool.partner.microsoft.com/Relationships) - Search Target=Customer tenant ID + Program=CSP
2. For each relationship, check the `relationship type`:
   - `PartnerToCustomer` / `IndirectResellerToCustomer` -> Geneva: **RemovePartnerCustomerRelationship**
   - `PartnerToIndirectReseller` -> Geneva: **RemoveIPIRRelationship**
3. If not in SMRT, check DS Explorer -> CSP Tenant -> Objects -> Contract -> TargetContextId = customer tenant
   - `SupportPartnerContract[2]` -> **RemoveAdvisorRelationship**
   - `ResellerPartnerContract[3]` -> **RemovePartnerCustomerRelationship**
   - `DistributionContract[4]` -> **RemoveIPIRRelationship**

## Process: Submit Relationship Removal via Geneva
**Prerequisites**: PME\\CSS-ENTRA-TAS group membership + SAW workstation

1. Sign into [Geneva Actions](https://portal.microsoftgeneva.com/actions) with pme.gbl.msidentity.com cert/Yubikey (use incognito mode)
2. Browse: Actions -> Extensions -> Customer Orchestration Service > CustomersOperationGroup -> required action
3. Click **Get Access** to request JIT
4. Fill JIT request form with ICM details, submit
5. Notify TA via email to approve JIT (approvers: PME\\CSS-ENTRA-TAS group via [https://aka.ms/oneidentity](https://aka.ms/oneidentity))
6. **JIT approver must verify** evidence is in ICM before approving
7. Once approved, execute Geneva action
8. If errors: raise **Sev 3** ICM to `Partner Center Customer Orchestration Service/DRI`
