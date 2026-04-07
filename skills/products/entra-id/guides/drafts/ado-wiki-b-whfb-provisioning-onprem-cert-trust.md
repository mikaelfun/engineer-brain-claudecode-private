---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: References/Provisioning/Domain joined provisioning in an On-premises Certificate Trust deployment"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/WHfB/WHFB%3A%20References/Provisioning/Domain%20joined%20provisioning%20in%20an%20On-premises%20Certificate%20Trust%20deployment"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430704&Instance=430704&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430704&Instance=430704&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a detailed workflow for domain-joined provisioning in an on-premises certificate trust deployment, outlining each step from initial token request to the final certificate installation.

![Domain_joined_provisioning_in_an_On_premises_Certificate_Trust_deployment.png](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FDomain_joined_provisioning_in_an_On_premises_Certificate_Trust_deployment.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

| Step | Description |
|:--:|:--|
| A | The provisioning application hosted in the Cloud Experience Host (CXH) starts provisioning by requesting an access token for the Enterprise Device Registration Service (EDRS). The application makes the request using the Azure Active Directory Web Account Manager plug-in. In an on-premises deployment, the plug-in sends the token request to the on-premises Security Token Service (STS), such as Active Directory Federation Services (AD FS). The on-premises STS authenticates the user and determines if the user should perform another factor of authentication. Users must provide two factors of authentication. In this phase, the user has already provided one factor of authentication, typically user name and password. Azure Multi-Factor Authentication (MFA) server (or a third-party MFA service) provides the second factor of authentication. The on-premises STS server issues an enterprise DRS token on successful MFA. |
| B | After receiving an EDRS access token, the application detects if the device has a Windows Hello biometric compatible sensor. If the application detects a biometric sensor, it gives the user the choice to enroll biometrics. After completing or skipping biometric enrollment, the application requires the user to create a PIN as the default (and fallback) gesture when used with biometrics. The user provides and confirms their PIN. Next, the application requests a Windows Hello for Business key pair from the key pre-generation pool, which includes attestation data. This is the user key (ukpub/ukpriv). |
| C | The application sends the ADRS token, ukpub, attestation data, and device information to ADRS for user key registration. Azure DRS validates the MFA claim remains current. On successful validation, Azure DRS locates the user's object in Azure Active Directory, writes the key information to a multi-value attribute. The key information includes a reference to the device from which it was created. Azure Active Directory returns a key ID and a key receipt to the application, which represents the end of user key registration. |
| D | The certificate request portion of provisioning begins after the application receives a successful response from key registration. The application creates a PKCS#10 certificate request. The key used in the certificate request is the same key that was securely provisioned. The application sends the certificate request, which includes the public key, to the certificate registration authority hosted on the Active Directory Federation Services (AD FS) farm. After receiving the certificate request, the certificate registration authority queries Active Directory for the msDS-KeyCredentialsLink for a list of registered public keys. |
| E | The registration authority validates the public key in the certificate request matches a registered key for the user. After validating the public key, the registration authority signs the certificate request using its enrollment agent certificate. |
| F | The registration authority sends the certificate request to the enterprise issuing certificate authority. The certificate authority validates the certificate request is signed by a valid enrollment agent and, on success, issues a certificate and returns it to the registration authority that then returns the certificate to the application. |
| G | The application receives the newly issued certificate and installs it into the Personal store of the user. This signals the end of provisioning. |  


---

**NEXT STEP:** For more detailed logs and examples, refer to the [Windows Hello for Business On-Premises Certificate Trust documentation](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430179/WHFB-On-Premises-Certificate-Trust).
