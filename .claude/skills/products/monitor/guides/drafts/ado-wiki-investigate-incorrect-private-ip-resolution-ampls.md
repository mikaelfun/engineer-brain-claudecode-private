---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/How-To/Investigate incorrect private IP resolution for an AMPLS Azure Monitor resource"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAMPLS%20(Azure%20Monitor%20Private%20Link%20Scope)%2FHow-To%2FInvestigate%20incorrect%20private%20IP%20resolution%20for%20an%20AMPLS%20Azure%20Monitor%20resource"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Investigate incorrect private IP resolution for an AMPLS Azure Monitor resource

## Overview
This guide covers investigating when a client resolves the FQDN of an Azure Monitor endpoint to an unexpected (incorrect) private IP address in an AMPLS setup.

## Considerations
The expected IP address is the one from the Known Good configuration. See: Validate Known Good AMPLS configuration.

## Workflow

1. **Prerequisite**: Both private IP addresses must be known:
   - A) The incorrect IP the client is resolving to
   - B) The correct IP defined by the AMPLS resource for the Azure Monitor resource

2. **Key principle**: AMPLS allows only ONE instance per Virtual Network. If the client resolves to a wrong private IP, it means another AMPLS resource exists elsewhere in the networked environment (peered VNETs, etc.). Reference: [Guiding principle: Avoid DNS overrides by using a single AMPLS](https://learn.microsoft.com/azure/azure-monitor/logs/private-link-design#guiding-principle-avoid-dns-overrides-by-using-a-single-ampls)

3. **Quick check** - Look for other AMPLS resources in the subscription:
   - In ASC, find the Azure Monitor resource (e.g., Application Insights Component)
   - Check Properties page → Private Links section to find associated AMPLS resource
   - Navigate to the Private Link Scope in ASC under microsoft.insights → privateLinkScopes
   - Find the associated Private Endpoint
   - Check Private DNS Zone Record Sets on the PE Properties page
   - Verify the FQDN and private IP match the expected values

4. **Look for the incorrect IP**: Search for the unexpected private IP address the client is using.
   - If found → the single-AMPLS-per-VNET principle has been violated; changes per the documentation are needed
   - If not found in the subscription → ask the customer about other subscriptions that could contain another AMPLS resource

5. **Escalation**: If the customer cannot identify the source, involve Azure Networking team with key data points from the Validate Known Good AMPLS configuration guide.

## Public Documentation
- [Design your Azure Private Link setup](https://learn.microsoft.com/azure/azure-monitor/logs/private-link-design#peered-networks)

---
Last Modified: 2024/04/04
