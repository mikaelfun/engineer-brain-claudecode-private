---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Common/Determine if DNS Zone is Public or Private"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FDetermine%20if%20DNS%20Zone%20is%20Public%20or%20Private"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Determine if a DNS Zone is Public or Private

[[_TOC_]]

> **Note:** This article applies to **legacy** private DNS zones created using the `dnszones` resource type. All current private DNS zones use `privateDnsZones`. Customers with legacy zones should migrate using the [migration guide](https://docs.microsoft.com/en-us/azure/dns/private-dns-migration-guide). Support for legacy (preview) zones ended 12/30/2019.

## Overview

When troubleshooting Azure DNS SRs, it may not be immediately clear if a DNS zone is Public or Private. Two methods to distinguish:

## Method 1: Check the NRP Resource URI (Preferred)

- **Public Zone**: `.../providers/Microsoft.Network/dnszones/...`
- **Private Zone (new)**: `.../providers/Microsoft.Network/privateDnsZones/...`

Example Public:
```
/subscriptions/00000000.../resourceGroups/ryanb-dns-rg/providers/Microsoft.Network/dnszones/ryanborstelmann.com
```

Example Private:
```
/subscriptions/00000000.../resourceGroups/v-jorut/providers/Microsoft.Network/privateDnsZones/johncorp.contoso.com
```

## Method 2: Check for nameServer Record Sets

- **Public Zone**: `nameServers` field is populated (e.g., `ns1-05.azure-dns.com.`, etc.)
- **Private Zone**: `nameServers` field is `null`

Retrieve DNS JSON output from [Azure Support Center](https://azuresupportcenter.msftcloudes.com) or Jarvis and check the `properties.nameServers` value.

**Public Zone example:**
```json
{
  "type": "Microsoft.Network/dnszones",
  "properties": {
    "nameServers": [
      "ns1-05.azure-dns.com.",
      "ns2-05.azure-dns.net.",
      "ns3-05.azure-dns.org.",
      "ns4-05.azure-dns.info."
    ]
  }
}
```

**Private Zone example:**
```json
{
  "type": "Microsoft.Network/dnszones",
  "properties": {
    "nameServers": null
  }
}
```
