---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Security Enhancements & Changes/Kerberos: 5B.22 - ADCS, KDC SAM and SCHANNEL protections"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Security%20Enhancements%20%26%20Changes/Kerberos%3A%205B.22%20-%20ADCS%2C%20KDC%20SAM%20and%20SCHANNEL%20protections"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1428218&Instance=1428218&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1428218&Instance=1428218&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**  
This article provides an overview of the Kerberos changes introduced in the 5b.22 patch cycle, focusing on the updates related to Active Directory Kerberos Key Distribution Center (KDC) behavior and certificate-based authentication. These changes address vulnerabilities related to certificate spoofing.

[[_TOC_]]

--- 
# Contributors
@<3E97C74B-0048-609E-896B-2D88E7873973>, @<BBE6363F-0EE4-6C8D-853F-FBBC93DD78D2>

---
# Introduction
For this wiki entry, we are going to cover the Kerberos changes introduced in the 5b.22 patch cycle. While this update introduces many different security changes and configurations, we will focus on the changes related to Kerberos specifically.

Released in May 2022, the update introduced changes to Active Directory Kerberos Key Distribution Center (KDC) behavior when validating certificates during certificate-based authentication. These changes were made to address elevation of privilege vulnerabilities leveraging certificate spoofing.

---
# Keyword in DFM Knowledge

"**5b.22**" or "Servicing: 5B.22"

---
# Public articles
**Certificate-based authentication** - [KB5014754Certificate-based authentication changes on Windows domain controllers](https://support.microsoft.com/en-us/topic/kb5014754-certificate-based-authentication-changes-on-windows-domain-controllers-ad2c23b0-15d8-4340-a468-4d4f3b188f16)

---
# Internal Articles

## About the new hardening
- [Servicing: 5B.22: ADCS, KDC SAM and SCHANNEL protections for DCs performing cert-based auth](https://internal.evergreen.microsoft.com/en-us/topic/servicing-5b-22-adcs-kdc-sam-and-schannel-protections-for-dcs-performing-cert-based-auth-93614d6e-305e-3803-2f0e-36aceecf6704)
- [Servicing: 5B.22: ADCS, KDC SAM and SCHANNEL protections for DCs performing cert-based auth](https://internal.evergreen.microsoft.com/en-us/topic/24914db1-8d83-f9a4-816c-b44a16659365)

---
# Features

## StrongCertificateBindingEnforcement changes
The enforcement mode of the KDC can be set to Disabled mode, Compatibility mode, or Full Enforcement mode. This change was introduced as a mitigation for [CVE-2022-34691](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2022-34691), [CVE-2022-26931](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2022-26931), and [CVE-2022-26923](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2022-26923). The deployment type is phased, meaning there are multiple compatibility or enforcement stages, giving our customers time to enforce it. The KDC changes require certificates for a user or computer object to be strongly mapped to Active Directory. The KB describes multiple mapping options, including manual mapping options and automatic mapping that will populate an OID extension with a device or user SID for online certificate templates from Active Directory Certificate Services (AD CS).

### Known issues with third-party components
- [IA-IA-909011 ADDS: Security: IBM Datapower no longer authenticates successfully](https://internal.evergreen.microsoft.com/en-us/topic/adds-security-ibm-datapower-no-longer-authenticates-successfully-8cced360-7e83-4fa6-e9ed-40541cdfd612)
- [IA-IA-900575 ADDS: Kerberos: KRBTGT password reset fails with error STATUS_INSUFFICIENT_RESOURCES due to Quest Change Auditor Agent](https://internal.evergreen.microsoft.com/en-us/topic/adds-kerberos-krbtgt-password-reset-fails-with-error-status-insufficient-resources-due-to-quest-change-auditor-agent-91ed1117-a653-469f-3feb-765424ecbe67)

### Registry key name and location
```plaintext
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Kdc  
StrongCertificateBindingEnforcement
```
This registry key changes the enforcement mode of the KDC to Disabled mode, Compatibility mode, or Full Enforcement mode. This registry key only works in Compatibility mode starting with updates released May 10, 2022, and will be unsupported after installing updates for Windows released on February 11, 2025, which will enable Full Enforcement mode.

1  Checks if there is a strong certificate mapping. If yes, authentication is allowed. Otherwise, the KDC will check if the certificate has the new SID extension and validate it. If this extension is not present, authentication is allowed if the user account predates the certificate.

2  Checks if theres a strong certificate mapping. If yes, authentication is allowed. Otherwise, the KDC will check if the certificate has the new SID extension and validate it. If this extension is not present, authentication is denied.

0  Disables strong certificate mapping check. Not recommended because this will disable all security enhancements.

If you set this to 0, you must also set CertificateMappingMethods under `HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\SecurityProviders\Schannel` registry key to 0x1F as described in the Schannel registry key section for computer certificate-based authentication to succeed.

### Explanations
- [IA-IA-865511 Servicing: 11B.22: Populating the high bits of msds-supportedEncryptionTypes without an encryption type causes Kerberos auth failures on 11B-patched DCs. (ICM 351890484)](https://internal.evergreen.microsoft.com/en-us/topic/servicing-11b-22-populating-the-high-bits-of-msds-supportedencryptiontypes-without-an-encryption-type-causes-kerberos-auth-failures-on-11b-patched-dcs-icm-351890484-136073c6-24d6-ad6a-9d85-d24f3c5c2bb9)

### Interoperability with pre-Windows Server 2008, Vista, and legacy Linux devices
- [IA-IA-865708 Servicing: 11B.22: Resource access and interop fails with pre-Windows Server 2008, Vista, and legacy Linux devices](https://internal.evergreen.microsoft.com/en-us/topic/servicing-11b-22-resource-access-and-interop-fails-with-pre-windows-server-2008-vista-and-legacy-linux-devices-1213d1bd-e22e-3b72-479e-81da6b87911f)

---
## Known issues

[Certificate-based user authentication fails with KerberosV5:KRB_ERROR - KDC_ERR_CERTIFICATE_MISMATCH](https://internal.evergreen.microsoft.com/en-us/topic/certificate-based-user-authentication-fails-with-kerberosv5-krb_error-kdc_err_certificate_mismatch-8c1e0f0d-8f4b-4d1e-8e47-9e1a4d9b8d1f)