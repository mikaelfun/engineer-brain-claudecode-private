---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/FIDO2/FIDO2: How it works"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/FIDO2/FIDO2%3A%20How%20it%20works"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/586121&Instance=586121&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/586121&Instance=586121&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article explains how Single Sign-On (SSO) works for on-premises resources using FIDO2 keys, detailing the underlying mechanisms and processes involved.

[[_TOC_]]

# How SSO works for on-prem resources using FIDO2 keys  under the hood

## Under the hood
You may choose to have Azure Active Directory (Azure AD) issue Kerberos Ticket Granting Tickets (TGTs) for one or more of your Active Directory (AD) domains. This allows you to sign into Windows with modern credentials like FIDO and access your traditional AD-based resources.

Kerberos Service Tickets and authorization will continue to be controlled by your on-premises AD Domain Controllers. An Azure AD Kerberos Server object will be created in your on-premises AD and then securely published to Azure AD. The object is not associated with any physical servers. It is simply a representation of a Domain Controller that can be used by Azure AD to generate Kerberos TGTs for your AD Domain. The object appears in the directory as a Read-Only Domain Controller object.

The same rules and restrictions used for Read-Only Domain Controllers apply to the Azure AD Kerberos Server object.

---

![Diagram of Azure AD and on-premises AD interaction](/.attachments/image-1099f053-455e-416d-b45a-ebbc244b5c02.png)

## Azure AD joined device
- The user plugs the FIDO2 security key into their computer.
- Windows detects the FIDO2 security key.
- Windows sends an authentication request.
- Azure AD sends back a nonce.
- The user completes their gesture to unlock the private key stored in the FIDO2 security key's secure enclave.
- The FIDO2 security key signs the nonce with the private key.
- The Primary Refresh Token (PRT) token request with the signed nonce is sent to Azure AD.
- Azure AD verifies the signed nonce using the FIDO2 public key.
- Azure AD returns the PRT to enable access to on-premises resources.

---

## Use SSO to sign in to on-premises resources by using FIDO2 keys

![Diagram of FIDO2 key usage in SSO](/.attachments/image-ef96c1cd-7c65-4a2a-b8c8-6a0f8258bfb9.png)

- A user signs in to a Windows 10 device with a FIDO2 security key and authenticates to Azure AD.
- Azure AD checks the directory for a Kerberos Server key that matches the user's on-premises AD domain.
- Azure AD generates a Kerberos TGT for the user's on-premises AD domain. The TGT includes the user's Security Identifier (SID) only, and no authorization data.
- The TGT is returned to the client along with the user's Azure AD PRT.
- The client machine contacts an on-premises Azure AD Domain Controller (DC) and trades the partial TGT for a fully formed TGT.

The client machine now has an Azure AD PRT and a full AD TGT and can access both cloud and on-premises resources.

---

## SSO to on-premises resources and AD Kerberos objects linked to FIDO2
How is Azure AD Kerberos linked to my on-premises AD?

- **Active Directory**
The Azure AD Kerberos Server is represented in on-premises AD as a Domain Controller object, which itself is made up of multiple objects:

- **CN=AzureADKerberos,OU=Domain Controllers,<domain-DN>**  
  A Computer object representing a Read-Only Domain Controller in AD. There is no actual physical computer/server associated with this object. It is a logical representation of a Domain Controller.
  
- **CN=krbtgt_AzureAD,CN=Users,<domain-DN>**  
  A User object representing a Read-Only Domain Controller Kerberos TGT encryption key.

- **CN=900274c4-b7d2-43c8-90ee-00a9f650e335,CN=AzureAD,CN=System,<domain-DN>**  
  A ServiceConnectionPoint object used to store metadata about the Azure AD Kerberos Server objects. The administrative tools make use of this object to identify and locate the Azure AD Kerberos Server objects.

 - **Azure Active Directory**
The Azure AD Kerberos Server is represented in Azure AD as a KerberosDomain object. Each on-premises AD Domain is represented as a single KerberosDomain object in the Azure AD tenant. For example, say you have an AD Forest with two domains, contoso.com and fabrikam.com. If you choose to allow Azure AD to issue Kerberos TGTs for the entire Forest, there will be two KerberosDomain objects in Azure AD.