---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting MMA High CPU usage"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FTroubleshooting%20Guides%2FTroubleshooting%20MMA%20High%20CPU%20usage"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]
****Note:** All IPs and machine names in this page are from test lab and don't compromise any Pii data.**

Applicable to Microsoft Monitoring Agent versions 10.20.18029 & above. 
# Symptoms

The **MON Agent** that is any of the following process (**HealthService.exe**, **MonitoringHost.exe**, **MOMPerfSnapshotHelper.exe**) is causing high CPU usage. It may well be that a customer is reporting that a different process is causing high CPU usage, but **only** while the **MON Agent** is running and when it is stopped, there is no high CPU usage anymore.

# Important details

The actual **cause** of the high CPU usage is unknown until the collected data is analyzed.

If the customer reports that the **MON Agent** is causing high CPU usage, first of all, we need to identify which process is causing high CPU. We can do that by opening **Task Manager** and looking at the CPU usage of all processes and identifying which process is causing the high CPU usage and how much the CPU usage is - is it 30%, 50%, etc. or is it 100%? It's important to also understand and note the actual high CPU usage percentage.

# Data Collection

For a high CPU usage analysis, we need to collect 2 types of data:
1. a process full memory dump
2. a WPR (Windows Performance Recorder) trace

We will collect these 2 **separately** and !!! **during** !!! the actual high CPU usage.

## Collecting the process full memory dump
1. download **ProcDump.exe** from [here](https://docs.microsoft.com/sysinternals/downloads/procdump)
2. Extract it (it will be an archive containing multiple files) and get only **ProcDump.exe** from the files (you don't need any of the other files and don't worry about 32bit vs 64bit because the file **ProcDump.exe** contains both and it will use the correct one depending on the process)
3. Open an **elevated** CMD Prompt and change to the directory where **ProcDump.exe** is located (where you have saved/copied it)
4. Open **Task Manager** and check for the process causing high CPU usage and note down its **PID** (Process ID)
5. From the **elevated** CMD Prompt, run this command **during the high CPU usage** using the noted **PID** in the command replacing the "*<PID>*" part in the command with the actual real **PID** you have noted down: **ProcDump.exe -accepteula -ma *<PID>***
6. a memory dump file (*.dmp) of the process will be written in the same directory where **ProcDump.exe** is located
7. archive (ZIP/RAR/7Zip) this memory dump file and copy/prepare it for adding it to the collected data

## Collecting the WPR trace


1. download and install WPR tools (also know as [WPT](https://docs.microsoft.com/windows-hardware/test/wpt/)) - it is included in the [Windows ADK tools](https://docs.microsoft.com/windows-hardware/get-started/adk-install), so download [Windows ADK tools](https://docs.microsoft.com/windows-hardware/get-started/adk-install) and when installing it, choose only **Windows Performance Toolkit** (WPT) from the included tools
2. open an **elevated** CMD Prompt and switch to the directory where **WPT** was installed (default is: **"C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Windows Kits\Windows Performance Toolkit"**)
3. from the **elevated** CMD Prompt, run this command **during** the high CPU usage to start the WPR trace: **wpr.exe -start CPU**
4. now let the trace run for a short while, ideally just a few minutes (ideally not more or less than 8-10 minutes) - *make sure that the high CPU usage caused by the **MON Agent** is really happening **during** the time this trace is running or the data will be useless - you can verify this by confirming from **Task Manager** that the high CPU usage is really happening*
5. after the trace has been running for ideally ~5 minutes and making sure that the high CPU usage has happened during this time, [stop the WPR trace](https://docs.microsoft.com/windows-hardware/test/wpt/stop-a-recording) by running this command from the **elevated** CMD Prompt (*make sure the drive (path) where this *etl file is being saved has enough free space because the trace can have a couple of GBs*): **wpr.exe -stop %windir%\temp\monagenthighcpu.etl**
6. inside of the directory where we have chosen to save the trace file, there should also be a directory that got created which has the same name as the .etl file (here - **monagenthighcpu**) - get both this directory and the **monagenthighcpu.etl** file and archive them (ZIP/RAR/7Zip) and copy/prepare it for adding it to the collected data

# Before Escalation to Product Group
- Make sure you have correct SAP path to case "if you are main case owner". This will help you to automatically choose right Agent ICM template.

![image.png](/.attachments/image-dfe4d2c5-99c3-4f7f-8f53-f143788e0781.png)

- If you are not case owner and investigating a collaboration then you have to manually locate template in Azure support center to raise ICM.

![image.png](/.attachments/image-f39c0215-f715-4c4c-b31c-0f4e1c739dfa.png)