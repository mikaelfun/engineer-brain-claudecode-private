---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/What are Office 365 Safety Tips"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FWhat%20are%20Office%20365%20Safety%20Tips"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Office 365 Safety Tips

## Overview
Safety Tips add an additional protection layer by providing warnings in suspicious emails or reassurance for safe messages. Displayed as a color-coded messaging bar at the top of emails.

Categories: Suspicious, Unknown, Trusted, Safe.

## First Contact Safety Tip
- Available in EOP and Defender for Office 365
- No dependency on spoof intelligence or impersonation protection
- Shown when: first message from a sender OR sender doesn't often send to recipient
- Replaces the need for transport rules with X-MS-Exchange-EnableFirstContactSafetyTip header
- Recommend turning it on for extra impersonation protection

## Unauthenticated Sender Indicators (Spoof Settings)
Available in Safety tips & indicators section of anti-phishing policies:

### Question Mark (?) for Unauthenticated Senders
- Added to sender photo if message fails SPF or DKIM AND fails DMARC or composite authentication
- Only when spoof intelligence is turned on

### "Via" Tag
- Shows when domain in From address differs from domain in DKIM signature or MAIL FROM
- Example: chris@contoso.com via fabrikam.com

### Preventing ? or Via Tag
- Allow spoofed sender in spoof intelligence insight or TABL
- Configure email authentication (SPF/DKIM for ?, DKIM/MAIL FROM alignment for via tag)

## Availability
All Safety Tips included in:
- Outlook on the web
- Outlook for desktop
