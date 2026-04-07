---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Share/Error Messages Reference for Share in Purview/Data share Kusto query to debug the issue and get error logs"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20%28TSGs%29%2FData%20Share%2FError%20Messages%20Reference%20for%20Share%20in%20Purview%2FData%20share%20Kusto%20query%20to%20debug%20the%20issue%20and%20get%20error%20logs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Data Share — Kusto Queries for Debugging and Error Logs

## Account ID Lookup

Get the mapping between account name and account ID from `AccountInfoSnapshotEvent` table:

```kusto
AccountInfoSnapshotEvent
| where AccountName == '{AccountName}'
| project AccountId
```

## Query 1: By Account Name (when correlation ID is not provided)

```kusto
ShareLogEvent
| where env_time > datetime('{StartTime}') and env_time < datetime('{EndTime}')
| where AccountId in (
    (AccountInfoSnapshotEvent
    | where AccountName == '{AccountName}'
    | project AccountId)
)
```

## Query 2: By Correlation ID (when customer provides correlation ID)

```kusto
ShareLogEvent
| where env_time > datetime('{StartTime}') and env_time < datetime('{EndTime}')
| where correlationId in ('{SingleCorrelationId}')
```

## Notes

- **AccountName**: the Purview instance name
- **AccountId**: the corresponding Purview instance ID
- The mapping is available in `AccountInfoSnapshotEvent` table
- Customer can provide the correlation ID from the portal request headers: look for `x-ms-correlation-request-id` in browser dev tools / HAR file
