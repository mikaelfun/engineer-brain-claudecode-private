---
title: "Azure VM-to-VM Connectivity Troubleshooting"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-connectivity-problem-between-vms"
product: networking
date: 2026-04-18
type: troubleshooting-guide
---

# Troubleshoot Connectivity Between Azure VMs

## 9-Step Troubleshooting Flow

### Step 1: Check NIC Configuration
- Reset network interface if misconfigured
- Multi-NIC VMs: Add new NIC, fix bad NIC, remove and re-add
- Single-NIC VM: Redeploy VM (Windows/Linux)

### Step 2: Check NSG/UDR Blocking
- Use **Network Watcher IP Flow Verify** to identify blocking NSG rule
- Use **Connection Troubleshoot** for end-to-end path analysis
- Check effective security rules at BOTH subnet and NIC levels
- Common misconfigs: priority conflicts, missing inbound rules on both NSGs, source IP restrictions, default DenyAllInbound (priority 65500)
- Use **VNet flow logs** (recommended over NSG flow logs which retire Sept 2027) + Traffic Analytics
- Check UDRs for unexpected next hops redirecting traffic

### Step 3: Check VM Firewall
- Disable firewall temporarily to test
- If resolved, verify firewall settings and re-enable

### Step 4: Check App/Service Listening
- Windows: `netstat -ano` to verify port listening
- Linux: `netstat -l`
- Run telnet locally on VM to test port

### Step 5: Check SNAT Port Exhaustion
- Symptoms: intermittent connection failures behind load balancer
- Resolution options:
  1. Associate NAT gateway with subnet (recommended)
  2. Assign public IP directly to VM
  3. Configure outbound rules on standard load balancer

### Step 6: Check ACLs (Classic VM)
- Only applies to classic deployment model
- Manage ACL on endpoint

### Step 7: Check Endpoints (Classic VM)
- Classic VMs need endpoints for cross-VNet communication

### Step 8: VM Network Share Connectivity
- Unavailable NICs may block network share access
- Delete unavailable NICs if found

### Step 9: Inter-VNet Connectivity
- Use IP Flow Verify for cross-VNet NSG/UDR checks
- Use VNet flow logs to analyze traffic patterns
- Review VPN Gateway topology and design

## Key Diagnostic Tools
| Tool | Use Case |
|------|----------|
| IP Flow Verify | Which NSG rule allows/denies specific traffic |
| Connection Troubleshoot | End-to-end connectivity test with path analysis |
| Effective Security Rules | Combined NSG rules from subnet + NIC |
| VNet Flow Logs | Traffic pattern analysis |
| Effective Routes | Verify route next hops |
