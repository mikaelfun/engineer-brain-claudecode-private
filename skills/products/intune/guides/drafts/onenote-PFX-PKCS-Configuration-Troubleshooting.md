# Configuring and Troubleshooting PFX/PKCS Certificates in Intune

**Source**: OneNote - Configuring and Troubleshooting PFX/PKCS Certificates
**ID**: intune-onenote-389

## Overview

End-to-end guide for configuring PKCS (PFX) certificate deployment via Intune. Covers Enterprise CA template setup, Intune Certificate Connector installation, profile creation/assignment, and troubleshooting.

## Prerequisites

- Active Directory domain (all servers joined)
- Enterprise CA (AD CS) - not standalone CA
- Client machine to connect to Enterprise CA
- Exported root certificate (.cer)
- Intune Certificate Connector (NDES Certificate Connector)

## Configuration Tasks

### Task A: Configure Certificate Templates on CA

1. Open Certificate Templates snap-in on issuing CA
2. Create new custom template or copy existing (e.g., User template)
3. Key settings:
   - **Subject Name**: "Supply in the request"
   - **Extensions**: Include "Client Authentication" in Application Policies
   - **Request Handling**: Purpose = "Signature and Encryption", enable "Allow private key to be exported"
   - **Security**: SYSTEM needs Read + Enroll; add NDES connector computer account with Read + Enroll
4. Publish template: Certificate Templates node > Action > New > Certificate Template to Issue
5. Ensure connector computer has Enroll permission on CA Security tab

**Note**: For certificate revocation, SYSTEM needs "Issue and Manage Certificates" rights per template.

### Task B: Install and Configure Intune Certificate Connector

1. Download from: Intune > Device Configuration > Certification Connectors > Add > Download
2. Run `ndesconnectorssetup.exe` as admin on machine that can reach the CA
3. Choose **PFX Distribution** option
4. Sign in with **Global Admin** (must have Intune license)
5. Restart Intune Connector Service: `services.msc` > right-click > Restart

### Task C: Create and Deploy Certificate Profiles

1. Export Trusted Root CA as .cer (no private key)
2. Create **Trusted Certificate** profile (Root CA)
3. Create **PKCS #12 (.PFX)** profile:
   - **Certification Authority**: Internal FQDN (e.g., `server1.domain.local`)
   - **Certification Authority Name**: As displayed in CA MMC under "Certification Authority (Local)"
   - Verify with: `certutil -config - -ping`
4. Assign profiles to groups

## PFX Request Flow

1. Admin creates PFX certificate profile
2. Intune requests on-prem connector to create certificate
3. Connector sends PFX blob to on-prem CA
4. CA issues PFX user certificate back to connector
5. Connector uploads encrypted PFX to Intune
6. Intune re-encrypts for device using Device Management Certificate
7. Status reported back to Intune

## Key Log Files

| Log | Location | Viewer |
|-----|----------|--------|
| NDESConnector svclog | `C:\Program Files\Microsoft Intune\NDESConnectorSvc\Logs\Logs` | Service Trace Viewer (Windows SDK) |
| PFX Request files | `C:\Program Files\Microsoft Intune\PfxRequest\Succeed` | Text editor |
| iOS console logs | Mac Console app | Xcode / Console |
| Android logs | Company Portal (OMADMLOG) | Text editor |

## Troubleshooting Tips

1. **Most common issue**: Wrong Certification Authority or Certification Authority Name in profile. Verify with `certutil -config - -ping`
2. Check device logs (OMADMLOG for Android, Console for iOS)
3. Check `NDESConnector_Date.svclog` for errors
4. Check CA "Failed Requests" folder for errors
5. Check `\Microsoft Intune\PfxRequest` folders for failed/stuck requests
