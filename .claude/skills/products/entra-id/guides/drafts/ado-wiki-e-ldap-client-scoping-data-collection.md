---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/LDAP/LDAP Client/LDAP Client: Scoping & Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/LDAP/LDAP%20Client/LDAP%20Client%3A%20Scoping%20%26%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/890460&Instance=890460&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/890460&Instance=890460&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document outlines the process for troubleshooting LDAP client issues by identifying key information and collecting necessary data. It includes steps for scoping the problem, gathering details, and enabling debug tracing for the LDAP client.

[[_TOC_]]
<BR>


# Scoping

#### What
 
- What is the setup about, what is the expected result in regular/normal operation? If that information was not yet provided, collaborate with the application team to understand the details.  
- What is the exact error message produced?  
- What application specificaly are we troubleshooting? - Identify the Application Name and Version (In particular if it is a third-party)
- What LDAP runtime and API is the application using?  Apps even on Windows may not use the Microsoft LDAP runtime (e.g. Java apps). 
- Identify both the Client Application and Server Applications Name and Versions.  
- How exactly is the connection established? - Using the NetBIOS Name /IP address /URL ? - Be very detailed.  
- Does the authentication problem also occurs if using the FQDN to connect to the applications/endpoints?  
- What Version of Windows is in use by the Client and Server?  
- What are the Domain Controller's OS Versions?  
- What Third-Party OS Versions and Patch Level? - If applicable.  
 
 
 
#### Where

- Where exactly was the error observed?  
- Does it matter in which domain the client computer resides, when the user is from a different domain? 
- Can you correlate the failures with load on the infrastructure (Affected Servers and/or Domain Controllers)? 
- When related to a cross domain access, what kind of trust is in place? 
- In scenarios where a Trust is involved obtain the Trust  - information Details - Trust Type, Trust Direction, Trust Configured Authentication Type and also the List of Domain Names (FQDN) from both sides of the trust.  
 
#### When
 
- When did the problem start? 
- How frequent are the failures? 
- Where there any changes introduced in the environment? 
- When is the error received? Is it reproducible? 
- Can you correlate the failures with peak business hours? 
 
 
####Extent
 
- How many users/computers are experiencing the issue? Do they have a common pattern (for example, from the same domain)?

# Data collection

Data collection will mostly focus on taking a network trace and enabling debug level tracing for Wldap32.dll.


[How
to Turn on Debug Logging of the LDAP Client (Wldap32.dll) - Windows Server |
Microsoft Learn](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/turn-on-debug-logging-ldap-client)

Customer-ready action plan for LDAP client tracing (can be collected alongside AuthScripts):
1. From elevated command prompt run the following to trace "mmc.exe" (can be replaced with any other process name):  
reg add HKLM\SYSTEM\CurrentControlSet\Services\ldap\tracing\mmc.exe  
logman create trace "ds_ds" -ow -o c:\ds_ds.etl -p "Microsoft-Windows-LDAP-Client" 0x1bddbf73 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 4096 -ets
2. Reproduce what is being traced in the process configured in the previous step.
3. Stop the trace:  
logman stop "ds_ds" -ets

The trace can then be converted into readable text either by using the command below or using InsightClient (InsightClient will produce a "cleaner" trace to read):  
netsh trace convert input=c:\ds_ds.etl output=LDAP_CLIENT-formatted.txt