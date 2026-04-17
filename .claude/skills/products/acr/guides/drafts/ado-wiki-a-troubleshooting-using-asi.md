---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/Platform and Tooling/Tools/ASI/Troubleshooting using ASI"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FASI%2FTroubleshooting%20using%20ASI"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting using ASI

This page is to bring awareness of an aggregate of resources about ACR within Azure Service Insights (ASI). Check out the [page for ACR within ASI](https://asi.azure.ms/services/Azure%20Container%20Registry/pages/ACR%20Home) and familiarize yourself with the existing troubleshooting resources.

On first access, you will see:

![ACR on ASI, default view](/.attachments/screenshot_ACR-on-ASI_main-page-15c4ceac-f1b8-4656-9a3d-2a2ad09ee72b.png "ACR on ASI, default view")

To get started, click on "Search for a Registry", as seen in below screenshot:

![Get started](/.attachments/screenshot_ACR-on-ASI_click-here-to-start-70f33ac1-6414-4e84-8be8-f6096bc5fe6c.png "Click here to start")

This will open a new window where you can set the time range (1) for analysis of a given container registry (2). Notes: To execute the query, click the Play icon (3) or hit Enter on the Search box (4). The container registry can be reported by:

- URI (ie: /subscriptions/\<subscription-id>/resourceGroups/rg-name/providers/Microsoft.ContainerRegistry/registries/crname)
- Login server (example: crname.azurecr.io)
- Partial registry name (example: crname)

![Set search values](/.attachments/screenshot_ACR-on-ASI_search-setup-e3dc32ba-3137-483c-bea9-c7e7784c601d.png "Set search values")

Below, an example of search results:

![Search results](/.attachments/screenshot_ACR-on-ASI_container-registry_search-results-85f7e762-a519-4334-b0b4-2e17fa5e5658.png "Search results")

In addition to the on/off features, there are various queries in the table at the bottom. Data will be populated depending on the available features and/or available data. See below:

![Private endpoints](/.attachments/screenshot_ACR-on-ASI_container-registry_private-endpoints-adebd528-eb16-44be-9e4f-5b8a5f101a64.png "Private endpoints")

... and this is just one of many options you are free to query.

In other things, you might like to know that ASI imposes to 5000 rows the results from Kusto. So, it's important that you set a good timestamp to avoid missing entries due to an ample period of analysis that generates more than 5000 rows.

Finally, there is a box (see below) which contains links to documentation of our interest and prefilled actions to use on Jarvis. Both are recommended.

![Documentation and prefilled actions](/.attachments/screenshot_ACR-on-ASI_documentation-and-prefilledActions-87faa4a6-e1b1-40b9-832c-d2a2b8cbfaf0.png "Documentation and prefilled actions")

Being able to query an Azure Container Registry from ASI brings many advantages, such as as graphic representation, quick query, a hub of resources in a single interface... etc. The most you use it, the greater the benefit.

## Owner and Contributors

**Owner:** Walter Lopez <walter.lopez@microsoft.com>
**Contributors:**

- Walter Lopez <walter.lopez@microsoft.com>
