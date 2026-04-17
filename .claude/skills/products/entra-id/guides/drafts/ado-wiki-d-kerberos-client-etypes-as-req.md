---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Security Enhancements & Changes/Kerberos: 11B.22 - KrbtgtFullPacSignature DefaultDomainSupportedEncTypes/Tips from Kerberos and Netlogon/Client side Etypes AS_REQ definition"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Security%20Enhancements%20%26%20Changes/Kerberos%3A%2011B.22%20-%20KrbtgtFullPacSignature%20DefaultDomainSupportedEncTypes/Tips%20from%20Kerberos%20and%20Netlogon/Client%20side%20Etypes%20AS_REQ%20definition"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1283365&Instance=1283365&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1283365&Instance=1283365&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**  
This article explains how client machines and the LSAS (Local Security Authority Subsystem) service negotiate encryption types (ETypes) during authentication. It covers the default configurations, error handling, and how different account types handle encryption.

[[_TOC_]]

# Audience
_****This content is internal, do not share****_

# Question
How does the client machine and LSAS service know what ETypes to negotiate? How is the client machine notified that "this user now supports these encryption types configured over the Domain?"

# Answer
The client machine is configured with a list of default encryption types (ETypes). This list is sent in the AS-REQ (Authentication Service Request) body. If it is only sending old ETypes, it means there is a Group Policy (GP) in place set to something outdated. In response, the Key Distribution Center (KDC) returns a pre-auth-required error, and in the error data is a list of ETypes and salts that the user actually supports. AES (Advanced Encryption Standard) is either included in this list or it is not. If AES is not included, it means there are no AES keys available.

The client will choose the best authentication option from the list in the error and send a pre-authenticated AS-REQ. There is no strict relationship between what is in the AS-REQ support list and what the client will send; it is more of a guideline.

From there, the KDC will decide what encryption and session keys to use based on the information it has, which is generally an intersection of the AS-REQ, available keys, and policy.

What type of account are you dealing with here? The `msDS-SupportedEncryptionTypes` attribute is only set automatically on computer accounts, and these accounts automatically manage their passwords instead of going through the normal password change flows. If someone manually sets this attribute on an account to a value that conflicts with the available keys, it is expected that the account will be unable to log in.

As far as I know, an account without AES keys means that the password was last changed on a Server 2003 or older domain controller, which has not been supported for quite a while. It was also possible for a while for the built-in administrator account to be in this state if its password had not been changed since the domain was created, as the initial RID-500 administrator account in the domain was taken from the RID-500 account on the server that was promoted as the first domain controller. This issue is now resolved by pre-creating AES keys for local accounts, even though they are not used in any of the local account flows.

Two additional observations:
- What you did on the domain controller would have been a password set rather than a password change; it does not need to use the old password. You could also have successfully set the password from another computer using the credentials of an account that could authenticate and had the correct privileges.
- What you show for the AS-REQ message is not indicative of an initial password logon. Because the client has the plaintext password immediately following its entry, the client will offer all encryption types supported by the computer, as it will be able to derive them from the password if the KDC returns the necessary salt. To get a request offering only RC4 ciphers, it must be coming from an existing logon session that has been populated with only the NTOWF (NT One-Way Function). That is orthogonal to the unsupported encryption type error, as you get that regardless of what the client offers if the account has no keys that are allowed by its `msDS-SupportedEncryptionTypes`.