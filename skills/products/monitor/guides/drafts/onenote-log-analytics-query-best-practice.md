---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======10. Monitor=======/10.9 Log Analytics Query Best Practice.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Log Analytics Query Best Practice

When using Log Analytics query results as output (e.g., via Logic App query action, exporting as time chart image), follow these best practices:

## 1. Use Time Filters First

Log Analytics tables use Timestamp as key/index. Always put time filter as the first `where` condition for better performance.

```kql
Perf
| where TimeGenerated > ago(24h)
| where ObjectName == 'Container' and CounterName == "Memory Usage MB"
```

## 2. Use Aggregation for Large Data

When exporting data as charts (time chart etc.), aggregate before chart generation to smooth the sample data.

```kql
Perf
| where TimeGenerated > ago(24h)
| where ObjectName == 'Container' and CounterName == "Memory Usage MB"
| summarize value = avg(CounterValue) by bin(TimeGenerated, 1m), Computer
| render timechart
```

## 3. Cross-Table Joins

1. Use a **small dataset to join a large dataset** for better performance
2. Choose the right **join kind**:
   - If the right table may have no data but you still want results, use `kind=leftouter`

```kql
Heartbeat
| where TimeGenerated > ago(1h)
| where Computer == 'myvm'
| distinct Computer
| join kind=leftouter (
    Perf
    | where TimeGenerated > ago(24h)
    | where ObjectName == 'Container' and CounterName == "Memory Usage MB"
) on $left.Computer == $right.Computer
| summarize value = avg(CounterValue) by bin(TimeGenerated, 1m), Computer
| render timechart
```

## References

- [join operator - Azure Data Explorer](https://docs.microsoft.com/en-us/azure/data-explorer/kusto/query/joinoperator)
- [Query best practices - Azure Data Explorer](https://docs.microsoft.com/en-us/azure/data-explorer/kusto/query/best-practices)
