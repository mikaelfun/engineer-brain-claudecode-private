---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/RDP Shortpath Public/Script"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/676187"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[Updated Script](https://microsoft.visualstudio.com/RDV/_git/rd-nano?version=GBuser%2Fmilacher%2Frandom-fixes&path=%2Ftools%2Ftest-ice.ps1)

# Does script test on every local interface with IPv4/IPv6 address?

No, just like msrdc it lets the OS pick the best interface to contact the STUN server

# What is the difference between "Local NAT uses port preservation" vs "Local NAT does not use port preservation"
There is no difference unless you want to use custom port ranges. Since we are not longer supporting custom port ranges (section was removed from docs awhile back) for Shortpath this should be ignored by everyone

# Interpreting STUN Lookups Query

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

# Successful Result

(Screenshot: shows successful STUN result with matching IPs under discovered external endpoints)

# DNS Blocked

(Screenshot: shows DNS blocked result)

# UDP 3478 Blocked

(Screenshot: shows UDP 3478 blocked result)

# Traffic to STUN Servers Blocked

(Screenshot: shows traffic to STUN servers blocked result)

# Local UDP Ports 1024-65535 Blocked

(Screenshot: shows local UDP ports blocked result)

# Troubleshooting
1. [Verify GPO is not blocking UDP traffic on Client](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/562826/Troubleshooting?anchor=verify-gpo-is-not-blocking-udp-traffic-on-client)
1. [Verify GPO is not blocking UDP traffic on VM](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/562826/Troubleshooting?anchor=verify-gpo-is-not-blocking-udp-traffic-on-vm)
1. Verify both client computer and AVD VM can talk to required endpoints per [Allow outbound UDP connectivity](https://docs.microsoft.com/en-us/azure/virtual-desktop/shortpath-public#allow-outbound-udp-connectivity).
1. If needed send collaboration task to Azure Networking to help confirm outbound UDP to endpoints are allowed.
1. Investigate using provided [Kusto Queries while referencing explanation of tasks being reported](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/562826/Troubleshooting?anchor=kusto-queries) to understand what the problem might be
1. If GPO's are not blocking UDP and network can talk to endpoints so create ICM

### UDP Allowed with no Symmetric NAT (GOOD)
- Will see IPs under discovered external endpoints and the IP's will be the SAME.
- The IP's need to be the same to find the UDP path reliably
- Ignore the error "Failed to communicate..check if InterNetworkV6 is configured", that just means IPv6 is not configured and/or enabled.

#### Troubleshooting:
1. No need to check GPO's because we know UDP is allowed and network can talk to endpoints so create ICM

### UDP Allowed with Symmetric NAT (BAD)
- Will see IPs under discovered external endpoints and the IP's will be DIFFERENT.
- When the IP's are different then there is Symmetric NAT and chances of finding UDP path is very low to zero.
- This means that it will not reuse the external port even though traffic comes from the same internal source.

#### Troubleshooting
1. Point the customer to our public doc explaining this is UNSUPPORTED SCENARIO [insert link]
1. There is no solution for this. In order for Shortpath Public to work with Symmetric NAT then connection will need UPnP or TURN protocols which are not available at GA and will come later. We cannot provide any timeline for UPnP or TURN.
1. If the customer does not except this answer and continues to push back create ICM.

# Verify GPO is not blocking UDP traffic on Client

## Solution
If GPO is set to "Use only TCP" then change to Not Configured and reboot the computer

# UDP Connections are not using specified port range [Remove for GA - not going to support]
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
