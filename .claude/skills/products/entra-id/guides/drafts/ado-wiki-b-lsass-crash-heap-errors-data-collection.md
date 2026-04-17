---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Lsass Crash/Data Collection for Lsass crash due to heap errors"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20Lsass%20Crash/Data%20Collection%20for%20Lsass%20crash%20due%20to%20heap%20errors"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533496&Instance=1533496&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533496&Instance=1533496&Feedback=2)

___
<div id='cssfeedback-end'></div>

#**Data collection for Lsass crash due to heap errors** <br> 

##Action Plan
<br>

**Enable pageheap and configure machine for full process dump as follows:** 

Information about Page Heap:  
[GFlags and PageHeap](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/gflags-and-pageheap)


Download Debugging tools for Windows from<br>
[Windows SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/) <br>
<br>

![2024-06-24_22-48-12.png](/.attachments/2024-06-24_22-48-12-e3f0d762-954d-4d50-8dc6-c864277da550.png)

- This install contains a utility called gflags.exe  
- On the affected server, run the command **gflags.exe -p /enable LSASS.exe**. This will enable heap tracing on the server and will need a reboot. Note: Expect some performance impact while PageHeap is enabled. <br>

- **Configure machine for Full User-Mode process dumps:** 

See [Collecting User-Mode Dumps](http://msdn.microsoft.com/en-us/library/windows/desktop/bb787181(v=vs.85).aspx)to enable WER to obtain a full usermode dump of LSASS the next time the process crashes.  

WER is a built-in mechanism, so no additional installs are needed. 

As per the article, please create the Key:

_HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps_ <br>

Set the _DumpType_ to 2. <br>
_DumpCount_ can be anything you like  5 to 10 is sufficient. <br>
The dump location would be your chosen location. 

![2024-06-24_23-13-22.png](/.attachments/2024-06-24_23-13-22-ed93c741-7db3-4cf0-92cc-23c99a120659.png)

Alternatively, run these commands to create the values: <br>

_reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps" /f_ <br>
_reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps" /v "DumpFolder" /t REG_SZ /d "C:\MSDATA\Dumps" /f_ <br>
_reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps" /v "DumpCount" /t REG_DWORD /d "5" /f_ <br>
_reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps" /v "DumpType" /t REG_DWORD /d "2" /f_ <br>


Note that this configuration will write a crash dump for any and every application that crashes. If the machine has multiple crashing applications, and you would like to narrow the WER dump generation to a specific process, it can be done by creating a sub-key under _LocalDumps_: <br>

_reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps\Lsass.exe" /f_

<br>
<br>
- Wait for the issue to happen again, and collect 2 dumps of lsass.exe from the crash with PageHeap enabled. <br>

- **Turn off PageHeap** 
  - Once a couple of PageHeap generated LSASS dumps are collected, turn off PageHeap on LSASS. Otherwise, LSASS will have higher memory usage due to PageHeap overhead. 
  - To turn off PageHeap run **gflags -p /disable lsass.exe** 
- Upload the LSASS dump files generated with the above settings in place + Application and System event logs.