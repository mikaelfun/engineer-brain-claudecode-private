---
source: ado-wiki
sourceRef: "Supportability\WindowsDirectoryServices\WindowsDirectoryServices;C:\Program Files\Git\Windows Time\Workflow; Windows Time; Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Time%2FWorkflow%3A%20Windows%20Time%3A%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423337&Instance=423337&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423337&Instance=423337&Feedback=2)

___
<div id='cssfeedback-end'></div>

This document provides a comprehensive list of questions to ask when evaluating a customer's problem scenario related to Windows Time issues. It ensures that the cause of reported symptoms is pinpointed accurately.

### :warning: **IMPORTANT** :warning:

Write down all the answers from the customer. You may think it is normal or the default. Later on, in the SR Work, such a default setting may present a problem.

Below are questions to ask when evaluating the customer's problem scenario and to ensure that you are pinpointing the cause of the reported symptoms. Extra care must be taken at this phase of the case. Often, a scope may require reevaluation/rescoping as new details are learned about the symptoms from customer verbatim, diagnostics, and performance data.

### Common questions

#### What

- What OS version(s) is impacted? (this is important because tracing might be different)
  - Windows 2012 R2 or earlier
  - Windows 2016 and later
- What type of environment are the impacted clients a part of?
  - Domain Joined, Non-Domain Joined, Virtual, End user environment (Laptop/Desktop/Server)
- What users/computers are impacted?
  - User platform/Server?
  - Domain Controllers
  - Primary Domain Controller Emulator (PDCe) of the forest root
  - Specific site/region
- What is the problem with Time? Time drift over time? Time Source is Complementary Metal-Oxide-Semiconductor (CMOS)? Windows Time Service (W32TM) gives Access Denied?
  - What is the error received, if any?
  - In which way is it failing?
  - What is the delay?
- **Is the issue related to TIMEZONE or Daylight Saving Time (DST)?**
  - **If yes, the entry point for this incident is the Performance (PERF) Team:** TimeZone components (tzres.dll or tzupd.dll) are not in the Directory Services (DS) support source tree. Case Category: "Windows Desktop and Shell Experience\DST and Timezones" is pointing to PERF queues. Quickly identify if the issue is (or not) related to TimeZone issue to forward this incident with no delay. PERF wiki has specific content for [Automatic Timezones and Geolocation issues](https://dev.azure.com/WindowsPerf/WindowsPerformance/_wiki/wikis/WindowsPerformance.wiki/100/Automatic-Timezones-and-Geolocation-issues) and [Daylight Saving Time DST](https://dev.azure.com/WindowsPerf/WindowsPerformance/_wiki/wikis/WindowsPerformance.wiki/231/Daylight-Saving-Time-DST)
  - Remember, W32time works exclusively in Coordinated Universal Time (UTC). Windows will display the time based on client location or specified TimeZone. This is why TimeZone issue should not be routed to DS queues.
- What is the W32Time configuration?
  - Is the "Type" set to "NTP" or "NT5DS"
  - Time service set to shared or OWN?
  - Is the Time service set to automatic?
  - Any registry settings set to non-default?
  - Any time changes being made in the system log that are not LOCAL SERVICE?
  - Is the computer virtual? Has any of the virtual time sync programs been disabled? (either locally on Virtual Machine (VM) registry and on the hypervisor VM settings).
- If network issues are suspected:
  - Can the client machine reach the domain controller?
  - Is User Datagram Protocol (UDP) port 123 open to the NTP server, or Domain Controller (DC)?
  - Is Domain Name System (DNS) name resolution working fine?
- Is Group Policy overriding W32Time registry settings?
  - Is the problem intra-site or inter-site specific?
  - Is the Group Policy Object (GPO) configured correctly? Is it being applied?

#### Where

- Where are the impacted clients located?
  - Active Directory (AD) Client Site
    - Is there a local DC? How many?
  - Geographical Location
  - All over the organization?
  - Where is the affected machine located? Which site and subnet?
  - Do we have any firewall between the affected machine and the DCs?
  - Do we have any firewall between the affected machine and the parent Domain DCs?

#### When

- Does this occur on startup?
  - Does the issue occur only on the first logon after BOOT?
  - Is this error random and unpredictable?
  - When was the issue first noticed?
    - Today, last week, etc.
    - Any other changes happen around this time frame? (network changes, new applications, upgrades, etc.)

#### Extent

- How many machines/users are impacted?
- If OS > Windows Server 2016: does the customer enable the high accuracy time synchronization?
- How often does this happen?
  - Is this issue intermittent, random, or after every reboot/on every logon, etc.?
  - Is it reproducible? How?
- Is the affected machine(s) virtual? If so, does the issue resolve by disabling the VM Synchronization Provider?
  - [Disable VMWare tools Synchronization Provider](https://kb.vmware.com/s/article/1318)
  - [Disable Hyper-V time synchronization between the host system and guest OS](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/dd363553(v=ws.10)#time-service)
- Is the affected machine an HP Physical Server that reverts to the OS time-zone offset upon reboot?
  - [HP Gen8 and Gen9 Known issue](https://support.hpe.com/hpesc/public/docDisplay?docId=emr_na-c04557232)
