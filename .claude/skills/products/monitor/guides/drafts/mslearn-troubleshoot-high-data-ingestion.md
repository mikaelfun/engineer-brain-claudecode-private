---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/troubleshoot-high-data-ingestion"
importDate: "2026-04-20"
type: guide-draft
---

# Troubleshoot High Data Ingestion in Application Insights

## General Troubleshooting Flow

### Step 1: Identify High-Cost Resources
Navigate to subscription > Cost Management > Cost analysis to chart costs per resource.

### Step 2: Identify Costly Tables
- By record count:
  ```kusto
  search * | where timestamp > ago(7d) | summarize count() by $table | sort by count_ desc
  ```
- By consumed bytes:
  ```kusto
  systemEvents | where timestamp > ago(7d) | where type == "Billing"
  | extend BillingTelemetryType = tostring(dimensions["BillingTelemetryType"])
  | extend Size = todouble(measurements["BillingTelemetrySize"])
  | summarize TotalSize = sum(Size) by BillingTelemetryType
  | sort by TotalSize desc
  ```
- Use Log Analytics Workbooks > Usage workbook for visual insights

### Step 3: Determine Contributing Factors
Sample queries to identify noisy sources:
- requests by cloud_RoleInstance
- dependencies by cloud_RoleName or type
- traces by message
- exceptions by message

### Step 4: Investigate Ingestion Evolution Over Time
```kusto
dependencies | where timestamp > ago(30d)
| summarize count() by bin(timestamp, 1d), operation_Name
| sort by timestamp desc
```

## Cost Reduction Methods

1. **Daily Cap**: Adjust daily cap to prevent excessive ingestion
2. **Table Plan**: Switch to Basic table plan for applicable tables
3. **Java Agent Sampling**: Use sampling overrides, suppress health checks, reduce log levels, disable unnecessary instrumentation
4. **Application Code**: Fix noisy exceptions, adjust log levels
