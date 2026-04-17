---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Drafts/[DRAFT] MDO Escalations Prerequisites Checklist"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Drafts/%5BDRAFT%5D%20MDO%20Escalations%20Prerequisites%20Checklist"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# MDO Escalations Prerequisites Checklist

## General Resources for Most Issues

- Customer's own tenant access (UI and/or PowerShell)
- Public documentation
- [MW EOP wiki](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/98438/Exchange-Online-Protection) and [ASIM wiki](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/7859/Troubleshooting-Guides)
- Diagnostics in Assist365 ([MW Diagnostics](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/447613/Diagnostics) and [MDO Diagnostics](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/12477/MDO-Diagnostics))

## General Escalation Checklist

### Self-help
- [ ] Reviewed all data/information available to troubleshoot the issue as far as possible?
- [ ] Run any relevant diagnostics and followed suggested actions?
- [ ] Checked internal wikis/TSGs and public documentation?
- [ ] Swarmed/consulted with peers/TAs/PTAs as needed?
- [ ] Checked https://aka.ms/mdoKI for known issues?

### Issue Reproducibility
- [ ] Checked for similar issues in both ADO and IcM? Provide details under 'Similar Bugs'.
- [ ] Tried to reproduce the issue? Provide details under 'Repro Steps'.
- [ ] Provided only recent data (generally last 30 days)?

### Scoping
- [ ] Confirmed the issue should be escalated to MDO (not elsewhere)? Check https://aka.ms/mdoescalate and [Security Support Boundaries](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/258571/Security-Support-Boundaries).
- [ ] Confirmed you are escalating to the right path per https://aka.ms/mdoescalate?
- [ ] Confirmed the issue occurred within the past 30 days (engineering needs backend logs)?
- [ ] Provided timestamps/timeline?
- [ ] Made clear which data in which attachments to look at?
- [ ] Provided affected/unaffected user/group and tenant information?

### Miscellaneous
- [ ] Attached everything relevant that is allowed to be attached to the IcM?
- [ ] Clicked 'Save' after adding attachments?
- [ ] Provided passwords for password-protected files?
- [ ] Quoted relevant NMIDs/MessageIDs/SubmissionIDs/AlertIds etc?
- [ ] Ensured it is clearly explained which files belong to which repro/instance?
- [ ] Removed the CRI owner, ONLY IF reactivating the CRI?

---

## Prerequisite Tables

**Key:**
- **R** = Required. If not provided, escalation may be closed.
- **R*** = One of two R* items required.
- **P** = Preferred. Providing it could help speed up resolution.

### Pre-breach Prerequisite Table

| Area | Issue Type | NMID | Message Sample | HAR | EMT | UAL | Diags | Other | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Alerts | General | P | — | — | — | — | — | **R** | MDO alert ID; associated NMID if applicable |
| Alerts | Audit-based alert not generated/delayed | — | — | — | — | **R** | — | — | If UAL not found, work with Auditing first |
| Authentication | SPF/DKIM/DMARC unexpected timeouts/failures | **R** | P | — | — | — | — | **R** | Issue must be ongoing and quantified; TTLs at appropriate level; script output required |
| Inbound | Backscatter | **R** | R* | — | — | — | **R** | R* | For FN: Submission ID or message sample required |
| Inbound | Non-MS IP blocked; Spamhaus | — | — | — | — | — | — | **R** | Customer should work through Spamhaus site advice first. Only escalate in exceptional circumstances. |
| Malware | Common Attachment FP/FN | **R** | **R** | — | — | — | **R** | **R** | Support should repro first and provide Repro Steps plus email sample(s) |
| Outbound | MS-IP blocked (DNSBL) | — | — | — | — | — | — | **R** | Confirm which MS public IPs are still listed and whether list is reputable |
| Outbound | Blocked sender/restricted entities; rate limits | **R** | — | — | — | **R** | — | **R** | SendAs should be checked in UAL. Include all relevant outbound policies. |
| Outbound | Blocked sender; Outbound spam | **R** | R* | — | — | — | — | R* | Review block messages and customer's outbound spam policy. Submission IDs or message samples required. |
| Outbound | Recipient-side spam blocks | — | — | — | — | — | — | **R** | Investigation of HRDP vs. blocked on recipient side. Submissions IDs if HRDP. |
| Policy | General | — | — | P | — | — | — | **R** | Policy/rule data must be checked and provided. PowerShell preferred; HAR trace also works. |
| Quarantine | General | R* | — | — | — | — | — | R* | NMID or MessageId required |
| RBAC/URBAC | General | — | — | **R** | — | — | — | — | HAR from full page refresh required. Must contain TenantContext API call. |
| Safe Links | User did not click | — | — | — | — | — | **R** | **R** | Microsoft IPs involved and evidence of clicks required |
| Submissions | General | P | — | — | — | — | **R** | **R** | Submission IDs should be provided unless none were created |
| Submissions | User Reported Settings issues | **R** | — | — | — | — | **R** | **R** | Report submission policy analysis and sample NMIDs |
| TABL | FP/FN | **R** | P | — | — | — | **R** | **R** | Sample NMIDs/messages plus confirmation of customer's TABL entries |
| Impersonation | FP/FN | **R** | R* | — | — | — | — | R* | Submission ID or message sample required |
| Advanced Delivery | PhishSim: User did not click/MS clicked/not working | **R** | — | — | — | — | **R** | **R** | Review of AD config, diagnostic output. Details of alleged click where appropriate. |
| General mailflow | Issue with any message | **R** | P | — | P | — | **R** | — | — |
| General UI/portal issues | Something not displaying as expected | — | — | **R** | — | — | — | — | HAR from full page refresh required |

### Post-breach Prerequisite Table

| Area | Issue Type | NMID | TenantId | HAR | Screenshots/Recording | Forest | Other | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Remediation UX | General | — | **R** | — | **R** | **R** | **R** | RBAC roles; check f12 TenantContext API call |
| Remediation | General | **R** | **R** | — | **R** | **R** | **R** | Remediation ID |
| AIR UX | General | — | **R** | — | **R** | **R** | **R** | Investigation ID |
| AIR BE | General | **R** | **R** | — | **R** | **R** | **R** | InvestigationID |
| Hunting UX | General | — | **R** | R* | R* | — | **R** | Browser console logs; for data issues: HAR + screenshots + NMID/URL hash |
| Alerts | General | **R** | **R** | — | **R** | **R** | **R** | AlertID |
| Email Entity | General | — | **R** | — | **R** | **R** | **R** | — |
| Alert Policy UI | General | — | **R** | — | **R** | **R** | **R** | — |
| Threat Explorer | General | — | **R** | — | **R** | **R** | **R** | — |

### Attack Simulation Training Prerequisite Table

| Issue Type | TenantId | Sim Id/Name | Email Addresses | Training Id | Screenshot | URLValue | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AST Email Reminders not received | **R** | **R** | **R** | — | — | — | — |
| Backend - AS email not received | **R** | **R** | **R** | — | — | — | — |
| Backend - AS Not started | **R** | **R** | — | — | — | — | — |
| Completed Training Inconsistencies | **R** | — | **R** | **R** | — | — | — |
| Notification Message not received | **R** | **R** | **R** | — | — | — | — |
| FP | **R** | **R** | **R** | — | — | — | Confirm if 3rd-party system also scanning emails |
| Payload - HTML Tag Removed | **R** | — | — | — | **R** | — | Screenshots of addition and removal |
| Payload - Image rendering | **R** | **R** | — | — | **R** | **R** | Screenshot of the repro |
| Payload - Phishing link | **R** | **R** | — | — | — | **R** | — |
| Payload - Prohibited Wording | **R** | **R** | — | — | **R** | **R** | Screenshot of the repro |
| Payload - URL blocked | **R** | **R** | — | — | — | **R** | — |
| Predicted Compromise Rate Inconsistencies | **R** | — | — | — | — | **R** | — |
| QR Codes Delay or Failure | **R** | **R** | — | — | — | **R** | — |
| RBAC | **R** | **R** | **R** | — | — | — | Provide Entra/Azure Portal configurations |
| Report Data | **R** | **R** | **R** | — | — | — | — |
| UAX - Edit AS | **R** | **R** | — | — | — | **R** | — |
| UAX - Landing Page | **R** | **R** | — | — | **R** | **R** | Screenshot of the repro |
| UAX - Retention Data | **R** | — | — | — | — | **R** | — |

---

## Reference

- **NMID** – Network Message ID
- **HAR** – Captured in browser F12 Developer Tools; must be taken with user already logged in. See [Capture a browser trace for troubleshooting](https://learn.microsoft.com/en-us/azure/azure-portal/capture-browser-trace)
- **HAR full page refresh** – HAR recording from a full refresh of the web page until the issue is reproduced
- **EMT** – Extended Message Trace (most verbose version of message trace)
- **UAL** – Unified Audit Log search
