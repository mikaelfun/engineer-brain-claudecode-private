---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Locate Application Insights resources in ASC"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FLocate%20Application%20Insights%20resources%20in%20ASC"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview
---
ASC exposes Azure Resources within a subscription via the 'resource explorer', which can show data by Resource Group or Resource Provider. This covers finding Application Insights resources in ASC.

# Why
---
- Locating the resource is critical for troubleshooting — it is the means to dig into the investigation.
- A customer may not have chosen to share diagnostic information, or the case was created outside the portal and is not directly linked in ASC — but the customer has consented for CSS to view data. See: [How to use Azure Support Center when customer did not choose to share diagnostic information](/Application-Insights/How%2DTo/Azure-Support-Center/Use-Azure-Support-Center-when-customer-did-not-choose-to-share-diagnostic-information)

# Tour
---
Application Insights offers two distinct resources under the **microsoft.insights** resource provider:
  - `components`
  - `webtests`

**Standard flow (customer created ticket in Azure Portal and granted CSS diagnostic access):**

1. In ASC Resource Explorer, switch view to "Resource Provider".
2. Expand the `Microsoft.insights` resource provider to see the available resource types.
3. The `components` resource type lists all Application Insights resources in the subscription — correlates to what users see in the portal.
4. The `webtests` resource type shows all Availability Web Tests defined in the subscription.
   - Naming format: `{testname}-{AppInsightComponentName}`
   - Example: `pingit-dotnetappsqldb20200102110305` → test name is `pingit`, component is `dotnetappsqldb20200102110305`

**Resource Group view** is an alternative when the customer knows which resource group their AI resource is in.

# Notes
---
- If the case was not created via the Azure Portal, the resource may not be auto-linked in ASC. Use resource provider view to manually locate it.
- Both `components` and `webtests` are needed when investigating availability test issues.
