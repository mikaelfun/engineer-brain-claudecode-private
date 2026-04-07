---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Database and DC Boot Failures/Workflow: AD Database: Growth/DB Growth: Useful tools | resources/AD DB Analyzer Report Quick Summary"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414742"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414742&Instance=414742&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414742&Instance=414742&Feedback=2)

___
<div id='cssfeedback-end'></div>

Summary: This article provides a detailed breakdown of a report from Eric Hunter, focusing on database composition, object creation trends, object distribution by naming context, and object attributes sorted. The report helps identify potential database bloat and provides insights into object and attribute sizes within the NTDS.dit file.

[[_TOC_]]

**From Eric Hunter:**

# The report is broken down into four main areas
- Database composition, total count
- Object creation trends
- Object distribution by naming context
- Object attributes sorted

## Database composition, total count
This section provides a high-level view of what the database analyzer found. We report on how many live, deleted, and recycled objects we found and estimate how much data is being used by each. In the database composition report, we show how many objects are stored in each container and what we estimate the size to be. This report is good for determining if your NTDS.dit file is bloating due to deleted objects growing faster than anticipated, as well as getting an idea of how many objects you have and where. Deleted objects would bloat your database if there is very fast turnover in objects, that is, lots of deletions and creations.

### Please note:
Since we are dealing with a live domain, we are only able to access live LDAP (Lightweight Directory Access Protocol) data. There is a bunch of data stored in the NTDS.dit file that is not accessible via LDAP, so we can only estimate how much data each object is taking up. The purpose of the size information is to allow a comparison of object sizes to help find any objects or attributes that might be causing the data to bloat. The size information is not a direct comparison to the total NTDS.dit file size, which will be larger than the data sizes reported by the database analyzer.

## Object creation trends
This section includes a chart of when objects were created in 30-day increments. This chart can only report on live objects. If objects have been deleted, they will not show up in this report. We use this report to help us understand how many objects we are creating per month. This is very helpful in determining object turnover and/or if a certain object creation task is causing issues. We used this in our domain to help us track DFSR (Distributed File System Replication) links, which in our environment get created and deleted at a very fast pace. Users could use this chart to track how many user objects or group objects are getting created per month.

## Object distribution by naming context
This section provides a highly detailed report of the objects in your domain. It breaks it down by naming contexts and then reports the live, deleted, and recycled objects in each context. We count the number of each object type found, the total size (estimated) they take up collectively, and the average bytes each object takes up. The last data point is the total number of attributes found associated with that object type. You can even click on the total attributes count to get a list of each attribute associated with the object type. This attribute chart again has total bytes, average bytes associated with each attribute, and the number of times we found that attribute associated with the object type. This report can help you find objects that are causing your NTDS.dit file to bloat and pinpoint if it is a specific attribute that is causing the problem or just the number of the object type.

## Object attributes sorted
This section provides another detailed report, but instead of showing object types, it focuses on attribute types. Also, because there are so many different attribute types in Active Directory (AD), we provide an abbreviated list. We highlight the top 20 attributes in average size (estimated) and the top 20 attributes in total size (estimated). This chart can help pinpoint problematic attributes that could be contributing to database bloat.

**Also, the /GC flag needs some clarification**. The Global Catalog (GC) data is essentially a separate store from your domain data. So when you run the database analyzer with the /GC flag, you are only looking at the data associated with being a GC. Rather than adding the GC data to the domain data, we chose to keep them separate to allow customers the ability to see if the domain controller being a GC is causing bloat. If you compare the GC data size to the domain data size, you can see which one is taking up the most storage.

# Internal content with more detail:
**[3086790]()** **ADDS: JET: AD Database Analyzer identifies AD database object and attribute count and size**
**[3096457](https://internal.support.services.microsoft.com/en-us/help/3096457) ADPERF: Tools: AD**