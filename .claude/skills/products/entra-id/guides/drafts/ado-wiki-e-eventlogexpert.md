---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Tools/EventLogExpert"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Tools/EventLogExpert"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1623438&Instance=1623438&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1623438&Instance=1623438&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**: EventLogExpert is a powerful Windows Event Log viewer designed for tech support and IT professionals. It offers quick loading of large files, combined views for multiple files, advanced filtering capabilities, and more. This guide provides an overview of its features, how to obtain it, and usage instructions with advanced filters for various scenarios.

[[_TOC_]]

# Description
EventLogExpert is a Windows Event Log viewer for tech support and IT professionals. It will make your life easier when looking at exported or live event logs: large files quick load, combined view for multiple files, advanced filtering capabilities, and many more.

# How to get
You can download it directly from [EventLogExpert](https://github.com/microsoft/EventLogExpert) GitHub.

# Usage

## Advanced filters
EventLogExpert allows you to filter by date, and you can also build your own basic and advanced filters. Below are some advanced filters that could be useful in certain scenarios:

### Account lockout 
**Security** events from domain controllers filtered **by user** to help you determine if there is Kerberos activity, NTLM (Windows NT LAN Manager), or both:
```plaintext
(Id == "4625" || Id == "4771" || Id == "4768" || Id == "4769" || Id == "4776" || Id == "4740" || Id == "4767" || Id == "6273") && Description.Contains('**username**')
```

**Failed Kerberos** TGT (Ticket Granting Ticket) with **0x18 -bad password-** or error code **0x12 -account already locked-** (any request with the correct password after lockout will be logged with 0x12).
```plaintext
(Id == "4771") && Description.Contains('**username**') && (Description.Contains('**0x18**') || Description.Contains('**0x12**'))
```

**Failed NTLM** authentication request with **0xC000006A -bad password-** or **0xC0000234 -account already locked-**
```plaintext
(Id == "4771") && Description.Contains('**username**') && (Description.Contains('0xC000006A') || Description.Contains('0xC0000234'))
```

You can customize the NTLM filter by using any of the other error codes:

```
0x0	        Successful login
0xC0000064	The specified user does not exist
0xC000006A	The value provided as the current password is not correct
0xC000006C	Password policy not met
0xC000006D	The attempted logon is invalid due to a bad username
0xC000006E	User account restriction has prevented successful login
0xC000006F	The user account has time restrictions and may not be logged onto at this time
0xC0000070	The user is restricted and may not log on from the source workstation
0xC0000071	The user account's password has expired
0xC0000072	The user account is currently disabled
0xC000009A	Insufficient system resources
0xC0000193	The user's account has expired
0xC0000224	User must change his password before he logs on the first time
```

 You can correlate NTLM errors from events with Netlogon.log errors by using `findstr`, for example:
```plaintext
findstr /I "0xC000006A" C:\Windows\debug\netlogon.log
```

### DFS replication
Detect problems with **initial replication**:
```plaintext
(Id == "2002" || Id == "2004" || Id == "2212" || Id == "2213" || Id == "2214" || Id == "4102" || Id == "4104" || Id == "4002" || Id == "4004" || Id == "4112") 
```

Detect problems with the DFSR (Distributed File System Replication) **service getting restarted**:
```plaintext
(Id == "1002" || Id == "1004" || Id == "1006" || Id == "1008") 
```

### Networking
**Port exhaustion** occurs when a system runs out of available ephemeral ports, which are temporary ports used for short-lived network connections. The following two System events indicate that new connections cannot be established until some of the existing connections are closed and their ports are released.
```plaintext
(Id == "4227" || Id == "4231")
```

### Windows time
Filter by time service activity, service restart, and OS restart:
```plaintext
(Source == "Microsoft-Windows-Time-Service" || Source == "Service Control Manager" && Description.Contains("Windows Time service", StringComparison.OrdinalIgnoreCase) || Source == "Microsoft-Windows-Kernel-General") && (Id !="15" && Id !="16" && Id !="20" && Id !="24")
```
