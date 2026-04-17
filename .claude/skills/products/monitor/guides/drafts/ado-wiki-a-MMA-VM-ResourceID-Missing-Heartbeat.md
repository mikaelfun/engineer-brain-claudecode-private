---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting MMA VM Resource ID missing in Heartbeat Table"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/Troubleshooting%20Guides/Troubleshooting%20MMA%20VM%20Resource%20ID%20missing%20in%20Heartbeat%20Table"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

# **Scenario**
Azure VM Resource ID is missing in Heartbeat table.

# **What is impact**
In Azure Security Center, the VM will show as 'Unhealthy', see [azure security troubleshooting guidelines](https://dev.azure.com/SupportabilityWork/Azure%20Security/_wiki/wikis/Azure%20Security%20Center%20CSS%20wiki/2029/Azure-Resource-Id?anchor=azure-resource-id)

# **Troubleshooting steps**

**Step 1 - Check for the Azure Resource Id in the Heartbeat data**

Run the following query against the customers workspace in Azure Support Center to get the latest Heartbeat data for a VM:

	Heartbeat
	| where Computer has "<VMName>"
	| summarize arg_max(TimeGenerated, *)
	| project TimeGenerated, Computer, ResourceId
 
If Log Analytic Agent is not working or heartbeat is missing, follow [Troubleshooting MMA Missing Heartbeats](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-MMA-Missing-Heartbeats) or [Linux Agents Install Issues and Missing Heart Beats](/Monitor-Agents/Agents/OMS-Agent-for-Linux-\(omsagent\)/Troubleshooting-Guides/Troubleshooting-OMS-Agent-Install-Issues-&-Missing-Heartbeats) to fix agent issue.

**Important note**: if cx has SCOM integration, resource ID is not supported for old SCOM agent like SCOM2016, SCOM 2019 Agent or later is supported.

**Step 2 - Manually check access to the Azure Instance Metadata Service**

Check access to the Azure Instance Metadata Service by running the following PowerShell command on a Windows VM:
- Invoke-RestMethod -Headers @{"Metadata"="true"} -URI http://169.254.169.254/metadata/instance?api-version=2017-08-01 -Method Get

On a linux VM:
- curl -H Metadata:true --noproxy "*" "http://169.254.169.254/metadata/instance?api-version=2017-08-01&format=text"

If the command fails, it indicates some issue accessing to IMDS, then verify if a route exists for 169.254.169.254: 
- Windows command: route print

![image.png](/.attachments/image-0cef182d-216e-44c3-a664-d1e6bf69062b.png)
- Linux command: netstat -r

![image.png](/.attachments/image-3bab865b-e8a7-4d5d-8094-d7eb3b3ebfe7.png)

If it doesn't exist for 169.254.169.254, run the following command and use the address of the Interface for Network Destination (0.0.0.0), which is (10.0.1.10) in this example:
- route add 169.254.169.254/32 10.0.1.10 metric 1 -p

see this [debugging guidelines of IMDS](https://docs.microsoft.com/azure/virtual-machines/windows/instance-metadata-service?tabs=windows#errors-and-debugging) for details;

If you aren't able to get a metadata response after manually added this IP 169.254.169.254, then engage **Azure VM team** to assist;
Once IMDS is working but still unable to access to IMDS, engage **windows network team** to assist firstly, later may engage **windows AD team** to assist if there is issue with SSL/TLS session;

**Step 3 � check if the data synced to Azure security center**

Run the following query against our telemetry in Kusto data explorer to check the data synced to Azure Security Center:

	cluster('RomeLogs').database("RomeLogs").HybridOmsHealthMonitoringOE
	| where ComputerName has "<VMName>"
	| summarize arg_max(env_time, *)
	| project env_time, ComputerName, AzureResourceId
If this command doesn't return all data, then there is some issue with data sync in Azure security center, then engage **Azure security team** to assist.
