---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/AzFw"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/Outdated%3F%20-%20Needs%20review%20if%20still%20useful/AzFw"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Firewall Health and Availability Check

> Note: This content was marked as "in development / not ready for consumption" in the source wiki. Use with caution.

## Firewall Health and Availability

1. In ASC go to AzFw and get resource ID and location
2. Go to https://portal.microsoftgeneva.com/dashboard/AzureFirewallShoebox
3. Click Widget Settings
4. Enter resource ID of AzFW
5. Click Dataplane Metric > enter time frame > rest of options should automatically filter based on resource ID entered in step 3. Select each one and select.
6. Look for any anomalies: Firewall health, number of healthy instances, SNAT port utilization, datapath availability, etc.

## Upgrade Logs

Check upgrade logs via Geneva dashboard for any recent upgrades that may have caused issues.

## Traffic Flows

1. Go to https://portal.microsoftgeneva.com/s/301A275F
2. Enter time frame to search > Under Tenant enter resource ID of AzFW > Click Search

## Reference

- ANP AzFw Wiki: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/24331/Azure-Firewall
