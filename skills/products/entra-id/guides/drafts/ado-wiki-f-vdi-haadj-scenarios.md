---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Microsoft Entra Hybrid Join/Troubleshooting Persistent and Non-Persistent VDI scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FMicrosoft%20Entra%20Hybrid%20Join%2FTroubleshooting%20Persistent%20and%20Non-Persistent%20VDI%20scenarios"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# VDI Scenarios for Microsoft Entra Hybrid Join

## Supported Scenarios Matrix
| Device Identity | Infra | Windows | VDI Type | Supported |
|----------------|-------|---------|----------|-----------|
| HAADJ | Federated | Current | Persistent | Yes |
| HAADJ | Federated | Current | Non-persistent | Yes |
| HAADJ | Managed | Current | Persistent | Yes |
| HAADJ | Managed | Current | Non-persistent | Limited (Citrix only) |
| AADJ | Any | Current | Persistent | Limited (AVD/W365/WorkSpaces) |
| AADJ | Any | Current | Non-persistent | No |

## Critical Rule
Golden/Master image must NEVER be joined to Entra ID. Run `dsregcmd /leave` before sealing.

## Persistent VDI Guidance
- Don't use pre-1809 image that is already HAADJ
- Don't use VM snapshot from already-registered VM
- Implement stale device management process

## Non-Persistent VDI (Federated)
- Implement `dsregcmd /join` as part of VM boot sequence
- DO NOT `dsregcmd /leave` at shutdown/restart
- Deploy `BlockAADWorkplaceJoin=1` registry key to prevent dual state
- Manage stale devices aggressively (delete >15 days old)

## Non-Persistent VDI (Managed) — Best Effort Support
- Delay VM availability for end users until HAADJ completes
- Run `dsregcmd /join` every 5-10 minutes at boot (waits for AAD Connect sync)
- AAD Connect sync can take up to 30 minutes

## Roaming Profiles Warning
Never roam content under `%localappdata%`:
- `Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy`
- `Packages\Microsoft.Windows.CloudExperienceHost_cw5n1h2txyewy`
- `Microsoft\TokenBroker`, `Microsoft\OneAuth`, `Microsoft\IdentityCache`
- Related HKCU registry keys

## Common Scenarios
1. **Golden image already HAADJ**: Compare dsregcmd /status Device ID between golden and VDI
2. **Dual device state on NP-VDI**: Deploy BlockAADWorkplaceJoin, ensure join completes before user login
3. **PRT/SSO issues**: Follow Azure AD PRT troubleshooting guide
