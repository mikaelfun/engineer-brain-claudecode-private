---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/User Reporting and Submission Results"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FUser%20Reporting%20and%20Submission%20Results"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# User Reporting and Submission Results

## End User Reporting from Microsoft Tools
- Tools: Report message add-in, Report phish add-in, Microsoft report button
- Reports directed to: reporting mailbox, Microsoft, or both (per user-reported settings)
- Alerts generated for MDO P1/P2
- MDO P2/E5: AIR triggered for reported phishing messages

## End User Reporting from Third-Party Tools
- Third-party tools (Phishme, Cofense, Proofpoint, etc.) send to their reporting mailboxes
- Configure: User reported settings → Monitor reported messages → Use non-Microsoft add-in button → Microsoft and my reporting mailbox
- Third-party vendors should follow message submission format guidance
- Microsoft analyzes and shows results on User reported page

## Assist 365 Diagnostic: Validate User Reported Settings
- Provides insights into reporting button display, message routing, configuration checks

## Submission Result Generation

### Worldwide (WW)
1. Check: Phish simulation → Authentication → Policy → Rescan
2. If no policy hits → rescan for latest filter verdict
3. Human analyst reviews for final grading

### GCC/GCC High/ITAR/DoD
- First 4 steps only (no human analysis due to data storage restrictions)
- Result indicates further analysis needed → contact support

## How Allows Are Generated from Submissions
- Admin submissions create allows based on detection technologies
- Checks: impersonation, spoofing, file/URL technologies
- Domain rollup: 7+ email addresses in same domain → automatic domain allow entry
- No allows created if existing Tenant-level block exists
