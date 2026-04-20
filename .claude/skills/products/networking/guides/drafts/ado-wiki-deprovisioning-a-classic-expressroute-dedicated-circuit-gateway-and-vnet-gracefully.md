---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/Deprovisioning a Classic ExpressRoute Dedicated Circuit, Gateway and VNET gracefully"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/Deprovisioning%20a%20Classic%20ExpressRoute%20Dedicated%20Circuit%2C%20Gateway%20and%20VNET%20gracefully"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Deprovisioning a Classic ExpressRoute Dedicated Circuit, Gateway and VNET gracefully

[[_TOC_]]

## Description

This wiki will detail how to delete classic Virtual Network, classic ExpressRoute Gateway, and classic ExpressRoute Circuit.

Before a Virtual Network can be deleted, the ExpressRoute Gateway needs to have all links removed and ExpressRoute Gateway deleted. 

An ExpressRoute Circuit may be deleted if all links to ExpressRoute Gateways have been removed and all peering deleted.

## Scenarios

- A typical scenario seen in support is customer is unable to delete the ExpressRoute gateway due to the connection/link between ExpressRoute gateway and ExpressRoute circuit. 

  Error: 
   ```
   A dedicated circuit link associated with the gateway prevents this operation. Please delete the link and retry.
   ```
   You can find this error on the [Rdfe/RdfeQosEventEtwTable](https://jarvis-west.dc.ad.msft.net/F6858F7F)

- BGP Peering in Use

   Error:
   ```
   The specified bgp peering is in use. Please delete the links associated with the specified service key and try again.
   ```
## Prerequisites

- Obtain Co-Administrator permissions in the subscription that the resources are in.
   - [Classic Roles](https://learn.microsoft.com/en-us/azure/role-based-access-control/classic-administrators?tabs=azure-portal) such as Co-Administrator have been deprecated since August 31st, 2024.  However, the user still needs this role in order to make changes to their Classic resources via PowerShell.  Even if the user had these roles prior to August 31st, they should be removed by now.
   - If the user is not already a co-administrator on the Subscription with the Classic Virtual Network, have the Subscription owner open the portal using 
https://portal.azure.com/?exp.AzurePortal_azurerbacClassicAdmins2=false&forceClassicAdministrators=true
      - From the Portal home page, they can add the Co-Administrator role by using the following steps: 
         - Azure Portal > Subscription > Find and select the subscription that has the Virtual Network > Access Control (IAM) > Classic Administrators > Click on the "+ Add" drop down list and select "Add Co-Administrator"

- [Download the latest PowerShell cmdlets](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-howto-linkvnet-classic#download-the-latest-powershell-cmdlets)
   - Install the latest versions of the Azure Service Management (SM) PowerShell modules and the ExpressRoute module. You can't use the Azure CloudShell environment to run SM modules.
      - Use the instructions in the Installing the Service Management module article to install the [Azure Service Management Module](https://learn.microsoft.com/en-us/powershell/azure/servicemanagement/install-azure-ps). If you have the Az or RM module already installed, be sure to use '-AllowClobber'.
      - Import the installed modules. When using the following example, adjust the path to reflect the location and version of your installed PowerShell modules.
       ```
       Import-Module 'C:\Program Files\WindowsPowerShell\Modules\Azure\5.3.0\Azure.psd1'
       Import-Module 'C:\Program Files\WindowsPowerShell\Modules\Azure\5.3.0\ExpressRoute\ExpressRoute.psd1'
       ```
       PowerShell error if the above module is not loaded:
       ```
       Remove-AzureDedicatedCircuitLink: The term 'Remove-AzureDedicatedCircuitLink' is not recognized as a name of a cmdlet, function, script file, or executable program.
       
       Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
       ```
     - To sign in to your Azure account, open your PowerShell console with elevated rights and connect to your account. Use the following example to help you connect using the Service Management module:
       ```
       Add-AzureAccount
       ```
**Note: Customers must use the Azure Service Management (ASM) module in PowerShell to complete the operations below.**

## Remove Link Between ExpressRoute Circuit and Virtual Network

### Step 0 | Obtain Vnet Configuration

If you do not know what the Service Key is for a link, this can be found by obtaining the Vnet Configuration, run this command and extract the Service Key details:

```
Get-AzureVNetConfig -ExportToFile c:\azure\networkconfig.xml
```

Jarvis Action support can use to get the xml file: 

[Get Network Configuration](https://jarvis-west.dc.ad.msft.net/9199CF4?genevatraceguid=0f15c7db-a11c-48b3-80dc-efe9038ec6a8)

Provide the customers subscription id.

### Step 1 | Subscription

Make sure customer is using the right subscription in PowerShell.

```
Select-AzureSubscription -SubscriptionId "<subid>"
```
### Step 2 | Delete ExpressRoute Gateway Link

Delete the link between the ExpressRoute circuit and the Virtual Network.

```
Remove-AzureDedicatedCircuitLink -ServiceKey "<servicekey>” -VNetName "<VnetName>"
```
Public Documentation: [Remove a virtual network link to a circuit](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-linkvnet-classic#remove-a-virtual-network-link-to-a-circuit)

## Delete ExpressRoute Gateway

Once the ExpressRoute Circuit link has been removed, you may proceed to delete the ExpressRoute Gateway:

```
Remove-AzureVNetGateway -VNetName "<VnetName>"
```

## Delete Virtual Network

### All Virtual Network in Subscription

To remove **ALL** virtual networks in the subscription, you can use the following command: 

```
Remove-AzureVNetConfig
```

### Remove Specific Virtual Network via Network Config File

#### Prerequisites
- Must comply with the schema, or importing the network configuration file will fail.
- Overwrite any existing network settings for your subscription, **so use extreme caution when making modifications**. Say the original file contained two VirtualNetworkSite instances, and you changed it. When you import the file, Azure deletes the virtual network for the VirtualNetworkSite instance you removed in the file. This simplified scenario assumes no resources were in the virtual network, as if there were, the virtual network could not be deleted, and the import would fail.

#### Step 1 | Download XML

Change the directory (and ensure it exists) and filename in the following command as desired, then run the command to export the network configuration file:

```
Get-AzureVNetConfig -ExportToFile c:\azure\networkconfig.xml
```

Jarvis Action support can use to get the xml file: 

[Get Network Configuration](https://jarvis-west.dc.ad.msft.net/9199CF4?genevatraceguid=0f15c7db-a11c-48b3-80dc-efe9038ec6a8)

Provide the customers subscription id. 

#### Step 2 | Remove Virtual Network From XML

Example XML:

```
<?xml version="1.0" encoding="utf-8"?>
<NetworkConfiguration xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/ServiceHosting/2011/07/NetworkConfiguration">
  <VirtualNetworkConfiguration>
    <Dns>
      <DnsServers>
        <DnsServer name="dc.com" IPAddress="10.220.1.11" />
        <DnsServer name="dc1.com" IPAddress="10.220.1.12" />
        <DnsServer name="dc3.com" IPAddress="10.2.20.51" />
        <DnsServer name="dc4.com" IPAddress="10.1.20.51" />
      </DnsServers>
    </Dns>
    <VirtualNetworkSites>
      <VirtualNetworkSite name="TS-ASR" Location="East US">
        <AddressSpace>
          <AddressPrefix>10.220.224.0/20</AddressPrefix>
        </AddressSpace>
        <Subnets>
          <Subnet name="GatewaySubnet">
            <AddressPrefix>10.220.224.0/28</AddressPrefix>
          </Subnet>
        </Subnets>
        <DnsServersRef>
          <DnsServerRef name="dc01.com" />
          <DnsServerRef name="dc02.com" />
        </DnsServersRef>
      </VirtualNetworkSite>
      <VirtualNetworkSite name="TS-NA-EAST" Location="East US">
        <AddressSpace>
          <AddressPrefix>10.220.0.0/21</AddressPrefix>
        </AddressSpace>
        <Subnets>
          <Subnet name="Windows Prod">
            <AddressPrefix>10.220.1.0/24</AddressPrefix>
          </Subnet>
          <Subnet name="Windows Test">
            <AddressPrefix>10.220.2.0/24</AddressPrefix>
          </Subnet>
          <Subnet name="Windows Dev">
            <AddressPrefix>10.220.3.0/24</AddressPrefix>
          </Subnet>
          <Subnet name="GatewaySubnet">
            <AddressPrefix>10.220.0.1/28</AddressPrefix>
          </Subnet>
        </Subnets>
        <DnsServersRef>
          <DnsServerRef name="dc3.com" />
          <DnsServerRef name="dc4.com" />
          <DnsServerRef name="dc02.com" />
        </DnsServersRef>
      </VirtualNetworkSite>
    </VirtualNetworkSites>
  </VirtualNetworkConfiguration>
</NetworkConfiguration>
```
From the above XML, we can see that there are two virtual networks configured in the subscription: 

- TS-ASR
- TS-NA-EAST

In the example, I am removing TS-ASR. 

New XML removing TS-ASR virtual network: 

```
<?xml version="1.0" encoding="utf-8"?>
<NetworkConfiguration xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/ServiceHosting/2011/07/NetworkConfiguration">
  <VirtualNetworkConfiguration>
    <Dns>
      <DnsServers>
        <DnsServer name="TAZ-DC01-US.twi.dom" IPAddress="10.220.1.11" />
        <DnsServer name="TAZ-DC02-US.twi.dom" IPAddress="10.220.1.12" />
        <DnsServer name="TWI-DC-SEALY1.twi.dom" IPAddress="10.2.20.51" />
        <DnsServer name="TWI-DC-SEALY2.twi.dom" IPAddress="10.1.20.51" />
      </DnsServers>
    </Dns>
    <VirtualNetworkSites>
      <VirtualNetworkSite name="TS-NA-EAST" Location="East US">
        <AddressSpace>
          <AddressPrefix>10.220.0.0/21</AddressPrefix>
        </AddressSpace>
        <Subnets>
          <Subnet name="Windows Prod">
            <AddressPrefix>10.220.1.0/24</AddressPrefix>
          </Subnet>
          <Subnet name="Windows Test">
            <AddressPrefix>10.220.2.0/24</AddressPrefix>
          </Subnet>
          <Subnet name="Windows Dev">
            <AddressPrefix>10.220.3.0/24</AddressPrefix>
          </Subnet>
          <Subnet name="GatewaySubnet">
            <AddressPrefix>10.220.0.1/28</AddressPrefix>
          </Subnet>
        </Subnets>
        <DnsServersRef>
          <DnsServerRef name="TWI-DC-SEALY1.twi.dom" />
          <DnsServerRef name="TWI-DC-SEALY2.twi.dom" />
          <DnsServerRef name="TAZ-DC02-US.twi.dom" />
        </DnsServersRef>
      </VirtualNetworkSite>
    </VirtualNetworkSites>
  </VirtualNetworkConfiguration>
</NetworkConfiguration>

```

#### Step 3 | Import the configuration file

Once the edited xml has been saved with your changes, you have to import the configuration back:

```
Set-AzureVNetConfig  -ConfigurationPath c:\azure\networkconfig.xml
``` 

If the import is successful, virtual network TS-ASR should be deleted.

## Delete Classic ExpressRoute Circuit

### Considerations

- You must unlink all virtual networks from the ExpressRoute circuit for this operation to succeed. Check to see if you have any virtual networks that are linked to the circuit if this operation fails.
- If the ExpressRoute circuit service provider provisioning state is Provisioning or Provisioned you must work with your service provider to deprovision the circuit on their side. We continue to reserve resources and bill you until the service provider completes deprovisioning the circuit and notifies us.
- If the service provider has deprovisioned the circuit (the service provider provisioning state is set to Not provisioned), you can then delete the circuit. This stops billing for the circuit.


Public Documentation: [Modify an ExpressRoute circuit using PowerShell (classic)](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-howto-circuit-classic#deprovision-and-delete-a-circuit)

### Step 1 | Private Peering ExpressRoute Gateway

You must confirm that no links are still established with the ExpressRoute Circuit.

If you look in ASC, the tunnel configuration shouldn't show any tunnels created.

The following shows an example of a gateway that is still linked to ExpressRoute.

![Network interface showing tunnel21 with IP 10.130.127.6, keys, VNET info, and source IP 10.3.129.2.](/.attachments/image-ace3eff1-077e-4283-932c-854c494d4218.png)

Validate that no tunnels are still showing.

If tunnels are still showing in ASC, go back to [Remove Link Between ExpressRoute Circuit and Virtual Network](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/503591/Deprovisioning-a-Classic-ExpressRoute-Dedicated-Circuit-Gateway-and-VNET-gracefully?anchor=remove-link-between-expressroute-circuit-and-virtual-network).

Find the Virtual Network and ExpressRoute Gateway that is connected and proceed to remove the link between them. 

If no tunnels are present, proceed to the next steps. 

### Step 2 | Delete Peerings

Delete peerings associated with the ExpressRoute circuit. 

#### Private peering
```
Remove-AzureBGPPeering -AccessType Private -ServiceKey "*********************************"
```
#### Public peering (deprecated)
```
Remove-AzureBGPPeering -AccessType Public -ServiceKey "*********************************"
```
#### Microsoft peering
```
Remove-AzureBGPPeering -AccessType Microsoft -ServiceKey "*********************************"
```

### Step 3 | Deprovision

The customer will need to work with the service provider to deprovision the circuit. 

If the customer has issues with getting the circuit deprovisioned after working with the service provider, proceed to follow [Update Service Provider Provisioning State of Circuit](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/512499/Update-Service-Provider-Provisioning-State-of-Circuit).

### Step 4 | Delete

The service provider provisioning state must be set to **Not Provisioned** before the circuit is allowed to be deleted. 

If the state is set, run the following command to delete the circuit: 

```
Remove-AzureDedicatedCircuit -ServiceKey "*********************************"
```

#### Note 
If customer cannot identify the service key linked to the gateway, you can check "Get Gateway" Jarvis Action result to check it. Sample output:

```
<ArrayOfGuid xmlns:xsd="http://www.w3.org/2001/XMLSchema"xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <guid>b5a1be61-a197-457a-8b16-xxxxxxxxxxxx</guid>
</ArrayOfGuid>
```

Service Key is also present in the Vnet XML configuration. Before ICM Escalation to PG to remove a classic Vnet, make sure that the configuration file has been pulled and is present and reviewed for any links to any other resources such as an ExpressRoute Circuit. 

Logs
==========

For classic case, the calls first land up on RDFE layer. For RDFE Logs, you can [use this query](https://dataexplorer.azure.com/clusters/rdfeprod/databases/rdfeprodDB?query=H4sIAAAAAAAAA3VOPQvCMBDd/RVHJisNtFlcRHBw6FAU7C5nemiqvZRcgos/3nawdHF77/G+EjvPsFl94P2gQNBU9fHSHOoz7KHHJ11bjBRdT2tlClPqYqtLlQFyu7Du/lmNyubmmkTwTmA9R3QsoOwLRZzVgcSnYEkz9qTGwBB8RzaCpJvY4IY4fqzaHE4DBZzIAk76/CT/rXwBZ40vqdcAAAA=)


For ExpressRoute resources, if the call is successful at RDFE layer, it should land on Gateway Manager Service. Use [BrkGWM/GatewayManagerFrontEndCallEvent](https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&offset=-1&offsetUnit=Days&UTC=false&ep=Diagnostics%20PROD&ns=BrkGWM&en=GatewayManagerFrontEndCallEvent&conditions=[["Parameters","contains","<servicekey>"],["CustomerSubscriptionId","contains","<subscriptionid>"]]&aggregatesVisible=true&aggregates=["Count%20by%20Action"]&chartEditorVisible=true&chartType=Line&chartLayers=[["New%20Layer",""]]%20) to check the calls landing using Service Key or the Subscription Id.

Get the activity id from above logs and search using it to get complete logs from Gateway Manager [using this query](https://portal.microsoftgeneva.com/logs/dgrep?page=logs&be=DGrep&offset=-1&offsetUnit=Days&UTC=false&ep=Diagnostics%20PROD&ns=BrkGWM&en=AsyncWorkerLogsTable,GatewayManagerLogsTable&conditions=[["ActivityId","contains","<activityid>"]]&aggregatesVisible=true&aggregates=["Count%20by%20Action"]&chartEditorVisible=true&chartType=Line&chartLayers=[["New%20Layer",""]]%20).

# Contributors
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>
- @<EF4950CC-BFC8-49EB-9889-26BA2142DF70> 