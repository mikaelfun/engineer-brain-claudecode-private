---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Troubleshooting Quarantine Operations Policies and Notifications"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FTroubleshooting%20Quarantine%20Operations%20Policies%20and%20Notifications"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Quarantine Operations, Policies and Notifications

## Important: Escalation Guidance
- Logs expire after 30 days - escalate promptly
- Keep SAP up to date

## Bulk Release Methods

### Defender Portal
- Select up to 100 messages at security.microsoft.com/quarantine
- Use Filter to narrow results

### Threat Explorer (P2/E5)
- Query messages → Select results → Take action → Move to Inbox

### Advanced Hunting (P2/E5)
```kql
EmailEvents
| where LatestDeliveryLocation contains "quarantine"
| project Timestamp, Subject, SenderMailFromAddress, RecipientEmailAddress, NetworkMessageId
```

### PowerShell
```powershell
# Release for specific user
Get-QuarantineMessage -PageSize 500 -QuarantineTypes Bulk,Phish,Spam -RecipientAddress "user@contoso.com" | Release-QuarantineMessage -ReleaseToAll

# Wildcard domain filter
Get-QuarantineMessage -Domain "*contoso.com"

# Paging for >1000 messages
Get-QuarantineMessage -PageSize 1000 -Page 1 -QuarantineTypes Bulk,Phish,Spam | Release-QuarantineMessage -ReleaseToAll
```

### November 2025 Change
- Messages listed by individual recipient (no more aggregation)
- ReleaseToAll applies to single user per entry

## End-User Release Requests
- Admins create quarantine policies with "Request the Release" capability
- Alert "User requested to release a quarantined message" sent to tenant admins
- Customize alert recipients at Alert policy page
- Filter release requests in quarantine portal via Release requested filter

## Can't Find Quarantined Message
1. **Expired**: Check retention period (default 15 days) in anti-spam policy
2. **Blocked Sender**: Use -IncludeMessagesFromBlockedSenderAddress or check MDO Message Explorer diagnostic
3. **Deleted**: Search Unified Audit Log (RecordType=Quarantine, Operation=QuarantineDeleteMessage)
4. **ETR/AdminOnly**: Messages from transport rules or AdminOnlyAccessPolicy not visible to end users

## Quarantine Notifications

### Configuration
- Per-policy: `Get-QuarantinePolicy | fl Name,*ESN*` → ESNEnabled must be True
- Global frequency: `Get-QuarantinePolicy -QuarantinePolicyType GlobalQuarantinePolicy | fl *Frequency*`
- Settings stamped at delivery time - post-hoc changes don't apply retroactively

### Troubleshooting
1. Collect: MessageID → quarantine details + quarantine policy config
2. Compare EMT custom data with policy settings
3. Trace quarantine@messaging.microsoft.com to confirm notification delivery

### Language
- Based on mailbox regional configuration: `Get-MailboxRegionalConfiguration user@contoso.com | fl Language`
