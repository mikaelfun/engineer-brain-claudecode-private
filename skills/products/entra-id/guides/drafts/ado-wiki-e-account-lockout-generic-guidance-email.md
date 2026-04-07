---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Account Lockouts/Workflow: Account Lockout: Data Collection - Reactive/Workflow: Account Lockout: Generic guidance in Email"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAccount%20Lockouts%2FWorkflow%3A%20Account%20Lockout%3A%20Data%20Collection%20-%20Reactive%2FWorkflow%3A%20Account%20Lockout%3A%20Generic%20guidance%20in%20Email"
importDate: "2026-04-07"
type: troubleshooting-guide
---

This document provides best practice steps for handling account lockout scenarios, including Microsoft's recommendations, data collection, troubleshooting methods, and specific tools and scripts to assist with resolving lockout issues.

# Best practices

The threshold is a balance between operational efficiency and security, and it depends on your organization's risk level. To allow for user error and to thwart brute force attacks, Windows security baselines recommend a value of 10, which could be an acceptable starting point for your organization.  
Link: https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/account-lockout-threshold

---

# Microsoft's recommendations

"Brute force password attacks can be automated to try thousands or even millions of password combinations for any or all user accounts. Limiting the number of failed logons that can be performed nearly eliminates the effectiveness of such attacks. However, it is important to note that, in contrast, a denial-of-service attack could be performed on a domain that has an account lockout threshold configured. A malicious user could programmatically attempt a series of password attacks against all users in the organization. If the number of attempts is greater than the value of Account lockout threshold, the attacker could potentially lock out every account.

Because vulnerabilities can exist both when this value is configured and when it is not, any organization should weigh their identified threats and the risks that they are trying to mitigate. There are two options to consider for this policy setting:

Set Account lockout threshold to 0. This ensures that accounts will not be locked out. This setting will prevent a denial-of-service attack that intentionally locks out all or some accounts. In addition, this setting helps reduce Help desk calls because users cannot accidentally lock themselves out of their accounts.

Because it will not prevent a brute force attack, a value of 0 should only be chosen if both of the following criteria are explicitly met:
- Password Policy settings force all users to have complex passwords made up of eight or more characters.
- A robust auditing mechanism is in place to alert administrators when a series of failed logons are occurring in the environment.

If these criteria cannot be met, set Account lockout threshold to a high enough value that users can accidentally mistype their password several times before they are locked out of their account, but ensure that a brute-force password attack would still lock out the account. It is advisable to specify a value of 50 invalid logon attempts."

- If you are using Active Directory Federation Services (ADFS), implement smart lockout feature: https://learn.microsoft.com/en-us/azure/active-directory/authentication/howto-password-smart-lockout
- For hybrid environments, you can implement protect user accounts from attacks with Azure Active Directory smart lockout.

### More articles
- Configuring Account Lockout: https://learn.microsoft.com/en-us/archive/blogs/secguide/configuring-account-lockout
- Set the account lockout threshold to the recommended value: https://learn.microsoft.com/en-us/services-hub/microsoft-engage-center/health/remediation-steps-ad/set-the-account-lockout-threshold-to-the-recommended-value
- Microsoft Defender for Identity: credential access alerts: https://learn.microsoft.com/en-us/defender-for-identity/credential-access-alerts

---

# Data collection and troubleshooting

The next step would be to identify what exactly causes the lockout and on which machines this is generated.

## Event IDs for account lockout scenarios

|Type|Event ID|
|:--:|:--:|
|Logon/Logoff Logon (Netlogon)|4625: Failed Netlogon requests|
|Kerberos Authentication Service|4771: Failed Kerberos pre-auth requests (TGT) (0x18 = bad password, 0x12 = already locked)|
|Kerberos Authentication Service|4768: Failed/Success Kerberos Authentication ticket (TGT)|
|Kerberos Authentication Service|4769: Failed/Success Kerberos service ticket requests (TGS)|
|Credential Validation|4776: Failed/Success NTLM auth requests (0xC000006A = incorrect password)|
|User Account Management|4740: Account is already locked|
|Credential Validation|4767: Account is unlocked|
|Logon/Logoff - Network Policy Server|6273: NPS denied access to a user (Radius)|

---

## Potential lockout causes on a client machine

- Cached credentials/Stored User Names and Passwords: Are there items stored in the Windows credential manager/vault?
- Are there persistent drive mappings using the user credentials?
- Are there scheduled tasks using the user credentials?
- Are there malicious processes running on the systems?
- Applications: Turn off applications one by one and monitor if lockouts or bad authentication attempts still happen.
- Service accounts: Are there any services running in the user's context?
- Users logged into multiple machines: Is the user logged onto other machines (idle/disconnected Terminal Server sessions, multiple clients)?
- BYOD devices: iOS or Android devices have keyring functionality similar to the Windows Credential Manager/Vault.
- Is the user using other devices like smartphones, tablets for connecting to resources, or browsing the web through a proxy with authentication enabled? Mailbox access via OWA?

---

## Troubleshooting steps

### 3.a LockoutStatus.exe

- When the user account is locked, run the LockoutStatus.exe. Select "Select Target..." from the File menu and search for the account name.
- Check the most recent badPasswordTime (Last Bad Pwd) timestamp for the user and observe the badPwdCount on the Domain Controller (DC) and Primary Domain Controller (PDC).
- Check the Orig Lock column which shows the DC where the lockout originated. The next step will be to collect Netlogon debug logs and security events from that DC and start the analysis.

### 3.b Auditing settings

```
auditpol /set /subcategory:"Logon" /success:enable /failure:enable   
auditpol /set /subcategory:"Logoff" /success:enable /failure:enable   
auditpol /set /subcategory:"Account Lockout" /success:enable /failure:enable   
auditpol /set /subcategory:"Special Logon" /success:enable /failure:enable   
auditpol /set /subcategory:"Other Logon/Logoff Events" /success:enable /failure:enable   
auditpol /set /subcategory:"User Account Management" /success:enable /failure:enable   
auditpol /set /subcategory:"Kerberos Service Ticket Operations" /success:enable /failure:enable   
auditpol /set /subcategory:"Other Account Logon events" /success:enable /failure:enable   
auditpol /set /subcategory:"Kerberos Authentication Service" /success:enable /failure:enable   
auditpol /set /subcategory:"Credential Validation" /success:enable /failure:enable
```

This must be set domain-wide for all computers.

### 3.c Get-LockoutEvents script

PowerShell script to collect security events from all DCs in a given forest or domain. Collects events 4771, 4776 with error codes 0x18 and c000006a.  
https://github.com/AhmedMahmoud87/Get-LockoutEvents

Usage: `.\Get-LockoutEvents.ps1 <username> <DomainName>`

### 3.d Netlogon debug logging

Enable on a single DC:
```
Nltest /dbflag:0x2080ffff
```

Enable on all DCs:
```
For /f %i in ('dsquery server -o rdn') do nltest /server:%i /dbflag:0x2080ffff
```

Netlogon.log is located under the Windows\Debug folder.

To disable: `Nltest /DBFlag:0x0`

When checking Netlogon Logs, trace the full authentication circuit from member server -> authenticating DC -> PDC to identify the source of bad credentials.
