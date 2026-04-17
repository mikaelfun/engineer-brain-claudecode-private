---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Collecting data with Windows Performance Recorder (WPR)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FCollecting%20data%20with%20Windows%20Performance%20Recorder%20(WPR)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

---
Applies To:
- Microsoft Monitoring Agent version 10.20.18001 & Above
---
- Windows Performance Recorder is very effective in collecting data on a process with a lot of details which make it effective in troubleshooting High CPU Scenarios.
- This tool is very effective in conjunction with collecting hang dumps of affected process

---

1. Install Windows Performance Recorder (WPR), if not present WPR.exe is installed by default on Determine this version of Windows and above and is installed in this location: C:\Windows\System32\wpr.exe 

2. If WPR.exe is not installed, install Windows Performance Toolkit from here: https://docs.microsoft.com/windows-hardware/test/wpt/. After installation it will be installed in a location similar to this: C:\Program Files (x86)\Windows Kits\10\Windows Performance Toolkit\wpr.exe

3. Verify high CPU using Performance Monitor. 
    - Launch Performance Monitor. 
    - Add %Processor Time counter for MonitoringHost and HealthService processes.
<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=%2F.attachments%2Fimage-52ca4a0b-1d18-4fd3-b87e-91fc325d84da.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>

    - Verify that the MonitoringHost.exe is exhibiting high CPU
<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=%2F.attachments%2Fimage-9dd60796-7ea5-4866-b6c0-1f0c3490074e.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>



4. Collect WPR traces (Note: WPR traces are huge in size. The longer we collect, the larger the trace gets.)
    - Execute command to start collecting WPR traces with profile CPU 
       ```
       mkdir c:\perf\data 
       wpr -start CPU 
       ```
    - Wait for 30 seconds � 1 minute (max) 
    - Stop the collection of traces 
      ```
      wpr -stop c:\perf\data\HighCPU.etl 
      ```
    - This should result in HighCPU.etl (large file) and HighCPU.etl.NGENPDB (symbols) under c:\perf\data. 
5. Zip c:\perf\data and have customer send data in.

---
Sources
---
https://microsoft.sharepoint.com/teams/WAG/EngSys/Monitor/Shared%20Documents/Agent/MonitoringHost%20High%20CPU%20Analysis.docx?web=1
