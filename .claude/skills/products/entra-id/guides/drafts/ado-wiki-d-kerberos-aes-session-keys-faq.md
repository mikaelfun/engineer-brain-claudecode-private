---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Security Enhancements & Changes/Kerberos: 11B.22 - KrbtgtFullPacSignature DefaultDomainSupportedEncTypes/Tips from Kerberos and Netlogon/AES session keys without changing the password"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Security%20Enhancements%20%26%20Changes/Kerberos%3A%2011B.22%20-%20KrbtgtFullPacSignature%20DefaultDomainSupportedEncTypes/Tips%20from%20Kerberos%20and%20Netlogon/AES%20session%20keys%20without%20changing%20the%20password"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1283352&Instance=1283352&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1283352&Instance=1283352&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This article addresses the question of whether an account can be encrypted with AES session keys without changing the account password. It explains that session keys are independent of the account password and provides details on how the Key Distribution Center (KDC) handles encryption types.

[[_TOC_]]

# Audience
<SPAN style="color:red">****This content is internal, do not share****</SPAN>

# Question
_"Is there any mechanism that allows an account to be encrypted with AES (Advanced Encryption Standard) session keys without changing the password for the account? We have a large number of users/services reliant on RC4 (Rivest Cipher 4) that we have previously informed that they will not have to change their passwords due to the hardcoding of RC4 in msdssupportedencryptiontypes for use domain-wide."_

# Answer
Yes, an account can be encrypted with AES session keys without changing the account password. Session keys are not dependent on the account password, so this already occurs.

When processing a TGS-REQ (Ticket Granting Service Request), the Key Distribution Center (KDC) will look at the target accounts `msDS-SupportedEncryptionTypes` to determine what encryption type (etype) can be used for:
1. Session keys
2. Service ticket encryption

The session key is a random key generated for that session only, and its type depends on the supported etype. The target account password is unrelated. The service ticket, on the other hand, will be encrypted using the target accounts password with one of the supported etypes. The etype used for the session key and service ticket encryption do not have to be the same. This is precisely what happens by default when version 2022.11B is installed  AES session keys and RC4 service ticket encryption.

If the customer is seeing successful event ID 4769 in their environment, they have nothing to worry about. They have already correctly configured their accounts to work with RC4. This will continue to work for the foreseeable future.

Regarding the statement, will not have to change their passwords due to the hardcoding of RC4 in msdssupportedencryptiontypes for use domain-wide, changing the password wont affect anything. RC4 will still be used as long as `msDS-SupportedEncryptionTypes` for that account is configured properly.