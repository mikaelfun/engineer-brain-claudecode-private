---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-app-connection"
importDate: "2026-04-24"
type: guide-draft
---

# Troubleshoot Application Connectivity on Azure VMs

Methodical approach to isolate and fix application connectivity issues on Azure VMs (Windows and Linux).

## Quick-Start Steps

1. Restart the virtual machine
2. Recreate the endpoint / firewall rules / NSG rules
3. Connect from different location (different Azure VNet)
4. Redeploy the virtual machine
5. Recreate the virtual machine

## Step 1: Access Application from Target VM

- Use local hostname, local IP, or loopback (127.0.0.1)
- If application works locally, issue is in network path
- Verify application is running and listening on expected ports
- Use netstat -a to check listening ports

## Step 2: Access Application from Another VM in Same VNet

- Test from different VM using private IP
- If fails, check:
  - Host firewall on target VM (inbound request + outbound response)
  - Intrusion detection / network monitoring software
  - NSG rules / Cloud Service endpoints
  - Load balancer or firewall in path between VMs

## Step 3: Access Application from Outside the VNet

- Test from computer outside the virtual network
- If fails, check:
  - NSG inbound rules for application port
  - VM endpoint configuration (Classic) or inbound NAT rules (Resource Manager)
  - Firewall rules at internet edge device
  - Port probe: Test-NetConnection -ComputerName <publicIP> -Port <port>

## Key Diagnostic Commands

### Windows
- netstat -a (show listening ports)
- Windows Firewall with Advanced Security (check rules)

### Linux
- netstat -a (show listening ports)
- iptables rules

## Common Causes

1. Application not running or not listening on expected port
2. Listening port blocked by guest OS firewall
3. NSG rules not allowing traffic on expected ports
4. Internet edge device firewall blocking traffic
5. Site-to-site VPN or ExpressRoute routing issues
