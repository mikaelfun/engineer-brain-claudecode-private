---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure Private DNS zones/Feature: Fallback to Internet for Azure Private DNS zones"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FFeature%3A%20Fallback%20to%20Internet%20for%20Azure%20Private%20DNS%20zones"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Overview

Azure Private DNS Zones is a globally available, fully managed, cloud-native DNS service. When linked to a VNet, it provides authoritative responses for matching namespace queries and hosts private records for Azure Private Link endpoints.

## Problem

The growing use of Azure Private Link and network isolation across different tenants highlighted a need for an alternative name resolution path when authoritative Private DNS returns an NXDOMAIN response. Traditional IaaS VM-based workarounds increased operational complexity, security risks, and costs.

## Solution: NxDomainRedirect Resolution Policy

By introducing the `"resolutionPolicy"` property in Azure Private DNS Zones, a fully managed native solution is now available. When an authoritative NXDOMAIN response is received from Private DNS Zones, the Azure Recursive Resolver retries the query using the public endpoint QNAME.

## Policy Configuration

Requires `api-version=2024-06-01` or higher. Set `"resolutionPolicy": "NxDomainRedirect"` at the **virtualNetworkLinks** resource level:

```JSON
{
  "id": "string",
  "name": "string",
  "type": "Microsoft.Network/privateDnsZones/virtualNetworkLinks",
  "location": "global",
  "properties": {
    "provisioningState": "Succeeded",
    "registrationEnabled": false,
    "resolutionPolicy": "NxDomainRedirect",
    "virtualNetwork": {
      "id": "string"
    }
  }
}
```

Via Azure CLI:

```bash
az network private-dns link vnet update \
  --resource-group {Resource Group Name} \
  -n {Private DNS link Name} \
  -z {Private DNS zone name} \
  --resolution-policy NxDomainRedirect
```

Ensure Azure CLI is at latest version. Download URL: `https://azcliprod.blob.core.windows.net/msi/azure-cli-<version>-x64.msi`

## How it works

When `NxDomainRedirect` is applied:
1. VM queries Private DNS zone → NXDOMAIN returned
2. Azure Recursive Resolver retries the query using the public endpoint QNAME
3. Public resolution succeeds → CNAME chain resolved seamlessly

### Customer Experience (expected nslookup output)
```
C:\Users\azureuser>nslookup remoteprivateendpoint.blob.core.windows.net
Server:  UnKnown
Address:  168.63.129.16

Non-authoritative answer:
Name:    blob.mwh20prdstr02e.store.core.windows.net
Address:  20.60.153.33
Aliases:  remoteprivateendpoint.blob.core.windows.net
          remoteprivateendpoint.privatelink.blob.core.windows.net
```

## Verify NxDomainRedirect is working

1. In ASC, check the VNet Link for the Private DNS zone. The property `Policy Resolution` should show `NxDomainRedirect`.
2. Verify via Kusto [DnsServingPlaneProd](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/448501/Log-Sources-for-Azure-DNS?anchor=resolution%3A-**dnsservingplaneprod**):
   ```kusto
   | where AliasNameChaseCount == 1
   | where AliasNameChaseBitMask == 2
   ```
   - `AliasNameChaseCount`: number of times alias chasing was done
   - `AliasNameChaseBitMask == 2`: confirms privatednsfallback is active

## Limitations

- Only available for Private DNS zones associated to **Private Link** resources.
- `resolutionPolicy` currently only accepts `"Default"` and `"NxDomainRedirect"`.
