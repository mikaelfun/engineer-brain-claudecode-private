---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: References/Kerberos: KrbTgt - Reset"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20References/Kerberos%3A%20KrbTgt%20-%20Reset"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414192&Instance=414192&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414192&Instance=414192&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides detailed guidelines and considerations for resetting the KRBTGT account password, including best practices, potential impacts on client logons and applications, and relevant articles and scripts for further reference.

[[_TOC_]]

# Introduction
After a qualified security investigation, customers may require assistance to prepare for resetting the KRBTGT account. While the technical steps to reset the KRBTGT account are straightforward, customers may seek our expertise and experience on potential side effects. In most engagements, this may be a borderline case between Directory Services (DS) and Security. The following is a collection of related information we can provide.

# Recommendations

- Microsoft has no general recommendation to keep resetting the KRBTGT password at regular intervals. While it is intended to work from the operating system (OS) level, it is neither part of any testing scenario our Microsoft software product groups (PGs) are covering, nor can we provide statements for any vendor application without testing.

- If an attack is detected, you should perform the reset. You need to reset the password twice, allowing enough time for the environment to converge. While resetting the password, you should always wait for a 10-12 hour gap between both resets to avoid unexpected implications.

- For complex cross-product/vendor setups, it is advisable to involve a Premier Field Engineer (PFE) due to potential environment-specific impacts.

# Considerations

## Background
Mitigating Pass-the-Hash (PtH) Attacks and Other Credential Theft
This is a best practice documentation for avoiding PtH attacks and is strongly recommended by our security team:
[Mitigating Pass-the-Hash (PtH) Attacks and Other Credential Theft, Version 1 and 2](https://www.microsoft.com/en-us/download/details.aspx?id=36036)
For questions about this, a new advisory case may be opened for security peers.

# Do you have to reset the KRBTGT account password twice?
In the article below, you may notice that the security recommendation is to reset the KRBTGT password twice so that the n-1 authentication is not available. It also outlines the procedure for the reset:
[AD Forest Recovery - Resetting the KRBTGT Password](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/forest-recovery-guide/ad-forest-recovery-reset-the-krbtgt-password)

_You should perform this operation twice. The password history of the KRBTGT account is two, meaning it includes the two most recent passwords. By resetting the password twice, you effectively clear any old passwords from the history, so there is no way another Domain Controller (DC) will replicate with this DC using an old password._

# Best practice procedure for the KRBTGT reset

Resetting the KRBTGT password twice in a large environment in a short period of time may cause authentication outages. To avoid this, ensure that replication is completed to all DCs before resetting the password the second time. For example, monitor the KRBTGT account replication metadata.

This may require manual progress validation. Once you reset the password, you can get a showobjmeta of the object krbtgt and see whether it reflects under the attribute pwdLastSet the timestamp when the password reset was done. From an elevated command prompt, run the following command:
```
repadmin /showobjmeta . DN of krbtgt
```

# Password complexity of the reset KRBTGT account
When the account is reset, a random password is assigned that is both complex and has MaxPasswordLength128 characters. Only the hash is stored, but it needs to be replicated to all DCs to allow cross-DC ticketing.

# Are client logons affected after the KRBTGT reset?
No, Windows clients may fail to request a new Ticket Granting Service (TGS) when the cached n-2 password Ticket Granting Ticket (TGT) is provided in the PA-Data. However, it retries with an Authentication Service (AS) request from scratch, which is transparent for the user. In the worst-case scenario, users may need to lock and unlock their sessions, as this purges all user logon session keys, including the outdated TGT. A logoff and logon, or even a system restart, is not required. This retry behavior may not exist on non-Windows Kerberos clients.

# What are the effects of changing the password on applications such as Exchange or TMG?
If you reset the KRBTGT password only once, there should be no impact on Microsoft Servers. However, if the password is reset twice in a short interval (less than 10-12 hours), authentication outages may occur. In this case, a server will need to be restarted, or at least the Kerberos cache for the Local System needs to be deleted. This can be done by running the following command:
```
klist -li 0x3e7 purge
```

# To purge all available logon session Kerberos cache entries, run the following elevated PowerShell command:
```
Get-WmiObject Win32_LogonSession | Where-Object {$_.AuthenticationPackage -ne 'NTLM'} | ForEach-Object {klist.exe purge -li ([Convert]::ToString($_.LogonId, 16))}
```

# Do you have to recreate the keytab files for MIT/Unix systems?
You dont have to generate new keytab files, as they dont contain KRBTGT key material. A KeyTab file is the corresponding way Unix stores account credential hashes, similar to the way Windows stores hashes in the registry for the computer. The Unix client may require a restart to re-authenticate if an outdated TGT is in its cache.

---

# Articles and script references

[Active Directory Forest Recovery - Reset the KRBTGT password](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/forest-recovery-guide/ad-forest-recovery-reset-the-krbtgt-password)

[New-KRBTGTKeys.ps1](https://github.com/microsoftarchive/New-KrbtgtKeys.ps1)

[Reset-KRBTGT-Password-For-RWDCs-And-RODCs.ps1](https://github.com/zjorz/Public-AD-Scripts/blob/5666e5fcafd933c3288a47944cd6fb289dde54a1/Reset-Krbtgt-Password-For-RWDCs-And-RODCs.ps1)

[Golden Ticket! You lose! Good day, sir! (Updated)](https://learn.microsoft.com/en-us/archive/blogs/tspring/golden-ticket-you-lose-good-day-sir-updated)

[FAQs from the Field on KRBTGT Reset](https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/faqs-from-the-field-on-krbtgt-reset/ba-p/2367838)

[Persistence and privilege escalation alerts - Microsoft Defender for Identity](https://learn.microsoft.com/en-us/defender-for-identity/persistence-privilege-escalation-alerts)

[Mitigating Pass-the-Hash (PtH) Attacks and Other Credential Theft, Version 1 and 2](https://www.microsoft.com/en-us/download/details.aspx?id=36036)

[KRBTGT Account Password Reset Scripts now available for customers](https://www.microsoft.com/en-us/security/blog/)