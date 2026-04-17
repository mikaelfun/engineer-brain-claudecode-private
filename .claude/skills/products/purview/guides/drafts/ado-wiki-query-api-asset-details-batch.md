---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/SDK and API/How can I get all asset detail information from Query API"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FSDK%20and%20API%2FHow%20can%20I%20get%20all%20asset%20detail%20information%20from%20Query%20API"
importDate: "2026-04-05"
type: operational-guide
---

# How to Get All Asset Detail Information from Query API

## Background
Query API returns brief asset info but not full details (attributes, schema, etc.). Need secondary calls to fetch asset details by GUIDs.

## Limitations
- Maximum offset is 100,000 assets (not practical for large datasets)
- Asset changes during pagination may cause missing/duplicate results
- Use proper filters/keywords to limit result count

## Detail Steps

1. Prepare REST API environment
2. Send Query API with filters:
   ```json
   POST https://{endpoint}/catalog/api/search/query?api-version={apiVersion}
   {
     "keywords": "<keywords>",
     "filter": {"and": [{"collectionId": "testCollection"}, {"entityType": "azure_blob_path"}]},
     "offset": 0,
     "limit": 20,
     "orderby": ["id"]
   }
   ```
3. Extract GUIDs from response `value[].id`
4. Call **List by GUIDs API** with the GUIDs to get full details
5. Increment offset by limit, repeat steps 2-4 until `offset + limit > @search.count`

## Batch Update Pattern
- Always query with offset=0
- Use `"not": {"term": "TargetTerm"}` filter to exclude already-updated assets
- Query → Update → repeat until results = 0

## Batch Delete Pattern
- Always query with offset=0 (deleted assets won't appear in next query)
- Query → Delete by GUIDs API → repeat until results = 0
- **Important**: Delete by GUIDs API requires header `Content-Type: application/json`
