---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Looking for known solutions/KDC_ERR_ETYPE_NOSUPP (0xE) [KDC has no support for encryption type]"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Looking%20for%20known%20solutions/KDC_ERR_ETYPE_NOSUPP%20%280xE%29%20%5BKDC%20has%20no%20support%20for%20encryption%20type%5D"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2243009&Instance=2243009&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2243009&Instance=2243009&Feedback=2)

___
<div id='cssfeedback-end'></div>

## Summary
Kerberos encryption types failures happen when the Domain Controller (KDC), the client, and/or the target service cannot agree on an encryption type (enctype) they all support  or when the service lacks the key for the enctype the KDC used to encrypt the ticket. These problems often present as KDC error codes such as `KDC_ERR_ETYPE_NOSUPP` (result code 0xE) and Security events like 4768/4771 on domain controllers.

_All domain names, tenant names, user account IDs and associated GUIDS used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments._

[[_TOC_]]

## Key concepts (short)
- `msDS-SupportedEncryptionTypes` (AD account attribute): a 32-bit **bitmask** on user/computer/service accounts that advertises which enctypes the account supports; the KDC uses it to store the keys in the database, while also uses it when generating service tickets. If the attribute is <not set>, DC defaults ([DefaultDomainSupportedEncTypes](https://aka.ms/DefaultDomainSupportedEncTypes)) apply.
- `DefaultDomainSupportedEncTypes` (domain controller registry)  
Registry value on each Domain Controller that specifies the **default encryption types the KDC will use** when an accounts `msDS-SupportedEncryptionTypes` attribute is unset. This registry key does not exist by default, the default behavior when it does not exist is 0x27.  

  ```
  HKLM\SYSTEM\CurrentControlSet\Services\KDC\DefaultDomainSupportedEncTypes
  ```
- `DefaultEncryptionType` (HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters): a **registry enumeration** on a machine that indicates the default [pre-auth enctype](https://aka.ms/DefaultEncryptionType) the client will use for pre-authentication. Its numeric values are enumerations (e.g., 17=AES128, 18=AES256), set to 18 as default after Windows Vista.  
 controls not only the encryption types the **machines** will use for their own machine passwords, but also what encryption types they allow to receive during a AS-REQ/TGS-REQ/AP-REQ  in WS2025 operating system this GPO controls the msDS-SupportedEncryptionTypes value, while in previous operating systems, the GPO controls the registry: `SupportedEncryptionTypes` (deprecated after WS2025 OS but still used on older OS), such registry controls the mentioned attribute on each machine reboot.

- GPO `Network security: Configure encryption types allowed for Kerberos`  This Group Policy setting determines which encryption types a Windows computer will:

1. **Use for its own machine account password** (when the DC issues a service ticket for the computer or stores the machine key in active directory database).  
2. **Accept in Kerberos messages** (AS-REQ, TGS-REQ, AP-REQ) when authenticating, regardless of the target account is the machine or any service account running any service in the target host.  

### Behavior by OS version

- **Windows Server 2025 and newer**
  - The GPO directly sets the **`msDS-SupportedEncryptionTypes`** attribute on the computer account in Active Directory.  

- **Earlier versions of Windows**
  - The GPO writes to the local registry value:  
    ```
    HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters\SupportedEncryptionTypes
    ```
  - At every reboot, the system uses this registry value to update its computer accounts `msDS-SupportedEncryptionTypes` attribute in AD.  

---

> **Note:** The registry method is **deprecated** starting with Windows Server 2025, but still applies to older operating systems.


## Typical failure scenarios
**Scenario A  AS (initial) / Pre-auth mismatch**  
- The client advertises supported enctypes (or sends preauth encrypted with a particular enctype) but the DC/KDC is configured (via DC registry/GPO) **not** to accept that enctype (or the KDC has different defaults). This leads to preauth failures (event 4771 or 4768 with result 0xE). Windows clients may make an initial AS-REQ without [PA-ENC-TIMESTAMP](https://aka.ms/PreAuthData) and retry after the KDC sends ETYPE-INFO (PreAuth-Required), these allows the clients to discover what are the encryption types the KDC allows to be used.

**Scenario B  TGS / service ticket encryption mismatch**  
- The KDC chooses an enctype for the service ticket using the **service account's** msDS-SupportedEncryptionTypes and the clients advertised enctypes. The service ticket (used later during the AP-REQ) is encrypted with the service account's long-term key using the selected enctype. If the target service host (or its keytab) doesn't have the matching key/enctype available (for example a machine configured only to use RC4 while the KDC issued AES or keytab only contains RC4 while KDC issued AES), the service cannot decrypt the ticket and authentication fails (error 0xE). 

**Scenario C  Stale account keys / weak encryption due to old passwords**  
- Accounts (user, computer, or service) that were created a long time ago and **have never had their passwords reset** only store secrets using older encryption types (DES, RC4). When a patch (such as [CVE-2022-37966](https://support.microsoft.com/en-us/topic/kb5021131-how-to-manage-the-kerberos-protocol-changes-related-to-cve-2022-37966-fd837ac3-cdec-4e76-a6ec-86e67501407d)) or policy enforces stronger encryption types (AES128, AES256) or disables weak algorithms, the stored secrets cannot be used by the KDC to generate or decrypt tickets. This leads to Kerberos failures with symptoms such as events 14, 16, 26, 27. The problem is typically resolved by **rotating the account password** ideally twice to get rid of the n-1 RC4 ONLY encrypted keys, which generates new secrets with supported encryption types.

## Symptoms and log clues

When Kerberos encryption type mismatches occur, you may see a mix of **event log entries** and **user-facing error messages**.


### Event logs

- **Event 4768 (Kerberos Authentication Service)**  
This event generates every time Key Distribution Center issues a Kerberos Ticket Granting Ticket (TGT).
This event generates only on domain controllers.
If TGT issue fails then you will see Failure event with**Result Code**field not equal to **0x0**.
This event doesn't generate for**Result Codes**: 0x10 and 0x18. Event [4771](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4771): Kerberos pre-authentication failed. generates instead.

- **Event 4771 (Kerberos Pre-Authentication failed)**  
This event generates every time the Key Distribution Center fails to issue a Kerberos Ticket Granting Ticket (TGT).
This event is not generated if "Do not require Kerberos preauthentication" option is set for the account. (it is not recommended to disable preauthentication as you will open a door for dictionary attack)

- **Event 14 (Kerberos Key Distribution Center)**  
Event ID 14 is logged when the failure occurs during the AS request used to get a TGT.
When the mismatch is detected, the DC will see if that the issue can be resolved by updating the password (twice). If the DC determines that it can, event ID 14 will be logged.

- **Event 16 (Kerberos Key Distribution Center)**  
 Event ID 16 is logged when the failure occurs during the TGS request used to get a ST (service ticket).
The same logic as the one used to determine whether event ID 14 is used. If the DC determines that it may be able to resolve the issue by a password reset, event ID 16 will be logged.

- **Event 26 (Kerberos Key Distribution Center)**  
Event 26 is logged when the failure occurs during the AS request used to get a TGT.
When the mismatch is detected, the DC will see if that the issue can be resolved by updating the password (twice). If the DC determines that  a password reset **will not** resolve the problem, event ID 26 will be logged.

- **Event 27 (Kerberos Key Distribution Center)**  
  Event ID 27 is logged when the failure occurs during the TGS request used to get a ST (service ticket).
The same logic as the one used to determine whether event 26 is used. If the DC determines that it may **NOT** be able to resolve the issue by a password reset, event ID 27 will be logged.


### User-facing errors (outside event logs)

- **Active Directory replication errors**  
  > "The encryption type requested is not supported by the KDC."

- **Interactive logon (LogonUI)**  
  Users may see generic errors like:  
  > "The system cannot log you on due to the following error: The encryption type requested is not supported by the KDC."

- **Remote Desktop (RDP)**  
  Connections may fail with similar Kerberos errors when negotiating session tickets.

- **Service-to-service authentication**  
  Applications or services relying on Kerberos (e.g., SQL, IIS) may fail to authenticate with messages referring to unsupported or missing encryption types.

## Troubleshooting Encryption Types issues       

>**NOTE**: Schedule a call with the customer as it will be easier to evacuate your doubts to provide a world-class service

### 1. Scope the problem
- **Identify the actors**  
  - **Client**: Is it a user, computer, or service account initiating authentication?  
  - **KDC**: Which domain controller is processing the request? (you can get this by running `klist query_bind` from the client computer
  - **Target account**: Is the target a **machine account** (computer), **service account**, or another **user**?  This account is the one with the SPN registered on it.
  - **Target computer**: The host machine that runs the target service?  (relevant since computer encryption rules constrain the encryption usage of any account on the host)

- **Ask scoping questions**  
  - Does the problem affect **one user/machine** or is it **widespread**?  
  - Is it limited to **specific services** (e.g., RDP, replication, SQL) or **all Kerberos auth**?  
  - Has the environment recently changed (patches, GPO updates, account reconfiguration)? 
  - Is the problem intermittent or can it constantly be reproduced?
  - Is this a new implementation or has it been working before?
  - What troubleshooting steps have you done to resolve or mitigate the problem?
 

### 2. Review event logs for evidence of mismatch 
   - On **DCs**: Events `4768`, `4771`, `14`, `16`, `26`, `27`. Do not underestimate the power of these event logs, they can usually point you to the problem and provide actionable steps.   
   - On **clients**: System and Application logs may also surface Kerberos errors.  
   - Cross-check errors with the expected encryption types for the account. 


### 3. Check the client-side Kerberos registry configuration
   - Registry path:  
     ```
     HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters\SupportedEncryptionTypes
     ```

        -and-   


     ```
     HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters\SupportedEncryptionTypes
     ```

   - Keys of interest:
     - `DefaultEncryptionType` (Relevant during initial authentication (client-KDC) controls client-preferred enctypes in AS-REQ).  
     - `SupportedEncryptionTypes` (Pre- WS2025, defines what the client machine accepts as a TGT response)  

>NOTE: The SupportedEncryptionTypes registry key is usually controlled via GPO, however there are cases where this registry is tattoed in the system after GPO removal or manually created by customers.

### 4. Compare the encryption type in the Service Ticket provided vs the target host allowed encryption types.
   - The following command will output the configured encryption type for the target account, the account could be a dedicated service account or machine account, you will have to find out what is the account based on scoping questions, service type, or a remote session: 

```
Get-ADUser -Identity "TARGETACCOUNT" -Properties msDS-SupportedEncryptionTypes | Select-Object Name, SamAccountName, msDS-SupportedEncryptionTypes
```

   - Ensure the found attribute value matches in compatibility with the allowed policy or default configuration of the machine receiving the service ticket (during AP-REQ), you can rather get the registry key values on the target computer (SupportedEncryptionTypes) or check the msDS-SupportedEncryptionTypes for the **machine account** in AD.

### 5. Collect authlogs/TSS in the client, KDC and target if more insights are required, make sure to get the exact timestamp
   - Check if the issue can be reproduced by running the command `klist get target/servicename` the target service name will usually be observed on mentioned events on the KDC and usually on the client machine system event logs. If the issue can be reproduced with the command you can simplify the problem, making it not-app dependent, which guarantees consistency and predictability. If you cannot reproduce the problem with klist, just use the application/service regular usage to replicate the problem during data collection
   - Visit the [Kerberos: Data Collection](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414188/Kerberos-Data-Collection) page for more information.

## Typical resolutions 

>**NOTE:** The following resolutions assume your customer is intending to use AES encryption types, since RC4 is officially deprecated and considered unsecure since 2017. If your customer requires to use RC4 due compatibility reasons, you should modify the suggested resolutions to match the customer needs using the same logic of matching enctypes on KDC, Client and/or target service/machine account.

- Ensure AD account `msDS-SupportedEncryptionTypes` includes the desired enctype bits (or leave it unset and ensure DC DefaultDomainSupportedEncTypes supports AES (0x18)). Use ADUC checkboxes or Set-ADUser/Set-ADServiceAccount to set AES bits for the users/service accounts or the mentioned GPO to control machine accounts.  
- If a non-Windows service is involved, regenerate the keytab with AES keys and re-deploy the keytab on the service host. Use `ktpass /crypto AES256-SHA1` (or AES128-SHA1) as appropriate. (vendor instructions may be required)
- If clients are advertising only RC4/DES because of older local policy, update the GPO `Network security: Configure encryption types allowed for Kerberos` to allow AES. 
- Be aware that changing the mentioned GPO/Registry key (SupportedEncryptionTypes) will take effect in a 2 hour interval where netlogon changes the Active Directory attribute.
- Be aware that modifying the active directory attribute on its own will not immediately change the secrets for the modified account, a password reset (twice) is required, for machines you can use `nltest /sc_change_pwd` or `test-computersecurechannel` to rotate the machine password, while for regular user and or user accounts used as service accounts you can reset the password in any supported way (you can even use the same password).
- To rotate SINGLE Managed Service Accounts (MSA) password use [Reset-ADServiceAccountPassword](https://aka.ms/resetMSAPwd)
- You cannot rotate Group Managed Service Accounts (gMSA) password or reduce the password interval after creation, you may need to create another gMSA with the required enctypes and use it temporarily while you wait for the password rotation interval to occur and generate new keys based on the new msDS-SupportedEncryptionTypes attribute value.

## Explanation and example, EType mismatch example
Consider a scenario where an app server is requesting a Ticket Granting Service (TGS) for MSSQLSvc/SQL1.contoso.com:1433 and the request fails with the error KDC_ERR_ETYPE_NOTSUPP in the Netmon trace.

At the same time, the app server's KDC (determined from KLIST output or per NLTEST /SC_QUERY:CONTOSO.COM) has logged an event 27:

_While processing a TGS request for the **target server MSSQLSVC/SQL1.CONTOSO.COM**, **the account SQL1 account** did not have a suitable key for generating a Kerberos ticket (the missing key has an ID of 9). The requested etypes were 18, 17. The accounts available etypes were 23, -133, -128. Changing or resetting the password of krbtgt will generate a proper key._

You may check the "[Kerberos: Reference: ETypes](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414194/Kerberos-Reference-ETypes)" workflow section to interpret the Etypes from the event message and/or this article [Parsing KDC event ID 14, 16, 26, 27 to understand the reason for the etype mismatch](https://internal.evergreen.microsoft.com/en-us/topic/adds-parsing-kdc-event-id-14-16-26-27-to-understand-the-reason-for-the-etype-mismatch-5904cb65-c9b0-e639-ec24-2881c46beed4).

Requested Etypes:
```
17 = KERB_ETYPE_AES128_CTS_HMAC_SHA1_96
18 = KERB_ETYPE_AES256_CTS_HMAC_SHA1_96
```

Available Etypes of password hashes, stored for this account:
```
23 = KERB_ETYPE_RC4_HMAC_NT
-133 = KERB_ETYPE_RC4_HMAC_OLD
-128 = KERB_ETYPE_RC4_MD4
```

Result: **The app server** is requesting only **AES Etypes** but for the **target SQL1 account** only **RC4 hashes** are stored.

Check the ReqBody within the TGS Request from the app server (considered a Kerberos client) to find the requested Etypes:
```
Frame: Number = 3073, Captured Frame Length = 6279, MediaType = NetEvent 
+ NetEvent:  
+ MicrosoftWindowsNDISPacketCapture: Packet Fragment (6178 (0x1822) bytes) 
+ Ethernet: Etype = Internet IP (IPv4),DestinationAddress:[00-00-0C-9F-F0-01],SourceAddress:[00-50-56-A1-1D-37] 
+ Ipv4: Src = 10.140.0.156, Dest = 10.136.2.2, Next Protocol = TCP, Packet ID = 18232, Total IP Length = 0 
+ Tcp: [Bad CheckSum]Flags=...AP..., SrcPort=60367, DstPort=Kerberos(88), PayloadLen=6124, Seq=282829325 - 282835449, Ack=368145510, Win=8212 (scale factor 0x8) = 2102272 
- Kerberos: TGS Request Realm: contoso.com Sname: MSSQLSvc/SQL1.contoso.com:1433  
+ Length: Length = 6120 
- TgsReq: Kerberos TGS Request 
+ ApplicationTag:  
- KdcReq: KRB_TGS_REQ (12) 
+ SequenceHeader:  
+ Tag1:  
+ Pvno: 5 
+ Tag2:  
+ MsgType: KRB_TGS_REQ (12) 
+ Tag3:  
+ PaData:  
+ Tag4:  
- ReqBody:  
+ SequenceHeader:  
+ Tag0:  
+ KdcOptions: 0x40810000 
+ Tag2: 0x1 
+ Realm: contoso.com 
+ Tag3:  
+ Sname: MSSQLSvc/SQL1.contoso.com:1433 
+ Tag5: 0x1 
+ Till: 09/13/2037 02:48:05 UTC 
+ Tag7:  
+ Nonce: 1483519579 (0x586CB65B) 
+ Tag8:  
- Etype:  
+ SequenceOfHeader:  
----->>>> + EType: aes256-cts-hmac-sha1-96 (18) <<<<------ 
----->>>> + EType: aes128-cts-hmac-sha1-96 (17) <<<<------ 
+ TagA:  
```

Check the _msDS-SupportedEncryptionTypes_ attribute value for the app server and SQL1 account. The value should be consistent within a domain and even forest to avoid implications.

For service user accounts, this is an explicit attribute setting. The default <not set> allows any Etype the KDC is capable of at the time of the password change. You may check the account's Active Directory (AD) metadata for _pwdLastSet_ pointing to a time when maybe AES was not available (pre-2008).

Check the GPO setting _Computer Configuration\Windows Settings\Security Settings\Local Policies\Security Options\ **Network Security: Configure encryption types allowed for Kerberos**_.

 **Note**: When nothing is set in the GPO, the default 0x1C (including RC4 but also AES) will be propagated by the Netlogon service to the AD attribute for the **computer accounts**.

Check also the _**SupportedEncryptionTypes**_ registry entry at the below location, maybe for an explicitly setting, overriding the expected defaults on the AD attribute.  
Registry location: _HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters_

### Result
In this example, the app server had _msDS-SupportedEncryptionTypes_=0x18=24 (AES Etypes, per GPO) and SQL1 user account default=<not set>, when it is not set it default to 0x27 including AES but only for session key and RC4 for encryption type, the observed event tells you this account regardless of the KDC default configuration does not have any AES key saved in the AD database - hence an encryption type mismatch.

### Resolution
Set the msDS-SupportedEncryptionTypes to AES (0x18) on the SQL1 user account object and reset the account password (twice).

---

## Internal articles
https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1082014/Kerberos-Single-Hop-Further-new-KLIST-features

https://internal.evergreen.microsoft.com/en-us/topic/adds-security-how-the-kerberos-supportedencryptiontypes-gpo-setting-is-propagated-on-computer-objects-in-active-directory-b34b84a5-f4fc-b550-f8f7-8efd3151ed69

[11B.22: Kerberos and NETLOGON Protocol protections for CVE-2022-38023, CVE-2022-37966, and CVE-2022-37977 in November 8, 2022 updates](https://internal.evergreen.microsoft.com/en-us/topic/servicing-11b-22-kerberos-and-netlogon-protocol-protections-for-cve-2022-38023-cve-2022-37966-and-cve-2022-37977-in-november-8-2022-updates-2fa14ba8-d568-db55-e7a7-18cbf3f01b05)

[Kerberos authentication fails when serviced by 11B.22 patched DCs if RC4 removed as supported encryption type](https://internal.evergreen.microsoft.com/en-us/topic/servicing-11b-22-kerberos-authentication-fails-when-serviced-by-11b-22-patched-dcs-if-rc4-removed-as-supported-encryption-type-icm-347934573-b671ce7b-cae2-d080-184a-747d02500804)

[11B.22: Kerberos authentication failures related to November 8, 2022 security update](https://internal.evergreen.microsoft.com/en-us/topic/servicing-11b-22-kerberos-authentication-failures-related-to-november-8-2022-security-update-30d3abac-4b5b-2fcc-fda1-3dfaa4f98412)

[11B.22: Populating the high bits of msds-supportedEncryptionTypes without an encryption type causes Kerberos auth failures on 11B-patched DCs. (ICM 351890484)](https://internal.evergreen.microsoft.com/en-us/topic/servicing-11b-22-populating-the-high-bits-of-msds-supportedencryptiontypes-without-an-encryption-type-causes-kerberos-auth-failures-on-11b-patched-dcs-icm-351890484-136073c6-24d6-ad6a-9d85-d24f3c5c2bb9)

[ADDS: Security: How the Kerberos SupportedEncryptionTypes GPO setting is propagated on computer objects in Active Directory](https://internal.evergreen.microsoft.com/en-us/topic/servicing-11b-22-populating-the-high-bits-of-msds-supportedencryptiontypes-without-an-encryption-type-causes-kerberos-auth-failures-on-11b-patched-dcs-icm-351890484-136073c6-24d6-ad6a-9d85-d24f3c5c2bb9)

