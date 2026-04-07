# AVD VM Configuration & Domain Join Troubleshooting Guide

> Source: [Troubleshoot session host VM configuration](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-vm-configuration)

## Domain Join Failures

### Credentials
- Wrong password → manually join or redeploy with correct creds
- MFA on join account → remove MFA or use service account
- Insufficient permissions → use Administrator group member

### DNS Resolution
- VNet not peered with DC VNet → create peering
- Entra Domain Services → update VNet DNS settings
- NIC DNS pointing wrong → change to Custom or Inherit from virtual network

### Computer Account Reuse (KB5020276)
- Oct 2022+ hardening blocks reuse of existing AD computer objects
- Solutions:
  - Use original creator account
  - Use Domain Administrator
  - Apply "Allow computer account re-use" GPO (requires March 2023+ patches on all DCs)

## Agent Installation

### Agent/Boot Loader Missing (ScriptLog.log absent)
- DSC couldn't run → wrong credentials or insufficient permissions
- Fix: manually install via PowerShell host pool creation

### Agent Not Registering (IsRegistered = 0)
- Token expired → generate new token, update registry, restart RDAgentBootLoader

### Agent Not Reporting Heartbeat
- RDAgentBootLoader stopped → start the service
- Port 443 closed → verify with PSPing to rdbroker.wvdselfhost.microsoft.com:443

### Agent Version Update Failure (Status: Unavailable)
- Download new agent → stop RDAgentBootLoader → run installer → remove INVALID_TOKEN → restart

## Side-by-side (SxS) Stack

### Verification
```cmd
qwinsta
```
Look for `rdp-sxs` in output.

### Registry Keys
- `HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\rds-sxs` → fEnableWinstation = 1
- `HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\ClusterSettings` → SessionDirectoryListener = rdp-sxs

### O_REVERSE_CONNECT_STACK_FAILURE
- SxS stack not installed → RDP as local admin, reinstall via host pool registration

### SxS Stack Malfunction Remediation
1. Connect via RDP from same subnet/domain VM
2. Use PsExec to open cmd on target: `psexec.exe \\<VMname> cmd`
3. Run `qwinsta` to verify rdp-sxs exists
4. Run `wmic product get name` to list Remote Desktop components
5. Uninstall all "Remote Desktop" products
6. Restart VM → reinstall SxS stack

## Licensing

### "Remote Desktop licensing mode is not configured"
- Disable GPO: Admin Templates → Windows Components → RDS → RDSH → Licensing → "Set the Remote Desktop licensing mode"
- Install Windows updates: KB4516077 (1809) or redeploy with latest 1903 image
- Note: RDS CAL only needed for Windows Server session hosts

## Security

### "Security error" connecting to remote PC
- Check "Allow log on through Remote Desktop Services" security policy
- Ensure target user groups are included

## Golden Image Best Practice
- **NEVER** include AVD agent in golden images
- Install agent only after deploying the image
