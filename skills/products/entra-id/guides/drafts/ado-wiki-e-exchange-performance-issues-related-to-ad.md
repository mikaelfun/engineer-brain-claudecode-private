---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Other common scenarios/Exchange Performance Issues related to AD"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20Other%20common%20scenarios/Exchange%20Performance%20Issues%20related%20to%20AD"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533510&Instance=1533510&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533510&Instance=1533510&Feedback=2)

___
<div id='cssfeedback-end'></div>

##ADPERF: Other scenarios: Exchange Performance Issues related to AD

<br>

https://aka.ms/adperfninja  
Lesson 3 - LSASS HIGH CPU  

**Troubleshooting Performance Issues related to AD : Below Scoping Information is devised after speaking to Exchange Folks**  

**Information Required:** 

1. Number of Mailbox Servers and CAS Servers in that Site where we have an Issue 
1. Does their Exchange and DC's are on different Subnet or any Firewalls in between 
1. Number of Domain Controllers 
1. OS of the Domain Controllers  
1. Are they Physical or Virtual

https://support.microsoft.com/en-us/kb/3072595 

**Understanding and Scoping:** 

Basic Information:  

- **What is the customers Domain Environment?** 
  - Are all Users from the Same Domain Accessing these Exchange Servers  
  - Is this a User Domain and Resource Domain Configuration  
  - Are Users from Different Domains or in the same domain accessing these Exchange Servers  
- **Domain Controllers?** 
  - How many Domain Controllers in the Domain? : 
  - How many Domain Controllers / Global Catalogs does the Exchange Servers discover? : Ideally it should discover 1 but it is discovering out of site domain controllers. 
  - What is the Operating System of the Domain Controllers? :  
  - Does the Domain Controllers have the LDAP Optimization Fix? https://support.microsoft.com/en-us/kb/3072595 (MS15-096: Vulnerability in Active Directory service could allow denial of service: September 8, 2015 ) : No 
  - Are these all Physical Servers or Virtual Servers?  
  - How many Number of CPUs on the Domain Controllers? :  
  - What is the Amount of RAM on the Domain Controllers? :  
- **Exchange Environment?** 
  - What is the Operating System of the Exchange Servers? :  
  - What is the Exchange Version with the Service Pack Level on the Exchange Servers?  
  - How many Exchange Servers? 
  - Does the Customer have a Dedicated Site for Exchange Environment in Active Directory? (Which means does only the Exchange Servers talk to the Domain Controllers or even Client Machines talk to the Domain Controllers? : 
  - Is the Exchange Mailbox Ratio Vs Number of CORES on the Domain controllers appropriate (Exchange Scaling) :  
  - What is the Authentication method (NTLM or Kerberos) :  
  - Are the Exchange Servers performing Manual Discovery or Automatic Discovery of DCs / GCs (Main question is are we manually setting up some DC/GC on the Exchange Servers) : Automatically 
- **About the issue?** 
  - What is the Exact issue? (Please describe the issue)  
  - Are the CAS Servers Impacted or Mailbox or Both? 
  - What is the pattern on the issue? 
  - What event IDs are we getting on the Exchange Servers?: (Example Events: 2070, 10006, 1009, 1006, 1002, 4057, 1021, 4402, 4999, 7031, 7032) 
  - Are all Exchange Servers Impacted or only Some Exchange Servers at the time of the issue? 
  - Do we have any pattern that most of the time the Exchange Servers complain about 1 or 2 Domain Controllers: 
  - How does the issue get resolved? (By Rebooting some Servers or Issue gets resolved automatically or by Restarting some Services) :  
  - How much time do we have the issue (10 Minutes or 1 Hour or always) :  
  - Do all Exchange Servers complain about all DCs or just some of them? :  
  - Do we see an High LDAP Read Times and LDAP Search Times? And what are their Values when we have the issue? 
  - Do we have any Specific LDAP Queries which are taking time on the domain Controller to respond back :  
  - Where is the actual issue? (Is the issue during connecting for New Users? Or even the Old Users who have already connected have   any problem?  
  - What is the Message from the Client Perspective (Outlook or OWA etc) when we face the issue  
  - For how long is the customer facing the issue? :  
  - Do we know what has changed in their environment (Like they have consolidated some Servers, Upgraded the Domain controllers,   Installed a Service Pack, They had New Users or Mailboxes, They have moved Sites etc):  
  - Do we get any SCOM or any Alerts on the Domain Controllers when they face the issue (Like CPU Spiked or Memory Depletion etc) :  
  - What is the current action plan from both Active Directory Side and Exchange Side  

<br/>

**Action Plan :**  

Exchange Server: 
- Netlogon Logging 
- LSP Logging 
- Network trace 
- Netlogon Perfmon  

Let the Exchange Team collect their Logging and then they would need to share them the below Questions during the time of the issue: 
- Which DC or DCs did we have a Problem? 
- What the LDAP Queries that the Exchange sent which took more time? 
- What is the Amount of time that the Query took? (We can look into the 1644 Events to see how much time did the Active Directory Take to answer) 

<br/> 

**Active Directory:**  

PerfmonLong with the below Counters : Collect the data before / During and After the issue  
This Perfmon should be running even before the issue is started  
Counters : Process (All Process) / Processor / Memory / Directory Services / Security Wide Statistics / Netlogon / Database (Lsass)  

During the issue we would need : (You can increase the size of the Directory Services Logs to 500 or 600 MB on all of the DCs) and enable the Field Engineering Keys with Expensive & Inefficient Registry Keys to log all Queries  
- Active directory SPA that runs for 5 Minutes  
- Network trace 
- Directory Services Event Logs  

<br/> 

**Expected data:** 

- Network Trace on the Exchange Server 
- Application Event logs on the Exchange Server 
- Exchange Answers to share us the information about the Query / DC etc 
- Network trace on the Domain Controllers (All of the DCs) 
- Active Directory ETL (SPA) (All of the DCs) 
- Directory Services Event Logs  

You can use the below Batch Files: Create a Perfmon with User Defined with Active Directory Diagnostics template.  

**ADPERF_start.bat**  
````
reg add "HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Diagnostics" /v "15 Field Engineering" /t REG_DWORD /d 5 /f 
reg add "HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Parameters" /v "Expensive Search Results Threshold" /t REG_DWORD /d 1 /f 
reg add "HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Parameters" /v "Inefficient Search Results Threshold" /t REG_DWORD /d 1 /f 
reg add "HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Parameters" /v "Search Time Threshold (msecs)" /t REG_DWORD /d 10 /f 

md c:\msdata 
md c:\msdata\nwtrace 
md c:\msdata\EVTlogs 
md c:\msdata\Perfmons 

Logman start MSPerfmon 
start nmcap /network * /capture /file c:\msdata\NWtrace\test.chn:200M /stopwhen /timeafter 5min /Terminatewhen  
c:\tools\sleep.exe 400 
logman stop MSPerfmon 
````
**ADPERF_Stop.bat** 
````
reg add "HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Diagnostics" /v "15 Field Engineering" /t REG_DWORD /d 0 /f 
reg add "HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Parameters" /v "Expensive Search Results Threshold" /t REG_DWORD /d 1 /f 
reg add "HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Parameters" /v "Inefficient Search Results Threshold" /t REG_DWORD /d 1 /f 
reg add "HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Parameters" /v "Search Time Threshold (msecs)" /t REG_DWORD /d 10 /f 

copy /Y "%SystemRoot%\System32\Winevt\Logs\Directory Service.evtx" c:\msdata\Evtlogs\ds.evtx 
copy /Y "%SystemRoot%\System32\Winevt\Logs\Security.evtx" c:\msdata\Evtlogs\Security.evtx 
copy /Y c:\perflogs\*.* c:\msdata\perfmons 
````