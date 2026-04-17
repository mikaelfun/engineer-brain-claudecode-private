---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Activity Log Alerts/How to analyze Activity Log Alert event evaluation history in Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FActivity%20Log%20Alerts%2FHow%20to%20analyze%20Activity%20Log%20Alert%20event%20evaluation%20history%20in%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to analyze Activity Log Alert event evaluation history in Azure Support Center

## Instructions

1. Open Azure Support Center from the support request.
2. Navigate to Resource Explorer.
3. Locate the activity log alert rule: expand **microsoft.insights** provider → **activityLogAlerts** → click the alert rule name.
4. Click the **Execution History** tab.
5. Set **Start Time (UTC)** and **End Time (UTC)** (max range: 60 minutes), then click **Run**.

## Summary Section

| Grouping | Description |
|----------|-------------|
| Total Activity Log Evaluations (in scope) | Total evaluations that ran. New flow runs every 5 minutes (30-min query = 6 evaluations). |
| Total failed Activity Log Evaluations | Failed evaluations count. |
| Total Activity Log Alerts (in scope) | Number of alerts fired. |
| Events with action triggers | Events that triggered an action. |
| Events with action suppressions | Events suppressed by alert processing rules. |

## Activity Log Evaluations

Shows all evaluations during the timeframe, one per 5 minutes. Alerts with **Amount of alerts > 0** triggered an alert.

## Activity Log Alerts Details

| Column | Description |
|--------|-------------|
| Fired Timestamp | When the alert fired. |
| Alert ID | Fired alert ID. |
| Event Timestamp | Timestamp of the activity log event. |
| Event Operation Parent Id | Correlates fired alert to evaluation (matches Operation Parent Id in evaluations table). |
| Operation Name, Resource Id, Category, Description | Activity log event properties. |

## Key Properties for Notification Tracing

| Property | Description |
|----------|-------------|
| AMP Confirmed | Validates notification reached AMP system, provides CorrelationId (= ActivityId in AMP/AzNS). |
| Azns Notification Id | Azure Notification Id for notification processing. |

> **Note**: New evaluation engine only returns events matching both scope AND condition (V1 also showed in-scope events not matching condition).
