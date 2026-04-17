---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Session State Retention FLD/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FSession%20State%20Retention%20FLD%2FTroubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Session State Retention FLD - Troubleshooting

## High-level CSS guidance
1. Confirm eligibility (Dedicated Mode, OS, size, region)
2. Confirm provisioning policy targeting
3. Validate client type used
4. Reproduce by disconnecting (not signing out)
5. Reconnect after several hours
6. Observe whether apps and session state persist

## Logs
Run in command prompt to collect sleep study logs:

```cmd
Powercfg /sleepstudy
```

Report path: `C:\Users\<username>\sleepstudy-report.html`

## PowerShell Diagnostic Script
Execute `.\CheckFLDStateRetentionStatus` in PowerShell to get Pass (green) or Not Pass (Red).

Log location: `C:\Users\<username>\AppData\Local\Temp\W365FLD-StateRetention-Diag_<date>_<hour>.log`

Monitor whether State Retention is **Active** and review current session data.
