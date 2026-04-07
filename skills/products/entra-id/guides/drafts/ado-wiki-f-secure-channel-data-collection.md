---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Secure Channel/Workflow: Secure Channel: Data Collection/Data Collection for other Secure Channel issues"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FSecure%20Channel%2FWorkflow%3A%20Secure%20Channel%3A%20Data%20Collection%2FData%20Collection%20for%20other%20Secure%20Channel%20issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/417860&Instance=417860&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/417860&Instance=417860&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This document provides a detailed plan for data collection, including guidelines and steps for enabling NetLogon logging, network tracing, and exporting event logs. It is designed to help diagnose and resolve issues related to NetLogon event ID 5719.

[[_TOC_]]

# Data collection plan

## Guidelines
Get a detailed description of the problem. Use scoping questions to gather all possible information about the problem, the environment, and the deployment.

## NetLogon logging, network trace, and event logs
1. From an elevated command prompt, enable NetLogon logging and network trace by running the following commands:
    ```
    Nltest /DBFlag:2080FFFF  
    if not exist c:\ms mkdir c:\ms  
    del /f /q c:\ms\*.*  
    netsh trace start capture=yes persistent=yes tracefile=c:\ms\bootcap.etl
    ```
    **Notes:**  
    The **persistent=yes** parameter is needed if a tracing session across reboots is required.

1. Reproduce NetLogon event ID 5719. Restart the machine and confirm that Event ID 5719 has logged.

1. Stop the traces from an elevated command prompt using the below commands:
    ```
    Nltest /DBFlag:0x0 
    netsh trace stop 
    ```

1. Export the System, Application, and Security event viewer logs along with the network trace and NetLogon files (change "contoso.com" in the nltest command to the domain Fully Qualified Domain Name (FQDN)):
    ```
    Copy  %windir%\debug\netlogon.log  c:\ms\%computername%_netlogon.log 
    Copy  %windir%\debug\netlogon.bak  c:\ms\%computername%_netlogon.bak 
    wevtutil.exe export-log System c:\ms\%computername%_System.evtx /overwrite:true 
    wevtutil.exe export-log Security c:\ms\%computername%_Security.evtx /overwrite:true 
    wevtutil.exe export-log Application c:\ms\%computername%_Application.evtx /overwrite:true 
    Nltest /sc_verify:contoso.com > c:\ms\sc_verify.txt 
    reg query "HKLM\SYSTEM\CurrentControlSet\Services\Netlogon" /s > c:\ms\Netlogon_reg_parameter.txt
    ```
1. Compress the c:\ms folder and upload to the workspace.