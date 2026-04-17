---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: References/Provisioning/Domain joined provisioning in an On-premises Key Trust deployment"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/WHfB/WHFB%3A%20References/Provisioning/Domain%20joined%20provisioning%20in%20an%20On-premises%20Key%20Trust%20deployment"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/431137&Instance=431137&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/431137&Instance=431137&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a detailed workflow for domain-joined provisioning in an on-premises Key Trust deployment using Windows Hello for Business. It outlines the steps involved in requesting an access token, enrolling biometrics, creating a PIN, and registering the user key.

![Domain_joined_provisioning_in_an_On_premises_Key_Trust_deployment.png](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FDomain_joined_provisioning_in_an_On_premises_Key_Trust_deployment.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

| Step | Description |
|:--:|:--|
| A | The provisioning application hosted in the Cloud Experience Host (CXH) starts provisioning by requesting an access token for the Enterprise Device Registration Service (EDRS). The application makes the request using the Azure Active Directory Web Account Manager plug-in. In an on-premises deployment, the plug-in sends the token request to the on-premises Security Token Service (STS), such as Active Directory Federation Services (ADFS). The on-premises STS authenticates the user and determines if the user should perform another factor of authentication. Users must provide two factors of authentication. In this phase, the user has already provided one factor of authentication, typically user name and password. Azure Multi-Factor Authentication (MFA) server (or a third-party MFA service) provides the second factor of authentication. The on-premises STS server issues an enterprise DRS token on successful MFA. |
| B | After receiving an EDRS access token, the application detects if the device has a Windows Hello biometric compatible sensor. If the application detects a biometric sensor, it gives the user the choice to enroll biometrics. After completing or skipping biometric enrollment, the application requires the user to create a PIN as the default (and fall-back gesture when used with biometrics). The user provides and confirms their PIN. Next, the application requests a Windows Hello for Business key pair from the key pre-generation pool, which includes attestation data. This is the user key (ukpub/ukpriv). |
| C | The application sends the EDRS token, ukpub, attestation data, and device information to the Enterprise DRS for user key registration. Enterprise DRS validates that the MFA claim remains current. On successful validation, the Enterprise DRS locates the user's object in Active Directory and writes the key information to a multi-values attribute. The key information includes a reference to the device from which it was created. The Enterprise DRS returns a key ID to the application, which represents the end of user key registration. |

---

**NEXT STEP:** Have a look at the logs [examples](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430189/WHFB-On-Premises-Key-Trust) for more information.
