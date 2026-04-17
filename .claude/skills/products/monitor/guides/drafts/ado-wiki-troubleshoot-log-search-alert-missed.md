---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Log Search alert didn't fire when it should (Missed Alert)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20Log%20Search%20alert%20didn%27t%20fire%20when%20it%20should%20(Missed%20Alert)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Log Search alert didn't fire when it should (Missed Alert)

**Please note:** Log alerts evaluation telemetry retention is limited to 30 days to comply with GDPR requirements.

## Scenario

This troubleshooting guide applies to a Log alert (aka Log Search alert) that did not fire when it was expected.

## Information you will need

- The resource id of the Alert rule. This should be selected by the customer when they open the support request.
  - [How to get the ResourceId value of an Azure resource from Azure Support Center](/Azure-Monitor/How-To/Azure-Support-Center/How-to-get-the-ResourceId-value-of-an-Azure-resource-from-Azure-Support-Center)
- The approximate timestamp in UTC when the alert was expected to fire. The customer is asked to provide this as part of the scoping questions when opening the support request.

## Known issues

Search for [known issues](https://supportability.visualstudio.com/AzureMonitor/_search?text=Tags%3A%22AlertsAndActionGroups%22%20AND%20%22LogAlerts%22&type=workitem&pageSize=100&filters=Projects%7BAzureMonitor%7DWork%20Item%20Types%7BKnown%20Issue%7DStates%7BPublished%7D).

## Troubleshooting Steps

### Step 1: Verify alert rule configuration

In Azure Support Center, navigate to relevant alert rule under microsoft.insights/scheduledqueryrules. Take note of the alert condition and extended properties.

If there has been at least 1 successful evaluation, the alert rule is in an enabled state, but you see many N/A fields (particularly Frequency and Threshold), then this is most likely a **Simple Log Alert Rule**. Follow instructions to identify and validate a Simple Log Alert and then return.

### Step 2: Review evaluation history data

In Azure Support Center, navigate to **execution history** tab and filter by Start Time and End Time in UTC based on the time frame when the alert was expected to fire. Click **Run**.

Expand the operation which corresponds to the relevant timestamp.

#### If evaluation status = FAILURE (POTENTIAL BACKEND ISSUE):

Follow [How to interpret log alert evaluation failure messages](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/928024/How-to-interpret-log-alert-evaluation-failure-messages).

Not all possible error messages are documented. In these cases, examine the full evaluation log trace and customer query.

If the issue is related to the **Draft Backend**, engage the Log Analytics DRAFT team via ICM. Before engaging, collect the request ID using: [How to get the Draft request ID for a Log Alert evaluation](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1922694/How-to-get-the-Draft-request-ID-for-a-Log-Alert-evaluation-and-other-Draft-related-information).

#### If evaluation status = SUCCESS:

Copy the **Operation Id** and go to **Alert run details tab**. Paste the Operation Id and timestamp, click **Run**.

**Is Threshold Met = True?**

- **No** → Proceed to Step 3
- **Yes** → Check the following:

  **For stateful alert rules:**
  Check if alert is already in fired state using [How to get stateful log alert rule state change history from Kusto](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki).

  **For stateless alert rules:**
  Check if alert was previously fired on the same bucket. When evaluations run in optimization flow, each execution has overlapping buckets with previous and next runs.

  Navigate to the **Analyze** tab → **logs** link. Look for lines with **Evaluated results for bucket**. The non-most-recent bucket overlaps with a previous execution. If an alert already fired on that bucket in the previous execution, it will not fire again. Look for:
  - **AlertsMgmtIngestionProcessor Post Body** = alert fired
  - Exclusion of dimension due to existing unhealthy health report = alert skipped (by design)

  Reference: [Log Alerts optimization flow and query manipulation](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki)

**If alert fired with delay:** validate using [How to Validate Log Search Alerts fired with delay (Retry mechanism)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2346980/How-to-Validate-Log-Search-Alerts-fired-with-delay-Retry-mechanism).

### Step 3: Look for query results

**V1 Number of Results alert type:**
Look for the **Query results** / evaluated value that determined an alert should not fire.

**V1 Metric Measurement or V2:**
Follow [How to get query results for metric measurements log alert rules from Kusto](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki) to see dimensions where threshold was met.

**If query returned empty results AND query uses adx("") or arg("") pattern:**
Validate managed identity has correct access to relevant data sources:
- ADX cluster for adx("") pattern
- Azure Resource Graph resources for arg("") pattern
- Reference: [How To Validate Managed Identity Access for ADX and ARG Log Alerts](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1599019/How-To-Validate-Managed-Identity-Access-for-ADX-and-ARG-Log-Alerts)

If managed identity lacks permissions → instruct customer to add access: [Create or edit a log search alert rule - managed identity](https://learn.microsoft.com/azure/azure-monitor/alerts/alerts-create-log-alert-rule/#managed-id)

### Step 4: Run troubleshooting query

**For ADX rules:** Create collaboration with Azure Data Explorer support team.
**For ARG rules:** Create collaboration with Azure Resource Graph support team. Reference boundaries: [Azure Resource Graph Alerts Support Boundaries](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/995622/Support-Boundaries?anchor=azure-resource-graph-alerts)

Go to **Alert run details tab** → **Alert execution summary** → copy the **Troubleshooting query**.

If query exceeds length limit (truncated/zipped), follow [How to unzip a log alert troubleshooting query](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki) to get the full query.

In ASC resource explorer, locate the workspace/AI component resource ID in alert rule properties scope field. Navigate to **Query Customer Data** tab, paste the troubleshooting query, set Time Range = "The query contains time range filters", press **Run**.

**Important for resource-centric rules:** Use the LA/AI component from alert rule properties permission object section and filter query results by the scope resource ID. For multi-resource rules, execute against each component separately.

For managed identity rules (no permission object), use [How to get Log Analytics workspaces used by resource centric Log alert rules from Kusto](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki).

**Note on optimization flow:** If query uses optimization flow (LSA_optimization_sliding_win in results) and multiple buckets met threshold, the newest bucket (highest number) is the one for which alert fires.

Results from this step reflect the data returned from draft that was available to query at evaluation time.

### Step 5: Compare results from previous steps and with customer findings

**Are query results different between Steps 3 and 4, or does the customer's own query show different results?**

#### Case A: Results differ AND Step 4 now meets threshold (or customer query shows threshold met)

1. **Check for ingestion latency:**
   - If customer query runs against multiple tables, analyze ingestion for each table separately
   - Run [Latency analysis](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki) to check for recommendations
   - Use [ingestion time queries](https://docs.microsoft.com/azure/azure-monitor/logs/data-ingestion-time#ingestion-latency-delays) to determine if latency caused the missed alert
   - For root cause analysis, follow [Data ingestion troubleshooting flowchart](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750362/Data-ingestion-troubleshooting-flowchart)

   **Recommendations for ingestion latency:**
   - **Steady high agent latency** → work with customer to improve agent performance
   - **Steady high pipeline latency** (under 30 min) → get PG help to determine recommendation
   - **Sudden latency spikes** → for agent issues, find root cause with customer; for pipeline spikes, do NOT recommend increasing the period

2. **Verify customer query is correct:**
   - Query time range should match evaluation time range
   - Functions like now()/ago()/bin are converted internally into timestamps relative to execution
   - Reference: [How to validate query execution results on false or missed Log alert](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/542480/)

3. **If no latency and query is correct** → further investigation needed from **Log Analytics Draft** side:
   - Get Draft Request IDs using the How-To article
   - Follow [Common Queries Issues and How to Handle Them](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750401/)
   - Reach out in [Log Analytics swarming channel](https://teams.microsoft.com/l/channel/19%3Acdcfaced2e9a4739b3786b8af3ba22f9%40thread.tacv2/Log%20Analytics)
   - If ICM needed: follow [Escalating to Azure Log Analytics Draft team](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1258297/)

#### Case B: Results differ BUT Step 4 still does not meet threshold

Customer query configuration issue. Work with customer to ensure query works for intended purpose. Direct to [example queries](https://docs.microsoft.com/azure/azure-monitor/logs/queries#finding-and-filtering-queries) (filter by "Alerts" Topic).

#### Case C: Results identical

Customer query configuration issue. Work with customer to ensure query works for intended purpose. Direct to [example queries](https://docs.microsoft.com/azure/azure-monitor/logs/queries#finding-and-filtering-queries) (filter by "Alerts" Topic).

## Getting Help

Refer to TSG Getting Help templates for Alerting escalation paths.

## Product Group Escalation

Refer to TSG Product Team Escalation templates.
