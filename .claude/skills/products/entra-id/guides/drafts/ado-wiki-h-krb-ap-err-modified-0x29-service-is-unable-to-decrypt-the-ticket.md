---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Looking for known solutions/KRB_AP_ERR_MODIFIED (0x29) [Service is unable to decrypt the ticket]"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Looking%20for%20known%20solutions/KRB_AP_ERR_MODIFIED%20%280x29%29%20%5BService%20is%20unable%20to%20decrypt%20the%20ticket%5D"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1500198&Instance=1500198&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1500198&Instance=1500198&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides solutions for the "KRB_AP_ERR_MODIFIED" error that occurs during a Ticket Granting Service (TGS) decryption in Kerberos authentication. It includes common causes, symptoms, and step-by-step resolutions.

[[_TOC_]]

# Context

This page is part of the [Workflow: Kerberos: Looking for known solutions](/Kerberos/Workflow:-Kerberos:-Looking-for-known-solutions) and describes the most common solutions when the receiving identity responds with the message "KRB_AP_ERR_MODIFIED" during a TGS decryption.

_All domain names, tenant names, user account IDs, and associated GUIDs used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments._

# Author

Thanks to @<0AABDA0E-E92F-6A97-9241-395453E9330E>

# KRB_AP_ERR_MODIFIED (0x29): Service is unable to decrypt the ticket

This error indicates that the target server failed to decrypt the ticket provided by the client.

This can occur when:

1. The target Service Principal Name (SPN) is missing, duplicated, or registered on an account other than the account the target service is using.
1. The authentication data was encrypted with the wrong key for the intended server or service account.
1. Name resolution problems cause the request to be sent to the wrong computer.
1. The authentication data was modified in transit.
1. Other reasons.

## Symptoms

The symptoms from the end user's perspective can be very diverse depending on the scenario and the service to be diagnosed.

The network capture and Event Trace Log (ETL) examples displayed below were taken while the client machine was accessing a Common Internet File System (CIFS) share.

### Network capture

Wireshark filter "kerberos" shows KRB_AP_ERR_MODIFIED.

![Wireshark showing KRB_AP_ERR_MODIFIED](/.attachments/image-ee810147-bfb6-4d9e-b604-73e559ec2de8.png =960x339)

The error KRB_AP_ERR_MODIFIED may be reported as KRB_ERR_GENERIC in the network trace. Double-check the ETL trace entries to see the detailed error code, for example:  
`KerbVerifyApRequest failed to check ticket 29, (--> KRB_AP_ERR_MODIFIED) for process xxxxx`

### Kerberos.etl

The function "SpInitLsaModeContext" is where the client starts establishing a security context with the server.

This is followed by 0x90312 CONTINUE NEEDED status, which isn't an error but indicates that the authentication conversation must continue. The error "Failed to unpack AP reply" leads to the AP ERROR MODIFIED.

```plaintext
ctxtapi_cxx2577 SpInitLsaModeContext() - SpInitLsaModeContext: Getting outbound ticket for cifs/server ((null))  
ctxtapi_cxx2578 SpInitLsaModeContext() - TargetInternalName cifs/server  
ctxtapi_cxx2653 SpInitLsaModeContext() - SpInitLsaModeContext getting service ticket  
kerbtick_cxx458 KerbGetTgtForService() - KerbGetTgtForService TargetFlags 0x2100004, SuppRealm (null), TargetDomain CONTOSO,COM  
kerbtick_cxx7001 KerbGetServiceTicketInternal() - KerbGetServiceTicket TargetName cifs/server  
kerbtick_cxx5703 KerbGetTgsTicketEx() - KerbGetTgsTicketEx: Attempting to get a ticket from CONTOSO.COM  >>>>>  correlates to TGS-REQ in the network capture <<<<<
kerbtick_cxx3755 KerbGetTgsTicket() - KerbGetTgsTicket Flags 0x2100004, Tgt DomainName CONTOSO,COM, Tgt TargetDomainName CONTOSO,COM, TgtReply 0000000000000000, EvidenceTicket 0000000000000000  
kerbtick_cxx3756 KerbGetTgsTicket() - TargetName cifs/server  
kerbtick_cxx3073 KerbMakeSocketCallEx() - KerbMakeSocketCall uses KdcToCall option 0.  
kerbtick_cxx3397 KerbMakeSocketCallEx() - Retry # 0 Calling kdc 192.XXX.XXX.2 for realm CONTOSO,COM, DesiredFlags 0, connection timeout: 0 secs  
sockets_cxx676 KerbCallKdcEx() - Calling KDC: 192.XXX.XXX.2  
sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 192.XXX.XXX.2  
sockets_cxx777 KerbCallKdcEx() - Socket being used for select is 0x13e0  
sockets_cxx862 KerbCallKdcEx() - Socket being used for select is 0x13e0  
kerbtick_cxx7127 KerbGetServiceTicketInternal() - KerbGetReferralNames returns RealTargetRealm (null)  
spncache_cxx594 KerbUpdateSpnCacheEntry() - KerbUpdateSpnCacheEntry: Fake update, doing nothing.  
ctxtapi_cxx2802 SpInitLsaModeContext() - Building AP request for connection oriented context  
kerbtick_cxx2579 KerbBuildApRequest() - BuildApRequest using nonce 0x2f4385e4  
kerbtick_cxx1402 KerbBuildGssChecksum() - KerbBuildGssChecksum asked for delegation, but not granted  
ctxtapi_cxx3351 SpInitLsaModeContext() - SpInitLsaModeContext returned 0x90312, Context 0000028B3375CB30, Pid 0x4
ctxtapi_cxx3352 SpInitLsaModeContext() - SpInitLsaModeContext returned 0x90312  >>>>>  the function completed successfully, but must be called again to complete the context <<<<<
ctxtapi_cxx932 SpInitLsaModeContext() - SpInitLsaModeContext 0000028B3375CB30 called  
ctxtapi_cxx559 KerbProcessTargetNames() - Parsed name cifs/server ((null)) into:	 name type 0x2, name count 2, 	 realm (null), 	 first part cifs/server  
ctxtapi_cxx725 KerbProcessTargetNames() - Cracked name cifs/server  
ctxtapi_cxx726 KerbProcessTargetNames() - into cifs/server  
ctxtapi_cxx1157 SpInitLsaModeContext() - SpInitLsaModeContext: Second call to Initialize  
kerbtick_cxx10481 KerbVerifyApReply() - Didn't find GSS header on AP Reply  
tickets_cxx2801 KerbUnpackData() - KerbUnpackData Asn1Err 0xfffffc0d  
kerbtick_cxx10493 KerbVerifyApReply() - Failed to unpack AP reply >>>> Server was unable to process the clients request correctly <<<<
ctxtapi_cxx1410 SpInitLsaModeContext() - SpInitLsaModeContext non datagram called KerbReceiveErrorMessage 0  
ctxtapi_cxx1430 SpInitLsaModeContext() - SpInitLsaModeContext failed to verify AP reply: 0x29
ctxtapi_cxx1471 SpInitLsaModeContext() - App modified error (NO CONTINUE, bail) target cifs/server  
ctxtapi_cxx3351 SpInitLsaModeContext() - SpInitLsaModeContext returned 0x80090322, Context 0000000000000000, Pid 0x4  
ctxtapi_cxx3352 SpInitLsaModeContext() - SpInitLsaModeContext returned 0x80090322 >>>> SEC_E_WRONG_PRINCIPAL  The target principal name is incorrect <<<<
```

## Resolution

### 1. Password mismatch

- Check if the target server password or target service account password is different from the one configured on the Kerberos Key Distribution Center.
  1. Get the Distinguished Name of the relevant identity by using **Get-ADComputer** or **Get-ADUser** command.
  1. Use the **repadmin /showobjmeta** command followed by the identity Distinguished Name.  
     Example:  
     `repadmin /showobjmeta "CN=CIFS01,OU=File Servers,DC=contoso,DC=com"`

  1. Retrieve metadata of the relevant account from all the Domain Controllers (DCs) and review pwdLastSet values. If you find a discrepancy in the timestamps, determine which DC has the correct value. Example:

     `repadmin /showobjmeta * "CN=CIFS01,OU=File Servers,DC=contoso,DC=com"`

     ```plaintext
     2024-04-29 16:07:32   42 pwdLastSet  
     2023-12-29 21:59:32   38 pwdLastSet  
     2023-12-29 21:59:32   38 pwdLastSet  
     2023-12-29 21:59:32   38 pwdLastSet
     ```

  1. Use **repadmin /replsingleobj** command followed by destination and source DC names to replicate a single object and get a consistent value on all the domain controllers. Example:

     `repadmin /replsingleobj dest-dc source-dc "CN=CIFS01,OU=File Servers,DC=contoso,DC=com"`

 - If the target name reported for the error KRB_AP_ERR_MODIFIED is in the form `DRSR_UUID/DSA_GUID/contoso.com@contoso.com`, check the troubleshooting steps for Active Directory (AD) replication [error -2146893022 - "The target principal name is incorrect" - KB 2090913](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/replication-error-2146893022)

### 2. SPN

- Use LDIFDE to search the directory (http/" after "serviceprincipalname=" should be modified by the SPN that is missing. * is a wildcard)   
  `LDIFDE /f spn.txt /t 3268 /r (serviceprincipalname=http/*) /l serviceprincipalname`   
  Alternative: **SETSPN -T <domain> -F -Q http/\*** 
- Review the output file and see where the SPN is registered. Resolve the SPN issue if found:
  - This will typically be the SPN is registered to the wrong account.
  - In rare conditions, there can also be a duplicate SPN in the users forest and the correct SPN in the resource forest.
- If the SPN is registered to the wrong account, remove the SPN and assign it to the right one. Check with the team responsible for the application for the correct account. [Manually Registering SPNs](https://social.technet.microsoft.com/wiki/contents/articles/717.service-principal-names-spn-setspn-syntax.aspx#Manually_Registering_SPNs) 

### 3. Name resolution

- Incorrect WINS/DNS/HOSTS file entries may cause the computer to resolve to the wrong IP address and direct the ticket to the wrong computer. Ensure that the name resolution for the Fully Qualified Domain Name (FQDN) matches the IP address of the system. If there are discrepancies, they need to be corrected as they may cause Kerberos authentication to fail.
- Also, keep in mind that two computers in different domains having the same name may cause the client to send the authentication data to the wrong computer.

### 4. Data modified

- KRB_AP_ERR_MODIFIED might occur if the authentication data was altered during transmission due to a hardware or software malfunction, or by an attacker. Although this is a less common cause compared to others, it should be considered once other reasons have been ruled out, particularly in intricate or widespread networks. It's advisable to inquire with the customer whether any package inspection tools or network devices are in use. It's also recommended to ensure that network drivers are regularly updated to maintain network integrity.

### 5. Other issues

- IA-IA-883249 Servicing: 11B.22: Kerberos constrained delegation (KCD) fails with KRB5KRB_AP_ERR_MODIFIED on 11B.22-patched RWDCs due to zeroing out branch ID (ICM 370065478)  
  [https://internal.evergreen.microsoft.com/en-us/topic/servicing-11b-22-kerberos-constrained-delegation-kcd-fails-with-krb5krb-ap-err-modified-on-11b-22-patched-rwdcs-due-to-zeroing-out-branch-id-icm-370065478-4ed53278-1482-668d-e01e-d970e8a6877e](https://internal.evergreen.microsoft.com/en-us/topic/servicing-11b-22-kerberos-constrained-delegation-kcd-fails-with-krb5krb-ap-err-modified-on-11b-22-patched-rwdcs-due-to-zeroing-out-branch-id-icm-370065478-4ed53278-1482-668d-e01e-d970e8a6877e)

## Real-world scenarios

### CIFS share 0x80070035 - The network path was not found

::: video
<iframe src="https://microsoft.sharepoint.com/teams/EMEAWindowsDirectoryServicesPod/_layouts/15/embed.aspx?UniqueId=1dfb51a2-2773-40be-a5b6-6cb289e3cf9b&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" width="853" height="480" frameborder="0" scrolling="no" allowfullscreen title="Workflow - Kerberos - Looking for known solutions - 0x29_KRB_AP_ERR_MODIFIED.mp4"></iframe>
:::

