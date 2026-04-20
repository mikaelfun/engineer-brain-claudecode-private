---
title: SCEP Certificate Troubleshooting Overview
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/certificates/troubleshoot-scep-certificate-profiles
product: intune
date: 2026-04-18
---

# SCEP Certificate Troubleshooting Overview

## SCEP Communication Flow

1. **Deploy SCEP certificate profile** - Intune generates challenge string (user, purpose, cert type)
2. **Device to NDES server** - Device uses URI from profile to contact NDES and present challenge
3. **NDES to policy module** - NDES forwards challenge to Intune Certificate Connector policy module for validation
4. **NDES to CA** - NDES passes valid requests to Certification Authority
5. **Certificate delivery to device** - Certificate delivered back to device
6. **Reporting to Intune** - Connector reports certificate issuance event

## Key Log Files

### Infrastructure Logs
- **Intune Connector logs**: Event Viewer > Applications and Services Logs > Microsoft > Intune > CertificateConnectors > Admin/Operational
- **IIS logs**: `c:\inetpub\logs\LogFiles\W3SVC1`

### Device Logs
- **Android (BYOD work profile)**: OMADM.log - upload via USB cable or email
- **Android (COPE/COBO/COSU)**: CloudExtension.log
- **iOS/iPadOS**: Console app on Mac > Include Info/Debug Messages > reproduce > save
- **Windows**: Event Viewer > DeviceManagement-Enterprise-Diagnostics-Provider

## Prerequisites
- Root certificate deployed through trusted certificate profile
- NDES configured per Intune documentation
- Verbose logging enabled on Android before collecting logs
