---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/WiFi Profiles"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FWiFi%20Profiles"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Wi-Fi Profiles in Intune

## Overview
Wi-Fi profiles are settings used to configure Wi-Fi on devices. Intune supports:
- Android 4+, Android Enterprise, iOS 8.0+, iPadOS 13.0+, macOS X 10.11+, Windows 10+, Windows 10 Mobile, Windows Holographic for Business.
- Windows 8.1: import-only.

## Profile Types
1. **UI-created profiles**: Device Configuration > Wi-Fi (all platforms)
2. **Custom Wi-Fi profiles**: OMA-URI + XML (Windows, Android)
3. **Wi-Fi imported profiles**: Export from connected device, import to Intune (Windows 8.1+)

## Prerequisites (Enterprise Wi-Fi)
- Wireless AP supporting WPA/WPA2 Enterprise
- Active Directory
- Certificate Authority
- RADIUS Server

## Key Configuration Tips
- **Cert Auth**: Always target SCEP/PKCS, root certificate, and Wi-Fi profiles to the **same group(s)**
- **Cert Auth**: Use **user certificate** instead of device certificate (works flawlessly for most scenarios)
- **NPS (RADIUS)**: Use UPN as SAN for user certificates, FQDN as SAN for device certificates
- Dependent policies: VPN/WiFi profile may not be applied if dependent policies have different targeting

## Support Boundaries
- Intune supports **policy configuration and delivery** only
- Intune does NOT guarantee connectivity
- Connectivity issues (intermittent disconnection, failed connectivity) → transfer to Windows Networking team or customer's network team
- If settings are delivered successfully → not an Intune problem

## Troubleshooting Workflow

### Intune Portal Troubleshooting
Public docs: Troubleshooting Wi-Fi profile issues in Microsoft Intune

### Backend Troubleshooting

**Assist365:**
- Check policy settings and targeting
- Verify Root, SCEP/PKCS, and Wi-Fi profiles target same group
- Export targeted policy for affected device and match settings

**Kusto:**
- Check IntuneEvent table for policy processing and compliance state
- Filter on device ID and time, project message column
- If non-compliant: identify which settings caused it

### Infrastructure Troubleshooting (extra mile)
Not in Intune scope, but can help quick-check:
- RADIUS/NPS server connectivity
- Certificate chain validation
- 802.1X authentication: https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/802-1x-authentication-issues-troubleshooting
- EAP-TLS/PEAP certificate requirements: https://learn.microsoft.com/en-US/troubleshoot/windows-server/networking/certificate-requirements-eap-tls-peap

## SME Contacts
- ATZ: Carlos Jenkins, Jesus Santaella, Martin Kirtchayan, David Meza Umana, Manoj Kulkarni
- EMEA: Karin Galli Bauza, Armia Endrawos, Ameer Ahmad, Ammar Tawabini, Jordi Segarra, Khalid Hussein
- APAC: Xinkun Yang, Joe Yang, Conny Cao, Gaurav Singh

Teams Channel: Device Config - Certificates, Email, VPN and Wifi
