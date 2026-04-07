---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Microsoft Entra GSA App Discovery"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FMicrosoft%20Entra%20GSA%20App%20Discovery"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra GSA App Discovery

Application Discovery for Private Access is a feature of Microsoft Entra Global Secure Access. This feature gives Administrators visibility and insights on applications in the corporate network that are accessed by end users as part of Quick Access.

By using data from Application Discovery, the administrator can create corresponding Microsoft Entra ID applications. The transition from Quick Access to per-application publishing allows better control and granularity over each application (e.g., creating conditional access policies and setting user assignment per application).

## Feature Status

This is an unreleased product. Documentation still in development.

## Terminology

- **Private Access**: Allows users to access resources in the corporate network securely when connected to the internet
- **Quick Access**: Allows users to access a range of IPs and FQDNs (transitional step towards per-application publishing)
- **Application segments**: Network destinations (FQDN/IP + protocol + port, e.g., `portal.contoso.com, TCP, 443`)
- **Connections**: Outbound connections initiated by end-user device to a private access application (mapped to OS sockets)

## Getting Started

1. [Export GSA Traffic Logs](https://learn.microsoft.com/entra/global-secure-access/how-to-view-traffic-logs#configure-diagnostic-settings-to-export-logs) to a Log Analytics workspace
2. From the Microsoft Entra portal select **Monitor** > **Workbooks**
3. Open the *Discovered Application Segments* workbook in the workspace
4. Review results and create desired [Global Secure Access applications](https://learn.microsoft.com/entra/global-secure-access/how-to-configure-per-app-access#create-a-global-secure-access-application)

## Using the Workbook

### Summary Tab

Shows overall statistics on Private Access application segments accessed by users (last 24 hours and 30 days):
- New application segments, connections, unique users, unique devices
- Top 5 application segments by unique users
- Top 5 new application segments by unique users
- Top 5 application segments by connections

### Application Segments Tab

Table showing all application segments sorted by descending unique users:
- Destination (FQDN/IP), port, protocol, unique users, connections, last/first access, upload/download bytes
- Drill-down: connections over time, unique users over time, upload/download bytes, device distribution, user access details

### Users Tab

Shows all application segments accessed by a specific user during the selected time range.

## Onboarding Private Access Applications

After reviewing discovered application segments:
1. Prioritize by usage (number of users or connections)
2. Use FQDN/IP, port, and protocol from the workbook to create Microsoft Entra ID applications
3. Use user access data for assignment and conditional access configuration

## Troubleshooting

If the workbook fails to load data or displays partial data:
1. [Re-export the traffic logs](https://learn.microsoft.com/entra/global-secure-access/how-to-view-traffic-logs#how-to-view-the-traffic-logs) and reload the workbook
2. If that does not resolve the issue, open an IcM with PSR repro and [HAR file](https://learn.microsoft.com/azure/azure-portal/capture-browser-trace)

### ICM Escalations

Microsoft Network as a Service/ZTNA Data Pipeline: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=j1L1U3

## Case Handling

Supported by the **Hybrid Auth Experiences** community. Exporting traffic logs is supported by Networking.

SAP: Azure\Global Secure Access (Microsoft Entra Internet and Private Access) - Private Access

## Licensing

- Microsoft Entra ID P1 or P2 license
- [Log Analytics workspace](https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-workspace-overview) (ingestion charges apply)

## Availability

Public Cloud only.
