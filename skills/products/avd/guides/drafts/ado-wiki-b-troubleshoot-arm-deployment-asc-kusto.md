---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Deployment Failures/Troubleshoot ARM Deployment Failure using ASC and Kusto"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/467773"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshoot ARM Deployment Failure using ASC and Kusto

## Steps

1. Open ASC -> Resource Explorer -> click Sub -> Operations -> select date range when deployment failed -> Run
2. Under ARM Operations -> Filter on Status Failed
3. Find failure -> click Kusto Link for Job Traces
   - Note: To access job traces go to MyAccess and request access to:
     - Azure Diagnostic Partner - 19401
     - ARM Logs
4. Find failure - Copy Activity ID
5. Search RDInfra using Activity ID (see Basic Queries wiki page for RDInfraTrace query)
