---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Account Lockouts/Workflow: Account Lockout: Scenario based Troubleshooting - NTLM Auth"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Account%20Lockouts/Workflow%3A%20Account%20Lockout%3A%20Scenario%20based%20Troubleshooting%20-%20NTLM%20Auth"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414157&Instance=414157&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414157&Instance=414157&Feedback=2)

___
<div id='cssfeedback-end'></div>

This article provides a detailed workflow for troubleshooting account lockout issues using the Kerberos authentication protocol. It includes setup details, steps to reproduce the issue, and both proactive and reactive troubleshooting methods. The article also covers specific scenarios using the NTLM protocol.

[[_TOC_]]

# Scenario based troubleshooting

Troubleshooting an account lockout issue with authentication protocol used as "Kerberos."

## Setup

| Role              | Name         | OS                  |
|:-----------------:|:------------:|:-------------------:|
| Domain Controller | VMDC1-Fab    | Windows Server 2019 |
| Domain Controller | VMDC2-Fab    | Windows Server 2019 |
| File Server       | VMSRV2-Fab   | Windows Server 2019 |
| Shared folder     | ALShare, only Authenticated users have full control <br/> IP Address: 10.160.126.38 <br/>![Shared folder setup](/.attachments/image-6bd6540a-8924-4ec6-aa8b-0b6436a93c1c.png) | - |
| Client            | VM1WIN10-Fab | Windows 10 22h2     |
| User              | Fabrikam\User1 | - |
| User              | Fabrikam\User2 | - |

**Account Lockout GPO**  
Configured Group Policy to set Account Lockout Policy and linked it to at domain level "fabrikam.com."

![Account Lockout GPO](/.attachments/image-7e85345f-3b74-448b-93a5-832ec7cdfc97.png)

---

# Reproduce account lockout

To reproduce the account lockout scenario, run the following command on the client machine to access the "ALShare" share folder on file server "VMSRV2-Fab (10.160.126.38)" under "Fabrikam\User1" user context:
```
net use * \\10.160.126.38\ALShare /user:fabrikam\user1 *
```
or 
```
runas /userd:fabrikam\user1 cmd
```

---

## Scenario #2 - Use NTLM protocol

- Log on with a local user/admin account
- Create a batch file with the command to create a mapped drive for share path "\\10.160.126.38\ALShare":
  ```
  net use * \\10.160.126.38\ALShare /user:fabrikam\user1 *
  ```
- Provide user credentials with an incorrect password in the command itself.
![Batch file with incorrect password](/.attachments/image-a831d51b-fcda-4233-ae23-93832ec2da6e.png)

---

# Detailed troubleshooting steps

## Proactive steps
Proactively enable the following logging on respective systems:

**On domain controllers, member servers, and client machines:**

- Enable Netlogon debug logging:
  ```
  Nltest /dbflag:2080ffff
  ```
  or
  ```
  For /f %i in ('dsquery server -o rdn') do nltest /server:%i /dbflag:0x2080ffff
  ```

- Security auditing:
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

---

## Reactive steps

Configure Network trace, AuthScripts, or tssv2 and ProcMon on the client machine to collect logs while reproducing the issue.

### Scenario #2: (NTLM protocol)

#### Start troubleshooting on VMDC1-Fab

Run PowerShell scripts to find the originating domain controller (DC).

The originating DC is "VMDC1-Fab." 
Lockout Time: 30-01-2023, 13:23:13 

#### Check the event logs on the originating DC, here VMDC1-Fab:
Search for Event IDs like **4740**, **4771**, and **4776** for the account **fabrikam\user1**.

![Event log](/.attachments/image-4ef527b5-21bc-433f-ba4e-7c61a8c45d81.png)

Verify that there are no Event ID 4771 (Kerberos authentication) logged for the account, which clearly indicates it is using NTLM (Event ID 4776).

**ID 4776:**
```
Log Name:      Security   
Source:        Microsoft-Windows-Security-Auditing   
Date:          1/30/2023 1:22:50 PM   
Event ID:      4776   
Task Category: Credential Validation   
Level:         Information   
Keywords:      Audit Failure   
User:          N/A   
Computer:      VMDC1-Fab.Fabrikam.com   
Description:   
The computer attempted to validate the credentials for an account.   
Authentication Package: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0   
Logon Account: user1 
Source Workstation: VM1WIN10-Fab  Caller (source) machine from where bad logon request was received.  
Error Code: 0xc000006a  Error: Incorrect username or password
```

**ID 4740:**
```
Log Name:      Security   
Source:        Microsoft-Windows-Security-Auditing   
Date:          1/30/2023 1:23:13 PM 
Event ID:      4740   
Task Category: User Account Management   
Level:         Information   
Keywords:      Audit Success   
User:          N/A   
Computer:      VMDC1-Fab.Fabrikam.com    
Description:   
A user account was locked out.   
Subject:   
Security ID: SYSTEM   
Account Name: VMDC1-Fab$  Account locked on this domain controller    
Account Domain: FABRIKAM  
Logon ID: 0x3e7   
Account That Was Locked Out:   
Security ID: fabrikam\user1  Account locked out    
Account Name: user1   
Additional Information:   
Caller Computer Name: VM1WIN10-Fab  Caller (source) machine from where bad logon request was received.
```

**ID 4776:**
```
Log Name:      Security     
Source:        Microsoft-Windows-Security-Auditing     
Date:          1/30/2023 1:23:37 PM
Event ID:      4776   
Task Category: Credential Validation   
Level:         Information   
Keywords:      Audit Failure   
User:          N/A   
Computer:      VMDC1-Fab.Fabrikam.com   
Description:   
The computer attempted to validate the credentials for an account.   
Authentication Package: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0   
Logon Account: user1  
Source Workstation: VM1WIN10-Fab   
Error Code: 0xc0000234 Error: Account is already locked out
```

#### Check Netlogon debug log on VMDC1-Fab (originating DC)

Search for entries logged for the account fabrikam\user1 at the same timestamp when the account was locked out as per the event ID 4740 (account locked out event).

Received ping from member server VMSRV2-Fab and established the connection successfully:
```
01/30 13:22:26 [MAILSLOT] Received ping from VMSRV2-Fab fabrikam.com. (null) on UDP LDAP   
01/30 13:22:26 [MAILSLOT] FABRIKAM: Ping response 'Sam Logon Response Ex' (null) to \\VMSRV2-Fab Site: Default-First-Site-Name on UDP LDAP   
01/30 13:22:26 [SESSION] FABRIKAM: NetrServerAuthenticate entered: VMSRV2-Fab (10.160.126.38) on account VMSRV2-Fab$ (Negot: 612fffff)   
01/30 13:22:26 [SESSION] FABRIKAM: NetrServerAuthenticate returns Success: VMSRV2-Fab on account VMSRV2-Fab$ (Negot: 612fffff)   
01/30 13:22:26 [SESSION] [Unknown]: NetrLogonGetCapabilities: VMSRV2-Fab1 Entered   
01/30 13:22:26 [SESSION] FABRIKAM: NetrLogonGetCapabilities: VMSRV2-Fab1 Returns 0x0   
01/30 13:22:26 [SESSION] FABRIKAM: NetrLogonGetDomainInfo: VMSRV2-Fab1 Entered   
01/30 13:22:26 [SESSION] FABRIKAM: NetrLogonGetDomainInfo: VMSRV2-Fab is running NT 10.0 build 17763 (3)   
01/30 13:22:26 [DNS] NlSetClientAttributes: LsaISetClientDnsHostName(), status 0x0   
01/30 13:22:26 [MISC] FABRIKAM: NetrLogonGetDomainInfo: DnsHostName of VMSRV2-Fab is VMSRV2-Fab.fabrikam.com   
01/30 13:22:26 [SESSION] FABRIKAM: NetrLogonGetDomainInfo: VMSRV2-Fab 1 Returns 0x0
```

This is followed by logon request for account fabrikam\user1 from the client VM1WIN10-Fab received via member server VMSRV2-Fab and it fails with "0xC000006A" stating bad credentials provided.

We see 3 failed attempts (account lockout threshold reached):
```
01/30 13:22:26 [LOGON] [6116] FABRIKAM: SamLogon: Transitive Network logon of fabrikam\user1 from VM1WIN10-Fab (via VMSRV2-Fab) Entered  
01/30 13:22:26 [SESSION] [6116] QueryContextAttributes: 0.52: 3 returns 0x0  
01/30 13:22:26 [LOGON] [6116] Calling LsaIFilterInboundNamespace for TrustName:'(null)' Flags:0x0 MsvAvNbDomainName:'FABRIKAM' MsvAvDnsDomainName:'fabrikam.com'  
01/30 13:22:26 [LOGON] [6116] LsaIFilterInboundNamespace succeeded - FilterInboundNamespaceSucceeded  
01/30 13:22:26 [LOGON] [6116] FABRIKAM: SamLogon: Transitive Network logon of fabrikam\user1 from VM1WIN10-Fab (via VMSRV2-Fab) Returns 0xC000006A
01/30 13:22:50 [LOGON] [6116] FABRIKAM: SamLogon: Transitive Network logon of fabrikam\user1 from VM1WIN10-Fab (via VMSRV2-Fab) Entered   
01/30 13:22:50 [LOGON] [6116] FABRIKAM: SamLogon: Transitive Network logon of fabrikam\user1 from VM1WIN10-Fab (via VMSRV2-Fab) Returns 0xC000006A    
01/30 13:23:13 [LOGON] [6116] FABRIKAM: SamLogon: Transitive Network logon of fabrikam\user1 from VM1WIN10-Fab (via VMSRV2-Fab) Entered  
01/30 13:23:13 [LOGON] [6116] FABRIKAM: SamLogon: Transitive Network logon of fabrikam\user1 from VM1WIN10-Fab (via VMSRV2-Fab) Returns 0xC000006A
```

**0xc000006a = STATUS_WRONG_PASSWORD**

DC locks the account in Active Directory.  
Logon attempt post reaching the lockout threshold fails with "0xC0000234" stating account is already locked:
```
01/30 13:22:50 [LOGON] [6116] FABRIKAM: SamLogon: Transitive Network logon of fabrikam\user1 from VM1WIN10-Fab (via VMSRV2-Fab) Entered
01/30 13:23:37 [LOGON] CONTOSO: SamLogon: Transitive Network logon of contoso\test1 from CONCL3 (via CONMEM1) Returns 0xC0000234
```

**0xc0000234 = STATUS_ACCOUNT_LOCKED_OUT**

---

#### Check Netlogon debug log on VMSRV2-Fab

This will reveal the same results with the Netlogon debug log analysis on the DC, so it can be skipped.

**Successfully establish connection with DC "VMDC1-Fab":**
```
08/30 13:22:24 [PERF] NlAllocateClientSession: New Perf Instance (00000000003FCAC8): "\\VMDC1-Fab.Fabrikam.com"  ClientSession: 0000000001ED22C0   
08/30 13:22:24 [SESSION] Fabrikam: NlDiscoverDc: Found DC \\VMDC1-Fab.Fabrikam.com   
08/30 13:22:24 [SESSION] Fabrikam: NlSessionSetup: Negotiated flags with server are 0x612fffff   
08/30 13:22:24 [SESSION] Fabrikam: NlSetStatusClientSession: Set connection status to 0   
08/30 13:22:24 [DOMAIN] Setting LSA NetbiosDomain: Fabrikam DnsDomain: Fabrikam.com. DnsTree: Fabrikam.com. DomainGuid:7b5bxxx
08/30 13:22:24 [LOGON] NlSetForestTrustList: New trusted domain list:   
08/30 13:22:24 [LOGON] 0: Fabrikam Fabrikam.com (NT 5) (Forest Tree Root) (Primary Domain) (Native)   
08/30 13:22:24 [LOGON] Dom Guid: 7b5bxxxx  
08/30 13:22:24 [LOGON] Dom Sid: S-1-5-21-3xxxx   
08/30 13:22:24 [SESSION] Fabrikam: NlSetStatusClientSession: Set connection status to 0   
08/30 13:22:24 [SESSION] Fabrikam: NlSessionSetup: Session setup Succeeded
```

Logon attempt received from VM1WIN10-Fab for the account Fabrikam\user1 fails with 0xC000006A, and it consecutively fails 3 times:
```
08/30 13:22:24 [CRITICAL] NlPrintRpcDebug: Couldn't get EEInfo for I_NetLogonSamLogonEx: 1761 (may be legitimate for 0xc000006a)   
08/30 13:22:24 [LOGON] SamLogon: Network logon of Fabrikam\user1 from VM1WIN10-Fab Returns 0xC000006A
08/30 13:22:48 [LOGON] SamLogon: Network logon of Fabrikam\user1 from VM1WIN10-Fab Entered   
08/30 13:22:48 [CRITICAL] NlPrintRpcDebug: Couldn't get EEInfo for I_NetLogonSamLogonEx: 1761 (may be legitimate for 0xc000006a)   
08/30 13:22:48 [LOGON] SamLogon: Network logon of Fabrikam\user1 from VM1WIN10-Fab Returns 0xC000006A
08/30 13:23:12 [LOGON] SamLogon: Network logon of Fabrikam\user1 from VM1WIN10-Fab Entered   
08/30 13:23:12 [CRITICAL] NlPrintRpcDebug: Couldn't get EEInfo for I_NetLogonSamLogonEx: 1761 (may be legitimate for 0xc000006a)   
08/30 13:23:12 [LOGON] SamLogon: Network logon of Fabrikam\user1 from VM1WIN10-Fab Returns 0xC000006A
```

**1761 = RPC_S_ENTRY_NOT_FOUND**

**0xc000006a = STATUS_WRONG_PASSWORD**

Eventually, the account is locked in Active Directory. On the 4th attempt, it fails with error code 0xC0000234 indicating that the account is already locked:
```
08/30 13:23:36 [LOGON] SamLogon: Network logon of Fabrikam\user1 from VM1WIN10-Fab Entered   
08/30 13:23:36 [CRITICAL] NlPrintRpcDebug: Couldn't get EEInfo for I_NetLogonSamLogonEx: 1761 (may be legitimate for 0xc0000234)   
08/30 13:23:36 [LOGON] SamLogon: Network logon of Fabrikam\user1 from VM1WIN10-Fab Returns 0xC0000234
```

Later, the member server disconnects the session connection with DC:
```
08/30 13:26:09 [SESSION] Fabrikam: NlTimeoutApiClientSession: Unbind from server \\VMDC1-Fab.Fabrikam.com (TCP) 0.
```

---

#### Check the event logs on the client VM1WIN10-Fab - Caller (source) machine

Enable security auditing and collect data via Auth scripts and Procmon at the time of lockout.  
You may need to unlock the account to have it get locked again in order to reproduce the issue and collect the desired data.

Filter with timestamp on the events logs. Usually, a filter 1 minute before and after the timestamp of the account lockout would help.

You may try LogParser to filter out necessary events. For example:
```
LogParser.exe -i:evt "select timegenerated,eventid,strings from *.evtx where eventid=4625 or eventid=5461 or eventid=4740 or eventid=4768 or eventid=4772 or eventid=4771 or eventid=4648 or eventid=4776" -q:ON > events.txt
```

You may not be able to capture logon Event ID **4625** for such a scenario.

You can find Event ID **4648** which states, "This event is generated when a process attempts to log on an account by explicitly specifying that accounts credentials. This most commonly occurs in batch-type configurations such as scheduled tasks, or when using the RUNAS command."

Logon attempt was done for batch-type logon under the local admin account:

**ID 4648**
```
Log Name:      Security   
Source:        Microsoft-Windows-Security-Auditing   
Date:          1/30/2023 1:22:26 PM
Event ID:      4648   
Task Category: Logon   
Level:         Information   
Keywords:      Audit Success   
User:          N/A   
Computer:      VM1WIN10-Fab.Fabrikam.com 
Description:   
A logon was attempted using explicit credentials. 
Subject:   
Security ID:          S-1-5-21-2305911492-282772631-746711388-1001   
Account Name:         admin
Account Domain:       VM1WIN10-Fab   
Logon ID:             0x3f0a2f   
Logon GUID:           {00000000-0000-0000-0000-000000000000}   
Account Whose Credentials Were Used:   
Account Name:         user1
Account Domain:       fabrikam
Logon GUID:           {00000000-0000-0000-0000-000000000000} 
Target Server:   
Target Server Name:   VMSRV2-Fab.fabrikam.com   
Additional Information: VMSRV2-Fab.fabrikam.com  
Process Information:   
Process ID:           0x4   
Process Name:           
Network Information:   
Network Address:      -   
Port:                 -   
This event is generated when a process attempts to log on an account by explicitly specifying that accounts credentials. This most commonly occurs in batch-type configurations such as scheduled tasks, or when using the RUNAS command.
```

Search for the process which was initiated before this logon stamp and at the time stamp of lockout - single occurrence of **WmiPrvSE**:

**ID 4688**
```
Log Name:      Security   
Source:        Microsoft-Windows-Security-Auditing   
Date:          1/30/2023 1:22:26 PM  
Event ID:      4688   
Task Category: Process Creation   
Level:         Information   
Keywords:      Audit Success   
User:          N/A   
Computer:      VM1WIN10-Fab.Fabrikam.com   
Description:   
A new process has been created.   
Subject:   
Security ID:          S-1-5-18   
Account Name:         VM1WIN10-Fab$   
Account Domain:       FABRIKAM   
Logon ID:             0x3e7   
Process Information:   
New Process ID:       0x328   
New Process Name:     C:\Windows\System32\wbem\WmiPrvSE.exe
Token Elevation Type: TokenElevationTypeDefault (1)   
Creator Process ID:   0x298  SVCHOST.exe, as per the task list (svchost.exe: 664 DcomLaunch, PlugPlay, Power)
```

Token Elevation Type indicates the type of token that was assigned to the new process in accordance with User Account Control policy.

- **Type 1** is a full token with no privileges removed or groups disabled. A full token is only used if User Account Control is disabled or if the user is the built-in Administrator account or a service account.
- **Type 2** is an elevated token with no privileges removed or groups disabled. An elevated token is used when User Account Control is enabled and the user chooses to start the program using Run as administrator. An elevated token is also used when an application is configured to always require administrative privilege or to always require maximum privilege, and the user is a member of the Administrators group.
- **Type 3** is a limited token with administrative privileges removed and administrative groups disabled. The limited token is used when User Account Control is enabled, the application does not require administrative privilege, and the user does not choose to start the program using Run as administrator.

Before every logon attempt, process creation event for **net.exe** is logged under the same parent process, under the **Admin** local account which is the Subject account (under which batch logon was done by the locked-out account) mentioned in every logon event:

---

**Attempt #1**

_Process Creation_  
**ID 4688**
```
Log Name:      Security   
Source:        Microsoft-Windows-Security-Auditing   
Date:          1/30/2023 1:22:26 PM
Event ID:      4688   
Task Category: Process Creation   
Level:         Information   
Keywords:      Audit Success   
User:          N/A   
Computer:      VM1WIN10-Fab.Fabrikam.com   
Description:   
A new process has been created.   
Subject:   
Security ID:          S-1-5-21-2305911492-282772631-746711388-1001   
Account Name:         admin
Account Domain:       VM1WIN10-Fab  
Logon ID:             0x3f0a2f   
Process Information:   
New Process ID:       0xbf8
New Process Name:     C:\Windows\System32\net.exe
Token Elevation Type: TokenElevationTypeLimited (3)   
Creator Process ID:   0x200
```

_Logon attempt_  
**ID 4648**
```
Log Name:      Security   
Source:        Microsoft-Windows-Security-Auditing   
Date:          1/30/2023 1:22:26 PM  
Event ID:      4648
Task Category: Logon
Level:         Information   
Keywords:      Audit Success   
User:          N/A   
Computer:      VM1WIN10-Fab.Fabrikam.com 
Description:   
A logon was attempted using explicit credentials.   
Subject:   
Security ID:          S-1-5-21-2305911492-282772631-746711388-1001   
Account Name:         admin   
Account Domain:       VM1WIN10-Fab   
Logon ID:             0x3f0a2f   
Logon GUID:           {00000000-0000-0000-0000-000000000000}   
Account Whose Credentials Were Used:   
Account Name:         user1
Account Domain:       fabrikam   
Logon GUID:           {00000000-0000-0000-0000-000000000000}   
Target Server:   
Target Server Name:   VMSRV2-Fab.fabrikam.com
Additional Information: VMSRV2-Fab.fabrikam.com  
Process Information:   
Process ID:           0x4   
Process Name:           
Network Information:   
Network Address:      -   
Port:                 -   
This event is generated when a process attempts to log on an account by explicitly specifying that accounts credentials. This most commonly occurs in batch-type configurations such as scheduled tasks, or when using the RUNAS command.
```

---

**Attempt #2**

_Process Creation_  
**ID 4688**
```
Log Name:      Security   
Source:        Microsoft-Windows-Security-Auditing   
Date:          1/30/2023 1:22:49 PM
Event ID:      4688   
Task Category: Process Creation   
Level:         Information   
Keywords:      Audit Success   
User:          N/A   
Computer:      VMSRV2-Fab.fabrikam.com  
Description:   
A new process has been created.   
Subject:   
Security ID:          S-1-5-21-2305911492-282772631-746711388-1001   
Account Name:         admin   
Account Domain:       VMSRV2-Fab   
Logon ID:             0x3f0a2f   
Process Information:   
New Process ID:       0xbd0  As per tasklist this is (Net.exe: 3024)   
New Process Name:     C:\Windows\System32\net.exe
Token Elevation Type: TokenElevationTypeLimited (3)   
Creator Process ID:   0x200  As per tasklist this is (cmd.exe: 512)
```

_Logon attempt_  
**ID 4648**
```
Log Name:      Security   
Source:        Microsoft-Windows-Security-Auditing   
Date:          1/30/2023 1:22:49 PM  
Event ID:      4648
Task Category: Logon
Level:         Information   
Keywords:      Audit Success   
User:          N/A   
Computer:      VM1WIN10-Fab.Fabrikam.com 
Description:   
A logon was attempted using explicit credentials.   
Subject:   
Security ID:          S-1-5-21-2305911492-282772631-746711388-1001   
Account Name:         admin   
Account Domain:       VM1WIN10-Fab   
Logon ID:             0x3f0a2f   
Logon GUID:           {00000000-0000-0000-0000-000000000000}   
Account Whose Credentials Were Used:   
Account Name:         user1
Account Domain:       fabrikam   
Logon GUID:           {00000000-0000-0000-0000-000000000000}   
Target Server:   
Target Server Name:   VMSRV2-Fab.fabrikam.com
Additional Information: VMSRV2-Fab.fabrikam.com  
Process Information:   
Process ID:           0x4   
Process Name:           
Network Information:   
Network Address:      -   
Port:                 -   
This event is generated when a process attempts to log on an account by explicitly specifying that accounts credentials. This most commonly occurs in batch-type configurations such as scheduled tasks, or when using the RUNAS command.
```

---

**Attempt #3**

_Process Creation_  
**ID 4688**
```
Log Name:      Security   
Source:        Microsoft-Windows-Security-Auditing   
Date:          1/30/2023 1:23:13 PM
Event ID:      4688   
Task Category: Process Creation   
Level:         Information   
Keywords:      Audit Success   
User:          N/A   
Computer:      VMSRV2-Fab.fabrikam.com  
Description:   
A new process has been created.   
Subject:   
Security ID:          S-1-5-21-2305911492-282772631-746711388-1001   
Account Name:         admin   
Account Domain:       VMSRV2-Fab   
Logon ID:             0x3f0a2f   
Process Information:   
New Process ID:       0xf74 
New Process Name:     C:\Windows\System32\net.exe  
Token Elevation Type: TokenElevationTypeLimited (3)   
Creator Process ID:   0x200  Same as above, as per tasklist this is (cmd.exe: 512)
```

_Logon attempt_  
**ID 4648**
```
Log Name:      Security   
Source:        Microsoft-Windows-Security-Auditing   
Date:          1/30/2023 1:23:13 PM
Event ID:      4648  
Task Category: Logon 
Level:         Information   
Keywords:      Audit Success   
User:          N/A   
Computer:      VM1WIN10-Fab.Fabrikam.com 
Description:   
A logon was attempted using explicit credentials.   
Subject:   
Security ID:          S-1-5-21-2305911492-282772631-746711388-1001   
Account Name:         admin   
Account Domain:       VM1WIN10-Fab   
Logon ID:             0x3f0a2f   
Logon GUID:           {00000000-0000-0000-0000-000000000000}   
Account Whose Credentials Were Used:   
Account Name:         user1
Account Domain:       fabrikam   
Logon GUID:           {00000000-0000-0000-0000-000000000000}   
Target Server:   
Target Server Name:   VMSRV2-Fab.fabrikam.com
Additional Information: VMSRV2-Fab.fabrikam.com  
Process Information:   
Process ID:           0x4   
Process Name:           
Network Information:   
Network Address:      -   
Port:                 -   
This event is generated when a process attempts to log on an account by explicitly specifying that accounts credentials. This most commonly occurs in batch-type configurations such as scheduled tasks, or when using the RUNAS command.
```

---

**Attempt #4**

Even before the account already locked attempt (4th attempt) see the same process being initiated.

_Process Creation_  
**ID 4688**
```
Log Name:      Security   
Source:        Microsoft-Windows-Security-Auditing   
Date:          1/30/2023 1:23:37 PM  
Event ID:      4688   
Task Category: Process Creation   
Level:         Information   
Keywords:      Audit Success   
User:          N/A   
Computer:      VMSRV2-Fab.fabrikam.com  
Description:   
A new process has been created.   
Subject:   
Security ID:          S-1-5-21-2305911492-282772631-746711388-1001   
Account Name:         admin   
Account Domain:       VMSRV2-Fab   
Logon ID:             0x3f0a2f   
Process Information:   
New Process ID:       0xf74
New Process Name:     C:\Windows\System32\net.exe
Token Elevation Type: TokenElevationTypeLimited (3)   
Creator Process ID:   0x200  Same as above, as per tasklist this is (cmd.exe: 512)
```

_Logon attempt_  
**ID 4648**
```
Log Name:      Security   
Source:        Microsoft-Windows-Security-Auditing   
Date:          1/30/2023 1:23:37 PM  
Event ID:      4648
Task Category: Logon
Level:         Information   
Keywords:      Audit Success   
User:          N/A   
Computer:      VM1WIN10-Fab.Fabrikam.com 
Description:   
A logon was attempted using explicit credentials.   
Subject:   
Security ID:          S-1-5-21-2305911492-282772631-746711388-1001   
Account Name:         admin   
Account Domain:       VM1WIN10-Fab   
Logon ID:             0x3f0a2f   
Logon GUID:           {00000000-0000-0000-0000-000000000000}   
Account Whose Credentials Were Used:   
Account Name:         user1
Account Domain:       fabrikam   
Logon GUID:           {00000000-0000-0000-0000-000000000000}   
Target Server:   
Target Server Name:   VMSRV2-Fab.fabrikam.com
Additional Information: VMSRV2-Fab.fabrikam.com  
Process Information:   
Process ID:           0x4   
Process Name:           
Network Information:   
Network Address:      -   
Port:                 -   
This event is generated when a process attempts to log on an account by explicitly specifying that accounts credentials. This most commonly occurs in batch-type configurations such as scheduled tasks, or when using the RUNAS command.
```
**Task List output: (should be collected while bad password is being used and the account is locked out)**

| Value from logs | corresponding name from tasklist |
|--|--|
| 0x328(808)	 | WmiPrvSE.exe 808 N/A |
| 0x200 (512)	 | cmd.exe 512 N/A |
| 0xbd0 (3024)	 | net.exe 3024 N/A |

You may not find all process IDs as those were terminated before collecting task list output.  
However, if you have auth scripts collected or collect it manually, you can find the following PIDs for **Net.exe** created under **cmd.exe**:

0xbf8: 3064  
0xe48: 3956  
0xe2c: 3628  

It can either be of the processes which are causing the lockout.  
For more detailed info, you need to check ProcMon for these two processes:

| Value from logs | Corresponding name from tasklist |
|:-----------------:|:-------------------------------:|
| 0x200 (512)       | cmd.exe 512 N/A                 |
| 0x328 (808)       | WmiPrvSE.exe 808 N/A            |

---

#### Analyze the ProcMon data

Filter by parent process name **WmiPrvSE** or **PID 0x328 (808)**

![ProcMon filter by WmiPrvSE](/.attachments/image-439d8af3-8b59-4cb4-9a9c-74e8f2b3e2a6.png)

Filter by parent process name **CMD** or **PID 0x200 (512)**, you can find a batch file running C:\temp\alshare.bat calling C:\Temp\net.* process.

![Batch file running](/.attachments/image-74e29b6e-5ff3-46db-af2e-53c4d9f45c86.png)

![CMD process](/.attachments/image-2a9e7157-4812-4a5d-b958-7077d7105d53.png)

Look for the process tree to verify the process Net.exe as per Event logs - running within the context of the user, here in that example fabrikam\user1.  
Command can also be seen here as: `net use * \\10.160.126.38\ALShare /user:fabrikam\user1 *`

![Process tree](/.attachments/image-425e9759-8494-4142-81c3-5be528cbe9d5.png)


![Process tree example](/.attachments/image-a432afa8-ed44-48ab-b96b-88411a647c0e.png)

Example from another set of data:

![Another data set example](/.attachments/image-c203e0fd-4aec-48eb-900a-29d81f1412cc.png)

---

#### Conclusion 1

The source of the lockout is the "Net.exe" command run under the cmd.exe process on the client machine called VM1WIN10-Fab.

---

#### NTLM.etl
You may try the same troubleshooting with auth scripts. This time focusing on NTLM.etl.

**NTLM ETL LOG**

Find the logon request timestamp for user fabrikam\user1 that matches with the lockout event.

Where,

Hex "021C.0F00" is DEC "540.3840"
```
510 [1] 021C.0644::08/30/23-13:23:13.7214709 [msv1_0]  () - SspGetTokenBuffer: No token passed in  
511 [1] 021C.0644::08/30/23-13:23:13.7214724 [msv1_0]  () - Entering SsprHandleChallengeMessage  
512 [1] 021C.0644::08/30/23-13:23:13.7214742 [msv1_0]  () - ContextReqFlags: 0x210103  
513 [1] 021C.0644::08/30/23-13:23:13.7214756 [msv1_0]  () - Entering SspContextReferenceContext  
514 [1] 021C.0644::08/30/23-13:23:13.7214789 [msv1_0]  () - SsprHandleChallengeMessage: Server support NTLM2 caused LM_KEY to be disabled.  
515 [1] 021C.0644::08/30/23-13:23:13.7214806 [msv1_0]  () - SsprHandleChallengeMessage: ServerVersion 0xf0000004563000a, Major 10, Minor 0, Build 17763, Revision 15  
516 [1] 021C.0644::08/30/23-13:23:13.7214860 [msv1_0]  () - SsprHandleChallengeMessage adding client token restrictions length 48, type 0  
517 [1] 021C.0644::08/30/23-13:23:13.7215095 [msv1_0]  () - Entering SspRevealPassword  
518 [1] 021C.0644::08/30/23-13:23:13.7215142 [msv1_0]  () - Leaving SspRevealPassword  
519 [1] 021C.0644::08/30/23-13:23:13.7215470 [msv1_0]  () - NtlmCredIsoInProc::ProtectCredential:51 - NtlmSuccess  
520 [1] 021C.0644::08/30/23-13:23:13.7215483 [msv1_0]  () - NtlmCredIsoInProc::CompareCredentials:320 - NtlmSuccess  
521 [1] 021C.0644::08/30/23-13:23:13.7215500 [msv1_0]  () - MspLm20GetChallengeResponse: LogonId 0:0xba0754, ParameterControl 0x70, fabrikam\user1; Credential (null)\(null); (null)\(null)  
522 [1] 021C.0644::08/30/23-13:23:13.7215545 [msv1_0]  () - NtlmCredIsoInProc::CompareCredentials:320 - NtlmSuccess  
523 [1] 021C.0644::08/30/23-13:23:13.7215555 [msv1_0]  () - NtlmCredIsoInProc::IsGMSACred:270 - NtlmSuccess  
524 [1] 021C.0644::08/30/23-13:23:13.7215626 [NtlmShared]  () - MsvpAvlGetTimestamp:312 - NtlmSuccess  
525 [1] 021C.0644::08/30/23-13:23:13.7215664 [NtlmShared]  () - MsvpNtlm3Response - Domain: fabrikam, User: user1  
526 [1] 021C.0644::08/30/23-13:23:13.7215837 [NtlmShared]  () - MsvpLm20GetNtlm3ChallengeResponse:467 - NtlmSuccess  
527 [1] 021C.0644::08/30/23-13:23:13.7215848 [msv1_0]  () - NtlmCredIsoInProc::Lm20GetNtlm3ChallengeResponse:129 - NtlmSuccess  
528 [1] 021C.0644::08/30/23-13:23:13.7215918 [msv1_0]  () - inserting the challenge HEX
```

Find same logon id was used under thread 021C.0DBC.

Where,

Hex "021C.0DBC" is DEC "540.3516"
```
510 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7214709 [msv1_0]  () - SspGetTokenBuffer: No token passed in  
511 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7214724 [msv1_0]  () - Entering SsprHandleChallengeMessage  
512 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7214742 [msv1_0]  () - ContextReqFlags: 0x210103  
513 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7214756 [msv1_0]  () - Entering SspContextReferenceContext  
514 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7214789 [msv1_0]  () - SsprHandleChallengeMessage: Server support NTLM2 caused LM_KEY to be disabled. 
515 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7214806 [msv1_0]  () - SsprHandleChallengeMessage: ServerVersion 0xf0000004563000a, Major 10, Minor 0, Build 17763, Revision 15  
516 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7214860 [msv1_0]  () - SsprHandleChallengeMessage adding client token restrictions length 48, type 0  
517 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7215095 [msv1_0]  () - Entering SspRevealPassword  
518 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7215142 [msv1_0]  () - Leaving SspRevealPassword  
519 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7215470 [msv1_0]  () - NtlmCredIsoInProc::ProtectCredential:51 - NtlmSuccess  
520 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7215483 [msv1_0]  () - NlpPutOwfsInPrimaryCredential:1495 - NtlmSuccess  
521 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7215500 [msv1_0]  () - MspLm20GetChallengeResponse: LogonId 0:0x3f0a2f, ParameterControl 0x70, fabrikam\user1; Credential (null)\(null); (null)\(null)  
522 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7215545 [msv1_0]  () - NtlmCredIsoInProc::CompareCredentials:320 - NtlmSuccess  
523 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7215555 [msv1_0]  () - NtlmCredIsoInProc::IsGMSACred:270 - NtlmSuccess 
524 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7215626 [NtlmShared]  () - MsvpAvlGetTimestamp:312 - NtlmSuccess  
525 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7215664 [NtlmShared]  () - MsvpNtlm3Response - Domain: fabrikam, User: user1  
526 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7215837 [NtlmShared]  () - MsvpLm20GetNtlm3ChallengeResponse:467 - NtlmSuccess  
527 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7215848 [msv1_0]  () - NtlmCredIsoInProc::Lm20GetNtlm3ChallengeResponse:129 - NtlmSuccess  
528 [1] 021C.0DBC::08/30/23-13:22:49.9961004.7215918 [msv1_0]  () - inserting the challenge HEX
```

So we need to look for the thread id "644" in lsass log file (lsa.etl):

**LSASS LOG:**

Track the processes calling in the questioned session.
```
540.1604> SPM-Trace: Creating session for [650.0]   
where, 650: 1616   
540.3516> SPM-Trace: Creating session for [328.0]  
where, 328: 808     
540.3516> SPM-Trace: Creating session for [bf8.0]   
where, bf8: 3064     
540.3516> SPM-Trace: Creating session for [bd0.0]   
where, bd0: 3024   
540.1604> SPM-Trace: Creating session for [f74.0]   
where, f74: 3956   
540.1604> SPM-Trace: Creating session for [e2c.0]   
where, e2c: 3628
```

All these session IDs match with the session IDs of processes reported in the security event log of the client machine, except **650: 1616**.
No entry can be found for **650: 1616** in the task list output.

 in details:

Receives token with logon type 5:
```
540.3516> SPM-Trace: NewTokenInfo : 1767f00    
540.3516> SPM-Trace: TokenSize : 4d0   
540.3516> SPM-Trace: CurrentSid : 17680c0   
540.3516> SPM-Helpers: [3c0] LsapDupHandle(aa4, 1080 (@146eb50)) = 0   
540.3516> SPM-(null): Updating logon session 0:3e4 for logon type 5  which states it's batch logon
```

Negotiation happens and the end package is NTLM.
```
540.3516> SPM-WAPI: Whacking package Negotiate with 0:3e4 = NETWORK SERVICE   
540.3516> SPM-WAPI: Whacking package Kerberos with 0:3e4 = NETWORK SERVICE   
540.3516> SPM-WAPI: Whacking package NTLM with 0:3e4 = NETWORK SERVICE   
540.3516> SPM-WAPI: Whacking package WDigest with 0:3e4 = NETWORK SERVICE   
540.3516> SPM-WAPI: Whacking package TSSSP with 0:3e4 = NETWORK SERVICE   
540.1604> SPM-WAPI: [4] WLsaInitContext(00000000016D1F60 : 0000000000000003, 000000000169A1B0 : 0000000000000003, )   
540.1604> SPM-Verbose: Context Req = 0x00000100   
540.1604> SPM-Verbose: Package = NTLM
```

Session started by process id "BD0", which is "3024", same as reported in the event log of **Attempt #1**.  
It's for (net.exe: 3024 N/A), as per the tasklist collected while bad logon attempts were being made.
```
540.3516> SPM-Trace: Creating session for [bd0.0]   
540.3516> SPM-WAPI: [4] WLsaInitContext(00000000016D1F60 : 0000000000000003, 0000000000000000 : 0000000000000000, )   
540.3516> SPM-Verbose: Context Req = 0x00000100   
540.3516> SPM-Verbose: Package = NTLM
```

It requests for a ticket for SPN "cifs/192.168.1.21", with NTLM package and fails:

```
540.3516> SPM-WAPI: Init New Context = 0000000000000000 : 0000000000000000 to session 00000000003DA5B0
540.3516> SPM-Neg: NegBuildRequestToken WLsaInitContext( cifs/10.160.126.38, package id 1 ) returned 0x8009030e
540.3516> SPM-Neg: NegBuildRequestToken failed 0x8009030e getting token from preferred package 1
540.3516> SPM-Neg: NegBuildRequestToken getting initial token from preferred package 'NTLM'
540.3516> SPM-WAPI: [4] WLsaInitContext(00000000016D21D0 : 0000000000000003, 0000000000000000 : 0000000000000000, cifs/10.160.126.38)
540.3516> SPM-Verbose: Context Req = 0x00210003
540.3516> SPM-Verbose: Package = NTLM
540.3516> SPM-WAPI: InitResult = 90312
```
 0x8009030e(-2146893042): SEC_E_NO_CREDENTIALS No credentials are available in the security package

---

#### Conclusion 2

The source of the lockout is the "Net.exe" command run under the cmd.exe process on the client machine called VM1WIN10-Fab.