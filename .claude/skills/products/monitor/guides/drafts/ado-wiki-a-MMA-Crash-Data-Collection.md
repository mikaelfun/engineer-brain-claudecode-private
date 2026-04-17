---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting MMA crash"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/Troubleshooting%20Guides/Troubleshooting%20MMA%20crash"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

Applicable to Microsoft Monitoring Agent versions 10.20.18029 & above. 
# Symptoms

The **MON Agent** that is any of the following process (**HealthService.exe**, **MonitoringHost.exe**, **MOMPerfSnapshotHelper.exe**) is crashing.

# Important details

The actual **cause** of the crash is unknown until the collected crash dump is analyzed.

If the customer reports that the **MON Agent** is crashing, first of all, we need to verify if that is true or not, in the sense that a "process crash" means something very specific and it might be used inappropriately. Here is [what a process crash means](https://en.wikipedia.org/wiki/Crash_(computing)).

First we need to verify if there really is a crash. To do that, get the **Application Event Log** because [Windows Error Reporting](https://docs.microsoft.com/windows/win32/wer/windows-error-reporting) will report the crash as an Error event **1000** in the **Application Event Log** which contains the actual name of the process that is crashing. For the **MON Agent**, we should have an Error event **1000** which contains one of the processes of the **MON Agent** (ex. **HealthService.exe**, **MonitoringHost.exe**, **MOMPerfSnapshotHelper.exe**, but there might also be others related depending on the LA Solutions used).

# Data Collection

If and only if you find such a **1000** Error event in the **Application Event Log** which contains a process name that belongs to the **MON Agent**, then we need to collect a [Crash Dump](https://en.wikipedia.org/wiki/Core_dump) of the crashing process.

To do so, there are multiple ways, but probably the simplest way is to use [Windows Error Reporting](https://docs.microsoft.com/windows/win32/wer/windows-error-reporting) for this. We need to configure it to [write a crash dump with complete memory though](https://docs.microsoft.com/windows/win32/wer/collecting-user-mode-dumps).

To do this, all we need to do, is to add these registry keys as described in the article, which we can do either manually or by running this PowerShell script from an **elevated** PowerShell:

``` PS
$dumpLocation = "$Env:WINDIR\temp" # change this to a different directory based on your needs
$registryPath = "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps"
reg add $registryPath /v DumpFolder /t REG_EXPAND_SZ /d $dumpLocation /f
reg add $registryPath /v DumpCount /t REG_DWORD /d 10 /f
reg add $registryPath /v DumpType /t REG_DWORD /d 2 /f
```

Now, wait for the respective process belonging to the **MON Agent** (ex. **HealthService.exe**, **MonitoringHost.exe**, **MOMPerfSnapshotHelper.exe**, ...) to crash (verify this in the **Application Event Log** by checking the Error event **1000** which needs to contain the name of a **MON Agent** process), the crash dump(s) will be written to the directory that is defined in the PowerShell script (added to the registry) which in this case (can be changed in the script) will be: **%windir%\temp**.

The crash dumps there will contain the name(s) of the crashing **MON Agent** process(es). Archive these dumps (ZIP/RAR/7Zip) and send the data.

After the dumps have been collected, please make sure to remove the registry configuration of Windows Error Reporting of writing these dumps by either manually delete those registry values, or by automatically doing so from an **elevated** PowerShell:

``` PS
$dumpLocation = "$Env:WINDIR\temp" # change this to a different directory based on your needs
$registryPath = "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps"
reg delete $registryPath /v DumpFolder /f
reg delete $registryPath /v DumpCount /f
reg delete $registryPath /v DumpType /f
```
# Before Escalation to Product Group
- Make sure you have correct SAP path to case "if you are main case owner". This will help you to automatically choose right Agent ICM template.

![image.png](/.attachments/image-dfe4d2c5-99c3-4f7f-8f53-f143788e0781.png)

- If you are not case owner and investigating a collaboration then you have to manually locate template in Azure support center to raise ICM.

![image.png](/.attachments/image-f39c0215-f715-4c4c-b31c-0f4e1c739dfa.png)