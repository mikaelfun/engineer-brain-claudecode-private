---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow: AD Replication appears slow or is delayed/Urgent Replication"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FWorkflow%3A%20AD%20Replication%20appears%20slow%20or%20is%20delayed%2FUrgent%20Replication"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423206&Instance=423206&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423206&Instance=423206&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document explains the concept of urgent replication in Active Directory, detailing the events that trigger it, how account lockout changes are replicated, and how password changes are managed. Urgent replication ensures that critical updates are propagated immediately across domain controllers to maintain security and consistency.

# Urgent replication

Certain important events trigger replication immediately, overriding existing change notifications. Urgent replication is implemented immediately by using RPC/IP to notify replication partners that changes have occurred on a source domain controller. Urgent replication uses regular change notifications between destination and source domain controller pairs that otherwise use change notifications, but notifications are sent immediately in response to urgent events instead of waiting the default period of 15 seconds (or 300 seconds on domain controllers that are running Windows 2000).

# Events that trigger urgent replication

Urgent Active Directory replication is always triggered by certain events on all domain controllers within the same site, regardless of the operating system running on the domain controller. When you have enabled change notifications between sites, these triggering events also replicate immediately between sites.

Between domain controllers in the same site, immediate notification is caused by the following events:

* Assigning an account lockout, which a domain controller performs to prohibit a user from logging on after a certain number of failed attempts. **Note:** An account unlock is not urgently replicated.
* Changing the account lockout policy.
* Changing the domain password policy.
* Changing a Local Security Authority (LSA) secret, which is a secure form in which private data is stored by the LSA (for example, the password for a trust relationship).
* Changing the password on a domain controller computer account.
* Changing the relative identifier (known as a RID) master role owner, which is the single domain controller in a domain that assigns relative identifiers to all domain controllers in that domain.

# Urgent replication of account lockout changes

Account lockout is a security feature that sets a limit on the number of failed authentication attempts that are allowed before the account is locked out from a further attempt to log on, in addition to a time limit for how long the lockout is in effect.

The PDC (Primary Domain Controller) emulator receives urgent replication of account lockouts. In Active Directory domains, a single domain controller in each domain holds the role of PDC emulator, which simulates the behavior of a Windows NT version 3.xbased or Windows NT 4.0based PDC. In Windows NT domains, the only domain controller that can accept updates is the PDC. If authentication fails at a BDC (Backup Domain Controller), the authentication request is passed immediately to the PDC, which is guaranteed to have the current password.

**Note:**  
Because Active Directory Lightweight Directory Services (AD LDS) does not have a PDC emulator, urgent replication of account lockouts does not occur. An account lockout is replicated according to the [replication frequency schedule](https://learn.microsoft.com/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc816871(v=ws.10)?redirectedfrom=MSDN). To ensure account lockouts are replicated as soon as possible in AD LDS, configure the replication frequency for every 15 minutes, or to another value that is suitable for your environment. The lowest value that can be set is 15 minutes. For more information, see [Setting replication frequency](https://learn.microsoft.com/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc816871(v=ws.10)?redirectedfrom=MSDN).).

An account lockout is urgently replicated to the PDC emulator and is then urgently replicated to the following:
* Domain controllers in the same domain that are located in the same site as the PDC emulator.
* Domain controllers in the same domain that are located in the same site as the domain controller that handled the account lockout.
* Domain controllers in the same domain that are located in sites that have been configured to allow change notifications between sites (and, therefore, urgent replication) with the site that contains the PDC emulator or with the site where the account lockout was handled. These sites include any site that is included in the same site link as the site that contains the PDC emulator or in the same site link as the site that contains the domain controller that handled the account lockout.

Additionally, when authentication fails at a domain controller other than the PDC emulator, the authentication is retried at the PDC emulator. For this reason, the PDC emulator locks the account before the domain controller that handled the failed-password attempt if the bad-password-attempt threshold is reached.

**Note:**  
When a bad password is used in an attempt to change a password, the lockout count is incremented on that domain controller only and is not replicated. As such, an attacker could try (number of domain controllers) * (lockout threshold -1) + 1 guesses before the account is locked out. Although this scenario has a relatively small impact on account lockout security, domains with an exceptionally high number of domain controllers represent a significant increase in the total number of guesses available to an attacker. Because a user cannot specify the domain controller on which the password change is attempted, an attack of this type requires an advanced tool.

# Replication of password changes

Password changes are replicated differently than both normal (non-urgent) replication and urgent replication. Changes to security account passwords present a replication latency problem wherein a users password is changed on domain controller A and the user subsequently attempts to log on, being authenticated by domain controller B. If the password has not replicated from A to B, the attempt to log on fails. Active Directory replication remedies this situation by forwarding password changes immediately to a single domain controller in the domain, the PDC emulator.

In Active Directory, when a user password is changed at a domain controller, that domain controller attempts to update the respective replica at the domain controller that holds the PDC emulator role. Update of the PDC emulator occurs immediately, without respect to schedules on site links. The updated password is propagated to other domain controllers by normal replication within a site.

When the user logs on to a domain and is authenticated by a domain controller that does not have the updated password, the domain controller refers to the PDC emulator to check the credentials of the user name and password rather than denying authentication based on an invalid password. Therefore, the user can log on successfully even when the authenticating domain controller has not yet received the updated password. On domain controllers that are running Windows Server 2003 or Windows 2000 Server with SP4, if the authentication is successful at the PDC emulator, the PDC emulator replicates the password immediately to the requesting domain controller to prevent that domain controller from having to check the PDC emulator again.

If the update at the PDC emulator fails for any reason, the password change is replicated non-urgently by normal replication.

For clients that are running Windows NT 4.0 or clients that are running Windows 95 or Windows 98 without the Directory Service Client Pack, the client attempts to contact the PDC emulator. If the client has the Directory Service Client Pack installed, the client contacts any domain controller and the contacted domain controller then attempts to contact the PDC emulator.

**Note:**  
The Group Policy setting Contact PDC on logon failure can be disabled to keep a domain controller from contacting the PDC emulator if the PDC emulator role owner is not in the current site. If this setting is disabled, the password change reaches the PDC emulator non-urgently through normal replication.

From: 
https://learn.microsoft.com/previous-versions/windows/it-pro/windows-server-2003/cc772726(v=ws.10)?redirectedfrom=MSDN