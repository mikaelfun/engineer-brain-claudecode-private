---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Log Search alert fired when it shouldn't have (False Alert)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Alerts/Troubleshooting%20Guides/Troubleshooting%20Log%20Search%20alert%20fired%20when%20it%20shouldn't%20have%20(False%20Alert)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Log Search Alert Fired When It Shouldn't Have (False Alert)

> **Note:** Log alerts evaluation telemetry retention is limited to 30 days to comply with GDPR requirements.

## Scenario

This troubleshooting guide applies to a Log alert (aka Log Search alert) that fired when it should not.

## Information You Will Need

- The resource id of the Alert rule (selected by customer when opening support request)
- The timestamp in UTC where alert was fired (provided by the customer)

## Known Issues

Search for known issues with tags AlertsAndActionGroups AND LogAlerts in the AzureMonitor ADO project.

## Troubleshooting Steps

### Step 1: Verify Alert Rule Configuration

In Azure Support Center, navigate to relevant alert rule under `microsoft.insights/scheduledqueryrules`. Take note of the alert condition.

Take note of the extended properties. If there has been at least 1 successful evaluation, the alert rule is in an enabled state, but you see many N/A fields (particularly for Frequency and Threshold), then this is most likely a **Simple Log Alert Rule**.

### Step 2: Review Evaluation History Data

- In Azure Support Center, navigate to **execution history** tab and filter by Start Time and End Time in UTC based on the time frame when the alert fired. Click **Run**.
- Expand the operation with status **SUCCESS: ALERT FIRED** which corresponds to the timestamp in which the alert fired. Copy the **Operation Id**.
- On the **Alert run details tab**, paste the Operation Id and timestamp of the evaluation and click **Run**.

### Step 3: Look for Query Results

**Is the affected alert rule V1 with number of results alert action type?**

#### If No (V1 metric measurement or V2):

Follow the guide to see the dimensions for which the threshold was met. If query returns no results → empty results returned in evaluation.

**Check: Did the query return no results AND is the alert using the `adx("")` or `arg("")` pattern?**

- **Yes (no results + adx/arg pattern)**: Validate that the managed identity has correct access to the relevant data sources:
  - ADX cluster (if using `adx("")` pattern)
  - Resources queried by Azure Resource Graph query (if using `arg("")` pattern)
  - If managed identity lacks permissions → instruct customer to add necessary access per [Create or edit a log search alert rule - managed identity](https://learn.microsoft.com/azure/azure-monitor/alerts/alerts-create-log-alert-rule/#managed-id)
  - If permissions are correct → continue to Step 4

- **No (query returned results)**: Continue to Step 4
- **No (no results but not adx/arg)**: Continue to Step 4

#### If Yes (V1 number of results):

Look for **Query results** - this is the evaluated value that determined an alert should fire.

### Step 4: Run Troubleshooting Query

> **For ADX rules**: Create a collaboration with Azure Data Explorer support team to investigate query results and potential ingestion delay.
> **For ARG rules**: Create a collaboration with Azure Resource Graph support team. ARG tables don't support timestamp columns; current results may differ from evaluation time.

1. Go to **Alert run details tab** → **Alert execution summary** → copy the **Troubleshooting query**
2. If query exceeds certain length, the engine truncates and zips it — follow unzip guide
3. In ASC resource explorer, locate the workspace/App Insights component resource ID in alert rule properties scope field
4. **Important**: If rule is scoped to specific resource (resource centric), use LA/AI component from permission object section and filter query results by scope resource Id
5. Paste query into **Query Customer Data** tab → Time Range: "The query contains time range filters" → Run

**Note on optimization flow**: If evaluation used optimization flow (you'll see `LSA_optimization_sliding_win` in result set) and more than one bucket met the threshold — the newest bucket (highest number) is the one for which alert was fired.

### Step 5: Compare Results from Previous Steps with Customer Findings

**Are query results different between steps 3 and 4 or customer's manual query shows different results?**

#### Yes, different — Step 4 value no longer meets threshold:

1. **Check for ingestion latency**:
   - If customer query runs against multiple tables, analyze ingestion for each table separately
   - Run latency analysis to check for recommendations
   - Use data ingestion time queries to determine if latency caused false alert (agent vs pipeline)
   - **Recommendations**:
     - Steady high agent latency → work with customer to improve agent performance
     - Steady high pipeline latency (under 30 min) → get further help
     - Sudden latency spikes → for agent issues work with customer; for pipeline spikes do NOT recommend increasing period

2. **Verify customer's query is correct**:
   - Query time range should match the evaluation time range
   - `now()`, `ago()`, `bin()` functions are converted internally into timestamps relative to execution

3. If no ingestion latency and customer query is correct → further investigation from **Log Analytics Draft** side:
   - Get relevant Draft Request IDs
   - Follow "Common Queries Issues and How to Handle Them" TSG
   - Reach out in Log Analytics swarming channel if needed
   - Raise ICM to Log Analytics Draft team if needed

#### Yes, different — Step 4 value still meets threshold:

Issue with customer query configuration. Work with customer to ensure query works as intended. Direct to example queries filtered by "Alerts" Topic.

#### No, results are identical:

Issue with customer query configuration. Work with customer to ensure query works as intended. Direct to example queries filtered by "Alerts" Topic.

## Getting Help

Escalate via standard Alerting team channels if the above steps don't resolve the issue.
