---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Database and DC Boot Failures/Workflow: AD Database: Growth/DB Growth: Data Analysis"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Database%20and%20DC%20Boot%20Failures%2FWorkflow%3A%20AD%20Database%3A%20Growth%2FDB%20Growth%3A%20Data%20Analysis"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414744&Instance=414744&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414744&Instance=414744&Feedback=2)

___
<div id='cssfeedback-end'></div>

## Troubleshooting and data analysis

### Summary
This guide provides a structured approach to analyzing Active Directory database issues using three key data sources: `Dcname_SpaceSummary.txt`, `DatabaseAnalyzer` report, and Semantic Database Analysis output. Follow the steps to identify and address database growth and space utilization issues.

[[_TOC_]]

### Generic flow of analysis applicable to all scenarios

(Linda's) data analysis flow:  
You should have three pieces of data: `Dcname_SpaceSummary.txt`, `DatabaseAnalyzer` report, and Semantic Database Analysis output.

- Start with esentutl output and figure out where all the space is... **which table is the biggest**.
  - `esentutl /ms ntds.dit /v >Dcname_SpaceSummary.txt`
  - To understand the output, read the following guides:
    - [4458453](https://internal.evergreen.microsoft.com/en-us/topic/fbb474ec-38fe-121c-9e53-b1d5296874c3) **ADDS: JET: PART 1 - Introduction to understanding database space information - esentutl /ms**
    - [4519530](https://internal.evergreen.microsoft.com/en-us/topic/bf520255-53a7-391f-583f-c658fde5d24b) **ADDS: JET: PART 2: Advanced understanding ESE database space information - esentutl /ms**
    - [MCM: Core Active Directory Internals](https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/mcm-core-active-directory-internals/ba-p/1785782)
    - [ESE Deep Dive: Part 1: The Anatomy of an ESE database](https://blogs.technet.microsoft.com/askds/2017/12/04/ese-deep-dive-part-1-the-anatomy-of-an-ese-database/)

**Hint:** Tables to vet for database growth:

| **Table**    | **Whats in it**                                                                                 |
|--------------|--------------------------------------------------------------------------------------------------|
| Datatable    | Objects, non-linked attributes (including big attributes like usercertificate or thumbnailphoto), phantoms |
| Link_table   | Linked attributes, such as group memberships, Credential Roaming, or caching of passwords on RODCs |
| SD_table     | Single-instanced stored security descriptors                                                     |

### Generic analysis flow

1. Look at `Dcname_SpaceSummary.txt` esentutl output and see which table/index is the largest (AD DB Analyzer cannot be trusted there/hasn't got a full view).
2. **If it's datatable**, go to the `DatabaseAnalyzer` report and look at the largest attribute.
   1. If multi-domain forest, data could be in GC, and therefore there will be a discrepancy/smaller size in HTML - thats why we need it from all domains.
   2. Examine the output of semantic database analysis, which will tell about the number of phantoms.
3. **If SD Table**, check for single instancing breakage; otherwise, the customer has many different SDs.
   1. Nothing can be done about that.
4. **If link table**:
   1. Check credential roaming/`DatabaseAnalyzer` report (see [DB Growth: Known Issues](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414743/DB-Growth-Known-Issues) #1).
   2. Check other linked attributes (large groups) using `DatabaseAnalyzer` report (see [DB Growth: Known Issues](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414743/DB-Growth-Known-Issues)).
5. If Recycle Bin is enabled, also check the size of deleted objects in the `DatabaseAnalyzer` report (check those anyway).

### Points to consider

- GC objects take up a surprisingly large amount of space on a DC. You can have a relatively small domain, but if it is part of a very large forest and is a GC, the ntds.dit file can bloat because of the GC data.

### More reading materials

- [ADDS: How to stop and reduce ADDS database (Ntds.dit) size bloat caused by Credential Roaming feature](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414743/DB-Growth-Known-Issues)
- [ADDS: LVR Add, delete, and replication limits with and without the W2K8 R2 undelete feature enabled](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414743/DB-Growth-Known-Issues)
- [ADDS: Jet: Jet Database Errors and their recovery steps](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414743/DB-Growth-Known-Issues)