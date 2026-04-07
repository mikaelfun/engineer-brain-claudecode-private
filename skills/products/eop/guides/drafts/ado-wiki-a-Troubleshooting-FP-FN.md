---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Troubleshooting False Positives and False Negatives"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FTroubleshooting%20False%20Positives%20and%20False%20Negatives"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting False Positives and False Negatives

## Key Operating Principles

- Do NOT bypass or remove security policies or create insecure allows (transport rules, domain allows, user allows) to fix FP issues
- Customers should use Config Analyzer to align with Microsoft recommended configurations
- Customers should use TABL and Submissions to self-serve and remediate FP/FN issues
- No need to ask for extended message traces; Network Message ID and Submission ID are sufficient

## False Positive (FP) TSG

### Ticket Ownership
- Senders not using M365 should NOT raise tickets for FP issues
- Recipient tenants using MDO/builtin security are responsible for raising tickets

### Troubleshooting Steps
1. Sporadic: submit as FP via Submission portal + TABL allow (removed 45 days after last seen)
2. Widespread: collect Network Message ID (NMID) and submission ID
3. Check antispam header X-Forefront-Antispam-Report for SFV and CAT
4. If SFV:NSPM + CAT:None but Junk → check X-Microsoft-Antispam-Mailbox-Delivery for ucf:1/OFR:CustomRules (inbox rules, NOT FP)
5. Check Authentication-Results for SPF/DKIM/DMARC failures

### When to Escalate
- Run "View Filtering Details (Spam Verdict Reason)" and "Review Details of a Submission" diagnostics
- Check Submission result definitions
- If filters not updated → escalate to Analysts (FPFN) with NMIDs + Submission IDs

### Outbound FP
- Collect samples via outbound spam BCC alerting (default policy only)
- Check X-Forefront-Antispam-Report: DIR:OUT, CAT:OSPM, SFP:1501
- Submit as FP, escalate if "Threats found" persists

## False Negative (FN) TSG

### Troubleshooting Steps
1. For spoofing: analyze Authentication-Results header via diagnostic
2. Check X-Forefront-Antispam-Report for SFV and SCL
3. Run "View Filtering Details (Spam Verdict Reason)" with NMID

### Escalation
- Check if submission result shows reclassification (good→bad = already fixed)
- Check if SCL:-1 override from transport rule/connection filter/allow list → NOT a FN, fix the override
- Escalate real FN to Analysts with NMID + Submission IDs

## Escalation Process (to Analysts FPFN)
- Path: Exchange Online/Analysts (FPFN)
- MUST include: SubmissionIds, NetworkMessageIds, or URLs (1 per row, max 10 per type)
- Samples should be recent (24-48h preferred, max 7 days)
- No PII in title

### Severity Matrix
| Scenario | Impact | Escalation |
|----------|--------|------------|
| FP Standard | Single sender blocked | Issue (Sev 3) |
| FP Major/multi-tenant | Own domain blocked everywhere | PSI/CFL (Sev 2) |
| FN Standard | Single spam in inbox | Issue (Sev 3) |
| FN Major/multi-tenant | Large phishing campaign missed | PSI/CFL (Sev 2) |

## Dispute Submission Results
- Admins can dispute results across emails, URLs, attachments
- Only one dispute per initially submitted item
- If "Result" is selected → senior graders re-evaluate
- If only "Reason"/"Recommended Steps" → treated as feedback
