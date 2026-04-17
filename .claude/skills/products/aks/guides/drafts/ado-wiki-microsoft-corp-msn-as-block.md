---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/What is MICROSOFT CORP MSN AS BLOCK"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FWhat%20is%20MICROSOFT%20CORP%20MSN%20AS%20BLOCK"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# What services sit on ASN 8075 MICROSOFT-CORP-MSN-AS-BLOCK

## Summary

When customers initiate a network trace, they may encounter unfamiliar IP addresses associated with Azure and the MICROSOFT-CORP-MSN-AS-BLOCK (8075). This is Microsoft's Autonomous System number used for routing internet traffic as part of Microsoft's network infrastructure.

## Services using ASN 8075

- **Azure Services**: Routing traffic for Azure Storage and Azure Networking
- **DNS Services**: DNS resolution within Microsoft's network, including private DNS zones and DNSSEC support
- **ExpressRoute**: ExpressRoute peering connecting on-premises networks to Azure via private connections
- **Managed Identity**: MSI infrastructure including Managed Identity Resource Provider (MIRP) and Regional Evolved Security Token Service (ESTS-R)

## Key Takeaway

Traffic to/from IPs in ASN 8075 is expected behavior for Azure workloads and is part of normal Microsoft infrastructure communication.
