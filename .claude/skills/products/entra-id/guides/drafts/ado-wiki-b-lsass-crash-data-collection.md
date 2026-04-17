---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Lsass Crash/Data Collection for Lsass crash"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20Lsass%20Crash/Data%20Collection%20for%20Lsass%20crash"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533497&Instance=1533497&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533497&Instance=1533497&Feedback=2)

___
<div id='cssfeedback-end'></div>

#**Data Collection for lsass crash** <br>


**1.** Collect the Application and System event logs or Windows Directory Services SDP<br>

_.\TSS.ps1 -Start -Scenario ADS_Basic<br>
<br> 
[[SDP] Windows Directory Services](https://internal.evergreen.microsoft.com/topic/2515358)

<br>
<br>


****2.a.** If the issue cannot be reproduced at will and is random:**

Configure WER for Full User-Mode dumps, and collect a dump of LSASS the next time the issue occurs. 

See [Collecting User-Mode Dumps](http://msdn.microsoft.com/en-us/library/windows/desktop/bb787181(v=vs.85).aspx)to configure WER to obtain a Full User-Mode dump of LSASS the next time the process crashes.  

WER is a built-in mechanism, so no additional installs are needed.
<br> 
<br>

As per the article, create the Key:

_HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps_ 

Set the _DumpType_ to 2. <br>
_DumpCount_ can be anything you like  5 to 10 is sufficient. <br> 
The dump location would be your chosen location. 

![2024-06-24_23-13-22.png](/.attachments/2024-06-24_23-13-22-ed93c741-7db3-4cf0-92cc-23c99a120659.png)

Alternatively, run these commands to create the values: <br>

_reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps" /f_ <br>
_reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps" /v "DumpFolder" /t REG_EXPAND_SZ /d "C:\MSDATA\Dumps" /f_ <br>
_reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps" /v "DumpCount" /t REG_DWORD /d "5" /f_ <br>
_reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps" /v "DumpType" /t REG_DWORD /d "2" /f_ <br>

<br>
<br>


Note that this configuration will write a crash dump for any and every application that crashes. If the machine has multiple crashing applications, and you would like to narrow the WER dump generation to a specific process, it can be done by creating a sub-key under _LocalDumps_: <br>

_reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps\Lsass.exe" /f_

<br>
<br>


Wait for the issue to happen and collect all the available dumps. Having multiple dumps can be beneficial in establishing a pattern.  

Expected data and configuration: 

1. Collect a Directory Services SDP on at-least 2 machines which have exhibited the LSASS crash to derive a pattern 
1. Verify if we have any Mini-Dumps in the folder _C:\programdata\Microsoft\Windows\WER_
1. If you observe that the LSASS crash has occurred due to Heap Corruption (EventID:1000 with Exception Code - 0xc0000374), then jump to the 'LSASS Crash with Heap Corruption or Heap Error' section  
 
<br>
<br>


****2.b.** If the issue can be reproduced by the customer:**

If the issue can be reproduced by the customer by performing some steps or activities, then you may want to send the customer TTD (previously called TTT) and follow the steps to collect a TTD trace of LSASS.exe  whilst reproducing the issue.

[Get TTD - OSGWiki](https://osgwiki.com/wiki/Get_TTD) <br>
[Debugging: Capturing a time travel debug (TTD) trace](https://internal.evergreen.microsoft.com/topic/4136894)