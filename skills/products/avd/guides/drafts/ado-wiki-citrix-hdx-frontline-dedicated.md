---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Partner Connectors/Citrix HDX Plus/Citrix HDX integration with Windows 365 Frontline Dedicated"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Partner%20Connectors/Citrix%20HDX%20Plus/Citrix%20HDX%20integration%20with%20Windows%20365%20Frontline%20Dedicated"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Citrix HDX Plus Integration with Windows 365 Frontline Dedicated

**Scenario:** 3P Client end users can request access to Frontline Cloud PC and are able to log in if there are enough active licenses.

Frontline is Cloud PC for shift workers. Targeted to users who works in shift and do need 24/7 access to the Cloud PC. Customers can provision up to x3 Cloud PCs compared to licenses amount.

## Architecture

- Customer needs both Citrix tenant and Azure tenant
- Citrix agent installed in VM, HDX protocol is active
- RD agent installed in VM but remains **inactive** (RDP only for troubleshooting)
- Engineering team built a partner API for license management
- Partners Dev integrate their APIs with FLW partner API and Graph API

## Important Design Integration Points

### Frontline Cloud PC Integration Key Points
- Handle start and stop API calls for frontline cloud PC sessions
- Detect user connect and disconnect events using 3rd party or Windows APIs

### Power State and License Consumption
- Power state is internal optimization; main concern is license consumption (incremented by start, decremented by stop)
- When user disconnects → license released → CPC state changes to "inStandbyMode"
- CPC remains running for **2 hours** after disconnect
- If no reconnect within 2 hours → CPC deallocated (powered off) → state "unassigned"
- If user connects within 2 hours ("warm start") → CPC state changes to "Active"
- Partner responsible to call "Start" API when connecting
- If connected without calling "Start" API → services detect connection and change state to "Active"

### Idle Timeout and Disconnect Timeout
- Use respective policies to set idle timeout and disconnect timeout
- Call stop API when either event occurs

## API Reference

### Start CloudPC
```
POST https://graph.microsoft.com/beta/me/cloudPCs/{cloudPCId}/start
```
Response accessState values:
- `Activating` - CloudPC is powering on (up to 3 min)
- `Active` - CloudPC is powered on and ready to connect
- `NoLicensesAvailable` - No license available, user may retry

Use `CloudPC/getfrontlineWorkCloudPcAccessState` API to check activation status.

### Stop CloudPC
```
POST https://graph.microsoft.com/beta/me/cloudPCs/{cloudPCId}/stop
```
- Releases license immediately and puts CPC in Standby mode
- Without stop call, IDS service powers off CPC as backup (up to 30 min delay, license stays acquired)

### Bulk Power On/Off (MEM Portal)
```
POST https://graph.microsoft.com/deviceManagement/managedDevices/bulkPowerOnCloudPc
POST https://graph.microsoft.com/deviceManagement/managedDevices/bulkPowerOffCloudPc
```
⚠️ Power Off: Machine powered off immediately, active user will lose connection.

## Kusto Queries

Leverage existing FLD Kusto queries for Citrix HDX integration with FLD scenario:
https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/884239/Windows-365-FrontLine

## MS Graph API Docs
- Start CPC: https://learn.microsoft.com/en-us/graph/api/cloudpc-start
- Check State: https://learn.microsoft.com/en-us/graph/api/cloudpc-getfrontlinecloudpcaccessstate
- Get Launch Info: https://learn.microsoft.com/en-us/graph/api/cloudpc-getcloudpclaunchinfo
- Stop CPC: https://learn.microsoft.com/en-us/graph/api/cloudpc-stop
