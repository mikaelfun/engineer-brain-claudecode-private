---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Features & Functions/Routing Intent - VWAN Hubs and Azure Firewall Manager"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Firewall%2FFeatures%20%26%20Functions%2FRouting%20Intent%20-%20VWAN%20Hubs%20and%20Azure%20Firewall%20Manager"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

_**All data presented here is from a lab/test subscription, and does not contain customer data**_

#Public Documentation
https://learn.microsoft.com/en-us/azure/virtual-wan/how-to-routing-policies

Explains how this feature works. 

_Workshop Wednesday Video with PG of VWAN:_
- https://microsoft.sharepoint.com/:v:/t/anpreadiness/EVQtirUQfFZGjTx8bgmiAwEBG6k6D5nxdO7CK_V0Cqyjjg?e=R0eLfh

**Summary Topics**
- How to configure the Virtual WAN hub to forward Internet-bound and Private (Point-to-site VPN, Site-to-site VPN, ExpressRoute, Virtual Network and Network Virtual Appliance) Traffic to an Azure Firewall, Next-Generation Firewall Network Virtual Appliance (NGFW-NVA) or security software-as-a-service (SaaS) solution deployed in the virtual hub.
- Allows for Interhub Routing between Firewalls in each hub.
- Sample Architecture
- **Known Limitations**
- Customer Consideration that need to be accounted for on the migration to Routing Intent
- Prerequisites for enablement
- Roll-back Strategy


# How to Enable (2 options)
## Using Azure Firewall Manager 

Public doc LINK: https://learn.microsoft.com/en-us/azure/virtual-wan/how-to-routing-policies#azurefirewall

This should be enabled on all the HUBS that need to interconnect.  

- The Key aspect is to make sure to change Inter-HUB to "ENABLED"
  - ![Azure Firewall Manager's Security configuration page with settings for Internet traffic boxed in red (Azure Firewall), Private traffic (Send via Azure Firewall), and Inter-hub (Enabled).](/.attachments/image-840e65c3-43fa-41f1-b936-f165cf0d75d8.png)
- This is only applicable if the customer is only using an AZFW in the HUB.  (_NVA's and others must use the VHUB method)_
  - ![Azure Firewall Manager's Security configuration page for "westushub" with a pop-up titled "Migrate to use inter-hub" explaining routing changes and offering "OK" and "Cancel" buttons.](/.attachments/image-890af4f0-14ef-42ca-8959-a2a088c14a07.png)

## Using VHUB - Routing Intent Blade

https://learn.microsoft.com/en-us/azure/virtual-wan/how-to-routing-policies#nva

- Make sure to select the appropriate next hop resource
- ![Routing settings for WestCentralUSHub with Internet traffic set to None and Private traffic routed through fortinetAPITEST3, both boxed in red.](/.attachments/image-1d3c92e4-5e85-474d-8691-c194dd0c06cf.png)

#How to tell if a VHUB is using Routing Intent.
##ASC

Looking at the VHUB page in ASC. 
- There is a section for Routing Intent
  - **ENABLED**
  - ![ASC - routing intent section enabled](/.attachments/image-c6f1c26c-c7d2-4635-bae6-f658ef01a1ac.png)
  - **DISABLE**
  - ![ASC - routing intent Disabled](/.attachments/image-bba88ac6-1ac9-49f4-a686-abff69d75fd5.png)
- You can also look at the DEFAULT Route Table. 
  - Public Documents explaining the differences
    - https://learn.microsoft.com/en-us/azure/virtual-wan/how-to-routing-policies#azure-firewall-manager-and-virtual-wan-hub-portal
  - **ENABLED**
    - See how the route names have **__policy_XXXXXXXXX_**
    - ![Route table shows two policies—_policy_PublicTraffic and _policy_PrivateTraffic—both routing to azurefirewalls.](/.attachments/image-ba9933ee-c958-4f69-8e3c-be267a772bdd.png)
  - **DISABLED**
    - ![Route table named defaultRouteTable with all_traffic routed to azurefirewalls.](/.attachments/image-3a1ee6d5-0b98-4ebf-85a4-22fe6781705c.png)
  