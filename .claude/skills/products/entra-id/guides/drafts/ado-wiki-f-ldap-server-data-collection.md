---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/LDAP/LDAP Server/LDAP Server: Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/LDAP/LDAP%20Server/LDAP%20Server%3A%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/890416&Instance=890416&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/890416&Instance=890416&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides troubleshooting steps for LDAP-related issues, focusing on performance and deeper server behavior analysis. It includes instructions for using Performance Monitor, NTDS diagnostic logging, and NTDSA ETL logging.

[[_TOC_]]
<BR>

# Introduction

Most LDAP (Lightweight Directory Access Protocol) related issues should first be investigated on the LDAP client side. However, there are some scenarios where you also need to capture data on the LDAP server.

# Scenario 1: LDAP performance related issues

To understand if you have issues with LDAP performance, or to find the problematic LDAP queries and clients, you need to capture data on the server side. Consider the following options:

## 1.	Performance Monitor  to investigate more generic (LDAP) performance issues. This will help you get an overview of the performance.

1. Open Performance Monitor on the domain controller
1. To use the built-in AD Data Collector Set, go to Data Collector Sets --> System --> Active Directory Diagnostics
1. Start it, by default it runs for 5 minutes
1. Once the data collection is completed, you will find a report.html output file that you can review and look for outstanding numbers in LDAP performance

You can find further details about data collector sets in the following blogs:
-	[Son of SPA: AD Data Collector Sets in Win2008 and beyond - Microsoft Community Hub](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/son-of-spa-ad-data-collector-sets-in-win2008-and-beyond/ba-p/397893)
-	[Getting Reports from Long Running Performance Monitor Data Collector Sets - Microsoft Community Hub](https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/getting-reports-from-long-running-performance-monitor-data/ba-p/1302545)
-	[Domain and DC Migrations: How To Monitor LDAP, Kerberos and NTLM Traffic To Your Domain Controllers - Microsoft Community Hub](https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/domain-and-dc-migrations-how-to-monitor-ldap-kerberos-and-ntlm/ba-p/256796)


## 2.	NTDS diagnostic logging  to identify specific problematic clients and queries. You should use this when you know there are problems with LDAP queries, and you need to find what exactly is causing the problems.
1. Set the Field Engineering registry entry to 5 on the DC:

HKEY_LOCAL_MACHINE\System\CurrentControlSet\Services\NTDS\Diagnostics\15 Field Engineering

2. Configure the values for the registry-based filters for expensive, inefficient and long running searches:

| Registry Path |Data Type  | Default value |
|--|--|--|
| HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\NTDS\Parameters\Expensive Search Results Threshold | DWORD	 | 10,000 |
| HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\NTDS\Parameters\Inefficient Search Results Threshold | DWORD |  1,000|
| HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\NTDS\Parameters\Search Time Threshold (msecs) |DWORD	  | 30,000 |


With these registry entries you configure the thresholds that trigger the event ID 1644

3. After the above registry values are set, you will start seeing event ID 1644 in the Directory Service event log
1. Collect enough data (~30 minutes during peak time should be enough), then export the Directory Service event log and disable the diagnostic logging by reverting the Field Engineering registry to 0.
1. Use the Event1644Reader.ps1 script to analyze the data - you can download it from this blog: [How to find expensive, inefficient and long running LDAP queries in Active Directory - Microsoft Community Hub](https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/how-to-find-expensive-inefficient-and-long-running-ldap-queries/ba-p/257859)

Further details about Event1644Reader script: [Use Event1644Reader.ps1 to analyze LDAP query performance - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/event1644reader-analyze-ldap-query-performance)



# Scenario 2
If you need to have a deeper understanding of the LDAP server behavior, you can consider using NTDSA ETL logging (reference: [ADDS: Tools: NTDSAI WPP Tracing in Windows Server 2012R2 and later (microsoft.com)](https://internal.evergreen.microsoft.com/en-us/topic/48810fa3-60fa-2af7-c245-c62794939bd7))
1.	Start tracing: 

logman create trace "NTDSA" -ow -o c:\NTDSA.etl -p {90717974-98DB-4E28-8100-E84200E22B3F} 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 2048 -ets

0xffffffffffffffff means that you are tracing all components. You can be more specific by tracing particular components from the following list:


- DSEVENT = bit 0, so pass 0x0001 Use only when all event logs are traced
- JET = bit 1, so pass 0x0002
- Core = bit 2, so pass 0x0004
- LDAP = bit 3, so pass 0x0008
- DRA = bit 4, so pass 0x0010 (This is for Replication)
- DBLayer = bit 5, so pass 0x0020
- DSAEXCEPT = bit 6, so pass 0x0040 Use only when all calls to RaiseDsaExcept are traced
- DRSSERV = bit 7, so pass 0x0080
- BATCHBRACKET = bit8, so pass 0x0100. Only to be used while attempting to catch bug #572
- ATQ = bit 9, so pass 0x0200
- JETBACK = bit 10, so pass 0x0400
- NTDSUTIL = bit 11, so pass 0x0800
- SAMDS = bit 12, so pass 0x1000
- KCC** = bit 13, so pass 0x2000 (RS4 and Newer Only)
- QO** = bit 14, so pass 0x4000 Use for query optimizer (Pre-RS4 this is Bit 13 and you would pass 0x2000)
- INSTALL** = bit 15, so pass 0x8000 Use for install and boot (RS4 and Newer Only)
- DSAPI** = bit 16, so pass 0x10000 Use for DSAPI calls (including NTDSAPI) (RS4 and Newer Only)

** Note that some of the flags are only for newer OS. More importantly note that the bit location changes for QUERY OPTIMIZER TRACING between RS4 and Pre-RS4.

During an LDAP investigation you might consider tracing only the following:
- Core = bit 2, so pass 0x0004 
- LDAP = bit 3, so pass 0x0008 
- ATQ = bit 9, so pass 0x0200 

This results in the following command:

logman create trace "NTDSA" -ow -o c:\NTDSA.etl -p {90717974-98DB-4E28-8100-E84200E22B3F} 0x20c 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 2048 -ets

2.	Stop tracing: 

logman stop "NTDSA" -ets