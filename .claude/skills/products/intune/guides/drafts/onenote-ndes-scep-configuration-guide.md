# NDES/SCEP Configuration Guide for Intune

> Source: MCVKB/Intune/NDES/Support Tip - How to configure NDES for SCEP certi.md
> Quality: guide-draft (pending SYNTHESIZE)

## Overview

End-to-end guide for configuring NDES (Network Device Enrollment Service) to deploy SCEP certificates via Intune.

## 1. NDES Service Account Setup

1. Create a dedicated service account in AD (Active Directory Users and Computers)
2. Add the account to local group `IIS_IUSRS` on the NDES computer
3. Grant `Request Certificates` permission on the Enterprise CA Security tab
4. Set SPN: `setspn -s http/<NDES server computer name> <domain>\<NDES service account>`

## 2. NDES Server Installation

1. Add ADCS role via Server Manager → Add Roles and Features
2. Select Network Device Enrollment Service role
3. Post-installation: specify NDES service account and connect Enterprise CA
4. **CA and NDES must be on separate servers**

## 3. NDES Server Configuration

### IIS Configuration
- Default Website → Request Filtering → Edit Feature Settings
- Set Maximum URL length and Maximum query string to accommodate large SCEP requests

### Registry Configuration
- `HKLM\SYSTEM\CurrentControlSet\Services\HTTP\Parameters` - configure for large HTTP requests
- Without this, devices get: "Experiencing authentication issues" / "The portal is having issues getting authentication tokens"

### External Publishing
- Publish NDES via Azure Application Proxy or Windows Application Proxy (WAP)
- Configure internal URL as NDES server FQDN
- Note the generated External URL for later use

## 4. SSL Certificate Setup

1. On Enterprise CA: duplicate `Web Server` template
2. Configure: client + server authentication under Extensions → Application Policies
3. Grant NDES server computer account Read + Enroll on Security tab
4. Subject Name tab: check "Supply in the request"
5. Issue the new template
6. On NDES server: request cert using the new template via MMC
   - Subject name: Common name = NDES internal FQDN
   - SAN: DNS = internal FQDN + external FQDN
7. Bind the SSL cert in IIS on port 443
8. **Restart NDES server**

## 5. NDES Certificate Template

1. On Enterprise CA: duplicate `User` template
2. Subject Name: "Supply in the request"
3. Extensions: ensure Client Authentication
4. Key Usage: un-check "Signature is proof of origin" (required for iOS)
5. Request Handling: do NOT allow private key export
6. Security: grant NDES service account Read + Enroll
7. Cryptography: minimum key size 2048
8. Issue the template

### Registry Mapping (Critical!)
On NDES server: `HKLM\Software\Microsoft\Cryptography\MSCEP`
- `SignatureTemplate` → Signature purpose
- `EncryptionTemplate` → Encryption purpose
- `GeneralPurposeTemplate` → Signature and encryption purpose

Set the value to your template name based on the template's purpose setting.

## 6. Intune Connector Installation

1. Intune Portal → Device Configuration → Certificate Connectors → Add → Download
2. Copy installer to NDES server, run as admin
3. Select the SSL certificate (client/server authentication cert from step 4)
4. Sign in with **Global Administrator or Intune Administrator**
5. **Restart NDES server** after installation

## 7. SCEP Profile in Intune

### Prerequisites
- Deploy trusted root certificate profile first
- For Android: export root cert from both root CA and issuing CA
- For iOS: only root CA certificate needed
- Command: `certutil -ca.cert C:\root.cer`

### Key Usage Mapping
| SCEP Profile Key Usage | Registry Key Read |
|---|---|
| Digital signature | SignatureTemplate |
| Key encipherment | EncryptionTemplate |
| Both | GeneralPurposeTemplate |

### SCEP Server URL Format
```
https://<external FQDN of NDES server>/certsrv/mscep/mscep.dll
```

## Common Issues (Cross-reference)

- Proxy format error → intune-onenote-099
- Password expired / RPC failure → intune-onenote-100
- TLS 1.2 not enabled → intune-onenote-101
- NDES stops after KB update → intune-onenote-088
- NDES HTTP 500 → intune-onenote-089
- SCEP infrastructure troubleshooting workflow → intune-onenote-094
