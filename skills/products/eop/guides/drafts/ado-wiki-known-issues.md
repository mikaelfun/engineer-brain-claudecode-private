---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Known Issues"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Known%20Issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# MDO/EOP Known Issues (Comprehensive)

This page lists MDO issues currently tracked by engineering. Check here before escalating to identify if your scenario already has a work-item. Reference the known issue in your escalation.

## Alert Issues
- **Alerts not displaying all URLs** — limited to 10 URLs (Feature 6042301)

## Authentication Issues
- **DKIM cannot be enabled with *.onmicrosoft.de** — change to .com, recreate DKIM (IcM 613481576)
- **Spoof FNs with compauth 451 when MX not pointing to EOP** — fix inbound connector restrictions or escalate for DNS retry list
- **GCC DMARC for coexistence domain** — escalate to PG for *.mail.onmicrosoft.com DMARC record (BOD25)
- **DKIM No Key For Signature / SPF DMARC temperror** — 500ms DNS timeout; check NS latency. TSG: Auth timeouts wiki

## Common Attachments Issues
- **Blocking .COM files by subject line** — by-design security hardening. Release from quarantine if appropriate.
- **False Positive JS files in PGP encrypted emails** — fixed (Bug 7098831), fix rolling out

## Configuration/UI/Policy Issues
- **User tags not removed when user leaves** — Bug 6893227
- **Threat Policy "already exists" error** — orphaned policy without rule. Remove orphan via PS (Bug 5694112)
- **Threat Policy Scoping AND vs OR logic** — User Story 2953758, years old
- **Preset security policies require more than Security Administrator** — needs Org Configuration role (Task 6259924)
- **Cannot add trusted sender in Standard Preset** — use PS: Set-AntiPhishPolicy (Bug 6646002)
- **Spam filter policy save fails (invalid country codes)** — remove XJ/XE/XS/SS/EH via PS

## Inbound Issues
- **Message delay LED=420 SpamEngine** — service restart, HA ensures eventual delivery
- **451 4.7.500 AS112201 throttling** — escalate for override list (Bug 3397879)
- **NDR "Policy violation" for >20 nested attachments** — by design
- **Country block wrong IP attribution** — escalate to UserLocation team in IcM
- **NDRs delivered to Junk** — backscatter rule FP, escalate for override (Bug 4273311)

## Misc Known Issues
- **SecOps Portal not loading (multi-geo)** — workaround: admin in same forest as tenant default (Bug 6975391)
- **Sudden increase in Edge spam blocks** — by-design attribution change from Jan 2026
- **SpoofType misclassification** — Bug 5249302
- **Defender portal 10 URL limit** — Feature 6042301
- **Efficacy card numbers low** — DmarcRejectAction Quarantine bug (Bug 6881633)
- **Novel phishing with legitimate MS bills** — engage CFAR team
- **GCCH Domains tab hidden** — use URL portal.office365.us/adminportal/home#/Domains
- **Submission Overview Diagnostic >20 error** — narrow date range as workaround
- **ETR SCL -1 not working for Intra-Org** — by design, workaround: disable Intra-Org filtering

## Outbound Issues
- **View Message uses old Get-MessageTrace** — User Story 6896021
- **Internal recipients counted as External** — fix rolling out (User Story 6896094)
- **Autoforward relay pool (SPF AND DKIM required)** — undocumented; escalate for manual list 250 (Bug 5474602)
- **Malicious emails reach auto-forward recipients** — gap, routing before antispam (User Story 3911879)
- **Automatic System-controlled forwarding** — now equals "Off". High-volume customers on internal override list.

## TABL Known Issues
- **TABL multi-geo gap** — NAMPRD85/NAMP101/NAMP104/NAMP115 (User Story 6912383)
- **Get-TenantAllowBlockListItems missing entries** — try Remove-TenantAllowBlockListItems + sync
- **Cannot delete >18 entries** — User Story 6154832
- **Blank "modified by"** — User Story 5254128, check audit logs

## Submissions Known Issues
- **GCCHigh redirect to .com instead of .us** — Bug 6423184
- **Email submission via Graph crashes portal** — use emailContentThreatSubmission workaround (Bug 6702973)
- **Quarantine reports bypass User reported settings** — disable "Allow reporting" as workaround (Feature 4232420)
- **Submission "Primary/Secondary Data Missing"** — different recipient address (Bug 3076229)
- **Submission says clean but ML still flags** — ML verdict not in rescan (Bug 4318974), escalate FP to Analysts

## Quarantine Known Issues
- **Restore soft-deleted quarantine emails not supported** — no manual backend restore (Issue 5556775)
- **ZAPped emails not visible in quarantine** — Service Incident DZ1247911
- **Quarantine flyout error for recent messages** — metadata still ingesting (User Story 6133727)
- **Inbound marked as Outbound in quarantine** — by-design for connector traffic (User Story 3487119)
- **External recipient notified of outbound malware** — Bug 2642560
- **Notifications include released messages** — Bug 4061845
- **Notification delay beyond 4 hours** — Bug 3949535
- **Same disclaimer/display name for different languages** — Bug 3858737
- **Wrong language for on-prem mailbox** — Bug 2831492

## ZAP Issues
- **ZAP ignores TABL Sender Allow for HCP** — Feature 6044388. TABL URL Allow IS honored.
- **DLP quarantined mails zapped to inbox** — Bug 6099834

## Contact
Maintained by MDO EEE team. Questions: @MDOEEE
