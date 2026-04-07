---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C End of Sale and Azure AD B2C P2 Retirement"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAzure%20AD%20B2C%20End%20of%20Sale%20and%20Azure%20AD%20B2C%20P2%20Retirement"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD B2C End of Sale (EOS) Reference Guide

## Summary

**As of May 1, 2025**: Azure AD for External Identities (B2C) is no longer available for sale to new customers.

- Existing customers continue to receive full service until **at least 2030**.
- Snapshot taken May 1, 2025: tenants with a subscription linked to a B2C tenant on that date are the only ones allowed to create new B2C tenants.

## Subscription Requirement for New B2C Tenant Creation (Post-EOS)

- Eligible: workforce tenants that had a subscription linked to a B2C tenant as of May 1, 2025 snapshot.
- New B2C tenants can be created using the **same or a new subscription** linked to the eligible tenant.
- Ineligible tenants: follow the exception escalation process.

## Q&A: Existing B2C/B2B Customers

**Q: What does "existing customer" mean?**
> Tenants that had a subscription linked to a B2C tenant as of May 1, 2025 snapshot date.

**Q: How can existing B2C customers create new B2C tenants after EOS?**
> As long as their workforce tenant had a subscription linked to a B2C tenant on May 1, they can add new B2C tenants.

**Q: Can existing customers create B2C tenants under a new subscription?**
> Yes - they can use a new subscription linked to the eligible workforce tenant.

**Q: Will billing change for existing B2C customers?**
> No - existing customers continue to be billed per existing terms.

**Q: Are there feature limitations for existing B2C customers post-EOS?**
> No - existing customers have access to the full feature set until at least 2030.

**Q: What about existing B2B customers (with or without subscription)?**
> B2B customers without a subscription attached are NOT grandfathered. 1:5 customers were grandfathered previously. B2B and B2C share all meters.

**Q: What happens to new B2B customers starting May 1?**
> UX unchanged on May 1, even though the meter is deprecated. B2B service continues.

**Q: Dev tenant never had a B2C tenant but prod tenant has B2C - can they create B2C in dev?**
> No - follow exception escalation process.

## Q&A: New Customers

**Q: What will the portal look like for new customers?**
> Only options are workforce or external tenant (no B2C).

**Q: What about GoLocal (Japan/Australia), GCC, China?**
> Entra External ID GoLocal for Japan/Australia expected GA August 2025. GCC and China timelines are being worked on.

**Q: Feature differences between Azure AD B2C and Microsoft Entra External ID?**
> Entra External ID continues to gain parity with Azure AD B2C.

## Q&A: Migration

**Q: What will we tell analysts about migration?**
> Migration plans presented to Gartner, Forrester, etc. - received positive feedback.

**Q: Is manual migration available on May 1?**
> No. Migrations handled case-by-case until Hybrid and Just-in-Time migration scenarios are ready.

**Q: Pricing: will customers migrating to External ID pay 3 cents (10x B2C price)?**
> External ID is aggressively priced. Additional discounting available via Deal Desk.

## Support Handling

- All support requests to create a new B2C tenant post-May 1, 2025: inform customer it is End of Sale and redirect to Entra External ID.

## Public Reference

- [Azure AD B2C end of sale FAQ](https://learn.microsoft.com/en-us/azure/active-directory-b2c/faq?tabs=app-reg-ga#azure-ad-b2c-end-of-sale)
