---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Azure Event Hub actions not being received"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Alerts/Troubleshooting%20Guides/Troubleshooting%20Azure%20Event%20Hub%20actions%20not%20being%20received"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Azure Event Hub Actions Not Being Received

Applies when an alert fires successfully but one or more Event Hub actions were not received.

## Information Needed

- Resource ID of the Alert rule (from ASC)
- Resource ID of the Action Group (from ASC problem details)
- Alert ID and timestamp in UTC where Event Hub notification was not received

## Troubleshooting Steps

### Step 1: Verify the Alert Really Did Fire

Confirm the alert ID matches the alert rule and timestamp. Ensures you are pursuing a failed Event Hub action rather than a failure of the alert to fire.

### Step 2: Get Fired Alert Details from ASC

Use "How to get history of fired alerts in Azure Support Center". Review Notification Data to identify notifications relevant to the action group. Look for notifications with **MechanismType = EventHub**.

### Step 3: Get Notification Diagnostic Trace Logs

For each notification ID:
- Use "How to trace an Azure Notification in Azure Support Center"
- Or "How to trace an Azure Notification in Jarvis"

**Note**: Notification Diagnostic logging is NOT supported for Service Health or Test Notification IDs in both Jarvis or ASC.

### Step 4: Analyze Trace Logging

**Important**: Check the **Env_time** property to ensure data is sorted by time (results often come back unsorted).

1. Search diagnostic log where **Message** contains `eventhub receiver` — shows each Event Hub action being processed and total count
2. Search where **Message** contains `eventhub messages` — shows each Event Hub action performed and results

### Common Errors

- **Target Event Hub does not exist**: Exception when the Event Hub name/namespace is incorrect or the Event Hub has been deleted
- Failed attempts may or may not be retried depending on the error type (noted in message contents)
- Exceptions in the trace generally provide insight into the root cause
