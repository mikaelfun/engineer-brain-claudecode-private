---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: References/Authentication/Hybrid Azure AD join authentication using a Certificate"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/WHfB/WHFB%3A%20References/Authentication/Hybrid%20Azure%20AD%20join%20authentication%20using%20a%20Certificate"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/431143&Instance=431143&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/431143&Instance=431143&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a detailed workflow for Hybrid Azure AD Join authentication using a certificate. The steps outline the process from the initial user authentication to the final successful login, including interactions with various security providers and Azure Active Directory (Azure AD).

![Hybrid Azure AD join authentication using a Certificate](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FHybrid_Azure_AD_join_authentication_using_a_Certificate.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

| Step | Description |
|:--:|:--|
| A | Authentication begins when the user dismisses the lock screen, triggering Winlogon to show the Windows Hello for Business credential provider. The user provides their Windows Hello gesture (PIN or biometrics). The credential provider packages these credentials and returns them to Winlogon. Winlogon passes the collected credentials to Local Security Authority Subsystem Service (LSASS). LSASS passes the collected credentials to the Kerberos security support provider. The Kerberos provider gets domain hints from the domain-joined workstation to locate a domain controller for the user. |
| B | The Kerberos provider sends the signed pre-authentication data and user's certificate, which includes the public key, to the Key Distribution Center (KDC) service running on the domain controller in the form of a KERB_AS_REQ. The domain controller determines the certificate is not self-signed. The domain controller ensures the certificate chains to a trusted root certificate, is within its validity period, can be used for authentication, and has not been revoked. It retrieves the public key and User Principal Name (UPN) from the certificate included in the KERB_AS_REQ and searches for the UPN in Active Directory. It validates the signed pre-authentication data using the public key from the certificate. On success, the KDC returns a Ticket Granting Ticket (TGT) to the client with its certificate in a KERB_AS_REP. |
| C | The Kerberos provider ensures it can trust the response from the domain controller. First, it ensures the KDC certificate chains to a root certificate that is trusted by the device. Next, it ensures the certificate is within its validity period and that it has not been revoked. The Kerberos provider then verifies the certificate has the KDC Authentication present and that the subject alternate name listed in the KDC's certificate matches the domain name to which the user is authenticating. |
| D | After passing this criteria, Kerberos returns the TGT to LSASS, where it is cached and used for subsequent service ticket requests. |
| E | LSASS informs Winlogon of the successful authentication. Winlogon creates a logon session, loads the user's profile, and starts explorer.exe. |
| F | While Windows loads the user's desktop, LSASS passes the collected credentials to the Cloud Authentication security support provider, referred to as the Cloud AP provider. The Cloud AP provider requests a nonce from Azure Active Directory. Azure AD returns a nonce. |
| G | The Cloud AP provider signs the nonce using the user's private key and returns the signed nonce to Azure Active Directory. Azure AD validates the signed nonce using the user's securely registered public key against the nonce signature. After validating the signature, Azure AD then validates the returned signed nonce. After validating the nonce, Azure AD creates a Primary Refresh Token (PRT) with a session key that is encrypted to the device's transport key and returns it to the Cloud AP provider. The Cloud AP provider receives the encrypted PRT with the session key. Using the device's private transport key, the Cloud AP provider decrypts the session key and protects the session key using the device's Trusted Platform Module (TPM). The Cloud AP provider returns a successful authentication response to LSASS. LSASS caches the PRT. |

---
**Next Step:** Have a look at logs [examples](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430198/Authentication) in working scenario.
