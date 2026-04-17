# ExpressRoute / VPN Network Performance Troubleshooting

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/expressroute-troubleshooting-network-performance

## Overview

Systematic methodology for testing and baselining network latency and bandwidth between on-premises and Azure over ExpressRoute or VPN.

## Key Components to Check (Right to Left)

1. **VM** — SKU bandwidth limits; static routes; use DS5v2 for testing
2. **NIC** — Private IP; NIC-level NSG (ports 5201/iPerf, 3389/RDP, 22/SSH)
3. **VNet Subnet** — Subnet NSG (applies before NIC NSG for inbound)
4. **Subnet UDR** — User-Defined Routes to NVA/firewall/LB
5. **Gateway Subnet** — NSG/UDR on gateway subnet
6. **VNet Gateway** — Connection weight settings affect path selection
7. **Route Filter** — Required for Microsoft Peering; check configuration
8. **WAN / Service Provider** — Multiple hops, hardest to troubleshoot
9. **Corporate Network** — Campus/enterprise layers

## Tools

| Tool | Purpose |
|------|---------|
| **AzureCT** (Azure Connectivity Toolkit) | PowerShell wrapper for iPerf + PSPing |
| **iPerf** | Bandwidth/throughput testing |
| **PSPing** (SysInternals) | ICMP and TCP latency testing |

### Install AzureCT

```powershell
(new-object Net.WebClient).DownloadString("https://aka.ms/AzureCT") | Invoke-Expression
Install-LinkPerformance
```

### Run Performance Test

```powershell
# Remote host must run iPerf in server mode
Get-LinkPerformance -RemoteHost 10.0.0.1 -TestSeconds 10

# For detailed 5-minute test
Get-LinkPerformance -RemoteHost 10.0.0.1 -TestSeconds 300
```

## Troubleshooting Methodology

1. **Challenge assumptions** — 1 Gbps circuit + 100ms latency ≠ 1 Gbps throughput (TCP limitation)
2. **Start at edge** — Test between routing domain boundaries
3. **Create diagram** — Map all components in the path
4. **Divide and conquer** — Segment network, narrow down
5. **Consider all OSI layers** — Don't forget Layer 7

## ExpressRoute-Specific: MSEE Isolation

MSEE (Microsoft Enterprise Edge) is the boundary between Azure and WAN.

### Test Plan (Two VNets on Same Circuit)

1. **VM1 ↔ VM2** (same VNet) → validates local VNet
2. **VM1 ↔ VM3** (different VNet, same circuit) → validates Azure network + MSEE
3. If Azure passes → test corporate network → engage ISP/provider

## Latency Reference (Seattle ExpressRoute, 10 Gbps Premium)

| Region | Distance | Latency | Max BW |
|--------|----------|---------|--------|
| West US 2 | 191 km | 5 ms | 3.74 Gbps |
| West US | 1,094 km | 18 ms | 3.70 Gbps |
| Central US | 2,357 km | 40 ms | 2.55 Gbps |
| East US | 3,699 km | 74 ms | 1.78 Gbps |
| Japan East | 7,705 km | 106 ms | 1.22 Gbps |
| West Europe | 7,834 km | 153 ms | 761 Mbps |
| SE Asia | 12,989 km | 170 ms | 756 Mbps |

## Tips

- Geographic distance is the largest latency factor (fiber run distance, not straight-line)
- Use `Set-NetTCPSetting -AutoTuningLevelLocal Experimental` for better iPerf results on Windows
- iPerf multi-threaded from multiple machines helps reach max link performance
- Record time of day for each test; consistency is key
