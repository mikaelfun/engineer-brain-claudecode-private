---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: LSASS high handles/Scoping for LSASS High Handles"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20LSASS%20high%20handles%2FScoping%20for%20LSASS%20High%20Handles"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1569495&Instance=1569495&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1569495&Instance=1569495&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides guidance on troubleshooting high handle counts for the Local Security Authority Subsystem Service (LSASS) on Domain Controllers (DCs). It includes questions to help understand the pattern and frequency of the issue.

[[_TOC_]]

# ADPerf - scoping - LSASS high handles

Customer reports DC is running out of memory or becoming unresponsive, or customer observes a high handle count for LSASS (more than 10,000 handles).

**Understand the pattern and frequency of the issue by asking questions like:**

- When did the problem start?
- Does it happen on all DCs or a specific DC? Specific site?
- Does it happen at a specific time of day?
- Is it specific to the operating system (OS)?
- What is the pattern? How long does it take to get into a "problem" state (hours, days)? That is, how aggressive is the problem?
- Does rebooting the DC mitigate the problems?
- Is there any mitigation possible in place?
- What role does the DC have (other than Active Directory Domain Services (ADDS)/Domain Name System (DNS))?
- Is there any third-party solution such as customer password filters, synchronization, or security software running in the environment that may run on the DC?

---