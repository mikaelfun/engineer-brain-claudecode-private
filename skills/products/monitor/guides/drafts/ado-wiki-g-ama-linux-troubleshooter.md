---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/How-To/How to use troubleshooting Tool for Azure Monitor Linux Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Azure%20Monitor%20Agent%20%28AMA%29%20for%20Linux/How-To/How%20to%20use%20troubleshooting%20Tool%20for%20Azure%20Monitor%20Linux%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Use AMA Troubleshooter on Linux

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

**Troubleshooting Tool for Azure Monitor Linux Agent**

The Azure Monitor Agent Troubleshooter is designed to help diagnose issues with the agent, and general agent health checks. It can run checks to verify agent installation, connection, general heartbeat, and collect AMA-related logs automatically from the affected Windows or Linux VM. More scenarios will be added over time to increase the number of issues that can be diagnosed.

The [Linux Troubleshooter Public Doc](https://learn.microsoft.com/azure/azure-monitor/agents/use-azure-monitor-agent-troubleshooter#linux-troubleshooter).

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note!**

Troubleshooter is a command line executable that is shipped with the agent for all versions newer than 1.12.0.0 for Windows and 1.25.1 for Linux. If you have a older version of the agent, you can not copy the Troubleshooter on in to a VM to diagnose an older agent.
 
</div>



# Prerequisites
- Ensure that the AMA agent is installed by looking for the directory /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-* on the Linux agent.

- The linux Troubleshooter requires Python 2.6+ or any Python3 installed on the machine. In addition, the following Python packages are required to run (all should be present on a default install of Python2 or Python3):

![image.png](/.attachments/image-1edf86ff-42fd-4cd5-9e23-92b459ce335a.png)

# Run Linux Troubleshooter

- Log in to the machine to be diagnosed

- Go to the location where the troubleshooter is automatically installed: cd /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/ama_tst

- Run the Troubleshooter: sudo sh ama_troubleshooter.sh

There are six sections that cover different scenarios that customers have historically had issues with. By enter 1-6 or A, customer is able to diagnose issues with the agent. Adding an L creates a zip file that can be shared if technical support in needed.

# Evaluate Linux Results
The details for the covered scenarios are below:

![image.png](/.attachments/image-3a87b06e-9c70-4368-80f6-66844c76ac70.png)

# Share Linux Logs
To create a zip file use this command when running the troubleshooter: 
sudo sh ama_troubleshooter.sh 

You'll be asked for a file location to create the zip file.

# Agent installation issue
 If you don't have agent extension installed and you are investigating installation issue then you can download older AMA Linux Troubleshooter and run by following the steps below.


```
Copy the troubleshooter bundle onto your machine: wget https://github.com/Azure/azure-linux-extensions/raw/master/AzureMonitorAgent/ama_tst/ama_tst.tgz
Unpack the bundle: tar -xzvf ama_tst.tgz
Run the troubleshooter: sudo sh ama_troubleshooter.sh
```







