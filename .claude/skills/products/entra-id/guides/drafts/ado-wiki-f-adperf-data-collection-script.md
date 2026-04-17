---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Tools/ADPerf: Diagnostic Collection Tools/AD Perf Data Collection Script"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20Tools%2FADPerf%3A%20Diagnostic%20Collection%20Tools%2FAD%20Perf%20Data%20Collection%20Script"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## ADPerf: Tools: AD Perf Data Collection Script

ADPerf script for comprehensive Active Directory performance data collection. Used for collecting necessary data for various AD performance scenarios such as high CPU usage, memory issues, and handle leaks.

- **Usage:** https://aka.ms/howto-adperfscripts
- **Download:** https://aka.ms/adperfscripts

This script is the same one executed when you use TSS with the command `.\TSS.ps1 -ADS_Perf`.

### Important notes from the usage

- **NtdsaiTrace:** Allows you to collect Event Trace Log (ETL) information using NTDSAI flags.
  ```powershell
  .\ADPerfDataCollection.ps1 -NtdsaiTrace [CTRL+SPACE] to select options. If more than one, separate with a comma:
  ```

### Changes to LSASS dump collection

An environment variable to control dump collection has been added. This variable needs to be set in the same PowerShell session used for data collection. Set it before starting the data collection.

To set a per-session environment variable (in the same PowerShell console):
```powershell
$Env:ADPERFDUMP = '1'
```

To check if the per-session environment variable is set (in a new PowerShell console):
```powershell
$env:ADPERFDUMP
```

### Scenario updates

- **LSASS dumps will be collected by default:**
  - High memory scenarios (normal and triggered scenarios, DC and non-DC scenarios)
  - ATQ (Asynchronous Thread Queue) exhaustion

- **LSASS dumps will only be collected when the environment variable is set:**
  - High CPU (normal and triggered scenarios)
