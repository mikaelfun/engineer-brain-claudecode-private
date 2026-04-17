# Intune Support Boundaries Reference

## Source
- OneNote: Mooncake POD Support Notebook > Intune > MISC > Intune Support Boundaries
- Official: https://internal.evergreen.microsoft.com/en-us/topic/507f25e6-35ad-88cf-b79d-33336759ce5e

## General Rule
The Microsoft Intune team (CSS + PG) owns support for the configuration and functionality of **all Windows CSPs**. Troubleshoot CSP issues the same way as any other Intune policy issue.

## Support Boundaries by Area

### Apps - Deployment
| Platform | Reference |
|----------|-----------|
| iOS | internal.evergreen: f9fc01a4-e31b-7aea-7f2a-112ebd83c969 |
| iPadOS | internal.evergreen: 095ba4fc-46f3-8040-c43a-f9666a1e5691 |
| Android | internal.evergreen: 721e4e1a-4051-b5d0-da17-7b280e46816e |
| Windows | internal.evergreen: 95c48483-dcca-9e2d-e7ea-6114e19736ae |
| macOS | internal.evergreen: 95c48483-dcca-9e2d-e7ea-6114e19736ae |

### Apps - Development (SDK/Wrapping)
- App Wrapping Tool: Android, iOS, macOS
- App SDK: Android, iOS, Xamarin
- Graph API

### Apps - Protection and Configuration
- App Protection Policies (APP/MAM)
- App Configuration Profiles
- Windows Information Protection (WIP)

### Autopilot
- All Autopilot scenarios

### Conditional Access
- App-based CA
- Device-based CA
- Exchange On-Premise CA

### Device Actions
- All remote actions (wipe, retire, restart, etc.)

### Device Compliance
- All compliance policies and evaluation

### Device Config: Certificates, Email, VPN, WiFi
- NDES/SCEP, PKCS, VPN Profiles, WiFi Profiles, Email Profiles, MS Tunnel VPN

### Device Config: Features, Restrictions, Custom
| Platform | Reference |
|----------|-----------|
| iOS/iPadOS | internal.evergreen: ca4dbe50-a995-7fdd-7bda-518654b0ee17 |
| macOS | internal.evergreen: 6053b420-38f6-ad8b-3272-13e74b875dce |
| Android | internal.evergreen: 6661c0a9-155a-0b4e-89bf-fcab74fa29b9 |
| Windows | internal.evergreen: bd7ff4ad-fb4d-9217-f783-6537b70e8594 |

### MDM Enrollment
- iOS, Android, Windows, macOS enrollment
- Windows MDM

### Security
- Security Baselines, Tasks, Policies
- Microsoft Defender for Endpoint integration
- Firewall Rule Migration
- Disk Encryption (BitLocker/FileVault)

### Third-Party Integration
- Jamf Pro, Cisco ISE, Citrix Netscaler, Lookout, SEP Mobile, Check Point Harmony, MobileIron, Zebra MX
- Partner Compliance (MTD)

### Windows 365
- Enterprise Cloud PC, Business Cloud PC

### Other
- Endpoint Analytics
- Intune for Education
- MEMCM Integration (Co-Management, Tenant Attach)
- RBAC, Users/Groups, Update Rings, Feature Updates
