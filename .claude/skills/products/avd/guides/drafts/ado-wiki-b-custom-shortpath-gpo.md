---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Dependencies/Networking/Custom Shortpath GPO setting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FDependencies%2FNetworking%2FCustom%20Shortpath%20GPO%20setting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Custom Shortpath GPO Setting

**Resource Lookup Note:** For more information about RDP Shortpath, review [Internal Only - RDP Shortpath Wiki](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/466638/RDP-Shortpath), [Public - RDP Shortpath Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/rdp-shortpath?tabs=managed-networks) and [RDP Shortpath QA Platform](https://platform.qa.com/resource/avd-optimization-rdp-shortpath-brown-bag-qa-recording-1854/).

This release is an extension of the existing RDP Shortpath, integrated into W365. All previous content and troubleshooting are inherited by this release.

## Overview

This feature provides a mechanism for customers to manage and configure transport policies at the Group Policy Object (GPO) level via Intune. Applied at the CPC level. Four types of Shortpath available:

- **Shortpath for managed networks**: Direct connectivity via private connection (VPN)
- **Shortpath for managed networks via STUN**: ICE/STUN direct UDP connection via managed network
- **Shortpath for public networks via STUN**: STUN direct UDP connection via public network
- **Shortpath for public networks via TURN**: TURN relayed connection through intermediate server

When both GPO policy and host pool setup are configured, priority order: VM configuration > host pool > default.

## Intune Setting

In the settings picker, under **Administrative templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Azure Virtual Desktop**:

1. RDP Shortpath setup includes:
   - Enable RDP Shortpath for managed networks policy
   - Use port range for RDP Shortpath for unmanaged networks policy
   - Customize RDP Shortpath Network Configuration:
     - RDP Shortpath for managed network using NAT traversal
     - RDP Shortpath for public network using NAT traversal
     - RDP Shortpath for public network using relay NAT traversal

## GPO Setting

Under **Computer Configuration > Policies > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Azure Virtual Desktop**:

Same policy structure as Intune, with an additional option:
- RDP Shortpath for managed network (direct, without NAT traversal)

## GPO Policy Details

Create a separate section under Remote Desktop Services > Azure Virtual Desktop > RDP Shortpath:

### Shortpath for managed network
- Direct UDP between client and session host via private connection (ExpressRoute/VPN)
- Enable/Not configured: considers managed networks paths
- Disable: does not consider managed networks path
- **Restart required** for changes to take effect

### Shortpath for managed networks via ICE/STUN
- Direct UDP via private connection when RDP Shortpath listener is NOT enabled
- ICE/STUN discovers available IP addresses and dynamic port
- Enable/Not configured: considers managed networks paths
- Disable: does not consider managed networks path
- **Restart required**

### Shortpath for public network using NAT traversal (STUN)
- Direct UDP using STUN protocol, no inbound ports required on session host
- Enable/Not configured: considers public networks non-relayed paths
- Disable: does not consider public networks non-relayed paths
- **Restart required**

### Shortpath for public network using relay NAT traversal (TURN)
- Relayed UDP through TURN intermediate server
- Enable/Not configured: considers public networks relayed paths
- Disable: does not consider public networks relayed paths
- **Restart required**

## Resources
- [QA Training](https://platform.qa.com/learning-paths/windows-365-w365-feature-custom-shortpath-gpo-setting-1854-17218/)
- [Configure RDP Shortpath - Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-rdp-shortpath)
- [Example Scenarios](https://learn.microsoft.com/en-us/azure/virtual-desktop/rdp-shortpath?tabs=public-networks#example-scenarios)
