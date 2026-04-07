---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/🤝Dependencies/Networking/Custom Shortpath GPO setting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2F%F0%9F%A4%9DDependencies%2FNetworking%2FCustom%20Shortpath%20GPO%20setting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Custom Shortpath GPO Setting

**Contributors:** Jose Che Murillo

## Overview

This feature provides GPO-level control for RDP Shortpath transport policies via Intune or Group Policy.

Four types of Shortpath are available:
- **Shortpath for managed networks**: Direct connectivity via VPN/ExpressRoute private peering (requires listener + inbound port on session host)
- **Shortpath for managed networks via STUN**: Direct UDP using ICE/STUN without requiring inbound port
- **Shortpath for public networks via STUN**: Direct UDP using STUN (no inbound ports required)
- **Shortpath for public networks via TURN**: Relayed UDP via intermediate server (fallback when direct connection not possible)

Reference: [RDP Shortpath - Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/rdp-shortpath?tabs=public-networks)

This Custom GPO configuration is **optional** and can be used alongside the existing GPO to disable UDP entirely.

**Priority order**: VM-level GPO → Host pool setting → Default

## Intune Configuration

In Intune Admin Center → Settings picker:
- **Path**: Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Azure Virtual Desktop > **RDP Shortpath**

Policies available under RDP Shortpath:
1. Enable RDP Shortpath for managed networks (moved from Azure Virtual Desktop)
2. Use port range for RDP Shortpath for unmanaged networks (moved from Azure Virtual Desktop)
3. **Customize RDP Shortpath Network Configuration** — options:
   - RDP Shortpath for managed network using NAT traversal
   - RDP Shortpath for public network using NAT traversal
   - RDP Shortpath for public network using relay NAT traversal

## GPO Configuration

**Path**: Computer Configuration > Policies > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Azure Virtual Desktop > **RDP Shortpath**

Same policy options as Intune.

## Policy Details

| Policy | Description | Default (Not Configured) |
|--------|-------------|--------------------------|
| RDP Shortpath for managed network | Direct UDP via private connection (VPN/ExpressRoute); requires inbound port on session host | Enabled |
| RDP Shortpath for managed network via NAT traversal (ICE/STUN) | Direct UDP via private connection without requiring inbound port | Enabled |
| RDP Shortpath for public networks via NAT traversal (STUN) | Direct UDP via public network; no inbound ports required | Enabled |
| RDP Shortpath for public network via relay NAT traversal (TURN) | Relayed UDP via TURN server for fallback | Enabled |

> All policies: require Windows restart to take effect

## Resources
- [RDP Shortpath configuration - Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-rdp-shortpath)
- [Example scenarios](https://learn.microsoft.com/en-us/azure/virtual-desktop/rdp-shortpath?tabs=public-networks#example-scenarios)
- [QA Training - W365 Custom Shortpath GPO](https://platform.qa.com/learning-paths/windows-365-w365-feature-custom-shortpath-gpo-setting-1854-17218/)
