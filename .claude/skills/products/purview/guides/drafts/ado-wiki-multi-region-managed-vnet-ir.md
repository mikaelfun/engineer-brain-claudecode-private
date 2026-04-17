---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Security and Access Control/Multi-region and multi-Vnets for Managed IR"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Security%20and%20Access%20Control/Multi-region%20and%20multi-Vnets%20for%20Managed%20IR"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Multi-region and multi-VNets for Managed IR

Microsoft Purview now supports multi-regions and multi-VNets for Managed VNet Integration Runtimes (IR) (GA).

## Capabilities

1. Create multiple Managed VNets (max 5) across different regions within a single Purview Account
2. Network isolation within organizations to address data residency or scan performance concerns

## Feature Details

When customers create Managed VNet IRs, they specify the Managed Virtual Network name for a selected region. Private endpoints are automatically created. When a Managed VNet IR is deleted, associated private endpoints, IR, and Managed Virtual Network are all deleted.

## References

- Blog: [Introducing new version of Managed Virtual Network in Microsoft Purview](https://techcommunity.microsoft.com/t5/security-compliance-and-identity/introducing-new-version-of-managed-virtual-network-in-microsoft/ba-p/3984969)
- Doc: [Managed Virtual Network and managed private endpoints](https://learn.microsoft.com/en-us/purview/catalog-managed-vnet)

## Troubleshooting

No new logs or Kusto tables for this feature. Use [existing VNet TSGs](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/913050/VNet-issue-checklists) for troubleshooting.
