# SCEP Certificate Troubleshooting Overview

> Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/certificates/troubleshoot-scep-certificate-profiles)

## SCEP Communication Flow (6 Steps)

1. **Deploy SCEP certificate profile** → Intune generates challenge string
2. **Device to NDES** → Device uses URI from profile to contact NDES server
3. **NDES to Policy Module** → NDES forwards challenge to Intune Certificate Connector policy module for validation
4. **NDES to CA** → NDES passes valid requests to Certification Authority
5. **Certificate delivery** → Certificate delivered to device
6. **Reporting** → Intune Certificate Connector reports issuance event to Intune

## Prerequisites
- Root certificate deployed through trusted certificate profile
- Applies to Android, iOS/iPadOS, Windows (macOS info not available)

## Key Log Locations

### Infrastructure (NDES Server)
- **Intune Connector Logs**: Event Viewer → Applications and Services Logs → Microsoft → Intune → CertificateConnectors → Admin/Operational
- **IIS Logs**: `c:\inetpub\logs\LogFiles\W3SVC1`

### Android
- BYOD (work profile): `OMADM.log`
- COPE/COBO/COSU: `CloudExtension.log`
- Enable Verbose Logging before collecting

### iOS/iPadOS
- Console app on Mac → Include Info Messages + Debug Messages
- Company Portal log does NOT contain SCEP info

### Windows
- Event Viewer → Applications and Services Logs → Microsoft → Windows → DeviceManagement-Enterprise-Diagnostics-Provider

## Related Troubleshooting Articles
- SCEP profile deployment (Step 1)
- Device to NDES communication (Step 2)
- NDES to policy module (Step 3)
- NDES to CA (Step 4)
- Certificate delivery (Step 5)
- Reporting (Step 6)
- NDES configuration verification
