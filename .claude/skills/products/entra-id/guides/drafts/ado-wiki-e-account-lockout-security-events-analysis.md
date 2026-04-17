---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Account Lockouts/Workflow: Account Lockout: Data Collection - Reactive/Workflow: Account Lockout: Data Analysis - Security Events"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAccount%20Lockouts%2FWorkflow%3A%20Account%20Lockout%3A%20Data%20Collection%20-%20Reactive%2FWorkflow%3A%20Account%20Lockout%3A%20Data%20Analysis%20-%20Security%20Events"
importDate: "2026-04-07"
type: troubleshooting-guide
---

This article provides guidelines for collecting and analyzing security events related to account lockouts in Windows Directory Services. It includes steps for identifying the source of bad password attempts and analyzing logs using Log Parser.

---

# Data analysis description

It's crucial to collect logs from the correct resource with recommended audit settings. Check Workflow: Account Lockout: Data Collection - Reactive section on how to find the originating Domain Controller (DC) locking the account.

---

# Security events

Here are common event IDs per auditing category and related possible authentication requests.

**Logon/Logoff Logon (Netlogon)**
- **4625**: Failed Netlogon requests

**Kerberos authentication service**
- **4771**: Failed Kerberos pre-authentication requests (Ticket Granting Ticket (TGT)) (Error code 0x18 shows it's a request with a bad password. 0x12 means that the account is already locked - any request with the correct password will be logged with that error code.)
- **4768**: Failed/Success Kerberos Authentication ticket (TGT)
- **4769**: Failed/Success Kerberos service ticket requests (Ticket Granting Service (TGS))

**Credential validation**
- **4776**: Failed/Success NTLM (NT LAN Manager) authentication requests (Error status code will show if the request is for a failure (bad password) 0xC000006A means the password is incorrect.)

**User account management**
- **4740**: Account is already locked (Most of the time you may see the source in this event is the user's regular device. Any attempt even with the correct password after lockout will produce the event.)
- **4767**: Account is unlocked

**Logon/Logoff - Network Policy Server**
- **6273**: Network Policy Server denied access to a user (RADIUS)

---

Analyze the security events of any DC which has increased the **badPwdCount** attribute for the user and the **badPasswordTime** timestamp is recent. You can filter out the events with the above event IDs and save as *evtx*.

Open the saved log and first look for event **ID 4625** for that affected user to determine which authentication protocol is being used.

**Example:**

```
Log Name: Security
Source: Microsoft-Windows-Security-Auditing
Date: 2/27/2018 11:50:56 PM
   Event ID: 4625
Task Category: Logon
Level: Information
Keywords: Audit Failure
User: N/A
Computer: DCA.Contoso.com 
Description:
   An account failed to log on

Subject:
 Security ID: CONTOSO\Administrator
 Account Name: Administrator
 Account Domain:CONTOSO
 Logon ID: 0x3FA18

Logon Type: 2    

Account For Which Logon Failed:
 Security ID: NULL SID
    Account Name: testuser101
 Account Domain:CONTOSO

Failure Information:
     Failure Reason: Unknown user name or bad password
     Status:0xC000006D
 Sub Status: 0xC000006A

Process Information:
 Caller Process ID: 0x1c8
 Caller Process Name: C:\Windows\System32\svchost.exe

Network Information:
 Workstation Name: DCA
 Source Network Address: ::1
 Source Port: 0

Detailed Authentication Information:
 Logon Process: seclogo
    Authentication Package: Negotiate
```

In case of the Kerberos protocol, you will see **Negotiate** as the authentication package while for the NTLM protocol, you will see **NLMP** in the same field.

For the Kerberos protocol, filter and look for the below events next:
- Event ID **4771** (bad password event)
- Event ID **4740** (lockout event)

There should be **n** number of 4771 bad password attempts where **n** is the lockout threshold defined (in the example below Lockout threshold is 5), followed by a **4740** event describing that the account has been locked out.

Open the 4771 bad password events and look for the information highlighted below (Kerberos).

**Example:**

```
Log Name: Security
Source: Microsoft-Windows-Security-Auditing
Date: 2/27/2018 11:50:56 PM
   Event ID: 4771
Task Category: Kerberos Authentication Service
Level: Information
Keywords: Audit Failure
User: N/A
Computer: DCA.Contoso.com 
Description:
Kerberos pre-authentication failed.
Account Information:
    Security ID: CONTOSO\testuser101
 Account Name: testuser101

Service Information:
 Service Name: krbtgt/CONTOSO

Network Information:
    Client Address: ::ffff:192.168.2.57
 Client Port: 62724

Additional Information:
 Ticket Options: 0x40810010
    Failure Code: 0x18
 Pre-Authentication Type: 2
```

**Note:**

There are going to be a huge number of **4771** events with failure code **0x12** (instead of 0x18). But our focus will only be on the events with the code **0x18** (bad password) and not the 0x12 (locked out).

| Error Code | Symbolic Name | Error Description |
|:--:|:--:|:--:|
| 0x18 | KDC_ERR_PREAUTH_FAILED | Pre-authentication information was invalid |
| 0x12 | KDC_ERR_CLIENT_REVOKED | Client's credentials have been revoked |

**KDC_ERR_PREAUTH_FAILED**: An authentication attempt validated as invalid due to **incorrect credentials**.  
**KDC_ERR_CLIENT_REVOKED**: An authentication attempt validated as invalid as the account has already been **locked out**.

---

The **Client Address** field is going to give us an IP address of the resource who is sending the bad passwords. If the target machine is again a domain controller, you would need to follow the same process to again narrow down the source machine of bad passwords.

Keep iterating the same approach until you can track back the source to a machine which is not a domain controller.

Once you narrow it down to a member server or a client machine, it means there is some application or process running on that machine with bad credentials and is generating the bad passwords.

Alternatively, if you narrow it down to any other network device, it means they are the ones through which the bad credentials are being passed through.

---

When the authentication protocol being used is NTLM, success and failure requests will be logged in security event ID 4776. The same information should be logged in the Netlogon log too.

**Example:**

```
Log Name: Security
Source: Microsoft-Windows-Security-Auditing
Date: 9/19/2018 1:30:35 PM
Event ID: 4776
Task Category: Credential Validation
Level: Information
Keywords: Audit Failure
User: N/A
Computer: DCA.Contoso.com 
Description:
The computer attempted to validate the credentials for an account.

Authentication Package:  MICROSOFT_AUTHENTICATON_PACKAGE_V1_0
Logon Account:  testuser@contoso.com
Source Workstation:  WK-Intel123
Error Code: 0xC000006A
```

# Analyzing security events with Log Parser

Log Parser 2.2 can be downloaded from https://www.microsoft.com/en-in/download/details.aspx?id=24659.

You can copy the Security.evtx to the installation folder of LogParser and run the following command:

```
LogParser.exe -i:evt "select timegenerated,eventid,strings from *.evtx where eventid=4625 or eventid=5461 or eventid=4740 or eventid=4768 or eventid=4772 or eventid=4771 or eventid=4648 or eventid=4776 " -q:ON > events.txt
```
