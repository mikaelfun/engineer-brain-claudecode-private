---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/Log Query Reference/Debug RAE Log"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Customer%20LockBox/Log%20Query%20Reference/Debug%20RAE%20Log"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Customer Lockbox - Debug RAE Log

## Prerequisites

Connect to Jarvis with the following settings:
- Endpoint: (use CA Fairfax in Endpoint dropdown for Fairfax logs)
- Namespace and Roles as specified for the request

> **Tip**: If you cannot find any logs with request ID or correlation ID, search by tenant ID. This is especially useful when troubleshooting business flow creation failures.

## Key Log Patterns

### Confirm request approval was sent successfully

Check for logs where `PostAccessReview` operation shows as success.

### Get object IDs of reviewers/users who received the approval

Look for logs containing: `Added Reviewer with Id`

### Get complete details of individual reviewers

Search for message: `EventName RequestAddReviewer`

Sample log entry structure:
```
Entering Business Logic - QueueEventAsync - EventName RequestAddReviewer - Event {
  "EventTypeId": "ebd6dd79-...",
  "PartnerId": "d44baa69-...",
  "TenantId": "<tenant-id>",
  "Payload": {
    "BusinessFlowId": "<flow-id>",
    "ReviewerId": "<reviewer-guid>",
    "ReviewerName": "XXX",
    "ReviewerUpn": "XXXX",
    "ReviewId": "<review-id>"
  }
}
```

### Filtering tips

For easier filtering of logs, add filters for:
- `operationName != GetAccessReviewApprovalsByReviewId`
- `resultType != Success` (if looking for failed operations)

### Track email notification status

Search for `AEO` in the logs. See also: [Tracking Lockbox notification emails](./ado-wiki-b-tracking-lockbox-notification-emails.md)
