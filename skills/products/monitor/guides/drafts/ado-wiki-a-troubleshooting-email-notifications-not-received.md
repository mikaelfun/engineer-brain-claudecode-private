---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting email notifications not being received"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20email%20notifications%20not%20being%20received"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario

This troubleshooting guide applies to an alert having been fired successfully but one or more email notifications that were expected were not received.

# Information you will need

- Resource id of the Alert rule
- Resource id of the Action Group
- Alert id and timestamp in UTC where the email notification was not received

# Troubleshooting

## Step 1: Verify the alert really did fire

Confirm the alert id is accurate and matches the alert rule and timestamp. Ensure you are pursuing a failed email notification rather than a failure of the alert to fire.

## Step 2: Get fired alert details from ASC

Review Notification Data to identify relevant notification id(s) with MechanismType of Email.

### Service Health alerts - Dial-tone pipeline
For Service Health alerts, two separate pipelines exist:
- Normal AzNS pipeline
- Dial-tone pipeline

If you see NotificationState = Skipped with FailureReason "Skipping service health alert in non dial-tone notification pipeline", this does NOT mean failure. The notification was processed in the dial-tone pipeline. The Notification ID in ASC will differ from Kusto logs.

## Step 3: Get notification diagnostic trace logs

Use ASC or Jarvis to trace notifications.

**Note**: Diagnostic logging is NOT supported for Service Health or Test Notification IDs.

## Step 4: Analyze trace logs

### Email Azure Resource Manager Role
- Emails only sent to Azure AD users and AD groups (not service principals)
- Must be directly assigned at subscription scope
- Only primary SMTP address is used (not additional email addresses)

### Check partition logs
Search "partition" in Message property to see list of email addresses configured. If affected email missing:
- Action may have been disabled (unsubscribed by DL member)
- **Fix**: Remove and re-add the email action to the action group

### Check receiver set
Search "Email receiver set" - should show initial receivers/batches and final receivers after filtering.
- Mismatch → check if rate limits applied

### Check transmission
Search "transmission" - shows email batch sending status.
- **Success here doesn't guarantee delivery** - it means successfully sent to the email processing system

### MEO (formerly AEO) processing
Search "AEOBATCH" in logs. If present, email was processed by MEO.
- Check Notifications tab in ASC → AdditionalInfo → State should be "Complete"
- If errors found → escalate directly to MEO Team

## Step 5: Check for error traces

- TraceLevel = 2 → error events
- Message containing "error" or "failed" (but check for retries after failures)

## Step 6: Send test notification

Suggest customer try test action group feature. If test notification received but live notifications not → escalate to Action Groups PG.

If test also not received:
- Check notification logs for test notification
- Verify points 3 and 4 from public troubleshooting article
- Try sending test email to check for bounce (resolve issues, DL rejection of external senders, etc.)
