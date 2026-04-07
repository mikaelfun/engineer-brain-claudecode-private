# PFX/PKCS Certificate Configuration & Troubleshooting in Intune

## Prerequisites

- Active Directory domain (all servers joined)
- Enterprise Certification Authority (AD CS) — NOT standalone CA
- Client to connect to Enterprise CA
- Exported root certificate (.cer)
- Intune Certificate Connector (NDES Certificate Connector)

## Configuration Tasks

### Task A: Configure Certificate Templates on CA

1. Create/copy certificate template (e.g., User template)
2. Set **Compatibility Settings** appropriately
3. Subject Name → **Supply in the request**
4. Extensions → Include **Client Authentication**
5. Request Handling → Purpose: **Signature and Encryption**, enable **Allow private key to be exported**
6. Security → SYSTEM needs Read/Enroll; Connector computer needs Read/Enroll
7. Publish template via CA snap-in → Certificate Templates → New → Certificate Template to Issue
8. CA computer Security tab → Connector host needs Enroll permission

> **NOTE:** To revoke certificates, SYSTEM needs **Issue and Manage Certificates** rights for each template.

### Task B: Install Intune Certificate Connector

1. Download from Endpoint Management admin center → Device Configuration → Certification Connectors → Add
2. Run `ndesconnectorssetup.exe` as admin on CA-accessible machine
3. Choose **.PFX Distribution** option
4. Sign in with **Global Admin** (must have Intune license)
5. Restart **Intune Connector Service** via services.msc

### Task C: Deploy Certificate Profiles

1. Export Trusted Root CA certificate as **.cer** (no private key)
2. Create **Trusted Certificate** profile (Android/iOS)
3. Create **.PFX certificate** profile:
   - **Certification Authority**: Internal FQDN of CA (e.g., `server1.domain.local`)
   - **Certification Authority Name**: As shown in CA MMC under **Certification Authority (Local)**
   - Verify with: `certutil -config - -ping`
4. Assign profiles to groups

## PFX Workflow

1. Admin creates PFX certificate profile
2. Intune Service requests On-Prem Connector to create certificate
3. Connector sends PFX Blob + Request to On-Prem CA
4. CA issues PFX User Certificate → sends to Connector
5. Connector uploads encrypted PFX User Certificate to Intune
6. Intune re-encrypts for device using Device Management Certificate → sends to device
7. Certificate status reported back to Intune

## Key Log Files

| Log | Location |
|-----|----------|
| NDESConnector svclog | `C:\Program Files\Microsoft Intune\NDESConnectorSvc\Logs\Logs` |
| PFX Success | `C:\Program Files\Microsoft Intune\PfxRequest\Succeed` |
| PFX Failed | `C:\Program Files\Microsoft Intune\PfxRequest` (check subfolders) |
| iOS Console logs | Mac Console app → select iOS device |
| Android logs | Company Portal → OMADMLOG |

Use **Service Trace Viewer** (from Windows SDK) to read `.svclog` files.

## Troubleshooting Checklist

1. **Verify profile settings** — most common issue. Check typos in CA FQDN and CA Name. Run `certutil -config - -ping` to confirm.
2. **Check device logs** — OMADMLOG (Android), Console logs (iOS)
3. **Check NDESConnector svclog** for errors
4. **Check CA → Failed Requests** folder for certificate issuance errors
5. **Check `\Microsoft Intune\PfxRequest`** folders for failed/stuck requests

---
*Source: OneNote — Configuring and Troubleshooting PFX/PKCS Certificates in Microsoft Intune*
