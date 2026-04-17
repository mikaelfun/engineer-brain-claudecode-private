# Purview Azure Data Share (ADS) — 排查工作流

**来源草稿**: `ado-wiki-a-ads-snapshot-issues.md`, `ado-wiki-a-data-share-kusto-debug.md`, `ado-wiki-a-sla-alert.md`, `ado-wiki-ads-kusto-tables-reference.md`
**Kusto 引用**: 无
**场景数**: 11
**生成日期**: 2026-04-07

---

## Scenario 1: Azure Data Share (ADS) — Snapshot Issues
> 来源: ado-wiki-a-ads-snapshot-issues.md | 适用: 未标注

### 排查步骤
> ADS relies on Azure Data Factory pipelines and copy activities after a snapshot is triggered. ADS PG has limited control once a snapshot has run successfully.

`[来源: ado-wiki-a-ads-snapshot-issues.md]`

---

## Scenario 2: Scenario 1: Snapshot Failed (with no clear error message)
> 来源: ado-wiki-a-ads-snapshot-issues.md | 适用: 未标注

### 排查步骤
If the snapshot failed and there is no clear error message to guide mitigation:

1. Refer to [Kusto query to find pipeline IDs and error messages of datasets](../ado-wiki-ads-snapshot-troubleshooting.md) to check the translated error and get more details on why the pipeline failed.
2. If the Kusto results are still insufficient to mitigate, **raise an AVA and engage the SME**.

`[来源: ado-wiki-a-ads-snapshot-issues.md]`

---

## Scenario 3: Scenario 2: Snapshot Succeeded but Unexpected Results
> 来源: ado-wiki-a-ads-snapshot-issues.md | 适用: 未标注

### 排查步骤
If the snapshot completed successfully but the customer reports unexpected data (missing data / duplicate data / unexpected format / data corruption):

1. Refer to [Kusto query to find pipeline IDs and error messages of datasets](../ado-wiki-ads-snapshot-troubleshooting.md) to find the **pipeline run ID** for the affected dataset.
2. Create a **collaboration ticket to ADF support** with the pipeline IDs to confirm and understand the behavior and root cause.

> **Example:** Customer received SQL data with `NULL` values, and when moved to CSV in storage, `NULL` was replaced with `\N` — customer expected empty strings. This type of format behavior is governed by ADF, not ADS.

3. If ADF support confirms the issue is NOT from ADF side, raise an AVA with the information provided.

`[来源: ado-wiki-a-ads-snapshot-issues.md]`

---

## Scenario 4: Account ID Lookup
> 来源: ado-wiki-a-data-share-kusto-debug.md | 适用: 未标注

### 排查步骤
Get the mapping between account name and account ID from `AccountInfoSnapshotEvent` table:

```kusto
AccountInfoSnapshotEvent
| where AccountName == '{AccountName}'
| project AccountId
```

`[来源: ado-wiki-a-data-share-kusto-debug.md]`

---

## Scenario 5: Query 1: By Account Name (when correlation ID is not provided)
> 来源: ado-wiki-a-data-share-kusto-debug.md | 适用: 未标注

### 排查步骤
```kusto
ShareLogEvent
| where env_time > datetime('{StartTime}') and env_time < datetime('{EndTime}')
| where AccountId in (
    (AccountInfoSnapshotEvent
    | where AccountName == '{AccountName}'
    | project AccountId)
)
```

`[来源: ado-wiki-a-data-share-kusto-debug.md]`

---

## Scenario 6: Query 2: By Correlation ID (when customer provides correlation ID)
> 来源: ado-wiki-a-data-share-kusto-debug.md | 适用: 未标注

### 排查步骤
```kusto
ShareLogEvent
| where env_time > datetime('{StartTime}') and env_time < datetime('{EndTime}')
| where correlationId in ('{SingleCorrelationId}')
```

`[来源: ado-wiki-a-data-share-kusto-debug.md]`

---

## Scenario 7: Notes
> 来源: ado-wiki-a-data-share-kusto-debug.md | 适用: 未标注

### 排查步骤
- **AccountName**: the Purview instance name
- **AccountId**: the corresponding Purview instance ID
- The mapping is available in `AccountInfoSnapshotEvent` table
- Customer can provide the correlation ID from the portal request headers: look for `x-ms-correlation-request-id` in browser dev tools / HAR file

`[来源: ado-wiki-a-data-share-kusto-debug.md]`

---

## Scenario 8: Azure Data Share / Purview Share — Kusto Tables Reference
> 来源: ado-wiki-ads-kusto-tables-reference.md | 适用: 未标注

### 排查步骤
Cluster: `babylon.eastus2.kusto.windows.net` / Database: `babylonMdsLogs`

`[来源: ado-wiki-ads-kusto-tables-reference.md]`

---

## Scenario 9: Primary Log Tables
> 来源: ado-wiki-ads-kusto-tables-reference.md | 适用: 未标注

### 排查步骤
| Table | Purpose |
|-------|---------|
| **ShareLogEvent** | Core execution operations log, searchable by correlation ID |
| **ShareIncomingLogEvent** | Incoming client calls — latency and status codes |
| **ShareArtifactStoreServiceLogEvent** | Metadata persistence to downstream storage |
| **ShareMetadataServiceLogEvent** | Metadata service operations |
| **ShareOutgoingLogEvent** | Outgoing calls to downstream services — latency and status codes |
| **AccountInfoSnapshotEvent** | Account name ↔ Account ID mapping |

`[来源: ado-wiki-ads-kusto-tables-reference.md]`

---

## Scenario 10: Querying by Correlation ID
> 来源: ado-wiki-ads-kusto-tables-reference.md | 适用: 未标注

### 排查步骤
When customer provides correlation ID:
```kql
ShareLogEvent
| where env_time > datetime('{StartTime}') and env_time < datetime('{EndTime}')
| where correlationId in ('{CorrelationId}')
```

When correlation ID is not available (query by account name):
```kql
ShareLogEvent
| where env_time > datetime('{StartTime}') and env_time < datetime('{EndTime}')
| where AccountId in ((AccountInfoSnapshotEvent
  | where AccountName == '{AccountName}'
  | project AccountId))
```

`[来源: ado-wiki-ads-kusto-tables-reference.md]`

---

## Scenario 11: Finding Correlation ID
> 来源: ado-wiki-ads-kusto-tables-reference.md | 适用: 未标注

### 排查步骤
Customer can find the correlation ID in browser network tab → look for `x-ms-correlation-request-id` header in API response.

`[来源: ado-wiki-ads-kusto-tables-reference.md]`

---
