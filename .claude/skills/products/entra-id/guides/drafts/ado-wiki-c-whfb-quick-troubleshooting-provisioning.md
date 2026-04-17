---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Quick Start Check List/Quick troubleshooting steps for a provisioning problem"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/515081"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/515081&Instance=515081&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/515081&Instance=515081&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides a detailed guide on detecting and troubleshooting issues related to Hybrid Key Trust and Hybrid Certificate Trust. It includes steps to investigate various scenarios and collect necessary logs for analysis.

[[_TOC_]]

The fastest way to detect an issue is by using the `Dsregcmd /status /debug` command or by looking into the User Device Registration Event log.

---

## Hybrid Key Trust

**Event 358 for success and 360 for failure**


![screenshot of id 358](/.attachments/image-899590cc-fb4f-40ec-af80-327ef9951610.png)
![NGC output from dsregcmd](/.attachments/image-5356e46b-d106-4cb1-85b3-79e90254679f.png)

---

## Hybrid Certificate Trust

**Event 358 for success and 362 for failure**

![screenshot of id 362](/.attachments/image-d73eec7c-7ef0-40b3-9d9a-7507141e0f48.png)
![NGC output from dsregcmd](/.attachments/image-59c00079-15f8-49c4-b62e-935771f0426f.png)

All the prerequisites should be **YES** as in the screenshots above.

---

# Investigations

### IsUserAzureAD: NO

This indicates the user failed to pass Azure Active Directory (AAD) authentication during the logon process and did not get the [Azure AD Primary Refresh Token (PRT)](https://learn.microsoft.com/entra/identity/devices/concept-primary-refresh-token). Please check if the user can sign in to [Azure Portal](https://portal.azure.com) from the device successfully.

Collect the following event logs during the logon process to check why the authentication against AAD failed:
- Event Viewer -> Applications and Services -> Microsoft -> Windows -> AAD -> Operational
- Event Viewer -> Applications and Services -> Microsoft -> Windows -> AAD -> Analytic

### PolicyEnabled: NO

This indicates the ["Use Hello for Business"](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/hybrid-key-trust-enroll?tabs=gpo#configure-windows-hello-for-business-policy-settings) policy is not enabled. Please check if the customer is enabling Windows Hello for Business (WHFB) per user or per machine and confirm if the user/device is inside the group policy scope.

### PostLogonEnabled: NO

This indicates the option below was checked, and users will not get the provisioning experience automatically after Windows logon. However, they should still be able to start the PIN provisioning from Settings.

![Use WhFb setting from group policy](/.attachments/image-4eef1cf6-09fb-47ef-bd81-487f68783f2f.png)

### DeviceEligible: NO

This indicates the device doesnt meet the hardware requirements of WHFB. The hardware here primarily refers to the Trusted Platform Module (TPM).

### SessionIsNotRemote: NO

This indicates the logon session is a remote session. **WHFB will not work in remote session logons**.

### Use certificate for on-premise auth policy is enabled: NO

This is only required for Hybrid or on-premises Certificate Trust Deployment models. This setting determines if the provision task will consider the deployment as key trust or certificate trust.

![Use Use certificate for on-premise auth policy setting from group policy](/.attachments/image-0c6d2352-e1c4-4f8d-a96a-86d1a4696186.png)

### CertEnrollment: None / enrollment authority

This is only required for Hybrid Certificate Trust deployment models. The result for this check would be affected by the later checkpoints.

#### AdfsRefreshToken: NO

This indicates the user failed to get authenticated with Active Directory Federation Services (ADFS) and did not get the Enterprise PRT. Please ensure Device Writeback is enabled and the device object, along with the two attributes `altSecurityIdentities` and `msDS-KeyCredentialLink`, are synced back to the registered device container.

Collect the following event logs during the logon process to check why the authentication against ADFS failed:
- Event Viewer -> Applications and Services -> Microsoft -> Windows -> AAD -> Operational
- Event Viewer -> Applications and Services -> Microsoft -> Windows -> AAD -> Analytic
- [ADFS debug logs](https://learn.microsoft.com/windows-server/identity/ad-fs/troubleshooting/ad-fs-tshoot-logging) from the ADFS server

#### AdfsRaIsReady: NO

Please check if you have successfully set the Registration Authority Template for ADFS and completed the configuration here:
- [Enrollment Agent certificate template](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/hybrid-cert-trust-pki#configure-an-enrollment-agent-certificate-template)
- [Configure Registration Authority](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/hybrid-cert-trust-adfs#configure-the-certificate-registration-authority)

Check if `https://STS.contoso.com/adfs/.well-known/openid-configuration` contains "winhello_cert", "winhello_cert_kr". You can also test internally against the farm directly using PowerShell:

```powershell
//replace sts.contoso.com with the farm name
(convertfrom-json (invoke-webrequest -uri https://sts.contoso.com/adfs/.well-known/openid-configuration).content).capabilities.Contains('winhello_cert')
```

If true, then the RA is configured (Ready).

#### [Exchange Primary Refresh Token for User Authentication Certificate](https://learn.microsoft.com/openspecs/windows_protocols/ms-oapxbc/efeea2cb-563f-44b8-a678-64a315251563)

When the client obtains the OpenID Provider Metadata from the server ([MS-OIDCE] section 2.2.3.2), it checks for the capabilities field. If the field exists in the metadata and includes the value "winhello_cert", the client can proceed with this request for a user authentication certificate.
[OpenID Provider Configuration endpoint](https://learn.microsoft.com/openspecs/windows_protocols/ms-oidce/f629647a-4825-465b-80bb-32c7e9cec2c8)

#### LogonCertTemplateReady: UNKNOWN / NO

This means something is wrong with the publishing of the WHFB authentication user certificate. Either this certificate template is not properly published, or the signed-in user account and ADFS service account do not have the right to enroll this certificate. 

[Create WHFB sign-in template and mark it on ADFS server](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/hybrid-cert-trust-pki#mark-the-template-as-the-windows-hello-sign-in-template)

#### The registration authority related configuration contains:

 - [The enrollment agent certificate template](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/hybrid-cert-trust-pki#configure-an-enrollment-agent-certificate-template)
 - [The WHFB authentication certificate template](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/hybrid-cert-trust-pki#configure-a-windows-hello-for-business-authentication-certificate-template)
 - [Mark the template as the Windows Hello Sign-in template](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/hybrid-cert-trust-pki#mark-the-template-as-the-windows-hello-sign-in-template)
 - [Configure the Registration Authority](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/hybrid-cert-trust-adfs#configure-the-certificate-registration-authority)
 - [Group Memberships for the ADFS Service Account](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/hybrid-cert-trust-adfs#group-memberships-for-the-ad-fs-service-account)

Please review the steps above in detail and ensure the account name or template name was not mistyped. You can view the template name on the General tab of the certificate template using the Certificate Template Management console (`certtmpl.msc`). Or, you can view the template name using the `Get-CATemplate` ADCS Administration Windows PowerShell cmdlet on a Windows Server 2012 or later certificate authority.

If all the steps above were checked, please kindly execute the following commands from your users client (cmd under user context) and share the output:
```cmd
Certutil -template
Certutil -dstemplate
```

---

**NEXT STEP**:
Follow the whole workflow for more in-depth [Scoping](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430678/WHFB-Scoping)  questions.