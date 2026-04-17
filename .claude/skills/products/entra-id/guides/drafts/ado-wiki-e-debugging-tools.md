---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Tools/Debugging"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Tools/Debugging"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1220610&Instance=1220610&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1220610&Instance=1220610&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This guide aims to provide a comprehensive understanding of symbols and dumps, along with the tools and techniques required for effective debugging. It also covers tools like ProcDump, Windbg, and Time Travel Debugging (TTD) for advanced debugging.

[[_TOC_]]

# Symbols
 The on-premises private symbols server at https://symweb (), which allowed anonymous authentication and required a VPN connection, has been deprecated as of June 30, 2024.

The new cloud-based endpoint at https://symweb.azurefd.net () improves security by using Azure Active Directory (AAD) authentication. It does not require a VPN connection and provides faster access for small files and users located outside the Redmond area.

Check [Tools using On-Prem SymWeb](https://www.osgwiki.com/wiki/Tools_using_On-Prem_SymWeb) to see if your debugger version has already updated the default symbol path. Review [Cloud SymWeb](https://www.osgwiki.com/wiki/Cloud_SymWeb) for details about switching from on-premises to cloud SymWeb.

# Dumps

## Memory dump
A memory dump is like a snapshot of memory, including its content, registers, and call stacks. Memory dumps are useful for analyzing crashes, hangs, and other issues by examining the program's state when the problem occurred. However, they are static and do not allow you to see the sequence of events leading up to the issue.

If you need to gather a memory dump, the articles below offer valuable steps:

- [Generate a kernel or complete crash dump](https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/generate-a-kernel-or-complete-crash-dump) - Public URL about how to generate a kernel or complete crash dump
  -  ShortURL https://aka.ms/howto-memorydump
- [Difficulty Generating a Memory Dump](https://techcommunity.microsoft.com/t5/ask-the-performance-team/difficulty-generating-a-memory-dump/ba-p/2351370) - Public article that provides guidance on common challenges and solutions while generating memory dumps
- [KB4524198](https://internal.evergreen.microsoft.com/en-us/topic/9753784c-c92a-7a8d-6e2c-c996bead2f71) Debugging: Capturing a memory dump for a logon, logoff, or shutdown hang issue

## Which memory dump do I need?
The public article [Overview of memory dump file options for Windows](https://learn.microsoft.com/en-us/troubleshoot/windows-server/performance/memory-dump-file-options) describes the following memory dump file types:

- **Complete** memory dump
- **Kernel** memory dump (**default** on Windows Client SKU)
- **Small** memory dump (64 KB)
- **Automatic** memory dump (**default** on Windows Server SKU)

We should always aim to obtain a [Complete Memory Dump](https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/complete-memory-dump) as it includes all the physical memory used by Windows. However, if there isn't enough free space on the disk to dump all the memory content, or if the virtual machine (VM) is configured with 192GB of RAM but the disk is only 127GB, you can use an Active Memory Dump, which is significantly smaller than a complete memory dump and contains the user-mode space. The Active Memory Dump is available in Windows 10 and later.

![image.png](/.attachments/image-411d8828-b686-4f6f-8354-3b303c4fb524.png)

If the server you're troubleshooting is a Server Core installation or if the issue prevents you from accessing the machine properties to set the memory dump type, you can do it through the following methods (**a reboot will be required** for the change to be applied):

1. The **registry** key named **CrashDumpEnabled** located at `HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\CrashControl`

| CrashDumpEnabled value | Dump type | Note |
|--|--|--|
| 0 | None |  |
| 1 | Complete or Active | Active dump is still option 0x1 but it has the **FilterFlags** DWORD set to 1 |
| 2 | Kernel |  |
| 3 | Small |  |
| 7 | Automatic |  |

2. Via WMIC command as described at [Configure memory dump files for Server Core installation](https://learn.microsoft.com/en-us/windows-server/administration/server-core/server-core-memory-dump)

### ProcDump (Sysinternals)
ProcDump is a command-line tool for monitoring CPU spikes and generating crash dumps. It also monitors hung windows, unhandled exceptions, and system performance counters, and can be embedded in scripts.

ProcDump is included within the Sysinternals suite (https://aka.ms/sysinternals) but it can also be downloaded individually from ShortURL  https://aka.ms/procdump.

If you need to collect a process dump, the article below provides useful information to ensure a smooth capture process:

- [KB4497311](https://internal.evergreen.microsoft.com/en-us/topic/e2a47ab8-b11e-31ec-aa4e-85ea2a9829b9) Debugging: Setting up ProcDump to capture dump of a running process

LSASS dump contains NTLM hashes of the Windows credentials of the users that have already logged on to the computer, so Windows Defender considers this a threat and prevents this action. Refer to the article below to prevent common difficulties:

- [KB5014211](https://internal.evergreen.microsoft.com/en-us/topic/4e3f8321-75e6-0f60-eda6-31aed0396f89) Debugging: Common difficulties collecting debugging data from LSASS
  - ShortURL  https://aka.ms/howto-dumplsass

## Windbg (Sysinternals)
Windows Debugger (Windbg) is a Windows debugger for both kernel-mode and user-mode code, crash dump analysis, and CPU register examination.

To handle LSASS dumps, you may need to create a Microsoft Defender exception as described in the article below:

- [KB5023907](https://internal.evergreen.microsoft.com/en-us/topic/2b96da41-cf4a-4b02-f69d-f5bb8bdc0921) ADDS: Tools: How to handle getting and opening Dumps of LSASS blocked by Windows Defender

# Time Travel Debugging (TTD)
Time Travel Debugging (TTD) is like a video recording of a program's execution, allowing you to replay it and analyze the program's behavior at any point in time. This level of detail can be invaluable for diagnosing complex issues, but it also means that the analysis process can be more time-consuming.

Please refer to the articles below for installation, usage, and other considerations before requesting a TTD trace from a customer:

- [KB4136894](https://internal.evergreen.microsoft.com/en-us/topic/ad0c98d1-642b-5c1b-92b8-ad0164580c88) Debugging: Capturing a time travel debug (TTD) trace
   - ShortURL  https://aka.ms/howto-ttd

- [KB5036520](https://internal.evergreen.microsoft.com/en-us/topic/0cc6b86f-a590-9ad0-6034-cbff7e19ad92) Debugging: Collecting a TTD for the Local Security Authority process (LSASS.exe)

# MEX
The Microsoft Extensible (MEX) is a debugger extension that provides a wide range of commands and enhances the features and functionality of the Debugging Tools for Windows.

Please refer to:

- [KB4546725](https://internal.evergreen.microsoft.com/en-us/topic/126adbf1-e246-97cc-9c95-358143c89a23) Debugging: Mex the debugger extension
  - ShortURL  https://aka.ms/mex

# Windows Performance Analyzer (WPA)
The Windows Performance Analyzer (WPA) is a performance visualization tool that uses graphs and data tables of Event Tracing for Windows (ETW) events recorded by the Windows Performance Recorder (WPR) or Xperf. It is part of the Windows Performance Toolkit (WPT) and can open any event trace log (ETL) file for analysis.

## Download
The Windows Performance Toolkit is provided to customers as part of the SDK and ADK. Microsoft employees have access to both public and internal versions of WPA. URLs are provided in the table below:

| WPA version | Usage | Download URL |
|--|--|--|
| Internal - Alphas | Microsoft employees | ShortURL  https://aka.ms/getwpa redirects to https://black-meadow-00acf251e.3.azurestaticapps.net/ |
| Windows Software Development Kit (SDK) | Public | ShortURL  https://aka.ms/windowssdk redirects to https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/ |
| Windows Assessment and Deployment Toolkit (ADK) | Public | https://learn.microsoft.com/en-us/windows-hardware/get-started/adk-install |

## Usage
The public article [Windows Performance Analyzer](https://learn.microsoft.com/en-us/windows-hardware/test/wpt/windows-performance-analyzer) provides a Quick Start Guide and detailed walkthrough.

Internal resources, walkthroughs, and case studies on using the Windows Performance Toolkit for troubleshooting cases can be found in the internal article below:

- [KB4075038](https://internal.evergreen.microsoft.com/en-us/topic/01e2376d-0046-8539-c57a-58582b57c3f3) Windows Performance Toolkit (WPT, WPR, WPRUI, XPERF) Overview & FAQ
  - ShortURL  https://aka.ms/wptstart 

## WPA profiles
WPA profiles are preconfigured settings tailored for specific types of analysis, such as ADPerf or SBSL issues.

### AD Perf WPA profile
- [KB5025960](https://internal.evergreen.microsoft.com/en-us/topic/adperf-tools-ad-perf-wpa-parsers-and-wpa-profiles-9f8a3cca-2e6a-2daa-ad9e-25b25708aa57) ADPERF: TOOLS: AD Perf WPA Parsers and WPA Profiles
  - ShortURL  https://aka.ms/howto-adperfwpa

### SBSL WPA profile
- Please refer to [Workflow: SBSL: Setting up WPA for ETL analysis](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1248093/Workflow-SBSL-Setting-up-WPA-for-ETL-analysis?anchor=load-the-sbsl-profile)

# Debug learning resources
If you want to build your debugging skills, check the content below:

-  **Windbg (1h15m)** [Session - Core Debugging: Taking The First Bites](https://microsoft.sharepoint.com/teams/EESummit/SitePages/EE-214.aspx) from the 2024 EE Summit at https://aka.ms/EESummit introduces you to the basics of kernel debugging and Windows internals.

-  **WPA (39m)** [Introduction to Windows Performance Analyzer (WPA)](https://microsoft.sharepoint.com/:v:/r/teams/CSSLearningWindowsCommercial/Shared%20Documents/Stream%20Migrated%20Videos/Introduction%20to%20Windows%20Performance%20Analyzer%20(WPA)-20220519_090427.mp4?csf=1&web=1&e=6WpSAY&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D) Jason Epperly discusses the process of installing WPA, setting up symbol paths and SIM cache folders, using CPU sampled and CPU precise views for troubleshooting high CPU usage and wait chains, and the concept of WPA profiles.

-  **WPA (59m)** [PERF304P - High CPU Investigations with Windows Performance Toolkit](https://microsoft.sharepoint.com/:v:/r/teams/CSSLearningWindowsCommercial/Shared%20Documents/Stream%20Migrated%20Videos/PERF304P%20-%20High%20CPU%20Investigations%20with%20Windows%20Performance%20Toolkit-20210312_085911.mp4?csf=1&web=1&e=Us2wnt&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D) Jason details the troubleshooting process from identifying the problem to resolving it using WPA.
