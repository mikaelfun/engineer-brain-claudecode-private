---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/How to run MMA Windows Support Tool Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/Troubleshooting%20Guides/How%20to%20run%20MMA%20Windows%20Support%20Tool%20Guide"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

# <span style="color: #4169E1"> Overview </span>
---

The Log Analytics Agent Windows Troubleshooting Tool is a collection of PowerShell scripts designed to help find and diagnose issues with the Log Analytics Agent. It is automatically included with the agent build 10.20.18053.0 and onwards upon installation. 

Running the tool should be the first step in diagnosing an issue.

# <span style="color:#4169E1"> How to Use </span>
---
- Open PowerShell prompt as Administrator on the machine where Log Analytics Agent is installed.
- Navigate to the directory where the tool is located.
`cd "C:\Program Files\Microsoft Monitoring Agent\Agent\Troubleshooter"`
- Execute the main script using this command
`.\GetAgentInfo.ps1`
- Select a troubleshooting scenario.
- Follow instructions on the console. (Note: trace logs steps requires manual intervention to stop log collection. Based upon the reproducibility of the issue, wait for the time duration and press 's' to stop log collection and proceed to the next step).
- Wait for all operations to complete.
- Locations of the results file is logged upon completion and a new explorer window highlighting it is opened.

# <span style="color:#4169E1">Scenarios Covered </span>
---
<span style="color:#4169E1">(Note: scenarios that collect process dumps will result in substantially bigger final log files) </span>
<br />

1. <span style="color:#4169E1"> Agent not reporting data or heartbeat data missing </span>
    -   System information
    -   TestCloudConnection.exe results
    -   Agent certificate information
    -   Agent registry state snapshot
    -   Agent performance counters
    -   Operations Manager log
    -   Verbose ETL logs
<br />
2. <span style="color:#4169E1">Agent extension deployment failing </span>
    -   System information
    -   Extension logs
    -   Installer logs
<br />
3. <span style="color:#4169E1"> Agent crashing </span>
    -   System information
    -   Agent registry state snapshot
    -   Operations Manager log
    -   Verbose ETL logs
    -   Agent processes dumps
<br />
4. <span style="color:#4169E1">Agent consuming high CPU/memory </span>
    -   System information
    -   TestCloudConnection.exe results
    -   Agent certificate information
    -   Agent registry state snapshot
    -   Agent performance counters
    -   Operations Manager log
    -   Verbose ETL logs
<br />
5. <span style="color:#4169E1"> Installation/uninstallation failures </span>
    -   System information
    -   Installer logs
    -   Extension logs
<br />
6. <span style="color:#4169E1"> Custom logs issue </span>
    -   Collects filesystem events by watching files of a specified pattern in a directory
<br />
7. <span style="color:#4169E1"> OMS Gateway issue </span>
    -   System information
    -   TestCloudConnection.exe results
    -   OMS Gateway event logs
    -   Operations Manager log
<br />
8. <span style="color:#4169E1"> Performance counters issue </span>
    -   System information
    -   TestCloudConnection.exe results
    -   Agent certificate information
    -   Agent registry state snapshot
    -   Agent performance counters
    -   Operations Manager log
    -   Verbose ETL logs
<br />
A. <span style="color:#4169E1">Collect all logs </span>
    - System information
    - Installer logs
    -   Extension logs
    -   TestCloudConnection.exe results
    -   Agent certificate information
    -   Agent registry state snapshot
    -   Agent performance counters
    -   Operations Manager log
    -   Verbose ETL logs
    -   Agent processes dumps
<br />

# <span style="color: #4169E1">Notes </span>
---
<br />

- Manual intervention is required if the selected scenario collects trace logs. This is to give user an option to reproduce any ongoing issue so that specific trace logs are included. If the issue is not reproducible, wait for a couple of minutes and stop tracing. Trace logs can be stopped by pressing 's' on the PowerShell window.
![image.png](/.attachments/image-645aa736-55c7-444c-b2ba-5f02a1e0a8cb.png)

- Upon completion, script opens the folder where the final zip file stored. Last line of the script has the log file's absolute path. Zip file naming format: <computer name>_hh_mm_mm_dd_yyyy.zip
![image.png](/.attachments/image-dabb2a55-d0b8-4448-bf42-d1b33af1d844.png)

- Tool execution logs are outputted to the console as well as written to a log file. Log file location is logged to the console:
	-  Screenshot of the complete run of tool. 
<br /> ![image.png](/.attachments/image-c20f3fa7-51fa-4e7e-979d-e44b0059362a.png)

	-  Screenshot of the custom logs watcher scenario:
<br /> ![image.png](/.attachments/image-fc4d1624-564a-44e8-be3f-5cb61e9f0516.png)

- Please run the Troubleshooting tool when you experience an issue to diagnose it further. If additional support is required, use the tool to collect the logs and provide it to the Support team as part of the support request.

- The troubleshooting tool is interactive and requires manual intervention for diagnosis and log collection as directed by the on-screen instructions.

- Upon completion, tool opens the folder where the final zip file is stored and outputs the log file's absolute path. 

- Tool execution logs are outputted to the console as well as written to a log file. 
- Manually collect .net version running on windows following article [How to find out dotnet version installed on windows](/Monitor-Agents/Agents/How%2DTo/General/How-to-find-out-dotnet-version-installed-on-windows)