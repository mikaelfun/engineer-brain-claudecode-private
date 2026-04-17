---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/General References/Determine associated Application Insights Resource"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAdditional%20Reference%20Material%2FGeneral%20References%2FDetermine%20associated%20Application%20Insights%20Resource"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Determine associated Application Insights Resource

All Application Insights cases involve an Application Insights Component. Without knowing the Application Insights Component involved it is impossible to work the support case efficiently, so it is important to determine the right Component upfront and call it out in your notes.

Regardless, of how confident you are with your findings always validate with the customer the component you found to make sure it is correct.

## Scenarios

### Scenario 1
An Application Insights Component maybe linked to the support ticket already and a Resource URI is in the Description of the case. This means the support ticket was opened from the Application Insights Component blade in the Portal. See Method 1 below.

### Scenario 2
The ResourceUri in the DFM ticket does not point to an Application Insights resource but does reference another resourceURI. This means the support ticket was opened from a blade in the portal other that was NOT an Application Insights blade, see Method 2.

### Scenario 3
There is no ResourceURI referenced in the Customer Statement section or the ResourceURI is not well-known.
- Customer may have mentioned a name of the Application Insights Component or an IKey elsewhere in the Customer Statement section or in an attachment.
- Image attachments can often lead to discovery of Component names.
- If an Ikey is found or name is found, see Method 4.
- If no Ikey or Component is named found, see Method 5.

## Methods

### Method 1 — ResourceURI contains microsoft.insights/components
- The Customer Statement section contains a field called: *ResourceURI:*
- Format: `/subscriptions/<subscription-guid>/resourceGroups/<resourcegroup-name>/providers/microsoft.insights/components/<componentname>`
- If the ResourceURI does not contain "microsoft.insights/components/" then see Scenario 2.
- Validate the component exists in ASC.
- Validate with customer the Component name found in FQR.

### Method 2 — ResourceURI references other provider
- Determine the resource provider referenced in the ResourceURI (what shows after /providers/).
- If providers/Microsoft.Web → see Method 3.
- If something other than Microsoft.Web → see Scenario 3.

### Method 3 — Microsoft.Web provider (Web App or Function)
- The default for a Web App or Azure Function is to create an Application Insights resource with the same name.
- Leverage AppLens to identify an Application Insights Component ikey it is associated.
- If successful, use the discovered ikey with Method 4.

### Method 4 — Only Instrumentation Key or Component name available
- Query specific Kusto cluster to locate the proper subscription/resource.
- AIMC (older experience) at https://aimc.aisvc.visualstudio.com — most users do not have access, prefer AppLens.
- Validate with customer the Component found in FQR.

### Method 5 — Subscription ID only or unknown providers
- Look in ASC — there may be only a few App Insights Components to choose from.
- If a non-well-known provider is referenced, look at this resource in ASC for AI Component details.
- Research the provider on learn site for AI integration clues.
- Validate with customer in FQR.
