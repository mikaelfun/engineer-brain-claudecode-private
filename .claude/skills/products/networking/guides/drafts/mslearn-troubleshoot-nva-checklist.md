---
title: NVA Troubleshooting Checklist
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nva
product: networking
21vApplicable: true
---

# NVA (Network Virtual Appliance) Troubleshooting Checklist

## Pre-check with NVA Vendor
- Software updates for NVA VM software
- Service Account setup and functionality
- UDRs on VNet subnets directing traffic to NVA
- UDRs on VNet subnets directing traffic from NVA
- Routing tables and rules within the NVA (NIC1 to NIC2)
- Tracing on NVA NICs to verify receiving/sending traffic
- Standard SKU Public IP requires NSG with explicit allow rule

## Step 1: Check Basic Configuration

### IP Forwarding
- Portal: NVA resource > Networking > Network interface > IP configuration > IP forwarding
- PowerShell: Get-AzNetworkInterface → check EnableIPForwarding property
- If not enabled: set EnableIPForwarding = 1, then Set-AzNetworkInterface

### NSG for Standard SKU Public IP
- Standard SKU Public IPs require NSG with explicit allow rules
- Without NSG, all traffic is denied by default

### Routing Verification
- Network Watcher > Next Hop: verify NVA is listed as next hop
- Network Watcher > IP Flow Verify: check for NSG blocking

### NVA Listening on Expected Ports
- Windows: netstat -an
- Linux: netstat -an | grep -i listen

## Step 2: Check NVA Performance

### CPU Usage
- Azure portal VM metrics: check for CPU spikes near 100%
- High CPU → resize VM SKU or increase scale set instance count

### Network Statistics
- Monitor VM network throughput metrics
- Consider enabling Accelerated Networking (check vendor support)

## Step 3: Advanced Network Troubleshooting

### Capture Network Trace
- Windows: netsh trace start capture=yes tracefile=c:\server_IP.etl scenario=netconnection
- Linux: sudo tcpdump -s0 -i eth0 -X -w vmtrace.cap

### Analyze Traces
- Use PsPing or Nmap between source → NVA → destination
- No packets at NVA: NSG or UDR issue
- Packets arrive but no response: NVA application or firewall issue
- Contact NVA vendor with trace results
