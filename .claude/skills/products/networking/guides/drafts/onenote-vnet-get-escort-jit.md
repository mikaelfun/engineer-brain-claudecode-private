# VNet Get Operation via Escort JIT Session (Mooncake)

> Source: MCVKB/Net/10.16 | ID: networking-onenote-041 | Quality: guide-draft

## Purpose
Run Jarvis RNM/VNet management actions (get operations) in Mooncake, which now require Escort JIT session access.

## Background
- Public Azure: get operations still allowed directly
- Mooncake: get operations locked, requires Escort session per national cloud security requirements
- Reference: https://eng.ms/docs/products/geneva/actions/howdoi/nationalcloudsga#step-4---access-assignment-in-national-clouds

## Steps

### 1. Submit JIT Request
- Portal: https://jitaccess.security.core.chinacloudapi.cn/
- Request RDP permission for jumpbox (MSFT account is enough)
- JIT request will be approved manually by 21v team

### 2. Connect Shadow RDP Session
Once approved, 21v escort team will ping on Teams with:
- RDS server: `mstsc /prompt /f /v:mcpas.ChinaNorth2.cloudapp.chinacloudapi.cn:<port>`
- Shadow command: `mstsc /shadow:<session-id> /control`

### 3. Login to Jarvis
21v escort team will:
1. Connect to jumpbox
2. Login Jarvis portal with **CME account**
3. Login Jarvis actions with CME account

### 4. Run Jarvis Action
Navigate to RNM/VNet management action and dump VNet info:
- Sample link: `portal.microsoftgeneva.com/7719790B`
- Output includes: VNet ID, Version, AclZoneId, Subnets, Allocations, Reservations, GRE Key, DNS Servers, Link Records

## Security Requirements
1. Script files must be attached to Escort ticket with manager sign-off
2. No `clip.exe` pipe commands
3. No secrets/passwords leaked out of Mooncake
4. No customer data exposure
5. Delete temporary files before closing session
