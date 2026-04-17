---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: LSASS high memory/Member Server - LSASS high Memory/Data Collection: Member Server LSASS High Memory"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20LSASS%20high%20memory/Member%20Server%20-%20LSASS%20high%20Memory/Data%20Collection%3A%20Member%20Server%20LSASS%20High%20Memory"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533525&Instance=1533525&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533525&Instance=1533525&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]


##ADPERF: Member Server LSASS high Memory Data collection guide

Abstract: This page describes the data to collect for high memory scenarios on a member server and how you can collect this data. For most cases, you should use ADPerf script with Scenario 3 or Scenario 4, in rare cases when it's not possible, you can use the guidance from the article on how to manually collect the required logs.

#**Before you collect data:**

- Check known issues  
- Ensure the Domain Controller is on the latest fixes - this is Critical. We don't want to debug a fixed issue! 

**TIP:**  
Always recommend the customer tests his action plan and data collection outside of hours where possible before gathering the data during peak hours. This is to avoid any surprises (I.e. sometimes invasive tools like idna/debugdiag can cause LSASS to crash). And thus we cannot guarantee it works smoothly. It maybe fine on one DC and not on the other! 
<br/> 

##**Data to collect (instructions below)**

**Always prioritize using ADPerf script.** Script collects all necessary data. If needed, you can also collect data manually.

**How to collect data manually:**  
- Start Perfmon Log (Long). While perfmon runs collect the following in the order specified: 
- LSASS.DMP1 
- [Handle.exe](https://docs.microsoft.com/en-us/sysinternals/downloads/handle)
- Xperf/WPR trace of a few mins if fast/aggressive growth (5-10min) 
- LSASS.DMP2 
- Auth scripts for 10-30mins depending on speed of leak.  
  - [ADDS: Security: WHFB: Tools: Scripts for collecting data when investigating Windows Authentication, Hybrid Identity and related scenarios](https://internal.evergreen.microsoft.com/en-us/topic/944d1348-83b9-87c0-7ef4-1d76b5c2e5f9)
- [Logonsessions.exe](https://docs.microsoft.com/en-us/sysinternals/downloads/logonsessions) (sysinternals) 
- [handle.exe](https://docs.microsoft.com/en-us/sysinternals/downloads/handle) output2 (if there is a handle leak as well as memory leak) 
- Finally collect Complete Memory dump in hung/bad state [Collect complete Memory Dump](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413869) and [Difficulty Generating a Memory Dump?](https://internal.evergreen.microsoft.com/en-us/topic/1cc6f70f-daa5-c785-40c3-4bb1bbb884dd)

Always collect all logs at the SAME time. 

# **ADPerf script data collection**

Most scenarios can be covered with ADPerf script. It can be downloaded from https://aka.ms/adperfscripts. This is a public link, it can be shared with customers.

Read more about ADPerf script on ADPerf script on https://aka.ms/howto-adperfscripts.

Choose Scenario 3 (High Memory) or Scenario 4 (High Memory Trigger Start):

![image.png](/.attachments/image-1cc6d5d3-dbd1-467a-b0dc-8a757cb0bfbe.png)

**Scenario 3** will enable immediately and should be used when the machine is already experiencing high LSASS Memory usage and will continue to run until you press Enter key.

**Scenario 4** will trigger based off a Memory % threshold that you set and run for as long as you define between 1-30 minutes (Default is 5) after the Memory trigger condition is met.

Data collected by ADPerf script for both scenarios:

- Netlogon Debug logging with flags 0x2080ffff
- LSA and LSP tracing
- SamSrv Tracing
- Tasklist /svc and tasklist /v
-Netstat report
- Copies of Ntdsai.dll/samsrv.dll/lsasrv.dll/ntdsatq.dll

Plus, for **Scenario 3: High Memory** it collects:

- Windows Performance Recorder Profiles for Heap and VirtualAllocation. Runs the following command: _WPR.exe -Start Heap -Start VirtualAllocation_
- Collects a single dump of LSASS. Runs the following command: procdump lsass.exe -mp -AcceptEula
- Collects WPR Snapshot on start and on stop of script (if the WPR snapshot is missing stacks please check for Shadow Stacks being enabled)

For ****Scenario 4: High Memory Trigger Start**

**Identical to Scenario 3** but will only start collecting when the configured threshold is met. **Uses the performance counter Memory\% Committed Bytes In Use and checks every 5 seconds.**

It collects then:

-  WPR Snapshot on start and on stop of script (if the WPR snapshot is missing stacks please check for Shadow Stacks being enabled)

**Please note that on Triggered scenarios the perfmons will start immediately but no other data collection will trigger until the threshold is met.**
 
#**Detailed log instructions for manual data collection**

##**Collecting a standard Perfmon log:** 
 
A standard Perfmon is useful for member servers or workstations or in situations where AD Diagnostics Data Collector is too hard to collect on a domain controller because the issue is too intermittent or difficult to predict.  The following template can be used for collecting a standard Perfmon log including NTDS counters for domain controllers or ADAM/AD LDS Instances however you may need to modify some parameters 

- The "-max 300" switch means the log will consume a maximum of 300Mb of disk space, this can be adjusted if needed.  The log is also circular meaning it will begin to overwrite and will only contain the last 300Mb of data captured. 
- The "-si 00:00:05" section means it will poll at a 5 second internal this may need to be adjusted depending on how long the issue takes to occur, five seconds is good for short running Perfmon logs (under 2hrs) however if the issue takes much longer to occur you can increase the sample interval accordingly. 
- For Server 2003 Netlogon counters are only available if KB 928576 is installed, they are preinstalled on Server 2008 and newer. 

##**Perfmon Template** 

- Open a CMD prompt (as administrator) 
- Copy and paste the following command into the command prompt window: 
````
Logman.exe create counter LongPerfLog -o "c:\perflogs\ADPerfLog.blg" -f bincirc -v mmddhhmm -max 300 -c "\LogicalDisk(*)\*" "\Memory\*" "\Cache\*" "\Network Interface(*)\*" "\Paging File(*)\*" "\PhysicalDisk(*)\*" "\Processor(*)\*" "\Processor Information(*)\*" "\Process(*)\*" "\Redirector\*" "\Server\*" "\System\*" "\Server Work Queues(*)\*" -si 00:00:05 
````
- Start the log with the following command: 
````
Logman.exe start LongPerfLog 
````
- Wait for the problem to occur or reproduce the issue 
Stop the performance log with the following command: 
````
Logman.exe stop LongPerfLog 
````
- The output file will be C:\Perflogs\LongPerfLog.blg please zip that file and upload for review. 
<br/>

##**To Collect LSASS.exe process dump**  
Use procdump.exe. See [Debugging: Setting up ProcDump to capture dump of a running process](https://internal.evergreen.microsoft.com/en-us/topic/e2a47ab8-b11e-31ec-aa4e-85ea2a9829b9).

For LSASS.exe: [ADDS: Tools: Why is my LSASS crash dump encrypted?](https://internal.evergreen.microsoft.com/en-us/topic/c1f96434-140d-9a5e-be97-704f7f8761e9)

OR  

Task manager (right click the process and choose a dump) 
 

**Collecting a Xperf/WPR trace.**  

- Depending on the OS of the DC download the relevant version of the Windows Performance Toolkit:  
- See https://docs.microsoft.com/en-us/windows-hardware/test/wpt/ 
- Download from [Download and install the Windows ADK](https://learn.microsoft.com/en-us/windows-hardware/get-started/adk-install)
- Deselect everything except **Common Utilities\Windows Performance Toolkit**  
![Data_collection_Member_Server.png](/.attachments/ADPERF/Data_collection_Member_Server.png)
- Set the following registry key (on WS2008 R2 and below only, not required on newer OS) 
  - HKLM \system\CurrentControlSet\Control\Session Manager\Memory Management  
  - REG_DWORD: DisablePagingExecutive = 1 
  - REBOOT.  
- Start a WPR trace using wprui.exe and ensure you add Heap Usage, Pool Usage and Handle Usage scenarios + General  
![Data_collection_Member_Server_1.png](/.attachments/ADPERF/Data_collection_Member_Server_1.png)
- Depending on how busy the Server is the trace may grow quickly, so it is recommended to do a TEST RUN and run a 2min trace and check the size. Then make a decision how long is OK to run. For example, we don't want traces more than a couple of GB as they become slow to open and analyze.  


 
**Complete memory dump** 

Finally once the issue occurs collect a complete memory dump of the machine.  

It is always preferred to have WPR first, especially to track memory leaks.

Check with SME first if collecting a complete memory dump makes sense for the specific case.

For instructions see [Collect complete Memory Dump](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413869) and [Difficulty Generating a Memory Dump?](https://internal.evergreen.microsoft.com/en-us/topic/1cc6f70f-daa5-c785-40c3-4bb1bbb884dd)

**Expected data:**

- Performance monitor log covering time period from reboot --> problem state 
- Xperf/WPR trace 
- LSASS dumps 
- Auth scripts 
- Handle.exe and logonsessions.exe outputs 
- Complete memory dump once server is in "problem state" 


**Always recommend the customer tests his action plan outside of hours where possible before gathering the data during peak hours.** 

<span style="color:red">***_All screenshots, machine name references, IP addresses, and log outputs are from internal lab machines and not customer data._**