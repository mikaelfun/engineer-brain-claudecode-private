---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Single Hop No Kerberos Delegation/Kerberos: Single Hop: Further new KLIST features"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FKerberos%2FKerberos%3A%20Protocol%20Flow%2FKerberos%3A%20Example%20Reference%2FKerberos%3A%20Single%20Hop%20No%20Kerberos%20Delegation%2FKerberos%3A%20Single%20Hop%3A%20Further%20new%20KLIST%20features"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1082014&Instance=1082014&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1082014&Instance=1082014&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides an overview of the `klist` command-line utility used for managing Kerberos tickets in Windows. It includes details on security context considerations, various flags such as bind, purge, and get, and their respective outputs and uses.

[[_TOC_]]

# Background

Klist is a Windows command-line utility used to manage Kerberos tickets. With Klist, you can list all current tickets, purge tickets that are no longer needed, renew tickets that are about to expire, and perform bind modifications to currently bound Key Distribution Centers (KDCs). Klist also allows you to view the properties of your tickets, such as the ticket's expiration time, the server that issued the ticket, and the user's name and domain.

# Security context considerations

The `klist` command line can be utilized in many different ways. The key factor for using it properly is remembering the following:

1. When running the command without any additional flags, only the current session of the security context that initiated the command line prompt is queried or modified.
1. There are different tickets cached for elevated and non-elevated sessions.

In some scenarios, you need to elevate a command line prompt with a different user to view or modify their tickets and/or bound Domain Controller (DC), with the most common one being the 'SYSTEM' account. This action can be done easily with `PSEXEC` by running the following:

```plaintext
psexec.exe -s cmd
```

In addition, all flags (with the exception of bind flags) can be executed in an elevated command prompt while supplying a LogonID for a different security context.

To identify LogonIDs, run the following:

```plaintext
C:\Windows\system32>klist sessions

Current LogonId is 0:0x24ba75
[0] Session 2 0:0x24bae6 FABRIKAM\Danny Negotiate:RemoteInteractive
[1] Session 2 0:0x24ba75 FABRIKAM\Danny Kerberos:RemoteInteractive
[2] Session 2 0:0x23f451 Window Manager\DWM-2 Negotiate:Interactive
[3] Session 2 0:0x23f406 Window Manager\DWM-2 Negotiate:Interactive
[4] Session 2 0:0x23e77f Font Driver Host\UMFD-2 Negotiate:Interactive
[5] Session 0 0:0x3e5 NT AUTHORITY\LOCAL SERVICE Negotiate:Service
[6] Session 1 0:0xb84b Window Manager\DWM-1 Negotiate:Interactive
[7] Session 1 0:0xb784 Window Manager\DWM-1 Negotiate:Interactive
[8] Session 0 0:0x3e4 FABRIKAM\WIN10B$ Negotiate:Service
[9] Session 0 0:0x6724 Font Driver Host\UMFD-0 Negotiate:Interactive
[10] Session 1 0:0x66a4 Font Driver Host\UMFD-1 Negotiate:Interactive
[11] Session 0 0:0x61a8 \ NTLM:(0)
[12] Session 0 0:0x3e7 FABRIKAM\WIN10B$ Negotiate:(0)
```

The built-in accounts will always have the same LogonIDs:

```plaintext
klist.exe -li 0x3e7 <flag> //Local System
klist.exe -li 0x3e4 <flag> // Network service
klist.exe -li 0x3e5 <flag> //Local service
```

# Bind flags

Starting with Windows 10, new flags were introduced to `klist`, including the ability to bind your client to a specific DC. This action simplifies data collection and allows us to streamline the action plans given to customers with the following flags:

- `klist query_bind`
- `klist purge_bind`
- `klist add_bind`

The output below details the outcome of these flags:

```plaintext
klist query_bind

Current LogonId is 0:0x24ba75
The kerberos KDC binding cache has been queried successfully.

KDC binding cache entries: (2)

#0>     RealmName: fabrikam.com
        KDC Address: dc3
        KDC Name: (null)
        Flags: 0x2c1000 -> DS_6_REQUIRED DS_8_REQUIRED WRITABLE_REQUIRED NEXTCLOSEST_SITE
        DC Flags: 0xe003f1fc -> GC LDAP DS KDC TIMESERV CLOSEST_SITE WRITABLE FULL_SECRET WS DS_8 PING DNS_DC DNS_DOMAIN DNS_FOREST
        Cache Flags: 0

#1>     RealmName: fabrikam.com
        KDC Address: dc3
        KDC Name: (null)
        Flags: 0
        DC Flags: 0
        Cache Flags: 0

klist purge_bind

Current LogonId is 0:0x24ba75
The kerberos KDC binding cache has been purged successfully.

klist add_bind fabrikam.com dc3

Current LogonId is 0:0x24ba75
Domain fabrikam.com is now bound to KDC dc3.
The kerberos KDC binding cache has been queried successfully.

KDC binding cache entries: (2)

#0>     RealmName: fabrikam.com
        KDC Address: dc3
        KDC Name: (null)
        Flags: 0x2c1000 -> DS_6_REQUIRED DS_8_REQUIRED WRITABLE_REQUIRED NEXTCLOSEST_SITE
        DC Flags: 0xe003f1fc -> GC LDAP DS KDC TIMESERV CLOSEST_SITE WRITABLE FULL_SECRET WS DS_8 PING DNS_DC DNS_DOMAIN DNS_FOREST
        Cache Flags: 0

#1>     RealmName: fabrikam.com
        KDC Address: dc3
        KDC Name: (null)
        Flags: 0
        DC Flags: 0
        Cache Flags: 0
```

Internally, we can see that when `klist add_bind` is executed, the Event Tracing for Windows (ETW) engine logs the action:

```plaintext
1107 [0] 02A4.0DBC::06/27/23-10:17:13.2035199 [KERBEROS] bndcache_cxx577 KerbCacheBinding() - Adding Binding Cache Entry - fabrikam.com : dc3, DcFlags e003f1fd CacheFlags 0
1108 [0] 02A4.0DBC::06/27/23-10:17:13.2035209 [KERBEROS] bndcache_cxx594 KerbCacheBinding() - Caching as BDC
1109 [0] 02A4.0DBC::06/27/23-10:17:13.2039398 [KERBEROS] bndcache_cxx577 KerbCacheBinding() - Adding Binding Cache Entry - fabrikam.com : dc3, DcFlags 0 CacheFlags 0
1110 [0] 02A4.0DBC::06/27/23-10:17:13.2039404 [KERBEROS] bndcache_cxx594 KerbCacheBinding() - Caching as BDC
```

**IMPORTANT:** While the bind flag should work consistently, there are some scenarios where DC Locator is prompted for action and the cache is completely ignored. This behavior is specified thoroughly at [DsGetDcNameA function (dsgetdc.h)](https://learn.microsoft.com/en-us/windows/win32/api/dsgetdc/nf-dsgetdc-dsgetdcnamea#notes-on-domain-controller-stickiness).

# Purge flag

While troubleshooting, you will often need to perform a purge (`klist purge`) of existing tickets to examine a specific behavior or check a new configuration.

When `klist purge` is executed, the ETW engine logs the following:

```plaintext
1079 [0] 02A4.0DBC::06/27/23-10:13:12.1986972 [KERBEROS] kerbs4u_cxx291 KerbAgeS4U2ProxyCache() - Reset expired S4U2Proxy cache 000001AF80048A18 flags for logon session: 0:3e7, Flags 0, LastStatus 0, Expiry 0, RemoveAll 1
1080 [0] 02A4.0DBC::06/27/23-10:13:12.3860573 [KERBEROS] miscapi_cxx5170 KerbPurgeTicketEx() - Purging ticket cache Ex
1081 [0] 02A4.0DBC::06/27/23-10:13:12.3860639 [KERBEROS] miscapi_cxx5331 KerbPurgeTicketEx() - Purging all tickets
1082 [0] 02A4.0DBC::06/27/23-10:13:12.3860647 [KERBEROS] spncache_cxx190 KerbCleanupSpnCache() - Cleaning up SPN cache
```

If you would like to purge all the tickets that exist on a specific machine, the following PowerShell one-liner should be executed:

```plaintext
Get-WmiObject Win32_LogonSession | Where-Object {($_.AuthenticationPackage -ne 'NTLM') -and ($_.LogonId -ne '999') -and ($_.LogonId -ne '997') -and ($_.LogonId -ne '996')} | %{klist.exe purge -li ([Convert]::ToString($_.LogonId, 16))}
```

**IMPORTANT:** We do not advise running this command on production machines. This is due to the fact that the command purges tickets from all security contexts besides the built-in ones (SYSTEM/LOCAL SERVICE/NETWORK SERVICE) and can cause the machine to reboot in scenarios where a Kerberos ticket is required to perform actions that keep the machine's integrity intact.

# Get flag

Using the `klist get` command allows us to request specific tickets on a machine. This is very useful in scenarios where we would like to troubleshoot a specific scenario or reproduce a specific behavior. The syntax allows us to request any Service Principal Name (SPN), assuming it exists.

```plaintext
klist get host/win10b

Current LogonId is 0:0x24ba75
A ticket to host/win10b has been retrieved successfully.

Cached Tickets: (2)

#0>     Client: Danny @ FABRIKAM.COM
        Server: krbtgt/FABRIKAM.COM @ FABRIKAM.COM
        KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96
        Ticket Flags 0x40e10000 -> forwardable renewable initial pre_authent name_canonicalize
        Start Time: 6/27/2023 0:13:39 (local)
        End Time:   6/27/2023 10:13:39 (local)
        Renew Time: 7/4/2023 0:13:19 (local)
        Session Key Type: AES-256-CTS-HMAC-SHA1-96
        Cache Flags: 0x1 -> PRIMARY
        Kdc Called: DC3.Fabrikam.com

#1>     Client: Danny @ FABRIKAM.COM
        Server: host/win10b @ FABRIKAM.COM
        KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96
        Ticket Flags 0x40a10000 -> forwardable renewable pre_authent name_canonicalize
        Start Time: 6/27/2023 0:13:39 (local)
        End Time:   6/27/2023 10:13:39 (local)
        Renew Time: 7/4/2023 0:13:19 (local)
        Session Key Type: AES-256-CTS-HMAC-SHA1-96
        Cache Flags: 0
        Kdc Called: DC3.Fabrikam.com
```

When `klist get` is executed, the ETW engine logs a new ticket request. The following is observed after a purge:

```plaintext
1130 [0] 02A4.0DBC::06/27/23-10:13:19.1364255 [KERBEROS] ctxtapi_cxx559 KerbProcessTargetNames() - Parsed name hostname/win10b ((null)) into:     name type 0x2, name count 2,      realm (null),      first part hostname/win10b
1131 [0] 02A4.0DBC::06/27/23-10:13:19.1364277 [KERBEROS] ctxtapi_cxx725 KerbProcessTargetNames() - Cracked name hostname/win10b
1132 [0] 02A4.0DBC::06/27/23-10:13:19.1364316 [KERBEROS] ctxtapi_cxx726 KerbProcessTargetNames() - into hostname/win10b
1133 [0] 02A4.0DBC::06/27/23-10:13:19.1365227 [KERBEROS] credman_cxx2209 KerbCheckCredMgrForGivenTarget() - No credentials from the cred mgr 0xc0000225!
1134 [0] 02A4.0DBC::06/27/23-10:13:19.1365483 [KERBEROS] kerbtick_cxx477 KerbGetTgtForService() - KerbGetTgtForService TargetFlags 0x2140020, SuppRealm (null), TargetDomain (null)
1135 [0] 02A4.0DBC::06/27/23-10:13:19.1365489 [KERBEROS] kerbtick_cxx602 KerbGetTgtForService() - KerbGetTgtForService refreshing primary TGT for account
1136 [0] 02A4.0DBC::06/27/23-10:13:19.1365498 [KERBEROS] kerbtick_cxx370 KerbRefreshPrimaryTgt() - KerbRefreshPrimaryTgt getting new TGT for account
1137 [0] 02A4.0DBC::06/27/23-10:13:19.1365504 [KERBEROS] credmgr_cxx952 KerbGetTicketForCredential_New() - Getting Credentials for primary logon session - 000001AF809FA700
1138 [0]02A4.0DBC::06/27/23-10:13:19.1365565 [Microsoft.Windows.Security.Kerberos] [KerbGetTicketForCredentialActivityStart] PartA_PrivTags=16777216, threadId=3516
1139 [0] 02A4.0DBC::06/27/23-10:13:19.1365597 [KERBEROS] ctxtapi_cxx559 KerbProcessTargetNames() - Parsed name Danny ((null)) into:     name type 0x1, name count 1,      realm (null),      first part Danny
1140 [0] 02A4.0DBC::06/27/23-10:13:19.1365603 [KERBEROS] ctxtapi_cxx725 KerbProcessTargetNames() - Cracked name Danny
1141 [0] 02A4.0DBC::06/27/23-10:13:19.1365618 [KERBEROS] ctxtapi_cxx726 KerbProcessTargetNames() - into Danny
1142 [0] 02A4.0DBC::06/27/23-10:13:19.1365624 [KERBEROS] logonapi_cxx6866 KerbGetTicketGrantingTicket() - KerbGetTicketGrantingTicket GetTicketRestart ClientRealm FABRIKAM.COM
1143 [0] 02A4.0DBC::06/27/23-10:13:19.1365663 [KERBEROS] logonapi_cxx2156 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket getting authentication ticket for client Danny
1144 [0] 02A4.0DBC::06/27/23-10:13:19.1365666 [KERBEROS] logonapi_cxx2157 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket in realm FABRIKAM.COM
1145 [0] 02A4.0DBC::06/27/23-10:13:19.1365699 [KERBEROS] logonapi_cxx2158 KerbGetAuthenticationTicketEx() - for ServiceName krbtgt/FABRIKAM.COM
1146 [0] 02A4.0DBC::06/27/23-10:13:19.1365735 [KERBEROS] logonapi_cxx2371 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicketEx using default credentials FABRIKAM.COM\Danny
1147 [0] 02A4.0DBC::06/27/23-10:13:19.1365751 [KERBEROS] logonapi_cxx2373 KerbGetAuthenticationTicketEx() - to service krbtgt/FABRIKAM.COM
```
