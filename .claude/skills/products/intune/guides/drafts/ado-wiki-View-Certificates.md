---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/NDES and SCEP/View Certificates"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FNDES%20and%20SCEP%2FView%20Certificates"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# View Certificates

Reference guide for viewing Trusted and SCEP certificates on each platform.

> **TIP**: In all operating systems except Windows, the Thumbprint is found under the SHA-1 value.

## 1. Android Personally Owned Work Profile (BYOD)

### Trusted Certificates in Settings
- Settings > search "Certificates" > View security certificates > User > Work

### Trusted/SCEP Certificates via X-509 app
- Use "X509 Certificate Viewer Tool" (push via Managed Google Play Store for Enterprise enrollment)
- SCEP cert shows as `User{Thumbprint}` (e.g., UserF1EA2F39EA7ACEBA5E6DD8BCFF4DEB1F2B5001B6)

## 2. Android Device Owner (DO)

### Trusted Certificates in Settings
- Settings > search "Certificates" > View security certificates > User

### SCEP via Settings
- Settings > search "Certificates" > User certificates > shows as `User {policyID}`

### SCEP via X-509 app
- Shows as `User {PolicyID}` (e.g., User 113122ab-xxxx-xxxx-xxxx-4cc5e955becd)

## 3. iOS Profiles

### Trusted Certificates
- Settings > General > VPN & Device Management > Management Profile > More Details > Certificates
- Root: "Credential Profile - thumbprint"; Intermediate: "PKCS1 Credential Profile - thumbprint"

### SCEP Certificates
- Settings > General > VPN & Device Management > Management Profile > More Details > SCEP DEVICE IDENTITY CERTIFICATES
- Look for certs issued by local CA (ignore Microsoft Intune / MS-Organization-Access)
- Note: iOS may show duplicate certificates for SCEP (one per dependent profile)

## 4. macOS Profiles

### Trusted Certificates in Management Profile
- macOS 14 and below: Settings > Privacy & Security > Profiles
- macOS 15+: Settings > General > Device Management
- Root: "Credential Profile - thumbprint"; Intermediate: "PKCS1 Credential Profile - thumbprint"

### Trusted/SCEP Certificates in Keychain
- Keychain Access > System > Certificates

### SCEP Certificate Chain
- Select cert in Keychain > Keychain Access menu > Certificate Assistant > Evaluate > Generic > Continue > Done

## 5. Windows Profiles

### Trusted Certificates via MMC
- mmc > File > Add/Remove Snap-in > Certificates > Computer Account
- Trusted Root: Certificates (Local Computer) > Trusted Root Certification Authorities > Certificates
- Intermediate: Certificates (Local Computer) > Intermediate Certification Authorities > Certificates

### SCEP Certificates via MMC
- User cert: snap-in "My User Account" > Personal > Certificates
- Device cert: snap-in "Computer Account" > Personal > Certificates
- Check: Issued to, Valid From, Subject, Subject Alternative Name, Thumbprint, Certification Path

### Keywords to verify on all platforms
- Subject Name / Issued to
- Validity Period / Valid From
- SHA-1 / Thumbprint
- Certification Path
- Subject Alternative Name (SCEP)
