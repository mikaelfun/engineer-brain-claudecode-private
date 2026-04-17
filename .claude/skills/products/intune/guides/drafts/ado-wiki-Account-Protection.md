---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Account Protection"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FAccount%20Protection"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune Account Protection

Account protection policies help protect user identities and local accounts on Windows via Endpoint security Policy.

## Capabilities
- Windows Hello for Business (WHfB)
- Microsoft Defender Credential Guard
- UAC - Account Protection
- User group membership
- Windows LAPS

## Prerequisites
- **WHfB**: Entra ID device registration, licensing, MFA for provisioning
- **Credential Guard**: Windows Enterprise/Education with VBS, Secure Boot, compatible hardware
- **LSA protection**: On Windows 11 24H2, enabled by default (new installs immediately; upgrades after 5-day evaluation)

## Troubleshooting

### LAPS
- Registry: `HKLM\SOFTWARE\Microsoft\Policies\LAPS` and `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\LAPS\State`
- Event Viewer: Applications and Services Logs > Microsoft\Windows\LAPS\Operational
- Event 7004: Protection enabled; Event 7005: Protection failed

### Credential Guard
- Registry: `HKLM\SOFTWARE\Microsoft\PolicyManager\current\device\DeviceGuard`
- msinfo32 - System Summary: check VBS Services Running
- Event 7002: Initialized successfully; Event 7003: Failed (missing Secure Boot or incompatible hardware)
- Event 7000: VBS initialized; Event 7001: VBS failed (check hypervisor or Secure Boot)

### Windows Hello for Business
- Device registry: `HKLM\SOFTWARE\Microsoft\Policies\PassportForWork\<TenantID>\Device\Policies`
- User registry: `HKLM\SOFTWARE\Microsoft\Policies\PassportForWork\<TenantID>\UserSid\Policies`
- Event 8025: Prerequisites check initiated; Event 8204: Hardware requirements met; Event 7054: Prerequisites check failed

### Local User Group Membership
- Validate via Computer Management > Local Users and Groups > Groups
- Check DeviceManagement-Enterprise-Diagnostics-Provider/Admin for CSP failures

### Policy Conflict Priority
Intune > MDE Security Settings Management > GPO
