---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Dependencies/Networking/Outbound Connection Issue for Cloud PC"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FDependencies%2FNetworking%2FOutbound%20Connection%20Issue%20for%20Cloud%20PC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Outbound Connection Issue for Cloud PC

Covers scenarios where Cloud PC cannot access internet, reach specific ports, websites, or IP addresses.

## Root Cause Categories

1. Customer's Virtual Network environment (NSG, Routes, DNS)
2. Customer's proxy/VPN/Windows Firewall/3rd party anti-virus inside guest OS
3. Server end's restrictions
4. Azure Host Networking service issue

---

## 1. Customer's Virtual Network Environment

### Getting VM Network Interface

1. Get Cloud PC VM resource ID
2. Call Geneva Action [Get NRP Subscription Details](https://portal.microsoftgeneva.com/92656165) with Subscription ID and NRP region
3. Use VM resource ID as filter to find `allocatedNetworkInterfaces`
4. Network interface resource ID enables NSG/routing diagnostics

### Network Security Group (NSG)

Use Geneva Action [Get Nic Effective Security Groups](https://portal.microsoftgeneva.com/E221C040) to get effective NSG for the specific network interface. Review rules for any blocking inbound/outbound connections.

Reference: [NSG Overview](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview)

### Routes

Use Geneva Action [Get Nic Effective Routes](https://portal.microsoftgeneva.com/9ABF9CF0) to get effective routes. Check for traffic directed to Azure Firewall/NVA/null, or forced tunneling via ExpressRoute/S2S VPN.

Reference: [UDR Overview](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview#next-hop-types-across-azure-tools)

### DNS

- **AADJ CloudPC on MHN**: DNS error indicates W365 Networking backend or Azure DNS issue. Engage SaaF team.
- **CloudPC on customer VNet**: Follow steps:
  1. Get Subnet Resource ID (from customer or SaaF CPC reporting kusto)
  2. Use [Virtual SAW](https://tdc.azure.net/Welcome) to [Get NRP Subscription Details](https://portal.microsoftgeneva.com/11A0DA80)
  3. Check `dhcpOptions` / `dnsServers`:
     - `168.63.129.16` = Azure DNS (may still have DNS proxy via GPO)
     - Custom IPs = customer DNS servers (Azure VM, on-prem via VPN/ER)
  4. Use ASC Diagnostic - Test Traffic to test connectivity to DNS server IP:53 UDP

### Diagnostic - Test Traffic (ASC)

1. Find VM in ASC > Diagnostic tab
2. Under Test Traffic, input destination IP and port
3. Result shows VFP rule simulation (no real traffic generated)
4. Download Process-Tuples for detailed VFP analysis
5. Reference: [Process-Tuples in VFP](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/423267/Virtual-Filtering-Platform)

---

## 2. Proxy/VPN/Windows Firewall/3rd Party Software

Check these items in PowerShell on the Cloud PC:

1. **DNS Check**: `nslookup <url> <DNS_server_IP>`
2. **TCP Connection**: `Test-NetConnection -ComputerName <URL> -InformationLevel Detailed -Port <Port>`
3. **Web Request**: `Invoke-WebRequest -Uri <URL>`
4. **Route Check**: `route print` (verify no VPN routes redirecting all traffic)
5. **Proxy Check**: `netsh winhttp show proxy` (note: proxy may be at software/browser layer only)

If all checks pass, suggest customer:
- Run long tcp-ping using [tcpping](https://www.elifulkerson.com/projects/tcping.php) or [psping](https://learn.microsoft.com/en-us/sysinternals/downloads/psping)
- Capture network trace per [guide](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/770584/Networking?anchor=network-traces)
- Use [List-Unified-Flow](https://jarvis-west.dc.ad.msft.net/E1B294F4) Geneva Action to check if outgoing packet leaves guest OS

---

## 3. Server End Restrictions

### Possibility 1: SNAT Port Range Blocking

Azure VMs without public IP use Default Outbound Access with SNAT starting from port range 1024-1087. Some websites block this range.

- **Diagnosis**: Exclude VNet and guest OS issues first, then use [List-NAT-Range](https://jarvis-west.dc.ad.msft.net/3F8F408C) Geneva Action to confirm allocated port range
- **Workaround**: Configure proxy in guest OS, or create Azure NAT Gateway on same subnet
- **Long-term**: Request website owner to unblock ports 1024-1087 (valid per RFC 6056)
- Reference ICMs: 308307556, 275435045

### Possibility 2: IP Range Blocking

Websites block specific Azure public IP ranges. Test access from different networks (Azure VM, Corpnet, Home) to confirm pattern.

---

## 4. Azure Host Networking Service Issue

Least likely scenario - packet dropped in Azure backbone network.

- Use [NetVMA](https://netvma.azure.net/) to check uplink status and network path (search by VMID/Container ID)
- Kusto query to check WAN Edge router traffic:

```kusto
cluster('netcapplan').database('NetCapPlan').RealTimeIpfixWithMetadata
| where TimeStamp >= ago(1d)
| where SrcIpAddress == "<src_ip>" or DstIpAddress == "<dst_ip>"
| project TimeStamp, RouterName, IngressIfName, EgressIfName, SrcIpAddress, DstIpAddress, DstTransportPort, SrcAs, DstAs, NextHop
| order by TimeStamp desc
| order by RouterName
```
