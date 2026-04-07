---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Log Alerts/How to unzip a log alert troubleshooting query"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FLog%20Alerts%2FHow%20to%20unzip%20a%20log%20alert%20troubleshooting%20query"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to unzip a log alert troubleshooting query

## When to Use

When following a log alerts troubleshooting guide and the troubleshooting query in ASC is only partially displayed (truncated). This happens when the manipulated query executed by the log alert engine is very long (particularly with optimization flow), requiring compression.

## Steps

1. Run this Kusto query in any Kusto Explorer or Azure Data Explorer cluster/database:

```kql
let modifiedQuery = gzip_decompress_from_base64_string("ZIPPEDQUERYGOESHERE");
print modifiedQuery
```

Replace `ZIPPEDQUERYGOESHERE` with the **hashed** (base64) string from the truncated troubleshooting query.

2. Copy the output for use in the next steps of the troubleshooting guide.

> **Note:** In Kusto Explorer, a preview of the query result may be returned showing truncated text, but copy/paste will give you the full query text.
