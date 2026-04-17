---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Database and DC Boot Failures/Workflow: AD Database: DC no boot/DC No Boot: Data analysis"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Database%20and%20DC%20Boot%20Failures%2FWorkflow%3A%20AD%20Database%3A%20DC%20no%20boot%2FDC%20No%20Boot%3A%20Data%20analysis"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415172&Instance=415172&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415172&Instance=415172&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a structured approach to conducting a root cause analysis for system failures. It includes steps to check hardware, storage, event logs, and application errors.

[[_TOC_]]

# Root cause analysis

- Ask for and follow up on the results of the hardware and storage check.
- Look for storage subsystem and file system errors in the system event log.
- See if the system event log has entries for unplanned reboots that happened before the first failure with stop codes **0xc00002e1/0xc00002e2**.
- Look at the Directory Services (DS) event log for "NTDS ISAM" errors or errors and warnings with ID 1068, 1168, and 1173.
- If you find a DSID, collaborate with an Active Directory Services (ADS) Pod Support Escalation Engineer (SEE) or Engineer (EE) to investigate the details of the error and DSID.
- Look for application failures of Local Security Authority Subsystem Service (LSASS), DNS.EXE, or DFS Replication Service (DFSRS.EXE) in the system event log.
- Look for fatal events in the DNS and DFS Replication event logs.
- Look for binary verification errors in the Microsoft-Windows-CodeIntegrity\Operational event log. There are DLLs like ntdsai.dll, ntdsatq.dll, and so on that affect loading the LSASS DS component.