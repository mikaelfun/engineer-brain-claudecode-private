---
source: ado-wiki
sourceRef: "Supportability\AzureAD\AzureAD;C:\Program Files\Git\GeneralPages\AAD\AAD Account Management\Microsoft Entra Domain Services\Microsoft Entra Domain Services Resource Forest"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Microsoft%20Entra%20Domain%20Services/Microsoft%20Entra%20Domain%20Services%20Resource%20Forest"
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
- Resource-Forests
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
 

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Account-Management](/Tags/AAD%2DAccount%2DManagement) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AzureAD](/Tags/AzureAD)  
 


[[_TOC_]]




# Overview
Microsoft Entra Domain Services is being expanded to allow resource forests, to further align feature parity with the on-premises world of Microsoft Entra Domain Services. A resource forest is a mechanism that allows users in one forest to access resources in a different forest. By traversing the trust path, user authentication can flow to the trusted forest.

# What's new?

## April 10, 2023

You can now create trusts on both user and resource forests. On-premises AD DS users cannot authenticate to resources in the Microsoft Entra Domain Services resource Forest until you create an outbound trust to your on-premises AD DS. An outbound trust requires network connectivity to your on-premises virtual network to which you have installed Microsoft Entra Domain Services. On a user forest, trusts can be created for on-premises AD forests that are not synchronized to Microsoft Entra Domain Services.


# Features

You use a resource forest predominately for application/workload authentication.

**Authentication:** Users continue to sign-in using your on-premises Active Directory Domain Services but authenticate to applications and workloads (resources) hosted in the Microsoft Entra Domain Services by way of a one-way outbound forest trust to the on-premises Active Directory Domain Services using either a site-to-site virtual private network (VPN) or preferably an ExpressRoute.

Users sign-in using your on-premises Active Directory Domain Services, in a Microsoft Entra Domain Services resource Forest, users authenticate over a one-way forest trust from their on-premises AD DS. 

With this approach, the on-premises user objects and password hashes aren't synchronized to MEDS. The user objects and credentials only exist in the on-premises AD DS. For more details: [How trusts work for Microsoft Entra Domain Services](https://learn.microsoft.com/en-us/entra/identity/domain-services/concepts-forest-trust).

**Administration:** User sign-in to a resource forest should be limited only to users who need to manage resources in the resource forest. For this reason, resource forests only receive copies of cloud users, groups, and group memberships, which can be filtered using scoped synchronization.

Resource forests are ideal when your organization cannot take advantage of password hash synchronization, exclusively uses smart cards for user authentication, or has complicated application platforms that may need to be lifted to Azure in phases.

# Case handling

| Scenario  / Technology                  | CSS Team                   | Potential Collaborators    | Troubleshooting steps / Data to  provide when asking for collaboration |
| --------------------------------------- | -------------------------- | -------------------------- | ------------------------------------------------------------ |
| Configure Trust                         | AAD Account management     | Windows Directory Services |                                                              |
| Verify Trust                            | AAD Account management     | Windows Directory Services | error messages, network captures  from DC verifying the trust |
| Name Resolution                         | Windows Networking         |                            | error messages, network captures  from the client workstation |
| User authorization in resource  forest  | AAD Account management     | Windows Directory Services | Verify ACLs on resource - verify  connectivity to the trusted domain |
| User authentication in  resource forest | AAD Account management     | Windows Directory Services | verify trust. Verify  connectivity to trusted domain         |
| Connectivity between forests            | Azure Networking (problem) |                            |                                                              |
| Conditional forwarding DNS              | Windows Networking         | Windows Directory Services |                                                              |
| trust password complexity               | Windows Directory Services |                            |                                                              |
| Domain Join                             | AAD Account management     | Windows Directory Services | error messages, network  captures, netsetup.log from client  |
| Port requirements                       | AAD Account management     | Windows Directory Services | verify ports with portqueryUI or  network captures showing failures. Verify network security group is  configured correctly |



# Limitations
- One-way trust.
- Forest trust only.
- Full authentication. No selective authentication.
- 2012 R2 Kerberos features.

What is selective auth? https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc755321(v=ws.10)?redirectedfrom=MSDN#selective-authentication 

What are 2016 Kerberos enhancements? https://docs.microsoft.com/en-us/windows-server/security/kerberos/whats-new-in-kerberos-authentication 


# How to configure and manage

## Prerequisites

Here are our prerequisites:
- Microsoft Entra ID tenant
- Only one MEDS instance per tenant
- Continuous network connectivity to your on-premises Active Directory Forest
- Continuous name resolution between your MEDS resource forest name and you're on-premises Active Directory Forest name

## Network planning and considerations

Plan the appropriate networking topology:
- Use private IP addresses
- Avoid overlapping IP address spaces to allow virtual network peering and routing
- Azure virtual networks need a gateway subnet to configure site-to-site(S2S) VPNs or ExpressRoutes
- Create subnets with enough IP addresses to support your deployment
- Microsoft Entra Domain Services has its own subnet

**Network Examples**

| Purpose         | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| MEDS subnet   | This subnet exclusively hosts the Microsoft Entra Domain Services resource Forest |
| Workload subnet | This subnet hosts Azure virtual machines that host your virtualized applications and resources |
| Gateway subnet  | The subnet hosts the termination point for Azure VPN and/or Azure ExpressRoute, if applicable |





![vpn.png](/.attachments/AAD-Account-Management/267461/vpn.png)

## Network configuration links

Here are more details on configuring the network:

For details on Azure Site-to-Site VPN, read [What is Azure VPN Gateway](https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways).  

For details on Azure ExpressRoute, read the [ExpressRoute Overview](https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways).  

For details on connecting AWS VPC to Azure, read What is [AWS Site-to-Site VPN](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html).

## Forest names and DNS
Establishing a trust requires network connectivity and name resolution

The resource forest locates domains and domain controllers using DNS 

The MEDS resource forest name MUST be different from the on-premises Active Directory forest, any child domains, and any other trusted forest names. 

Microsoft recommends a unique forest name as shown in the following image. In this example the resource forest is rf.aaddsconsoto.com and the trusted, on-premises domain is corp.contoso.com.

![UpdatedTrustimage.jpg](/.attachments/AAD-Account-Management/267461/UpdatedTrustImage.jpg)


## Predeployment summarized checklist

1. Verify the network settings for MEDS virtual network match those from your planning. 
2. Verify the settings on your MEDS and workload subnets match those from your planning.
3. Deploy an admin server VM to your workload subnet. 
4. Connect your on-premises network to Azure using either using Azure VPN or Azure ExpressRoute.
5. Validate networking connectivity between your on-premises network and the Azure virtual network.
6. [Update DNS settings for the Azure virtual network](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-dns) (note the DNS servers for later use when configuring on-premises AD trust.) Write these down.
7. [Enable password hash sync to the managed domain for cloud-only users](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-password-sync#task-5-enable-password-hash-synchronization-to-your-managed-domain-for-cloud-only-user-accounts).
8. Restart the standalone server for it to update its DNS entries.
9. Logon to the standalone server and use nslookup with the resource forest DNS name to verify connectivity.  It should return two IPs for the resource forest DCs. We will see some examples of this in a later slide.
10. Using the Microsoft Entra Domain Services admin credentials, join the standalone VM to the MEDS Resource Forest.  See [Tutorial: Join a Windows Server virtual machine to a managed domain](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/join-windows-vm#step-3-join-the-windows-server-virtual-machine-to-the-azure-ad-ds-managed-domain) for help and use the [Troubleshoot domain-join issues](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/join-windows-vm#troubleshoot-domain-join-issues) for any domain join issues.


# Troubleshooting
Here are things to investigate when having problems creating the trust:
- Name resolution  
- DNS conditional forwarders
- Well known ports ? Network Security Group
- Group membership in the Trusted Domain -  Must be a member of the **Enterprise Admins Group** or the **Domain Admins Group** in the forest root or have delegated the rights to create trusts.

1. Utilize a MEDS query like https://portal.microsoftgeneva.com/s/E25F55EB (replace customer Tenant ID and Timeframe) to find any errors or warnings logged in MEDS logs when customer tries to create a trust.

2. Use nslookup.exe to verify proper name resolution on both sides of the trust. If this fails it must be corrected before continuing.


2. Verify connectivity by using **nltest.exe** to locate a DC on the other side of the trust.  If that succeeds, then ping it by FQDN to see if we can resolve it. Remember, name resolution is key in a trust.  Without it you will fail.

   ![2019-11-13_10-09-44.png](/.attachments/AAD-Account-Management/267461/2019-11-13_10-09-44.png)

3. Can we add a trusted user to a resource? Object picker should allow us to add a user from the trusted domain to a resource in the trusting domain.

   ![2019-11-13_10-23-09.png](/.attachments/AAD-Account-Management/267461/2019-11-13_10-23-09.png)

4. Ping the forest root domain by name from the other forest. The other forest's DNS server should reply. For example: From the corp.contoso.com domain, ping the aaddsrf.corp.contoso.com domain name. One of the authoritative DNS servers for aaddsrf.corp.contoso.ml should reply.

5. If you can't ping the domain name, ping a DC in the other forest by name, then IP address if the name fails.
6. Be sure network connections are working. Ping the IP address, other machines on the subnet, etc. 

    **If you can't ping the address, it's a network issue.** 

    **If you can ping the address but can't ping the name, it's a DNS issue.**

7. Ensure the SRV records for the DC in the on-premises forest are registered properly.

## Utilize MEDS DomainTcpPortChecks Scripts

MEDS EEE Ming Chen has written a PowerShell script to help debug AAD DS Trust Creation cases

1. Download script from https://github.com/mingchen-script/DomainTcpPortChecks
2. Usage

   * Enter the target domain name. The script will then run a test-netconnection on AD and RPC ports against all domain controllers (DCs) in that domain.

   * ![image.png](/.attachments/image-c798718b-dcb4-4d65-bcd1-af9f5c0e37b1.png)

3. Suggested steps for troubleshooting AD ports are open for trust creation

   1. Check ports are open from MEDS to OnPrem:

      * Run DomainTcpChecksv3 against the OnPrem domainName from the MEDS management VM. (Make sure that the VM is on the same vNet as the DC and is using AADDS DCs as DNS servers.)
      * For example, if OnPrem domain name is OnPremRepro.com , run `.\DomainTcpChecksV3.ps1 -DomainName OnPremRepro.com`

   2. Check ports are open from OnPrem to MEDS:

      * Run DomainTcpChecksv3 against MEDS domainName from all onPrem DCs. It is important to perform port checks on all OnPremDomain's DCs as DCs need to communicate with each other on both sides of trust.
      * For example, if MEDS domain name is AADDSRepro.com, run `.\DomainTcpChecksV3.ps1 -DomainName AADDSRepro.com`

   3. Tip: ask customer to pipe the output to a text file, upload all results to verify ports are open on all DCs. (Trust but verify)
       
      * Look for **"open"** for working case. **"Unreachable"** for non-working case.
          

## Test Required Network Connectivity with PortQryUI

To create a Active Directory trust, the ports required for connectivity are documented @ [Configure firewall for AD domains and trusts](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/config-firewall-for-ad-domains-and-trusts#windows-server-2008-and-later-versions).  To test that this connectivity is open, a customer can use a tool called PortQryUI .

Test network connectivity from both networks (on-prem and Azure) by running these steps on both an on-premise AD domain controller pointing to the domain services domain name, as well as from an Azure Virtual Machine on the same MEDS subnet network as MEDS is connected to .

1. Download PortQryUI from https://www.microsoft.com/en-us/download/details.aspx?id=24009 to a client machine on the network you want to test connectivity from
2. Open PortQryUI.exe and extract to ex. C:\PortQryUI
3. Open C:\PortQryUI\portqueryui.exe
4. Enter domain name in the FQDN to query input (use the on-prem AD domain name to test Azure to Onprem connectivity, use MEDS domain name to test Onprem to Azure connectivity)
5. Select the Query type = service to query = "Domains and Trusts"
6. Choose Query button to execute test, if there are any popups choose Retry or Ignore

     ![image.png](/.attachments/image-415b377f-fa41-4a02-a8de-b45cbb3df75c.png)

7. When test is complete, choose File -> Save Result -> Save result.txt to Desktop etc.

     ![image.png](/.attachments/image-b2df4e9e-7b5e-4883-99eb-cf1e8fd9d4ba.png)

8. Upload result.txt to support case file transfer
9. Perform this same test from both an on-prem AD domain controller to MEDS domain name, and an Azure VM (on MEDS subnet) to the on-prem AD domain name.

## Troubleshooting tools

- Network traces to analyze traffic flows and authentication
- PortqueryUI.exe to check for blocked ports
- Nltest.exe /trusted_domains to list trusts
- Nslookup.exe to verify name resolution

Here are some of the terms used in trusts:

- Trusted Domain or Forest ? is the domain or forest where the users are authenticated.
- Trusting Domain or Forest ? is the domain or forest where the resources reside.

    **Note: TrustED / TrustING ? Ed is the user, Ing has the things.**




## Service Log Queries

You can locate the MEDS service log for trust creation failures by using this example query: https://portal.microsoftgeneva.com/s/F99A5886 . Update the contextID filter to match your customer's Entra ID tenant ID, then update the timerange to match when customer received trust creation failure. The results should provide a resultSignature column with the reason for the failed trust creation. Once you find the error, copy activityId and search in TraceEvent to get more information https://portal.microsoftgeneva.com/s/DD5FF154 
 (look for ErrorMessage)

- If you see "**The RPC server is unavailable**", check if customer had set HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters\ **EncryptData=1**, on their OnPrem DC.
- - if EncryptData=1, temp set it to zero, reboot onPrem DC. Redo trust creation. Once trust is created, set EncryptData back to 1 if needed. 
https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-security

- - - MSFT internal https://internal.evergreen.microsoft.com/en-us/topic/adds-fail-to-create-a-trust-because-the-local-security-authority-is-unable-to-obtain-an-rpc-connection-to-the-remote-dc-3804855d-d09c-6d5b-8ba7-ca46eabeeb91 







# Supportability documentation

## Deep dive

Recording: https://aka.ms/AAkb74r

Powerpoint: https://microsoft.sharepoint.com/:p:/t/ASIMLearningImprovement/ESxf-K_AHK9Dj9bOEghyMc8BkH91RcEOCt1N0wuifooKYQ?e=Cuugnf
 


## Public documentation

[How trust relationships work for forests in Active Directory](https://learn.microsoft.com/en-us/azure/active-directory-domain-services/concepts-forest-trust)


[Tutorial: Create and configure an Azure Active Directory Domain Services instance with advanced configuration options](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/tutorial-create-instance-advanced)


[Tutorial: Create an outbound forest trust to an on-premises domain in Azure Active Directory Domain Services](https://learn.microsoft.com/en-us/azure/active-directory-domain-services/tutorial-create-forest-trust)
