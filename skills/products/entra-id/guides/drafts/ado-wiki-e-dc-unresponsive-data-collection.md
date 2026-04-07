---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: DC Unresponsive | Hang/Data Collection for DC Unresponsive | Hang"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20DC%20Unresponsive%20%7C%20Hang/Data%20Collection%20for%20DC%20Unresponsive%20%7C%20Hang"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533499&Instance=1533499&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533499&Instance=1533499&Feedback=2)

___
<div id='cssfeedback-end'></div>

# DC unresponsive/hang data collection guide

This guide provides instructions on what data to collect when a Domain Controller (DC) becomes unresponsive or enters a hung state.

[[_TOC_]]

### Customer scenarios
Customers usually come with four broad scenarios when they open a case with Microsoft. As the impacted server is a Domain Controller, they most probably would have rebooted the DC and then come to Customer Service and Support (CSS) for assistance.

**Scenario 1**: "Domain Controller went into an unresponsive/hung state, and it was rebooted to restore services. We would like to know the root cause of the unresponsive state/hang. We have not seen this issue in the past, and this has happened for the first time in our environment."

**Scenario 2**: "Domain Controller goes into an unresponsive/hung state every X days. The issue is occurring on more than one DC in the environment. Currently, we have rebooted the affected DCs and need a root cause analysis (RCA)."

**Log collection and log analysis for Scenario 1 and Scenario 2 after discussing with the customer:**
- Collect a Directory Services Support Diagnostic Package (SDP) on the Domain Controller that has manifested the issue. If there are more affected DCs, then collect SDP on a couple more DCs.
- Check with the customer if they have any monitoring tools monitoring the Domain Controller and if they could provide any information about errors or warnings reported by the monitoring tools.
- Check with the customer on the timelines when the issue has occurred. Also, note down the timezone of the Domain Controller. Get the time in the local timezone of the machine.
- Check if the customer can share any logs/events of the services that reported the Domain Controller being unresponsive (for example, SharePoint servers, SQL servers, custom applications) and what error messages were generated.

**Scenario 3**: "Domain Controller is currently facing the issue, and we need assistance."

**Log collection when the customer is facing the issue:**

| **Log collection if the customer is not able to log on to the problem DC** | **Log collection if the customer is able to log on to the problem DC** |
|--|--|
| Network trace and actions performing the below on another Domain Controller: <br> 1. LDP.exe --> Bind to the problem DC <br> 2. \\\ProblemDC\Sysvol or Netlogon <br> 3. DSA.msc/DSSite.msc connecting to the problem DC | Scenario 1: <br> (Even though the scenario is for high CPU, the same data is helpful to troubleshoot this issue) <br> [ADPERF: Tools: AD Perf Data Collection Script](https://internal.evergreen.microsoft.com/topic/4344106) <br> If you have an application server exhibiting the symptoms, it would also be best if you can collect a network trace from the application server while reproducing the issue |
| Complete memory dump OR Memory Snapshot if the DC is Virtual <br> (Note: A memory snapshot is NOT the same as a VM snapshot) | Directory Services SDP before the DC is rebooted |
| Directory Services SDP after the DC has been rebooted | Directory Services SDP after the reboot |
| Any errors/warnings from Monitoring Tools leading up to the event | Any errors/warnings from Monitoring Tools leading up to the event |
| Date/time of the issue. Timezone of the DC | Date/time of the issue. Timezone of the DC |

 Instructions to collect full memory dump are available here   
[Complete Dumps](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?wikiVersion=GBmaster&pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20Tools/Complete%20Dumps)

**Scenario 4**: "Specific applications are complaining that they cannot connect to the problem Domain Controller."

| **Log collection if the customer is not able to log on to the problem DC** | **Log collection if the customer is able to log on to the problem DC** |
|--|--|
| Network trace and actions performing the below on another Domain Controller: <br> 1. LDP.exe --> Bind to the problem DC <br> 2. \\\ProblemDC\Sysvol or Netlogon <br> 3. DSA.msc/DSSite.msc connecting to the problem DC | Scenario 1: <br> (Even though the scenario is for high CPU, the same data is helpful to troubleshoot this issue) <br> [ADPERF: Tools: AD Perf Data Collection Script](https://internal.evergreen.microsoft.com/topic/4344106) <br> If you have an application server exhibiting the symptoms, it would also be best if you can collect a network trace from the application server triggering the issue |
| Complete memory dump OR Memory Snapshot if the DC is Virtual <br> (Note: A memory snapshot is NOT the same as a VM snapshot) | Directory Services SDP before the DC is rebooted |
| Directory Services SDP after the DC has been rebooted | Directory Services SDP after the reboot |
| Any errors/warnings from Monitoring Tools leading up to the event | Any errors/warnings from Monitoring Tools leading up to the event |
| Date/time of the issue. Timezone of the DC | Date/time of the issue. Timezone of the DC |

 Instructions to collect full memory dump are available here   
[Complete Dumps](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?wikiVersion=GBmaster&pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20Tools/Complete%20Dumps)