---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Activity log alert fired with delay"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Alerts/Troubleshooting%20Guides/Troubleshooting%20Activity%20log%20alert%20fired%20with%20delay"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Activity Log Alert Fired With Delay

Applicable for all Activity log alert types (resource health and service health included).

## Architecture

Activity log alerts over LA architecture data flow:
- ALA log search queries execute every **5 minutes**, querying a **30-minute window** of new events ingested
- Events matching conditions return in results multiple times but fire only once
- Querying based on **ingestion time** (not occurrence time) to prevent loss of late-arriving events
- 30-minute windows used to prevent loss due to ingestion latency

## Information Needed

- Resource ID of the Alert rule (from ASC)
- Timestamp in UTC when alert was fired (from customer)

## Troubleshooting Steps

### Step 1: Get Fired Alert ID

Use "How to get history of fired alerts in Azure Support Center" to find the alert ID.

### Step 2: Review and Analyze Fired Alert Timeline

Navigate to **Alert Details** tab in ASC, paste alert ID, click **Run**.

Result is a timeline from event occurrence to notification sent.

### Delay Analysis Table

| Delay Between Steps | Component | Expected Delay | Next Steps |
|---|---|---|---|
| Step 1 → 2 | Resource Provider submitted event into Activity Log (OBO) | Up to ~2.5 minutes | Open collaboration task with applicable RP support team |
| Step 2 → 3 (non-health) | Activity log submitted event into internal LA workspace | < 1 minute | Escalate to Activity Logs PG. Use "Azure Monitor \| Activity Logs" template in ASC. **Must provide EventCorrelationId** |
| Step 2 → 3 (health events) | Activity log submitted event into internal LA workspace | Varies | Follow "How to investigate delays with resource or service health events" guide |
| Step 3 → 4 | Data from LA workspace available for querying | 30 sec - 3 min | Escalate to LA ingestion PG. Use "Azure Log Analytics \| Ingestion" template in ASC |
| Step 4 → 5 | Activity Log Alerts engine sent alert to AMP | Up to 3-4 min | Escalate to Alerts data plane team. Use "Azure Monitor \| Activity Log Alerts - Data Plane - False or missed alerts" template |
| Step 5 → 6 | AMP acknowledged alert received | ~30 seconds | Escalate to AMP PG. Use "Azure Monitor \| Alert Management Platform (AMP)" template in ASC |

## Key Notes

- Do NOT raise ICM to Activity Log PG without the **EventCorrelationId**
- For LA ingestion delays, provide LA workspace details using "How to get details of LA workspaces containing an Azure subscription's Activity logs"
