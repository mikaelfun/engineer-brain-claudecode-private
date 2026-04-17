---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra Domain Services/Microsoft Entra Domain Services - Windows Domain Join Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-orgmgt
- cw.AADDS
- cw.TSG
- cw.TSG-AADDS
- cw.comm-orgmgt-tsg
- Windows
- DNS
- Domain-Join
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
<table style="margin-left">
    <tr style="background:#efffff;color:black">
    <td>
      <small>&#128210; <b>Compliance Note</b>: All data in this wiki including videos, screenshots, logs, GUIDs, email addresses, usernames and troubleshooting steps have been obtained from lab test environments and should not be considered confidential or personal data during compliance reviews.</small>
    </td>    
    </tr>
  </table>

Microsoft Entra Domain Services Windows domain join failures are generally caused by either invalid credentials, DNS resolution failures, or network connectivity failures to the Microsoft Entra Domain Service domain controllers.  The below steps are recommended for troubleshooting MEDS windows domain join failures.

[[_TOC_]]


## Verifying DNS Resolution

1. Confirm Microsoft Entra DS domain name, DC IPs, and selected vNET\Subnet from the Azure Portal -> Microsoft Entra Domain Service -> Properties blade

   ![image.png](/.attachments/image-94466afb-379a-4d8d-a8a5-c495f86865ba.png)

2. Verify client machine OS config has DNS resolvers pointing to MEDS domain controller IPS for DNS resolution, via cmd Get-NetIPConfiguration and checking the listed "DNS Servers" to verify they match AAD DS domain controller IPs


   ![image.png](/.attachments/image-7b6b179f-082a-483a-a065-e1e54705011e.png)


3. If it does not match, you MUST update the client VM's [configured vNET\Subnet configuration for "DNS Servers"](https://docs.microsoft.com/en-us/azure/virtual-network/manage-virtual-network#change-dns-servers) to use custom config, fill out AAD DS DC IP addresses found from MEDS properties, save this config and then reboot the client VM to inherit these new DNS resolvers on the OS

   ![image.png](/.attachments/image-9c4ad5a5-eae7-4071-89d7-b24a68ace982.png)


4. After rebooting Azure VM, verify again with Get-NetIPConfiguration to verify the Ips now match MEDS domain controller IPs:

   ![image.png](/.attachments/image-8c62f815-0528-4e04-9586-a37a43395d05.png)


5. Now test basic DNS resolution of the MEDS domain name with the following cmds

       Resolve-DnsName domainname.com

       nltest /dsgetdc:domainname.com /force
    
       nltest /dnsgetdc:domain.com

   The expected resutls will return the Microsoft Entra Domain Service domain controller IPs as found in  Azure Portal -> Microsoft Entra Domain Service -> Properties blade

   ![image.png](/.attachments/image-93887ad1-3ac2-4ac8-9a5b-67f8bcb75209.png)

   ![image.png](/.attachments/image-ce684440-acb1-4b24-ac91-570deda9fe74.png)

6. Test basic SRV records can be resolved via PowerShell cmd below (REPLACE domain.com with their MEDS Domain Name)

       Resolve-DnsName -Name _ldap._tcp.dc._msdcs.domain.com -Type ALL

   ![image.png](/.attachments/image-6cd36256-8522-476b-a6e4-ad4fdada8be3.png)

Additionally review General Windows AD guidance for SRV records https://docs.microsoft.com/en-us/troubleshoot/windows-server/networking/verify-srv-dns-records-have-been-created

## Verifying Network Connectivity On Required Ports

To successfully join an Windows OS to the Microsoft Entra DS domain, the required network connectivity between the Windows OS and MEDS domain controller IPs must be successful.  Review list of required ports for Windows 2008 and later at https://docs.microsoft.com/en-US/troubleshoot/windows-server/identity/config-firewall-for-ad-domains-and-trusts#windows-server-2008-and-later-versions

6. You can also ask customer to download PortQryUI (https://www.microsoft.com/en-us/download/details.aspx?id=24009) on the client machine trying to join Microsoft Entra Domain Service and use the built-in "Domains and Trusts" network test to see if there are any blocked communication ports for domain join communication.  This tool will run through a series of tests to confirm the required network connectivity exists between client OS and the destination IP\domain:

   ![image.png](/.attachments/image-6720c742-b54f-4187-ad9a-e59f8ac7f2dc.png)

## Performing Domain Join

6. Once above has been verified successfully, you can try to join the domain again with PowerShell cmd  

       Add-Computer -DomainName domainname.com

   Once successful, you will be asked to reboot computer and then you can login with Microsoft Entra Domain Service credentials

8. If there are any issues, you can review\request the domain join error log found at **%windir%\debug\Netsetup.log**



## Checking Domain Join Debug Logs

1. Check Windows NetSetup log %windir%\debug\Netsetup.log for any failures or errors
2. Use Err to convert any error codes to human readable form

   ![image.png](/.attachments/image-c8d56500-6368-4896-a006-47011bcd9969.png)

## Verifying Domain Join
To verify a workstation is domain joined and the secure channel to it's domain controller is function use the following sample cmdlets

In command prompt from domain joined VM run the following cmds to verify domain trust:
        
     nltest /trusted_domains
     nltest /dclist:domainname.com
     nltest /dsgetdc:domainname.com
     nltest /sc_query:domainname.com
     nltest /sc_verify:domainname.com

Example of expected output:
     
   ![image.png](/.attachments/image-13c12605-6cc5-4686-963d-d9c7f547eff7.png)

You can then test the workstation's secure channel to this domain with cmd:

       Test-ComputerSecureChannel -Verbose

Example output:

![image.png](/.attachments/image-e9eba618-450a-4093-b7d6-3dce4515cbe4.png)


If there are any issues with the secure channel, you can try repairing it with cmds:

       Test-ComputerSecureChannel -Repair -Credential(Get-Credential)
       or
       Reset-ComputerMachinePassword

## Install Domain Management tools to perform MEDS Management Activities

1. Once domain joined, you can quickly install RSAT tools for Active Directory, DNS, and Group Policy management with:

       Get-WindowsCapability -Name RSAT*ActiveDirectory* -Online | Select-Object -Property Name, State |Add-WindowsCapability -Online
       Get-WindowsCapability -Name RSAT*DNS* -Online | Select-Object -Property Name, State |Add-WindowsCapability -Online
       Get-WindowsCapability -Name RSAT*GroupPolicy* -Online | Select-Object -Property Name, State |Add-WindowsCapability -Online

Then open one of these tools to begin reviewing\managing your MEDS domain

# Data Collection

To collect MEDS diagnostic data please follow [Azure AD Domain Services Authentication Data Collection](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/641268/Azure-AD-Domain-Services-Authentication-Data-Collection) guide.
  

# Known Issues
## NTLM Password Hash Sync Disabled
If the customer has updated their [Secure Microsoft Entra Domain Services - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/domain-services/secure-your-domain#use-security-settings-to-harden-your-domain), the following issues may occur because the user's will have no NTLM password hash present.  Any attempt to authenticate via NTLM will fail.

1. Remote Desktop from a non-MEDS joined client machine to a MEDS joined target server will fail.  

   - Cause:  The target server has NLA (Network Level Authentication) by default which requires Kerberos authentication, but because the client machine is not domain joined it cannot request a Kerberos ticket for the target server.  The client machine will revert to NTLM auth but this will also fail because NTLM hash sync has been disabled.

   - Workarounds :
      - Domain join the client machine
      - [Re-enable NTLM password hash sync](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/secure-your-domain#use-security-settings-to-harden-your-domain), then update user password via https://aka.ms/aadprofile to force NTLM password hash generation
      - RDP with local admin account to target machine, then use RunAs to launch PowerShell under domain creds.

2. Unable to use RSAT admin tools from mgmt VM to connect to DNS management console via either the IP addresses or by managed domain name.  Receive "Access was denied" error.  When reviewing a Wireshark trace of this error, you may see it as a Kerberos TGS-REQ failure for unknown SPN "DnsServerApp"

     - Cause: Connecting via domain name or IP address requires NTLM authentication, using domain name \ IP address will cause Kerberos lookup of service principal names to fail as these are not unique names on the domain so SPN cannot be found.

      - Workarounds : 
          - Run 'nltest /dclist:<domain>' to get a list of DCs and then add the fully qualified hostname of the DC to the DNS Manager instead. This will allow Kerberos to find SPNs directly and not require NTLM auth.
          - If connecting via managed domain name works but IP address doesn't, [create a reverse lookup zone](https://activedirectorypro.com/configure-dns-reverse-lookup-zones-ptr-records/) for the DCs IP Addresses, and create PTR records to point their IP address to the FQDNs.  This will allow Kerberos to find SPN by doing reverse IP lookup and finding DC hostnames.

3. If the MEDS user principal name's suffix doesn't match the MEDS domain name, attempting to join a client machine to the MEDS domain will fail and the user account will be locked out.

     - Cause: When attempting to join MEDS domain name aaddsexample.com with user name user@example.com the domain join client will attempt to find Kerberos servers via lookup of the user's domain suffix.  In this example, that is example.com and this DNS lookup will fail.  The domain join client will fall back to NTLM auth and this will also fail (due to no NTLM password hash) and lock the user account out.

     - Workarounds :
        - The user can attempt to authenticate using user@aaddsexample.com instead of user@example.com so Kerberos server is found and Kerberos auth can be used.
        - A different user account whose UPN suffix matches the MEDS domain name can be used to perform the domain join.
        - [Re-enable NTLM password hash sync](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/secure-your-domain#use-security-settings-to-harden-your-domain), then update user password via https://aka.ms/aadprofile to force NTLM password hash generation
   
### Troubleshooting NTLM Auth
1. Confirm that the customer has disabled\enabled NTLM auth via Azure Support Center -> Resource Explorer -> AAD DS resource -> Security section 

   Example: 

   ![image.png](/.attachments/image-12a9c721-7a8c-49a7-82d5-113d856d586a.png)

2. Ask customer to reproduce the sign in failure and confirm the username, timestamp, and tenant ID
3. Review AAD DS security event logs using Jarvis query example : https://portal.microsoftgeneva.com/s/CF8B8B63 update the timestamp, tenant ID and username field to match customer repro.
4. Review security events for either of the following Event IDs
   
   Event ID 4776 (Authentication Package: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0) <br>
   Event ID 4625 (Logon Process = NTLM)

5. Request TA or EEE team to review user properties in DS Explorer to confirm if the user account has a "WindowsLegacyCredentials" attribute indicating the presense of a NTLM password hash.

6. Request customer repro the sign in failure and collect a https://aka.ms/networkcapture for review.  Using network monitor or wireshark, review the failure protocol to determine if Kerberos or NTLM protocol led to the failure.

<br><br><br>
# Escalations

1. Collect the following data to assist in escalations
      
    a. NetSetup log %windir%\debug\Netsetup.log from the client machine having domain join problems

    b. https://aka.ms/networktrace from the client machine having domain join problems.

    c. Output from [PortQry UI when performing Domains and Trusts test](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/343280/Azure-AD-Domain-Services-Windows-Domain-Join-Troubleshooting?anchor=verifying-network-connectivity-on-required-ports) on the client machine to MEDS domain name

    d. MEDS user name, client machine details (IP address, vNET, subnet) and timestamp of when domain join was performed

    e. Link to your AVA chat discussion in [ Microsoft Entra Domain Services](https://teams.microsoft.com/l/channel/19%3A4af5b0bef0744592a0d4258a9aff9295%40thread.skype/Microsoft%20Entra%20Domain%20Services?groupId=56c43627-9135-4509-bfe0-50ebd0e47960&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) requesting assistance with troubleshooting
