---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting MMA high memory usage"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/Troubleshooting%20Guides/Troubleshooting%20MMA%20high%20memory%20usage"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

Applicable to Microsoft Monitoring Agent versions 10.20.18029 & above. 

****Note:** All IPs and machine names in this page are from test lab and don't compromise any Pii data.**

# Symptoms

The MMA also known as **MON Agent** that is any of the following process (**HealthService.exe**, **MonitoringHost.exe**, **MOMPerfSnapshotHelper.exe**) is causing high memory usage.

# Important details

The actual **cause** of the high memory usage is unknown until the collected data is analyzed.

If the customer reports that the **MON Agent** is causing high memory usage, first of all, we need to identify which process is causing high memory. We can do that by opening **Task Manager** and looking at the memory usage (**Private Bytes**) of all processes and identifying which process is causing the high memory usage and how much the memory usage is.

# Data Collection

For a high memory usage we will need to first identify what type of memory is the one that we need to troubleshoot. There are multiple types of memory in a process which can be high or leak and we need to first identify what type it is and after we have identified, we will see what steps we need to do next, because depending on what type of memory we need to analyze, we might need to collect additional data.

However, in the beginning, in order to identify what kind of memory is high, we will just collect a series of 3 memory dumps one after the other (will be done automatically in the command) by using **ProcDump.exe** like so:

1. download **ProcDump.exe** from [here](https://docs.microsoft.com/sysinternals/downloads/procdump)
2. Extract it (it will be an archive containing multiple files) and get only **ProcDump.exe** from the files (you don't need any of the other files and don't worry about 32bit vs 64bit because the file **ProcDump.exe** contains both and it will use the correct one depending on the process)
3. Open an **elevated** CMD Prompt and change to the directory where **ProcDump.exe** is located (where you have saved/copied it)
4. Open **Task Manager** and check for the process causing high memory usage and note down its **PID** (Process ID)
5. From the **elevated** CMD Prompt, run this command **during the high memory usage** using the noted **PID** in the command replacing the "*<PID>*" part in the command with the actual real **PID** you have noted down (*this will take 3 dumps 1 minute apart, so it will take ~3 minutes + until the command finishes*): **ProcDump.exe -accepteula -ma -n 3 -s  60 *<PID>***
6. 3 memory dump files (*.dmp) of the process will be written in the same directory where **ProcDump.exe** is located
7. archive (ZIP/RAR/7Zip) these memory dump files and copy/prepare them for adding them to the collected data

# Before Escalation to Product Group
- Make sure you have correct SAP path to case "if you are main case owner". This will help you to automatically choose right Agent ICM template.

![image.png](/.attachments/image-dfe4d2c5-99c3-4f7f-8f53-f143788e0781.png)

- If you are not case owner and investigating a collaboration then you have to manually locate template in Azure support center to raise ICM.

![image.png](/.attachments/image-f39c0215-f715-4c4c-b31c-0f4e1c739dfa.png)