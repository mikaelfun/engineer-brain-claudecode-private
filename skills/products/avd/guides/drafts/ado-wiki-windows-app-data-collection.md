---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/Archived Content/Deprecated Content/DEPRECATED_Mobius/DEPRECATED_Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/Archived%20Content/Deprecated%20Content/DEPRECATED_Mobius/DEPRECATED_Data%20Collection"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows App (Unified Client) — Data Collection Guide

> Note: This content originated from deprecated Mobius documentation. The current Windows App documentation is at the [Windows App (Unified Client)](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Client)) page.

## Unified Windows App (Desktop)

### Getting Activity ID

**In the app:**
1. On connection bar click Connection Information icon
2. Click down arrow to show details
3. Copy to clipboard and paste in case notes

**Via ASC:**
1. In ASC go to Host pool > Connection Errors tab > search for failure

### Getting Logs
1. Close Windows App
2. Navigate to `%temp%\DiagOutputDir`
3. Two folders should be present:
   - **RdClientAutoTrace** — connection trace files
   - **Windows365/Logs** — contains Error.log, startup.log, and Windows365-WebView-instance.log
4. Ensure the connection trace and the 3 log files are present
5. Zip up the entire DiagOutputDir folder

## Unified Web Client

### Getting Activity ID

**In the browser:**
1. Click Connection Information Icon
2. Click "Download Report"
3. Save to desired location

**Via ASC:**
1. In ASC go to Host pool > Connection Errors tab > search for failure

### Getting Web Client Trace
1. Click the Shortcuts/support/about icon
2. Click "Capture Logs"
3. Save to desired location

## macOS/iOS Windows App

### Getting Activity ID

**In the app:**
1. On connection bar click Connections > Show Connection Information
2. Click "Copy to Clipboard" > paste and save

**Via ASC:**
1. In ASC go to Host pool > Connection Errors tab > search for failure

### Getting Logs
1. On connection bar click Help > Troubleshooting > Logging...
2. Set logging levels:
   - Core Log Level: Error
   - UI Log Level: Verbose
3. Under "When logging, write the output to" > select Choose Folder > Accept default location > click Start Logging
4. Reproduce the issue
5. Stop logging by clicking "Stop Logging"
6. Finder will automatically open to the log location
