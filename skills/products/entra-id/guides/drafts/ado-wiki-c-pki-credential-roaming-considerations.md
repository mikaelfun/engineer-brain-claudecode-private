---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Client/Workflow: PKI Client: Credential Roaming/Workflow: PKI Client: Credential Roaming Implementation Considerations"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Client/Workflow%3A%20PKI%20Client%3A%20Credential%20Roaming/Workflow%3A%20PKI%20Client%3A%20Credential%20Roaming%20Implementation%20Considerations"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1753244&Instance=1753244&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1753244&Instance=1753244&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This article provides a comprehensive guide on implementing Credential Roaming in a domain. It covers considerations such as Active Directory Domain Services (AD DS) database growth, tombstone credentials lifetime, filtering layers, and registry entries. Additionally, it includes recommendations for managing user profiles and certificates to prevent unnecessary AD DS database growth.

[[_TOC_]]

# Considerations for implementing credential roaming

When you enable the credential roaming feature in a domain, the size of the Active Directory Domain Services (AD DS) database increases. The extent of this growth depends on the amount of credential data your users have and the number of users for whom you enable credential roaming.

A maximum tombstone credentials lifetime of 60 days means that if you delete a certificate on your machine, this change will be replicated to AD. Credential roaming will mark this certificate as deleted, and it will remain in the credential roaming attribute for 60 days. However, the binary object will remain in the AD database, consuming space.

Note that this is not the tombstone lifetime for Active Directory. Before reaching these 60 days, Active Directory has no action to take for that object. However, after 60 days, when credential roaming deletes that object, it goes through the Active Directory deletion cycle where the tombstone lifetime for Active Directory is applied. Therefore, deleting a credential roaming object can be a very time-consuming task.

For the maximum number of roaming credentials "tokens (certificates/keys)" per user and the maximum size (in bytes) of roaming credentials for each of them, the default values are 2000 credentials for each user and 65,535 bytes for each roaming credential. These values are quite high. Setting these attributes to 400 credentials for each user and 8192 bytes should be sufficient; however, analysis of the customer's environment is needed to set the best value.

The credential roaming feature filters user credentials before it uploads them. This behavior prevents the addition of unnecessary credential information to the AD DS database.

A filtering layer is added to filter out the following credential information:

- Keys that are not associated with a certificate
- Data Protection API (DPAPI) keys that do not protect a roamed private key binary large object (BLOB)
- Smart card certificates

The following registry entries can be added under the `HKEY_CURRENT_USER\Software\Policies\Microsoft\Cryptography\AutoEnrollment` subkey to control whether the credential roaming feature filters the credential information:

```plaintext
Name: RoamUnaffiliatedKeys
Type: DWORD
Value: 00000000
```

**Note:** If the value of the registry entry is not set (for example, if the default value is used) or is zero, keys that are not associated with a certificate are not roamed. Setting the value to 0x1 disables this filter. This enables all CAPI and CNG asymmetric key pairs from Microsoft providers to roam and to be stored in the AD DS database.

```plaintext
Name: RoamUnusedDpapiKeys
Type: DWORD
Value: 00000000
```

**Note:** If the value of the registry entry is not set (for example, if the default value is used) or is zero, as in the following example, DPAPI keys that do not protect a roamed private key binary large object (BLOB) are not roamed. Setting the value to 0x1 disables this filter and allows all DPAPI keys to roam and take space in Active Directory.

```plaintext
Name: RoamSmartCardCertificates
Type: DWORD
Value: 00000000
```

**Note:** If the value of the registry entry is not set (for example, if the default value is used) or is zero, certificates and certificate requests are not roamed. This behavior occurs when the keys of the certificates and certificate requests are managed by the Microsoft Base Smart Card Crypto Provider or by the Microsoft Smart Card Key Storage Provider. Setting the value to 0x1 turns off this filter and enables all smart card certificates to roam and to take space in Active Directory.

![Credential Roaming policy filters](/.attachments/image-28279e23-20fd-4f56-9bd7-f74caf6f7ff9.png)

**Note:** Deleted objects will become part of replication value metadata and remain in AD until the AD tombstone lifetime expires, causing the AD database to grow beyond the presented formula.

```plaintext
(((CertificateSizeInByte + KeySizeInByte) * (#UserCertificates * #PastCertificateRenewals * #Machines) + (DPAPIkey * ProfileAgeInYears * 4)) / 1024
```

**Formula Value Description:**

**CertificateSizeInByte:** This parameter represents the size of a certificate. Calculate the sum of certificate sizes if a user has multiple certificates.

**KeySizeInByte:** This parameter represents the size of a key. Calculate the sum of key sizes if a user has multiple keys.

**UserCertificates:** This is the number of certificates that users hold. Users may have enrolled for more certificates than the number of certificate templates for which they have enrollment permissions if manual enrollment was performed.

**PastCertificateRenewals:** This parameter represents the number of certificate renewals. If you have different renewal intervals, you have to calculate the total number of certificates for each certificate type individually.

**Machines:** This is the number of computers users log on to while certificate roaming is enabled. After enabling certificate roaming, Certificate Management Services will synchronize any locally existing certificates with the user's Active Directory object.

**DPAPIkey:** The DPAPIkeySizeInKByte is 664 or 740 bytes.

**ProfileAgeInYears:** The age of a user profile has an impact on the number of DPAPI master keys that exist. A new DPAPI master key is generated every 90 days, so four DPAPI master keys are created per year.

**DPAPIPreferredFile:** The DPAPIPreferredFile has a fixed size of 24 bytes.

The tombstone value should be long enough so that the user is able to log on to all machines they use, ensuring that the certificate is deleted from all the respective local certificate stores upon logon.

The maximum size of the user object's credentials attribute is the result of the maximum number of tokens multiplied by the maximum token size.

Credential roaming does not provide complete protection for certificates and private keys if they are accidentally deleted by a user. Use certificate and key archival and recovery to protect credentials from accidental deletion.

**User profiles and certificates on user stores cleanup should be part of the pre-implementation phase so that AD DS DIT growth can be managed.**

When a user starts to log on to multiple computers in the environment, if they already have an existing profile on the computer, they will start collecting old certificates and DPAPI master keys, which will cause your Active Directory database size to grow. There is a group policy setting that can be implemented in your environment that will delete older user profiles based on the number of days: `Computer Configuration\Policies\Administrative Templates\System\User Profiles\Delete user profiles older than a specified number of days on system restart`.

It would also be necessary to clean up certificates on user stores before enabling credential roaming.

**Notes:**

Certificates will replicate again between the machine and AD later because the user profiles were not cleaned up on some hosts or if users did not log in to all the computers that had an existing user profile on them before the lifetime value expired.

During the credential roaming decommission process, the customer must wait for AD replication to complete and consider lowering AD TSL and setting GarbageCollPeriod to 1.
