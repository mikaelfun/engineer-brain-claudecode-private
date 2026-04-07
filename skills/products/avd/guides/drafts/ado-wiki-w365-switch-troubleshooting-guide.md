---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Switch/Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Switch/Troubleshooting%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows 365 Switch Troubleshooting Guide

## Getting Logs for Windows 365 and AVDHostApp

### Log Location
Logs are located at **%TEMP%/DiagOutputDir** on the user's local PC.
- **Windows365** sub-folder: Windows 365 logs
- **RdClientAutoTrace** folder: Azure Virtual Desktop (HostApp) traces

Remote logging also occurs in most scenarios with nearly identical content (some PII removed).

### Windows 365 Log Files and Their Meaning

| Log name | Meaning |
|--|--|
| error.log | Logs all information at the error level. Good starting point. Note: errors beginning `MSAL` or `OneAuth` can usually be ignored. |
| startup.log | Logs the Session ID (unique identifier) for one instance of Windows 365 from open to close |
| Windows365-{long id}-ConnectCpc-instance.log | Logs for a specific direct connection (not launched from start menu but from Fast Switch, pinned icon, or web portal) |
| Windows365-WebView-instance.log | Logs when app is launched from start menu or taskbar (mode for adding/removing CPC to Task View) |
| Windows365-FastSwitchCheck-instance.log | Logs when `ms-remotedesktop:setup` protocol is launched (shell runs on install, auto-adds compatible cloudpc to Task View) |

## Understanding Windows 365 App Switch Logs

### Key Stages:

1. **Session Identifiers**: Session ID and Correlation ID (CrossAppCorrelationId) separate each unique attempt
2. **Environment Type Check**: Generally should not exist in registry (user would have made a Registry Editor change)
3. **Fast Switch Mode**: `taskview environment` and `taskview username` values. If unexpected values → Remove and re-Add Cloud PC to Task View
4. **Limited Access Features**: Requirements in new Windows 11 OS versions for Fast Switch. If failed → upgrade OS
5. **AvdHostApp Install/Verify**: Will timeout if download takes too long or is paused in Microsoft Store. Navigate to AvdHostApp store page and resume download to resolve.
6. **Shell Communication**: Windows 365 communicates with shell through Windows protocol
7. **Sign-in via OneAuth**: May be silent or require user interaction. Timer in place between steps.
8. **Msrdc Launch**: Can be ignored - this component is disabled for Fast Switch
9. **Connection Start**: Series of notifications from AvdHostApp ending with `OnDisconnected` (error) or `OnLoginComplete` (success). **Note**: At this point Windows 365 app is done - it no longer controls the user experience including error display.
10. **Process Close**: Either closes or shows error to user

## Alternative Method - Telemetry and Remote Logs

1. Get unique identifier (Correlation ID or Session ID) from end user or admin
2. Query Windows 365 telemetry using Correlation/Session ID

### Key Telemetry Tables
- **windows365_user_action**: Shows similar info as logs, quickly surfaces app/OS version
- **windows365_error**: Shows error info, sometimes with extended details not in logs

### Sample Kusto Query

```kusto
//Windows App correlationid sessionid lookup
let correlation = '<CORRELATION_ID>';
let SessionId = '';
let CorrelationId = ['correlation'];
cluster('https://cpctelemetry.eastus2.kusto.windows.net').database("CloudPC-EndUserExperience-Prod").windows365_user_action
| union (cluster('https://cpctelemetryneu.northeurope.kusto.windows.net').database('CloudPC-EndUserExperience-Prod').windows365_user_action)
| union cluster('https://cpctelemetry.eastus2.kusto.windows.net').database("CloudPC-EndUserExperience-Prod").windows365_error
| union (cluster('https://cpctelemetryneu.northeurope.kusto.windows.net').database('CloudPC-EndUserExperience-Prod').windows365_error)
| where isnotempty(CorrelationId)
| where CorrelationId contains CorrelationId
| where Session_Id == SessionId
| limit 1000
| project EventInfo_Time, CorrelationId, Tag, Action_Detail, Scenario_Name, Location, Error_Code, Error_Detail, Session_Id, Cross_App_Correlation_Id, Tenant_Id, User_Id, Env_Type, App_Version, DeviceInfo_Id, DeviceInfo_OsVersion, DeviceInfo_Make, DeviceInfo_Model
```

**Note**: Local machine logs create more complete story since they can contain items like filepaths not included in telemetry.
