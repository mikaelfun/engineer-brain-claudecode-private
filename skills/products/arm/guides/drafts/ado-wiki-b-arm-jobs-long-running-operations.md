---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Platform Core Concepts/Jobs"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FARM%20Platform%20Core%20Concepts%2FJobs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## ARM Jobs (Long Running Operations)

Long running operations in Azure Resource Manager are processed in jobs. These jobs can be initiated by user actions (like deployments, resource group deletions, resource moves) or be triggered by the platform itself after an operation has completed (like deployment grooming, resource consistency or notification jobs).

Jobs run in the worker roles and some of them use a fan out pattern to the resource providers. This means ARM would receive one call, and from this one call, it will call multiple RPs, or multiple regions for the same RP depending on the necessary processing.

Some examples of these fan out jobs include:
- Batch API processing
- Deployments
- Resource group deletions
- Resource moves
- Template exports

The successful completion of the job depends on all fan out calls completing successfully as well.
