---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/Archived Content/Deprecated Content/DEPRECATED_Mobius/DEPRECATED_Unified Windows App"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1234632"
importDate: "2026-04-06"
type: troubleshooting-guide
deprecated: true
deprecationNote: "See Windows App (Unified Client) documentation going forward."
---

> ⚠️ **Deprecated**: See the [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Client)) going onwards.

[[_TOC_]]

# Overview

The Unified Windows App in Microsoft Store is called **Windows App**.

Just like the existing AVD store app, there are 2 components:
1. **Windows App** (aka Connection Center) — shows UI, lists resources, launches connection by calling hostapp (msrdc)
2. **HostApp** — contains MSRDC binaries

# Goals
- Allow user to see resources associated with one account
- Allow user to switch between different account types (AAD and MSA)

# Non-Goals
- Allow user to see resources from all accounts in one UI

# Design

The unified client supports managed accounts (AAD) and unmanaged accounts (MSA). Resource types: remote devices (W365, AVD, Remote Desktop), on-prem remote desktops & RDS, and apps.

Built on top of existing W365 native client using **WebView2** and **PIE**.

Key difference: while the client connects to backend service for connection center UX, web files for unified client UX are stored **locally** and loaded directly after app starts.

Two UX versions:
- **Managed accounts (AAD)**: unified client connection center (shows both remote and local resources)
- **Unmanaged accounts (MSA)**: consumer connection center (W365 only)

The unified client depends on the **AVD host app** to connect to remote VM. Both the unified client MSIX and the AvdHostApp MSIX need to be installed.

# Resource Discovery

- **Devices** button → full desktop resources
- **Apps** → RemoteApps
- **Pinning** → pin resources to Home screen

Resource discovery implemented natively — web end sends request through PIE bridge, native end calls AVD C++ SDK to retrieve all resources.

# Architecture Overview

Components:
- **ECS** — flighting system for feature exposure control
- **ARIA** — telemetry destination for clients
- **WebView2** — renders the connection center UI from local web files
- **PIE bridge** — communication between web and native layers

# Logging

## App startup, UI and Feed Logs

**Location**: `%TEMP%\DiagOutputDir\Windows365\Logs`
- When installed from Microsoft Store or MSIX package: `...\Packages\MicrosoftCorporationII.Windows365_8wekyb3d8bbwe\LocalCache\...`
- When run as EXE: the `Packages\...` portion of path is omitted

**3 Log Files** (rotating file sink):

| File | Log Level | Purpose |
|------|-----------|---------|
| `Error.log` | Error | Always present; logs only Error/Critical level |
| `startup.log` | Informational | App startup and App Instance Mutex acquisition phase |
| `Windows365-WebView-instance.log` | Informational | All logs for the given scenario name |

## Connection Trace (same as Windows Desktop Client)

- **Name**: `RdClientAutoTrace-WppAutoTrace-<date>.etl`
- **Location**: `C:\Users\%username%\AppData\Local\Temp\DiagOutputDir\RdClientAutoTrace`

# Connection Flow

1. App starts → checks if AvdHostApp is installed (downloads from Store if needed)
2. Resource discovery via PIE bridge → AVD C++ SDK
3. User selects resource → unified client calls msrdc.exe to establish connection
4. Connection telemetry → ARIA
5. Feature flighting → ECS
