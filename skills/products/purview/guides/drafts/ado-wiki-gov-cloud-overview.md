---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Government Cloud/Gov Cloud Overview"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Government%20Cloud/Gov%20Cloud%20Overview"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Gov Cloud Overview

Authors: Tiffany & Jabril

## What is Gov Cloud?

GCC, GCC High, and DoD are all different Gov tenants based on different restriction/compliance requirements.

## How to Identify Gov Cloud Tenant

Check the M365 Tenant ID. Gov Cloud domain is `https://portal.azure.us/`

## Gov Cloud Identity Mapping

| Tenant Type | Cloud | Identity Provider |
|-------------|-------|-------------------|
| GCC | Public Cloud (Azure Commercial) | Microsoft Entra Public Identity |
| GCC High | Gov Cloud (Fairfax) | Microsoft Entra Government Identity |
| DoD | Gov Cloud (Fairfax) | Microsoft Entra Government Identity |

## Cross-Cloud Scanning Rules

- Cross cloud scanning is **NOT** possible (e.g., West US 2 to US Gov Virginia)
- Cross region scanning **within same cloud** is possible (e.g., US Gov Texas to US Gov Virginia)

## Gov Regions

- US Gov Arizona
- US Gov Virginia
- US Gov Texas

## Fabric / Power BI Government URLs

| Tenant | URL |
|--------|-----|
| Commercial | https://app.powerbi.com |
| GCC | https://app.powerbigov.us |
| GCC High | https://app.high.powerbigov.us |
| DoD | https://app.mil.powerbigov.us |

## Key Limitations

1. **GCC ≠ Gov Power BI**: GCC maps to public cloud; GCC High/DoD map to Gov cloud. Purview in Azure Commercial cannot scan Power BI in Azure Government.
2. **Gov Purview + Fabric**: Gov Cloud Purview can only connect to Government Fabric if tenant is GCC.
3. **Unsupported sources in Azure Government**: Power BI (non-GCC), Amazon RDS, Amazon S3

## Common Error

If Purview is Commercial but Fabric/Power BI is Government, test connection fails with "PowerBI administrator API could not fetch basic metadata and lineage" — Access succeeds but Assets/Lineage/Enhanced fail.

## References

- [Cloud feature availability](https://learn.microsoft.com/en-us/purview/feature-availability#azure-government-guidance-and-recommendations)
- [Power BI for US Government](https://learn.microsoft.com/en-us/power-bi/enterprise/service-govus-overview)
- [Region pairing](https://learn.microsoft.com/en-us/azure/azure-government/documentation-government-welcome#region-pairing)
