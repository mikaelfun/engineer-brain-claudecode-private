---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/VPN Profiles"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FVPN%20Profiles"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

# What is a VPN?
VPN stands for Virtual Private Network. VPN is a network tunnel that allows devices connecting from the Internet directly to the corporate network in a secure manner.

Virtual private networks (VPNs) are point-to-point connections across a private or public network, such as the Internet. A VPN client uses special TCP/IP or UDP-based protocols, called tunneling protocols, to make a virtual call to a virtual port on a VPN server. In a typical VPN deployment, a client initiates a virtual point-to-point connection to a remote access server over the Internet. The remote access server answers the call, authenticates the caller (usually using a Radius server), and transfers data between the VPN client and the organization's private network.

VPN client connections require the following:
- A RouteBased VPN Gateway (can be a Microsoft server or 3rd party server).
- A RADIUS server to handle user authentication. The RADIUS is usually deployed on-premises. The RADIUS server can be a Microsoft server (NPS) or a 3rd party RADIUS server.

# What are Intune VPN profiles?
Intune VPN profiles are a set of settings that are used to configure VPN on the devices.

Virtual private networks (VPNs) give users secure remote access to your organization network. Devices use a VPN connection profile to start a connection with the VPN server. VPN profiles in Microsoft Intune assign VPN settings to users and devices in your organization.

## VPN connection types

You can create VPN profiles using the following connection types:
- Automatic (Windows 10)
- Check Point Capsule VPN (Android DA, Android Enterprise WP, iOS/iPadOS, macOS, Windows 10, Windows 8.1)
- Cisco AnyConnect (Android DA, Android Enterprise WP, Android Enterprise FMD, iOS/iPadOS, macOS)
- Cisco IPSec (iOS/iPadOS)
- Citrix SSO (Android DA, Android Enterprise WP/FMD via App Config, iOS/iPadOS, Windows 10)
- Custom VPN (iOS/iPadOS, macOS)
- F5 Access (Android DA, Android Enterprise WP/FMD, iOS/iPadOS, macOS, Windows 10, Windows 8.1)
- IKEv2 (iOS/iPadOS, Windows 10)
- L2TP (Windows 10)
- Palo Alto Networks GlobalProtect (Android Enterprise WP via App Config, iOS/iPadOS, Windows 10)
- PPTP (Windows 10)
- Pulse Secure (Android DA, Android Enterprise WP/FMD, iOS/iPadOS, Windows 10, Windows 8.1)
- SonicWall Mobile Connect (Android DA, Android Enterprise WP/FMD, iOS/iPadOS, Windows 10, Windows 8.1)
- Zscaler (Android Enterprise WP via App Config, iOS/iPadOS)

# Secure your VPN profiles
VPN profiles can use a number of different connection types and protocols from different manufacturers. These connections are typically secured through the following methods:

- **Certificates:** When you create the VPN profile, you choose a SCEP or PKCS certificate profile. This profile is known as the identity certificate. It's used to authenticate against a trusted certificate profile.

  > **NOTE:** Certificates added using the PKCS imported certificate profile type aren't supported for VPN authentication. Certificates added using the PKCS certificates profile type are supported for VPN authentication.

- **Username and password:** The user authenticates to the VPN server by providing a user name and password.

## VPN profile deployment flow
Settings from Intune are passed to Windows clients using the VPNv2 CSP. For other device platforms it will also use the OMA-DM protocol. The VPN gateway requests authentication, client provides credentials, and VPN gateway sends to RADIUS server for verification.

# Scenarios

## iOS and Android Per App VPN
The Per-app VPN feature allows the IT pro to create and link a VPN profile to a managed application. It requires certificates (SCEP or PKCS) for authentication.

**Key difference:**
- On Android Enterprise, user starts VPN, then per-app settings determine which apps are allowed (allowlist/blocklist).
- On iOS, launching the app triggers the VPN connection.

- Per-App VPN for Android DA: https://docs.microsoft.com/en-us/mem/intune/configuration/android-pulse-secure-per-app-vpn
- Per-App VPN for iOS/iPadOS: https://docs.microsoft.com/en-us/mem/intune/configuration/vpn-setting-configure-per-app
- Android Enterprise: Use App Configuration policy

## Windows AlwaysOn VPN (AOV)
AlwaysOn VPN triggers connection as soon as device starts. Two tunnel types:
- **Device tunnel**: connects before user login, for pre-login connectivity and device management
- **User tunnel**: connects after user login, for accessing organization resources

Troubleshoot: https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/troubleshoot-always-on-vpn

## Split tunnel/force tunnel
- **Force tunneling**: all traffic routes through VPN
- **Split tunneling**: only specific destinations route through VPN, rest uses direct Internet

# Scoping Questions
1. What is the device platform?
2. Is this a profile deployment issue or a VPN connection issue?
3. Has the customer contacted involved vendors/internal networking team?
4. What VPN client/server model is being used?
5. What authentication method? (certificate/username+password)

# Support Boundaries
Intune is a **delivery mechanism** for policies and configurations. Supported:
- Policy configuration and delivery to device

Not supported / Transfer to other teams:
- NDES role installation failures
- CRL availability issues
- NDES application pool crashes
- NDES URL returns 500 instead of 403
- NPS/RADIUS authentication issues → Windows Networking team
- Windows native VPN client issues → Windows Networking team
- Third-party VPN vendor issues → Involve vendor

# FAQ and Known Issues

## VPN Disconnects or Resets during every MDM/Device Sync
- During MDM sync, string comparison between existing and "new" VPN profile
- Windows regenerates XML which may differ in formatting from Intune's version
- If mismatch detected, Intune replaces profile causing VPN disconnect
- **Fix**: Export Windows-formatted XML and use it in custom Intune profile:
  1. `$vpns = Get-CimInstance -Namespace root\cimv2\mdm\dmmap -ClassName MDM_VPNv2_01`
  2. `$vpns[0].ProfileXML | Out-File -FilePath "VPN-Corrected.XML"`
  3. Use corrected XML in Intune custom profile per: https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/vpn/vpn-profile-options#apply-profilexml-using-intune

# Troubleshooting
- General: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/troubleshoot-vpn-profiles
- Windows L2TP/IPSec: https://learn.microsoft.com/en-US/troubleshoot/windows-client/networking/l2tp-ipsec-vpn-client-connection-issue
- Always On VPN: https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/troubleshoot-always-on-vpn
- SyncML troubleshooting with VPNv2 CSP: https://learn.microsoft.com/en-us/windows/client-management/mdm/vpnv2-csp

# SME Contacts
- ATZ SMEs: Martin Kirtchayan, Carlos Jenkins
- EMEA SME: Prenkumar N, Armia Endrawos
