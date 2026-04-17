---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/How-To/How To enable Proxy for AMA"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Azure%20Monitor%20Agent%20%28AMA%29%20for%20Windows/How-To/How%20To%20enable%20Proxy%20for%20AMA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Enable Proxy for AMA (Windows)

:::template /.templates/Common-Header.md
:::
**DRAFT in Review**

Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.


[[_TOC_]]
# Scenario
Azure Monitor Agent can use following two options to use Proxy agents when running on windows Operating system.


# Option 1

You can explicitly specify the proxy that AMA should use using the extension settings. Described [here](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-network-configuration?tabs=PowerShellWindows#proxy-configuration) 

# Option 2
You can let AMA use the system proxy by default. 

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**
AMA uses the cpprest SDK for making REST calls to its endpoints. Cpprest SDK is built over winhttp. When explicitly setting proxy value through extension settings or when using the system proxy by default, AMA relies on cpprest SDK to make the appropriate calls to winhttp. 
</div>

# How to set Windows System Proxy

Depending on Windows OS version your screenshot will be different. It will be under Network & Internet options.

![image.png](/.attachments/image-f6fe5097-1e5a-4f13-ab7c-92fbfa3d6728.png)

# How to determine whether AMA is using the Proxy

1. Login to the proxy machine and inspect the proxy logs.OR
2. You can run Wireshark to verify that AMA is using the proxy on the AMA machine. 

**Determine the ip address of the proxy machine.** 
![image.png](/.attachments/image-69eabecf-a1e7-44e7-8c08-4fdbff02ad5d.png)

- Install Wireshark and use the ip address determined above to filter the traffic to/from the proxy machine. 

![image.png](/.attachments/image-d04dbc11-5618-49ff-9f6e-0a03e2b2f307.png)
- Look for the CONNECT messages to AMA endpoints as shown below: 

**AMCS**
![image.png](/.attachments/image-e10e630f-180e-456a-8952-744e40b99ac9.png)

**NorthStar Endpoint**

![image.png](/.attachments/image-0ad3952d-4d0e-4cb3-8e0c-93a23b1be452.png)

**ODS Endpoint**
![image.png](/.attachments/image-a747a198-5bbf-44e3-9318-725b0020c963.png) 


