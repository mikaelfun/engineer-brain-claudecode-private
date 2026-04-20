---
title: Detailed RDP Troubleshooting Guide for Azure Windows VMs
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/detailed-troubleshoot-rdp
product: vm
date: 2026-04-18
---

# Detailed RDP Troubleshooting Guide for Azure Windows VMs

Comprehensive multi-source troubleshooting for Remote Desktop connection issues when basic troubleshooting steps have been exhausted.

## RDP Connection Components

An RDP connection involves: client computer -> organization intranet edge -> Azure NSG -> Azure VM.

## Source 1: Remote Desktop Client Computer

Check for:
- Local firewall blocking RDP traffic
- Client proxy software blocking connections
- Network monitoring software interfering
- Security software blocking specific traffic

**Test**: Try connecting to another on-premises Windows machine via RDP.

## Source 2: Organization Intranet Edge Device

Check for:
- Internal firewall blocking HTTPS to Internet
- Proxy server preventing RDP connections
- Intrusion detection or network monitoring on edge devices

**Test**: Try from a computer directly connected to the Internet.

## Source 3: Network Security Groups (NSG)

- Use IP Flow Verify (Network Watcher) to confirm if NSG rule blocks traffic
- Review effective security group rules for inbound Allow NSG rule on RDP port (default 3389)

## Source 4: Windows-based Azure VM

1. Reset RDP service via Azure portal (Help > Reset password > Reset configuration only)
2. Enable Remote Desktop Windows Firewall rule (TCP 3389)
3. Set registry HKLM\System\CurrentControlSet\Control\Terminal Server\fDenyTSConnections to 0
4. Verify RDP service is running and listening on correct port

### Check RDP Listening Port via Remote PowerShell

```powershell
Get-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" -Name "PortNumber"
```

### Reset RDP Port to Default 3389

```powershell
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" -Name "PortNumber" -Value 3389
```

## Additional Checks on VM

- Remote Desktop service not running
- RDP not listening on TCP 3389
- Windows Firewall outbound rule blocking RDP traffic
- Intrusion detection or monitoring software on VM blocking RDP

## Preliminary Steps (Always Do First)

1. Check VM status in Azure portal
2. Follow basic troubleshooting guide quick fix steps
3. For custom images, verify VHD was properly prepared before upload
4. Flush DNS client cache if public IP changed
5. Verify third-party RDP applications use correct TCP port
