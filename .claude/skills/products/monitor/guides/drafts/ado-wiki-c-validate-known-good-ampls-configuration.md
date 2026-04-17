---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/How-To/Validate Known Good AMPLS configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAMPLS%20%28Azure%20Monitor%20Private%20Link%20Scope%29%2FHow-To%2FValidate%20Known%20Good%20AMPLS%20configuration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview
___
The article discusses on how to look at a common Azure Monitor Private Link Scope scenario and determine if it is good configuration.
The reason this is important is because a baseline is needed with regards to what it is configured within the context of the client (that is web app), the Azure Monitor resource (Application Insights) and AMPLS. If it is determined this baseline is correct, the issue is usually lying outside of these three resources but on the network involved.

# Considerations
___
The reason to go through this article is to understand what a known good scenario looks like when connecting to an Azure Monitor resource to an Azure Monitor Link Scope (AMPLS).
This is key knowledge because often, clients are not resolving to the private IP addresses within the context of this configuration and getting the proper private IP address that is required to allow connectivity between the client and Azure Monitor resource.

# Workflow
___
1. Start with the basics of the known good configuration.
   - Resource "Z" (Web App running SDK/Agent) residing on a subnet "Y", part of a VNET "X".
   - Azure Monitor Private Link Scope resource "A" exists and is tied to a Private Endpoint (PE) which is on VNET "X".
   - This Azure Monitor Private Link Scope resource has an Azure Monitor resource "B" (Application Insights or Log Analytics) listed within it.

   In this basic scenario, the AMPLS and Private Endpoint resources will define the DNS records for the associated Azure Monitor resources (Application Insights, Log Analytics) meaning, the Application Insights regional endpoint will have a private IP address in this configuration.

   This then means that resources (web apps) part of VNET "X" should resolve to this private IP address when using "nslookup". If it does not, then there is the issue.

   If the IP address the resource gets is a private IP address **but not the expected private IP address**, it means that another AMPLS resource was added to the VNET "X" or another peered VNET, which has led to this condition. See: [Guiding principle: Avoid DNS overrides by using a single AMPLS](https://learn.microsoft.com/azure/azure-monitor/logs/private-link-design#guiding-principle-avoid-dns-overrides-by-using-a-single-ampls)

1. Investigate the resource (web app) trying to send data the Azure Monitor resource (Application Insights or Log Analytics):
   - Use "nslookup" to determine the IP address the web app is trying to use for the given ingestion endpoint and the DNS resource that's getting the resolution response.
   - If the IP address returned is a public address, the resource is not using the Private DNS zones within the VNET (which were established by AMPLS and the Private Endpoint).
   - If the IP address returned is a private address, it's time to validate if it is the one defined in AMPLS associated with the Application Insights resource involved.
1. In ASC, look for the Azure Monitor resource involved, in this instance, Application Insights Component, and go to the Properties page for that Component to show the AMPLS resource associated in the Private Links section.
1. Navigate in ASC to the Private Link Scope by clicking the link in the prior step, located it under the microsoft.insights Resource Provider branch and in the sub-resource "privateLinkScope"
1. On the Azure Monitor Private Link Scope (AMPLS) resource in ASC, the associated Private endpoint can be found
1. Click on the Private endpoint shown in the image above and this will take you to that resource's property page under "Microsoft.Network" / "privateEndpoints", where the VNET involved from the Properties page can be found (AMPLS will only allow a single occurrence of its type on a given VNET)
1. Scrolling down further on the Properties page shown above, the private IP Address assigned to the endpoint of the Application Insights resource can be located. This is the IP address that clients (that is web apps) should be using. Below image shows both the FQDN clients should be using and the private IP address that FQDN should resolve to it. Both of these highlighted values match to the above results in the NSLOOKUP output, **this is what a known good configuration looks like**.
1. When there are issues with sending data to the endpoint, more often than not, these IP addresses will not match.
1. The key data collection take aways from this exercise:
   - AMPLS Scope resource id
   - Azure Monitor resource id (involved Application Insights Component / Log Analytics workspace)
   - The FQDN used in the connection string of the Azure Monitor resource
   - The private IP address of the FQDN of the Azure Monitor resource shown in the AMPLS resource (step 7)
   - The IP address the client is using surface with NSLookup (Step 1)
   - The Private Endpoint ID (steps 5/6)
   - The virtual network name and ID (highlighted in step 6)

# Public Documentation
___
- [Design your Azure Private Link setup](https://learn.microsoft.com/azure/azure-monitor/logs/private-link-design#peered-networks)

# Internal References
___
- [Investigate incorrect private IP resolution for an AMPLS Azure Monitor resource](/AMPLS-\(Azure-Monitor-Private-Link-Scope\)/How%2DTo/Investigate-incorrect-private-IP-resolution-for-an-AMPLS-Azure-Monitor-resource)

___
Last Modified: 2024/04/04
Last Modified By: matthofa
