# Suspicious Email Forwarding Alert: Investigation and Remediation Playbook

> Source: https://learn.microsoft.com/defender-xdr/alert-grading-playbook-email-forwarding
> Status: draft (pending SYNTHESIZE review)

## Overview

Attackers use compromised accounts to set up email forwarding rules for data exfiltration. Three types of forwarding:

| Type | Method | Detection |
|------|--------|-----------|
| **ETR** | Exchange Transport Rules | EAC > Mail flow > Rules |
| **SMTP** | Mailbox forwarding (Set-Mailbox) | EAC > Mailbox > Manage mail flow settings > Email forwarding |
| **InboxRule** | Outlook Inbox rules | `Get-InboxRule -Mailbox <UPN> -IncludeHidden` |

## Investigation Workflow

### 1. Is the account compromised?

- Check past behavior and recent activities
- Review sign-in logs for anomalous IPs, locations, times
- Check for malicious activities on user device
- Use Threat Explorer to check sent emails for phish/spam/malware

### 2. Are the forwarding activities malicious?

- Check forwarding rule type (ETR, SMTP, InboxRule)
- Examine recipient of forwarded emails
- Look for keyword-based rules (invoice, phish, do not reply, suspicious email, spam)

## Advanced Hunting Queries (KQL)

### Find who else forwarded to same recipients
```kusto
let srl=pack_array("{SRL}");
EmailEvents
| where RecipientEmailAddress in (srl)
| distinct SenderDisplayName, SenderFromAddress, SenderObjectId
```

### Count emails forwarded to recipients
```kusto
let srl=pack_array("{SRL}");
EmailEvents
| where RecipientEmailAddress in (srl)
| summarize Count=dcount(NetworkMessageId) by RecipientEmailAddress
```

### Check for new rules created by forwarder
```kusto
let sender = "{SENDER}";
let action_types = pack_array(
    "New-InboxRule", "UpdateInboxRules", "Set-InboxRule",
    "Set-Mailbox", "New-TransportRule", "Set-TransportRule");
CloudAppEvents
| where AccountDisplayName == sender
| where ActionType in (action_types)
```

### Check for anomalous sign-ins
```kusto
let sender = "{SENDER}";
IdentityLogonEvents
| where AccountUpn == sender
```

## Remediation Actions

1. **Disable and delete** the inbox forwarding rule
2. **InboxRule type**: reset user account credentials
3. **SMTP or ETR type**: investigate admin activities, reset credentials
4. **Check for other** activities from impacted accounts, IPs, and senders

## Related PowerShell Commands

```powershell
# Check SMTP forwarding
Get-Mailbox -Identity <UPN> | Format-List Forwarding*Address,DeliverTo*

# Check Inbox rules (including hidden)
Get-InboxRule -Mailbox <UPN> -IncludeHidden | Format-List Name,Enabled,RedirectTo,Forward*,Identity

# Check outbound spam policy forwarding controls
Get-HostedOutboundSpamFilterPolicy | Format-List AutoForwardingMode
```

## 21V (Mooncake) Considerations

- Advanced Hunting (KQL queries above) NOT available in 21V
- Threat Explorer NOT available in 21V
- PowerShell commands for checking forwarding rules ARE available
- Outbound spam policy auto-forwarding controls available in 21V
- Use Exchange admin center message trace as alternative to Threat Explorer
