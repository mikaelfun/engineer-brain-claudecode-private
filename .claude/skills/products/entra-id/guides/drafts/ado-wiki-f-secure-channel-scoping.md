---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Secure Channel/Workflow: Secure Channel: Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FSecure%20Channel%2FWorkflow%3A%20Secure%20Channel%3A%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/417865&Instance=417865&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/417865&Instance=417865&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**  
This article provides a comprehensive guide to scoping issues related to broken secure channels between Windows clients and Domain Controllers (DCs). It includes questions to help identify the problem, its location, timing, and extent. 

[[_TOC_]]

# Scoping

## What
- What OS version(s) is impacted?
- What type of environment are the impacted clients a part of?
  - Virtual Desktop Infrastructure (VDI) (persistent or non-persistent), Remote Desktop Services (RDS), end user environment (laptop/desktop), virtual server, embedded system.
- What is the problem with the secure channel?
  - Broken secure channel between a Windows client and Domain Controller: "The trust relationship between this workstation and the primary domain failed"?
  - Broken secure channel between DCs: Failure to replicate with Replication Error -2146893022: "The target principal name is incorrect"?
- What is the error received, if any? (Netlogon event IDs 3210, 5719, 5783, 5722, Group Policy event 1129)

## Where
**In a case where the secure channel between a Windows client and Domain Controller is broken**:
- Where are the impacted clients located?
  - Active Directory (AD) client site
    - Is there a local DC? How many?
  - Geographical location
  - All over the organization?
  - Where is the affected machine located? Which site and subnet?

## When
- When was the issue first noticed?
  - Today, last week, etc.
  - Any other changes happen around this time frame? (network changes, new applications, upgrades, etc.)
  - Any actions done that may affect the consistency of the machine, like swapped the disks, disk cloning, restore from backup, etc.?

## Extent
- How many machines are impacted?
- How often does this happen?
  - Is it reproducible? How?
- Is this a virtual machine that was reverted to an old snapshot?
- Is this a restored physical or virtual machine from bare metal backup?
- Is this a restored machine from old system restore?
- Is there a machine cloned without running SysPrep?
- Does the client encounter an unexpected shutdown?
- Is there a specific PCI hardware device or software solution that is responsible for reverting the computer to the initial state each reboot (usually embedded in classroom computers)?
- Are those VDI computers (such as "Citrix Provisioning Services (PVS)", "Windows Virtual Desktop Service") that are configured with pooled desktops?
- Are those Windows Embedded clients that are unexpectedly reverting after machine password change ??