---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/W365 Monitoring (Radar)/Function and Use"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FW365%20Monitoring%20(Radar)%2FFunction%20and%20Use"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# W365 Monitoring (Radar) - Function and Use

## General page design

Windows 365 reporting and monitoring has been substantially improved with an entirely new experience that provides:
- Tenant level operations analysis, help desk detail and end to end configuration details
- Rich visualizations
- Flexible data series and filters accelerating troubleshooting
- Contextualized data for multi-dimensional analysis
- Detailed tabular data for performance, connection configuration, connection events and connection error

The new experience is found in Intune by selecting **Reports** > **Cloud PC Monitoring (Preview)**. The legacy reports are currently maintained in **Reports** > **Cloud PC Overview**.

The monitoring page is organized so that administrators have an intuitive top to bottom of the page flow. When a selection is made at the top of the page, it impacts all data and components on the page including visualizations and tables.

1. Select the tab according to the task:
   a. **Connection Health**: Understand performance and reliability of user connections across your full tenant.
   b. **User and devices**: Deep-dive on the detailed history of specific users or devices, particularly useful for helpdesk scenarios.
   c. **Configurations**: Understand end to end connection configurations aggregated across your environment.
2. Set the data series for analysis from the configuration variables that most commonly impact Windows 365 and Cloud PCs.
3. Determine the timeframe.
4. Filter based on client, service and host configuration variables to identify and focus on specific cohorts.

## Connection Health Page

Use the connection health page to observe the full Windows 365 tenant, quickly identify when a problem occurs and isolate the cohorts.

Metrics shown:
1. **Average active connection count**: trend of all active connections for the given time
2. **Connection failure rate**: number of connections that have a failure (currently calculated based on ANY connection failure)
3. **Cloud PC health**: percentage of Cloud PCs that are healthy. Health is determined based on validation tests executed about every 30 minutes.
4. **Round trip time**: median (P50) RTT for all CPCs for the time period
5. **View Data**: tabular data used to create charts and trends

**Note:** Filters applied to the page impact the tabular data.

## Users and Devices Page

Use this page for granular analysis of a specific user or device. Especially useful for Help Desk calls.

1. Search for the known user or device
2. Select associated items via checkboxes to filter all visuals and tabular data
3. Use Time Range picker for desired time window
4. View per-user/device performance and reliability metrics

## Configurations Page

Less about identifying connection reliability/performance issues, more about understanding configurations:
- **Endpoint**: OS Type, OS Version, Client Type, etc.
- **Service**: provisioning policy, Cloud PC image, BCDR configuration
- **Host**: OS, Remote agents and settings

Each connection creates a potentially unique "signature" as users may connect from different devices.

## View Data

All pages have a "View Data" fly-out at the bottom:
1. **Select View data** to expand. Size by dragging the handle.
2. **Environment metrics**: Measures associated with performance and reliability. Each row represents an aggregate of a specific time range.
3. **Connection configuration**: View each connection and associated configuration. Use to narrow or understand common traits.
4. **Events**: Granular view of connection including checkpoint events, errors and Health Check results. Provides data to diagnose connection errors, reliability and performance issues.
