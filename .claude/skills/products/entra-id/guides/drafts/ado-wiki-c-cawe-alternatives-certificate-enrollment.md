---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AskDS Blog Content/20240514 We need to discuss the Microsoft Certification Authority Web Enrollment (CAWE) Role"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAskDS%20Blog%20Content%2F20240514%20We%20need%20to%20discuss%20the%20Microsoft%20Certification%20Authority%20Web%20Enrollment%20(CAWE)%20Role"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# CAWE Deprecation & Certificate Enrollment Alternatives

## Background

Certification Authority Web Enrollment (CAWE) is a Windows Server role providing web-based certificate enrollment via IIS. Available since Windows Server 2000, last updated in Server 2003. **CAWE is deprecated and no longer maintained by the product team.**

### CAWE Limitations
- Only Internet Explorer supports Active-X controls required for enrollment (Edge IE-mode has limited support)
- Only V1 and V2 certificate templates displayed
- KSP-based templates not available
- Key Archival templates not shown on Windows 10+
- Cannot enroll computer certificates via browser (user only)

## Alternative Methods

### 1. Submitting an existing CSR via CertReq.exe

**With template name in CSR:**
```
CertReq -Submit -Config "CA-DNS-NAME\CA-Name" CSRFile.csr OutputCert.cer
```

**Without template name in CSR:**
```
CertReq -Submit -Config "CA-DNS-NAME\CA-Name" -attrib "CertificateTemplate:TemplateName" CSRFile.csr OutputCert.cer
```

**Retrieving issued cert (if CA Manager approval required):**
```
CertReq -Retrieve -Config "CA-DNS-NAME\CA-Name" RequestID OutputCert.cer
```

### 2. Submitting CSR via Certification Authority Snap-in (CertSrv.msc)
1. Launch CertSrv.msc > expand CA object
2. Right-click CA > All Tasks > Submit new request
3. Browse to CSR file > Open
4. If auto-issue: dialog prompts for CER save location
5. If CA Manager approval: Pending Requests > right-click > All Tasks > Issue

**Note:** CSR submitted to Enterprise CA without template name will fail with `CERT_E_NO_CERT_TEMPLATE (0x80094801)`.

### 3. MMC Certificate Snap-in (GUI enrollment)

**For user certs:** CertMgr.msc | **For computer certs:** CertLM.msc

**Using template with "Supply in the Request":**
1. Personal\Certificates > All Tasks > Request New Certificate
2. Select enrollment policy > Next
3. Select template > Details > Properties
4. Configure Subject (CN, SAN), Extensions (KU, EKU), Private Key (KSP/CSP, key size, exportable), Cryptography
5. Enroll > If CA Manager approval: CertSrv.msc > Pending Requests > Issue
6. Back in cert MMC: All Tasks > Automatically Enroll and Retrieve Certificates

**Custom request (no template, for Standalone/3rd party CAs):**
1. Personal\Certificates > All Tasks > Advanced Operations > Create Custom Request
2. Proceed without enrollment policy > Select CNG key (KSP) or Legacy key (CSP)
3. Configure all properties manually > Finish > save CSR file
4. After receiving CER: `CertReq -Accept [-User|-Machine] CERFile.cer`
5. Or import + repair association: `CertUtil [-User] -RepairStore My THUMBPRINT`

### 4. PowerShell Get-Certificate cmdlet
```powershell
# Explore certificate stores
cd Cert:\LocalMachine\My
dir

# Enroll via template
Get-Certificate -Template "TemplateName" -CertStoreLocation Cert:\LocalMachine\My
```

## Security Recommendation
For templates with "Supply in the Request" subject name, enable **CA certificate manager approval** on the Issuance Requirements tab to prevent abuse (see Microsoft Defender for Identity AD CS sensor guidance).
