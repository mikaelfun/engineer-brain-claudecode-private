---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to retrieve MMA installation logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/How-To/How%20to%20retrieve%20MMA%20installation%20logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

# Scenario
---
If a manual installation of the MMA agent is being made, several issues can occur during this process, and the agent is not installed at all leaving no logging data (at least the most common logs such as the Operations Manager in Event Viewer). For this specific scenarios, there is a set of installation logs that you can ask to have a better understanding of the failure
 
# High level steps
---
- [ ] Download and extract the agent file
- [ ] Install the agent through a windows command to generate the installation logs

## Download and extract the agent file

1. Head to the workspace on the portal then **Settings - Agents-Windows Servers-Log Analytics agent instructions** and download the 32 or 64 version of the agent

![image.png](/.attachments/image-2820fbcb-ca09-42f1-bd67-7283f7d391be.png)

2. To extract the agent installation files, from an elevated command prompt run MMASetup-<platform>.exe /c and it will prompt you for the path to extract files to. Alternatively, you can specify the path by passing the arguments MMASetup-<platform>.exe /c /t:<Full Path>.

[Reference Doc](https://docs.microsoft.com/azure/azure-monitor/agents/agent-windows#install-agent-using-command-line) 



## Install the agent through a command prompt running as Admin to generate the installation logs

1. Open a **Command line console as administrator** and run:

```
msiexec.exe /i "MOMAgent.msi" /l*v "C:\Temp\MOMAgent_install.log"
```
Feel free to change the path where you want the logs to be generated to

2. After the file is generated, ask the customer to share it with you

3. During the analysis, try and look for "**error**" keywords that could indicate an issue, and research based on the findings

# References
---
[Download and install the Microsoft Monitoring Agent (MMA) setup file from Azure Log Analytics](https://docs.microsoft.com/services-hub/health/mma-setup#download-and-install-the-microsoft-monitoring-agent-mma-setup-file-from-azure-log-analytics)

[Install agent using command line](https://docs.microsoft.com/azure/azure-monitor/agents/agent-windows#install-agent-using-command-line)

