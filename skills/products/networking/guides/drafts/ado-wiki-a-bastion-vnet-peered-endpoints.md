---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/How To/VNet Peered Endpoints"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FVNet%20Peered%20Endpoints"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VNet Peered Endpoints

[[_TOC_]]

### Bastion Troubleshooter for VNet Peered Endpoints
----

1)  ##Verify VNet Peering Configuration and Health:
    - Verify that VNet Peering is configured and in a healthy state between the Bastion VNet and the peered VNet.
    - Check Provisioning State Succeeded and Peering Connected, and the other peering configuration options (for routing configuration).
    - If there are issues with VNet Peering, please use the ASC Troubleshooter for VNet Peering to resolve these issues.

---

2) ##Verify RBAC configuration for Cross Subscription VNet Peering:
   - Verify that the user has at minimum 'Read Only' for the VNet and the Target VM
   - Reader role on the virtual machine
   - Reader role on the NIC with private IP of the virtual machine
   - Reader role on the Azure Bastion resource
   - Reader Role on the Virtual Network (not needed if there is no peered virtual network)
   - Required permissions table:
    ````
     Permission                                                           Description
     Microsoft.Network/bastionHosts/read                                  Gets a Bastion Host
     Microsoft.Network/virtualNetworks/BastionHosts/action               Gets Bastion Host references in a Virtual Network.
     Microsoft.Network/virtualNetworks/bastionHosts/default/action       Gets Bastion Host references in a Virtual Network.
     Microsoft.Network/networkInterfaces/read                            Gets a network interface definition.
     Microsoft.Network/networkInterfaces/ipconfigurations/read           Gets a network interface ip configuration definition.
     Microsoft.Network/virtualNetworks/read                              Get the virtual network definition
     Microsoft.Network/virtualNetworks/subnets/virtualMachines/read      Gets references to all the virtual machines in a virtual network subnet
     Microsoft.Network/virtualNetworks/virtualMachines/read              Gets references to all the virtual machines in a virtual network
     ````
    - The customer can use the 'Access Control (IAM)' portal blade to verify.

---

3) ##Verify that the other Subscription is listed in the Azure portal's 'Global Access Filter':
   - Verify that the customer has the other subscription included in Global Access Filter.

---

> **Source**: ADO Wiki - AzureNetworking/Wiki
> **Page**: /Azure Bastion/How To/VNet Peered Endpoints
