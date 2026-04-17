---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/How-To/How To run  AgentTroubleshooter.exe for AMA - Windows"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Azure%20Monitor%20Agent%20%28AMA%29%20for%20Windows/How-To/How%20To%20run%20%20AgentTroubleshooter.exe%20for%20AMA%20-%20Windows"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Run AgentTroubleshooter.exe for AMA (Windows)

:::template /.templates/Common-Header.md
:::
[[_TOC_]]
Applicable to AMA Windows version 1.12.1.0 or higher

# AMA - Windows Logs Collection  
AgentTroubleshooter.exe is a command line tool built in Csharp for CSS to troubleshoot & collect data when investigating AMA data collection issues on Windows.

<details closed>
<summary><b>Agent Troubleshooter Location</b></summary>
<div style="margin:25px">
 
 C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.12.1.0\Troubleshooter\
Please note that 1.12.1.0 is agent extension number. In your customer case it may be a different higher version.
![image.png](/.attachments/image-067f2d27-f4ae-4223-b10a-300ed7b38fbe.png)

</details>



<details closed>
<summary><b>Running AgentTroubleshooter.exe</b></summary>
<div style="margin:25px">
 
Open an administrative command prompt and have customer run AgentTroubleshooter.exe with --ama switch 

The --ama switch is used for AMA agent used by commercial customers.

![image.png](/.attachments/image-28d1b0be-5816-4cdd-b99c-da7d71acee93.png)

</details>

# Troubleshooter Zip file 

- From following folder we should be able to locate troubleshooterOupt.zip file.
- Before raising an ICM or bringing question to Case bash, content of this folder should be analyzed by support engineer / TA or SME.

![image.png](/.attachments/image-d3464894-4f5b-42b4-822e-cf0bb757c9cd.png)

# Evaluate Results
The Troubleshooter runs two tests and collects several diagnostic logs.
![image.png](/.attachments/image-b0f748f1-8561-46f6-a0d5-c513823db5cf.png)

# Share the Windows Results
The detailed data collected by the troubleshooter include system configuration, network configuration, environment variables, and agent configuration that can aid the customer in finding any issues. The troubleshooter make it easy to send this data to customer support by creating a Zip file that should be attached to any customer support request. The file is located in C:/Packages/Plugins/Microsoft.Azure.Monitor.AzureMonitorWindowsAgent/{version}/Troubleshooter. The agent logs can be cryptic but they can give you insight into problems that you may be experiencing.

![image.png](/.attachments/image-56b3aafe-c4d5-4406-8d86-0b53b1b66235.png)

# ARC Server Logs:
For issues with the AMA agent on ARC Servers you should also gather the Arc logs by running **azcmagent logs** from an administrative command prompt. 
- [How to collect Arc logs from a customer](https://supportability.visualstudio.com/AzureArcforServers/_wiki/wikis/AzureArcenabledservers.wiki/807393/HT-Collect-Logs-from-Customer-VMs)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**
Collecting Arc logs will help reduce the wait time when raising an IcM for a customer using AMA on an Arc VM.
</div> 

# Additional Information
Use the Azure Monitor Agent Troubleshooter
https://learn.microsoft.com/azure/azure-monitor/agents/use-azure-monitor-agent-troubleshooter

