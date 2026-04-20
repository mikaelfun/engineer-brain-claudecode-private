---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Extended Zones/TSG: Investigating Network Performance issues specific to Extended Zones"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/pages?pagePath=%2FAzure%20Extended%20Zones%2FTSG%3A%20Investigating%20Network%20Performance%20issues%20specific%20to%20Extended%20Zones"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Investigating Network Performance issues specific to Extended Zones

## Overview

The Platform KPI Dashboard shows key performance indicators of the extended zone sites. Use this dashboard to investigate network performance issues like latency and connectivity by checking:

- **Network health**: Percentage of tunnels up between the extended zone and the region. Low/zero = connectivity issue, site may not communicate with the region.
- **SLB latency**: Average latency of the software load balancer in the extended zone. High = network delay or congestion.
- **Storage tenant availability**: Percentage of storage tenants available and healthy. Low = storage issue affecting network performance.

Filter by site, cluster, and time range to see trends and patterns.

## How to use this dashboard

1. Go to the link for the dashboard.
2. Select the site to investigate (e.g. Los Angeles).
3. Check the connectivity percentage (how many tunnels are up between site and region).
4. If connectivity percentage is low or zero, there is a network connectivity problem - expect failures or delays in customer operations.
5. Check latency information (average and maximum latency between site and region).
6. If latency is high, there is network congestion or degradation - expect poor performance or timeouts.
7. Check platform KPIs (node health, storage availability, VM runtime) which may affect customer experience.
8. Drill down into anomalies or issues to investigate root cause.

## Next steps

In case an issue is suspected in a specific Extended Location:
- Review existing CRIs to confirm an ongoing issue affecting Edge locations
- Go to the corresponding Teams Channel to engage DRIs as needed.

## Related issues
- Connectivity issues with specific compute resources: see "Cannot connect to Internet from a Virtual Machine in Extended Zones"
