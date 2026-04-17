---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Database and DC Boot Failures/Workflow: AD Database: Growth/DB Growth: Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Database%20and%20DC%20Boot%20Failures%2FWorkflow%3A%20AD%20Database%3A%20Growth%2FDB%20Growth%3A%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414746&Instance=414746&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414746&Instance=414746&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides a detailed overview of data collection for troubleshooting issues related to Active Directory Domain Services (AD DS). It includes steps for enabling diagnostic events, generating space dumps using esentutl, running DatabaseAnalyzer.exe reports, and performing semantic database analysis.

[[_TOC_]]

# Data collection overview
In addition to answering the questions in the scoping section, the following data is useful for troubleshooting this issue. Note: getting all the data at once is best so that it matches.

- **Enable garbage collection (GC) events about white space**
- **Esentutl space dumps**
  - **Note:** If the domain controller (DC) is 2016 or above, you no longer need to stop NTDS service to run esentutl and dump space info. You can use the /vssrec switch instead. See detailed steps below for commands.
- **DatabaseAnalyzer.exe report** (with all/complete switch) from DC with issue and a DC from all domains in the forest if there are multiple domains.
- **Semantic database analysis** output

# Detailed steps
## Enable GC collection events about white space
Enable garbage collection diagnostics using the following command on all DCs. This will result in an event ID 1646 with the "whitespace" size in the dit file on each DC, every "garbage collection" run (so we can track the actual size of the DIT):

```shell
For /f %i IN ('dsquery server -o rdn') do reg add \%i\HKLM\System\CurrentControlSet\Services\NTDS\Diagnostics /v "6 Garbage Collection" /t REG_DWORD /d 1 /f
```

## Event ID 1646 sample:
```
Log Name:     Directory Service 
Source:       Microsoft-Windows-ActiveDirectory_DomainService 
Date:         8/29/2015 11:55:02 AM 
Event ID:     1646 
Task Category: Garbage Collection 
Level:        Information 
Keywords:     Classic 
User:         ANONYMOUS LOGON 
Computer:     SAGIDC1.SAGILAB.COM 
Description: 
Internal event: The Active Directory Domain Services database has the following amount of free hard disk space remaining.  

Free hard disk space (megabytes): 
48000  

Total allocated hard disk space (megabytes): 
80000
```

# Esentutl space dumps
- If DC is older than Windows Server (WS) 2016, stop the "Active Directory Domain Services" service to take the database offline. Otherwise, see above use /vssrec switch.
  - Stopping AD DS service will cause a disruption of service, so its best to schedule this outage for a time when it will have the least impact on clients.

## Summary dump (quick, enough to figure out which table is biggest and how much white space exists)
- Open a command prompt (as administrator) and navigate to the directory where the NTDS.dit database is stored.
- Run the following command:
  - WS 2012 R2 and older (stop NTDS service):  
   ```shell
   Esentutl /ms /v ntds.dit > Dcname_SpaceSummary.txt
   ```
  - WS 2016 and newer (no need to stop NTDS service):  
   ```shell
   esentutl /ms c:\windows\ntds\ntds.dit /v /vssrec edb c:\windows\ntds > Dcname_SpaceSummary.txt
   ```
- **Change path as needed**
- The above command will create a file (summary.txt) in the same directory the command was run from.
- View in notepad to see the size of different tables in the database and the percentage of database size. See [DB Growth: Data Analysis](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414744) for how to.
- [4458453](https://internal.evergreen.microsoft.com/en-us/topic/fbb474ec-38fe-121c-9e53-b1d5296874c3) **AD DS: JET: PART 1 - Introduction to understanding database space information - esentutl /ms**  
- **Note:** You can get the same output using NTDSUTIL -> Activate Instance NTDS -> Files -> Space Usage.

## Detailed dump (allows understanding precise number of objects in each table and in the database, calculate index sizes, and more)
- As per summary dump, but with the following command switches:
  - WS 2012 R2 and older:  
   ```shell
   Esentutl /ms <ntds.dit> /f#all /csv /v >Dcname_Spacedetails.csv
   ```
  - WS 2016 and newer:  
   ```shell
   esentutl /ms c:\windows\ntds\ntds.dit /v /f#all /csv /vssrec edb c:\windows\ntds >Dcname_SpaceDetails.txt
   ```
- **Note:** This will take a very long time and is only necessary for in-depth analysis. Getting a summary dump and other data is usually enough to diagnose most issues.
- [4519530](https://internal.evergreen.microsoft.com/en-us/topic/bf520255-53a7-391f-583f-c658fde5d24b) **AD DS: JET: PART 2: Advanced understanding ESE database space information - esentutl /ms**

## AD DatabaseAnalyzer.exe report
Leverage **AD DatabaseAnalyzer** to triage growth in the datatable.  
AD Database Analyzer is useful for triaging the problem as it reports on object and attribute count and size. However, it is **not** accurate and is very often way off the real size, so be careful and do not leverage this report alone but collect other supporting data like esentutl output, which is more precise on object counts and space use by table.
[5016136](https://internal.evergreen.microsoft.com/en-us/topic/b59148c9-3772-46c7-d697-6bccbe2dc4ba) **AD DS: JET: AD Database Analyzer identifies AD database object and attribute count and size**

### Semantic database analysis: **Requires downtime of DC.**
- Stop the "Active Directory Domain Services" service to take the database offline.
- **Note:** This will cause a disruption of service, so its best to schedule this outage for a time when it will have the least impact on clients.
- Open a command prompt (as administrator).
- Type `ntdsutil` (without the quotes).
- From the ntdsutil: cmd prompt, type `act in ntds` to set NTDS as the active instance.
- Type `sem da an` to go into "Semantic database analysis".
- From the Semantic checker: prompt, type `verbose on` to turn on verbose mode.
- While still at the Semantic checker: prompt, type `go`.
- When finished, read the output on the screen. It should indicate a file was created like `dsdit.dmp.0`. This file is created in the same directory as the NTDS.dit file.
- This file can be opened in notepad and will list the number of active objects, phantoms, deleted objects, as well as the security descriptor (SD) count and size with and without single-instancing.

  ![Database growth data collection](/.attachments/ADDatabase&DCBootFailures/DB_Growth_Data_Collection.png)

See [semantic database analysis](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/cc770715(v=ws.11)?redirectedfrom=MSDN) for more information.