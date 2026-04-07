---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Check agent proxy settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Check%20agent%20proxy%20settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
Proxy servers can be used to allow clients to request a server to fulfill web requests on their behalf. When a proxy server is configured, we observe the following changes:
- In a network trace, communication from the client appears differently:
    - The client does not make a DNS request for the endpoint
    - The client does not perform a 3-way TCP handshake with the endpoint, but rather TCP handshakes with the proxy server
- Errors in the agent logs may be different than what we would observe with direct communication in the same scenario

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note:** 
Be sure to check the bypass-list. If our endpoints are listed in the bypass-list, then we are **not** in a proxy scenario.
</div>

# Step 1: Is a proxy server defined in the extension settings?
## Azure Portal - Virtual Machine
Portal > Virtual Machines > Select Machine > Overview > JSON View > Resources > AzureMonitorWindowsAgent > Settings > Proxy
![image.png](/.attachments/image-ce3c7a25-18d0-44af-ba22-c9713962b083.png)

## Azure Portal - Arc Machine
Portal > Azure Arc > Machines > Select Arc Machine > Overview > JSON View > Resources > AzureMonitorWindowsAgent > Settings > Proxy
![image.png](/.attachments/image-6c599d01-508d-42ac-90e5-128e4dc10e08.png)

## Azure Support Center (ASC) - Virtual Machine
ASC > Resource Explorer > Select Subscription > ARG Query Editor > Run the following query

```
resources
| where id contains "{VMName}"
| where type contains "microsoft.compute/virtualmachines/extensions"
| where properties.publisher == "Microsoft.Azure.Monitor"
| extend settings = properties.settings
| project id, type, name, settings
```

![image.png](/.attachments/image-cff0632f-a7ab-432b-b6ee-9373a194334f.png)

Results look like this:
![image.png](/.attachments/image-dfa6535d-35c9-4739-816e-4be9bd4b86cf.png)

## Azure Support Center (ASC) - Arc Machine
ASC > Resource Explorer > Select Subscription > ARG Query Editor > Run the following query

```
resources
| where id contains "{ArcMachineName}"
| where type contains "microsoft.hybridcompute/machines/extensions"
| where properties.publisher == "Microsoft.Azure.Monitor"
| extend settings = properties.settings
| project id, type, name, settings
```

![image.png](/.attachments/image-c6b7ef91-5773-4457-953d-587256a1596d.png)

Results look like this:
![image.png](/.attachments/image-673f3a49-2825-414d-9d2d-07302edef709.png)

## Virtual Machine
Open the following file:
```C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\RuntimeSettings\*.settings```

Example of proxy settings:
![image.png](/.attachments/image-ce0e2494-3a97-42fb-949c-2d5f304a648d.png)

## Arc Machine
Open the following file:
```C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\RuntimeSettings\*.settings```

Example of proxy settings:
![image.png](/.attachments/image-69516c3f-f018-4b02-834b-8b2b8afab457.png)

Open the following file:
```C:\ProgramData\AzureConnectedMachineAgent\Config\localconfig.json```

If there are proxy settings in the above file, the following will be observed in the VM extension logs (even if Arc is no longer installed or if Arc was accidentally installed on an Azure VM):

```C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\ExtensionHealth.*.log```
```C:\ProgramData\GuestConfig\extension_logs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\ExtensionHealth.*.log```

```[2024-05-29 09:07:38.000][GetArcProxyAddress] ErrorCode:0 INFO: expandedArcAgentConfigFilePath: C:\ProgramData\AzureConnectedMachineAgent\Config\localconfig.json```
```[2024-05-29 09:07:38.000][StartAzureMA] ErrorCode:0 INFO: Set environment variable MONITORING_PROXY_URL={proxyAddress}:{proxyPort} from Arc Agent's proxy settings```

# Step 2: Is a system proxy defined?
If proxy is defined for the local machine (as opposed to user context), you can use the following command to show it:
```
netsh winhttp show proxy
```

![image.png](/.attachments/image-ffb0257c-bf83-43bf-a941-9e63f3e7e9df.png)

Here is an example command of how a proxy bypass list can be defined:

```
netsh winhttp set proxy proxy-server="<proxyServerIP>:<proxyPort>" bypass-list="*.handler.control.monitor.azure.com;*.opinsights.azure.com;*.management.azure.com;*.monitoring.azure.com;*.ingest.monitor.azure.com"
```

These are all of the places in the registry where a proxy might be defined in Windows that could affect the Azure Monitor Agent:
```
Computer\HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\Connections
Computer\HKEY_USERS\S-1-5-20\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Connections
Computer\HKEY_USERS\.DEFAULT\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Connections
HKEY_USERS\.DEFAULT\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ProxyServer
```

The registry stores proxy values in hex. Here's an example of what that looks like:
![image.png](/.attachments/image-12935b28-1ca1-4761-9604-1abde08569f4.png)

# Step 3: How can a system proxy be defined?
Here are some examples of commands to set, show, and reset the proxy:

```
# Show existing proxy settings
netsh winhttp show proxy

# Set a proxy server with no bypass-list
netsh winhttp set proxy proxy-server="10.0.0.9:8080" 

# Set a proxy server with a bypass-list
netsh winhttp set proxy proxy-server="10.0.0.9:8080" bypass-list="*.mycorp.com; *.mydomain.local; 169.254.169.254"

# Remove all proxy settings
netsh winhttp reset proxy
```

In the past, we've seen that an agent is communicating through a proxy (by analyzing a network trace), but we had a difficult time identifying where in the registry this IP address was defined. The following command can help assess this:

```
# Reference: https://learn.microsoft.com/windows-server/administration/windows-commands/reg-query
# Param /f <data>: Specifies the data or pattern to search for. Use double quotes if a string contains spaces. If not specified, a wildcard (*) is used as the search pattern.
# Param /s: Specifies to query all subkeys and value names recursively.
# Param /t <Type>: Specifies registry types to search. Valid types are: REG_SZ, REG_MULTI_SZ, REG_EXPAND_SZ, REG_DWORD, REG_BINARY, REG_NONE. If not specified, all types are searched.

$ip = '10.0.0.9'
$hex = (($ip | Format-Hex).Bytes | %{'{0:X}' -f $_}) -join ""

cmd.exe /c "REG QUERY HKLM /f `"$hex`" /s /t REG_BINARY"
cmd.exe /c "REG QUERY HKLM /f `"$ip`" /s /t REG_SZ"
cmd.exe /c "REG QUERY HKU /f `"$hex`" /s /t REG_BINARY"
cmd.exe /c "REG QUERY HKU /f `"$ip`" /s /t REG_SZ"
```
