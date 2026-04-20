---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Extended Zones/TSG: Investigating Service-specific deployment issues in Extended Zones"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/pages?pagePath=%2FAzure%20Extended%20Zones%2FTSG%3A%20Investigating%20Service-specific%20deployment%20issues%20in%20Extended%20Zones"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Investigating Service-specific deployment issues in Extended Zones

## Overview

The EdgeZoneTestResults Dashboard (Power BI) shows results of various test scenarios running against extended zone sites. Test scenarios cover compute, storage, network, and AKS services. Use this dashboard to troubleshoot deployment failures or CRUD issues.

Note: Portland is listed as a location but is limited to 1P (Microsoft) only. It is NOT publicly accessible.

## How to use this dashboard

1. Go to the EdgeZoneTestResults Dashboard (Power BI report).
2. Select the "Test Results" blade.
3. Select the edge zone location to investigate (e.g. losangeles).
4. Expand the test cases under the Service category and check status and number of runs.
5. Red or orange status indicates failing or partially failing test cases - this might indicate a problem for a given CRUD operation at the region.
6. To see failure details: right-click on the test case result icon (green/red circle) then select "Drill through test details".
7. View logs and exceptions for failed test cases, including correlation ID and time of run.
8. Use the correlation ID and time to look up service logs and investigate root cause.

## Next steps

In case an issue is suspected in a specific Extended Location:
- Review existing CRIs to confirm an ongoing issue affecting Edge locations
- Go to the corresponding Teams Channel to engage DRIs as needed.
