---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Log to Metric alert fired when it shouldn't have (False Alert)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20Log%20to%20Metric%20alert%20fired%20when%20it%20shouldn't%20have%20(False%20Alert)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Concept

Log to Metric service (LAMI - log analytics metric ingestion) uses Log Analytics to retrieve metrics from logs, transforms them into MDM extension format and passes to MDM. Recently utilizes the Northstar ingestion pipeline.

Architecture: Log Analytics → Northstar Pipeline → LogToMetric Service → MDM → Geneva Health Evaluation

# Scenario

This troubleshooting guide applies to Log to Metric alert that fired when it should not have.

# Information you will need

- Resource id of the Alert rule (from ASC)
- Timestamp in UTC when alert was fired (from customer)

# Troubleshooting

## Step 1: Verify a corresponding log alert exists

In ASC, navigate to alert rule under microsoft.insights/metriclalerts. A corresponding alert rule with same name and scope should exist with alert type "Log to Metric".

- **No corresponding log alert** → Refer customer to public docs for creating metric alert for log analytics
- **Yes** → Proceed to step 2

## Step 2: Review metric chart

Follow "How to chart metric data in ASC" using target resource scope and alert fire time. Filter by affected dimension values.

## Step 3: Compare metric value with evaluation data

Navigate to alert rule **Execution History** tab. Expand **SUCCESS : EVALUATION COMPLETE - ALERT ACTIVATED** event.

Review: Metric Data Window, Evaluation Result, Evaluation Data.

**Note**: ASC only displays first 3 timeseries. For more, use the logs link in Evaluation Logs column (Jarvis query). LogTag value of **ThresholdViolated** indicates threshold was met.

- **Values match** → Verify alert rule settings match expected behavior
- **Values don't match** → Proceed to step 4

## Step 4: Investigate log ingestion (Northstar pipeline)

Follow "How to get the metrics ingested from Northstar pipeline to LogToMetric service in Kusto".

- **Significant latency or missing records** → Investigate with Log Analytics ingestion PG
- **No latency** → Proceed to step 5

## Step 5: Investigate metrics ingestion to MDM

Follow "How to get metrics ingested from LogToMetric service to MDM in Kusto".

- **LogToMetricToMDMLatencyInMS high** → Escalate to Metric Alerts PG
- **maxLatency high** → Escalate to Log Analytics GDS team via ICM to Geneva Monitoring / Consumption Platform CRIs Team

## Step 6: Check for Log to metric related monitors

Navigate to pre-populated ICM query and adjust timeframe. Look for IngestionQueueLength sev2 followed by FiredAlertsCount_L2M sev2 on same region.

To verify issues not communicated via Service Health, reach out to Metric Alerts dev team (azuremetricalerts@microsoft.com) or EEE (azmonitoreee@microsoft.com).
