---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AskDS Blog Content/20240902 Remote Desktop Services enrolling for TLS certificate from an Enterprise CA"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAskDS%20Blog%20Content%2F20240902%20Remote%20Desktop%20Services%20enrolling%20for%20TLS%20certificate%20from%20an%20Enterprise%20CA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# RDS TLS Certificate Enrollment from Enterprise CA

## How RDS Certificate Works

RDS looks for a certificate in the computer personal store with EKU:
- **Remote Desktop Authentication** (OID `1.3.6.1.4.1.311.54.1.2`) - preferred
- Or **Server Authentication**

The **Remote Desktop Configuration service (SessionEnv)** is responsible for initial certificate requests and renewals (not the RDS service itself). SessionEnv maintains the certificate thumbprint in WMI (`SSLCertificateSHA1Hash`).

## Critical Rule: DO NOT Use Autoenrollment

Autoenrollment on the RDS certificate template **WILL cause problems**:
1. Autoenrollment archives the existing certificate during renewal
2. RDS can no longer find the original certificate (thumbprint mismatch)
3. Users fail to connect when TLS is required on the RDS Listener
4. SessionEnv will eventually re-enroll at next service start when it detects the thumbprint is gone
5. Autoenrollment does NOT set correct private key permissions for Network Service

## Correct Setup

### Template Configuration
1. Duplicate the **Computer** template
2. Compatibility: up to Windows Server 2012 R2
3. General: descriptive name, desired validity. **Do NOT** check "Publish certificate in Active Directory"
4. Extensions > Application Policies: **Remove** Client Auth and Server Auth. **Add** Remote Desktop Authentication (OID `1.3.6.1.4.1.311.54.1.2`)
5. Security: Add computer/groups with **Allow Enroll** only. **DO NOT select Autoenroll**
6. Note: Domain Controllers are NOT in Domain Computers group - add separately if needed

**Important:** Copy the **Template Name** (not Display Name) for Group Policy configuration.

### Group Policy Configuration
Path: `Computer Configuration\Policies\Administrative Templates\Windows Components\Remote Desktop Services\Remote Desktop Session Host\Security`
Policy: **Server authentication certificate template**
Value: Certificate Template Name (NOT display name, NOT OID)

If you use the Display Name, SessionEnv will successfully enroll but will re-enroll on every policy refresh.

## Troubleshooting

### Check Current RDS Certificate
```powershell
# PowerShell - get current thumbprint
Get-WmiObject -Class "Win32_TSGeneralSetting" -Namespace Root\cimv2\Terminalservices

# WMIC (deprecated)
wmic /namespace:\\root\cimv2\TerminalServices PATH Win32_TSGeneralSetting Get SSLCertificateSHA1Hash
```

**Self-signed cert location:** `Certificates - Local Computer\Remote Desktop\Certificates`
**CA-issued cert location:** `Certificates - Local Computer\Personal\Certificates`

### Verify Private Key Permissions
1. CertLM.msc > Personal\Certificates
2. Right-click certificate > All Tasks > Manage Private Keys
3. Verify **Network Service** has **Allow - Read** permission
4. If missing: Add > Locations > local computer > type "Network Service" > Check Names > OK

### Fix Certificate Association
**Option 1 - Re-enroll (if GP is configured):**
```powershell
$RDPSettings = Get-WmiObject -Class "Win32_TSGeneralSetting" -Namespace Root\cimv2\Terminalservices -Filter "TerminalName='rdp-tcp'"
CertUtil -DelStore My $RDPSettings.SSLCertificateSHA1Hash
Net Stop SessionEnv
Net Start SessionEnv
```

**Option 2 - Update WMI thumbprint:**
```powershell
$PATH = (Get-WmiObject -class "Win32_TSGeneralSetting" -Namespace root\cimv2\terminalservices)
Set-WmiInstance -Path $PATH -argument @{SSLCertificateSHA1Hash="NEWTHUMBPRINT"}
```

### Repair Private Key Association
```
CertUtil -RepairStore My [THUMBPRINT or *]
```
