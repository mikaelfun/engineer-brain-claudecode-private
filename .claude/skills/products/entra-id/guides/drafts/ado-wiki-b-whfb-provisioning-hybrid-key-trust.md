---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: References/Provisioning/Hybrid Azure AD joined provisioning in a Key Trust deployment"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/WHfB/WHFB%3A%20References/Provisioning/Hybrid%20Azure%20AD%20joined%20provisioning%20in%20a%20Key%20Trust%20deployment"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/431141&Instance=431141&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/431141&Instance=431141&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article outlines the provisioning process for Hybrid Azure Active Directory (AD) joined devices in a Key Trust deployment, detailing the steps from access token requests to user key synchronization.

![Hybrid_Azure_AD_joined_provisioning_in_a_Key_Trust_deployment.png](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FHybrid_Azure_AD_joined_provisioning_in_a_Key_Trust_deployment.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

| Step | Description |
|:--:|:--|
| A | The provisioning application hosted in the Cloud Experience Host (CXH) starts provisioning by requesting an access token for the Azure Device Registration Service (ADRS). The application makes the request using the Azure Active Directory (Azure AD) Web Account Manager plug-in. Users must provide two factors of authentication. In this phase, the user has already provided one factor of authentication, typically a username and password. Azure Multi-Factor Authentication (MFA) services provide the second factor of authentication. If the user has performed Azure MFA within the last 10 minutes, such as when registering the device from the out-of-box experience (OOBE), then they are not prompted for MFA because the current MFA remains valid. Azure AD validates the access token request and the MFA claim associated with it, creates an ADRS access token, and returns it to the application. |
| B | After receiving an ADRS access token, the application detects if the device has a Windows Hello biometric compatible sensor. If the application detects a biometric sensor, it gives the user the choice to enroll biometrics. After completing or skipping biometric enrollment, the application requires the user to create a PIN, which is the default (and fall-back) gesture when used with biometrics. The user provides and confirms their PIN. Next, the application requests a Windows Hello for Business key pair from the key pre-generation pool, which includes attestation data. This is the user key (ukpub/ukpriv). |
| C | The application sends the ADRS token, ukpub, attestation data, and device information to ADRS for user key registration. Azure DRS validates that the MFA claim remains current. On successful validation, Azure DRS locates the user's object in Azure AD and writes the key information to a multi-values attribute. The key information includes a reference to the device from which it was created. Azure AD returns a key ID to the application, which signals the end of user provisioning, and the application exits. |
| D | Azure AD Connect requests updates on its next synchronization cycle. Azure AD sends the user's public key that was securely registered through provisioning. Azure AD Connect receives the public key and writes it to the user's msDS-KeyCredentialLink attribute in Active Directory. |

 **Important**  
The newly provisioned user will not be able to sign in using Windows Hello for Business until Azure AD Connect successfully synchronizes the public key to the on-premises Active Directory.

---

**NEXT STEP**: Have a look at the [log examples](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430191/WHFB-Hybrid-Key-Trust).
