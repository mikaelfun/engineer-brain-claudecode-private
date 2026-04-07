---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra Domain Services/Microsoft Entra Domain Services Test Traffic"
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
- NSG
- Networking
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

The following process can be used in Azure Support Center to verify network connectivity NSG and Routing rules from a customer's Microsoft Entra Domain Services domain controller virtual machines

[[_TOC_]]

# Utilize Azure Support Center's Test Traffic tool


1. Find your customer's MEDS Domain Controller info in ASC Resource Explorer and capture the Master\Replica Domain Controller Resource ID. And IP Address

   Example:
   ![image.png](/.attachments/image-3dae8a84-c775-4963-9ff7-2f07fb9b7317.png)

	
2. From the domain controller's **Resource URI** , determine the domain controller's **subscription ID**.  Note that this subscription ID will be DIFFERENT from the customer's subscription ID as the domain controllers run in a MIcrosoft owned subscription separate from the customer's subscription.
3. Add the MEDS domain controller resource **subscription ID** to ASC resource Explorer, and search for your MEDS master domain controller name using the quick find search after you have added the subscription

   Example:

   ![image.png](/.attachments/image-5b270af2-0f3d-4d49-9f00-5fdc9459a03c.png)


	
3. Browse to the Master DC virtual machine resource blade, and choose the Diagnostics -> Test Traffic option

![image.png](/.attachments/image-e2d5ed55-7e6b-410e-8a37-b8735e788b79.png)

4. Configure Test Traffic to perform a Inbound internet IN test, using 
   
       a. Traffic Direction = InternetIn
       b. Source IP = IP address from the "AzureActiveDirectoryDomainServices"service tag. Ex: 52.225.184.198
       c. Source Port = Remote PowerShell (WinRM): 5986
       d. Destination IP = IP Address found in step 1 for the Master DC IP address, example 10.1.0.4
       e. Destination Port = Remote PowerShell (WinRM): 5986
       f. Transport Protocol = TCP

   Example:

   ![image.png](/.attachments/image-072b8997-bd09-4e15-9ca7-3833ca9ccdff.png)

		
5. Run this test, and you will see if the Overall Result = Traffic Allowed, there should not be any issues with NSG or Routing.  If there is a NSG issue, it will be listed as blocking traffic.  Likewise, if there is a routing issue it will be listed as an issue with routing and you can also choose the option to view the NIC effective routes.  Any default route such as 0.0.0.0/0 that is not listed as Next Hop = InternetGateway should be reviewed by customer networking team as the default route for MEDS DCs must be the internet.

   Example:

   ![image.png](/.attachments/image-10756d33-0835-4b30-8fa0-19fb5629f888.png)
	
6. If NSG looks correct for customer, but they are using our AzureActiveDirectoryDomainService networking TAG rather than IP ranges.  Verify that the IP listed in MEDS network error is in the publicly documented IP ranges for AzureADDomainService tag @ https://www.microsoft.com/en-us/download/confirmation.aspx?id=56519

   Example:

   ![image.png](/.attachments/image-923b27d3-9a2a-407a-ba37-7975d67bc339.png)


7. Check Default Route is going to InternetGateway

   Example:
   ![image.png](/.attachments/image-7712824f-431b-49f3-9102-6421ffa3a9b1.png)

9. You can also use Test Traffic to verify no modifications to the default AllowVnetInbound (Port 0-65000) rules via a test of TunnelorLocalIn between the MEDS DC local IPs on any port in the [RPC port range (1024-65535)](https://docs.microsoft.com/en-us/troubleshoot/windows-server/identity/config-firewall-for-ad-domains-and-trusts)

   Example:
   
   ![image.png](/.attachments/image-fc8c23d7-74b9-40ba-86e7-2649367e795f.png)

   Check the NIC Effective Routes section and confirm you see a default route of 0.0.0.0/0 pointing to a next hop of InternetGateway like:

   ![image.png](/.attachments/image-928cc593-e087-49f2-a0cd-93aaaf33327e.png)

# Troubleshooting non-default MEDS routing

8. A note on customers using custom routing configurations or network topologies and experiencing MEDS connectivity issues:

     The MEDS PG guidance on custom routes and network topology is under https://docs.microsoft.com/en-us/azure/active-directory-domain-services/network-considerations#user-defined-routes
 
   If the customer is using a custom network topology such as ExpressRoutes and User-defined routes they have to ensure that the network routing is in place so inbound \ outbound routing and connectivity is in place fo [Network planning and connections for Microsoft Entra Domain Services | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/domain-services/network-considerations#network-security-groups-and-required-ports) to and from each of the Azure IP networks listed under the "AzureActiveDirectoryDomainServices" service tag listing of [Azure IP Ranges and Service Tags document](https://www.microsoft.com/en-us/download/confirmation.aspx?id=56519)
 
   It is not an officially supported configuration, so if customer deploys in such a way it is up to customer to ensure the required network communication channels are not blocked by their policies/configuration.  If they need help with that, suggest working with their CSAM to engage a Microsoft Consultant for Azure Networking.


9.  If the test traffic test indicates no issue with NSG, but an issue with routing then customer may have a route being advertised to the MEDS subnet that is sending the default route 0.0.0.0/0 to a next hop of something other than the INTERNET.  Possible sources of non-default routes are:

     a. An Azure user-defined route that is associated to the Microsoft Entra Domain Services default subnet whose Address prefix of 0.0.0.0/0 and Next hop type is not "Internet"

     b. Any peered virtual networks to the Microsoft Entra Domain Services virtual network that are advertising non-default routes whose prefix of 0.0.0.0/0 and Next hop type is not "Internet" for example Virtual Network Gateways \ Azure Firewalls etc.

        To check "Use Remote Gateways" setting in Peerings. Add/(enable) "Use Remote Gateways" Column display under Peering. 

     ![Img1.png](/.attachments/Img1-f94899a0-9171-4ef5-b07a-40fd3ceb7058.png)
     ![Img2.png](/.attachments/Img2-acb1df96-4bc0-4e02-af83-b7395716b211.png)

    <span style="color:red;font-weight:bold">IMPORTANT</span>  If the 'Use Remote Gateways' feature is enabled, collaborate with the customer to manually test the addition of a 0.0.0.0 route to the internet. Once the '0.0.0.0 to internet' route successfully resolve the networking errors. Contact Azure networking support (SAP: Azure/Virtual Network/Cannot Connect to and From Internet/Internet to VM (Inbound) connectivity) to optimize vnet settings according to the customer's security requirements.

## Steps to manually define a default route to the Internet

A possible troubleshooting step is to ask the customer to [MANUALLY define their own Azure user-defined route](https://docs.microsoft.com/en-us/azure/virtual-network/manage-route-table#create-a-route-table) pointing 0.0.0.0/0 to Next hop = Internet and then associated this User defined route to the Microsoft Entra Domain Services subnet  steps below

1. Browse to Azure Portal

2. Select Create a resource

3. Search for "Route table"
 
 4. In "Create a route table" dialog, choose Azure AD DS subscription \ Resource Group \ Region and give it a unique name .  Also select "Virtual network gateway route propagation to Disabled

     ![image.png](/.attachments/image-4e5c8daf-d489-4f00-a3d5-1d0433215f31.png)

 5. Once the route table is created, open the resource properties and choose "Add route" , give it a unique route name **one of the following properties**
   
        Address Prefix source = 0.0.0.0/0 
        Next Hop type = Internet
        or
        Destination address Prefix Service Tag = AzureActiveDirectoryDomainServices
        Next hop type = Internet


       ![image.png](/.attachments/image-f338fb6d-08f7-4948-af7d-9074efc70e24.png) <br> **or** <br> ![image.png](/.attachments/image-b4f638cf-4b0e-4eb0-bc61-5f13369cd7f2.png)

  6. Now associate this route table with the Microsoft Entra Domain Services vNET subnet via "Associate subnet" option and choose the Microsoft Entra Domain Services subnet

     <span style="color:red;font-weight:bold">IMPORTANT</span>  If customer or MEDS SE needs assistance troubleshooting customer vNET\vWAN routing or has questions regarding Azure network configuration  a collab to Azure Networking team should be created to SAP:  (Azure/Virtual Network/Cannot Connect to and From Internet/Internet to VM (Inbound) connectivity) to check configuration and help answer questions.
