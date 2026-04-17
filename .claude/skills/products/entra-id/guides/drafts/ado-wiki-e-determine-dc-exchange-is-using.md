---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Other common scenarios/Determine DC Exchange is using"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20Other%20common%20scenarios/Determine%20DC%20Exchange%20is%20using"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533508&Instance=1533508&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533508&Instance=1533508&Feedback=2)

___
<div id='cssfeedback-end'></div>

## How to determine which domain controller (DC) Exchange is using

This guide explains how to identify which domain controller (DC) Microsoft Exchange is using and provides steps to troubleshoot common issues related to DC connectivity.

[[_TOC_]]

### Summary

In this guide, you will learn how to identify the domain controllers used by Microsoft Exchange, collect relevant data, and troubleshoot connectivity issues using event logs, PowerShell commands, and performance counters.

### Steps to Determine the DC Exchange is Using

1. **Check Application Logs:**
   - Look for events 2070, 2080, or 2084 in the Application log. These events indicate which DC Exchange is using and any disconnections.

2. **Collect Output from PowerShell Command:**
   - Use the following Exchange PowerShell command to display the list of DCs Exchange is using. This command also shows if any DCs have been statically mapped or excluded on purpose.
   ```powershell
   Get-exchangeserver -status | FL identity, *domain*
   ```

3. **Review Performance Monitor (Perfmon) Counters:**
   - **MSExchange ADAccess Domain Controllers\LDAP Read Time (for all processes):**
     - Shows the time (in milliseconds) that an LDAP read request takes to be fulfilled.
   - **MSExchange ADAccess Domain Controllers\LDAP Search Time (for all processes):**
     - Shows the time (in milliseconds) that an LDAP search request takes to be fulfilled.

4. **Collect ExTRA Tracing:**
   - Collect ExTRA tracing with **ADProvider** and any other component experiencing issues. This tracing will show the LDAP filter, number of objects returned, the attributes returned for given objects, and timing information for the request.

5. **Exchange 2013 Specific Logs:**
   - For Exchange 2013, collect the AADDriver text logs. These logs show the Exchange process, process ID (PID), LDAP filter, number of objects visited, and timing information for the request. The log name matches the name of the problematic service.
   - Logs are located in `X:\ExchangeInstallDirectory\V15\Logging\ADDriver`.

### Additional Information

**Exchange Experfwiz:**
- The Exchange Experfwiz tool collects a per DC latency counter in their BLG file.
- Counter: MSExchange ADAccess DCs. When selecting this counter, add each Domain Controller specifically.

**Feedback or Questions on ADPerf?**
- Send an email to [ADPERFCore](mailto:adperfcore@microsoft.com;davidoc@microso).