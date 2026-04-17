---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Lsass Crash/Scoping for Lsass crash"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20Lsass%20Crash%2FScoping%20for%20Lsass%20crash"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Lsass Crash Scoping Questions

**The following questions are helpful in understanding the issue:**

- What is the role of the machine where LSASS is crashing? (Client, Server or Domain Controller)
- What is the Operating System of the machine where LSASS is crashing?
- How many times has the machine rebooted due to an LSASS crash? (Review the Application Event Log for event IDs 1000 & 1015)
- When you observe the event 1000 do you always see the same faulting module and exception code?
- When you observe the event 1000 do you see the exception code of 0xc0000374 which translates to "Heap Errors"? If yes, go to the 'Data Collection: LSASS Crash with Heap' section.
- What is the frequency of the crash?
- Is the crash reproducible on-demand through some specific action?
- What is the software that runs on the machine, and what is the role of the machine (What type of applications/services, Domain Controller, FSMO Role Owner etc.)
  - Check for any third party password filters, password sync software or security monitoring software (like Quest Change Auditor) and understand what might be in common for the crashing machines vs. machines not affected by the issue.
  _HKLM\System\CurrentControlSet\LSA_
  - Check if there any applications/modules that hook into Lsass.exe
  - Document the security software installed on the server

**Expected information:**
- Role of the machine
- Pattern of the issue
- Faulting module and exception code
- Type of applications if on a member server
- Verifying the LSA registry key for any 3rd party modules
