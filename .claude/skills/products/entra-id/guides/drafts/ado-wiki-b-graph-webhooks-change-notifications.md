---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Microsoft Graph WebHooks Change Notifications/Microsoft Graph Notifications and Change Tracking using webhooks"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FMicrosoft%20Graph%20WebHooks%20Change%20Notifications%2FMicrosoft%20Graph%20Notifications%20and%20Change%20Tracking%20using%20webhooks"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Graph Notifications and Change Tracking using Webhooks

## 1. Subscriptions

A subscription allows a client app to receive notifications about changes to data in Microsoft Graph.

### Supported Resources

- Outlook message, event, personal contact
- user, group
- Office 365 group conversation
- OneDrive (personal & business) driveItem
- Security alert
- Teams chatMessage and callRecord (preview)

### Permissions

Subscription operations require read permission to the resource (e.g., Mail.Read for messages). Not all resources support all permission types (delegated work/school, delegated personal, application).

### Subscription Properties

| Property | Description |
|----------|-------------|
| changeType | Type of change that triggers notification |
| notificationUrl | Endpoint URL for notifications |
| resource | Resource to monitor |
| expirationDateTime | Subscription expiry |
| clientState | Value sent in each notification for validation |
| latestSupportedTlsVersion | Latest TLS version supported by endpoint |

> **Note:** TLS 1.0 and 1.1 are deprecated. Endpoints must support TLS 1.2+.

### Subscription Lifetime

- All resources except security alerts: max **4230 minutes**
- Security alerts: max **43200 minutes**

### Known Limitations

#### Azure AD Resource Limits

| Scope | Limit |
|-------|-------|
| Per app | 50,000 subscriptions |
| Per tenant | 1,000 subscriptions across all apps |
| Per app+tenant | 100 subscriptions |

Exceeding limits → 403 Forbidden.

#### Outlook Resource Limitations

UPN with apostrophe in resource path causes failure. Use GUID user ID instead.

#### National Clouds

Webhooks available on: Public cloud, Microsoft Graph China (21Vianet), Microsoft Cloud Germany only.

### Creating a Subscription

```json
POST https://graph.microsoft.com/v1.0/subscriptions
Content-Type: application/json
{
  "changeType": "created,updated",
  "notificationUrl": "https://webhook.azurewebsites.net/notificationClient",
  "resource": "/me/mailfolders('inbox')/messages",
  "expirationDateTime": "2016-03-20T11:00:00.0000000Z",
  "clientState": "SecretClientState"
}
```

Required: changeType, notificationUrl, resource, expirationDateTime.

### Notification Endpoint Validation

1. Microsoft Graph POSTs to `{notificationUrl}?validationToken={token}`
2. Endpoint must respond within **10 seconds** with:
   - 200 OK status
   - Content-Type: text/plain
   - Body: the validationToken value

## 2. Troubleshooting Subscriptions

Common scenarios: customer cannot create subscription, or cannot find a previously used subscription.

### Validation Failed

1. Verify notificationUrl is publicly accessible
2. Test: `POST {notificationUrl}?validationToken=1234` → should return "1234" as text/plain
3. Use Fiddler to test exact request format
4. Allow inbound traffic from [Microsoft Graph Change Notifications IP addresses](https://learn.microsoft.com/en-us/microsoft-365/enterprise/additional-office365-ip-addresses-and-urls)

### Escalation Paths

| Workload | ICM Service | ICM Team |
|----------|-------------|----------|
| AGS | Microsoft Graph Service | Microsoft Graph Webhooks |
| Security | Intelligent Security Graph | SIPS API |
| Azure ATP | Azure Advanced Thread Protection | Triage |
| OneDrive Consumer | OneDrive Consumer | OneDrive for Business Files API Team |
| OneDrive for Business | SharePoint OneDrive for Business | OneDrive Web |
| SharePoint | DevPlat | Vroom |
| Exchange/Outlook | Exchange | Web Services |
| Teams | Skype Teams | Teams Platform Graph API |

## 3. Notifications

Microsoft Graph sends POST to notificationUrl when resource changes. Multiple notifications from different subscriptions can be in a single request.

### Processing Notifications

1. Respond with **202 Accepted** (if not 2xx, Graph retries for ~4 hours then drops)
2. Validate clientState matches subscription
3. Execute business logic

## 4. Rich Notifications (Preview)

Include resource data in notifications (currently Teams chatMessage only).

Additional requirements:
- `includeResourceData: true`
- `lifecycleNotificationUrl` for lifecycle events
- `encryptionCertificate` (public key for data encryption)
- `encryptionCertificateId`

### Lifecycle Notifications

Handle `reauthorizationRequired` events:
- POST `/subscriptions/{id}/reauthorize` or PATCH to renew

### Validating Notification Authenticity

Validate JWT tokens in `validationTokens` array:
1. Token not expired
2. Issued by Microsoft Azure
3. Issued for your subscribing app
4. Publisher is Microsoft Graph change notification publisher

### Decrypting Resource Data

Two-step encryption: symmetric key encrypts data, asymmetric key (your public key) encrypts symmetric key.
1. Identify certificate via encryptionCertificateId
2. RSA decrypt the symmetric key (dataKey)
3. HMAC-SHA256 verify data integrity
4. AES decrypt the content

## 5. Troubleshooting Notifications

Check:
- Verify notificationUrl still accepts requests
- Subscription has not expired
- IP allowlist includes [Microsoft Graph Change Notifications IPs](https://learn.microsoft.com/en-us/microsoft-365/enterprise/additional-office365-ip-addresses-and-urls)

## 6. Change Tracking (Delta Query)

Delta query enables discovering newly created, updated, or deleted entities without full reads.

### Workflow

1. Initial GET with delta function returns full current state + deltaLink
2. Subsequent calls to deltaLink return only changes
3. `@removed` objects indicate deletions (reason: "changed" = soft-delete, "deleted" = permanent)

### Supported Resources

Applications, chat messages, directory objects, directory roles, drive items, events, groups, mail folders, messages, contacts, planner items, service principals, users.

### Limitations

- Properties outside main data store (e.g., user skills in SharePoint) → 501 Not Implemented
- Navigation properties not supported
- Processing delays vary
- National clouds: Public + 21Vianet only
- **Delta token lifetime: 30 days** for identity objects

### Escalation (Delta Query)

| Workload | ICM Service | ICM Team |
|----------|-------------|----------|
| AGS | Microsoft Graph Service | Delta Query |
| (Other workloads same as subscription escalation table) |

## 7. Appendix - Kusto Queries

Database: `https://idsharedcus.kusto.windows.net/graphnotificationsprod`

### P99 Processing Times

```kql
GraphNotificationsLogEvent 
| where env_time >= ago(7d)  
| where env_cloud_role == "PublisherWorkerRole" and env_cloud_environment == 'Prod' 
| where tagId == "0x56" 
| extend processingTime = tolong(extract("Processing time of successful notification is ([0-9.]+)", 1, message)) 
| extend workloadName = extract("from workloadname ([A-z]+.[A-z]+)", 1, message) 
| summarize percentiles(processingTime, 50, 95, 99, 99.9) by workloadName 
```

### Subscription Search Functions

| Function | Parameters | Purpose |
|----------|-----------|---------|
| GetSubscriptionRequestLogs | time, correlationId | Search by correlation ID (±5 min) |
| GetSubscriptionRequestLogsInTimeRange | time, delta, correlationId | Search with custom time range |
| GetSubscriptionRequestForSubscriptionId | time, subscriptionId | Search by subscription ID |
| GetSubscriptionRequestForAnyId | time, id | Wildcard search by any ID |
