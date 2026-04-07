---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Database and DC Boot Failures/Workflow: AD Database: Growth/DB Growth: Useful tools | resources/DB Growth: Fragmentation & Defrags"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414741"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414741&Instance=414741&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414741&Instance=414741&Feedback=2)

___
<div id='cssfeedback-end'></div>

This article provides an in-depth analysis of the types of fragmentation in an Extensible Storage Engine (ESE) database and their effects on Active Directory (AD). It also discusses the methods of defragmentation, both online and offline, and their impact on database performance and efficiency.

[[_TOC_]]

# Pre-requisites
- KB [4458453](https://internal.evergreen.microsoft.com/en-us/topic/adds-jet-part-1-introduction-to-understanding-database-space-information-esentutl-ms-fbb474ec-38fe-121c-9e53-b1d5296874c3) ADDS: JET: PART 1 - Introduction to understanding database space information - esentutl /ms
- See https://techcommunity.microsoft.com/t5/Ask-the-Directory-Services-Team/ESE-Deep-Dive-Part-1-The-Anatomy-of-an-ESE-database/ba-p/400496

# Types of fragmentation

**Whitespace and fragmentation we can conceive of for an ESE database:**

### File-level fragmentation
This is the simplest form of fragmentation, where a single file can be fragmented based on its placement around the disk. Fragmentation usually occurs when the file is extended after initial creation.

### Database-level fragmentation
This type of fragmentation can happen in two ways:
- **B-Tree space fragmentation**: This occurs when the database pages that compose a layer of a given B-tree are not in order in the file. This is mitigated by allocating portions of each B-tree in a cluster of pages called an "extent" (8 or 16 pages at a time). For some B-trees or indexes where lookup is seek-only, not in-order traversal, it doesn't affect lookup time if the B-tree is fragmented.
- **LID Fragmentation**: The ESE Long-Values (LIDs) are associated with Long-value IDs. If an attribute value for an AD object is too big, it is stored in the Long-Value B-Tree, which can be fragmented. Burst LVs are not optimal but necessary when data doesn't fit in a single row (max size just under 8 KB).

### White space in the database
This can occur at multiple levels due to ESE's hierarchical space management scheme:
- **Root-level white space**: White space ends up here after several passes of online defragmentation.
- **B-tree level white space**: Each table has a primary B-tree, and under it, an LV B-tree, space trees, and secondary indices.
- **Page-level white space**: Each database page is 8 KB. There are two types:
  - Unavoidable white space.
  - White space that can be removed by moving multiple rows onto fewer pages.

**Note**: During online defragmentation, white space is moved from the page level to the B-tree level, and eventually to the root level, where it can be reused for new or changed data.

![DB_Growth_Fragmentation_Defrags.png](/.attachments/ADDatabase&DCBootFailures/DB_Growth_Fragmentation_Defrags.png)
### File system-level white space
This usually applies to small files, which is probably not relevant for your database.

# ESE fragmentation and effects on AD

With databases, fragmentation doesn't have the same impact as it does on files that are streamed in nature (like mp3s or web servers). In a database, access is often random, so fragmentation can sometimes be beneficial. For example, during a logon, you might jump around the database at least six times. If the file is fragmented, there is a chance that you didn't have to jump backwards, which could help performance.

### Suppositions on fragmentation effects
- **B-Tree space fragmentation**: Probably doesn't affect logon times much, as logon involves mostly seeks.
- **Tree space fragmentation**: Might affect address book queries slightly more due to in-order B-tree traversals.
- **LID fragmentation**: Affects operations that use two long values simultaneously, such as password changes or replication of large attributes.

# ESE whitespace and effects on AD

A database page is the unit decided to cache or not cache in memory. White space at the page level reduces caching efficiency, while white space at the root or B-tree levels bloats backups and IFM file size but doesn't affect cache efficiency. If a significant portion of page space is white space, it can reduce effective RAM usage. ESE allows online defragmentation to consolidate white space and increase caching efficiency.

By default, online defragmentation runs for one hour every 12 hours for AD. It may take multiple runs to complete. Note that "esentutl /ms ntds.dit" reports only root and B-tree level white space, not page-level white space.

Offline defragmentation's primary purpose is to shrink the database file, not to defragment it. The API for offline defragmentation is JetCompact, while online defragmentation uses JetDefragment.

# Defrags

### Online defrag
- Set the registry key "6 Garbage Collection" to 1 to get information events about white space in the DIT.
- Online defrag moves white space up the database for reuse, improving performance and RAM usage.
- Online defrags are essential and run for a set amount of time (1 hour in Windows Server 2003).
- Online defrag touches the entire database file, affecting the in-memory database cache.

### Offline defrag
- Removes white space and shrinks the DIT file.
- Note that the database can grow as a result of a defrag.

For more details, refer to:
[ADDS: JET: Jet databases may grow even if whitespace exists (Brettsh explanation)](https://internal.evergreen.microsoft.com/en-us/topic/adds-jet-jet-databases-may-grow-even-if-whitespace-exists-brettsh-explanation-24266138-f552-19fb-4b34-e83d3540aa61)    
Published in SDK as: [4522118](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Finternal.support.services.microsoft.com%2Fhelp%2F4522118&data=02%7C01%7Clindakup%40microsoft.com%7Cc9770d950d734b873fcd08d73ab1e9e9%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637042408120272617&sdata=6QLibLAUlJ8TMzY