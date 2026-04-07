---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: References/Kerberos: Kerberos & KDC registry keys entries"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20References/Kerberos%3A%20Kerberos%20%26%20KDC%20registry%20keys%20entries"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1361058&Instance=1361058&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1361058&Instance=1361058&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**  
This page provides detailed information about Kerberos client and KDC registry keys, including their types, default values, and descriptions. It also includes important notes and links to further resources for more information. 

[[_TOC_]]

# Kerberos client
Registry entries and values under the Parameters key.  
The registry entries listed in this section must be added to the following registry subkey:

**HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters**

 Note: If the Parameters key isn't listed under Kerberos, you must create the key.

---

## Entry: SkewTime
Type: REG_DWORD  
Default value: 5 (minutes)  

This value is the maximum time difference permitted between the client computer and the server that accepts Kerberos authentication or the KDC.

 Note: The SkewTime is considered in the determination of Kerberos ticket validity for reuse. A ticket is considered expired if the expiration time is less than the current time + the SkewTime. For example, if the SkewTime is set to 20 minutes and the current time is 08:00, any ticket with an expiration time before 08:20 will be considered expired.

---

## Entry: LogLevel
Type: REG_DWORD  
Default value: 0  

This value indicates whether events are logged in the system event log. If this value is set to any non-zero value, all Kerberos-related events are logged in the system event log.

 Note: The events logged may include false positives where the Kerberos client retries with different request flags that then succeed. Therefore, don't assume that you have a Kerberos problem when you see an event logged based on this setting. For more information, see [How to enable Kerberos event logging](https://learn.microsoft.com/en-US/troubleshoot/windows-server/windows-security/enable-kerberos-event-logging).

---

## Entry: MaxPacketSize
Type: REG_DWORD  
Default value: 1465 (bytes)  

This value is the maximum User Datagram Protocol (UDP) packet size. If the packet size exceeds this value, Transmission Control Protocol (TCP) is used.  
The default for this value in Windows Vista and later versions of Windows is 0, so UDP is never used by the Windows Kerberos Client.

---

## Entry: StartupTime
Type: REG_DWORD  
Default value: 120 (seconds)  

This value is the time that Windows waits for the KDC to start before Windows gives up.

---

## Entry: KdcWaitTime
Type: REG_DWORD  
Default value: 10 (seconds)  

This value is the time Windows waits for a response from a KDC.

---

## Entry: KdcBackoffTime
Type: REG_DWORD  
Default value: 10 (seconds)  

This value is the time between successive calls to the KDC if the previous call failed.

---

## Entry: KdcSendRetries
Type: REG_DWORD  
Default value: 3  

This value is the number of times that a client will try to contact a KDC.

---

## Entry: DefaultEncryptionType
Type: REG_DWORD  

This value indicates the default encryption type for pre-authentication. The default value for RC4 is 23 (decimal) or 0x17 (hexadecimal).

When you want to use Advanced Encryption Standard (AES), set the value to one of the following values:  

- aes256-cts-hmac-sha1-96: 18 or 0x12  
- aes128-cts-hmac-sha1-96: 17 or 0x11  

---

## Entry: FarKdcTimeout
Type: REG_DWORD  
Default value: 10 (minutes)  

This is the time-out value used to invalidate a domain controller from a different site in the domain controller cache.

---

## Entry: NearKdcTimeout
Type: REG_DWORD  
Default value: 30 (minutes)  

This is the time-out value used to invalidate a domain controller in the same site in the domain controller cache.

---

## Entry: StronglyEncryptDatagram
Type: REG_BOOL  
Default value: FALSE  

This value contains a flag that indicates whether to use 128-bit encryption for datagram packets.

---

## Entry: MaxReferralCount
Type: REG_DWORD  
Default value: 6  

This value is the number of KDC referrals that a client pursues before the client gives up.

---

## Entry: MaxTokenSize
Type: REG_DWORD  
Default value: 12000 (decimal). Starting Windows Server 2012 and Windows 8, the default value is 48000.  

This value is the maximum value of the Kerberos token. Microsoft recommends that you set this value to less than 65535. For more information, see [Problems with Kerberos authentication when a user belongs to many groups](https://learn.microsoft.com/en-US/troubleshoot/windows-server/windows-security/kerberos-authentication-problems-if-user-belongs-to-groups).

---

## Entry: SpnCacheTimeout
Type: REG_DWORD  
Default value: 15 minutes  

This value is used by the system when purging Service Principal Names (SPN) cache entries. On domain controllers, the SPN cache is disabled. Clients and member servers use this value to age out and purge negative cache entries (SPN not found). Valid SPN cache entries (for example, not negative cache) aren't deleted after 15 minutes of creation. However, the SpnCacheTimeout value is also used to reduce the SPN cache to a manageable sizewhen the SPN cache reaches 350 entries, the system will use this value to scavenge/clean up old and unused entries.

---

## Entry: S4UCacheTimeout
Type: REG_DWORD  
Default value: 15 minutes  

This value is the lifetime of the Service for User (S4U) negative cache entries that are used to restrict the number of S4U proxy requests from a particular computer.

---

## Entry: S4UTicketLifetime
Type: REG_DWORD  
Default value: 15 minutes  

This value is the lifetime of tickets obtained by S4U proxy requests.

---

## Entry: RetryPdc
Type: REG_DWORD  
Default value: 0 (false)  
Possible values: 0 (false) or any non-zero value (true)

This value indicates whether the client will contact the primary domain controller for Authentication Service Requests (AS_REQ) if the client receives a password expiration error.

---

## Entry: RequestOptions
Type: REG_DWORD  
Default value: Any RFC 1510 value  

This value indicates whether there are more options that must be sent as KDC options in Ticket Granting Service requests (TGS_REQ).

---

## Entry: ClientIpAddresses
Type: REG_DWORD  
Default value: 0 (This setting is 0 because of Dynamic Host Configuration Protocol (DHCP) and network address translation issues.)  
Possible values: 0 (false) or any non-zero value (true)

This value indicates whether a client IP address will be added in AS_REQ to force the Caddr field to contain IP addresses in all tickets.

---

## Entry: TgtRenewalTime
Type: REG_DWORD  
Default value: 600 seconds  

This value is the time that Kerberos waits before it tries to renew a Ticket Granting Ticket (TGT) before the ticket expires.

---

## Entry: AllowTgtSessionKey
Type: REG_DWORD  
Default value: 0  
Possible values: 0 (false) or any non-zero value (true)  

This value indicates whether session keys are exported with initial or cross-realm TGT authentication. The default value is false for security reasons.

 Note: With active Credential Guard in Windows 10 and later versions of Windows, you can't enable sharing the TGT session keys with applications anymore.

---

# Registry entries and values under the Kdc key
The registry entries listed in this section must be added to the following registry subkey:

**HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Kdc**

 Note: If the Kdc key isn't listed under Services, you must create the key.

---

## Entry: KdcUseClientAddresses
Type: REG_DWORD  
Default value: 0  
Possible values: 0 (false) or any non-zero value (true)

This value indicates whether IP addresses will be added in the Ticket-Granting Service Reply (TGS_REP).

---

## Entry: KdcDontCheckAddresses
Type: REG_DWORD  
Default value: 1  
Possible values: 0 (false) or any non-zero value (true)

This value indicates whether IP addresses for the TGS_REQ and the TGT Caddr field will be checked.

---

## Entry: NewConnectionTimeout
Type: REG_DWORD  
Default value: 10 (seconds)  

This value is the time that an initial TCP endpoint connection will be kept open to receive data before it disconnects.

---

## Entry: MaxDatagramReplySize
Type: REG_DWORD  
Default value: 1465 (decimal, bytes)  

This value is the maximum UDP packet size in TGS_REP and Authentication Service Replies (AS_REP) messages. If the packet size exceeds this value, the KDC returns a "KRB_ERR_RESPONSE_TOO_BIG" message that requests that the client switches to TCP.

 Note: Increasing MaxDatagramReplySize may increase the likelihood of Kerberos UDP packets being fragmented.  
For more information about this issue, see [How to force Kerberos to use TCP instead of UDP in Windows](https://learn.microsoft.com/en-US/troubleshoot/windows-server/windows-security/force-kerberos-use-tcp-instead-udp).

---

## Entry: KdcExtraLogLevel
Type: REG_DWORD  
Default value: 2  

Possible values:  
- 1 (decimal) or 0x1 (hexadecimal): Audit unknown SPN errors in the security event log. Event ID 4769 is logged with a failed audit.
- 2 (decimal) or 0x2 (hexadecimal): Log Public Key Cryptography for Initial Authentication in Kerberos (PKINIT) errors. This logs a KDC warning event ID 21 (enabled by default) to the system event log. PKINIT is an Internet Engineering Task Force (IETF) Internet draft for Public Key Cryptography for Initial Authentication in Kerberos.
- 4 (decimal) or 0x4 (hexadecimal): Log all KDC errors. This logs a KDC event ID 24 (example of User-to-User (U2U) required problems) to the system event log.
- 8 (decimal) or 0x8 (hexadecimal): Log a KDC warning event ID 25 in the system log when the user who asks for the S4U2Self ticket doesn't have sufficient access to the target user.
- 16 (decimal) or 0x10 (hexadecimal): Log audit events on encryption type (ETYPE) and bad options errors.

[Kerberos protocol registry entries and KDC configuration keys in Windows](https://learn.microsoft.com/en-us/troubleshoot/windows-server/windows-security/kerberos-protocol-registry-kdc-configuration-keys)