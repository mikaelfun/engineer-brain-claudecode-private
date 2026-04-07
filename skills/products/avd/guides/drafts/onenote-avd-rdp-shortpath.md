# RDP Shortpath Setup and Connection Flow Guide

> Source: OneNote - Mooncake POD Support Notebook / AVD / Feature Verification / RDP shortpath
> Status: draft

## Overview
RDP Shortpath establishes a direct UDP-based transport between client and session host for improved performance and reliability. It is NOT a security or isolation feature - you cannot limit connections to Shortpath only.

## Connection Flow (17 Steps)
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

## Setup Steps

### 1. Enable RDP Shortpath on Session Host (Registry)
```
HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations
fUseUdpPortRedirector = 1 (DWORD)
UdpPortNumber = 3390 (DWORD)
```

### 2. Add Firewall Rule
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

### 3. Configure NSG
- Allow inbound UDP 3390 on the session host subnet NSG

### 4. Verify Connectivity
- Check connection info in Remote Desktop client to confirm UDP transport is active

## Key Points
- Shortpath is for **managed networks** (direct line of sight between client and session host)
- For public networks, use RDP Shortpath for public networks (different configuration)
- Doc: https://docs.azure.cn/zh-cn/virtual-desktop/shortpath
