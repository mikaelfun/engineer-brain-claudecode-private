---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Handling Consumer Mailflow Issues (Outlook-Live-Hotmail)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FHandling%20Consumer%20Mailflow%20Issues%20(Outlook-Live-Hotmail)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Handling Consumer Mailflow Issues (Outlook/Live/Hotmail)

Mail delivery issues to Microsoft consumer email typically fall outside MDO scope. Initial troubleshooting by MDO ensures everything is configured properly.

## Scenario 1: Consumer False Positive/Negative or Hybrid Client IP Block

1. Verify with sample header that issue is NOT related to:
   - Emails routing through HRDP and already SCL5 (handle as normal outbound FPFN)
   - M365 IP being rejected (escalate via FPFN TSG)
2. If not M365 IP: proceed to shared customer support steps

## Scenario 2: High Volume Sender Authentication Requirements

(April 2025 requirements: 5000+ emails/day to consumer need DKIM/DMARC/SPF)

1. Verify sender has full authentication per requirements
2. Test by sending to outlook.com recipient AND test tenant (Honor DMARC set to quarantine)
3. If properly configured: proceed to shared customer support steps

## Scenario 3: Complete Domain Block (AS9200)

Error: "550 5.7.800 Service unavailable, P1 sending domain is blocked"

1. Check if emails route through HRDP/SCL5 (indicates spam-like content)
2. Discuss email content with customer
3. Follow shared customer support steps

## Shared Customer Support Steps

1. **Lead with empathy** -- acknowledge frustration
2. **Clarify boundaries** -- explain MDO vs consumer support scope
3. **Redirect**: Customer creates ticket at https://olcsupport.office.com
   - Must log in with affected Microsoft Account
   - Will receive automated response in 12 hours
   - **MUST reply** to automation email or ticket auto-closes
4. **Case closure** -- archive with supportive closure, offer to reopen if needed

## EDFS Escalation (Internal Only)

If customer exhausts consumer support avenues and case is reopened:
- Email edfs@microsoft.com with both case numbers + clear description
- **NEVER share EDFS alias with customers**
- Consumer ticket numbers: 10 digits starting with 7
- EDFS SME team handles within 24 hours

## Key Rules

- Enterprise Support cannot expedite consumer tickets
- Support engineer responsible for ticket even if issue outside MDO control
- Engage TA/Manager for tough decisions
- Do not force close if customer contention exists
