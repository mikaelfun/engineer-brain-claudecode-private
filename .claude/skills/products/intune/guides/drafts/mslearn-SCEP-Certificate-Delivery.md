---
title: SCEP Certificate Delivery Troubleshooting
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/certificates/troubleshoot-scep-certificate-delivery
product: intune
date: 2026-04-18
---

# SCEP Certificate Delivery Troubleshooting

## Verify Certificate Issued by CA
Check CA for issued certificate entry after NDES processes the request.

## Device-Specific Verification

### Android
- **Device Admin**: notification prompts user to install certificate
- **Android Enterprise/Samsung Knox**: certificate installs automatically and silently
- OMADM log shows state transitions:
  - `CERT_INSTALL_REQUESTED` -> `CERT_INSTALLING` -> `CERT_INSTALL_SUCCESS` (root cert)
  - `CERT_ENROLLED` -> `CERT_INSTALL_REQUESTED` -> `CERT_INSTALLING` -> `CERT_ACCESS_REQUESTED` -> `CERT_ACCESS_GRANTED` (SCEP cert)

### iOS/iPadOS
- View certificate under Settings > General > Device Management Profile
- Debug log shows: synchronous URL requests to NDES for GetCACert, GetCACaps, PKIOperation
- Success: `Profile 'www.windowsintune.com.SCEP...' installed`

### Windows
- Event Viewer > Event ID 39: "SCEP: Certificate installed successfully"
- Verify via certmgr.msc:
  - Root cert in Certificates (Local Computer) > Trusted Root CAs
  - SCEP cert in Certificates - Current User > Personal > Certificates
  - Issued By should match CA name

## Troubleshooting Failures
- **Android**: Review OMA DM log errors
- **iOS**: Review device debug log errors
- **Windows**: Check Event log; delivery/installation errors are typically Windows operations issues, not Intune-specific
