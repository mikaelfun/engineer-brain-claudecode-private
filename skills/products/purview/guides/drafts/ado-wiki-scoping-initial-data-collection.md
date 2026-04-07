---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Processes/Case Management/Scoping & Initial data collection"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FCase%20Management%2FScoping%20%26%20Initial%20data%20collection"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scoping & Initial Data Collection for Purview Cases

Always collect the following information from the customer, depending on the scenario.

**NOTE:** Before engaging TA/SME/EEE or Product Group, collect the logs mentioned in the Logs Required for Escalation wiki.

## Generic (should be already in the support case)
- Purview Account name, region and subscription Id
- **Customer environment details** (Custom policy/VNet/Firewall) — critical to understand if customer subscriptions have custom policies on RG or subscription, and if Purview or data sources are behind a VNet or firewall.

## Provisioning/Deprovisioning Issues
- Purview Account name, region and subscription Id
- Correlation Id returned by the Provisioning failure

## Scan/Asset/Classification Issues
- **Scan Run Id** — found in scan run history under the scan name
- Fully qualified Asset name/URI (for assets not detected or classified)
  - SQL Server: `mssql://server/db/schema/table`
  - Blob Storage: full URL path; if resource set, also collect `sampleUri` from `AggregatedProperties`

## Search/Browse Assets Issues
- Scan Run Id
- Fully qualified Asset name/URI

## On-premise Connectivity / SHIR Issues
- **SHIR version** — always try to get customer to latest version
- **Report Id** when customer uses "Send Logs" option (without Report Id, cannot filter logs)
- Can also view logs using "View Logs" and opening in Windows Event Viewer

## Lineage Issues
- Pipeline Run ID of the ADF pipeline
- Activity Run ID(s) of the ADF activities
- Activity output JSON to confirm `reportLineageToCatalog` status

## Driver Logs Collection
1. Enable driver-level logs:
   - Go to driver folder under IR installation: `C:\Program Files\Microsoft Integration Runtime\3.0\Shared\ODBC Drivers\[Driver]\lib`
   - Edit INI file: Change LogLevel to 6, replace `LogType=ETW` with `LogPath=D:\OutputLog`
2. Change IR service running account to Windows login user
3. Restart "Integration Runtime Service"
4. Enable ODBC trace: Control Panel > Administrative Tools > ODBC Data Sources (64-bit) > Tracing tab > Start Tracing Now
5. Reproduce issue
6. Disable: Stop Tracing, restore INI LogLevel to 5, restore `LogType=ETW`, change IR account back to `NT SERVICE\DIAHostService`
7. Share logs: ODBC trace log + driver logs from OutputLog folder + pipeline Run ID
