---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/Troubleshooting Guides/Troubleshooting OMS Linux Agent Crash"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/Troubleshooting%20Guides/Troubleshooting%20OMS%20Linux%20Agent%20Crash"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]
# Scenario
---
The Customer has an issue with a Linux Log Analytics agent where it's crashing after successful installation.  
Please update your Case SAP to Azure/Log Analytics agent (MMA and OMS)/Linux Agents/Linux agent is crashing

# Issue Frequency
In order to scope better we need to learn the frequency of the crash.

**1- Crashes that happen only once.**
This type of crashes has two categories.
  - Agent at some point may have crashed and successfully restarted. You can run following command and check if agent is running ps aux | grep omsagent  

```
 [Servername]$ ps aux | grep omsagent
omsagent    1454  0.1  1.3 241980 43620 ?        Sl   19:35   0:00 /opt/microsoft/omsagent/ruby/bin/ruby /opt/microsoft/omsagent/bin/omsagent -d /var/opt/microsoft/omsagent/39a58750-5e36-4d71-b835-e0161885849e/run/omsagent.pid -o /var/opt/microsoft/omsagent/39a58750-5e36-4d71-b835-e0161885849e/log/omsagent.log -c /etc/opt/microsoft/omsagent/39a58750-5e36-4d71-b835-e0161885849e/conf/omsagent.conf --no-supervisor
omsagent    1539  0.0  0.3 202728 10264 ?        Sl   19:35   0:00 /opt/omi/bin/omiagent 11 13 --destdir / --providerdir /opt/omi/lib --loglevel WARNING
irfanr      6991  0.0  0.0  12108  1068 pts/0    R+   19:40   0:00 grep --color=auto omsagent

```
  - Agent did not restart successfully and you manually restart agent via command
sudo /opt/microsoft/omsagent/bin/service_control restart

```
[Servername]$ sudo /opt/microsoft/omsagent/bin/service_control restart

```


"In both of the above two categories, since the data loss for customer environment happened for a short time, the issue becomes low priority and no need to file an ICM as the agent was recovered and issue mitigated."

- Restart VM should be considered as an option for mitigation if omsagent service restart fails as it is most likely caused by VM being in a bad state.


**2- Crashes that happen more than once (frequent).**
 
If agent upon successful restart crash again then we need to capture

- How long it takes for agent process to crash after restart?
  - If its frequent crash, we can monitor this after restarting agent every few minutes run via command ps aux | grep omsagent 

- Was agent consuming high memory or CPU?
- Did customer recently enabled a new Solution in workspace that is impacting this Linux agent? (ASC can show this information workspace).
- Can customer repro issue if agent connects to new workspace with no solutions?
  - This identify if issue is due to some solution or actually in agent code?

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

**Note**
Omsagent.log in case of crashes has ruby error stack that shows what plugin or method caused the crash (it could be an exception from fluent, ruby or omsagent layer). Collecting logs is important if it is crash scenario.
</div>
# Checking Agent installed Version
- Ensure that you're running the [latest version of the agent.](https://docs.microsoft.com/azure/virtual-machines/extensions/oms-linux?WT.mc_id=Portal-Microsoft_Azure_Support#agent-and-vm-extension-version) 

- You can see if you have the latest version by running sudo sh ./omsagent-*.universal.x64.sh --version-check on the machine. 

```
[Servername]$ sudo sh ./omsagent-*.universal.x64.sh --version-check
Extracting...
omsagent       1.14.9.0       1.14.9.0       No
omsconfig      1.1.1.931      1.1.1.931      No
omi            1.6.8.1        1.6.8.1.ulinux No
scx            1.6.8.1        1.6.8.1        No
apache-cimprov None           1.0.1.10       Yes
mysql-cimprov  None           1.0.1.5        Yes
docker-cimprov    None           1.0.0.39       Yes
Shell bundle exiting with code 0
[Servername]$

```


# Upgrading to latest build
If you are not running the latest version, you can upgrade by following instructions in [doc](https://learn.microsoft.com/azure/azure-monitor/agents/agent-manage?tabs=PowerShellLinux#upgrade-the-linux-agent)  

If you notice that the OMS agent for Linux is crashing frequently with latest version, it's time to collect data and engage PG via [ICM](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ci3v1e).

# Log/Additional Data Collection:

- Run the Agent [Troubleshooter.](https://docs.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot?WT.mc_id=Portal-Microsoft_Azure_Support#log-analytics-troubleshooting-tool)

-  This is installed with the agent and catches most issues. In addition, the troubleshooter collects diagnostic logs, which will save you days of back and forth with Support.

- Once data is collected, have it reviewed with an agent SME if available otherwise with TA approval raise an ICM through Azure support center following ICM template ( we should see an ICM template if we have correct SAP in case ). 


#Additional Learnings
[Supported Linux distros and versions](https://learn.microsoft.com/azure/azure-monitor/agents/agents-overview#linux)
[Linux agent troubleshooting guide](https://docs.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot?WT.mc_id=Portal-Microsoft_Azure_Support)