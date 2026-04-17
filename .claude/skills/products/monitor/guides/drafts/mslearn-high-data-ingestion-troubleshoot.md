# High Data Ingestion Troubleshooting in Application Insights / Log Analytics

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/troubleshoot-high-data-ingestion
> Quality: guide-draft | 21vApplicable: true

## Step 1: Identify High-Cost Resources

Azure Portal > Subscription > Cost Management > Cost analysis -> chart costs per resource

## Step 2: Identify Costly Tables

### By Record Count
```kql
search *
| where timestamp > ago(7d)
| summarize count() by $table
| sort by count_ desc
```

### By Consumed Bytes
```kql
systemEvents
| where timestamp > ago(7d)
| where type == "Billing"
| extend BillingTelemetryType = tostring(dimensions["BillingTelemetryType"])
| extend BillingTelemetrySizeInBytes = todouble(measurements["BillingTelemetrySize"])
| summarize TotalBillingTelemetrySize = sum(BillingTelemetrySizeInBytes) by BillingTelemetryType
| extend BillingTelemetrySizeGB = format_bytes(TotalBillingTelemetrySize, 1, "GB")
| sort by BillingTelemetrySizeInBytes desc
```

### Log Analytics Workspace
Navigate to workspace > Monitoring > Workbooks > "Usage" under Log Analytics Workspace Insights

## Step 3: Determine Contributing Factors

```kql
// By role instance
requests | where timestamp > ago(7d) | summarize count() by cloud_RoleInstance | sort by count_ desc

// By operation
requests | where timestamp > ago(7d) | summarize count() by operation_Name | sort by count_ desc

// By dependency type
dependencies | where timestamp > ago(7d) | summarize count() by type | sort by count_ desc

// Noisy trace messages
traces | where timestamp > ago(7d) | summarize count() by message | sort by count_ desc

// Noisy exceptions
exceptions | where timestamp > ago(7d) | summarize count() by message | sort by count_ desc
```

## Step 4: Investigate Timeline

```kql
dependencies
| where timestamp > ago(30d)
| summarize count() by bin(timestamp, 1d), operation_Name
| sort by timestamp desc
```

## Cost Reduction Methods

1. **Daily Cap**: Adjust daily cap to prevent excessive ingestion
2. **Table Plan Switch**: Switch to Basic table plan for less-queried tables
3. **Java Agent Sampling**: Use sampling overrides, reduce log level, disable instrumentations
4. **Application Code**: Fix noisy exceptions, reduce log verbosity

### Java Agent Specific Reductions
- Traces: reduce log level, use MDC attribute + sampling override, disable logging instrumentation
- Dependencies: suppress specific Java methods, disable specific instrumentations
- CustomMetrics: increase metrics interval, exclude metrics with telemetry processor
- Attributes: remove unnecessary OpenTelemetry attributes with attribute processor

## Log Analytics Workspace Query (Billable Size)
```kql
search *
| where TimeGenerated > ago(7d)
| where _IsBillable == true
| summarize TotalBilledSize = sum(_BilledSize) by $table
| extend IngestedVolumeGB = format_bytes(TotalBilledSize, 1, "GB")
| sort by TotalBilledSize desc
```
