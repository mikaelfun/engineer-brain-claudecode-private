---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Reboot/Wvchelper and other reboot events"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Reboot/Wvchelper%20and%20other%20reboot%20events"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Wvchelper and Other Reboot Events

Troubleshooting guide for identifying reboot sources when Event Viewer shows User32 1074 reboot events with "CleanShutdown by wvchelper".

## Step 1: Get Activity ID from Kusto

```kql
cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName == "rms" or ApplicationName == "RMFunction"
| where env_time between (ago(1d)..ago(0d))
| where AccountId == "TENANT_ID"
| where Col1 contains "Restart"
| where OtherIdentifiers contains "DEVICE_ID"
| project env_time, ApplicationName, ActivityId, EventUniqueName, ColMetadata, Col1, Col2, OtherIdentifiers
```

Copy the ActivityID for the **rms** Application lines.

## Step 2: Check Reboot Source Using Activity ID

```kql
cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where env_cloud_environment == "PROD"
| where env_time between (ago(1d)..ago(0d))
| where ActivityId has_any("ACTIVITY_ID")
| where EventUniqueName contains "Reboot" or Col1 contains "Reboot" or Col1 contains "Restart"
| project env_time, ActivityId, EventUniqueName, ApplicationName, Col1, UserId, OtherIdentifiers
```

## Step 3: Identify Reboot Origin

### IWP (Web Client reboot trigger)
- Application name shows **iws** then **rms**
- ExecutionInfo contains: `Microsoft.CloudManagedDesktop.Services.ResourceManagementService.Controllers.WorkspaceController.Reboot`

### Intune-triggered reboot
- Application name shows only **rms**
- ExecutionInfo contains: `ResourceMgmt.API.Controllers.Public.CloudPCController.Reboot`
