---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting webhook actions not being received"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20webhook%20actions%20not%20being%20received"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario

This troubleshooting guide applies to an alert having been fired successfully but one or more webhook actions that were expected were not received.

# Information you will need

- Resource id of the Alert rule
- Resource id of the Action Group
- Alert id and timestamp in UTC where the webhook action was not received

# Troubleshooting

## Step 1: Verify the alert really did fire

Confirm the alert id is accurate and matches the alert rule and timestamp. Ensure you are pursuing a failed webhook action rather than a failure of the alert to fire.

## Step 2: Get fired alert details from ASC

Review Notification Data to identify relevant notification id(s) with MechanismType of Webhook.

## Step 3: Get notification diagnostic trace logs

Use ASC or Jarvis to trace notifications.

**Note**: Diagnostic logging is NOT supported for Service Health or Test Notification IDs.

## Step 4: Analyze trace logs

### Check webhook receivers
Search "webhook receiver" in Message property - returns list of each webhook action being processed and total count.

### Check webhook notification results
Search "[Webhook] notification" in Message property - returns results for each webhook action performed.

If the attempt to trigger the webhook fails, certain errors allow for retry attempts while others do not. This will be noted in the message contents.

### Common failure reasons
- Webhook endpoint unreachable (DNS resolution, firewall)
- Webhook endpoint returns non-2xx status code
- Request timeout
- Certificate validation failure
