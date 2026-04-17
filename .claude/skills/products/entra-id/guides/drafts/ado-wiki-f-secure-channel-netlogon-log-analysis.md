---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Secure Channel/Workflow: Secure Channel: Looking at netlogon.log"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FSecure%20Channel%2FWorkflow%3A%20Secure%20Channel%3A%20Looking%20at%20netlogon.log"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415483&Instance=415483&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415483&Instance=415483&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This document outlines the process and logs related to machine password changes and troubleshooting secure session setup issues with domain controllers in a Windows environment. It includes detailed log entries and error messages to aid in diagnosing and resolving issues.

[[_TOC_]]

# Indication for machine password change
07/11 09:49:38 [SESSION] [648] CONTOSO: `NlChangePassword`: Doing it.  
07/11 09:49:38 [SESSION] [648] CONTOSO: NlSessionSetup: Try session setup  
07/11 09:49:38 [SESSION] [648] CONTOSO: NlDiscoverDc: Start synchronous discovery  
07/11 09:49:38 [MISC] [648] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c07ffff1  
07/11 09:49:38 [SITE] [3384] DsrGetSiteName: Returning site name 'SAGI-Site' from local cache.  
07/11 09:49:38 [MISC] [3384] DsGetDcName function called: client PID=808, Dom:(null) Acct:(null) Flags: IP TIMESERV AVOIDSELF BACKGROUND  
07/11 09:49:38 [MISC] [3384] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c07ffff1  
07/11 09:49:38 [MISC] [3384] NetpDcGetName: CONTOSO.COM. cache doesn't have right account name.  
07/11 09:49:38 [MAILSLOT] [3384] NetpDcPingListIp: CONTOSO.COM.: Sent UDP ping to 192.168.0.224  
07/11 09:49:38 [MISC] [3384] NlPingDcNameWithContext: Sent 1/1 ldap pings to DC2016.CONTOSO.COM  
07/11 09:49:39 [MISC] [524] DsGetDcName function called: client PID=3248, Dom:(null) Acct:(null) Flags: LDAPONLY BACKGROUND RET_DNS  
07/11 09:49:39 [MISC] [524] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c07ffff1  
07/11 09:49:39 [MISC] [524] NetpDcGetName: CONTOSO.COM. cache doesn't have right account name.  
07/11 09:49:40 [MISC] [3384] NetpDcAllocateCacheEntry: new entry 0x000000511317A7B0 -> DC:DC2016 DnsDomName:CONTOSO.COM Flags:0x1f3fd  
07/11 09:49:40 [MISC] [3384] NlPingDcNameWithContext: DC2016.CONTOSO.COM responded over IP.  
07/11 09:49:40 [MISC] [3384] NetpDcGetName: CONTOSO.COM. using cached information (NlDcCacheEntry = 0x000000511317A7B0)  
07/11 09:49:40 [MISC] [3384] DsGetDcName: results as follows: DCName:\\\\DC2016.CONTOSO.COM DCAddress:\\\\192.168.0.224 DCAddrType:0x1 DomainName:CONTOSO.COM DnsForestName:CONTOSO.COM Flags:0xe001f3fd DcSiteName:SAGI-Site ClientSiteName:SAGI-Site.  
.  
.  
.  
07/11 09:49:40 [LOGON] [648] NlSetForestTrustList: New trusted domain list:  
07/11 09:49:40 [LOGON] [648] 0: CHILD CHILD.CONTOSO.COM (NT 5) (Forest: 2) (Direct Outbound) (Direct Inbound) (Attr: 0x20)  
07/11 09:49:40 [LOGON] [648] Dom Guid: 4425499b-f198-4609-a61b-008d1a81ac8b  
07/11 09:49:40 [LOGON] [648] Dom Sid: S-1-5-21-2816481788-2004133664-1931502515  
07/11 09:49:40 [LOGON] [648] 1: CONTOSO contoso.com (NT 5) (Direct Outbound) (Direct Inbound) (Attr: 0x8)  
07/11 09:49:40 [LOGON] [648] Dom Sid: S-1-5-21-1046467867-1939747161-560310435  
07/11 09:49:40 [LOGON] [648] 2: CONTOSO CONTOSO.COM (NT 5) (Forest Tree Root) (Primary Domain) (Native)  
07/11 09:49:40 [LOGON] [648] Dom Guid: ec1f6f27-41b4-4bc6-9149-8c2c847688b5  
07/11 09:49:40 [LOGON] [648] Dom Sid: S-1-5-21-3536007982-805657547-2100504194  
07/11 09:49:40 [SESSION] [648] CONTOSO: NlSetStatusClientSession: Set connection status to 0  
07/11 09:49:40 [SESSION] [648] CONTOSO: NlSessionSetup: Session setup succeeded  
07/11 09:49:40 [SESSION] [648] CONTOSO: `NlChangePassword`: `Flag password changed in LsaSecret`  
07/11 09:49:40 [MISC] [3836] DsGetDcName function called: client PID=3248, Dom:(null) Acct:(null) Flags: DSP  
07/11 09:49:40 [MISC] [3836] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c07ffff1  
07/11 09:49:40 [MISC] [3836] NetpDcGetName: CONTOSO.COM. using cached information (NlDcCacheEntry = 0x000000511317B8C0)  
07/11 09:49:40 [MISC] [3836] DsGetDcName: results as follows: DCName:\\\\DC2016.CONTOSO.COM DCAddress:\\\\192.168.0.224 DCAddrType:0x1 DomainName:CONTOSO.COM DnsForestName:CONTOSO.COM Flags:0xe001f3fd DcSiteName:SAGI-Site ClientSiteName:SAGI-Site  
07/11 09:49:40 [MISC] [3836] DsGetDcName function returns 0 (client PID=3248): Dom:(null) Acct:(null) Flags: DSP  
07/11 09:49:40 [MISC] [3836] DsGetDcName function called: client PID=3248, Dom:CONTOSO.COM Acct:(null) Flags: LDAPONLY RET_DNS  
07/11 09:49:40 [MISC] [3836] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c07ffff1  
07/11 09:49:40 [MISC] [3836] NetpDcGetName: CONTOSO.COM using cached information (NlDcCacheEntry = 0x000000511317A7B0)  
07/11 09:49:40 [MISC] [3836] DsGetDcName: results as follows: DCName:\\\\DC2016.CONTOSO.COM DCAddress:\\\\192.168.0.224 DCAddrType:0x1 DomainName:CONTOSO.COM DnsForestName:CONTOSO.COM Flags:0xe001f3fd DcSiteName:SAGI-Site ClientSiteName:SAGI-Site  
07/11 09:49:40 [MISC] [3836] DsGetDcName function returns 0 (client PID=3248): Dom:CONTOSO.COM Acct:(null) Flags: LDAPONLY RET_DNS  
07/11 09:49:40 [MISC] [3384] DsGetDcName function called: client PID=752, Dom:CONTOSO Acct:(null) Flags: DS WRITABLE RET_DNS  
07/11 09:49:40 [MISC] [3384] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c07ffff1  
07/11 09:49:40 [MISC] [3384] NetpDcGetName: CONTOSO.COM. using cached information (NlDcCacheEntry = 0x000000511317B8C0)  
07/11 09:49:40 [MISC] [3384] DsGetDcName: results as follows: DCName:\\\\DC2016.CONTOSO.COM DCAddress:\\\\192.168.0.224 DCAddrType:0x1 DomainName:CONTOSO.COM DnsForestName:CONTOSO.COM Flags:0xe001f3fd DcSiteName:SAGI-Site ClientSiteName:SAGI-Site  
07/11 09:49:40 [MISC] [3384] DsGetDcName function returns 0 (client PID=752): Dom:CONTOSO Acct:(null) Flags: DS WRITABLE RET_DNS  
07/11 09:49:40 [SESSION] [648] CONTOSO: `NlChangePassword`: `Flag password updated on DC`  
07/11 09:49:40 [MISC] [648] Eventlog: 5823 (4) "\\\\DC2016.CONTOSO.COM"  
07/11 09:49:40 [MSA] [648] Entering NlGMSAScavenger  
07/11 09:49:40 [MSA] [648] Exiting NlGMSAScavenger  
07/11 09:49:40 [MISC] [648] NlWksScavenger: Can be called again in 30 days (0x9a7ec800)  
07/11 09:49:40 [MISC] [3384] DsGetDcName function called: client PID=3248, Dom:(null) Acct:(null) Flags: LDAPONLY RET_DNS  
07/11 09:49:40 [MISC] [3384] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c07ffff1  
07/11 09:49:40 [MISC] [3384] NetpDcGetName: CONTOSO.COM. using cached information (NlDcCacheEntry = 0x000000511317A7B0)  
07/11 09:49:40 [MISC] [3384] DsGetDcName: results as follows: DCName:\\\\DC2016.CONTOSO.COM DCAddress:\\\\192.168.0.224 DCAddrType:0x1 DomainName:CONTOSO.COM DnsForestName:CONTOSO.COM Flags:0xe001f3fd DcSiteName:SAGI-Site ClientSiteName:SAGI-Site  

---

```
Log Name: System  
Source: NETLOGON  
Date: 7/16/2019 4:17:43 PM  
Event ID: 5719  
Task Category: None  
Level: Error  
Keywords: Classic  
User: N/A  
Computer: MNG3.CONTOSO.COM  
Description:  
This computer was not able to set up a secure session with a domain controller in domain CONTOSO due to the following:  
There are currently no logon servers available to service the logon request.  
This may lead to authentication problems. Make sure that this computer is connected to the network. If the problem persists, please contact your domain administrator.  
```

ADDITIONAL INFO  
If this computer is a domain controller for the specified domain, it sets up the secure session to the primary domain controller emulator in the specified domain. Otherwise, this computer sets up the secure session to any domain controller in the specified domain.  
Event Xml:  
```xml
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">  
  <System>  
    <Provider Name="NETLOGON" />  
    <EventID Qualifiers="0">5719</EventID>  
    <Level>2</Level>  
    <Task>0</Task>  
    <Keywords>0x80000000000000</Keywords>  
    <TimeCreated SystemTime="2019-07-16T13:17:43.000000000Z" />  
    <EventRecordID>5395</EventRecordID>  
    <Channel>System</Channel>  
    <Computer>MNG3.CONTOSO.COM</Computer>  
    <Security />  
  </System>  
  <EventData>  
    <Data>CONTOSO</Data>  
    <Data>%%1311</Data>  
    <Binary>5E0000C0</Binary> <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Error Code  
  </EventData>  
</Event>  
```

07/16 16:17:43 [SESSION] [524] I_NetLogonGetAuthData called: (null) CONTOSO.COM (Flags 0x1)  
07/16 16:17:43 [CRITICAL] [524] I_NetLogonGetAuthData failed: (null) CONTOSO.COM (Flags 0x1): `0xc000005e`  
07/16 16:17:43 [MISC] [524] DsGetDcName function called: client PID=884, Dom:(null) Acct:(null) Flags: RET_DNS  
07/16 16:17:43 [MISC] [524] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c07ffff1  

---

```
Log Name: System  
Source: NETLOGON  
Date: 7/21/2019 10:56:51 AM  
Event ID: 3210  
Task Category: None  
Level: Error  
Keywords: Classic  
User: N/A  
Computer: CORPWIN10.CONTOSO.COM  
Description:  
This computer could not authenticate with \\DC2016.CONTOSO.COM, a Windows domain controller for domain CONTOSO, and therefore this computer might deny logon requests. This inability to authenticate might be caused by another computer on the same network using the same name or the password for this computer account is not recognized. If this message appears again, contact your system administrator.  
```

Event Xml:  
```xml
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">  
  <System>  
    <Provider Name="NETLOGON" />  
    <EventID Qualifiers="0">3210</EventID>  
    <Level>2</Level>  
    <Task>0</Task>  
    <Keywords>0x80000000000000</Keywords>  
    <TimeCreated SystemTime="2019-07-21T07:56:51.734718800Z" />  
    <EventRecordID>18075</EventRecordID>  
    <Channel>System</Channel>  
    <Computer>CORPWIN10.CONTOSO.COM</Computer>  
    <Security />  
  </System>  
  <EventData>  
    <Data>CONTOSO</Data>  
    <Data>\\DC2016.CONTOSO.COM</Data>  
    <Binary>220000C0</Binary> <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Error Code  
  </EventData>  
</Event>  
```

07/21 10:56:51 [MISC] [768] NetpDcGetName: CONTOSO.COM. using cached information (NlDcCacheEntry = 0x000001F7B06560E0)  
07/21 10:56:51 [PERF] [768] NlAllocateClientSession: New Perf Instance (000001F7B0627678): "\\\\DC2016.CONTOSO.COM"  
ClientSession: 000001F7AFA81500  
07/21 10:56:51 [SESSION] [768] CONTOSO: NlDiscoverDc: Found DC \\\\DC2016.CONTOSO.COM  
07/21 10:56:51 [CRITICAL] [768] NlPrintRpcDebug: Couldn't get EEInfo for I_NetServerAuthenticate3: 1761 (may be legitimate for `0xc0000022`)  
07/21 10:56:51 [SESSION] [768] CONTOSO: NlSessionSetup: Negotiated flags with server are 0x612fffff  
07/21 10:56:51 [CRITICAL] [768] CONTOSO: NlSessionSetup: Session setup: cannot `I_NetServerAuthenticate` `0xc0000022`  
07/21 10:56:51 [CRITICAL] [768] CONTOSO: NlSessionSetup: `new password is bad, try old one`  
07/21 10:56:51 [CRITICAL] [768] NlPrintRpcDebug: Couldn't get EEInfo for I_NetServerAuthenticate3: 1761 (may be legitimate for `0xc0000022`)  
07/21 10:56:51 [SESSION] [768] CONTOSO: NlSessionSetup: Negotiated flags with server are 0x612fffff  
07/21 10:56:51 [CRITICAL] [768] CONTOSO: NlSessionSetup: Session setup: cannot `I_NetServerAuthenticate` `0xc0000022`  
07/21 10:56:51 [MISC] [768] Eventlog: 3210 (1) "CONTOSO" "\\\\DC2016.CONTOSO.COM" 2f8270f1 5bc8d5e7 34c3e164 6665df64 .p./...[d..4d.ef  
07/21 10:56:51 [SESSION] [768] CONTOSO: NlSetStatusClientSession: Set connection status to c0000022  
07/21 10:56:51 [SESSION] [768] CONTOSO: NlSetStatusClientSession: Unbind from server \\\\DC2016.CONTOSO.COM (TCP) 0.  
07/21 10:56:51 [SESSION] [768] CONTOSO: NlSessionSetup: Session setup failed  
07/21 10:56:53 [SITE] [768] DsrGetSiteName: Returning site name 'SAGI-Site' from local cache.
07/21 10:56:53 [MISC] [768] DsGetDcName function called: client PID=1168, Dom:(null) Acct:(null) Flags: IP TIMESERV AVOIDSELF BACKGROUND
07/21 10:56:53 [MISC] [768] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c0fffff1
07/21 10:56:53 [MISC] [768] NetpDcGetName: CONTOSO.COM . using cached information ( NlDcCacheEntry = 0x000001F7B06560E0 )
07/21 10:56:53 [MISC] [768] DsGetDcName: results as follows: DCName:\\DC2016.CONTOSO.COM DCAddress:\\192.168.0.224 DCAddrType:0x1 DomainName:CONTOSO.COM DnsForestName:CONTOSO.COM Flags:0xe001f3fd DcSiteName:SAGI-Site ClientSiteName:SAGI-Site  
...  
07/21 10:56:54 [MISC] [816] DsGetDcName function returns 0 (client PID=720): Dom:CONTOSO Acct:(null) Flags: DS RET_DNS  
07/21 10:56:55 [SESSION] [768] I_NetLogonGetAuthData called: (null) CONTOSO (Flags 0x1)  
07/21 10:56:55 [CRITICAL] [768] I_NetLogonGetAuthData failed: (null) CONTOSO (Flags 0x1): '0xc0000022'  
07/21 10:56:55 [SESSION] [760] I_NetLogonGetAuthData called: (null) CONTOSO (Flags 0x1)  
07/21 10:56:55 [CRITICAL] [760] I_NetLogonGetAuthData failed: (null) CONTOSO (Flags 0x1): '0xc0000022'  

```
Log Name:      System 
Source:        NETLOGON 
Date:          7/21/2019 2:27:40 PM 
Event ID:      5719 
Task Category: None 
Level:         Error 
Keywords:      Classic 
User:          N/A 
Computer:      CORPWIN10.CONTOSO.COM 
Description: 
This computer was not able to set up a secure session with a domain controller in domain CONTOSO due to the following:  
We can't sign you in with this credential because your domain isn't available. Make sure your device is connected to your organization's network and try again. If you previously signed in on this device with another credential, you can sign in with that credential.  
This may lead to authentication problems. Make sure that this computer is connected to the network. If the problem persists, please contact your domain administrator.   
ADDITIONAL INFO
If this computer is a domain controller for the specified domain, it sets up the secure session to the primary domain controller emulator in the specified domain. Otherwise, this computer sets up the secure session to any domain controller in the specified domain.
```

Event Xml:
```xml
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event"> 
  <System> 
    <Provider Name="NETLOGON" /> 
    <EventID Qualifiers="0">5719</EventID> 
    <Level>2</Level> 
    <Task>0</Task> 
    <Keywords>0x80000000000000</Keywords> 
    <TimeCreated SystemTime="2019-07-21T11:27:40.313324300Z" /> 
    <EventRecordID>19467</EventRecordID> 
    <Channel>System</Channel> 
    <Computer>CORPWIN10.CONTOSO.COM</Computer> 
    <Security /> 
  </System> 
  <EventData> 
    <Data>CONTOSO</Data> 
    <Data>%%1311</Data> 
    <Binary>5E0000C0</Binary> <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Error Code
  </EventData> 
</Event> 
```

07/21 14:27:40 [CRITICAL] [480] NetpDcGetNameIp: CONTOSO.COM .: No data returned from DnsQuery.  
07/21 14:27:40 [MISC] [480] NetpDcGetName: NetpDcGetNameIp for CONTOSO.COM . returned `1355`  
07/21 14:27:40 [CRITICAL] [480] NetpDcGetName: CONTOSO.COM .: IP and Netbios are both done.  
07/21 14:27:40 [MISC] [480] DsGetDcName function returns 1355 (client PID=1272): Dom:(null) Acct:(null) Flags: RET_DNS  
07/21 14:27:40 [MISC] [804] DsGetDcName function called: client PID=1272, Dom:(null) Acct:(null) Flags: RET_DNS    
...  
07/21 14:27:40 [CRITICAL] [2292] CONTOSO: NlDiscoverDc: Cannot find DC.  
07/21 14:27:40 [CRITICAL] [2292] CONTOSO: NlSessionSetup: Session setup: cannot pick trusted DC  
07/21 14:27:40 [MISC] [2292] Eventlog: 5719 (1) "CONTOSO" 0xc000005e 7f14dcc8 6c48a92f f9c5d616 c111129e ..../.Hl........  
07/21 14:27:40 [SESSION] [2292] CONTOSO: NlSetStatusClientSession: Set connection status to c000005e  
07/21 14:27:40 [SESSION] [2292] CONTOSO: NlSessionSetup: Session setup Failed  
...  
07/21 14:27:40 [MISC] [804] DsGetDcName function returns 1355 (client PID=1520): Dom:CONTOSO Acct:(null) Flags: DS RET_DNS  
07/21 14:27:40 [CRITICAL] [808] NetpDcGetDcNext: _kerberos._tcp.SAGI-Site._sites.dc._msdcs.CONTOSO.COM.: Cannot Query DNS. 1460 0x5b4  
07/21 14:27:40 [CRITICAL] [808] NetpDcGetNameIp: CONTOSO.COM .: No data returned from DnsQuery.  
07/21 14:27:40 [MISC] [808] NetpDcGetName: NetpDcGetNameIp for CONTOSO.COM . returned `1355`  
07/21 14:27:40 [CRITICAL] [808] NetpDcGetName: CONTOSO.COM .: IP and Netbios are both done.  
07/21 14:27:40 [MISC] [808] DsGetDcName function returns 1355 (client PID=732): Dom:(null) Acct:(null) Flags: FORCE KDC  
07/21 14:27:40 [MISC] [480] DsGetDcName function called: client PID=2372, Dom:(null) Acct:(null) Flags: FORCE PDC NETBIOS RET_NETBIOS  
07/21 14:27:40 [MISC] [480] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c0fffff1  
07/21 14:27:40 [CRITICAL] [480] NetpDcGetDcNext: _ldap._tcp.pdc._msdcs.CONTOSO.COM.: Cannot Query DNS. 1460 0x5b4  
07/21 14:27:40 [CRITICAL] [480] NetpDcGetNameIp: CONTOSO.COM .: No data returned from DnsQuery.  
07/21 14:27:40 [MISC] [480] NetpDcGetName: NetpDcGetNameIp for CONTOSO.COM . returned `1355`  
07/21 14:27:40 [CRITICAL] [480] NetpDcGetName: CONTOSO.COM .: IP and Netbios are both done.  
07/21 14:27:40 [MISC] [480] DsGetDcName function returns 1355 (client PID=2372): Dom:(null) Acct:(null) Flags: FORCE PDC NETBIOS RET_NETBIOS  
07/21 14:27:42 [INIT] [2292] Group Policy is defined for Netlogon  
07/21 14:27:42 [INIT] [2292] Following are the effective values after parsing  
07/21 14:27:42 [SESSION] [2292] Winsock Addrs: 172.30.148.97 192.168.0.7 (2) List size changed 1 2.  
07/21 14:27:42 [SESSION] [2292] CONTOSO: Zero LastAuth  
07/21 14:27:42 [MISC] [804] DsGetDcName function called: client PID=1272, Dom:(null) Acct:(null) Flags: RET_DNS  
07/21 14:27:42 [MISC] [804] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c0fffff1  
07/21 14:27:42 [MAILSLOT] [804] NetpDcPingListIp: CONTOSO.COM .: Sent UDP ping to 192.168.0.220  
07/21 14:27:42 [MAILSLOT] [804] NetpDcPingListIp: CONTOSO.COM .: Sent UDP ping to 192.168.0.224  
07/21 14:27:43 [MISC] [804] NetpDcAllocateCacheEntry: new entry 0x000002102E70C320 -> DC:DC2016 DnsDomName:CONTOSO.COM Flags:0x1f3fd  
07/21 14:27:43 [CRITICAL] [804] NetpDcHandlePingResponse: CONTOSO.COM .: `Netlogon is paused on the server`. 0x14  
07/21 14:27:43 [MISC] [804] NetpDcDerefCacheEntry: destroying entry 0x000002102E70C320  
07/21 14:27:43 [MAILSLOT] [804] NetpDcPingListIp: CONTOSO.COM .: Sent UDP ping to 192.168.0.225  
07/21 14:27:43 [CRITICAL] [804] NetpDcGetNameIp: CONTOSO.COM .: site specific SRV records done.  
07/21 14:27:44 [MAILSLOT] [804] NetpDcPingListIp: CONTOSO.COM .: Sent UDP ping to 192.168.0.205  

Network trace:

299 3:47:08 PM 7/22/2019 8.0356725 (1136) DC2016.CONTOSO.COM  CORPWIN10 NetLogon NetLogon:LogonSAMPauseResponseEX (`SAM Response when Netlogon is paused`): 24 (0x18)  
Frame: Number = 299, Captured Frame Length = 314, MediaType = NetEvent


```
NetEvent:
MicrosoftWindowsNDISPacketCapture: Packet Fragment (213 (0xD5) bytes)
Ethernet: Etype = Internet IP (IPv4),DestinationAddress:[00-15-5D-EE-52-0E],SourceAddress:[00-15-5D-EE-52-08]
Ipv4: Src = 192.168.0.224, Dest = 192.168.0.7, Next Protocol = UDP, Packet ID = 11298, Total IP Length = 199
Udp: SrcPort = LDAP(389), DstPort = 49578, Length = 179
Cldap: (CLDAP)Search Result Entry, MessageID: 2, Status: Success
LDAPMessage: Search Result Entry, MessageID: 2
ParserHeader:
MessageID: 2
OperationHeader: Search Result Entry, 4(0x4)
SearchResultEntry: NULL
NetlogonAttribute: LogonSAMPauseResponseEX (SAM Response when Netlogon is paused): 24 (0x18)
SamPauseResponseEx: DC2016.CONTOSO.COM 
Opcode: LogonSAMPauseResponseEX
Sbz: 0 (0x0)
Flags: 0x0001F3FD
DomainGuid: {EC1F6F27-41B4-4BC6-9149-8C2C847688B5}
DnsForestName: CONTOSO.COM 
DnsDomainName: CONTOSO.COM 
DnsHostName: DC2016.CONTOSO.COM  NetbiosDomainName: CONTOSO NetbiosComputerName: DC2016 UserName:
DcSiteName: SAGI-Site ClientSiteName: SAGI-Site NextClosestSiteName: Haifa
Version: 0x00000015 NT Version 5 Client
LmNtToken: Windows NT Networking: 0xFFFF
Lm20Token: OS/2 LAN Manager 2.0 (or later) Networking: 0xFFFF
LDAPMessage: search Result Done, MessageID: 2
ParserHeader:
MessageID: 2
OperationHeader: search Result Done, 5(0x5)
SearchResultDone: Status: Success, MatchedDN: NULL, ErrorMessage: NULL
ResultCode: Success
MatchedDN: NULL
ErrorMessage: NULL
```