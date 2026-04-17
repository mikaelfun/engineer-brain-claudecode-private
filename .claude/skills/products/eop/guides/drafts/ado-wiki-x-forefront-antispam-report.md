---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/X Forefront Antispam Report"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Troubleshooting%20Guides/X%20Forefront%20Antispam%20Report"
importDate: "2026-04-05"
type: reference-guide
---

# X-Forefront-Antispam-Report Header Reference

## Overview

When Microsoft Defender for Office 365 (MDO) scans an email message it inserts the **X-Forefront-Antispam-Report** header. The fields in this header help identify how the message was processed.

## How to Get the Header

1. In Outlook Client, double click the email message
2. Click **File** → **Properties**
3. Copy everything from the **Internet Headers** box
4. Open [Message Header Analyzer](https://mha.azurewebsites.net/pages/mha.html)
5. Paste headers → **Analyze Headers**
6. Check the third section: **Forefront Antispam Report Header**

## Key Header Fields

### Connection & Origin

| Value | Description |
|-------|-------------|
| CIP: [IP] | Connecting IP address to Office 365 |
| CTRY | Country of the connecting IP |
| LANG | Language of the message (country code, e.g. ru_RU) |
| H: [helostring] | HELO/EHLO string of connecting mail server |
| PTR: [ReverseDNS] | PTR record (reverse DNS) of sending IP |
| DIR:INB/OUT/INT | INB: Inbound, OUT: Outbound, INT: Internal |

### Spam Confidence

| Value | Description |
|-------|-------------|
| SCL | Spam Confidence Level of the message |
| PCL | Phishing Confidence Level of the message |

### Spam Filter Verdict (SFV)

| Value | Description |
|-------|-------------|
| SFV:SFE | Skipped filtering — sender on user's safe sender list (Outlook/OWA) |
| SFV:BLK | Skipped filtering — sender on user's blocked sender list |
| SFV:SPM | Marked as spam by content filter |
| SFV:SKS | Marked as spam before content filter (e.g. Transport rule) |
| SFV:SKA | Skipped filtering — matched allow list in spam filter policy |
| SFV:SKB | Marked as spam — matched block list in spam filter policy |
| SFV:SKN | Marked as non-spam before content filter (e.g. Transport rule) |
| SFV:SKQ | Released from quarantine, sent to intended recipients |
| SFV:NSPM | Marked as non-spam, delivered to intended recipients |
| SRV:BULK | Identified as bulk email |

### IP Verdict (IPV)

| Value | Description |
|-------|-------------|
| IPV:CAL | Allowed — IP in IP Allow list (connection filter) |
| IPV:NLI | IP not listed on any IP reputation list |

### Category (CAT)

| Value | Description |
|-------|-------------|
| CAT:AMP | Anti-malware |
| CAT:BULK | Bulk |
| CAT:DIMP | Domain impersonation |
| CAT:FTBP | Anti-malware common attachments filter |
| CAT:GIMP | Mailbox intelligence impersonation |
| CAT:HPHSH/HPHISH | High confidence phishing |
| CAT:HSPM | High confidence spam |
| CAT:INTOS | Intra-Organization phishing |
| CAT:MALW | Malware |
| CAT:OSPM | Outbound spam |
| CAT:PHSH | Phishing |
| CAT:SAP | Safe Attachments |
| CAT:SPM | Spam |
| CAT:SPOOF | Spoofing |
| CAT:UIMP | User Impersonation |

### Safety Tips (SFTY)

| Value | Description |
|-------|-------------|
| 9.19 | Domain impersonation |
| 9.20 | User impersonation |
| 9.25 | First contact safety tip |

## Missing X-Forefront-Antispam-Report Header

If the header is missing, first confirm the message was scanned by EOP (check for EOP server names or Authentication-Results headers). If scanned but header missing, ask the customer to use **Outlook on the Web** → three dots → **View** → **View message details** to get the original headers.

## Related Resources

- [Anti-spam message headers in Microsoft 365](https://learn.microsoft.com/defender-office-365/message-headers-eop-mdo)
- [Order and precedence of email protection](https://learn.microsoft.com/defender-office-365/how-policies-and-protections-are-combined)
