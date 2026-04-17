---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Credential Guard Troubleshooting/HIGH CPU with CG ON/Scoping questions"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FCredential%20Guard%20Troubleshooting%2FHIGH%20CPU%20with%20CG%20ON%2FScoping%20questions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Credential Guard - High CPU Scoping Questions

Use these scoping questions to triage CPU load issues that may be related to Credential Guard (CredGuard).

---

## Scoping Checklist

1. Does the issue stop when Credential Guard (CredGuard) is disabled?
2. Which process is spiking the CPU?
3. What is the normal CPU load, and what is the problem CPU load?
4. Is the CPU load constant?
5. Is there an action that can be done to create or reproduce the CPU load? (for data collection)
6. What are the steps to reproduce the problem?
7. Can we reproduce the problem at Microsoft?
8. Check if the issue happens when Credential Guard is in Debug mode. See instructions on how to enable Debug mode in the CG Debug Mode wiki page.
