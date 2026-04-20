---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Extended Zones/TSG: Investigating Capacity issues specific to Extended Zones"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/pages?pagePath=%2FAzure%20Extended%20Zones%2FTSG%3A%20Investigating%20Capacity%20issues%20specific%20to%20Extended%20Zones"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Investigating Capacity issues specific to Extended Zones

## Overview

The Capacity dashboard is a tool that shows the available and used cores and VM SKUs for each cluster in the extended zone sites. This dashboard should be used in case a customer report and issue where specific SKUs cannot be deployed in an Extended zone. You can also use this information to monitor capacity usage and identify potential issues as well as validating quota requests.

## Before you begin
1. Access to this dashboard might be restricted. Approvals will be reviewed individually.
2. When troubleshooting deployment issues for a specific SKU, confirm the SKU is supported for the region.

## How to use this dashboard

1. Go to the link for the dashboard.
2. Select the Extended zone site (e.g. losangeles) under ExtendedZone on the top.
3. Select the specific service to investigate on the left blade under "Pages" (e.g. Compute Capacity).
4. To determine if a specific VM SKU series is available in a site see: EdgeZone VM series and SKUs.
5. To determine specific capacity issues review Free Cores under Physical Compute Capacity. Lower cores available for the extended zone might indicate capacity issues for the site.
6. You can use this information to approve quota requests, monitor capacity usage, and identify potential issues.

## Next steps

In case an issue is suspected in a specific Extended Location:
- Review existing CRIs to confirm an ongoing issue affecting Edge locations
- Go to the corresponding Teams Channel to engage DRIs as needed.
