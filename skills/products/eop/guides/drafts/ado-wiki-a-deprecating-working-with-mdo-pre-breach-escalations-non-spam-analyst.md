---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Drafts/[Deprecating] Working with MDO Pre-breach escalations (non-Spam Analyst)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Drafts/%5BDeprecating%5D%20Working%20with%20MDO%20Pre-breach%20escalations%20(non-Spam%20Analyst)"
importDate: "2026-04-05"
type: troubleshooting-guide
note: "[Deprecating] as of 2025-04-01 new issues are created in IcM, not ADO. Legacy ADO escalation reference."
---

The page describes how best to work with MDO EEEs, for legacy ADOs only. New issues are being created in IcM, since 2025-04-01.

[[_TOC_]]

## About MDO EEEs and areas in-scope
EEEs (Embedded Escalation Engineers) work directly with engineering, and on issues under the following ADO Area Paths:
- IP Engineering\Customer Escalations\Datacenter
- IP Engineering\Customer Escalations\Org Security
- ...except IP Engineering\Customer Escalations\Org Security\OSPREY (this path is for the Spam Analysts team)

EEEs are able to resolve a high proportion of issues without engaging engineering. Where needed, they engage specialist engineering teams in your issues.

### What EEEs don't handle / common misroutes:
- Spam Analyst issues (FP/FN non-configuration issues - see [aka.ms/fpfn](https://aka.ms/fpfn)
- MDO Attack Simulator
- Post-breach, except pre-breach alerts - see [aka.ms/MDOEscalate](https://aka.ms/MDOEscalate)

## ADO (VSO) ETAs - Severity Matrix

MDO EEEs currently aim to triage and process issues as follows. Note that you may have been instructed to no longer use certain severities (1 + 2):

| SEVERITY | Initial triage | Status updates |
| --- | --- | --- |
| CFL/PSI* | 1 hour (24x7x365) | Every 4 hours (every 1 hour if entire tenant is impacted) |
| CritSit* (OED tenants only) | 2 hours (24x7x365) | Every 4 hours (every 1 hour if entire tenant is impacted) |
| Sev 1 | Next triage, not to exceed 72hr | Every 1 business day (US) |
| Sev 2 | Next triage, not to exceed 72hr | Every 2 business days (US) |
| Sev 3 | Next triage, not to exceed 72hr | Weekly |
| DCR | 30-days for a reject/accept decision | N/A |
| RFC | 30-days for an initial response | N/A |

\* CFL, PSI and CritSit issues are not handled by EEEs. They will normally be worked from the IcM; not ADO item. See [1] below for IcM severities.

## Chasing issues
Note: some teams may have been instructed to follow up with their TL/TA, rather than chasing issues directly.
You should only ask to chase ADOs that are outside the ETAs above. EEEs can follow up on your behalf with engineering, for the ADO paths/areas that they support (see 'About MDO EEEs' below).
You can ping a local EEE directly, or email mdoeee@microsoft.com.

## Raising Severity
- If you need to open at CFL or PSI level, you will need to create a new item for that through Assist. You can reference the new item in the old one, but there's no need to reopen it.
- If you need to raise (or lower) severity, be aware that the ETA "clock" will restart when you make the change. Expect an update from the EEE/engineering side within the ETA of the new severity, starting from when you make the change.
- Do not change the 'Priority' field. This is not the same as Severity and is not used by support.

## Reopening ADOs (VSOs)
- If you need to reopen an issue, but also need to upgrade the severity to CFL or PSI level, you will need to create a new item for that through Assist. You can reference the new item in the old one, but there's no need to reopen it.
- If you need to reopen an issue, unless expressly asked, always clear the Assigned To (owner) field after setting the status from 'Closed' to 'Active'.
- Do not reopen issues that have the auto-close comment, stating that the issue must not be reopened. Open a new issue instead.

## DOs and DON'Ts

### DO
- Use TSGs (troubleshooting guides) in our wikis, diagnostics in Assist and public documentation/articles to help you investigate before escalating
- Click Save after adding attachments
- Clear the Assigned To (owner) field when reopening an issue
- Be clear about the 'Business Impact' of an issue, especially for higher severity issues
- Add NetworkMessageIds, Message-Ids, SubmissionIds, error messages, where you are unable to add attachments into an issue

### DON'T
- Raise a high severity issue without any justification in the Business Impact field
- Write vague or unclear issue descriptions
- Assign issues directly to engineers, unless you have explicitly been told to do so
- Provide incomplete or old data
- Push for an answer inside ETAs. Instead, consider increasing the issue severity, if there is sufficient business impact.

## [1] IcM severities matrix

| SEVERITY | Initial triage | Status updates |
| --- | --- | --- |
| CFL/PSI | 1 hour (24x7x365) | Every 4 hours (every 1 hour if entire tenant is impacted) |
| CritSit (OED tenants only) | 2 hours (24x7x365) | Every 4 hours (every 1 hour if entire tenant is impacted) |
| Sev 3 | Next triage, not to exceed 72hr | Weekly |
| DCR | 30-days for a reject/accept decision | N/A |
| RFC | 30-days for an initial response | N/A |
