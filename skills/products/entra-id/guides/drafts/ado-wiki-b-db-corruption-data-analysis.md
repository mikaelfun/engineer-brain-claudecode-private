---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Database and DC Boot Failures/Workflow: AD Database: Corruption/DB Corruption: Data Analysis"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Database%20and%20DC%20Boot%20Failures%2FWorkflow%3A%20AD%20Database%3A%20Corruption%2FDB%20Corruption%3A%20Data%20Analysis"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Root cause analysis

- Ask for and follow up on the results of the hardware and storage check.
- Look for storage subsystem and file system errors in the system event log.
- See if the system event log has entries for unplanned reboots that happened before the first report on the corrupted database.
- Look at the Directory Services (DS) event log for "NTDS ISAM" errors or errors and warnings with ID 1068, 1168, and 1173.
- If you find a Directory Service Identifier (DSID), collaborate with an Active Directory Services (ADS) Pod Support Escalation Engineer (SEE) or Escalation Engineer (EE) to investigate the details of the error and DSID.
- Look for application failures of Local Security Authority Subsystem Service (LSASS), DNS.EXE, or DFSRS.EXE in the system event log.
- Look for fatal events in the DNS and DFS Replication event logs.

## Looking at "dumpdatabase" dumps

"ntds.dmp" files are text files and can become huge, bigger than NotePad++ can handle. We have "NOREPAD" that can handle huge files; it is in the Customer Service and Support (CSS) tool collection on GitHub.

Pro Tip: Notepad can run multiple searches at the same time. The search pattern flexibility is limited, though. And how it handles keyboard and mouse navigation is strange. But man, it's fast with big files.

Guide to using Database Dumps per [KB315098](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/use-online-dbdump-feature-ldp-dot-exe) in [KB833452](https://internal.evergreen.microsoft.com/en-us/topic/8f3971c9-466e-20f8-be8b-eecb9d9be62d). Search for the problem objects per Distinguished Name (DN) or Globally Unique Identifier (GUID), and look for problems. Problem indications may be:

- Phantomized children and parents (column under "OBJ" is FALSE).
- Data of the object is different between Domain Controllers (DCs). If you are aware of a problem non-linked attribute, change the steps in [KB315098](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/use-online-dbdump-feature-ldp-dot-exe) to include this attribute.
- Different Parent Distinguished Name Tag (DNT) chain on different DCs ("PDNT" column). This can be the case for objects recently moved between Naming Contexts (NCs).
- When the object has a link table or DNT of the object appears in the link table of another object and the status of the link table.
