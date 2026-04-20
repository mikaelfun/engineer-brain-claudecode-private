---
title: "SCEP Device to NDES Server Communication Troubleshooting"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/mem/intune/certificates/troubleshoot-scep-certificate-device-to-ndes"
product: intune
tags: [SCEP, NDES, IIS, certificates, troubleshooting]
---

# SCEP Device to NDES Server Communication Troubleshooting

Comprehensive diagnostic guide for troubleshooting device-to-NDES server connectivity during SCEP certificate enrollment.

## Step 1: Review IIS Logs

On the NDES server, check IIS logs at `%SystemDrive%\inetpub\logs\logfiles\w3svc1`:

- **Status 200**: Connection successful
- **Status 500**: IIS_IUSRS group may lack "Impersonate a client after authentication" permission
- **No entry logged**: Network blocking between device and NDES

## Step 2: Review Device Logs

### Android
- OMADM log: Look for `Sending GetCACaps` and `Received '200 OK'`
- Key entries: "There are 1 requests", "Signing pkiMessage"

### iOS/iPadOS
- Debug log via Console app: Look for `operation=GetCACert`, `Attempting to retrieve issued certificate`, `Sending CSR via GET`

### Windows
- Event Viewer > DeviceManagement-Enterprise-Diagnostic-Provider > Admin
- Event ID 36: "SCEP: Certificate request generated successfully"

## Step 3: Test SCEP Server URL

1. Copy Server URL from SCEP certificate profile
2. Browse to URL - should get **HTTP Error 403.0 Forbidden** (indicates correct setup)
3. If different error, diagnose per error type below

## Common Errors and Solutions

| Error | Root Cause | Solution |
|-------|-----------|----------|
| General NDES message | Intune Connector not installed correctly | Check SetupMsi.log, reinstall if needed, run `iisreset` |
| HTTP 503 | SCEP app pool not started | Start SCEP application pool in IIS Manager |
| HTTP 503 (crash) | Intermediate CA certs in Trusted Root | Remove intermediate certs from Trusted Root store |
| HTTP 503 (crash) | Windows Auth enabled on CertRegistrationSvc | Enable Anonymous Auth, disable Windows Auth |
| HTTP 503 (crash) | NDESPolicy module cert expired | Renew cert, reinstall connector |
| GatewayTimeout | App Proxy Connector service stopped | Start the service, set to Automatic |
| HTTP 414 | IIS request filtering limits too low | Set MaxFieldLength and MaxRequestBytes to 65534 |
| Page can't be displayed | Wrong external URL in App Proxy | Use default msappproxy.net domain |
| 500 Internal | NDES service account locked/expired | Unlock account or reset password |
| 500 Internal | MSCEP-RA certificates expired | Renew CEP Encryption and Exchange Enrollment Agent certs |
