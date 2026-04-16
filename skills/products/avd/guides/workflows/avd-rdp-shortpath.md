# AVD RDP Shortpath — 排查工作流

**来源草稿**: ado-wiki-a-rdp-shortpath-public-script.md, ado-wiki-b-custom-shortpath-gpo-setting.md, ado-wiki-b-custom-shortpath-gpo.md, mslearn-rdp-shortpath-troubleshooting.md, onenote-avd-rdp-shortpath.md
**Kusto 引用**: rdp-core-events.md
**场景数**: 31
**生成日期**: 2026-04-07

---

## Scenario 1: Interpreting STUN Lookups Query
> 来源: ado-wiki-a-rdp-shortpath-public-script.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Type=<#> property is the type of candidate
   - 0=Host (ie: the local interface/private ip)
   - 1=STUN (ie: the public ip)
   - 2 = never used in this context
   - 3=TURN
   - 4=UPnP
<details>
<summary>Show me how</summary>
<p> Collect gpresult or MSRD-Collect on client computer and see if following GPO is enabled </p>
<li> GPO Path: Computer Configuration/Administrative Templates/Windows Components/Remote Desktop Services/Remote Desktop Connection Client </li>
<li> Policy: Turn Off UDP On Client </li>
<li> State: Enabled </li>
<br>
<p> Also check registry key weren't added manually </p>
<ol>
<li> <code> HKLM\SOFTWARE\Microsoft\Terminal Server Client\Default\fClientDisableUDP=1 (DWORD) </code> </li>
<li> <code> HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services\Client\fClientDisableUDP=1 (DWORD) </code> </li>
</ol>
<br>
<p> Kusto <p>
<li> Run <a href="https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/562826/Troubleshooting#client-blocks-udp-through-gpo">Client Blocks UDP through GPO</a> query </li>
<br>
<br>
<p> ASC </p>
<li> Go to hostpool > Connection Errors tab > Identify Activity ID of Connection </li>
<li> Go to tracing tab and paste Activity ID > For Tracing Type choose SxSStack > Run </li>
<li> Export results to Excel </li>
<li> Filter on columns</li>
</details>
---

## Scenario 2: Troubleshooting
> 来源: ado-wiki-a-rdp-shortpath-public-script.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. [Verify GPO is not blocking UDP traffic on Client](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/562826/Troubleshooting?anchor=verify-gpo-is-not-blocking-udp-traffic-on-client)
1. [Verify GPO is not blocking UDP traffic on VM](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/562826/Troubleshooting?anchor=verify-gpo-is-not-blocking-udp-traffic-on-vm)
1. Verify both client computer and AVD VM can talk to required endpoints per [Allow outbound UDP connectivity](https://docs.microsoft.com/en-us/azure/virtual-desktop/shortpath-public#allow-outbound-udp-connectivity).
1. If needed send collaboration task to Azure Networking to help confirm outbound UDP to endpoints are allowed.
1. Investigate using provided [Kusto Queries while referencing explanation of tasks being reported](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/562826/Troubleshooting?anchor=kusto-queries) to understand what the problem might be
1. If GPO's are not blocking UDP and network can talk to endpoints so create ICM

## Scenario 3: UDP Allowed with no Symmetric NAT (GOOD)
> 来源: ado-wiki-a-rdp-shortpath-public-script.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Will see IPs under discovered external endpoints and the IP's will be the SAME.
   - The IP's need to be the same to find the UDP path reliably
   - Ignore the error "Failed to communicate..check if InterNetworkV6 is configured", that just means IPv6 is not configured and/or enabled.

##### Troubleshooting:
1. No need to check GPO's because we know UDP is allowed and network can talk to endpoints so create ICM

## Scenario 4: UDP Allowed with Symmetric NAT (BAD)
> 来源: ado-wiki-a-rdp-shortpath-public-script.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Will see IPs under discovered external endpoints and the IP's will be DIFFERENT.
   - When the IP's are different then there is Symmetric NAT and chances of finding UDP path is very low to zero.
   - This means that it will not reuse the external port even though traffic comes from the same internal source.

##### Troubleshooting
1. Point the customer to our public doc explaining this is UNSUPPORTED SCENARIO [insert link]
1. There is no solution for this. In order for Shortpath Public to work with Symmetric NAT then connection will need UPnP or TURN protocols which are not available at GA and will come later. We cannot provide any timeline for UPnP or TURN.
1. If the customer does not except this answer and continues to push back create ICM.

## Scenario 5: UDP Connections are not using specified port range [Remove for GA - not going to support]
> 来源: ado-wiki-a-rdp-shortpath-public-script.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. By default, RDP Shortpath for public networks is using ephemeral port range (49152-65535) to establish a direct path between server and client.
1. Customers can configure AVD VM to use a smaller, predictable port range by adding a registry key
   - When you add registry key on AVD VM, the AVD client will randomly select the port from the range for every connection.
   - If the specified port range is exhausted, the client's operating system will choose a port to use.
   - When registry key is added the client will choose port from the range of 38300-39299
   - To enable a limited port range run the following command on the AVD VM:
   - `reg add HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services /v ICEEnableClientPortRange /t REG_DWORD /d 1 /f`
3. If the customer wants to change the port numbers, they can customize a UDP port range for the AVD client
   - When choosing the base and pool size, the customer needs to consider the number of ports setting to ensure that the upper bound does not exceed 49151.
   - For example, if you select 38300 as a port base and 1000 as pool size, the upper bound will be 39299.
   - To specify the port range, use the following commands on the AVD VM, substituting the base port and the number of ports.
   - `reg add HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services /v ICEClientPortBase /t REG_DWORD /d 38300 /f`
   - `reg add HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services /v ICEClientPortRange /t REG_DWORD /d 1000 /f`

## Scenario 6: Overview
> 来源: ado-wiki-b-custom-shortpath-gpo-setting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
This feature provides GPO-level control for RDP Shortpath transport policies via Intune or Group Policy.
Four types of Shortpath are available:
   - **Shortpath for managed networks**: Direct connectivity via VPN/ExpressRoute private peering (requires listener + inbound port on session host)
   - **Shortpath for managed networks via STUN**: Direct UDP using ICE/STUN without requiring inbound port
   - **Shortpath for public networks via STUN**: Direct UDP using STUN (no inbound ports required)
   - **Shortpath for public networks via TURN**: Relayed UDP via intermediate server (fallback when direct connection not possible)
Reference: [RDP Shortpath - Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/rdp-shortpath?tabs=public-networks)
This Custom GPO configuration is **optional** and can be used alongside the existing GPO to disable UDP entirely.
**Priority order**: VM-level GPO → Host pool setting → Default

## Scenario 7: Intune Configuration
> 来源: ado-wiki-b-custom-shortpath-gpo-setting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
In Intune Admin Center → Settings picker:
   - **Path**: Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Azure Virtual Desktop > **RDP Shortpath**
Policies available under RDP Shortpath:
1. Enable RDP Shortpath for managed networks (moved from Azure Virtual Desktop)
2. Use port range for RDP Shortpath for unmanaged networks (moved from Azure Virtual Desktop)
3. **Customize RDP Shortpath Network Configuration** — options:
   - RDP Shortpath for managed network using NAT traversal
   - RDP Shortpath for public network using NAT traversal
   - RDP Shortpath for public network using relay NAT traversal

## Scenario 8: GPO Configuration
> 来源: ado-wiki-b-custom-shortpath-gpo-setting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Path**: Computer Configuration > Policies > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Azure Virtual Desktop > **RDP Shortpath**
Same policy options as Intune.

## Scenario 9: Policy Details
> 来源: ado-wiki-b-custom-shortpath-gpo-setting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Policy | Description | Default (Not Configured) |
|--------|-------------|--------------------------|
| RDP Shortpath for managed network | Direct UDP via private connection (VPN/ExpressRoute); requires inbound port on session host | Enabled |
| RDP Shortpath for managed network via NAT traversal (ICE/STUN) | Direct UDP via private connection without requiring inbound port | Enabled |
| RDP Shortpath for public networks via NAT traversal (STUN) | Direct UDP via public network; no inbound ports required | Enabled |
| RDP Shortpath for public network via relay NAT traversal (TURN) | Relayed UDP via TURN server for fallback | Enabled |
> All policies: require Windows restart to take effect

## Scenario 10: Resources
> 来源: ado-wiki-b-custom-shortpath-gpo-setting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [RDP Shortpath configuration - Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-rdp-shortpath)
   - [Example scenarios](https://learn.microsoft.com/en-us/azure/virtual-desktop/rdp-shortpath?tabs=public-networks#example-scenarios)
   - [QA Training - W365 Custom Shortpath GPO](https://platform.qa.com/learning-paths/windows-365-w365-feature-custom-shortpath-gpo-setting-1854-17218/)

## Scenario 11: Custom Shortpath GPO Setting
> 来源: ado-wiki-b-custom-shortpath-gpo.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Resource Lookup Note:** For more information about RDP Shortpath, review [Internal Only - RDP Shortpath Wiki](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/466638/RDP-Shortpath), [Public - RDP Shortpath Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/rdp-shortpath?tabs=managed-networks) and [RDP Shortpath QA Platform](https://platform.qa.com/resource/avd-optimization-rdp-shortpath-brown-bag-qa-recording-1854/).
This release is an extension of the existing RDP Shortpath, integrated into W365. All previous content and troubleshooting are inherited by this release.

## Scenario 12: Intune Setting
> 来源: ado-wiki-b-custom-shortpath-gpo.md | 适用: \u901a\u7528 \u2705

### 排查步骤
In the settings picker, under **Administrative templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Azure Virtual Desktop**:
1. RDP Shortpath setup includes:
   - Enable RDP Shortpath for managed networks policy
   - Use port range for RDP Shortpath for unmanaged networks policy
   - Customize RDP Shortpath Network Configuration:
   - RDP Shortpath for managed network using NAT traversal
   - RDP Shortpath for public network using NAT traversal
   - RDP Shortpath for public network using relay NAT traversal

## Scenario 13: GPO Setting
> 来源: ado-wiki-b-custom-shortpath-gpo.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Under **Computer Configuration > Policies > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Azure Virtual Desktop**:
Same policy structure as Intune, with an additional option:
   - RDP Shortpath for managed network (direct, without NAT traversal)

## Scenario 14: GPO Policy Details
> 来源: ado-wiki-b-custom-shortpath-gpo.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Create a separate section under Remote Desktop Services > Azure Virtual Desktop > RDP Shortpath:

## Scenario 15: Shortpath for managed network
> 来源: ado-wiki-b-custom-shortpath-gpo.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Direct UDP between client and session host via private connection (ExpressRoute/VPN)
   - Enable/Not configured: considers managed networks paths
   - Disable: does not consider managed networks path
   - **Restart required** for changes to take effect

## Scenario 16: Shortpath for managed networks via ICE/STUN
> 来源: ado-wiki-b-custom-shortpath-gpo.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Direct UDP via private connection when RDP Shortpath listener is NOT enabled
   - ICE/STUN discovers available IP addresses and dynamic port
   - Enable/Not configured: considers managed networks paths
   - Disable: does not consider managed networks path
   - **Restart required**

## Scenario 17: Shortpath for public network using NAT traversal (STUN)
> 来源: ado-wiki-b-custom-shortpath-gpo.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Direct UDP using STUN protocol, no inbound ports required on session host
   - Enable/Not configured: considers public networks non-relayed paths
   - Disable: does not consider public networks non-relayed paths
   - **Restart required**

## Scenario 18: Shortpath for public network using relay NAT traversal (TURN)
> 来源: ado-wiki-b-custom-shortpath-gpo.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Relayed UDP through TURN intermediate server
   - Enable/Not configured: considers public networks relayed paths
   - Disable: does not consider public networks relayed paths
   - **Restart required**

## Scenario 19: AVD RDP Shortpath Troubleshooting Guide
> 来源: mslearn-rdp-shortpath-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Source: [Troubleshoot RDP Shortpath](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-rdp-shortpath)

## Scenario 20: Diagnostic Tool
> 来源: mslearn-rdp-shortpath-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**avdnettest.exe** — validates STUN/TURN connectivity and NAT type.
Download: https://raw.githubusercontent.com/Azure/RDS-Templates/master/AVD-TestShortpath/avdnettest.exe

## Scenario 21: Expected Output (Success)
> 来源: mslearn-rdp-shortpath-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```
Checking DNS service ... OK
Checking TURN support ... OK
Checking ACS server <IP:Port> ... OK
You have access to TURN servers and your NAT type appears to be 'cone shaped'.
Shortpath for public networks is very likely to work on this host.
```

## Scenario 22: ShortpathTransportNetworkDrop
> 来源: mslearn-rdp-shortpath-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **TCP path**: session host → gateway → client (two hops)
   - **UDP path**: session host → client (direct, no gateway)
   - UDP has no RST mechanism → connection loss detected only by timeout
   - Most TCP errors are RST-triggered (fast); UDP errors are always timeout-based (slow)

## Scenario 23: ShortpathTransportReliabilityThresholdFailure
> 来源: mslearn-rdp-shortpath-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Triggered when a specific packet fails after 50 retransmission attempts
   - Scenarios:
   - Low RTT connection suddenly dies → 50 retries happen fast (< 17s default timeout)
   - Packet too large → probed MTU fluctuated and packet consistently fails

## Scenario 24: ConnectionBrokenMissedHeartbeatThresholdExceeded
> 来源: mslearn-rdp-shortpath-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - RDP-level timeout triggers before UDP-level timeout
   - Caused by heartbeat timeout misconfiguration

## Scenario 25: RDP Shortpath Setup and Connection Flow Guide
> 来源: onenote-avd-rdp-shortpath.md | 适用: Mooncake \u2705

### 排查步骤
> Source: OneNote - Mooncake POD Support Notebook / AVD / Feature Verification / RDP shortpath
> Status: draft

## Scenario 26: Connection Flow (17 Steps)
> 来源: onenote-avd-rdp-shortpath.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. User subscribes to the Workspace
2. AAD authenticates user and returns token
3. Client passes token to feed subscription service
4. Feed subscription service validates token
5. Returns list of available desktops/RemoteApps as signed .rdp files
6. Client stores connection configuration
7. Client connects to closest AVD gateway
8. Gateway validates request, asks broker to orchestrate
9. Broker identifies session host, uses persistent channel to initialize
10. Remote Desktop stack initiates TLS 1.2 connection to gateway
11. Gateway relays raw data (base reverse connect transport for RDP)
12. Client starts RDP handshake
13. **Session host sends list of private/public IPv4/IPv6 addresses to client**
14. **Client starts background thread for parallel UDP transport directly to host**
15. Client continues initial connection over reverse connect (no delay)
16. If direct line of sight + correct firewall: client establishes secure TLS connection with session host
17. RDP moves all DVCs (graphics, input, device redirection) to new transport
**Fallback**: If UDP connectivity fails, RDP continues over reverse connect transport.

## Scenario 27: 1. Enable RDP Shortpath on Session Host (Registry)
> 来源: onenote-avd-rdp-shortpath.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```
HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations
fUseUdpPortRedirector = 1 (DWORD)
UdpPortNumber = 3390 (DWORD)
```

## Scenario 28: 2. Add Firewall Rule
> 来源: onenote-avd-rdp-shortpath.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```powershell
New-NetFirewallRule -DisplayName 'Remote Desktop - Shortpath (UDP-In)' `
  -Action Allow `
  -Description 'Inbound rule for RDP Shortpath [UDP 3390]' `
  -Group '@FirewallAPI.dll,-28752' `
  -Name 'RemoteDesktop-UserMode-In-Shortpath-UDP' `
  -PolicyStore PersistentStore `
  -Profile Domain, Private `
  -Service TermService `
  -Protocol udp -LocalPort 3390 `
  -Program '%SystemRoot%\system32\svchost.exe' `
  -Enabled:True
```

## Scenario 29: 3. Configure NSG
> 来源: onenote-avd-rdp-shortpath.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Allow inbound UDP 3390 on the session host subnet NSG

## Scenario 30: 4. Verify Connectivity
> 来源: onenote-avd-rdp-shortpath.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Check connection info in Remote Desktop client to confirm UDP transport is active

## Scenario 31: Key Points
> 来源: onenote-avd-rdp-shortpath.md | 适用: Mooncake \u2705

### 排查步骤
   - Shortpath is for **managed networks** (direct line of sight between client and session host)
   - For public networks, use RDP Shortpath for public networks (different configuration)
   - Doc: https://docs.azure.cn/zh-cn/virtual-desktop/shortpath

---

## 关联 Kusto 查询参考

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where ActivityId == "{ActivityId}"
| where TIMESTAMP >= ago(9d)
| project TIMESTAMP, Level, TaskName, Message, ProviderName
| order by TIMESTAMP asc
```
`[来源: rdp-core-events.md]`
