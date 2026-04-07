---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Determine name resolutions for VNET integrated web apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/AppLens/Determine%20name%20resolutions%20for%20VNET%20integrated%20web%20apps"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Determine Name Resolutions for VNET Integrated Web Apps

## Overview

This article provides guidance for validating successful/failed name resolutions for VNET integrated web apps in App Services.

## Considerations

- **'Success'** code = successful name resolution. Any other code indicates a failure where no IP address was returned.
- **168.63.129.16** = Azure DNS service. If private IPs appear instead, the customer may be using custom DNS servers.
- App Insights telemetry may be blocked if DNS fails to resolve App Insights endpoint FQDNs within a VNET.

## Workflow

1. Go to AppLens and enter the name of the App Service resource you want to investigate.
2. Search and select **'VNet Integration DNS Logs'** in the upper, left filter.
3. Adjust time range as needed.
4. Select a specific FQDN of interest from the bottom drop-down.
5. Inspect the output and result codes:
   - **Success** → DNS resolution succeeded, IP address returned
   - **CNAMEONLY** → DNS resolution failed, no IP address returned
6. Further down the page, check which IP addresses are being resolved:
   - If App Insights endpoints show no IP addresses → network connectivity to App Insights is blocked

## Key Insight

If App Insights endpoint FQDNs (e.g., `dc.services.visualstudio.com`, `rt.services.visualstudio.com`) return `CNAMEONLY`, telemetry from the VNET-integrated app will not reach Application Insights. Investigate custom DNS server configuration or missing private DNS zone records.
