---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Account Lockouts/Workflow: Account Lockout: Scenario based Troubleshooting - Kerberos Auth"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Account%20Lockouts/Workflow%3A%20Account%20Lockout%3A%20Scenario%20based%20Troubleshooting%20-%20Kerberos%20Auth"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414159&Instance=414159&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414159&Instance=414159&Feedback=2)

___
<div id='cssfeedback-end'></div>

This article provides a detailed troubleshooting guide for an account lockout issue with the authentication protocol used as Kerberos. The guide includes a setup overview, steps to reproduce the issue, proactive and reactive troubleshooting steps, and detailed analysis using event logs and Kerberos ETL logs.

[[_TOC_]]

# Scenario-based troubleshooting

Troubleshooting an account lockout issue with the authentication protocol used as Kerberos.

## Setup

| Role | Name | OS |
|:--:|:--:|:--:|
| Domain Controller | VMDC1-Fab | Windows Server 2019 |
| Domain Controller | VMDC2-Fab | Windows Server 2019 |
| File Server | VMSRV2-Fab | Windows Server 2019 |
| Shared folder | ALShare, only Authenticated users have full control <br/> IP Address: 10.160.126.38 <br/> ![Image of shared folder setup](/.attachments/image-6bd6540a-8924-4ec6-aa8b-0b6436a93c1c.png) | - |
| Client | VM1WIN10-Fab | Windows 10 22h2 |
| User | Fabrikam\User1 | - |
| User | Fabrikam\User2 | - |

### Account lockout GPO
Configured Group Policy to set Account Lockout Policy and linked it at the domain level "fabrikam.com".

![Image of Account Lockout GPO](/.attachments/image-7e85345f-3b74-448b-93a5-832ec7cdfc97.png)

---

# Reproduce account lockout

To reproduce the account lockout scenario, run the following command on the client machine to access the "ALShare" shared folder on the file server "VMSRV2-Fab (10.160.126.38)" under the "Fabrikam\User1" user context:
```sh
net use * \\VMSRV2-Fab\ALShare /user:fabrikam\user1 *
```
or
```sh
runas /userd:fabrikam\user1 cmd
```

---

## Scenario #1 - Use Kerberos protocol

- Log on with a local user/admin account.
- Create a batch file with the command to create a mapped drive for the share path "\\VMSRV2-Fab\ALShare".
  ```sh
  net use * \\VMSRV2-Fab\ALShare /user:fabrikam\user1 *
  ```
- Provide user credentials with an incorrect password in the command itself.
  ![Image of incorrect password command](/.attachments/image-baad764c-df0d-4eb6-9754-cd0239303471.png)

---

# Detailed troubleshooting steps

## Proactive steps
Proactively enable the following logging on respective systems:

**On domain controllers, member servers, and client machines**:

- Enable Netlogon debug logging:
  ```sh
  Nltest /dbflag:2080ffff
  ```
  or
  ```sh
  For /f %i in ('dsquery server -o rdn') do nltest /server:%i /dbflag:0x2080ffff
  ```

- Security auditing:
  ```sh
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

---

## Reactive steps

Configure network trace, AuthScripts, or tssv2 and ProcMon on the client machine to collect logs while reproducing the issue.

### Scenario #1: Kerberos protocol

#### Check the event logs on the originating DC, here VMDC1-Fab

Filter out Event **ID 4740** and **ID 4771** and search for the username in question.

![image.png](/.attachments/image-77d6b085-49d2-4538-b86b-5448e5223ece.png)

**ID 4740**:
```
Log Name:      Security
Source:        Microsoft-Windows-Security-Auditing
Date:          1/17/2023 12:00:57 PM
Event ID:      4740
Task Category: User Account Management
Level:         Information
Keywords:      Audit Success
User:          N/A
Computer:      VMDC1-Fab.fabrikam.com
Description:
A user account was locked out.

Subject:
Security ID:            SYSTEM
Account Name:           VMDC1-Fab$  Account is locked on this DC
Account Domain:         FABRIKAM
Logon ID:               0x3E7

Account That Was Locked Out:
Security ID:            FABRIKAM\user1  Account locked out
Account Name:           user1

Additional Information:
Caller Computer Name:   VM1WIN10-Fab  Source machine from where bad logon request was received.
```

**ID 4771**:
Look for sub status code 0x18 (KDC_ERR_PREAUTH_FAILED). Pre-authentication is tried 3 times with a bad password. This is followed by Event ID 4740 on the next attempt, proving the source is locking the user account.

The caller machine (source) IP address here is 10.160.126.39.

```
Log Name:      Security
Source:        Microsoft-Windows-Security-Auditing
Date:          1/17/2023 12:00:57 PM
Event ID:      4771
Task Category: Kerberos Authentication Service
Level:         Information
Keywords:      Audit Failure
User:          N/A
Computer:      VMDC1-Fab.fabrikam.com
Description:
Kerberos pre-authentication failed.

Account Information:
    Security ID:        FABRIKAM\user1
    Account Name:       user1  Logon attempt was for this account

Service Information:
    Service Name:       krbtgt/fabrikam

Network Information:
    Client Address:     ::ffff:10.160.126.39  Caller (source) machine from where bad logon request was received.
    Client Port:        53216  Caller client port used by the process on the source machine

Additional Information:
    Ticket Options:     0x40810010 
    Failure Code:       0x18  Pre-authentication information was invalid - usually means BAD password
    Pre-Authentication Type: 2  PA-ENC-TIMESTAMP - This is a normal type for standard password authentication.
```
Details about Ticket Options


| Type   | Value  |
|--|--|
|[Type = HexInt32]|  this is a set of different Ticket Flags in hexadecimal format|
|Ticket Options|0x40810010|   
|Binary view|01000000100000010000000000010000|   
|UsingMSB 0bit numbering| we have bit 1, 8, 15 and 27 set = Forwardable, Renewable, Canonicalize, Renewable-ok| 
|The most common values|0x40810010 - Forwardable, Renewable, Canonicalize, Renewable-ok<br>0x40810000 - Forwardable, Renewable, Canonicalize<br>0x60810010 - Forwardable, Forwarded, Renewable, Canonicalize, Renewable-ok| 



---

#### Moving to the client machine

Try name resolution to get the machine. Resolved the name and found it's "VM1WIN10-Fab".

```sh
ping -a 10.160.126.39
Pinging VM1WIN10-Fab [10.160.126.39] with 32 bytes of data:
Reply from 10.160.126.39: bytes=32 time<1ms TTL=128
Reply from 10.160.126.39: bytes=32 time<1ms TTL=128
```

#### Check the event logs on the client VM1WIN10-Fab

Filter by timestamp (1 minute before and after the timestamp of account locked out). There is no Event ID 4625 found for account FABRIKAM\user1.

We can only find 4648, which states "This event is generated when a process attempts to log on an account by explicitly specifying that accounts credentials."

```xml
*[System[(EventID=4648)]] and *[EventData[Data[@Name='TargetUserName']and(Data='user1')]]
```

 ![Image of Event ID 4648](/.attachments/image-2cf34f10-2c32-4853-aa70-a9e576e2a1d9.png)

This most commonly occurs in batch-type configurations such as scheduled tasks or when using the RUNAS command, which states the logon attempt was done for batch-type logon.

**ID 4648**:
```
Log Name:      Security
Source:        Microsoft-Windows-Security-Auditing
Date:          1/17/2023 12:00:57 PM
Event ID:      4648
Task Category: Logon
Level:         Information
Keywords:      Audit Success
User:          N/A
Computer:      VM1WIN10-Fab.fabrikam.com
Description:
A logon was attempted using explicit credentials.

Subject:
Security ID:            FABRIKAM\admin
Account Name:           admin  This attempt was done under local admin account.
Account Domain:         VM1WIN10-Fab
Logon ID:               0x12375fc
Logon GUID:             {00000000-0000-0000-0000-000000000000}

Account Whose Credentials Were Used:
Account Name:           user1
Account Domain:         contoso
Logon GUID:             {00000000-0000-0000-0000-000000000000}

Target Server:
Target Server Name:     VMSRV2-Fab.fabrikam.com
Additional Information: VMSRV2-Fab.fabrikam.com

Process Information:
Process ID:             0x4
Process Name:
Network Information:
Network Address:        -
Port:                   -
```

Before every logon attempt, a process creation event for "net.exe" is logged under the same parent process, under the "admin" local account, which is the subject account (under which batch logon was done by the locked-out account) mentioned in every logon event:

**ID 4688**:
```
Log Name:      Security
Source:        Microsoft-Windows-Security-Auditing
Date:          1/17/2023 12:00:57 PM
Event ID:      4688
Task Category: Process Creation
Level:         Information
Keywords:      Audit Success
User:          N/A
Computer:      VM1WIN10-Fab.fabrikam.com
Description:
A new process has been created.

Subject:
Security ID:            FABRIKAM\admin
Account Name:           admin  This attempt was done under local admin account.
Account Domain:         VM1WIN10-Fab
Logon ID:               0x12375fc

Process Information:
New Process ID:         0xc40
New Process Name:       C:\Windows\System32\net.exe
Token Elevation Type:   TokenElevationTypeLimited (3)
Creator Process ID:     0xe04  is for cmd.exe, as per the task list
```

Token Elevation Type indicates the type of token that was assigned to the new process in accordance with User Account Control policy.

- **Type 1** is a full token with no privileges removed or groups disabled. A full token is only used if User Account Control is disabled or if the user is the built-in Administrator account or a service account.
- **Type 2** is an elevated token with no privileges removed or groups disabled. An elevated token is used when User Account Control is enabled and the user chooses to start the program using Run as administrator. An elevated token is also used when an application is configured to always require administrative privilege or to always require maximum privilege, and the user is a member of the Administrators group.
- **Type 3** is a limited token with administrative privileges removed and administrative groups disabled. The limited token is used when User Account Control is enabled, the application does not require administrative privilege, and the user does not choose to start the program using Run as administrator.

In every process creation event "4688" which is created just before the logon event, the parent process is HEX "E04" (DEC 3588).

Get a tasklist output as per PID - `tasklist | findstr "3588"`

```sh
cmd.exe 3588 N/A
```

Below are the child processes for "net.exe" process created under cmd.exe:


```
0xc40: 3136
0x5e8: 1512
0x618: 1560
0xb50: 2896
```


---

#### Analyze the ProcMon data

Filter by parent process PID: "0xE04 (3588)" Process Name: CMD, you can find a batch file running **C:\temp\alshare.bat** calling **C:\Temp\net.\*** process.

![Image of ProcMon data](/.attachments/image-993d6fde-746f-4220-bbf4-c0bd712df866.png)

Look for the process tree where the process **net.exe** is reported the same as in the event log. These subprocesses are running the net use command which is running for the fabrikam\user1 user account.

Command: `net use z: \\serer\share /USER:domain\user intentional_wrong_password`

example: `net use * \\VMSRV2-Fab\ALShare /user:fabrikam\user1 *`

![Image of net use command](/.attachments/image-c95f04ec-95ef-4c9e-8151-3a391f873c9d.png)

---

### Conclusion 

**Source of the lockout is "Net.exe" command run under cmd.exe process on client machine called VM1WIN10-Fab.**

---

#### Using Kerberos.etl

Let's use another example using:
- CONCL3 as device,
- test1 as user,
- ConMem1 as server,
- 192.168.1.2 as KDC,

You may try the same to find the offending process in Kerberos ETL log captured by auth scripts.

KERB ETL LOG:

Find the logon request timestamp for user Contoso\test1 matches with the lockout event. So we need to look for the thread id "0F00" in lsass log file (lsa.etl):

where,
Hex "021C.0F00" is DEC "540.3840"
Accept credentials, logon type **0x5 (Access Denied)** sent by account "CONTOSO\CONCL3$" client

```
[0] 021C.0F00::08/31/17-23:12:50.1915171 [winnt5] credapi_cxx2187 SpAcceptCredentials() - SpAcceptCredentials called
[0] 021C.0F00::08/31/17-23:12:50.1915191 [winnt5] credapi_cxx2205 SpAcceptCredentials() - SpAcceptCredentials accepting credentials for 0:0x3e4, flag 0x1, logon type 0x5, CONTOSO\CONCL3$ or CONCL3$@Contoso.com at Contoso.com, SupplementalCredentials 0000000000000000
[0] 021C.0F00::08/31/17-23:12:50.1915842 [winnt5] logonses_cxx2041 KerbChangeCredentialsPassword() - KerbChangeCredentialsPassword password not changed
[0] 021C.0F00::08/31/17-23:12:50.1915874 [winnt5] credapi_cxx3275 SpAcceptCredentials() - SpAcceptCredentials returned 0x0
```

Received credentials of user **\contoso\test1**

```

[0] 021C.0F00::08/31/17-23:12:58.6302949 [winnt5] credapi_cxx3419 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle for pid 0x4, luid (0:12375fc) called  This is the same Logon ID logged in the Event log - Event ID 4648 and 4688
[0] 021C.0F00::08/31/17-23:12:58.6303089 [winnt5] credapi_cxx1831 KerbCaptureSuppliedCreds() - Using user test1
[0] 021C.0F00::08/31/17-23:12:58.6303095 [winnt5] credapi_cxx1869 KerbCaptureSuppliedCreds() - Using domain contoso
[0] 021C.0F00::08/31/17-23:12:58.6303641 [winnt5] credmgr_cxx1613 KerbCreateCredential() - Got supplied credentials
[0] 021C.0F00::08/31/17-23:12:58.6303667 [winnt5] credapi_cxx3714 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle returning success, handle = 00000000003E84A0
[0] 021C.0F00::08/31/17-23:12:58.6303716 [winnt5] credapi_cxx3746 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle for pid 0x4, luid (0:12375fc) returned 0x0
```

Requesting TGT for the file server with the SPN "cifs/ConMem1.Contoso.com"

```
[0] 021C.0F00::08/31/17-23:12:58.6491306 [winnt5] ctxtapi_cxx930 SpInitLsaModeContext() - SpInitLsaModeContext 0000000000000000 called 
[0] 021C.0F00::08/31/17-23:12:58.6491386 [winnt5] ctxtapi_cxx574 KerbProcessTargetNames() - Parsed name cifs/ConMem1.Contoso.com ((null)) into: name type 0x2, name count 2,  realm (null),  first part cifs/ConMem1.Contoso.com 
[0] 021C.0F00::08/31/17-23:12:58.6491410 [winnt5] ctxtapi_cxx753 KerbProcessTargetNames() - Cracked name cifs/ConMem1.Contoso.com 
[0] 021C.0F00::08/31/17-23:12:58.6491458 [winnt5] ctxtapi_cxx754 KerbProcessTargetNames() - into cifs/ConMem1.Contoso.com 
[0] 021C.0F00::08/31/17-23:12:58.6491473 [winnt5] ctxtapi_cxx2081 SpInitLsaModeContext() - SpInitLsaModeContext: First call to Initialize 
[0] 021C.0F00::08/31/17-23:12:58.6491490 [winnt5] credmgr_cxx850 KerbReferenceCredentialEx() - Credential 000000000159DF38 is missing flags: needs 80000000 
[0] 021C.0F00::08/31/17-23:12:58.6491495 [winnt5] credmgr_cxx872 KerbReferenceCredentialEx() - Getting missing TGT for credential 00000000003E84A0 
[0] 021C.0F00::08/31/17-23:12:58.6491529 [winnt5] kerbtick_cxx367 KerbGetTgtForService() - KerbGetTgtForService TargetFlags 0, SuppRealm (null), TargetDomain (null) 
[0] 021C.0F00::08/31/17-23:12:58.6491542 [winnt5] kerbtick_cxx498 KerbGetTgtForService() - KerbGetTgtForService refreshing primary TGT for account 
[0] 021C.0F00::08/31/17-23:12:58.6491548 [winnt5] kerbtick_cxx297 KerbRefreshPrimaryTgt() - KerbRefreshPrimaryTgt getting new TGT for account
```

Requesting TGT for the file server with the SPN "cifs/ConMem1.Contoso.com"

```
[0] 021C.0F00::08/31/17-23:12:58.6491306 [winnt5] ctxtapi_cxx930 SpInitLsaModeContext() - SpInitLsaModeContext 0000000000000000 called
[0] 021C.0F00::08/31/17-23:12:58.6491386 [winnt5] ctxtapi_cxx574 KerbProcessTargetNames() - Parsed name cifs/ConMem1.Contoso.com ((null)) into: name type 0x2, name count 2, realm (null), first part cifs/ConMem1.Contoso.com
[0] 021C.0F00::08/31/17-23:12:58.6491410 [winnt5] ctxtapi_cxx753 KerbProcessTargetNames() - Cracked name cifs/ConMem1.Contoso.com
[0] 021C.0F00::08/31/17-23:12:58.6491458 [winnt5] ctxtapi_cxx754 KerbProcessTargetNames() - into cifs/ConMem1.Contoso.com
[0] 021C.0F00::08/31/17-23:12:58.6491473 [winnt5] ctxtapi_cxx2081 SpInitLsaModeContext() - SpInitLsaModeContext: First call to Initialize
[0] 021C.0F00::08/31/17-23:12:58.6491490 [winnt5] credmgr_cxx850 KerbReferenceCredentialEx() - Credential 000000000159DF38 is missing flags: needs 80000000
[0] 021C.0F00::08/31/17-23:12:58.6491495 [winnt5] credmgr_cxx872 KerbReferenceCredentialEx() - Getting missing TGT for credential 00000000003E84A0
[0] 021C.0F00::08/31/17-23:12:58.6491529 [winnt5] kerbtick_cxx367 KerbGetTgtForService() - KerbGetTgtForService TargetFlags 0, SuppRealm (null), TargetDomain (null)
[0] 021C.0F00::08/31/17-23:12:58.6491542 [winnt5] kerbtick_cxx498 KerbGetTgtForService() - KerbGetTgtForService refreshing primary TGT for account
[0] 021C.0F00::08/31/17-23:12:58.6491548 [winnt5] kerbtick_cxx297 KerbRefreshPrimaryTgt() - KerbRefreshPrimaryTgt getting new TGT for account
```

Received credentials of user contoso\test1 to get TGT:

```
[0] 021C.0F00::08/31/17-23:12:58.6491561 [winnt5] credmgr_cxx473 KerbGetTicketForCredential() - Got a credential && a logon session
[0] 021C.0F00::08/31/17-23:12:58.6491587 [winnt5] ctxtapi_cxx574 KerbProcessTargetNames() - Parsed name test1 ((null)) into: name type 0x1, name count 1, realm (null), first part test1
[0] 021C.0F00::08/31/17-23:12:58.6491598 [winnt5] ctxtapi_cxx753 KerbProcessTargetNames() - Cracked name test1
[0] 021C.0F00::08/31/17-23:12:58.6491624 [winnt5] ctxtapi_cxx754 KerbProcessTargetNames() - into test1
[0] 021C.0F00::08/31/17-23:12:58.6491639 [winnt5] logonapi_cxx3933 KerbGetTicketGrantingTicket() - KerbGetTicketGrantingTicket GetTicketRestart ClientRealm contoso
[0] 021C.0F00::08/31/17-23:12:58.6491680 [winnt5] logonapi_cxx1720 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket getting authentication ticket for client test1
[0] 021C.0F00::08/31/17-23:12:58.6491685 [winnt5] logonapi_cxx1721 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket in realm contoso
[0] 021C.0F00::08/31/17-23:12:58.6491715 [winnt5] logonapi_cxx1722 KerbGetAuthenticationTicketEx() - for ServiceName krbtgt/contoso
[0] 021C.0F00::08/31/17-23:12:58.6491754 [winnt5] logonapi_cxx1852 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket using supplied credentials contoso\test1
[0] 021C.0F00::08/31/17-23:12:58.6491782 [winnt5] logonapi_cxx1853 KerbGetAuthenticationTicketEx() - to ServiceName krbtgt/contoso
[0] 021C.0F00::08/31/17-23:12:58.6491871 [winnt5] logonapi_cxx445 KerbFindCommonPaEtype() - KerbFindCommonPaEtype using current password of test1@contoso
[0] 021C.0F00::08/31/17-23:12:58.6491941 [winnt5] logonapi_cxx2390 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket sending preauth enctype 0, length 0, PrimaryCredentials->PublicKeyCreds 0000000000000000
[0] 021C.0F00::08/31/17-23:12:58.6492078 [winnt5] logonapi_cxx2428 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Calling KDC
[0] 021C.0F00::08/31/17-23:12:58.6492088 [winnt5] kerbtick_cxx2656 KerbMakeSocketCall() - KerbMakeSocketCall uses KdcToCall option 0.
```

First failure with KDC is expected as KDC returns as PREAUTH is Required:

```
[0] 021C.0F00::08/31/17-23:12:58.6492162 [winnt5] kerbtick_cxx2884 KerbMakeSocketCall() - Retry #0 Calling kdc 192.168.1.2 for realm contoso, DesiredFlags 0, connection timeout: 0 secs
[0] 021C.0F00::08/31/17-23:12:58.7193335 [winnt5] logonapi_cxx2456 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Returned from KDC status 0x0
[0] 021C.0F00::08/31/17-23:12:58.7193403 [winnt5] logonapi_cxx2485 KerbGetAuthenticationTicketEx() - Failed to unpack KDC reply as AS: 0x3c
[0] 021C.0F00::08/31/17-23:12:58.7193528 [winnt5] logonapi_cxx2549 KerbGetAuthenticationTicketEx() - KerbCallKdc failed: error 0x19, extendedStatus 0,
```
0x19 = KDC_ERR_PREAUTH_REQUIRED

Client tries next time with the Pre-authentication information which then fails with PREAUTH is Failed:

```
[0] 021C.0F00::08/31/17-23:12:58.7348340 [winnt5] logonapi_cxx445 KerbFindCommonPaEtype() - KerbFindCommonPaEtype using current password of test1@contoso
[0] 021C.0F00::08/31/17-23:12:58.7348726 [winnt5] logonapi_cxx2390 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket sending preauth enctype 18, length 32, PrimaryCredentials->PublicKeyCreds 0000000000000000
[0] 021C.0F00::08/31/17-23:12:58.7348828 [winnt5] logonapi_cxx2428 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Calling KDC
[0] 021C.0F00::08/31/17-23:12:58.7348837 [winnt5] kerbtick_cxx2656 KerbMakeSocketCall() - KerbMakeSocketCall uses KdcToCall option 0.
[0] 021C.0F00::08/31/17-23:12:58.7348880 [winnt5] kerbtick_cxx2884 KerbMakeSocketCall() - Retry #0 Calling kdc 192.168.1.2 for realm contoso, DesiredFlags 0, connection timeout: 0 secs
[0] 021C.0F00::08/31/17-23:12:58.8788455 [winnt5] logonapi_cxx2456 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Returned from KDC status 0x0
[0] 021C.0F00::08/31/17-23:12:58.8788557 [winnt5] logonapi_cxx2485 KerbGetAuthenticationTicketEx() - Failed to unpack KDC reply as AS: 0x3c
[0] 021C.0F00::08/31/17-23:12:58.8788746 [winnt5] logonapi_cxx2549 KerbGetAuthenticationTicketEx() - KerbCallKdc failed: error 0x18, extendedStatus 0,
[0] 021C.0F00::08/31/17-23:12:58.8788770 [winnt5] logonapi_cxx2653 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket retry with new salts on kdc error
[0] 021C.0F00::08/31/17-23:12:58.9033113 [winnt5] logonapi_cxx445 KerbFindCommonPaEtype() - KerbFindCommonPaEtype using current password of test1@contoso
[0] 021C.0F00::08/31/17-23:12:58.9033153 [winnt5] logonapi_cxx523 KerbFindCommonPaEtype() - user contoso\test1 same key no retry: 18
[0] 021C.0F00::08/31/17-23:12:58.9033165 [winnt5] logonapi_cxx748 KerbBuildPreAuthData() - KerbBuildPreAuthData failed to find common pa etypes 0xc000006a
```

**0x18 = KDC_ERR_PREAUTH_FAILED**

**0xc000006a = STATUS_WRONG_PASSWORD**

All next attempts fail with BAD PASSWORD (0xc000006a):

```
[0] 021C.0F00::08/31/17-23:12:58.9033174 [winnt5] logonapi_cxx2222 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket retry with old password
[0] 021C.0F00::08/31/17-23:12:58.9033214 [winnt5] logonapi_cxx283 KerbFindCommonPaEtype() - Failed to update primary creds with new salt: 0xc000000d
[0] 021C.0F00::08/31/17-23:12:58.9033257 [winnt5] logonapi_cxx439 KerbFindCommonPaEtype() - KerbFindCommonPaEtype using old password of test1@contoso
[0] 021C.0F00::08/31/17-23:12:58.9033270 [winnt5] logonapi_cxx451 KerbFindCommonPaEtype() - no password, use old password: true
[0] 021C.0F00::08/31/17-23:12:58.9033274 [winnt5] logonapi_cxx748 KerbBuildPreAuthData() - KerbBuildPreAuthData failed to find common pa etypes 0xc000006a
[0] 021C.0F00::08/31/17-23:12:58.9033278 [winnt5] logonapi_cxx2214 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket retry with new salts
[0] 021C.0F00::08/31/17-23:12:58.9033300 [winnt5] logonapi_cxx283 KerbFindCommonPaEtype() - Failed to update primary creds with new salt: 0xc000000d
[0] 021C.0F00::08/31/17-23:12:58.9033338 [winnt5] logonapi_cxx439 KerbFindCommonPaEtype() - KerbFindCommonPaEtype using old password of test1@contoso
[0] 021C.0F00::08/31/17-23:12:58.9033343 [winnt5] logonapi_cxx451 KerbFindCommonPaEtype() - no password, use old password: true
[0] 021C.0F00::08/31/17-23:12:58.9033347 [winnt5] logonapi_cxx748 KerbBuildPreAuthData() - KerbBuildPreAuthData failed to find common pa etypes 0xc000006a
```

Authentication process fails, resulting in logon failure "0xc000006d" due to error "0xc000006a":

```
[0] 021C.0F00::08/31/17-23:12:58.9033367 [winnt5] logonapi_cxx2244 KerbGetAuthenticationTicketEx() - GetAuthenticationTicket: Failed to build pre-auth data: 0xc000006a for contoso\test1, d:\w7rtm\ds\security\protocols\kerberos\client2\logonapi.cxx, line 2244
[0] 021C.0F00::08/31/17-23:12:58.9033426 [winnt5] kerbtick_cxx519 KerbGetTgtForService() - KerbGetTgtForService failed to refresh primary TGT: 0xc000006a
[0] 021C.0F00::08/31/17-23:12:58.9033466 [winnt5] ctxtapi_cxx2109 SpInitLsaModeContext() - SpInitLsaModeContext failed to locate credential 0x0, InitialStatus 0xc000006a
[0] 021C.0F00::08/31/17-23:12:58.9033489 [winnt5] ctxtapi_cxx3196 SpInitLsaModeContext() - SpInitLsaModeContext returned 0xc000006d, Context 0000000000000000, Pid 0x0
[0] 021C.0F00::08/31/17-23:12:58.9033494 [winnt5] ctxtapi_cxx3197 SpInitLsaModeContext() - SpInitLsaModeContext returned 0xc000006d
```

**0xc000006a = STATUS_WRONG_PASSWORD**

**0xc000006d = STATUS_LOGON_FAILURE**

When the application/user tries the same BAD PASSWORD after the lockout threshold is reached and the account is locked:

```
[0] 021C.0914::08/31/17-23:13:17.1798349 [winnt5] credmgr_cxx473 KerbGetTicketForCredential() - Got a credential && a logon session
[0] 021C.0914::08/31/17-23:13:17.1798373 [winnt5] ctxtapi_cxx574 KerbProcessTargetNames() - Parsed name test1 ((null)) into: name type 0x1, name count 1, realm (null), first part test1
[0] 021C.0914::08/31/17-23:13:17.1798383 [winnt5] ctxtapi_cxx753 KerbProcessTargetNames() - Cracked name test1
[0] 021C.0914::08/31/17-23:13:17.1798406 [winnt5] ctxtapi_cxx754 KerbProcessTargetNames() - into test1
[0] 021C.0914::08/31/17-23:13:17.1798417 [winnt5] logonapi_cxx3933 KerbGetTicketGrantingTicket() - KerbGetTicketGrantingTicket GetTicketRestart ClientRealm contoso
[0] 021C.0914::08/31/17-23:13:17.1798450 [winnt5] logonapi_cxx1720 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket getting authentication ticket for client test1
[0] 021C.0914::08/31/17-23:13:17.1798455 [winnt5] logonapi_cxx1721 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket in realm contoso
[0] 021C.0914::08/31/17-23:13:17.1798483 [winnt5] logonapi_cxx1722 KerbGetAuthenticationTicketEx() - for ServiceName krbtgt/contoso
[0] 021C.0914::08/31/17-23:13:17.1798522 [winnt5] logonapi_cxx1852 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket using supplied credentials contoso\test1
[0] 021C.0914::08/31/17-23:13:17.1798548 [winnt5] logonapi_cxx1853 KerbGetAuthenticationTicketEx() - to ServiceName krbtgt/contoso
[0] 021C.0914::08/31/17-23:13:17.1798620 [winnt5] logonapi_cxx445 KerbFindCommonPaEtype() - KerbFindCommonPaEtype using current password of test1@contoso
[0] 021C.0914::08/31/17-23:13:17.1798681 [winnt5] logonapi_cxx2390 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket sending preauth enctype 0, length 0, PrimaryCredentials->PublicKeyCreds 0000000000000000
[0] 021C.0914::08/31/17-23:13:17.1798805 [winnt5] logonapi_cxx2428 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Calling KDC
[0] 021C.0914::08/31/17-23:13:17.1798813 [winnt5] kerbtick_cxx2656 KerbMakeSocketCall() - KerbMakeSocketCall uses KdcToCall option 0.
[0] 021C.0914::08/31/17-23:13:17.1798874 [winnt5] kerbtick_cxx2884 KerbMakeSocketCall() - Retry #0 Calling kdc 192.168.1.2 for realm contoso, DesiredFlags 0, connection timeout: 0 secs
[0] 021C.0914::08/31/17-23:13:17.1835211 [winnt5] logonapi_cxx2456 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Returned from KDC status 0x0
[0] 021C.0914::08/31/17-23:13:17.1835273 [winnt5] logonapi_cxx2485 KerbGetAuthenticationTicketEx() - Failed to unpack KDC reply as AS: 0x3c
[0] 021C.0914::08/31/17-23:13:17.1835458 [winnt5] logonapi_cxx2549 KerbGetAuthenticationTicketEx() - KerbCallKdc failed: error 0x12, extendedStatus 0xc0000234, d:\w7rtm\ds\security\protocols\kerberos\client2\logonapi.cxx, line 2549
[0] 021C.0914::08/31/17-23:13:17.1835523 [winnt5] kerbtick_cxx519 KerbGetTgtForService() - KerbGetTgtForService failed to refresh primary TGT: 0xc0000234
```

**0x12 = KDC_ERR_CLIENT_REVOKED**  
**0xc0000234 = STATUS_ACCOUNT_LOCKED_OUT**

---

#### LSASS log

Track the processes calling in the questioned session:

```
540.3840> SPM-Trace: Creating session for [af4.0]
540.3840> SPM-Trace: Creating session for [a34.0]
540.3840> SPM-Trace: Creating session for [c40.0]
540.2324> SPM-Trace: Creating session for [5e8.0]
540.2324> SPM-Trace: Creating session for [b50.0]
540.2324> SPM-Trace: Creating session for [618.0]
```

All these session IDs match with the session IDs of processes reported in the security event log of the client machine.

Child processes for Net.exe found before:

```
0xc40: 3136
0x5e8: 1512
0x618: 1560
0xb50: 2896
```

Token request is received by lsass.exe:

```
540.3840> SPM-Trace: NewTokenInfo : 1767f00
540.3840> SPM-Trace: TokenSize : 4d0
540.3840> SPM-Trace: CurrentSid : 17680c0
540.3840> SPM-Helpers: [3c0] LsapDupHandle(a98, c78 (@159eba0)) = 0
540.3840> SPM-(null): Updating logon session 0:3e4 for logon type 5  which states it's batch logon
540.3840> SPM-WAPI: Whacking package Negotiate with 0:3e4 = NETWORK SERVICE
540.3840> SPM-WAPI: Whacking package Kerberos with 0:3e4 = NETWORK SERVICE
540.3840> SPM-WAPI: Whacking package NTLM with 0:3e4 = NETWORK SERVICE
540.3840> SPM-WAPI: Whacking package WDigest with 0:3e4 = NETWORK SERVICE
540.3840> SPM-WAPI: Whacking package TSSSP with 0:3e4 = NETWORK SERVICE
```

It creates two sessions under two different process PIDs:

```
540.3840> SPM-Trace: Creating session for [a34.0]
540.3840> SPM-Trace: Creating session for [c40.0]
```

Kerberos is used for authentication:

```
540.3840> SPM-Neg: NegBuildRequestToken swap Kerberos index 2 with extender index 0
540.3840> SPM-Neg: NegBuildRequestToken getting initial token from preferred package 'Kerberos'
540.3840> SPM-WAPI: [4] WLsaInitContext(00000000003E84A0 : 0000000000000002, 0000000000000000 : 0000000000000000, cifs/ConMem1.Contoso.com)
540.3840> SPM-Verbose: Context Req = 0x00210003
540.3840> SPM-Verbose: Package = Kerberos
```

Logon fails with error "0xc000006d":

```
540.3840> SPM-WAPI: InitResult = c000006d 
540.3840> SPM-Verbose: Flags = 00000000 
540.3840> SPM-WAPI: Init New Context = 0000000000000000 : 0000000000000000 to session 00000000003DA5B0 
540.3840> SPM-Neg: NegBuildRequestToken WLsaInitContext( cifs/ConMem1.Contoso.com, package id 2 ) returned 0xc000006d 
540.3840> SPM-Neg: NegBuildRequestToken failed 0xc000006d getting token from preferred package 2 
540.3840> SPM-Neg: Breakout due to 0xc000006d on domain creds 
540.3840> SPM-Neg: NegBuildRequestToken status code c000006d from Initialize causing us to break out 
540.3840> SPM-Error: NegBuildRequestToken no packages could initialize 
540.3840> SPM-Neg: Deleting context 3e8cc0 
540.3840> SPM-WAPI: InitResult = c000006d 
```
### Conclusion 2
This time as well we isolate the calling process which is doing batch logon with bad credential is "Net.exe".