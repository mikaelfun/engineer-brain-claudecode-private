---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Understanding and Troubleshooting Recipient Rate Limit (RRL)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FUnderstanding%20and%20Troubleshooting%20Recipient%20Rate%20Limit%20%28RRL%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Understanding and Troubleshooting Recipient Rate Limit (RRL)

## Overview
Two systems enforce recipient-based limitations:
1. **Outbound Spam Filter Policy limits** (hourly/daily; customer-configurable)
2. **Service-enforced RRL** (rolling 24h; fixed at 10,000 recipients)

Both count **recipients, not messages**.

## Rate Limit Types (from Validate EOP User Health diagnostic)
- **Internal**: exceeded hourly limit for internal recipients (RecipientLimitInternalPerHour)
- **External**: exceeded hourly limit for external recipients (RecipientLimitExternalPerHour)
- **Daily**: exceeded daily limit for all recipients (RecipientLimitPerDay)
- **Recipient Rate Limit**: exceeded rolling 24h service limit (10,000 recipients) - NDR 5.1.90

## Out of Scope
- RRL increases (10,000/24h) → Exchange Online team
- Tenant External Recipient Rate Limit (TERRL, 5.7.233) → Exchange Online team
- User Blocked for Outbound Spam (5.1.8, AS(42004)) → fix via aka.ms/fpfn

## How Limits Are Calculated
- Counts aggregate against **authenticated user**, not From address
- SendAs scenario: UserA sends as SharedMailboxZ → messages tally against UserA
- **Policy applied is based on From address**: UserA policies when sending as self, SharedMailboxZ policies when sending as SharedMailboxZ
- This can cause unexpected blocks when the SendAs target has lower limits

## Troubleshooting

### Hourly Limits
- Check "Checks the mail user message and spam counts" diagnostic
- Hourly data stored briefly - gather within 1-2 days of block
- Limits roll over each hour (00:00Z-01:00Z windows)

### Daily Limits
- Same diagnostic, longer retention
- Daily limits: 00:00Z-23:59Z each day (UTC)

### Recipient Rate Limit (rolling 24h)
- No hygiene event in EOP User Health Diagnostic
- User receives intermittent NDR 5.1.90 as quota refreshes
- Investigate immediate 24 hours preceding block
- Messages submitted via authenticated SMTP but **rejected** still count against RRL

## Finding SendAs
```powershell
# Check Distribution Group SendAs permissions
Get-DistributionGroup | % {Get-RecipientPermission -AccessRights SendAs $_}

# Audit SendAs activity
$Start = (Get-Date).AddHours(-48)
$End = Get-Date
$UserID = "impacted@contoso.com"
$audit = Search-UnifiedAuditLog -StartDate $Start -EndDate $End -Operations sendas,sendonbehalf -UserIds $UserID
$auditentries = $audit.AuditData | ConvertFrom-Json
$auditentries | Select SendAsUserSmtp,ClientIP | Group SendAsUserSMTP,ClientIP | Select Count,Name
```

### Policy Mismatch Detection
- Use MDOThreatPolicyChecker: https://microsoft.github.io/CSS-Exchange/M365/MDO/MDOThreatPolicyChecker/
- Ensure all accounts a user sends as share the same outbound spam policy

## Other Scenarios
1. Internal system notifications (mailbox full, SharePoint) count against RRL
2. Authenticated SMTP with MessageCopyForSMTPClientSubmissionEnabled → messages count twice (known issue)
