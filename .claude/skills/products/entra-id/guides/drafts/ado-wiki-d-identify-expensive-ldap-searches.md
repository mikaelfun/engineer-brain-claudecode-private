---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Lsass High CPU/Data Analysis and Walkthroughs/Identify Top Expensive | Inefficient LDAP Searches"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20Lsass%20High%20CPU%2FData%20Analysis%20and%20Walkthroughs%2FIdentify%20Top%20Expensive%20%7C%20Inefficient%20LDAP%20Searches"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Identify Top Expensive / Inefficient LDAP Searches

Reference: [How to find expensive, inefficient and long running LDAP queries in Active Directory](https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/how-to-find-expensive-inefficient-and-long-running-ldap-queries/ba-p/257859)

## Steps

1. Save off and then increase the Directory Service event log size on all DCs in one of the affected sites
2. Enable 1644 event logging on all DCs in one site:
   - Note: this will cause one event 1644 to be logged for each LDAP query exceeding a threshold
   - Set `15 Field Engineering` value to 5 in registry:
     `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\NTDS\Diagnostics` -> `15 Field Engineering = 5`
   - Create `Search Time Threshold (msecs)` DWORD 32-bit value = 64 (decimal)

## Threshold Registry Values

Location: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\NTDS\Parameters`

| Registry Path | Data Type | Default Value |
|---|---|---|
| Expensive Search Results Threshold | DWORD | 10,000 |
| Inefficient Search Results Threshold | DWORD | 1,000 |
| Search Time Threshold (msecs) | DWORD | 30,000 |

### How thresholds work:
- **Expensive Search Results Threshold = X**: evaluated entries >= X
- **Inefficient Search Results Threshold = Y**: returned entries <= Y% of evaluated entries (Y/X)
- **Search Time Threshold**: searches taking longer than specified milliseconds (requires KB 2800945)

Example: If Expensive=10000 and Inefficient=1000, event 1644 logs when returned entries <= 10% of visited entries.

## Analysis

1. Allow events to be logged during one DC performance occurrence
2. Turn off event 1644 logging on each DC
3. Save off the Directory Service event log on each DC
4. Run the PowerShell script against the log files: https://github.com/mingchen-script/LdapEventReader
5. Review the output file in Excel and identify top callers of interest
