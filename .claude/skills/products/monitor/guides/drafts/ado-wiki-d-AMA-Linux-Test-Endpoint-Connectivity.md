---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Test connectivity to endpoints"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Test%20connectivity%20to%20endpoints"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
The Azure Monitor Agent (AMA) must be able to connect to certain endpoints in order to properly function. The required endpoints are listed [here](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-network-configuration?tabs=PowerShellLinux#firewall-endpoints).

In general, connectivity can be evaluated in three steps:
- Is our DNS server giving us the correct IP address to connect to?
- Is our client able to [TCP handshake](https://learn.microsoft.com/troubleshoot/Windows-server/networking/three-way-handshake-via-tcpip) to the server?
- Are the client and the server able to agree on encrypted communication via [TLS handshake](https://auth0.com/blog/the-tls-handshake-explained/)?

# Step 1: What should we be talking to?
First, let's make sure we understand how the agent **should** be communicating.
- [Is there a Data Collection Endpoint (DCE) associated?](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs)
    - If so, take note of the Configuration Access URL and the Logs Ingestion URL
![image.png](/.attachments/image-6d25974e-1309-49af-a3a1-6fed281495d5.png)
- [Is AMPLS associated?](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585647/AMA-HT-Check-AMPLS-configuration)
    - If so, take note of the private IP addresses the agent should be resolving
- Is the agent communicating through a proxy server?
    - Check AMA extension settings
    - In AMA version 1.36 ([work item](https://dev.azure.com/msazure/One/_workitems/edit/29069975)), the Troubleshooter will start to collect environment variables and output to troubleshooter files: *.../mdsd/mdsd_environ.txt* & *.../amalinux.out*. The http_proxy and https_proxy environment variables can be inherited by AMA.


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
![image.png](/.attachments/image-b8e7bc59-729b-498b-a13f-3f639d100b50.png)

Example of private address:
In Class A, the address range assigned to Private IP Address: 10.0.0.0 to 10.255.255.255
In Class B, the address range assigned to Private IP Address: 172.16.0.0 to 172.31.255.255
In Class C, the address range assigned to Private IP Address: 192.168.0.0 to 192.168.255.255

![image.png](/.attachments/image-2dc4e5d4-3477-49a8-961d-049bda52d242.png)

Example of a failure:
![image.png](/.attachments/image-a57a221b-f234-4b05-be1d-2e4083d781b0.png)

# Step 3: Testing Connectivity
- When we run the following command, do we see **Connected to**?

```curl -v -s -S -k https://global.handler.control.monitor.azure.com/ping```

![image.png](/.attachments/image-7ecf396f-92e9-451c-a09a-bf3f4e54661f.png)

On these below, we expect to see a 404, but this is still a successful indication of connectivity:
```curl -v -s -S -k https://{workspaceId}.ods.opinsights.azure.com/ping```
```curl -v -s -S -k https://{dceName}.{region}.ingest.monitor.azure.com/ping```

![image.png](/.attachments/image-6ae55d21-ca1b-44b7-accf-58b5f947a1a0.png)
![image.png](/.attachments/image-24adca2d-67f6-44e6-95dd-62e771833e18.png)

If a proxy is defined, we can use a command like this:
```curl -v -s -S -k https://global.handler.control.monitor.azure.com/ping -x {proxyServerIP}:{proxyPort}```

![image.png](/.attachments/image-17ce4b52-4516-47c3-8495-eaf48ccbc045.png)


Example of a failure related to TCP:
![image.png](/.attachments/image-4b50b37b-0f2f-4100-a4fe-757ea08993f0.png)

Example of a failure related to SSL/TLS:
![image.png](/.attachments/image-13107273-c9dc-4a3c-9954-8d702844ea54.png)
In the above example, TLS 1.0 was used to establish the TLS session which is not enabled on the endpoint.  
The endpoint correctly resets the connection to prevent an unsecure session.

# Review Related Logs
## Get a configuration
**mdsd.info** logs are found here:
```VM|ARC: /var/opt/microsoft/azuremonitoragent/log/mdsd.info```
```Troubleshooter: ...\mdsd\logs\mdsd.info```

- Start **mdsd**
```
2024-10-21T21:06:41.8540570Z: [DAEMON] START mdsd daemon ver(1.33.1) pid(62462) uid(104) gid (111)
```

- Initialize MCS
```
2024-10-21T21:06:42.2118810Z: Detected cloud region "eastus" via IMDS
2024-10-21T21:06:42.2119330Z: Detected cloud environment "azurepubliccloud" via IMDS; the domain ".com" will be used
2024-10-21T21:06:42.2295130Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/FetchIMDSMetadata.cpp:140,FetchMetadataFromIMDS]Setting resource id from IMDS: /subscriptions/{Subscription}/resourceGroups/{ResourceGroup}/providers/Microsoft.Compute/virtualMachines/{VMName}
```

- MCS results
```
2024-10-21T21:06:42.2295600Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/McsManager.cpp:428,Initialize]McsManager successfully initialized
2024-10-21T21:06:42.2302640Z: Parsing Mcs document /etc/opt/microsoft/azuremonitoragent/config-cache/mcsconfig.lkg.json
2024-10-21T21:06:42.2303170Z: Loaded Mcs document /etc/opt/microsoft/azuremonitoragent/config-cache/mcsconfig.lkg.json
```

- DCE used for ingestion
If Agent is associated with DCR that contains an ingestions DCE, this will be noted as follows

```
2024-10-21T21:07:18.8051780Z: GIGLAAgentTransform override url: https://{dceName}.ingest.monitor.azure.com/dataCollectionRules/{dcr Immutable ID}/streams/<STREAM>?api-version=2021-11-01-preview m_id: {dcr Immutable ID}.gigl-dce-1343780f3fee4586b832b23e02555edf
```

## Send data to destinations
- Connection to ingest endpoint (ODS, DCE)

**mdsd.qos** logs are found here:
```VM|ARC: /var/opt/microsoft/azuremonitoragent/log/mdsd.qos```
```Troubleshooter: ...\mdsd\logs\mdsd.qos```
Sample of mdsd.qos log:
```
#Fields: Operation,Object,TotalCount,SuccessCount,Retries,AverageDuration,AverageSize,AverageDelay,TotalSize,TotalRowsRead,TotalRowsSent
MaODSRequest,https://{workspaceID}_LogManagement_LINUX_PERF_BLOB,15,15,0,422000,6461.47,0,96922,9622,9622
MaODSRequest,https://{workspaceID}_LogManagement_LINUX_SYSLOGS_BLOB,1,1,0,302000,370,0,370,2,2
```
For a thorough review of mdsd.qos, see [AMA Linux HT: Review mdsd.qos](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710354/AMA-Linux-HT-Review-mdsd.qos)


**mdsd.err** logs are found here:
```VM|ARM: /var/opt/microsoft/azuremonitoragent/log/mdsd.err```
```Troubleshooter: ...\mdsd\logs\mdsd.err"```

Failures will look something like this:
```
2024-10-22T15:26:44.9291330Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/RefreshConfigurations.cpp:318,GetAgentConfigurations]Could not obtain configuration from https://global.handler.control.monitor.azure.com after first round of tries. Will try again with a fallback endpoint. ErrorCode:1310977
```
```
2024-10-08T03:07:07.2592520Z: Failed to upload to ODS: Request canceled by user., Datatype: {BlobType}, RequestId: 0f70cbe3-d8e4-4efe-b1ad-a27810308ccb
```

# Common Errors
#79129
#78301
#102457
#157491