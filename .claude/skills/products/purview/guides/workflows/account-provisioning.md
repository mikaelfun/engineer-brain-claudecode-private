# Purview 账户创建 / 升级 / 合并 / 配额 — 排查工作流

**来源草稿**: `ado-wiki-b-request-azure-subscription.md`, `ado-wiki-provisioning-managed-event-hub.md`, `ado-wiki-purview-account-concepts.md`
**Kusto 引用**: 无
**场景数**: 14
**生成日期**: 2026-04-07

---

## Scenario 1: How to Request an External Subscription
> 来源: ado-wiki-b-request-azure-subscription.md | 适用: 未标注

### 排查步骤
1) Ensure you are registered in the "Managed Environment" security group. [How do I register in the Managed Environment MCAPS Azure Security Group](https://aka.ms/AzRegWiki) and follow the steps to register yourself onto the security group. This can take 24-48 hours to process.

2) Go to [https://aka.ms/MCAPSNewAzureSub](https://aka.ms/MCAPSNewAzureSub)
- Fill out the required fields:
- Title: {brief description}
- Subscription Purpose: CSS Support
- **Subscription Type: {external}**
- Subscription Owner: {your name, unless you are creating on behalf of another user}
- Time Zone: {your time zone}
- Monthly Spend: $400
- Tenant Licensing: M365 E5 needed to be able to include compliance labels and policies
- The Requester and Reporting Manager fields will auto-populate
- Click on Terms and Conditions. Read carefully and understand the Terms and Conditions.
- Check the box to agree to Terms and Conditions and click Accept.
- Once the form is filled with all the required fields, validate and click "Submit".

`[来源: ado-wiki-b-request-azure-subscription.md]`

---

## Scenario 2: Login Error (IPv6 Issue)
> 来源: ado-wiki-b-request-azure-subscription.md | 适用: 未标注

### 排查步骤
After the Az Subscription has been deployed, there is a temporary login issue where you need to temporarily disable IPv6 to login for the first time. After accessing your External Az Subscription for the 1st time, then you can enable IPv6 again.

Steps: Control Panel > Network and Internet > Network and Sharing Center > Change adapter settings > Wi-Fi properties > Uncheck Internet Protocol Version 6 (TCP/IPv6) > Access subscription > Re-enable IPv6.

`[来源: ado-wiki-b-request-azure-subscription.md]`

---

## Scenario 3: Subscription Best Practices
> 来源: ado-wiki-b-request-azure-subscription.md | 适用: 未标注

### 排查步骤
- Don't leave Cx reproductions running.
- Don't leave VMs running over the weekend.
- Don't leave HDI clusters running over the weekend.
- Don't Leave Pipelines Running.
- Basically, don't leave anything running over the weekend unless strictly necessary because resources cost money and can be expensive!
- Things like Storage Accounts are okay to leave up over time as they only charge for the amount of data stored, and test sets are very small.
- Only permanently keep a few core resources you use regularly.
- Pick a naming convention to use for all your resources for easy management.
- Using different resource groups for different customer repros also makes for easy management.

`[来源: ado-wiki-b-request-azure-subscription.md]`

---

## Scenario 4: Background
> 来源: ado-wiki-provisioning-managed-event-hub.md | 适用: 未标注

### 排查步骤
Managed Event Hub has been **deprecated** as of December 15, 2022. Accounts provisioned after this date do not include a managed Event Hub.

Customers can provision a custom Event Hub: https://learn.microsoft.com/en-us/purview/configure-event-hubs-for-kafka — however, for now only public access is supported.

For customers needing secure/private Event Hub access, there are two methods to still leverage the managed Event Hub:

`[来源: ado-wiki-provisioning-managed-event-hub.md]`

---

## Scenario 5: Method 1: Provision a New Purview Account with Managed Event Hub
> 来源: ado-wiki-provisioning-managed-event-hub.md | 适用: 未标注

### 排查步骤
Follow the PowerShell tutorial: https://learn.microsoft.com/en-us/purview/create-microsoft-purview-powershell?tabs=azure-powershell

`[来源: ado-wiki-provisioning-managed-event-hub.md]`

---

## Scenario 6: Step-by-step:
> 来源: ado-wiki-provisioning-managed-event-hub.md | 适用: 未标注

### 排查步骤
1. **GET** the Purview account details:
   ```
   GET https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Purview/accounts/{accountName}?api-version=2021-07-01
   ```
   Reference: https://learn.microsoft.com/en-us/rest/api/purview/accounts/get?tabs=HTTP

2. **PUT** the same URL with the GET response body, adding `"managedEventHubState":"Enabled"` after the `managedResourceGroupName` property:
   ```
   PUT https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Purview/accounts/{accountName}?api-version=2021-07-01
   ```

3. Expected response: **201 Created** (new resource created)

4. Verify by running the GET again — Managed Event Hub should now appear in the response under managedResources.

5. In Azure Portal, check the **Managed resources** tab (may need page refresh) — Event Hubs namespace should now show with Enable/Disable buttons.

`[来源: ado-wiki-provisioning-managed-event-hub.md]`

---

## Scenario 7: Free Account
> 来源: ado-wiki-purview-account-concepts.md | 适用: 未标注

### 排查步骤
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

`[来源: ado-wiki-purview-account-concepts.md]`

---

## Scenario 8: Enterprise Account
> 来源: ado-wiki-purview-account-concepts.md | 适用: 未标注

### 排查步骤
Two ways to access the enterprise account:
1. Customers who have the free tier account can upgrade to enterprise (paid, all advanced features)
2. Customers without a free tier account can create an account directly (it will be enterprise)

Check account type in the Microsoft Purview portal under Settings → View all settings.

`[来源: ado-wiki-purview-account-concepts.md]`

---

## Scenario 9: Classic vs New Experience
> 来源: ado-wiki-purview-account-concepts.md | 适用: 未标注

### 排查步骤
- To access the new experience, one needs an enterprise account
- All customers with an enterprise account can use the classic portal
- In some regions, enterprise account customers can access the new DG experience
- Supported regions: [New Microsoft Purview Data Catalog deployment regions](https://learn.microsoft.com/en-us/purview/data-catalog-regions)
- The new DG experience cannot be tried for free

`[来源: ado-wiki-purview-account-concepts.md]`

---

## Scenario 10: Reconcile
> 来源: ado-wiki-purview-account-concepts.md | 适用: 未标注

### 排查步骤
- Customers with multiple accounts can choose one as the primary "parent" account (typically production)
- Other accounts can be merged into this parent account
- Reconciliation is **reversible** - customers can unreconcile and reconcile another account

`[来源: ado-wiki-purview-account-concepts.md]`

---

## Scenario 11: FAQ
> 来源: ado-wiki-purview-account-concepts.md | 适用: 未标注

### 排查步骤
- **Can customers reconcile when all accounts are classic?** Yes
- **Does an account need to be New Exp. to be reconciled?** No, can be classic
- **Can a user have all accounts in new experience and reconcile?** If multiple accounts exist, must reconcile one to tenant level first. Secondary accounts remain classic. Tenant level account can switch between classic and new experience.

`[来源: ado-wiki-purview-account-concepts.md]`

---

## Scenario 12: Merge
> 来源: ado-wiki-purview-account-concepts.md | 适用: 未标注

### 排查步骤
- Once merge is complete, it is **irreversible** - no unmerging possible
- Best practices: [Microsoft Purview account merge best practices](https://learn.microsoft.com/en-us/purview/concept-best-practices-account-merge)
- **Can customers merge classic accounts?** Yes, but at least one must be enterprise with new DG experience

`[来源: ado-wiki-purview-account-concepts.md]`

---

## Scenario 13: Data Catalog vs Unified Catalog
> 来源: ado-wiki-purview-account-concepts.md | 适用: 未标注

### 排查步骤
- Data Catalog renamed to **Unified Catalog** effective 11/19/2024 in the new MS Purview portal
- The new solution streamlines metadata from disparate catalogs (Fabric OneLake, Databricks Unity, Snowflake Polaris) into a unified experience
- Reflects "Catalog of Catalogs" positioning

`[来源: ado-wiki-purview-account-concepts.md]`

---

## Scenario 14: Useful Links
> 来源: ado-wiki-purview-account-concepts.md | 适用: 未标注

### 排查步骤
- [Get ready for next enhancement](https://learn.microsoft.com/en-us/purview/new-governance-experience)
- [Microsoft Purview portal](https://learn.microsoft.com/en-us/purview/purview-portal)
- [New portal FAQ](https://learn.microsoft.com/en-us/purview/new-portal-faq)

`[来源: ado-wiki-purview-account-concepts.md]`

---
