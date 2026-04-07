---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Tools/SyncML Viewer"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FTools%2FSyncML%20Viewer"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# SyncML Viewer

SyncML viewer reviews OMA-DM channel communication between client and Intune cloud service on Windows devices. Each policy sync pushes ALL policy (not delta), making it useful for comparing expected vs. actually applied policy.

Download: [GitHub](https://github.com/okieselbach/SyncMLViewer/tree/master/SyncMLViewer/dist)

**Note: SyncML is a third-party tool, not directly managed by Microsoft.**

## When to use SyncML Viewer

- Not sure if a configuration/compliance/firewall policy is reaching the device
- Portal settings don't match what was sent to the device
- Errors in MDM event viewer logs — unsure if it's payload formatting or misconfiguration
- **Note**: For EPM policy troubleshooting, refer to the EPM workflow directly

## Instructions for gathering a SyncML trace

1. Download latest `SyncMLViewer-vXXX.zip` from [GitHub](https://github.com/okieselbach/SyncMLViewer/tree/master/SyncMLViewer/dist)
2. Unzip and run `SyncMLViewer.exe` (requires Admin rights)
3. Approve UAC prompt
4. Click **MDM Sync** button (for most issues); click **MMP-C Sync** for EPM issues
5. Once sync completes, click **Save As** and save as `.xml`
6. Upload to Secure File Share

## Analyzing a SyncML trace

- Import into VS Code, Notepad, Notepad++
- Search for CSP keywords from the policy being applied
- Search for terms from the expected policy settings
- Check XML tags around setting names → indicates if policy was applied or removed
