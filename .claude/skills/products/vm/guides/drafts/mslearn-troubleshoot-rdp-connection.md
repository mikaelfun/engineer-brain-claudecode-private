---
title: Troubleshoot RDP Connections to Azure VM
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-rdp-connection
product: vm
21vApplicable: true
---

# Troubleshoot RDP Connections to Azure VM - Comprehensive Guide

## Overview
Comprehensive step-by-step troubleshooting guide for RDP connection failures to Azure Windows VMs. Covers portal-based and PowerShell-based approaches.

## Systematic Troubleshooting Steps (in order)

### 1. Reset RDP Configuration
- Portal: VM > Help > Reset password > Mode: Reset configuration only
- PowerShell: 

### 2. Verify NSG Rules
- Use IP flow verify in Network Watcher to confirm inbound Allow rule for TCP 3389 exists.
- PowerShell:  then check  for port 3389 Allow Inbound.
- If missing, create NSG rule allowing TCP 3389.

### 3. Review Boot Diagnostics Console Logs
- Check for OS-level errors that could affect RDP.

### 4. Reset NIC
- Portal/CLI: Reset the network interface card.

### 5. Check VM Resource Health
- Portal: VM > Help > Resource health. Should show "Available".

### 6. Reset User Credentials
- Portal: VM > Help > Reset password > Mode: Reset password.
- PowerShell:  with  and .

### 7. Restart VM
- Portal: VM > Overview > Restart.
- PowerShell: .

### 8. Redeploy VM
- Moves VM to different host. Ephemeral disk data lost, dynamic IPs updated.
- Portal: VM > Help > Redeploy.
- PowerShell: .

### 9. Verify Routing
- Use Network Watcher Next hop capability.
- Review effective routes for the NIC.

### 10. Check Local/On-premises Firewall
- Ensure outbound TCP 3389 to Azure is allowed.

## Common Specific RDP Errors
- No Remote Desktop License Servers available
- Remote Desktop can't find the computer
- Authentication error / LSA unreachable
- Credentials did not work
- Can't connect to remote computer

## Microsoft Entra Sign-in Errors
- No Azure roles assigned
- Unauthorized client
- MFA sign-in method required
