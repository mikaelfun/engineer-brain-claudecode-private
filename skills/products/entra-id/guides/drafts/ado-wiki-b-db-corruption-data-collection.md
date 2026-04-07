---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Database and DC Boot Failures/Workflow: AD Database: Corruption/DB Corruption: Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Database%20and%20DC%20Boot%20Failures%2FWorkflow%3A%20AD%20Database%3A%20Corruption%2FDB%20Corruption%3A%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Data collection description

This is the data collection plan for database (DB) corruption issues.

# Data collection plan

- Get error details from tool output or applications.
- Collect Event logs: Application, System, Directory Services, Distributed File System (DFS) Replication, Domain Name System (DNS) Server.
  - You may need to turn up NT Directory Services (NTDS) Diagnostics logging in the registry to get additional insights.
  - See [How to configure Active Directory and LDS diagnostic event logging](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/configure-ad-and-lds-event-logging). Set Replication (if replication is affected) and internal processing to 3.
- Collect dumpdatabase export per [KB315098](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/use-online-dbdump-feature-ldp-dot-exe) How to Use the Online Dbdump Feature of Active Directory.
- Additional data will depend on the type of problem and objects involved. Once Event logs and DBDUMP are reviewed.
- Offline defragmentation: [KB232122](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/ad-database-offline-defragmentation) How to perform offline defragmentation of the Active Directory database. This step can resolve a secondary index corruption. Note it leaves the original database intact. You need to move or copy the compacted database.
- **Do not run destructive "tests" in esentutl /r or /p**.
- Run through this checklist for DB paths and settings: [KB4042791](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/jet-database-errors-recovery-steps) Troubleshoot Jet database errors and recovery steps.

- [KB4042791](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/jet-database-errors-recovery-steps) also runs non-destructive database checks and repairs:
  - Integrity checks: `NTDSUTIL FILES INTEGRITY`
  - Semantic Check: [KB315136](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/complete-semantic-database-analysis-ad-db) How to complete a semantic database analysis for the Active Directory database.
