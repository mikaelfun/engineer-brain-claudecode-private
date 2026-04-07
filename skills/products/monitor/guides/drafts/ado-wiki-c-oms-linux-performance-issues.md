---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/Troubleshooting Guides/Troubleshooting OMS Agent for Linux Performance Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/Troubleshooting%20Guides/Troubleshooting%20OMS%20Agent%20for%20Linux%20Performance%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
The Customer has an issue with a Linux Log Analytics agent where OMS Agent for Linux is impacted with Performance issues.  



#Recommended Steps
If you notice that the OMS agent for Linux is crashing frequently, try the following:

1. Run the Agent [Troubleshooter.](https://docs.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot?WT.mc_id=Portal-Microsoft_Azure_Support#log-analytics-troubleshooting-tool)

1.  This is installed with the agent and catches most issues. In addition, the troubleshooter collects diagnostic logs, which will save you days of back and forth with Support. Raise an [ICM](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ci3v1e) for OMS agent for linux 
1. If possible, work with customer on purge , Agent cleanup & reinstall. ( this will remove any possibility of finding a root cause though)

**If the OMI process is consuming a high amount of CPU resources, try the following:**

- Make sure you are running the [latest version of the agent.](https://docs.microsoft.com/azure/virtual-machines/extensions/oms-linux?WT.mc_id=Portal-Microsoft_Azure_Support#agent-and-vm-extension-version) 

To determine which version is installed on the machine, run the command:

     sudo sh ./omsagent-*.universal.x64.sh --version-check 

If the machine is not running the latest version, please upgrade it by running this command:

     sudo sh ./omsagent-*.universal.x64.sh --upgrade 

- Restart the OMI server daemon on the machine by running this command:

sudo /opt/omi/bin/service_control restart

- Restart the machine

If issue is not resolved please follow the TSG before raising an ICM. 
[Troubleshooting Issues related to high CPU or Memory consumption by OMS Agent or its subcomponents](/Agents/OMS-Agent-for-Linux-\(omsagent\)/Troubleshooting-Guides/Troubleshooting-Issues-related-to-high-CPU-or-Memory-consumption-by-OMS-Agent-or-its-subcomponents)

# Raising an ICM with Product Group
- Please capture data wile issue is happening using agent troubleshooter
- Analyze data with an agent SME and raise an icm using template
- Make sure your case SAP is Azure/Log Analytics agent (MMA and OMS)/Linux Agents/Linux agent performance issues
- Use ASC to raise an ICM with PG.
- If ASC icm template not available, you can follow  [How to open a CRI (ICM) when Azure Support Center is down](/Azure-Monitor/How%2DTo/ICM/How-to-open-a-CRI-\(ICM\)-when-Azure-Support-Center-is-down)
 
#Recommended Documents
[Supported Linux distros and versions](https://docs.microsoft.com/azure/virtual-machines/extensions/oms-linux?WT.mc_id=Portal-Microsoft_Azure_Support#operating-system)

[Linux agent troubleshooting guide](https://docs.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot?WT.mc_id=Portal-Microsoft_Azure_Support)