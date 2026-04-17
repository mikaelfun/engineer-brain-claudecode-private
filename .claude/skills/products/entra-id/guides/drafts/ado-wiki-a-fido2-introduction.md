---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Introduction"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/FIDO2%20passkeys/FIDO2%3A%20Introduction"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Authentication
- cw.AzureAD
- cw.Azure-AD
- cw.AAD-Workflow
- cw.Passwordless
- cw.Webauthn
- cw.FIDO2
- cw.Passkey
--- 
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AzureAD](/Tags/AzureAD) [Azure-AD](/Tags/Azure%2DAD) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Passwordless](/Tags/Passwordless) [Webauthn](/Tags/Webauthn) [FIDO2](/Tags/FIDO2) [Passkey](/Tags/Passkey)        


[[_TOC_]]

#  FIDO

----

#  Feature Overview

**F**ast **ID**entity **O**nline (FIDO) is an open standard for passwordless authentication. Now Azure AD is enabling customers to be able to sign in to Azure AD using FIDO2 security keys. Any security key that adopts the FIDO2 standard and enables the optional features that Microsoft requires can be used to authenticate into Azure AD. Prominent examples include Yubico and Feitian.

Currently supported scenarios :

1. Admins can configure FIDO for their tenant.
2. End-users can sign in to an Azure Active Directory Joined machine and get single sign on to cloud (and on-prem) resources.
3. End-users can sign in to a Hybrid Azure Active Directory Joined machine and get single sign on to cloud (and on-prem) resources.
4. End-users can provision FIDO keys for their own account.
5. End-users can sign into a FIDO2 compliant browser with their FIDO2 security key.

--- 


#  What is FIDO?

Video: [AUTHENTICATE 2021  FIDO 101 SPONSORED BY MICROSOFT](https://youtu.be/YjGB05xJvB8?list=PLrddLYClidPyXIJoKTmfiuUizCtmly6Nr)  

::: video
<iframe width="560" height="315" src="https://www.youtube.com/embed/YjGB05xJvB8?si=C1c37g50Wo59UkOy" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
:::

Video: [Authenticate2020 Presentation: Profiles, Pins and Protections, oh my!](https://youtu.be/coHO4_nDUmg)  

::: video
<iframe width="560" height="315" src="https://www.youtube.com/embed/coHO4_nDUmg?si=hLms5lIY68G9apMF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
:::

Website: Read about the FIDO Alliance here: <https://fidoalliance.org/>  

--- 

#  Why FIDO in Windows?

**Windows Hello for Business** provides a personal and password-less way to sign in to Windows 10 devices.  

If you are an employee with a dedicated computer, youll enter a password just once on your first day of work  and never deal with passwords again. This is achieved by enrolling biometrics/PIN on your device.

While this works great for users with dedicated computers, it is not ideal for users in **Shared PC environments**. In these scenarios, workers move through many computing stations throughout the day, creating the need for an authentication method that is portable, does not require enrollment and is secure.

**Microsoft-compatible security key** enable password less multi-factor authentication for shared PC environments. These keys work over USB and NFC transports and can provide true multi-factor unlock with built in biometric support/PIN. They also support offline unlock. Logon with security keys **enables single sign-on (SSO) to your On-premises resources** as well as your cloud apps and resources. Users can sign into Windows with modern credentials like FIDO2 keys and access traditional Active Directory(AD) based resources. Today, Windows Hello for Business lets user authenticate to AD using key or certificates, but process is complex and requires many customer managed components. With this solution, modern credentials like FIDO2 security keys can be traded for a credential that AD trusts and understands.

![One2Many.png](/.attachments/AAD-Authentication/183957\One2Many.png)

__**How SSO works for on prem resources using FIDO2 keys  Under the hood**__

 Under the hood You may choose to have Azure Active Directory issue Kerberos Ticket Granting Tickets (TGTs) for one or more of your Active Directory domains. This allows you to sign into Windows with modern credentials like FIDO and access your traditional Active Directory based resources.

Kerberos Service Tickets and authorization will continue to be controlled by your on-premises Active Directory Domain Controllers. An Azure AD Kerberos Server object will be created in your on-premises Active Directory and then securely published to Azure Active Directory. The object is not associated with any physical servers. It is simply a representation of a Domain Controller that can be used by Azure Active Directory to generate Kerberos Ticket Granting Tickets (TGTs) for your Active Directory Domain. The object appears in the directory as a Read Only Domain Controller object.

The same rules and restrictions used for Read Only Domain Controllers apply to the Azure AD Kerberos Server object.

![Fido2HybridAuthFlow.png](/.attachments/AAD-Authentication/183957\Fido2HybridAuthFlow.png)

--- 

#  Requirements

- There are no FIDO-specific Azure AD licensing requirements to use the FIDO2 credential.
- Azure Multi-Factor Authentication may be a pre-requisite, but can be met with baseline Security Default settings.
- FIDO2 security key must be a Microsoft-compatible FIDO2 security key. See [FIDO2 security keys](https://docs.microsoft.com/en-us/azure/active-directory/authentication/concept-authentication-passwordless#fido2-security-keys) for the latest list.
- See [FIDO2 requirements](https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-passwordless-security-key-windows#requirements) for more details.  

--- 

#  FIDO2 Security Keys

While there are many keys that are FIDO2 certified, Microsoft requires some optional extensions to be implemented by the vendor to ensure maximum security and the best experience.

What is a Microsoft-compatible security key? <https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/microsoft-compatible-security-key>

The following FIDO2 security keys are known to be compatible with the paswordless experience. Additional keys may work but these examples are known to work.

| **Key Vendor** | **Form Factors**   | **Capabilities**                        | **Models**                               |
| :--------- | :------------- | :---------------------------------- | :----------------------------------- |
| Yubico     | USB KeyNFC Key | Security Key + PIN                  | YubiKey 5 and Security Key by Yubico |
| Feitian    | USB Key        | Security key + fingerprint (or PIN) | K27                                  |
| HID        | NFC Card       | NFC card + PIN                      | Contact vendor for information       |

See [FIDO2 security keys](https://docs.microsoft.com/en-us/azure/active-directory/authentication/concept-authentication-passwordless#fido2-security-keys) for the latest list.

**Note:** NFC based security keys you will need a supported NFC reader.
Recommended: HID Omnikey 5022 CL or equivalent.

--- 

#  How to Configure & Manage

[Enable passwordless security key sign-in](https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-passwordless-security-key)  

[Enable passwordless security key sign-in to on-premises resources with Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-passwordless-security-key-on-premises)  

In addition to the previously mentioned links here are some other useful public docs for Fido2 sign-in to Azure AD:  

[Announcing the public preview of Azure AD support for FIDO2-based passwordless sign-in](https://techcommunity.microsoft.com/t5/Azure-Active-Directory-Identity/Announcing-the-public-preview-of-Azure-AD-support-for-FIDO2/ba-p/746362)

[What's New in Passwordless Standards, 2021 edition](https://techcommunity.microsoft.com/t5/identity-standards-blog/what-s-new-in-passwordless-standards-2021-edition/ba-p/2124136)

[Passwordless authentication options for Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/authentication/concept-authentication-passwordless)

Also see the companion to this release, Microsoft Authenticator Passwordless Sign-in For Work Accounts: [Microsoft Authenticator Passwordless Sign-in For Work Accounts](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183976 "curated:Microsoft Authenticator Passwordless Sign-in For Work Accounts")

--- 

#  Frequently Asked Questions (FAQ)

[Deployment frequently asked questions (FAQs) for hybrid FIDO2 security keys in Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-passwordless-faqs)
