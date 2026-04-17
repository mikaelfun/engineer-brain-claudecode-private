---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Test connectivity to endpoints"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Test%20connectivity%20to%20endpoints"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
The Azure Monitor Agent (AMA) must be able to connect to certain endpoints in order to properly function. The required endpoints are listed [here](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-network-configuration?tabs=PowerShellWindows#firewall-endpoints).

In general, connectivity can be evaluated in three steps:
- Is our DNS server giving us the correct IP address to connect to?
- Is our client able to [TCP handshake](https://learn.microsoft.com/troubleshoot/windows-server/networking/three-way-handshake-via-tcpip) to the server?
- Are the client and the server able to agree on encrypted communication via [TLS handshake](https://auth0.com/blog/the-tls-handshake-explained/)?

# Step 1: What should we be talking to?
First, let's make sure we understand how the agent **should** be communicating.
- [Is there a Data Collection Endpoint (DCE) associated?](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs)
    - If so, take note of the Configuration Access URL and the Logs Ingestion URL
![image.png](/.attachments/image-6d25974e-1309-49af-a3a1-6fed281495d5.png)
- [Is AMPLS associated?](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585647/AMA-HT-Check-AMPLS-configuration)
    - If so, take note of the private IP addresses the agent should be resolving
- [Is the agent communicating through a proxy server?](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585649/AMA-Windows-HT-Check-agent-proxy-settings)
    - If so, take note of the proxy server and port

# Step 2: DNS Resolution
Verify that we can resolve the correct IP addresses.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note:** 
If we are in a proxy scenario, the client will perform the DNS lookup if one of two conditions are true:
- The hostname of our target (for example global.handler.control.monitor.azure.com) is in the bypass list
- **Any** IP address is in the bypass list (the client will perform a DNS lookup prior to connecting to the proxy server to see if the target name resolves to an IP address in its bypass list).

Otherwise, the proxy server will perform the DNS lookup, so the results we acquire from the client machine may not accurately indicate the IP address. For instance, if the customer uses a cloud-based proxy server, such as Zscaler, the cloud service won't likely resolve private IP addresses for an AMPLS scenario.
</div>

- When we run the following commands, do we see **any results**?

```nslookup global.handler.control.monitor.azure.com ```
```nslookup {vmRegion}.handler.control.monitor.azure.com```
```nslookup {workspaceId}.ods.opinsights.azure.com```

Only required if a Data Collection Endpoint (DCE) is associated with the VM or DCR:
```nslookup {dcename}-{dceRandomId}.{region}.handler.control.monitor.azure.com```
```nslookup {dcename}-{dceRandomId}.{region}.ingest.monitor.azure.com```

Only required if we are sending to Azure Monitor Metrics:
```nslookup management.azure.com```
```nslookup {vmRegion}.monitoring.azure.com```

- If AMPLS is associated, do we see the **private IP addresses** from step 1?

Example of public address:
![image.png](/.attachments/image-e184956f-6a82-447a-8c96-2062b9de0a00.png)


Example of private address:
In Class A, the address range assigned to Private IP Address: 10.0.0.0 to 10.255.255.255
In Class B, the address range assigned to Private IP Address: 172.16.0.0 to 172.31.255.255
In Class C, the address range assigned to Private IP Address: 192.168.0.0 to 192.168.255.255

![image.png](/.attachments/image-d8236da9-86b3-4a18-87c1-6ca9acea8ecd.png)

Example of a failure:
![image.png](/.attachments/image-c9f14fcf-0b2d-421b-b54c-6442cddf434d.png)

# Step 3: Testing Connectivity
- When we run the following command, do we see **Connected to**?

```C:\Windows\system32\curl.exe -v -s -S -k https://global.handler.control.monitor.azure.com/ping```

![image.png](/.attachments/image-0bcb300b-c130-4f19-980a-0482c848e991.png)

On these below, we expect to see a 404, but this is still a successful indication of connectivity:
```C:\Windows\system32\curl.exe -v -s -S -k https://{workspaceId}.ods.opinsights.azure.com/ping```
```C:\Windows\system32\curl.exe -v -s -S -k https://{workspaceId}.oms.opinsights.azure.com/ping```
```C:\Windows\system32\curl.exe -v -s -S -k https://{dceName}.{region}.ingest.monitor.azure.com/ping```

![image.png](/.attachments/image-232f55cd-c4f5-4c0f-9a79-544b8ae60112.png)

If a proxy is defined, we can use a command like this:
```C:\Windows\system32\curl.exe -v -s -S -k https://global.handler.control.monitor.azure.com/ping -x {proxyServerIP}:{proxyPort}```

![image.png](/.attachments/image-c578100f-5752-48dd-859d-d50b8ba5bf01.png)

Example of a failure related to TCP:
![image.png](/.attachments/image-cef629a0-906d-461b-9036-be22db323ffa.png)

Example of a failure related to SSL/TLS:
![image.png](/.attachments/image-1e6913b7-5b66-4957-9b7a-399d0cb967cc.png)

- If we don't have curl, use the following command instead:

```Invoke-WebRequest -Uri "https://global.handler.control.monitor.azure.com/ping"```

![image.png](/.attachments/image-c80b4872-775f-4ab7-9b25-8ba5eb9e0d17.png)

If a proxy is defined AND we don't have curl, use the following command instead:

```Invoke-WebRequest -Uri "https://global.handler.control.monitor.azure.com/ping" -Proxy http://{proxyServerIP}:{proxyPort}```

![image.png](/.attachments/image-d867f03e-6386-4f5d-a46c-7d61fa29cae0.png)

Example of a failure related to TCP:
![image.png](/.attachments/image-5f6e463e-bf14-47be-abd1-3e3c1734eef0.png)

Example of a failure related to SSL/TLS:
![image.png](/.attachments/image-07008ae2-b455-43c6-a129-102fbfa65632.png)

# Review Related Logs
## Get a configuration
**MonAgentManager.exe** logs are found here:
```VM: C:\WindowsAzure\Resources\AMADataStore.{hostname}\Configuration\MonAgentHost.*.log```
```ARC: C:\Resources\Directory\AMADataStore.{hostname}\Configuration\MonAgentHost.*.log```
```...\AgentTroubleshooterOutput-{date}\AgentDataStore\Configuration\MonAgentHost.*.log"```

- Start MonAgentManager.exe
```Info  (2024-04-09T17:22:55Z): MonAgentHost.exe - Starting agent manager: 'C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.24.0.0\Monitoring\Agent\MonAgentManager.exe -serviceShutdown MonAgentShutdownEvent.1384 -parent 1384 -deploymentdir "C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.24.0.0\Monitoring\Agent" -LocalPath "C:\WindowsAzure\Resources\AMADataStore.{hostname}" "-mcsmode" "-ShutDownEvent" "AzureMonitorAgentExtension-ShutdownEventName" "-TotalShutDownEvent" "AzureMonitorAgentExtension-TotalShutdownEventName" "-InitializedEvent" "AzureMonitorAgentExtension-StartAgentEventName" -LogPath "C:\WindowsAzure\Resources\AMADataStore.{hostname}\Configuration\MonAgentHost.*.log"'```

- Initialize MCS
```Info  (2024-04-09T17:22:55Z): MonAgentManager.exe - Initializing McsManager using mcsRegionalEndpoint=https://{region}.handler.control.monitor.azure.com,mcsGlobalEndpoint=https://global.handler.control.monitor.azure.com,azureResourceEndpoint=https://monitor.azure.com/,m_MonAgentVersion=46.15.01,customResourceId=,ManagedIdentity=,AADMode=false,aadClientId=,aadAuthority=,aadResource=,aadDomain=,proxyMode=system,proxyAddress=,proxyAuth=false```

- MCS results
```Info  (2024-04-09T17:22:55Z): MonAgentManager.exe - McsManager successfully initialized```

- Confirmation that MSI token was acquired and associated expiration date
```Info  (2024-04-09T17:22:55Z): MonAgentManager.exe - Next refresh of MSI token for MCS in 83709 seconds```

- If DCE is associated, MCS redirects to DCE
```Info  (2024-04-09T17:22:55Z): MonAgentManager.exe - Response from Mcs Network Call (endpoint https://global.handler.control.monitor.azure.com fullPath locations/{region}/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{VMName}/agentConfigurations query platform=windows&includeMeConfig=true&api-version=2022-06-02). Response: {"error":{"code":"MisdirectedAgentRequest","message":"Agent configuration needs to be acquired from 'https://{dce}.handler.control.monitor.azure.com' endpoint which was configured for this resource."}} StatusCode:421```

- Configuration acquired from regional handler or DCE handler
```Info  (2024-04-09T17:23:00Z): MonAgentManager.exe - Response from Mcs Network Call (endpoint https://{region/DCE}.handler.control.monitor.azure.com fullPath locations/{region}/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{VMName}/agentConfigurations query platform=windows&includeMeConfig=true&api-version=2022-06-02). Response: {"configurations":[{"configurationId":...```

## Send data to destinations
- Connection to ingest endpoint (ODS, DCE)

**MAQosEvent.csv** logs are found here:
```...\AgentTroubleshooterOutput-{date}\AgentDataStore\Tables\MAQosEvent.csv"```

Failures will have a "FALSE" value in the success column. Use the timestamp to find the error in the MAEventTable.csv below.

![image.png](/.attachments/image-70254650-8d93-48cc-b747-a2aca759bd7a.png)

**MAEventTable.csv** logs are found here:
```...\AgentTroubleshooterOutput-{date}\AgentDataStore\Tables\MAEventTable.csv```

Failures will look something like this:
```
Starting scheduled task...
Failed to complete all tasks with exception: WinHttpSendRequest: 12029: A connection with the server could not be established
ODS chunk transmit failed to workspace ID xxxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx
```


# Common Errors
#77672
#72324
#71718
#72435
#90066
#72326
#77832
#78594
#97654
#105177
#107391
