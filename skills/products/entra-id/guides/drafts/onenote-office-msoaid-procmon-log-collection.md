# Office MSOAID + Process Monitor Log Collection

**Source**: OneNote — M365 Identity IDO / Log collection

## Overview

Procedure for collecting comprehensive Office authentication logs using MSOAID (Microsoft Office Authentication/Identity Diagnostic) tool together with Process Monitor (procmon).

## Prerequisites

1. Download MSOAID: https://aka.ms/msoaid
2. Download Process Monitor: https://learn.microsoft.com/en-us/sysinternals/downloads/procmon

## Preparation

1. [Optional] Close all Office apps (Outlook/Word/Excel/PPT/OneNote, **not** Teams)
2. Enable Office verbose logging via registry:
   ```
   [HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\Common\Logging]
   "EnableLogging"=dword:00000001
   "DefaultMinimumSeverity"=dword:000000c8
   ```

## Collection Steps (Best Practice: two rounds)

**Round 1 (without Fiddler) + Round 2 (with Fiddler):**

1. Run `procmon64.exe` as admin → Pause capture and clear records
2. Run MSOAID as admin → Select all options, configure Fiddler on/off, set save path
3. Start procmon capture
4. Click Next in MSOAID → If screen recorder alert appears, click OK, wait for window to stop flashing
5. [Optional] Open Office application
6. **Reproduce the issue**
7. Close Office application
8. In procmon → Stop capture → Save as "All Events"
9. In MSOAID → Click Finish → Wait for log output

## Cleanup

1. Delete the registry key added in preparation step
2. Package and upload all logs

## Notes

- Enabling Fiddler significantly increases WAM log size
- If only analyzing WAM logs, use the non-Fiddler capture
- MSOAID reference: https://learn.microsoft.com/en-us/microsoft-365/troubleshoot/diagnostic-logs/use-msoaid-for-authentication-issues
