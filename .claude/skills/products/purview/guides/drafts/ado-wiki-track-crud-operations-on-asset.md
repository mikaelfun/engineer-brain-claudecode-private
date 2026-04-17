---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/How to track Create&Update&Delete operation on an asset"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/How to track Create%26Update%26Delete operation on an asset"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Track Create/Update/Delete Operations on an Asset

## Use Cases
- Understanding ingestion history of an asset in catalog
- Investigating duplicate assets from same or different scan runs
- Asset suddenly disappears from catalog
- Identifying who (scan, SPN, API) created an asset

## Step 1: Get Catalog ID

```kql
whois("<purview_account_name>")
```

## Step 2: Get Ingestion History

Query with asset FQDN and catalog ID:

```kql
OnlineTierDetails
| where CatalogId == "<catalog_id>"
| where Msg contains "<asset_fqdn>"
//| where Msg contains "Generating UKVertexItem"  -- uncomment for creation-only filter
| project ['time'], PodName, RequestId, Msg
```

Filter results by Msg content and copy the RequestId.

## Step 3: Identify Request Source

```kql
OnlineTierWebRequests
| where RequestId == "<request_id_from_step2>"
| project ['time'], User, RequestId, strcat(Method, RequestUrl), ApiCaller, Detail
```

### ApiCaller Values
| ApiCaller | Meaning |
|-----------|---------|
| DataScan | Asset created/modified by scan job |
| OfflineTier | Asset modified by offline tier enrichment |
| PurviewPortal | Asset modified via Purview portal UI |
| _(empty)_ | Request came from REST API call (e.g., Postman, SDK) |
