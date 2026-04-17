---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Case Misroutes/Exchange Online: Determining Scope"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FCase%20Misroutes%2FExchange%20Online%3A%20Determining%20Scope"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Exchange Online: Determining Scope

SAP: Exchange/Exchange Online

## Exchange Online: the mother of MDO

Exchange Online is the core cloud email service within Microsoft 365. All mail destined for M365 tenants passes through the EXO transport pipeline, where EOP performs antispam, antimalware, and phishing filtering.

- **EOP** (Exchange Online Protection): Filters spam, malware and phishing
- **MDO** (Microsoft Defender for Office 365): Advanced security layer add-on with threat simulation, real-time detection, and response

EOP and MDO components are MDO team scope. Remaining core email service functionalities are EXO team scope.

## Exchange Online Support Scope

### Mailbox permissions
- "So and so can't access their mailbox"
- "How do I create a shared mailbox"
- Exception: Send As permissions and how they relate to anti-spam outbound policy count (MDO should know)

### Journaling
Journaling does NOT pertain to Exchange Online support - it's in **Purview** scope.

### Mail Flow (EXO scope)
- Setup Send/Receive Connectors, Edge
- Mail Latency, Failed Delivery (IPv6 issues are in EXO scope)
- How Mail Flows (in respect to EXO, not how MDO works)
- SMTP pipeline

### Post-delivery movement to junk mail
**Handled by EXO.** Verify by checking message header `dest:` field. If `dest:I` then it should be troubleshot by EXO team as the movement occurs in the mailbox.

### Fully MDO - Mail Flow
- Connection Filtering
- DKIM, DMARC, SPF discussion about connectors (as applicable)

## OWA
Issues with Outlook OWA including login/logout, feature, IM and performance issues → Exchange Online scope (not Outlook Desktop team).

## Calendaring

| Scope | Details |
|-------|---------|
| EXO | Duplicate/missing items, sync, manager/delegate, room mailboxes, calendar access/permissions, free/busy, reminders, meetings, delegation |
| Collab | MDO case with small calendaring question |
| Fully MDO | FP/FN calendar events, calendar event that got ZAPed didn't delete the event |

## NDR Routing Table

| Exchange Online | MDO |
|----------------|-----|
| 5.1.0 Unknown/Invalid Recipient | Any NDR related to AntiSpam/MDO |
| 5.1.1 Recipient Not Found | 5.1.8 Sender Denied by Policy |
| 5.1.10 Recipient Not Accepted | 5.1.90 Recipient Blocked by Policy |
| 5.6.0 Media Not Supported | 5.7.703 Tenant Blocked from Sending |
| 5.4.14 Hop Count Exceeded | 5.7.705 Message Rejected by Policy |
| 5.3.1 Mail System Full | 5.7.709 URL Detonation Failure |
| 5.4.1 Domain Not Found, 5.7.750 unverified sending domain | 4.7.500 Tenant Throttling AND MORE |
| 5.4.6 Routing Loop Detected AND MORE | [Full NDR List](https://learn.microsoft.com/en-us/exchange/troubleshoot/email-delivery/ndr/non-delivery-reports-in-exchange-online) |

## Collab Potential
- Complex routing leading to FP/FN → MDO and/or CSA
- Direct send: MDO handles authentication part, EXO handles configuration aspect
