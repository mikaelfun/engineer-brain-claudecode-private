---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow: Common Solutions to Replication Failures/Error 5 - Access Denied"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FWorkflow%3A%20Common%20Solutions%20to%20Replication%20Failures%2FError%205%20-%20Access%20Denied"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423184&Instance=423184&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423184&Instance=423184&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a comprehensive guide to troubleshooting and resolving Active Directory replication error 5: Access is denied. It covers potential causes, symptoms, and detailed resolution steps to address the issue effectively.

**Error 5 translates to Access Denied.**

This problem occurs when the Domain Controller (DC) gets an access denied error with its replication partner when establishing the replication link.

It can happen:
- When replicating (automatic or forced) over an existing replication link.
- When the Knowledge Consistency Checker (KCC) establishes a replication link.

[How to troubleshoot Active Directory replication error 5 in Windows Server: Access is denied](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/replications-fail-with-error-5)

## Causes

This error can have multiple causes (not an exhaustive list):
- Time not synced
- Service Principal Name (SPN) not published
- Secure channel broken
- Trust issue
- Incorrect registry keys values (KDCNames / CrashOnAuditFail / RestrictRemoteClients)
- Configuration mismatch (SMB signing / LMCompatibility)
- Missing user rights assignments ("Access this computer from network")
- Network issue (firewall)

---

## Symptoms

**DCDIAG**

Reports that Active Directory Replications test has failed with error status code (5): "access is denied"
````
Testing server: <site name>\<destination dc name>

           The replication generated an error (5): Access is denied.

DCDIAG reports that DsBindWithSpnEx() failed with error 5
````
REPADMIN.EXE reports that the last replication attempt has failed with status 5.
REPADMIN commands that commonly cite the 5 status include but are not limited to:
- REPADMIN /KCC
- REPADMIN /REPLICATE
- REPADMIN /REPLSUM
- REPADMIN /SHOWREPL
- REPADMIN /SHOWREPS
- REPADMIN /SYNCALL

**NTDS KCC, NTDS General** or **Microsoft-Windows-ActiveDirectory_DomainService** events with the 5 status are logged in the directory service event log.

Active Directory events that commonly cite the 8524 status include but are not limited to:
````
NTDS General
1655 Active Directory attempted to communicate with the following global catalog and the attempts were unsuccessful.
````
````
NTDS KCC
1925 The attempt to establish a replication link for the following writable directory partition failed.
````
````
1926 The attempt to establish a replication link to a read-only directory partition with the following parameters failed
````

The "replicate now" command in Active Directory Sites and Services returns "Access is denied."

Right-clicking on the connection object from a source DC and choosing "replicate now" fails with "Access is denied." The on-screen error message text and screenshot are shown below:
````
Dialog message text: The following error occurred during the attempt to synchronize naming context <%directory partition name%> from Domain Controller <Source DC> to Domain Controller <Destination DC>:
Access is denied
The operation will not continue
````

The "replicate now" command in Active Directory Sites and Services (DSSITE.MSC) failing with error 5: access is denied"

## Resolution

You should start by checking that the required configuration is correct or known issues are not present:

**DCDIAG**

DCDIAG /TEST:CheckSecurityErrors was written to perform specific tests (including an SPN registration check) to troubleshoot Active Directory operations replication failing with error 5: access is denied and error 8453: replication access was denied but is NOT run as part of the default execution of DCDIAG.
![image.png](/.attachments/image-16e3041d-d4fd-4943-ba71-d47b9c17fa18.png)

Run DCDIAG on the destination DC
Run DCDIAG /TEST:CheckSecurityError
Resolve any faults identified by DCDIAG. Retry the previously failing replication operation

- **User right assignments: "Access this Computer from the Network"**
Check on each DC that the "Access this Computer from the Network" right is properly assigned to "Everyone" and "Enterprise Domain Controllers."
This right is normally granted by the Group Policy Object (GPO) 'Default Domain Controllers Policy' applied on 'Domain Controllers' OU. To verify this, use GPMC.MSC, select the Domain Controllers OU, and click on Settings:
![image.png](/.attachments/image-45883a8f-e067-4377-acc9-fbd491cbb853.png)

In a default installation of Windows, the default domain controllers policy is linked to the domain controllers OU containing which grants the "access this computer from network" user right to the following security groups:

| Local Policy | Default Domain controllers policy |
|--------------|-----------------------------------|
| Administrators | Administrators |
| Authenticated Users | Authenticated Users |
| Everyone | Everyone |
| Enterprise Domain Controllers | Enterprise Domain Controllers |
| [Pre-Windows 2000 compatible Access] | [Pre-Windows 2000 compatible Access] |

If Active Directory operations are failing with error 5: "access is denied," verify that:
- Security groups in the list above have been granted the "access this computer from network" right in default domain controllers policy.
- Domain controller computer accounts are located in the domain controllers OU.
- Default domain controllers policy is linked to the domain controllers OU or alternate OUs hosting computer accounts of DCs.
- "Deny Access this computer from network" user right has NOT been enabled or does not reference failing direct or nested groups.
- Group policy is applying on the destination domain controller currently logging error 5 using gpresult /Z.
- Policy precedence, blocked inheritance, WMI filtering, or the like is NOT preventing the policy setting from applying to DC role computers.

**Note**: Local policy takes precedence over policy defined in Sites, Domains, and OU.

**If it misses 'Everyone' or 'Enterprise Domain Controllers', add them, then make a policy refresh by: gpupdate /force**

**Note**: At one time it was common for administrators to remove the "enterprise domain controllers" and "everyone" groups from the "access this computer from network" right in default domain controllers policy. Removing both is fatal. **There is no reason to remove "enterprise domain controllers" from this right as only DCs are a member of this group.**

**Incorrect registry keys:**

RestrictRemoteClients value is set to 2
- This registry value RestrictRemoteClients is set to a value of 0x2 in
- HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\RPC
- To resolve this:
  - Disable the policy that enforces this setting.
  - Delete the RestrictRemoteClients registry setting and reboot.
- The RestrictRemoteClients registry value is set by the following group policy setting:
- Computer Configuration\Administrative Templates\System\Remote Procedure Call - Restrictions for Unauthenticated RPC clients
- A registry value of 0x2 is applied if the policy setting is enabled and set to Authenticated without exceptions.
- This option allows only authenticated RPC clients to connect to RPC servers running on the computer on which the policy setting is applied; it does not permit exceptions. If you select this option, a system cannot receive remote anonymous calls using RPC. This setting should never be applied to a domain controller.

More information on this setting is available:  
[DsBindWithSpnEx() failed with error 5, Access is denied.](https://internal.evergreen.microsoft.com/topic/dd39a034-bdf8-a86c-f862-e076b5542508)

[All known issues caused by enabling group policies "Restrictions for unauthenticated RPC clients" and "RPC endpoint mapper client authentication"](https://internal.evergreen.microsoft.com/topic/6ef9bebd-ebbd-b874-f7c0-b407b743c408)




**CrashOnAuditFail value is set to 2**

AD Replication fails when HKLM\System\CurrentControlSet\Control\LSA\CrashOnAuditFail = has a value of "2".  
A CrashOnAuditFail value of 2 is triggered when the "Audit: Shut down system immediately if unable to log security audits" setting in Group Policy has been enabled AND the local security event log becomes full.

Active Directory domain controllers are especially prone to maximum capacity security logs when auditing has been enabled AND the size of the security event log has been constrained by the "Do not overwrite events (clear log manually)" or "Overwrite as needed" options in Event Viewer or group policy equivalents.

**User Action if HKLM\System\CCS\Control\LSA\CrashOnAuditFail = 2:**
- Clear the security event log (save to alternate location as required)
- Re-evaluate any size constraints on the security event log, including policy-based settings.
- Recreate "CrashOnAuditFail (REG_DWORD) = 1
- Reboot

**On seeing a CrashOnAuditFail value of 0 or 1, some CSS engineers have resolved "access is denied" errors by again clearing the security event log, deleting the CrashOnAuditFail registry value, and rebooting the destination DC.**

<br/>

**Excessive Time Skew**

Kerberos policy settings in the default domain policy allow for a 5-minute difference (default value) in system time between Key Distribution Center (KDC) domain controllers and a Kerberos target server to prevent replay attacks. Some documentation states that time between the client and the Kerberos target must have time within 5 minutes of each other. Others state that in the context of Kerberos authentication, the time that matters is the delta between the KDC used by the caller and the time on the Kerberos target. Also, Kerberos doesn't care that system time on the relevant DCs matches current time, only that relative time difference between the KDC and target DC is inside the (default 5 minutes or less) maximum time skew allowed by Kerberos policy.

In the context of Active Directory operations, the target server is the source DC being contacted by the destination DC. Every domain controller in an Active Directory forest (currently running the KDC service) is a potential KDC so you'll need to consider time accuracy on all other DCs against the source DC including time on the destination DC itself.

Two methods to check time accuracy include:
````
C:\>DCDIAG /TEST:CheckSecurityError
````

AND

````
C:\>W32TM /MONITOR
````

Look for LSASRV 40960 events on the destination DC at the time of the failing replication request that cite a GUIDed CNAME record of the source DC with extended error 0xc000133: "the time at the Primary Domain Controller is different than the time at the Backup Domain Controller or member server by too large an amount."

Network traces capturing the destination computer connecting to a shared folder on the source DC (as well as other operations) may show the on-screen error "an extended error has occurred." while a network trace shows:

````
KerberosV5 KerberosV5:TGS Request Realm:   <- TGS request from source DC
Kerberosvs Kerberosvs:KRB_ERROR - KRB_AP_ERR_TKE_NVV (33)   <- TGS response where "KRB_AP_ERR_TKE_NYV-  maps to "Ticket not yet valid"
````

The TKE_NYV response indicates that the date range on the TGS ticket is newer than time on the target, indicating excessive time skew.

**Note**: W32TM /MONITOR only checks time on DCs in the test computer's domain so you'll need to run this in each domain and compare time between the domains.

**Note**: if system time was found to be inaccurate, make an effort to figure out why and what can be done to prevent inaccurate time going forward. Was the forest root PDC configured with an external time source? Are reference time sources online and available on the network? Was the time service running? Are DC role computers configured to use NT5DS hierarchy to source time? Was time rollback protection described in MSKB 884776 in place? Do system clocks have good batteries and accurate time in the BIOS? Are virtual host and guest computers configured to source time correctly?

**Note**: When the time difference is too great on destination DCs, the "replicate now" command in DSSITE.MSC fails with the on-screen error "There is a time and/or date difference between the client and the server." This error string maps to error 1398 decimal / 0x576 hex with symbolic error name ERROR_TIME_SKEW.

Related Content:
[Setting Clock Synchronization Tolerance to Prevent Replay Attacks](https://learn.microsoft.com/previous-versions/windows/it-pro/windows-server-2003/cc784130(v=ws.10))

**SMB signing mismatch**

Policy setting / Registry Path:

- Microsoft network client: Digitally sign communications (if server agrees)
  - HKLM\SYSTEM\CCS\Services\Lanmanworkstation\Parameters\Enablesecuritysignature
- Microsoft network client: Digitally sign communications (always)
  - HKLM\SYSTEM\CCS\Services\Lanmanworkstation\Parameters\Requiresecuritysignature
- Microsoft network server: Digitally sign communications (if server agrees)
  - HKLM\SYSTEM\CCS\Services\Lanmanserver\Parameters\Enablesecuritysignature
- Microsoft network server: Digitally sign communications (always)
  - HKLM\SYSTEM\CCS\Services\Lanmanserver\Parameters\Requiresecuritysignature

**Focus on SMB signing mismatches between the destination and source domain controllers with the classic cases being the setting enabled or required on one side but disabled on the other.**

**Note**: internal testing showed SMB signing mismatches causing replication to fail with error 1722: The RPC Server is unavailable.

<br/>

**Invalid secure channel / Password mismatch**

Validate the secure channel with "nltest /sc:query" or "netdom verify."

User Action:
- Disable the KDC service on the DC being rebooted
- From the console of the destination DC, run NETDOM RESETPWD to reset the password for the destination DC
- ````
  c:\>netdom resetpwd /server: server_name /userd: domain_name \administrator /passwordd: administrator_password
  ````
- Ensure that likely KDCs AND the source DC (if in the same domain) inbound replicate knowledge of the destination DC's new password.
- Reboot the destination DC to flush Kerberos tickets and retry the replication operation.
- If replication is working, re-enable KDC service

<br/>

**Invalid trust**

If AD replication is failing between DCs in different domains, verify trust relationships health along the trust path.

When able, use the NETDOM Trust Relationship test to check for broken trusts.

For example, if you have a multi-domain forest containing, root domain Contoso.COM, child domain B.Contoso.COM, grandchild domain C.B.Contoso.COM, and "tree domain in the same forest" Fabrikam.COM where replication is failing between DCs in grandchild domain C.B.Contoso.COM and tree domain Fabrikam.COM, then verify trust health between C.B.Contoso.COM and B.Contoso.COM, B.Contoso.COM and Contoso.COM, and finally Contoso.COM and Fabrikam.COM.

If a shortcut trust exists between the destination domains, the trust path chain does not have to be validated. Instead, validate the shortcut trust between the destination and source domain.

Check for recent password changes to the trust with "Repadmin /showobjmeta * <DN path for TDO in question>"

Trusted Domain Object (TDO)

Verify that the destination DC is transitively inbound replicating the writable domain directory partition where trust password changes may take place.

**Commands to verify trusts:**

````
Powershell : Get-ADTrust -Identity adforest2.com
ObjectClass : trustedDomain
````

````
netdom trust <TrustingDomainName> {/d: | /domain:} <TrustedDomainName> [{/ud: | /userd:}[<Domain>\]<User> [{/pd: | /passwordd:}{<Password>|*}] [{/uo: | /usero:}<User>] [{/po: | /passwordo:}{<Password>|*}] [/verify]
````

Example:
````
netdom trust /d:adforest2 adforest1 /userd:adforest2\boss1 /passwordd:xxx /usero:adforest1\administrator /passwordo:xxx /verify
````

Commands to reset trusts:
From root domain PDC:
````
netdom trust <Root Domain> /Domain:<Child Domain> /UserD:CHILD /PasswordD:* /UserO:ROOT /PasswordO:* /Reset /TwoWay
````

From Child domain PDC:
````
netdom trust <Child Domain> /Domain:<Root Domain> /UserD:Root /PasswordD:* /UserO:Child /PasswordO:* /Reset /TwoWay
````

**Invalid Kerberos realm - KdcNames**

User Action:
- On the console of the destination DC, run "REGEDIT"
- Locate the following path in the registry: HKLM\system\ccs\control\lsa\kerberos\domains
- For each <fully qualified domain> under HKLM\system\ccs\control\lsa\kerberos\domains, verify that the value for "KdcNames"
- refers to a valid external Kerberos realm and NOT the local domain or another domain in the same Active Directory forest.

**Network adapters with "IPv4 Large Send Offload" enabled:**

User Action:
- Open Network Adapter card properties
- Select Configure button
- Select Advanced tab
- Disable "IPv4 Large Send Offload"
- Reboot

If all those settings and known issues have been verified, but the error is still thrown, make sure that the DC retrieves a new ticket from another DC which is responding correctly.
For this:
- Stop the KDC service on all DCs in the domain that is causing the problem and from which the impacted DC is likely to pick up a ticket by:
  - ````
    net stop KDC
    ````
  - If it can't stop, set the service to disable and reboot the DC.
- Purge the Kerberos ticket with Klist: ````
  klist -li 0x3e7 purge
  ````
  - If the 0xc00000fe error is returned, set the KDC start-up to 'Disable', reboot the DC, and restart the ticket purge command.
- Reset the DC's password on the Emulator PDC by:
  - ````
    netdom resetpwd /server: 'PDC emulator name' /userd:<domain>-administrator /passwordd:
    ````
- Don't forget to precede the username by the domain name. Otherwise, netdom returns without displaying anything.
  - ````
    Example: netdom resetpwd /server:PDC /userd:dom1-administrator /passwordd:
    ````
  - ````
    The machine account password for the local machine has been successfully reset.
    ````
  - ````
    The command completed successfully.
    ````
- If the command is not successful or returns an error such as "Logon failure, the target account name is incorrect," verify that the DC's computer account is that of this DC.
- If the DC is not directly a replication partner with the PDC, synchronize the domain partition between its replication partner and the PDC so that the change in the computer account password is replicated :  
`repadmin /sync DC-<domain>,DC-<company>,DC-com`

- The PDC emulator's 'NTDS Settings' Object Guid can be viewed in the area (as "ObjectGuid")

- It is also possible to force the replication of the domain partition between the Emulator PDC and the replication partner by:  
`repadmin /add 'Domain NC' 'Replication partner FQDN' 'PDC Emulator FQDN' /u:<domain> administrator /pw:`

Once the replication partner has synced with the emulator PDC, the replication must work properly between the DC and its replication partner.

Do the following to check it out:
 - Reset the replication link by: repadmin /kcc >This should automatically trigger a replication.
 - If the replication link was correctly created, the KCC recorded Event 1264.
 - Then check by repadmin/showreps that the replication went smoothly. The replication of the different partitions can be forced by repadmin/sync to ensure that it is going smoothly.
 - If the error is still an "Access denied," force the creation of a replication link between the DC and its replication partner, for each partition by:

`repadmin /add 'Configuration NC' 'Local DC FQDN' 'Replication partner FQDN' /u:<domain>-administrator /pw:` 

Example:


```
Repadmin /add CN-Configuration,DC-company,DC-com %computername%.dom1.company.comHubDC.dom1.company.com/u:dom1-administrator /pw: 
One-way replication from source:HubDC.dom1.company.com to dest:DC1.dom1.company.com established. 
 
repadmin /add CN-SHEMA,CN-Configuration,DC-company,DC-com %computername%.dom1.company.comHubDC.dom1.company.com/u:dom1-administrator /pw: 
One-way replication from source:HubDC.dom1.company.com to dest:DC1.dom1.company.com established. 

repadmin /add DC-company,DC-com %computername%.dom1.company.comHubDC.dom1.company.com/u:dom1-administrator /pw: 
One-way replication from source:HubDC.dom1.company.com to dest:DC1.dom1.company.com established.
```