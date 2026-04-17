---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Classification and sensitivity labels/Kusto Query Bank"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Classification%20and%20sensitivity%20labels/Kusto%20Query%20Bank"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Classification Kusto Query Bank

## Exception Classification & Analysis

Get all errors/exceptions in data scan for the past x days, summarized by Module:

```kql
DataScanAgentEvent
| where env_time > ago(1d)
| where Message !contains "OpInfo:" and Message !contains "Sequence" and Message !contains "Processed " and Message !contains "Uri : "
| where Message !contains "(403) Forbidden"
| where Message contains "exception"
| summarize count() by Source
| order by count_ desc
```

### Common Source Modules

| Source | Description |
|--|--|
| jobs name=infoOps.Handler.WarmPath | WarmPath handler exceptions |
| ShufModule | Shuffle module exceptions |
| progressreport | Progress reporting exceptions |
| parsers.document | Document parser exceptions |
| weights-classify | Classification weight exceptions |
| connectors.powerbi | Power BI connector exceptions |

## Per-Module Exception Stack Analysis

For each module, get unique exception call stacks statistics:

```kql
DataScanAgentEvent
| where env_time > ago(1d)
| where Message !contains "OpInfo:" and Message !contains "Sequence" and Message !contains "Processed " and Message !contains "Uri : "
| where Message !contains "(403) Forbidden"
| where Message contains "exception"
| where Source == "{ModuleName}"
| summarize count() by Message
| order by count_ desc
```
