---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Share/Kusto tables for Data share"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Share%2FKusto%20tables%20for%20Data%20share"
importDate: "2026-04-05"
type: reference-guide
---

# Azure Data Share / Purview Share — Kusto Tables Reference

Cluster: `babylon.eastus2.kusto.windows.net` / Database: `babylonMdsLogs`

## Primary Log Tables

| Table | Purpose |
|-------|---------|
| **ShareLogEvent** | Core execution operations log, searchable by correlation ID |
| **ShareIncomingLogEvent** | Incoming client calls — latency and status codes |
| **ShareArtifactStoreServiceLogEvent** | Metadata persistence to downstream storage |
| **ShareMetadataServiceLogEvent** | Metadata service operations |
| **ShareOutgoingLogEvent** | Outgoing calls to downstream services — latency and status codes |
| **AccountInfoSnapshotEvent** | Account name ↔ Account ID mapping |

## Querying by Correlation ID

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

## Finding Correlation ID
Customer can find the correlation ID in browser network tab → look for `x-ms-correlation-request-id` header in API response.
