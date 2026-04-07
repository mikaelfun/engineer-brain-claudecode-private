---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/NDES and SCEP"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FNDES%20and%20SCEP"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# About NDES and SCEP

## Overview
- **SCEP** (Simple Certificate Enrollment Protocol) — deploys authentication certificates to devices for VPN/Wi-Fi/app access.
- **NDES** (Network Device Enrollment Service) — on-premises server that requests certificates from CA on behalf of devices.
- **Microsoft Intune Certificate Connector** — bridges NDES and Intune service.

## Architecture Flow
1. SCEP policy sent to device
2. Device requests GetCACert and GetCACaps from NDES URL
3. Device generates keypair, sends CSR with challenge password
4. MSCEP-RA certs encrypt/sign the request
5. Certificate Connector validates CSR with Intune service
6. Intune validates challenge (60min validity) and tenant membership
7. NDES sends CSR to CA via DCOM
8. CA issues certificate using specified template
9. Certificate delivered to device; connector notifies Intune

## Configuration Resources
- [Configure NDES for SCEP](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-scep-configure)
- [Configure SCEP profile](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-profile-scep)

## Scoping Questions
- What profiles are being pushed? Sub CA involved?
- What platform? (Android, iOS, Windows, macOS)
- Enrollment type?
- How many devices affected?
- Fresh NDES setup or existing? When did it stop working?
- Are Root and SCEP profiles targeted to same groups?
- Profile status in portal? (Failed, Pending, Succeeded)
- Intune device ID and affected UPN?
- Profile names (Trusted cert and SCEP)?
- Company Portal logs from affected device?
- NDES validation script logs?

## Support Boundaries
Intune supports policy configuration and delivery only. Transfer to Windows Directory Services for:
- NDES role installation failures
- CRL unavailability
- NDES application pool crashes
- NDES URL returning 500 instead of 403

Use Assist365, Kusto, and device logs to verify Intune-side config. If correct → not an Intune problem.

## Troubleshooting

### Log Collection
Run NDES Validator script:
```powershell
Invoke-WebRequest https://aka.ms/NDESValidatorPS1 -outfile NDESValidator.ps1
Invoke-WebRequest https://aka.ms/NDESValidatorcsv -outfile ResultMessages.csv
PowerShell -ExecutionPolicy Bypass -File .\NDESValidator.ps1
```

### IIS Log Analysis
Check for expected flow in IIS logs (C:\inetpub\logs\LogFiles\W3SVC1):
1. GET CACert message
2. GET GetCACaps message
3. POST PKIOperation

If no requests → networking issue blocking device access to NDES.

### NDES URL Validation
- GetCACert: `https://ndes.externalfqdn.com/certsrv/mscep?operation=GetCACert&message=MyDeviceID`
- GetCACaps: `https://ndes.externalfqdn.com/certsrv/mscep?operation=GetCACaps&message=MyDeviceID`

### IIS SSL Settings
- Default WebSite: Require SSL, Client certificates: Ignore
- CertificateRegistrationSvc: Require SSL, Client certificates: Require

### SSL Certificate Requirements
- Subject name: External name in Common Name format
- SAN: External + Internal name in DNS name format
- Usage: Server Authentication

### Only GetCACert Received (No GetCACaps/PKIOperation)
→ Most likely a certificate chain issue. Capture Android device logs for most information.

### CA Reachability (TCAInfo)
- CA not reachable → Transfer to PKI team
- Template not shown in TCAInfo → Template not published on CA

## SME Contacts
- ATZ: Carlos Jenkins, Jesus Santaella, Martin Kirtchayan, David Meza Umana, Manoj Kulkarni
- EMEA: Karin Galli Bauza, Armia Endrawos, Ameer Ahmad, Ammar Tawabini, Jordi Segarra
- APAC: Xinkun Yang, Joe Yang, Conny Cao, Gaurav Singh
- Teams channel: Device Config - Certificates, Email, VPN and Wifi
- Full SME list: https://aka.ms/IntuneSMEs
