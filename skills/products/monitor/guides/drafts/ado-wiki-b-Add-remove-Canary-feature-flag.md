---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/General/How-to: Add or remove the feature flag for Canary region"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/How-To%20Guides/General/How-to%3A%20Add%20or%20remove%20the%20feature%20flag%20for%20Canary%20region"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Scenario
---
In some very specific scenarios, customer may need to enable or disable the feature flag in their subscriptions, related with Canary region

# Generic process steps
---
##**Internal customers**
---
Customers within one of the Microsoft domains, should follow the process defined on the following page: [Azure Canary MSFT](https://microsoft.sharepoint.com/teams/AzureCanaryMSFT/SitePages/6-25-2021---No-Longer-using-Form-to-request-access-to-EUAP-regions.aspx), as there is no need for a support case to do this.

Usually it's the PG that enable the feature flag, so preferably they should manage it. In any case, you can also email to these alias to get more information or requests:
- AzureCanaryMSFT@service.microsoft.com
- waeap@microsoft.com 

##**External customers**
---
External Customers are by invitation only!!!

ACTION NEEDED: A Microsoft Person uses https://aka.ms/lionrock to submit the Sub ID�s for the External customer(s)

You can Bulk add sub id�s (ie; for a preview) on the Basic info Screen of the tool. Just put NA for Customer email in such cases in the question on that page.

A member of waeap@microsoft.com will review in Lionrock and approve/follow up as needed, and it should take 2 business day or sooner to process

# Log Analytics specific steps
---
For Log Analytics, please create a LSCR with this template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=vv2X1t to register the subscription for LA in Canary:

 1) Feature Flag Names - EUAPParticipation, NewRegions
 2) Resource Provider - Microsoft.OperationalInsights