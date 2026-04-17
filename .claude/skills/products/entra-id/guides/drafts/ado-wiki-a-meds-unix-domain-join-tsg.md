---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra Domain Services/Microsoft Entra Domain Services - Unix Domain Join Troubleshooting"
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
- Unix
- Linux
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

Microsoft Entra Domain Services Linux domain join failures are generally caused by either invalid credentials, DNS resolution failures, or network connectivity failures to the Microsoft Entra Domain Services domain controllers.  The below steps are recommended for troubleshooting MEDS Unix domain join failures.

[[_TOC_]]

Before beginning these troubleshooting steps, have customer verify they have followed each step of [Join a RHEL VM to Microsoft Entra Domain Services - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/domain-services/join-rhel-linux-vm?tabs=rhel), or [Join an Ubuntu VM to Microsoft Entra Domain Services - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/domain-services/join-ubuntu-linux-vm)

## Verifying DNS Resolution

1. Confirm Microsoft Entra Domain Services domain name, DC IPs, and selected vNET\Subnet from the Azure Portal -> Microsoft Entra Domain Services -> Properties blade

   ![image.png](/.attachments/image-94466afb-379a-4d8d-a8a5-c495f86865ba.png)

2. Verify machine is using the MEDS domain controller Ips for DNS resolvers with cmd

       systemd-resolve --status | grep "DNS Servers:" -A 1

   ![image.png](/.attachments/image-7c874b72-50bd-4d99-842a-cd9a7da8c7d0.png)

3. If they don't match, check the Azure virtual network's DNS Server settings and [Create, change, or delete an Azure virtual network - Azure Virtual Network | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-network/manage-virtual-network#change-dns-servers), then reboot the virtual machine to inherit these DNS servers.

4. Next, verify the client VM can resolve the necessary MEDS LDAP records and domain name successfully with cmds, it should return the in the ANSWER section the two MEDS domain controller IPs

       dig -t SRV _ldap._tcp.domainname.com

   ![image.png](/.attachments/image-6384912d-f6bb-48cd-bdf1-5c53c103605c.png)

   You can also check other basic DNS resolution, such as the domain name itself and verify you can ping the domain name.

       dig domainname.com

   ![image.png](/.attachments/image-8e63f929-f211-457d-a6df-beab0d0bed69.png)


## Verifying Network  Connectivity on Required Ports

5. Verify at minimum that the ports for LDAP (389) , LDAPS (636) , Kerberos (88), RPC (135), DNS (53), and SMB (445) are open and can be connected to via telnet. For full list of ports reference

          telnet domainname.com 389
          telnet domainname.com 636
          telnet domainname.com 88
          telnet domainname.com 135
          telnet domainname.com 53
          telnet domainname.com 445

   ![image.png](/.attachments/image-04c7aff6-813e-4c16-9a38-c4318ab8f396.png)

## Further configuration checks

6. After verifying all the above, and having customer verify they have followed each step of Join a [Join a RHEL VM to Microsoft Entra Domain Services - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/domain-services/join-rhel-linux-vm?tabs=rhel), or [Join an Ubuntu VM to Microsoft Entra Domain Services - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/domain-services/join-ubuntu-linux-vm).

7. You may also be able to find more details on any errors encountered by checking recent entries in syslog with cmd such as

       sudo tail /var/log/syslog

8. If error occurs during KINIT operation of join, request KINIT debug logs by running example cmd below  (w/customer details replaced)
 
       [localadmin@rhelwadtest ~]$ env KRB5_TRACE=/dev/stdout kinit localadmin@JASONFRITTS.ME -V

   NOTE: This will output verbose debug logs for kinit operation, have customer send you these logs for analysis.

8. More indepth troubleshooting of the sssd process that handles AD authentication can be referenced under [Troubleshooting SSSD on Redhat](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/5/html/deployment_guide/sssd-troubleshooting) and [Troubleshooting SSSD on Ubuntu](https://ubuntu.com/server/docs/service-sssd)

## Known Issues

### Scenario: two accounts in Windows AD domain domain.com with the same mailnickname

If two accounts in Azure AD have the same mailnickname, this will be synched to AAD DS as separate SAMAccountNames, one with a random guid appended example:

Account 1:
```
UPN: test@domain.com
SAMAccountName: test (1234)
User logon name (pre-Windows 2000): DOMAIN\test (1234)
```
Account 2:
```
UPN: test@domain2.com
SAMAccountName: test
User logon name (pre-Windows 2000): DOMAIN\test
```

Issue:
   - If you try to kinit with upn test@DOMAIN.COM, kinit will send this to WindowsAD as a request to sign in DOMAIN\test in pre-Windows 2000 login format which is REALM\SAMACCOUNTNAME.  Which in this scenario will try to authenticate to Account 2, not Account 1 and thus if you provide password for Account 1 you will see the kinit error : "Received error from KDC: -1765328360/Preauthentication failed , kinit: Password incorrect while getting initial credentials"

Resolution:

If you wanted to sign in with Account 1, you would need to use command kinit "test (1234)@DOMAIN.COM".

If you wanted to fix the SAMAccountName issue, you would need to follow [AAD DS SAMAccountName Resolution](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183952/Azure-AD-Domain-Services?anchor=resolution%23%23%23%23%23)

## Consulting MSaaS POD Azure IaaS VM Configuration team
9. Lastly, the MSaaS POD Azure IaaS VM Configuration team can be consulted via collaboration task to one of the following support area paths:
   
       Azure/Virtual Machine running Ubuntu/VM Admin ? Linux (Guest OS)/Domain Join issues issue
       Azure/Virtual Machine running Linux/VM Admin ? Linux (Guest OS)/Domain Join issues issue
       Azure/Virtual Machine running RedHat/VM Admin ? Linux (Guest OS)/Domain Join issues issue
