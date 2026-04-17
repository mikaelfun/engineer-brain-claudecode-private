---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/Log Query Reference/Tracking Lockbox notification emails"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Customer%20LockBox/Log%20Query%20Reference/Tracking%20Lockbox%20notification%20emails"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Customer Lockbox - Tracking Notification Emails

End-to-end email tracking for Customer Lockbox notification emails across three systems.

## Step 1: Lockbox Logs

Identify the number of reviewers and their details from Lockbox logs.

## Step 2: RAE Logs

Query RAE logs to find:
- `emailOperationId` — used to track in IGANTF
- Recipient IDs — who the email was sent to

**Jarvis query**: Change request ID and time range as needed.

## Step 3: IGANTF Logs

Query with `lockboxrequestId` or `emailOperationId` (from RAE logs):

- **Endpoint**: DiagnosticsProd
- **Namespace**: IGANTFProd
- **Workload**: `DeliverNotificationCommand`

Look for `eventRequestId` field (e.g., `77fbb508-f72c-4596-913d-732228d8f504`) — use this ID to track status in AEO portal.

> **Note**: Log texts are large, so a single log may be spread across multiple lines.

## Step 4: AEO Portal

Track email delivery status using 4 methods:

| Method | URL Pattern |
|--------|-------------|
| By Email | `https://emails.azure.net/status/messages/{email}` |
| By Message ID | `https://emails.azure.net/status/message/{message-id}` |
| By Event ID | `https://emails.azure.net/status/event/{event-id}` |
| By Batch ID | `https://emails.azure.net/status/batch/{batch-id}` |

## Auto-Approve/Auto-Deny Status Emails

For requests that are auto-approved/auto-denied by policy, Lockbox sends status emails **directly without RAE**.

1. From Lockbox logs, identify the **batch ID**
2. Use the Batch ID method in AEO portal to view delivery status

### Tracking failures

Search by email template in Jarvis to identify email delivery failures.
