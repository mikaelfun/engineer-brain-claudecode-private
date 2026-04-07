---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Tools/Kusto Queries/Classification Insights"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTools%2FKusto%20Queries%2FClassification%20Insights"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Classification Insights — Kusto Queries

This set of queries will report the assets and classifications considered by L1, L2 and L3 scanning. Note, NO classification is done at L2. Also note, that these assets and classifications may be still dropped by the Offline Tier for threshold, or by the Online Tier in case of any unexpected ingestion errors.

**Input Required:** Scan Run Id

**Attached Query File:** [ASCClassificationInsights.txt](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTools%2FKusto%20Queries%2FClassification%20Insights) (see wiki page for download)

## Usage Notes

- Use ASC (Azure Support Center) Classification Insights to run these queries
- Queries cover L1, L2, L3 scanning tiers
- L2 does NOT perform classification
- Results may be further filtered by Offline Tier (threshold) or Online Tier (ingestion errors)
