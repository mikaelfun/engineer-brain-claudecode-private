---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Training/Microsoft Purview Account Concepts"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Training/Microsoft%20Purview%20Account%20Concepts"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Microsoft Purview Account Concepts

Author - Monika Lezanska

## Free Account

A free account in Microsoft Purview is made available to all customers using Azure Enterprise, Dynamics 365, Microsoft 365 Enterprise, Microsoft Fabric, Power Apps, or Power BI and some customers who are not using above services as well.

This account allows customers to access basic features without any cost. There is no way for the customers to create a free account. If a user goes to the Azure Portal and creates a Purview account, it will be an enterprise account.

Currently, the free version supports these governance data sources using live view:
- Azure Blob Storage
- Azure Data Lake Storage Gen 2
- Azure SQL Database
- Azure Subscriptions
- Microsoft Fabric

Only a core subset with limited capabilities are available in the free version:
- Data catalog - browse and search for your data assets
- Data map history - a log of updates made to assets

## Enterprise Account

Two ways to access the enterprise account:
1. Customers who have the free tier account can upgrade to enterprise (paid, all advanced features)
2. Customers without a free tier account can create an account directly (it will be enterprise)

Check account type in the Microsoft Purview portal under Settings → View all settings.

## Classic vs New Experience

- To access the new experience, one needs an enterprise account
- All customers with an enterprise account can use the classic portal
- In some regions, enterprise account customers can access the new DG experience
- Supported regions: [New Microsoft Purview Data Catalog deployment regions](https://learn.microsoft.com/en-us/purview/data-catalog-regions)
- The new DG experience cannot be tried for free

## Reconcile

- Customers with multiple accounts can choose one as the primary "parent" account (typically production)
- Other accounts can be merged into this parent account
- Reconciliation is **reversible** - customers can unreconcile and reconcile another account

### FAQ
- **Can customers reconcile when all accounts are classic?** Yes
- **Does an account need to be New Exp. to be reconciled?** No, can be classic
- **Can a user have all accounts in new experience and reconcile?** If multiple accounts exist, must reconcile one to tenant level first. Secondary accounts remain classic. Tenant level account can switch between classic and new experience.

## Merge

- Once merge is complete, it is **irreversible** - no unmerging possible
- Best practices: [Microsoft Purview account merge best practices](https://learn.microsoft.com/en-us/purview/concept-best-practices-account-merge)
- **Can customers merge classic accounts?** Yes, but at least one must be enterprise with new DG experience

## Data Catalog vs Unified Catalog

- Data Catalog renamed to **Unified Catalog** effective 11/19/2024 in the new MS Purview portal
- The new solution streamlines metadata from disparate catalogs (Fabric OneLake, Databricks Unity, Snowflake Polaris) into a unified experience
- Reflects "Catalog of Catalogs" positioning

### Useful Links
- [Get ready for next enhancement](https://learn.microsoft.com/en-us/purview/new-governance-experience)
- [Microsoft Purview portal](https://learn.microsoft.com/en-us/purview/purview-portal)
- [New portal FAQ](https://learn.microsoft.com/en-us/purview/new-portal-faq)
