---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Azure IP Groups/Searching Multiple Ip groups for a specific ip or ip range"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/pages?pagePath=%2FAzure%20Firewall%2FAzure%20IP%20Groups%2FSearching%20Multiple%20Ip%20groups%20for%20a%20specific%20ip%20or%20ip%20range"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Searching Multiple IP Groups for a specific IP or IP range

## Background

Customers may rely heavily on IP Groups for their Firewall rules (source/destination). Searching through each IP Group individually in Azure Support Center is manual and time-consuming. NRP sub details Jarvis action also does not provide the needed information. Use the ARG Networking Stamp Kusto cluster for quick searching.

## Permissions

1. Request access to the Kusto cluster by joining the ARG Networking Stamp Users group: https://coreidentity.microsoft.com/manage/Entitlement/entitlement/argnetworkin-tv1j
   - If not approved in a timely manner, email alias argoneteam to expedite.
2. Add the Kusto connection: https://argwus2nrpone.westus2.kusto.windows.net

## Kusto Query



This query shows the IP Group ID and all IPs within it, allowing you to quickly find which IP Group contains a specific IP address or range.
