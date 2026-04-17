---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/🤝Dependencies/Networking/Outbound Connection Issue for Cloud PC"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2F%F0%9F%A4%9DDependencies%2FNetworking%2FOutbound%20Connection%20Issue%20for%20Cloud%20PC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Outbound Connection Issue for Cloud PC

## Overview

This guide covers Cloud PC networking issues such as:
- Cannot access internet
- Cannot reach a specific port/IP address
- Cannot reach a specific website

**Four main root cause categories:**
1. Customer's Virtual Network environment (NSG / Routes / DNS)
2. Customer's proxy/VPN/Windows Firewall/3rd party AV inside guest OS
3. Server-end restrictions (Azure SNAT port range or IP blocks)
4. Azure Host Networking service issue

---

## 1. Customer's Virtual Network Environment

Get the Cloud PC VM resource ID, then retrieve the Network Interface resource ID via Geneva Action **"Get NRP Subscription Details"** (input: Subscription ID + NRP region).

### Network Security Group (NSG)
Use Geneva Action **["Get Nic Effective Security Groups"](https://portal.microsoftgeneva.com/E221C040)** with the NIC resource ID.
Review the rules for any that block inbound/outbound connections to the specific IP/port.
Reference: https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview

### Routes
Use Geneva Action **["Get Nic Effective Routes"](https://portal.microsoftgeneva.com/9ABF9CF0)** with the NIC resource ID.
Check if any route directs traffic to Azure Firewall, 3rd party NVA, null, or on-prem via ExpressRoute/S2S VPN.
Reference: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview#next-hop-types-across-azure-tools

### DNS
DNS errors are obvious from the error message (e.g., "URL cannot be resolved").
- **MHN Cloud PC with DNS failure** → Engage SaaF team → W365 Network and Storage dev team
- **Customer vNet DNS failure** → Check `dhcpOptions / dnsServers` in Virtual Network details:
  - `168.63.129.16` = Azure DNS (W365 backend issue or DNS proxy applied in guest)
  - Custom IPs = Customer's DNS server → Test connectivity to DNS server IP:53 UDP via ASC Diagnostic → If reachable, collaborate with Windows Directory Services team

### Diagnostic - Test Traffic (ASC)
In ASC → VM → Diagnostic tab → Test Traffic:
- Input destination IP and port
- Simulates VFP rules (no real traffic generated)
- Download Process-Tuples for detailed VFP analysis
Reference: ["Process-Tuples in Virtual Filtering Platform"](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/423267/Virtual-Filtering-Platform)

---

## 2. Proxy/VPN/Firewall/3rd Party AV Inside Guest OS

Run these checks in PowerShell on the Cloud PC:

```powershell
# 1. DNS resolution check
nslookup <url> <DNS-server-IP>

# 2. TCP connection check
Test-NetConnection -ComputerName <URL> -InformationLevel Detailed -Port <Port>

# 3. Web request check
Invoke-WebRequest -Uri <URL>

# 4. Route check (look for VPN-injected routes)
route print

# 5. Proxy check
netsh winhttp show proxy
```

If checks pass but issue persists:
1. Use **tcpping** or **psping** to initiate long TCP ping to destination
2. Capture network trace while reproducing
3. Use Geneva Action **["List-Unified-Flow"](https://jarvis-west.dc.ad.msft.net/E1B294F4)** to check if outbound packet leaves the container (requires SAW/VSAW)

---

## 3. Server-End Restrictions

### Possibility 1: Azure SNAT Port Range Blocked
Azure assigns SNAT ports starting from 1024-1087 (Ephemeral port range) for outbound connections from VMs without public IPs.
Some websites/services block access from source port range 1024-1087 (non-standard per RFC 6056).

**Confirmation:** Use Geneva Action **["List-NAT-Range"](https://jarvis-west.dc.ad.msft.net/3F8F408C)** (requires SAW/VSAW) to confirm SNAT port range.

**Workaround options:**
- Configure proxy inside Cloud PC guest OS to bypass Azure SLB port allocation
- Create an **Azure NAT Gateway** on the same Subnet to provide static public IP (incurs additional cost)
- Long-term: Customer contacts web owner to unblock source port range 1024-1087

Reference ICMs: [308307556](https://portal.microsofticm.com/imp/v3/incidents/details/308307556/home), [275435045](https://portal.microsofticm.com/imp/v3/incidents/details/275435045/home)

### Possibility 2: IP Range Restriction
Website blocks access from specific Azure public IP ranges.
Test from multiple networks (Azure VM, MSFT Corpnet, home network) to identify the pattern.

---

## 4. Azure Host Networking Issue

Use **[NetVMA](https://netvma.azure.net/)** (input VMID or Container ID, set correct timespan) to check:
- Uplink status
- Network path of the Cloud PC at container layer

Check Azure WAN Edge router with Kusto query:
```kusto
cluster('netcapplan').database('NetCapPlan').RealTimeIpfixWithMetadata
| where TimeStamp >= ago(1d)
| where SrcIpAddress == "<CloudPC_PublicIP>" or DstIpAddress == "<CloudPC_PublicIP>"
| project TimeStamp, RouterName, IngressIfName, EgressIfName, SrcIpAddress, DstIpAddress, DstTransportPort, SrcAs, DstAs, NextHop
| order by TimeStamp desc
```
This verifies whether packets left/returned via Azure WAN Edge.
