---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/troubleshoot-wi-fi-profiles"
importDate: "2026-04-21"
type: guide-draft
---

# Troubleshooting Wi-Fi Device Configuration Profiles in Intune

## Android Wi-Fi Profile Troubleshooting
1. Install prerequisite profiles in order: Trusted Root > SCEP > Wi-Fi
2. Review Company Portal Omadmlog.log for wifimgr entries
3. Key success log: Successfully applied, enabled and saved wifi profile
4. On Device Admin devices: multiple certs may be listed; select newest
5. Android Enterprise and Samsung Knox auto-manage cert selection

## iOS/iPadOS Wi-Fi Profile Troubleshooting
1. Verify Trusted Root and SCEP profiles in Settings > General > Profiles
2. Check Console.app logs on Mac for Wi-Fi profile XML parsing

## Windows Wi-Fi Profile Troubleshooting
1. Check Event Viewer: DeviceManagement-Enterprise-Diagnostic-Provider > Admin
2. Verify certificate chain via certlm.msc
3. Use netsh wlan show profiles to verify deployment
4. Check wireless AutoConfig service is running

## Common Issues
- Certificate EKU mismatch between SCEP profile and CA template
- Wi-Fi profile stuck in Pending when prerequisite cert profiles fail
- RADIUS server rejecting client certificate
