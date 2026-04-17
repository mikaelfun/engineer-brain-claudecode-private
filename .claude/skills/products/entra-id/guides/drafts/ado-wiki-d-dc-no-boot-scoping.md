---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Database and DC Boot Failures/Workflow: AD Database: DC no boot/DC No Boot: Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Database%20and%20DC%20Boot%20Failures%2FWorkflow%3A%20AD%20Database%3A%20DC%20no%20boot%2FDC%20No%20Boot%3A%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415175&Instance=415175&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415175&Instance=415175&Feedback=2)

___
<div id='cssfeedback-end'></div>

This article provides a detailed workflow to diagnose and fix boot failures in Domain Controllers (DCs), especially focusing on stop codes 0xc00002e1 and 0xc00002e2. It includes questions to ask about the problem, the extent of the issue, and recent changes that might have affected the system.

[[_TOC_]]

# Scoping
Ask whether the Domain Controller (DC) does not boot due to an Active Directory (AD) database issue versus a "standard" boot failure. The main scope of this part of the workflow involves stop codes 0xc00002e1 and 0xc00002e2.  
**See:** [ADDS: Jet: c00002e2 boot failure or continual reboot to jet error](https://internal.evergreen.microsoft.com/topic/2776418)

## What
- What is the stop code on the screen, or is it stuck on boot and does not reach the logon screen?
- What have you attempted already to diagnose or fix the problem?

## When
- When did the problem start?

Do you have a recent backup of the database in a system state backup of the affected DCs?

## Extent
- Is there more than one DC affected?
- Are DCs in multiple domains affected?
- Have all domains in the forest DCs affected?
- If more than one DC is affected, please get a list of the DCs affected and which domain they are in. Also, list which DCs are hardware-based and virtual.
- Has the error changed after the diagnostic or fix attempts?
- Do you have a third-party recovery/database management tool in use?
- For virtual DCs: Are you creating backups using snapshots? Did you perform a snapshot restore recently?
- Was there other volume management done affecting the operating system, database, or database log volumes?
- Did you perform a schema extension recently?
- Get KBs reviewed for action plans/questionnaires, such as getting DC back online.