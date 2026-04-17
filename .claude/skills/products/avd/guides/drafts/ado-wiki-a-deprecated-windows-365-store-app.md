---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/Archived Content/Deprecated Content/DEPRECATED_Windows 365 Store App"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FSandbox%2FArchived%20Content%2FDeprecated%20Content%2FDEPRECATED_Windows%20365%20Store%20App"
importDate: "2026-04-06"
type: troubleshooting-guide
status: deprecated
deprecationNote: "This article is no longer relevant. See Windows App (Unified Client) documentation."
---

> ⚠️ **已弃用**：此文档已不再维护。请参阅 [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Client))。

# Support Boundaries

- All cases will start with W365 CSS team however there will be scenarios where they send collabs to CSS AVD for help with AVD related issues.
- If W365 App case starts in UEX queue then the engineer should transfer case to W365
  - SAP: Windows 365\Windows 365\Windows 365 Enterprise Edition\<L3>

| Scenario | Supported By | Notes |
|--|--|--|
| General first party client issues | W365 | As first step CPC engineer should ask customer to install msrdc to see if repros |
| Installation Issues | W365 | W365 app is responsible for installing AVD Host App; CPC engineer will investigate and if needs assistance will send collab to Perf or create incident with CPC PG; CSS AVD should not get any collabs for install issues |
| .avd file issues | W365 | AVD host app uses .avd file launch mechanism which is similar to URI launcher; Because w365 app constructs the URI CPC engineer will create incident with CPC PG so can investigate; if CPC investigates and determines not CPC issue will transfer to AVD PG |
| Connection monitor issues | W365 | w365app has custom connection monitor UI messages; CPC engineer should create incident with CPC PG so can investigate; If CPC investigates and determines not CPC issue will transfer incident to AVD PG |
| App Crash | W365 | CPC engineer will investigate and if needs assistance will engage CPC PG; If CPC investigates and determines not CPC issue will transfer incident to AVD PG |

# Overview

The Windows 365 team built a store app which relies on Azure Virtual Desktop (HostApp) package. The Windows 365 Cloud PC package will have its own UI to manage Cloud PC. It, in turn, delegates the connection to these Cloud PCs to the AVD (HostApp) through a file protocol. More precisely, it generates and opens a JSON file with the **.avd extension** that contains the required information for MSRDC to connect to the selected Cloud PC.

# .avd File Launch Mechanism

- Uses a new File Type association (.avd)
- Partners can then simply invoke Shell command to open File which invokes registered file handler with the file as a parameter.
- The .avd file contains the metadata for how to get the rdp file. It adds the feed aspect — checks if the RDP file has changed and if it has will download a new one.

## Example .avd File

```json
{
  "Version": "0",
  "Env": "avdarm",
  "WorkspaceId": "1afdb325-254d-4fc8-a444-616d83e89bc8",
  "ResourceId": "1afdb325-254d-4fc8-a444-616d83e89bc8",
  "UserName": "amy@contoso.com",
  "PeerActivityId": "session=022a2b35-1a84-4b66-8c63-09ded7245898;cpc=1234;launch=0;",
  "notificationwndclassname": "SeaHawkNotificationWndClassName",
  "launchpartnerid": "w365",
  "launchpartnermode": "FastSwitch/BootToCloud/Default",
  "cloudpcid": "cpcid",
  "launchpartnerversion": "1.2.3.4",
  "DisplaySettings": {
    "UseMultimon": "1",
    "DynamicResolution": "1"
  }
}
```

# App Flow

1. User installs app from Microsoft Store
2. User opens w365 app → w365app will check if AVD Host App is installed (installs if needed)
3. At first launch user signs into w365 — authentication request to graph API to get list of cloud PCs
4. User clicks connect → w365 app downloads launch.avd (URI launcher containing metadata for how to get the rdp file)
5. URI launches msrdcw and downloads feed (JSON file + rdp file)
6. msrdcw calls msrdc and launches the resource: `msrdc.exe "<rdp file>" /settingsfile "<json file>"`

# Key File Locations

| File | Location |
|------|----------|
| launch.avd | `C:\Users\%username%\AppData\Local\Packages\MicrosoftCorporationII.Windows365_8wekyb3d8bbwe\LocalCache` |
| RDP File | `C:\Users\%username%\AppData\Local\Packages\MicrosoftCorporationII.AzureVirtualDesktopHostApp_8wekyb3d8bbwe\LocalCache\Local\rdclientmsix\protocolhandler\` |
| JSON File | `C:\Users\%username%\AppData\Local\Packages\MicrosoftCorporationII.AzureVirtualDesktopHostApp_8wekyb3d8bbwe\LocalCache\Local\rdclientmsix\connectionsettings.store\` |
| Webfeed Trace | `C:\Users\%username%\AppData\Local\Temp\DiagOutputDir\RdClientAutoTrace` |
| Windows365.log | `C:\Users\%username%\AppData\Local\Packages\MicrosoftCorporationII.Windows365_8wekyb3d8bbwe\LocalCache` |
