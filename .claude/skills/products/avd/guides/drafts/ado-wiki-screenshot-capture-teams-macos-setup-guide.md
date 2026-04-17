---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Screenshot Capture in Microsoft Teams via Windows App on macOS/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Screenshot%20Capture%20in%20Microsoft%20Teams%20via%20Windows%20App%20on%20macOS/Setup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Screenshot Capture in Teams via Windows App on macOS - Setup Guide

## Enable the Feature (Client-side)
1. Install Windows App Beta version 2926
2. Launch Windows App Beta and sign in
3. Navigate to About Windows App
4. Click the Windows icon 10 times to unlock Experimental settings
5. Open Settings > Experimental
6. Enable Screen Capture Redirection

## Validate Cloud PC Readiness
1. Connect to the Cloud PC
2. Open Window > Capture Screen
3. If option is greyed out:
   - Open Task Manager on Cloud PC
   - Locate Windows Remote Desktop under Background Processes
   - End the process
   - Launch the beta RDPVCHost.exe provided separately
4. Recheck Window > Capture Screen

## Validate Success
- Capture Screen option is clickable
- Notification confirms screenshot saved
- Screenshot appears in Downloads folder on Cloud PC
- Click notification to open the folder

## Installer
RDPVCHost installer for Mac available from internal SharePoint.
