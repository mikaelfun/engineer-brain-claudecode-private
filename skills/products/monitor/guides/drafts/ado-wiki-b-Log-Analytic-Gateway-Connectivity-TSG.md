---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting Log Analytic Gateway Connectivity"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/Troubleshooting%20Guides/Troubleshooting%20Log%20Analytic%20Gateway%20Connectivity"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

Note: All IPs and machine names in this page are from test lab and dont compromise any Pii data.
# Scenario
---
The customer reports one or combination of the following issues.
- Log Analytic Gateway is unable to connect to Workspace.
- Agent unable to connect to workspace when configured to use Log Analytic Gateway as proxy. 


# Check List
------------
Before data collection and initial investigation we must be clear which [Log Analytic Gateways & Supported Scenarios](/Monitor-Agents/Agents/Common-Concepts/Log-Analytic-Gateways-&-Supported-Scenarios) are we investigating?

We must document following information collected from customer or via Azure Support Center first. 

- Which [Log Analytic Gateways & Supported Scenarios](/Monitor-Agents/Agents/Common-Concepts/Log-Analytic-Gateways-&-Supported-Scenarios) are we working on?
- Confirm if Gateway is using company proxy as Relay proxy [Checking Relay Proxy on Log Analytic Gateway](/Monitor-Agents/Agents/Common-Concepts/Checking-Relay-Proxy-on-Log-Analytic-Gateway) to route data traffic to azure.
- What is the Name, Operating system version and MMA agent version of Gateway Machine?
- Workspace name, workspace Id, subscription Id of the workspace.
- Its always helpful to check if machine has any browser level proxy configured. You can run PowerShell cmdlet to verify this.

Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' | findstr ProxyServer

![image.png](/.attachments/image-9f3a5a87-93aa-4529-895b-254c5e7b99ef.png)
 # Important Notes

The good news is that most of the time when troubleshooting Gateway Scenarios, we are actually either troubleshooting MMA agent of Windows Machines or MMA agent of gateway Server. 

Very rare it happens that we investigate OMS Gateway Service. 

It is importamt to know what data type is not being uploaded? Because TSG for missing HB or Event collection or Perf Counters are different. For MMA Agent troubleshooting's "depending on scenarios" please use TSGs available [Troubleshooting Guides](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides)

We can always consult OMS Gateway issues with Agent SMEs or later escalate to product group but clarity on which[Log Analytic Gateways & Supported Scenarios](/Monitor-Agents/Agents/Common-Concepts/Log-Analytic-Gateways-&-Supported-Scenarios) we are investigating and which MMA agent is in question is a must have.

# Troubleshooting steps
---
If we are troubleshooting Agents unable to connect workspace via gateway then always start investigation with Gateway machine first. Make sure gateway is ...
- Confirm that Gateway is running MMA agent.(This is a very common mistake that System Admins install Gateway software without MMA agent on machine)
- Make sure Agents behind gateway should be configured for same workspace.
- Confirm that Gateway machine is successfully and consistently uploading Heartbeats and some other data types like Windows Events or Perf counters to workspace. If Gateway is unable to upload Heartbeats to workspace then we focus on Troubleshooting  MMA agent on gateway using [Troubleshooting MMA Missing Heartbeats](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-MMA-Missing-Heartbeats) TSG.
- Learn OMS gateway is running at which port number on gateway server via following PowerShell cmdlet on gateway machine.

![image.png](/.attachments/image-e047fe9b-8aa2-4a8b-817f-37832904575f.png)
- Same information is available on gateway machine under following registry path.
 HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\services\ForwarderService\Configurations
- Once we learn gateway machine name and port number let's make sure MMA Agents behind gateway should be able to connect to gateway IP & Port. We can use telnet utility via command line on that MMA agent machine.

![image.png](/.attachments/image-676ce68f-b96f-4df4-bda3-64c2ea877c0a.png)
- If command line window goes blank that means we are successfully able to connect to gateway ip and its port number.

![image.png](/.attachments/image-13c7e8c6-d19a-4403-9718-d558ef0e43d8.png)

- Please do make sure MMA Agent machine is not configured for some Winhttp Computer level proxy because that can override MMA agent proxy settings.

From MMA agent machine open command prompt and run netsh winhttp show proxy

![image.png](/.attachments/image-0699fbda-0e51-4545-ae83-cca9084941e8.png)



# Data Collection
- If troubleshooting on Gateway "Agent unable to upload its own heartbeat to workspace" then collect MMA agent traces using [Windows Support Tool Guide](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/Windows-Support-Tool-Guide). Choose Scenario 1. 
- If Gateway Agent is successfully uploading its own heartbeats but Gateway is unable to route Network MMA agents data to workspace then using Windows Support Tool should Collect Logs for Agent Troubleshooting scenario 7 {OMS Gateway Issue}. 

![image.png](/.attachments/image-e87f562b-84fb-45e5-b47f-81c2149c9bec.png)



---
