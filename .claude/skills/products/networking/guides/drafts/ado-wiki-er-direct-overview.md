---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/ExpressRoute Direct"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Direct"
importDate: "2026-04-17"
type: troubleshooting-guide
---

[[_TOC_]]

## Feature Overview

ExpressRoute Direct gives you the ability to connect directly into Microsoft’s global network at peering locations strategically distributed across the world. ExpressRoute Direct provides dual 100 Gbps or 10 Gbps connectivity, which supports Active/Active connectivity at scale.
 

The provider ports/partner model utilizes our partner eco-system to connect utilizing layer 2 and layer 3 providers, where the provider connects at layer 1 (physical connection) and then we on board 1:M ExpressRoute circuits on those physical circuits using over provisioning factors, VLAN tagging, etc. Customers create a circuit on a shared port pair and then establish redundant BGP sessions to on-premises for each peering on the circuit.

The ExpressRoute Direct model introduces the following:


-   10Gbps or 100Gbps direct connectivity to the Microsoft enterprise edge (MSEE) devices (physical cross connect from customer to Microsoft patch panel)
-   .1Q or QinQ layer-2 encapsulation.
- MACsec encryption.
- ExpressRoutePort API to enable/disable admin state on each MSEE port - allowing customers to enable and verify layer-1 connectivity.


##Regions 
To view the locations where ExpressRoute Direct is supported, refer to the [ExpressRoute Locations](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-locations-providers#partners)


## Case Handling

ExpressRoute Direct cases will be jointly handled by CSS and the ExpressRoute Operations teams. Specifically software-related issues will be handled by CSS. Example of these issues are configuring/managing/deleting the ExpressRoute Direct resource in Azure, enabling admin state on the MSEE port pair via the ExpressRoutePorts API or creating ExpressRoute circuits on the ExpressRoute Direct port pair. Any issues related to physical connectivity or capacity an IcM will be approved by an TA and routed directly to the ExpressRoute Operations queue. Please find the below references for more details: 

Physical Connectivity Issues: [ExpressRoute Direct Down](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/547320/ExpressRoute-Direct-Down) 

Capacity: [ExpressRoute Direct Capacity is Unavailable at the Target Peering Location](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/639824/ExpressRoute-Direct-Capacity-is-Unavailable-at-the-Target-Peering-Location)

### LOA Issues
Additional troubleshooting steps here: [ExpressRoute Direct Down LOA](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/547320/ExpressRoute-Direct-Down?anchor=loa)

### Physical Connectivity

Additional troubleshooting steps here: [ExpressRoute Direct Down Physical Connectivity Issues](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/547320/ExpressRoute-Direct-Down?anchor=physical-connectivity-issues)

### Capacity is Unavailable at the Target Peering Location

Additional troubleshooting steps here: [ExpressRoute Direct Capacity is Unavailable at the Target Peering Location](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/639824/ExpressRoute-Direct-Capacity-is-Unavailable-at-the-Target-Peering-Location)

## Billing

ExpressRoute Direct's port pairs gets billed 45 days into the creation of the ExpressRoute Direct resource or when one or both of the links get enabled, whichever comes first. The 45-day grace period is granted to allow customers to complete the cross-connection process with the colocation provider.

You'll stop being charged for ExpressRoute Direct's port pairs after you delete the direct ports and remove the cross-connects.

Public Documentation: [ExpressRoute FAQ](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-faqs#when-does-billing-start-and-stop-for-the-expressroute-direct-port-pairs)

## How it works

Customers view available ExpressRoute Direct capacity across peering locations using the Azure Portal, PowerShell, CLI or REST API calls. If capacity is available in the target location, the customer then reserves the physical port pair by creating the ExpressRoute Direct resource in an Azure subscription.

Once the ExpressRoute Direct resource is successfully created, the next step is to generate the Letter of Authorization (LOA) using the Azure Portal or PowerShell. Once this step is complete the customer will submit the LOA to the peering location owner to order cross connections to the target Microsoft patch panel ports. 

Once the cross connections are issued, the customer should confirm layer-1 connectivity by enabling admin state using the Azure Portal, PowerShell or CLI; and then view the transmit and receive light levels using Azure Monitor.

Once physical connectivity is established and line protocol is up across the ExpressRoute Direct ports, the customer proceeds and creates ExpressRoute circuits and configures peering.

Refer to the following links for specific steps to configure ExpressRoute Direct using PowerShell, CLI, or the Azure Portal

## Authorizations

ExpressRoute Direct and ExpressRoute circuit(s) in different subscriptions or Azure Active Directory tenants. You'll create an authorization for your ExpressRoute Direct resource and redeem the authorization to create an ExpressRoute circuit in a different subscription or Azure Active Directory tenant.

Additional information can be found [here](https://learn.microsoft.com/en-us/azure/expressroute/how-to-expressroute-direct-portal#enable-expressroute-direct-and-circuits-in-a-different-subscription).

**Troubleshooting Authorizations**

The below query will show authorizations by Sub ID and Service Key

![image.png](/.attachments/image-42b7c7f3-227c-4ffb-867d-fbca57ef2e22.png)

OwnerSubscriptionID = Where the direct port resources are deployed<br>
AzureSubscriptionID = Where the circuit resources are deployed 

If an ExpressRoute circuit has a PortAuthorizationArmGUID and ServiceProvider is "expressroute ports" then, the ExpressRoute Direct Port resources are in different subscription to the circuit. 

**Get Port Details, Authorization from an Service Key**
```
Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://hybridnetworking.kusto.windows.net/aznwmds
//Get Port details, authorization from a SKEY
CircuitTable
| where ingestion_time() > ago(2d) and ServiceProviderName contains "expressroute" and PrimaryDeviceName contains "exr"
| where AzureServiceKey == "57dc9c0a-b314-4c5b-a288-ba4f8631e719" //Change ServiceKey to get the port details
| where isnotempty(PortAuthorizationArmGuid)
| summarize by AzureSubscriptionId, AzureServiceKey, Location, ServiceProviderName, PortPairId, PortAuthorizationArmGuid
| join kind=inner (GatewayManagerInventoryTable
| where ingestion_time() > ago(1d) and ServiceProviderName == "expressroute ports" and ServicePrefix startswith "wavnet" and ServicePrefix != "wavnet" and PeeringLocation !contains "test"
| where PrimaryDeviceName !contains "null"
| summarize by PortPairName, PortPairId, PrimaryDeviceName, SecondaryDeviceName, PortName=PrimaryDevicePortName, OwnerSubscriptionId) on PortPairId
| summarize by AzureServiceKey, AzureSubscriptionId, Location, PrimaryDeviceName, SecondaryDeviceName, PortName, OwnerSubscriptionId, PortPairId, ServiceProviderName
```


**Circuits and Ports in different subscriptions (Input ExpressRoute Direct Port Subscription ID)**
```
/Circuits and Ports in different Subs
//Input ExpressRoute Direct Port Subscription ID
GatewayManagerInventoryTable
| where ingestion_time() > ago(1d) and ServiceProviderName == "expressroute ports" and ServicePrefix startswith "wavnet" and ServicePrefix != "wavnet" and PeeringLocation !contains "test"
| where PrimaryDeviceName !contains "null" and OwnerSubscriptionId == "070a8d57-deaa-4eb3-b2f2-08a9ccd057e9" //ADD Port Subscription
| summarize by PortPairName, PortPairId, PrimaryDeviceName, SecondaryDeviceName, PortName=PrimaryDevicePortName, OwnerSubscriptionId
| join kind=inner (CircuitTable
| where ingestion_time() > ago(2d) and ServiceProviderName contains "expressroute" and PrimaryDeviceName contains "exr"
| where isnotempty(PortAuthorizationArmGuid)
| summarize by AzureSubscriptionId, AzureServiceKey, Location, ServiceProviderName, PortPairId, PortAuthorizationArmGuid) on PortPairId
| summarize by PortPairId, PrimaryDeviceName, SecondaryDeviceName, PortName, OwnerSubscriptionId, AzureSubscriptionId, AzureServiceKey, PortAuthorizationArmGuid, ServiceProviderName
```

## Limitations

As noted above, ExpressRoute Direct is not currently supported in all the ExpressRoute peering locations. Additionally, not all peering locations support both the 100Gbps and 10Gbps ExpressRoute Direct SKU. Refer to [ExpressRoute Locations](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-locations-providers#partners) for more information.

## Known Issues

- N/A

## How To

- [View Available ExpressRoute Direct Capacity Across Support ExpressRoute Peering Locations](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-erdirect)
- [Enable the Admin State on the ExpressRoute Direct](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-erdirect#state)
- [Create an ExpressRoute Direct Circuit](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-erdirect#circuit)
- [Configure MACsec for ExpressRoute Direct Ports](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-macsec)
- [About MACSec and options for it](https://docs.microsoft.com/azure/expressroute/expressroute-about-encryption)

## Troubleshooting Scenarios

Common troubleshooting scenarios should begin by verifying the admin state and light level of each ExpressRoute Direct port link. Once the admin state has been confirmed, the next step is to confirm if the issue is software related - and therefore can be handled by CSS - or physical related. As mentioned above issues with physical connectivity should be directed to the ExpressRoute Operations queue.

- **Capacity Unavailable at the Target Peering Location:** If capacity is unavailable at the target peering location please validate bandwidth is not available. How to validate and next steps are provided in the following wiki: [ExpressRoute Direct Capacity is Unavailable at the Target Peering Location](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/639824/ExpressRoute-Direct-Capacity-is-Unavailable-at-the-Target-Peering-Location)

- **Request to Toggle Secure Channel Identifier (SCI):** If a customer creates a support request asking to toggle the SCI configuration on the ExpressRoute Direct ports, we know provide this option to customers via PS/CLI. Additional info can be found [here](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-macsec#to-enable-macsec). 
   ```
  Update 01/26/2022

   Customers are now able to configure SCI via PowerShell: 


   $erDirect = Get-AzExpressRoutePort -ResourceGroupName "your_resource_group" -Name "your_direct_port_name"
   $erDirect.Links[0].MacSecConfig.SciState = "Enabled"
   $erDirect.Links[1].MacSecConfig.SciState = "Enabled"
   Set-AzExpressRoutePort -ExpressRoutePort $erDirect
   ```
- **Admin State of Links**: The customer needs to enable admin state on each port, using the expressrouteport API. Admin state needs to be enabled on each port in order to pass traffic over ExpressRoute circuits created on the port pair. The ExpressRoute Direct ASC resource explorer properties reports. If admin state is disabled, provide the customer guidance on how to enable the state on each port, using the How To documentation linked above. If Admin state is enabled, the next step is to view transmit (tx) and receive (rx) light levels.

   * You can find the Admin State of ExR Direct links in ASC:

      ![Admin State Enabled in ASC](/.attachments/image-5d21f305-b090-4071-a40a-a4516bd49711.png)

- **Light Levels**: Light levels measure the strength of the light transmitted from and received to the port optic. In order to successfully establish physical connectivity, each port optic needs to transmit and receive light, within an acceptable threshold. You can use the Jarvis dashboard exposed in the ExpressRoute Direct ASC Resource Explorer Properties to view the Transmit (Tx) and Receive (Rx) light levels of each port. Acceptable Tx and Rx light levels fall in the range of -10dBm to 0dBm. If either Tx or Rx levels don't fall within the range outlined above, direct the support request to the ExpressRoute Operations queue.

* You can see light level output on the Jarvis Dashboard linked via ASC:

   ![Jarvis Dashboard in Debug on Jarvis option](/.attachments/image-de9a52ee-378f-404f-9a6e-950070eae285.png)

 Additionally, it's important to understand if the customer has successfully ordered the cross connection from their edge devices to the Microsoft Patch Panel ports. If not, advise the customer to complete the physical connectivity with the co-location owner.

 **The ExpressRoute Direct Resource Explorer Properties blade exposes a Jarvis Dashboard** that can be used to monitor the physical connectivity and configuration of the port pair. For more information on the metrics we expose to customers, check out [ExpressRoute Direct Metrics](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-monitoring-metrics-alerts#expressroute-direct-metrics). 


## Public Documentation

**ExpressRoute Direct**

- **Overview and Technical:**
    - Overview: [About ExpressRoute Direct](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-erdirect-about)
    - Configure: [How to configure ExpressRoute Direct](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-erdirect)
    - ExpressRoute FAQ: [ExR FAQ - ExpressRoute Direct](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-faqs#expressRouteDirect)
  
- **Announcements:**
    - Yousef Khalidi's blog: [Azure Networking Fall 2018 update](https://azure.microsoft.com/en-us/blog/azure-networking-fall-2018-update/)

## Upcoming Features and Improvements

- **ExpressRoute Direct Resource Health Check:** Resource Health Checks on the ExpressRoute Direct resource. Checks will report a health status of the resource, providing customers the ability to diagnose and solve any issues affecting the resource.
## FAQ
**Can I move an ExpressRoute Direct resource across resource groups or subscriptions?**
No, ExpressRoute Direct resources cannot be moved across resource groups or subscriptions. In order to relocate the ExpressRoute Direct resource, the customer needs to delete and recreate the ExpressRoute Direct resource in the new resource group/Azure subscription.
**Note:** Deleting the ExpressRoute Direct resource will release the port pair back into available inventory. Additionally, the customer may recreate an ExpressRoute Direct resource that maps to the incorrect port pair.

**Does ExpressRoute Direct support overprovisioning?**
Yes, the ExpressRoute Direct resource supports an overprovision factor = 2. As a result, a customer can create up to 20Gb of ExpressRoute circuits on a 10Gb ExpressRoute Direct. Additionally, customers can create 200Gb of ExpressRoute circuits on a 100Gb ExpressRoute Direct.


# Contributors
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>


