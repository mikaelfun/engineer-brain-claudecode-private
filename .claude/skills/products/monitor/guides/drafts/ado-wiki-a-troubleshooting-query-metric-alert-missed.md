---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Query Metric alert didn't fire when it should (Missed-Alert)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20Query%20Metric%20alert%20didn't%20fire%20when%20it%20should%20(Missed-Alert)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario

This troubleshooting guide applies to Query-based (Prometheus) Metric alert that didn't fire when it should.

# Information you will need

- Resource id of the Alert rule (from ASC)
- Timestamp in UTC when alert was expected to fire (from customer)

# Troubleshooting

## Step 1: Verify alert rule configuration

In ASC, navigate to alert rule under microsoft.insights/metriclalerts. Note scope, query, evaluation frequency and failing periods.

Ensure the rule Criteria is "PromQLCriteria", otherwise use the standard Metric alert missed TSG instead.

## Step 2: Check alert is already in a fired state

Only matters if rule is configured for "Auto-Resolve". Navigate to Fired Alerts tab.

- **Alert already fired and not resolved**: Expression must return no data for the configured duration before it resolves
- **Alert resolved or never fired**: Proceed to validate the expression

## Step 3: Validate the expression

### Using ASC (for AMW-scoped rules)
Navigate to Prometheus workspace in ASC → "Query Prometheus Endpoint with Range" tab.

- Paste expression, set time range
- Calculate "steps" field: if rule frequency is PT1M, steps = 60 (seconds)
- Results show JSON with values array: [epoch_timestamp, "value"]

**Prometheus Rules need a value to consider the alert triggered.** If expression ends with a comparator (e.g., < 1), only values meeting the criteria will show. Remove the comparator to see all values and compare.

### Using customer's Managed Grafana
Have customer open Managed Grafana → Explore section → paste expression → run query.

## Step 4: Analyze Rule Executions

In ASC, navigate to "Executions History (Query)" tab. Check each evaluation:

- All evaluations should be status "Evaluated" (if not, check Resource Health tab)
- "Returned time series" = 0 → data latency issue (jump to data latency section)
- Returned time series > 0 but "Fired Alerts" = 0 or "Alerts Handled by adapter" = 0 → escalate to PG

## Dealing with Data Latency

Two options:
1. **Offset modifier** (recommended): Add 1-2 minutes offset to PromQL expression per Prometheus docs: `rate(metric[5m] offset 2m)`
2. **Collection/metric store issue** (rare): File CRI to Container Insights / AzureManagedPrometheusAgent
