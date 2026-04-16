# AVD Windows App 客户端 - 杂项 — 排查工作流

**来源草稿**: ado-wiki-a-entra-auth-urls-windows-app.md, ado-wiki-avd-client-traces.md, ado-wiki-b-switching-to-unified-client.md, ado-wiki-b-unified-client-architecture-notes.md, ado-wiki-b-unified-client-setup-guides.md, ado-wiki-b-unified-windows-app.md, ado-wiki-rdp-connection-flow-msrdc-mstsc.md, ado-wiki-windows-app-branding-scoping-questions.md, ado-wiki-windows-app-branding-setup-guide.md, ado-wiki-windows-app-branding-troubleshooting.md, ado-wiki-windows-app-data-collection.md, ado-wiki-windows-app-gov-cloud-support.md, onenote-avd-windows-app-migration.md
**Kusto 引用**: (无)
**场景数**: 49
**生成日期**: 2026-04-07

---

## Scenario 1: Authentication Flow URLs
> 来源: ado-wiki-a-entra-auth-urls-windows-app.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **odc.officeapps.live.com** - Hosting the first Auth prompt screen - directing to login.microsoftonline.com or login.live.com depending on the type of account.
   - **login.microsoftonline.com** (and 302 office.com) - Requesting auth: pass or passwordless for Enterprise accounts
   - **aadcdn.msauth.net** - Referred by login.microsoftonline.com - doing auth
   - **aadcdn.msftauth.net** - Doing auth
   - **\*.cdn.office.net** - CDN resources
   - **ecs.office.com** - Getting tenant features and flights
   - **ctldl.windowsupdate.com** - Certificate trust list downloads

## Scenario 2: Certificate Checks
> 来源: ado-wiki-a-entra-auth-urls-windows-app.md | 适用: \u901a\u7528 \u2705

### 排查步骤
See [Azure Certificate Authority details | Microsoft Learn](https://learn.microsoft.com/en-us/azure/security/fundamentals/azure-CA-details?tabs=root-and-subordinate-cas-list#certificate-downloads-and-revocation-lists)

## Scenario 3: Web Client Trace
> 来源: ado-wiki-avd-client-traces.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Note: The following steps are for AVD Web Client https://client.wvd.microsoft.com/arm/webclient/, NOT IWP https://windows365.microsoft.com/
1. Login to web client
2. In top right corner click 3 dots -> About
3. Click Start Recording
4. Reproduce issue
5. In top right corner click 3 dots again -> About -> Stop Recording
6. Trace file will automatically download

## Scenario 4: Windows Client Trace
> 来源: ado-wiki-avd-client-traces.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> This is included also in MSRD-Collect
1. Close all instances of MSRDC.exe and MSRDCW.exe through task manager
2. Open explorer -> navigate to `C:\Users\%username%\AppData\Local\Temp\DiagOutputDir` and delete RdClientAutoTrace folder
3. Ask user to open WVD client and reproduce issue
4. ETL trace won't finish writing until WVD client is gracefully closed
   - Click X to close
   - Then right click on WVD icon in systray -> select disconnect all sessions
5. Go to:
   - `C:\Users\%username%\AppData\Local\Temp\DiagOutputDir`
   - (if you cannot find in this path, check `%localappdata%\Temp\2\DiagOutputDir\RdClientAutoTrace`)
   - ETL trace will be in RdClientAutoTrace folder

## Scenario 5: Mac OS Client Trace
> 来源: ado-wiki-avd-client-traces.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Open Help -> Troubleshooting -> Logging
2. Choose required Core and UI log level and choose a folder location for output

## Scenario 6: iOS Client Trace
> 来源: ado-wiki-avd-client-traces.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Open Setting -> Troubleshooting
2. Similar with MacOS client, choose required Core and UI log level and choose a folder location for output

## Scenario 7: AVD Web Client
> 来源: ado-wiki-b-switching-to-unified-client.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Displays toggle button called **"New Client"** to switch between v1 and v2 (defaults to v2)
   - Starting November 16: toggle moves to **Settings** menu
   - When preview starts: toggle renamed to **"Try New"** (defaults to OFF); if toggled ON → switches to new unified portal
   - Banner added: "Windows App is the new way..." with **"Open Windows App"** button → takes user to Store to install

## Scenario 8: Windows Desktop Client (msrdc)
> 来源: ado-wiki-b-switching-to-unified-client.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - When preview starts: users get notification that new version is available
   - New version has toggle button: **"Try the new Unified Client"** (defaults to OFF)
   - If toggled ON: client closes → Windows App downloads in background → opens with new UI, new icon, new app name
   - **NOTE**: preview toggle won't be present immediately at public preview — will follow shortly after

## Scenario 9: AVD Store App
> 来源: ado-wiki-b-switching-to-unified-client.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - When Windows App enters public preview: users can access new experience via **preview toggle** in the app
   - Turning on preview toggle: closes app → reopens with new UI, new icon, new app name
   - **NOTE**: preview toggle won't be present immediately at public preview — will follow shortly after

## Scenario 10: Unified Web Client Notes
> 来源: ado-wiki-b-unified-client-architecture-notes.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **`get cloudPCs/{cloudPCId}/getCloudPcLaunchInfo`**: relates to a different abstraction for identifying a Cloud PC (workspace ID needs conversion to get RDP file, tenant, resource ID)
   - **ADFS SSO**: not supported during public preview → falls back to password
   - **Azure AD SSO**: supported for public preview
   - **Mobius Broadcast Channel Diagram**: communication between Mobius portal and client for launching remote apps in correct browser tab
   - **Consumer scenario**: separate (out of scope for public preview)
   - Same endpoints, API calls, FQDNs as existing web client → note new `cloud.microsoft` name and redirect
   - **Telemetry**:
   - Client telemetry for AVD web client and Mobius client are distinct
   - Nighthawk sends to ARIA (scrubbed of EUPI)
   - RD Core emits telemetry uniformly to **Event Hub**
   - **Nighthawk** = application running in browser that loads RD Core Web
   - Handles authentication, connecting to backend services
   - Distinct telemetry from AVD client (different destination too)
   - **RD Core** = both AVD web client and Nighthawk web client rely on RD Core for connection/session management
   - RD Core emits telemetry to Event Hub uniformly
   - **Mobius client**:
   - Connects directly to resource without going through feed discovery
   - User Agent: `CPC.Web`
   - Diagnostics data from RD Core has separate identifier for it
   - **Feed Discovery**:
   - Happens in different URL/web app than the connection itself
   - Users can bookmark connection URL to skip feed discovery in future
   - Connection URL contains resource ID → can go straight to connect without feed discovery

## Scenario 11: Unified Windows App Notes
> 来源: ado-wiki-b-unified-client-architecture-notes.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Hostapp**: special version for the app; only one version installed even if customer also has AVD store app client (both use same hostapp)
   - **ECS**: flighting system (both CPC and AVD, not CPC-only)
   - **ARIA**: telemetry destination (both CPC and AVD, not CPC-only)

## Scenario 12: Store App — Switching to Unified Client Preview (Selfhost Only)
> 来源: ado-wiki-b-unified-client-setup-guides.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Add registry key:
```
   [HKEY_CURRENT_USER\Software\Microsoft\Windows365]
   "Environment"=dword:00000000
```
2. Install W365 Store app
3. Toggle **Preview Option** → App will restart
4. New app name becomes **Windows App**

## Scenario 13: New UI Overview (for reference)
> 来源: ado-wiki-b-unified-client-setup-guides.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Home Screen** — pinned resources
   - **Devices** — Full Desktops
   - **Apps** — Remote Apps

## Scenario 14: Unified Web Client Access URLs (Historical — No Longer Active)
> 来源: ado-wiki-b-unified-client-setup-guides.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```
W365 resources (test account for bug bash): https://deschutes-sh.microsoft.com/ent
AVD resources in AVD Self Host:             https://aka.ms/mobi-avd-sh
AVD resources in Prod:                      https://aka.ms/mobi-avd-pe
```

## Scenario 15: Unified Web Client Flow
> 来源: ado-wiki-b-unified-client-setup-guides.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Go to URL
2. Select account
3. Home Screen appears
4. **Devices** → Full Desktops
5. **Applications** → Remote Apps
6. Resources can be **pinned to Home Screen**
7. **Connection Information** available during session
8. **Notifications** panel available

## Scenario 16: Overview
> 来源: ado-wiki-b-unified-windows-app.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The Unified Windows App in Microsoft Store is called **Windows App**.
Just like the existing AVD store app, there are 2 components:
1. **Windows App** (aka Connection Center) — shows UI, lists resources, launches connection by calling hostapp (msrdc)
2. **HostApp** — contains MSRDC binaries

## Scenario 17: Goals
> 来源: ado-wiki-b-unified-windows-app.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Allow user to see resources associated with one account
   - Allow user to switch between different account types (AAD and MSA)

## Scenario 18: Non-Goals
> 来源: ado-wiki-b-unified-windows-app.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Allow user to see resources from all accounts in one UI

## Scenario 19: Design
> 来源: ado-wiki-b-unified-windows-app.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The unified client supports managed accounts (AAD) and unmanaged accounts (MSA). Resource types: remote devices (W365, AVD, Remote Desktop), on-prem remote desktops & RDS, and apps.
Built on top of existing W365 native client using **WebView2** and **PIE**.
Key difference: while the client connects to backend service for connection center UX, web files for unified client UX are stored **locally** and loaded directly after app starts.
Two UX versions:
   - **Managed accounts (AAD)**: unified client connection center (shows both remote and local resources)
   - **Unmanaged accounts (MSA)**: consumer connection center (W365 only)
The unified client depends on the **AVD host app** to connect to remote VM. Both the unified client MSIX and the AvdHostApp MSIX need to be installed.

## Scenario 20: Resource Discovery
> 来源: ado-wiki-b-unified-windows-app.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Devices** button → full desktop resources
   - **Apps** → RemoteApps
   - **Pinning** → pin resources to Home screen
Resource discovery implemented natively — web end sends request through PIE bridge, native end calls AVD C++ SDK to retrieve all resources.

## Scenario 21: Architecture Overview
> 来源: ado-wiki-b-unified-windows-app.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Components:
   - **ECS** — flighting system for feature exposure control
   - **ARIA** — telemetry destination for clients
   - **WebView2** — renders the connection center UI from local web files
   - **PIE bridge** — communication between web and native layers

## Scenario 22: App startup, UI and Feed Logs
> 来源: ado-wiki-b-unified-windows-app.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Location**: `%TEMP%\DiagOutputDir\Windows365\Logs`
   - When installed from Microsoft Store or MSIX package: `...\Packages\MicrosoftCorporationII.Windows365_8wekyb3d8bbwe\LocalCache\...`
   - When run as EXE: the `Packages\...` portion of path is omitted
**3 Log Files** (rotating file sink):
| File | Log Level | Purpose |
|------|-----------|---------|
| `Error.log` | Error | Always present; logs only Error/Critical level |
| `startup.log` | Informational | App startup and App Instance Mutex acquisition phase |
| `Windows365-WebView-instance.log` | Informational | All logs for the given scenario name |

## Scenario 23: Connection Trace (same as Windows Desktop Client)
> 来源: ado-wiki-b-unified-windows-app.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Name**: `RdClientAutoTrace-WppAutoTrace-<date>.etl`
   - **Location**: `C:\Users\%username%\AppData\Local\Temp\DiagOutputDir\RdClientAutoTrace`

## Scenario 24: Connection Flow
> 来源: ado-wiki-b-unified-windows-app.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. App starts → checks if AvdHostApp is installed (downloads from Store if needed)
2. Resource discovery via PIE bridge → AVD C++ SDK
3. User selects resource → unified client calls msrdc.exe to establish connection
4. Connection telemetry → ARIA
5. Feature flighting → ECS

## Scenario 25: Environment & Configuration
> 来源: ado-wiki-windows-app-branding-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Windows 365, AVD, or both?
   - Branding policy in Intune (W365) or Azure Portal (AVD)?
   - Policy assigned tenant-wide or to specific groups?
   - Multiple branding policies targeting same user/group?

## Scenario 26: User Scenario / UX
> 来源: ado-wiki-windows-app-branding-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Issue related to: logo, company name, colors, support info, custom URLs?
   - Branding issue before or after sign-in?
   - Missing completely or partially applied?
   - Differs between platforms (Windows, Web, macOS, iOS, Android)?

## Scenario 27: Policy & Conflict Validation
> 来源: ado-wiki-windows-app-branding-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - W365 branding policy targeting user?
   - AVD branding policies targeting same user?
   - AVD policies with lower rank that could override?

## Scenario 28: CSS Decision-Making Signals
> 来源: ado-wiki-windows-app-branding-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Configuration issue: policy targeting, conflict resolution, asset validation
   - Known limitation: platform parity or preview behavior
   - Potential product issue: inconsistent behavior with correct policy/assets

## Scenario 29: Admin - Windows 365 (Intune)
> 来源: ado-wiki-windows-app-branding-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Sign in to Intune admin center
2. Navigate to Devices > Windows 365 > Settings
3. Create a new Windows App Settings policy
4. Configure branding fields (company name, logo, colors, support info, URLs)
5. Assign policy to users or groups
6. Review and create

## Scenario 30: Admin - Azure Virtual Desktop
> 来源: ado-wiki-windows-app-branding-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Sign in to Azure Portal
2. Navigate to Azure Virtual Desktop > Windows App settings
3. Create Windows App Settings object with unique rank
4. Configure branding properties
5. Assign users or groups
6. Save configuration

## Scenario 31: CSS Verification Checklist
> 来源: ado-wiki-windows-app-branding-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Policy is assigned to affected user
   - No conflicting higher-priority policy exists
   - Branding fields meet size and format requirements
   - User has signed in after policy creation

## Scenario 32: Diagnosis Steps
> 来源: ado-wiki-windows-app-branding-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Confirm affected user and platform
2. Verify policy assignment and scope
3. Check for conflicting policies
4. Validate branding asset requirements (size, format)
5. Confirm client version and sign-in state

## Scenario 33: Kusto Queries (GRS Reporting)
> 来源: ado-wiki-windows-app-branding-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - fn_GetSettingProfileEntity: Get all setting profiles for tenant, by UniqueId, by TemplateId
   - fn_GetSettingTargetEntity: Get setting targets, check branding by SettingDefinitionId
   - Cluster: cpcdeedprpttestgbl.eastus / Reporting database
   - Key SettingDefinitionIds: W365.WindowsApp.Branding.CompanyLogo, W365.WindowsApp.*

## Scenario 34: Windows App (Unified Client) — Data Collection Guide
> 来源: ado-wiki-windows-app-data-collection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Note: This content originated from deprecated Mobius documentation. The current Windows App documentation is at the [Windows App (Unified Client)](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Client)) page.

## Scenario 35: Getting Activity ID
> 来源: ado-wiki-windows-app-data-collection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**In the app:**
1. On connection bar click Connection Information icon
2. Click down arrow to show details
3. Copy to clipboard and paste in case notes
**Via ASC:**
1. In ASC go to Host pool > Connection Errors tab > search for failure

## Scenario 36: Getting Logs
> 来源: ado-wiki-windows-app-data-collection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Close Windows App
2. Navigate to `%temp%\DiagOutputDir`
3. Two folders should be present:
   - **RdClientAutoTrace** — connection trace files
   - **Windows365/Logs** — contains Error.log, startup.log, and Windows365-WebView-instance.log
4. Ensure the connection trace and the 3 log files are present
5. Zip up the entire DiagOutputDir folder

## Scenario 37: Getting Web Client Trace
> 来源: ado-wiki-windows-app-data-collection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Click the Shortcuts/support/about icon
2. Click "Capture Logs"
3. Save to desired location

## Scenario 38: 1. GCC: W365 Portal (IWP) Deprecated -> Windows App
> 来源: ado-wiki-windows-app-gov-cloud-support.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - No functional change, only access point changes
   - Deprecation banner/communications sent to customers

## Scenario 39: 2. GCCH/FFX/Mooncake: New Windows App Support
> 来源: ado-wiki-windows-app-gov-cloud-support.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - New support enablement, NOT deprecation
   - Directly to GA (no preview)
   - Experience consistent with Commercial

## Scenario 40: Troubleshooting
> 来源: ado-wiki-windows-app-gov-cloud-support.md | 适用: Global-only \u274c

### 排查步骤
   - GCC cannot access Portal: Expected deprecation, use Windows App
   - Migration concerns: No migration required, access redirection only
   - GCCH/FFX/Mooncake confusion: New enablement, not breaking change

## Scenario 41: Windows App Migration Guide for Mooncake
> 来源: onenote-avd-windows-app-migration.md | 适用: Mooncake \u2705

### 排查步骤
> Source: OneNote - Mooncake POD Support Notebook / AVD / Feature Verification / Windows App replacement
> Status: draft

## Scenario 42: Retirement Timeline
> 来源: onenote-avd-windows-app-migration.md | 适用: Mooncake \u2705

### 排查步骤
| Platform | Original Software | Replacement | EOL Date | China Status |
|----------|-------------------|-------------|----------|--------------|
| Windows | Remote Desktop app (Store) | Windows App | May 27, 2025 | End of support, no extension |
| Windows | Remote Desktop client (MSI) | Windows App | **Sep 28, 2026** (extended from Mar 27) | Supported until Windows App fully supports Mooncake |
| Windows | Thin client software | Vendor-dependent | N/A | Check with vendor |
| Mac | Remote Desktop Beta | Windows App | TBD | Does not support Dual Federation |

## Scenario 43: Current Status (as of 2026-03)
> 来源: onenote-avd-windows-app-migration.md | 适用: Mooncake \u2705

### 排查步骤
   - Windows App is usable for Mooncake customers **without** Dual Federation scenario
   - Remote Desktop MSI retirement date: **September 28, 2026** (Azure Health: 8Q5F-800)
   - Dual Federation support: validation build available, awaiting GA

## Scenario 44: For Windows App versions < 2.0.916.0
> 来源: onenote-avd-windows-app-migration.md | 适用: Global-only \u274c

### 排查步骤
1. Install Windows App from Microsoft Store
2. Add registry key:
   - Path: `HKCU\Software\Microsoft\WindowsApp`
   - Name: `EnableGovernmentNationalCloudSignInOption`
   - Type: DWORD
   - Value: `2`
3. Restart Windows App
4. Use the national cloud sign-in button to log in to 21V

## Scenario 45: For Windows App versions >= 2.0.916.0 (No longer needed after this version)
> 来源: onenote-avd-windows-app-migration.md | 适用: Mooncake \u2705

### 排查步骤
Mooncake support is built-in. If testing preview:
1. Add registry key:
   - Path: `HKCU\Software\Microsoft\WindowsApp\Flights`
   - Name: `EnableMooncakeSupport`
   - Type: DWORD
   - Value: `1`
2. Reset app: Settings > Apps > Windows App > Advanced options > Reset
3. Restart Windows App

## Scenario 46: User Switching
> 来源: onenote-avd-windows-app-migration.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - After login, users can switch accounts via the app's user menu

## Scenario 47: Legacy Download Links
> 来源: onenote-avd-windows-app-migration.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - macOS Remote Desktop: [App Store](https://apps.apple.com/us/app/microsoft-remote-desktop/id1295203466?mt=12) or [App Center](https://install.appcenter.ms/orgs/rdmacios-k2vy/apps/microsoft-remote-desktop-for-mac/distribution_groups/all-users-of-microsoft-remote-desktop-for-mac)

## Scenario 48: Impacted Customers (Tracking)
> 来源: onenote-avd-windows-app-migration.md | 适用: Mooncake \u2705

### 排查步骤
   - Multiple customers waiting for Dual Federation GA (tracked via ICM 596528229)
   - Internal tracking mail: "[Internal] Confirm the support plan of Windows App for China/21Vianet AVD"

## Scenario 49: Known Limitations
> 来源: onenote-avd-windows-app-migration.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Windows App does not support Dual Federation on macOS
   - Canary builds are NOT for production use
