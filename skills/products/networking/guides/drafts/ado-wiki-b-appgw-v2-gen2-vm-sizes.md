---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: New VM sizes for Application Gateway v2 (Alpha SKU)"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20New%20VM%20sizes%20for%20Application%20Gateway%20v2%20(Alpha%20SKU)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# New VM Sizes for Application Gateway v2 (Generation 2)

## Overview

Application Gateway v2 will upgrade the underlying VMSS SKU size to **Generation 2 VMs**. This deploys bigger and faster VMs underneath (e.g., Dv5 series instead of Dv2), which offer enhanced performance.

If you are seeing more than 10 capacity units from 1 instance, that is likely because of the new VM generation.

**No billing impact**: Customers will not see any difference in their bill. There is no difference in the fixed price.

Eventually, the AppGW team expects all gateways to be on Generation 2 VMs.

## VM Sizes

### Generation 1
- [Standard_D1_v2](https://learn.microsoft.com/en-us/azure/cloud-services/cloud-services-sizes-specs#dv2-series)

### Generation 2
- [Standard_D2d_v5](https://learn.microsoft.com/en-us/azure/virtual-machines/ddv5-ddsv5-series#ddv5-series)
- [Standard_D2ads_v5 (Planned)](https://learn.microsoft.com/en-us/azure/virtual-machines/dasv5-dadsv5-series#dadsv5-series)

## How to Identify (ASC)

- AppGW team created an insight displayed for corresponding resources
- VMSS and VMSS instances will show the corresponding VM sizes

## API Changes

Starting on `api-version=2023-05-01`, the GET Application Gateway API shows SKU generation:

```json
"sku": {
  "name": "Standard_v2",
  "tier": "Standard_v2",
  "family": "Generation_2"
}
```

## Feature Rollout Timeline (Tentative)

- June 15: Deployment of new Application Gateways in selected region
- July 15: Deployment of new Application Gateways in all regions
- September 15: Start migration of existing deployments (based on capacity)
