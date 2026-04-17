---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Workspace Management/How-to: Change pricing tier - Old and new model"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/How-To%20Guides/Workspace%20Management/How-to%3A%20Change%20pricing%20tier%20-%20Old%20and%20new%20model"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Scenario
---
As of April 2018, a new pricing model is in place for Log Analytics workspaces called **Per GB 2018**. You can change between old a new pricing tiers **as long as your subscription is older than April 2018**.

New subscriptions already have the new pricing model implemented

# Change pricing tier
---

- [ ] Go to your wokrspace and select **Usage and Estimated Costs:**

![image.png](/.attachments/image-8c18c4a0-47a1-4367-ba00-115ea071dc24.png)

- [ ] Select one of the options and expand it, then select it:

![image.png](/.attachments/image-23c4124e-13c2-431d-bdab-6b44f47125cd.png)

## Considerations
---

As mentioned, this only applies for **subscriptions older than April 2018**

Adding to this there is a new feature called **Capacity reservations** that allows customers with high volume ingestion to have discounts on the **Per GB 2018** pricing tier. Additional informations regarding current pricing tier: https://azure.microsoft.com/pricing/details/monitor/ 

_Updated as of 21-01-2020_

# References
---
[Azure Monitor pricing](https://azure.microsoft.com/pricing/details/monitor/)
[Legacy Pricing Tiers](https://learn.microsoft.com//azure/azure-monitor/platform/manage-cost-storage#legacy-pricing-tiers)
[Data Collection Volume and Retention](https://learn.microsoft.com//azure/azure-resource-manager/management/azure-subscription-service-limits#log-analytics-workspaces)
[Legacy Tier Information](http://download.microsoft.com/download/5/C/4/5C41780B-5821-4EB8-AA23-60404A224568/OMS%20Licensing%20FAQ_FINAL.pdf)


