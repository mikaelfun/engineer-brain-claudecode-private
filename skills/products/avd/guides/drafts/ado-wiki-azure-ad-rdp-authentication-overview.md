---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/Bkup/Landing Page"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/Outdated%3F%20-%20Needs%20review%20if%20still%20useful/Bkup/Landing%20Page"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD Authentication for RDP - Overview

**Private Preview has started for this feature**
**Public Preview has NOT started for this feature**
**All information is considered Microsoft internal and should not be shared with anyone outside Microsoft**

## Overview
- New authentication protocol for Azure Virtual Desktop and Remote Desktop connections
- Replaces PKU2U and RDSTLS
- Leverages Azure AD to generate RDP token to sign into Windows
- RDP token is exchanged for a PRT during Windows logon
- Token is short lived and bound to the target device for security
- Device identity is verified in Azure AD before issuing a token
- Applicable to both AAD joined and Hybrid AAD joined devices
   - Supported OS:
      - Desktop OS: Windows 10 20H2+ and Windows 11
      - Server OS: Windows Server 2019 (AAD join only), Windows Server 2022
- Will be controlled by a policy API (1P apps can get pre-authz)

## Benefits
- Native single sign-on experience without ADFS
- Azure AD used for both Gateway and Windows login
- Support for passwordless authentication
- Any credentials supported by Azure AD on that platform
- Removes special domain join requirements and need for RDSTLS
- Allows customers to enforce Conditional Access policies at sign in time

## Scenarios
- Connect to [Hybrid] Azure AD-joined desktops/apps
- Supports:
   - Azure Virtual Desktop (in preview)
   - Direct connections (mstsc) (work in progress)
   - Other Microsoft products (W365, Bastion, Arc) In design

## Requirements
- Session host must be running (goal, pending servicing):
   - Windows 11 SV2
   - Windows 10 20H2+/11 SV1 with service update
   - Windows Server 2019/2022 with service update
- No requirements on the local PC OS for AVD
   - All supported versions of Windows 10/11 and Windows server 2019+
   - MSRDC version X and above
- Non-Windows and web client supported
- Windows 10 20H2+ with service update for MSTSC connections

## Configuration changes
- Group policy to disable the protocol on the server
- Updated Azure portal UI for the new redirection
- Graph policy on Azure AD Service Principal object to issue RDP tokens

### MSRDC (AVD)
- RDP property (enablerdsaadauth) to enable the new protocol on the client
- Possibility of removing or defaulting to enabled by default in the future

### MSTSC (RDP)
- User authentication option added on Advanced tab to enable the protocol

## Consent prompt
- Default behavior for the new protocol to protect users by confirming the PC they are connecting to and consenting to access it
- Users will see this once every 30 days
- Mechanism will be available for admins to pre-consent devices in their tenant
- Plan to automatically consent AVD session hosts
