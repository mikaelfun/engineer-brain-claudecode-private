---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/ExpressRoute Metro"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Metro"
importDate: "2026-04-17"
type: troubleshooting-guide
---

[[_TOC_]]

#Overview


ExpressRoute enables you to create private connections between your on-premises networks and Microsoft cloud services in ExpressRoute peering locations. These peering locations are co-location facilities where Microsoft Enterprise Edge (MSEE) devices are located and are the entry point to Microsoft's network.
In the peering location, you can establish connections with an:
- ExpressRoute circuit, which is a dual logical connection between your on-premises network and Azure, established over dual physical connection provided by an ExpressRoute partner (3rd party providers like AT&T, Verizon, Equinix, etc,).  
- ExpressRoute Direct, which is a dedicated and private connection between your on-premises network and Azure, without involving any third-party provider. You can directly connect your routers to the Microsoft global network using dual 10G or 100G Ports.  
The Standard circuit with dual connections offer in-built redundancy to improve the availability of your ExpressRoute connections during hardware failures, maintenance events or other unplanned events within the peering locations. However, these dual connections do not provide resiliency to other events which may bring down or isolate the edge location where the ExpressRoute MSEE devices are located which can lead to complete loss of connectivity from your on-premises networks to your cloud services.  


**ExpressRoute Metro**

- With ExpressRoute Metro, you will be able to establish a connection from your on-premises with an ExpressRoute Circuit over dual physical connections in two different ExpressRoute Peering locations within a metropolitan area. Similarly, you can establish an ExpressRoute Direct over dual 10G or 100G ports extending into the two ExpressRoute Peering locations.  
- The Metro circuit offers better redundancy to accommodate failures within the dual links and at the peering locations, thereby offering higher resiliency for your connectivity from on-premises to the nearest Azure region. See below diagram to compare the standard ExpressRoute circuit and a Metro ExpressRoute Circuit.  

The following location will be supported by CSS Azure Networking at public preview: 

![Amsterdam Metro's peering details including locations, addresses, Azure region, and service providers.](/.attachments/image-b358aee9-6c51-46d8-927c-b2a61ed748a0.png)

**The following locations are not Supported by CSS Azure Networking at public preview**, should you recieve a case dealing with these locations, please work with a TA to file an ICM for assistance (Tentatively will be available late April 2024): 

![Comparison of Singapore and Zurich metro networks with data center details, regions, and connectivity providers.](/.attachments/image-c6ad3910-6fcc-4195-845c-d766354eb3c7.png)
 
#Troubleshooting

Metro locations should be treated as additional peering locations. The naming convention for Metro sites will utilize City and City2 to denote the two unique peering locations within the same metropolitan region. 

![Network circuit setup screen with fields for region, circuit name, port type, peering location, provider, bandwidth, and SKU.](/.attachments/image-3f8b924e-4827-4f01-966b-3103104f1931.png)


As an illustration, Amsterdam and Amsterdam2 are indicative of the two separate peering locations within the metropolitan area of Amsterdam. In the Azure portal, these locations will be referred to as Amsterdam Metro.<br> 
![Azure ExpressRoute setup screen showing subscription, region, circuit name, provider, peering location, bandwidth, SKU, and billing model options.](/.attachments/image-041f2edf-3e37-40a3-9f0d-1ede33592599.png)

Existing standard troubleshooting procedures should be followed for issues with peering locations. 
