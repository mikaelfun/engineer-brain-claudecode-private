---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Tools/Process Monitor (procmon)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Tools/Process%20Monitor%20%28procmon%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1160018&Instance=1160018&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1160018&Instance=1160018&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides detailed instructions on how to configure and use Process Monitor (ProcMon) for troubleshooting and monitoring real-time file system, registry, and process/thread activity.

[[_TOC_]]

# Description
Process Monitor, commonly known as ProcMon, is a Microsoft tool that shows real-time file system, registry, and process/thread activity. ProcMon data helps you understand what is happening on the machine while reproducing the problem, including the sequence of events, access to registry keys or files, results of those accesses, running processes, and more. ProcMon shows stacks for Named Pipes Admin work and other TCP type traffic just as data without stacks.

# Configuration

### ProcMon symbols
 The On-Prem SymWeb private symbols server has been replaced with Cloud SymWeb. Please check [Tools > Debugging > Symbols](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1220610/Debugging?anchor=symbols).

Refer to  [26Inshorts4DS-With-Ravi-Configure Symbols for ProcMon, Dump, and XPERF](https://microsoftapc.sharepoint.com/:v:/r/teams/InShorts/InShorts4DS/26Inshorts4DS-With-Ravi-Configure%20Symbols%20for%20Procmon%20_%20Dump%20and%20XPERF.mp4?csf=1&web=1&e=PqW4Nh&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D) video for further details.

### ProcMon with random issues
If the problem is not reproducible on demand and capture needs to be executed for a long period, select: _Filter > Filter_, add filters as restrictive as possible, then select _Filter > Drop Filtered Events_.

![Drop Filtered Events](/.attachments/image-81b755ac-3248-4b6a-8771-248bdd2d871d.png)

### ProcMon boot logging
By default, ProcMon does not capture data during a reboot. To capture boot-time activity, you must explicitly enable boot logging for each reboot.

Go to _Options > Enable Boot Logging > OK_ via GUI or use the parameter _/enablebootlogging_ when using the console.

![image.png](/.attachments/image-b7abb469-6604-43ed-8ced-5ed43a7e6fcb.png)

After the reboot, the next time you run ProcMon, a prompt will ask if you want to save the data collected during boot-time.

Refer to  [39.InShorts4PERF with Sangita - Boot ProcMon log in No boot scenario](https://microsoftapc.sharepoint.com/:v:/r/teams/InShorts/InShorts4PERF/39.InShorts4PERF%20with%20Sangita-%20Boot%20procmon%20log%20in%20No%20boot%20scenario.mp4?csf=1&web=1&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D&e=xKAnF8) for further details.

### ProcMon advanced output
By default, ProcMon will apply some filters when you launch it. If the issue is happening during OS boot, you may exclude those filters, such as when you want to track drivers' activity.

Go to _Filter > Enable Advanced Output_.

![Enable Advanced Output](/.attachments/image-cecf03e5-5782-4d81-8c9d-4063537a666d.png)

### ProcMon data saved into page file or into disk
By default, ProcMon stores data in the pagefile. However, configuring ProcMon to store the file on the disk instead can help improve system stability and prevent corruption.

Click on 'File' and then 'Backing Files....' Change it from 'Use virtual memory' to 'Use file named:' and then point it to where you want ProcMon to store the PML file.

![image.png](/.attachments/image-e4db8557-98b9-4171-a2ac-abaf4df4bbc2.png)

### Circular ProcMon and large corrupted captures
A ProcMon capture can become corrupted, often due to improper termination or large file sizes (>2GB). However, this issue is rare with TSS, making it a preferred choice for collecting circular ProcMon captures:

    .\TSS.ps1 -Procmon

As shown in the pictures below, there is an option to limit the PML file size in ProcMon v4.01. However, in the previous v3.53 version, you can only limit by the number of events. Therefore, it's recommended to use the latest ProcMon version available.

![image.png](/.attachments/image-9bc82210-7c2c-402c-96f1-cc3e99789f6a.png)

![image.png](/.attachments/image-c429f732-46ef-4230-8380-6278676539a3.png)

If you need circular ProcMon and TSS is not an option, you can do the following:

1. As shown in the pictures below, there is an option to limit the PML file size in ProcMon v4.01. However, in the previous v3.53 version, you can only limit by the number of events. Therefore, it's recommended to use the latest ProcMon version available.
2. Go to any computer with a graphical user interface (GUI), run ProcMon, and apply the desired configuration settings like size limit and filters. Go to _File > Export Configuration_ and save "ProcmonConfiguration.pmc" to disk.
3. Move the ProcmonConfiguration.pmc file to the remote computer to run ProcMon with settings previously defined by using the _/loadconfig_ parameter:

       procmon.exe /accepteula /quiet /backingfile c:\hostname_trace.pml /loadconfig "c:\ProcmonConfiguration.pmc"

# ProcMon scenarios

### ProcMon with remote computer or server core OS
Utilizing PsExec, it is possible to run ProcMon against a remote machine. This is useful if the issue happening on the machine prevents you from performing an interactive logon, or if it is a Windows Core version.

Steps:

- To start the trace on a remote computer, run:

      psexec \\<hostname> /s /d procmon.exe /accepteula /quiet /backingfile c:\hostname_trace.pml

- To stop the trace on the remote computer, run:

      psexec \\<hostname> /s /d procmon.exe /accepteula /terminate

- Copy the log file to your remote machine for viewing:

      xcopy \\<hostname>\c$\hostname_trace.pml c:\TEMP

- View the log file in ProcMon locally by running:

      procmon /openlog c:\temp\hostname_trace.pml

# Customer-ready template

## ProcMon basic steps
>1. Download Process Monitor (ProcMon) from https://docs.microsoft.com/en-us/sysinternals/downloads/procmon.
>2. Extract the ZIP file to the c:\temp folder.
>3. Execute "Procmon.exe". The capture will start as soon as you execute it.
>4. Stop the ProcMon trace (Ctrl+E) and clear the events (Ctrl+X).
>
>>   a) If a reboot or re-login is required, select: Options > Enable Boot Logging.
>>
>>   b) If the capture needs to be executed for a long period, select: Filter > Filter, add filters as restrictive as possible, then select: Filter > Drop Filtered Events.
>
>5. Begin to take the necessary steps to reproduce the problem until just one step remains, so you are one mouse click away from reproducing the problem.
>6. Start the ProcMon trace (Ctrl+E).
>7. Reproduce the issue.
>8. Stop the ProcMon trace (Ctrl+E).
>File > Save (Ctrl+S) as PML file
>Upload resulting data to Microsoft workspace:
>
><<CUSTOMER WORKSPACE LINK TO BE ADDED HERE>>.
