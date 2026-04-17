---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/How To/IP Based Login"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FIP%20Based%20Login"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG: IP Based Login

## Troubleshooting IP Based Login
----

The Azure Bastion support topic tree includes a scoping question that prompts customers to provide the IP address of the target VM they are trying to remotely access. This scoping question maps to the Bastion support topics that relate to RDP/SSH connectivity.

## Initial Troubleshooting Steps

1. **Input the customer-provided IP address** into the Bastion ASC connectivity checker to determine if the Bastion host has reachability to the target VM.

2. **If connectivity checker shows VM is not reachable:**
   - Advise the customer to review their networking configuration
   - Review the configuration of any hybrid network configurations:
     - ExpressRoute
     - VPN Gateway
   - Check NSG rules on VM subnet and NIC allowing AzureBastionSubnet inbound on 3389/22

## Notes
- IP-based login requires the Bastion host and target VM to be in the same VNet or peered VNet
- The ASC connectivity checker only tests TCP reachability — it does not perform RDP/SSH authentication
