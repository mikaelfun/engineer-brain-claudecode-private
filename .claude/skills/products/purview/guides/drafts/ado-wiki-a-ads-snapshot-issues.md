---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Share/Azure Data Share (ADS)/Snapshot issues"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20%28TSGs%29%2FData%20Share%2FAzure%20Data%20Share%20%28ADS%29%2FSnapshot%20issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Data Share (ADS) — Snapshot Issues

> ADS relies on Azure Data Factory pipelines and copy activities after a snapshot is triggered. ADS PG has limited control once a snapshot has run successfully.

## Scenario 1: Snapshot Failed (with no clear error message)

If the snapshot failed and there is no clear error message to guide mitigation:

1. Refer to [Kusto query to find pipeline IDs and error messages of datasets](../ado-wiki-ads-snapshot-troubleshooting.md) to check the translated error and get more details on why the pipeline failed.
2. If the Kusto results are still insufficient to mitigate, **raise an AVA and engage the SME**.

## Scenario 2: Snapshot Succeeded but Unexpected Results

If the snapshot completed successfully but the customer reports unexpected data (missing data / duplicate data / unexpected format / data corruption):

1. Refer to [Kusto query to find pipeline IDs and error messages of datasets](../ado-wiki-ads-snapshot-troubleshooting.md) to find the **pipeline run ID** for the affected dataset.
2. Create a **collaboration ticket to ADF support** with the pipeline IDs to confirm and understand the behavior and root cause.

> **Example:** Customer received SQL data with `NULL` values, and when moved to CSV in storage, `NULL` was replaced with `\N` — customer expected empty strings. This type of format behavior is governed by ADF, not ADS.

3. If ADF support confirms the issue is NOT from ADF side, raise an AVA with the information provided.
