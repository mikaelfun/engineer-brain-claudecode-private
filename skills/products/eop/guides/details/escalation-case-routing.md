# EOP 升级流程与案例路由 - Comprehensive Troubleshooting Guide

**Entries**: 7 | **Draft sources**: 23 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-collaboration-guidelines-mdo-exo.md, ado-wiki-a-when-to-collab-and-when-to-transfer.md, ado-wiki-a-deprecating-working-with-mdo-pre-breach-escalations-non-spam-analyst.md, ado-wiki-a-handling-dcr-and-code-fixes.md, ado-wiki-a-migration-to-icm.md, ado-wiki-a-icm-remediation-details.md, ado-wiki-b-SEV-B-24x7-Engagement-Escalation-Guidelines.md, ado-wiki-b-MDO-Escalations-Prerequisites-Checklist.md, ado-wiki-a-temporarily-lowered-critical-cases.md, ado-wiki-a-Defender-for-Cloud-Apps-MDA-Determining-Scope.md, ado-wiki-a-Defender-for-Identity-Scoping.md, ado-wiki-a-Exchange-On-Premise-Scope.md, ado-wiki-a-Exchange-Online-Determining-Scope.md, ado-wiki-a-Outlook-Desktop-Determining-Scope.md, ado-wiki-a-SIEM-Connectors-Determining-Scope.md, ado-wiki-a-SharePoint-OneDrive-Determining-Scope.md, ado-wiki-b-Case-Misroutes-Advanced-Hunting-Determining-Scope.md, ado-wiki-b-Case-Misroutes-Alerts-Determining-Scope.md, ado-wiki-b-Case-Misroutes-Azure-Permissions.md, ado-wiki-b-Case-Misroutes-CIRT-Determining-Scope.md, ado-wiki-a-handling-consumer-mailflow-issues.md, ado-wiki-a-delivery-partners-contacts.md, ado-wiki-a-partner-support-cases.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Unknown
> Source: ado-wiki

**Symptom**: Need to determine which team owns NDR (Non-Delivery Report) cases - MDO vs Exchange Online
**Root Cause**: 

1. MDO-scoped NDRs: 5.1.8 (Sender Denied by Policy), 5.1.90 (Recipient Blocked by Policy), 5.7.703 (Tenant Blocked from Sending), 5.7.705 (Message Rejected by Policy), 5.7.709 (URL Detonation Failure), 4.7.500 (Tenant Throttling). EXO-scoped NDRs: 5.1.0/5.1.1/5.1.10 (Recipient issues), 5.6.0 (Media), 5.4.14 (Hop Count), 5.3.1 (Mail System Full), 5.4.1/5.7.750 (Domain/sending domain), 5.4.6 (Routing Loop). Full list: https://learn.microsoft.com/exchange/troubleshoot/email-delivery/ndr/non-delivery-reports-in-exchange-online

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

**Symptom**: Support case about to close with RED flag risk indicators: issue resolved by customer without explanation, customer dissatisfied (workaround/not-supported/did-not-reproduce), SLA delays, multiple e...
**Root Cause**: 

1. Do NOT close the case yet even if customer authorized closure. Review case history for RED flags
2. discuss with TA/Mentor/Manager. Recovery actions: (1) give recovery call to gauge customer sentiment, (2) ask customer to share feedback, (3) engage CSAM for indirect sentiment, (4) ensure customer believes issue resolved to their satisfaction, (5) provide detailed case history summary covering milestones, troubleshooting, wait times to avoid misperceptions.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: Reopened issues cannot have their
> Source: ado-wiki

**Symptom**: Need to reopen a closed ADO/VSO issue AND simultaneously escalate it to CFL or PSI severity
**Root Cause**: Reopened issues cannot have their severity directly changed to CFL or PSI on the existing item; CFL/PSI items must be created fresh through Assist

1. Create a new item at CFL or PSI level via Assist (e.g. aka.ms/assist)
2. reference the original ADO in the new item. No need to reopen the old item.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 3: Engineering has permanently closed the
> Source: ado-wiki

**Symptom**: ADO/VSO issue has an auto-close comment stating the issue must not be reopened
**Root Cause**: Engineering has permanently closed the issue and added an explicit restriction against reopening; reopening would bypass engineering's decision

1. Open a new ADO issue instead of reopening the existing one. Reference the original item in the new issue for context.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 4: EEEs only handle IP Engineering\Customer
> Source: ado-wiki

**Symptom**: MDO issue incorrectly routed to EEE ADO area paths — EEE triage is delayed or rejects the issue; or issue is a Spam Analyst (FP/FN), Attack Simulator, or Post-breach (non-pre-breach alert) case fil...
**Root Cause**: EEEs only handle IP Engineering\Customer Escalations\Datacenter and IP Engineering\Customer Escalations\Org Security (excluding OSPREY). Spam Analyst, Attack Simulator, and Post-breach issues are o...

1. Re-route: Spam Analyst FP/FN non-configuration issues → aka.ms/fpfn
2. MDO escalations (post-breach, Attack Simulator) → aka.ms/MDOEscalate
3. Pre-breach alerts may be handled by EEEs. Do not file under OSPREY area path for EEE cases.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 5: AMT user profile not updated
> Source: ado-wiki

**Symptom**: Unable to access DfM EU (Dynamics for Microsoft EU instance) after EU Data Boundary migration; user provisioning or inactivity lockout prevents login to DfM EU environment
**Root Cause**: AMT user profile not updated for EUDB, or account locked due to inactivity; Core Identity EUDB AVD entitlement not requested

1. 1) User provisioning issue: Manager updates AMT User profile. 2) Inactivity lockout: Manager confirms AMT Profile. 3) Other DfM EU access issues: Create ticket with EUS (aka.ms/EUS). 4) Request Core Identity Access for EUDB AVD at coreidentity.microsoft.com/manage/Entitlement/entitlement/eudbavd-4wsd

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 6: Customer unable or unwilling to
> Source: ado-wiki

**Symptom**: Customer unresponsive on Sev A / CritSit case for 120-180 minutes despite multiple contact attempts (phone, email, Teams); customer not available 24x7 as required
**Root Cause**: Customer unable or unwilling to maintain 24x7 engagement required for Sev A / Sev 1 cases

1. 1) Verify expected response window passed, make multiple outreach attempts. 2) Confirm with TA/Manager. 3) Temporarily lower severity to Sev B. 4) Notify customer they can re-raise severity. 5) Email SCIMDM@microsoft.com + next region leads (APAC: MDOapacleads@, ATZ: MDOatzleads@, EMEA: MDOemealeads@microsoft.com). 6) Include case notes: Scope, Actions Taken, Business Status, Next Action.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Need to determine which team owns NDR (Non-Delivery Repor... | Unknown | -> Phase 1 |
| Need to reopen a closed ADO/VSO issue AND simultaneously ... | Reopened issues cannot have their | -> Phase 2 |
| ADO/VSO issue has an auto-close comment stating the issue... | Engineering has permanently closed the | -> Phase 3 |
| MDO issue incorrectly routed to EEE ADO area paths — EEE ... | EEEs only handle IP Engineering\Customer | -> Phase 4 |
| Unable to access DfM EU (Dynamics for Microsoft EU instan... | AMT user profile not updated | -> Phase 5 |
| Customer unresponsive on Sev A / CritSit case for 120-180... | Customer unable or unwilling to | -> Phase 6 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Need to determine which team owns NDR (Non-Delivery Report) cases - MDO vs Ex... |  | MDO-scoped NDRs: 5.1.8 (Sender Denied by Policy), 5.1.90 (Recipient Blocked b... | 🟢 8.5 | [ADO Wiki] |
| 2 | Need to reopen a closed ADO/VSO issue AND simultaneously escalate it to CFL o... | Reopened issues cannot have their severity directly chang... | Create a new item at CFL or PSI level via Assist (e.g. aka.ms/assist); refere... | 🟢 8.5 | [ADO Wiki] |
| 3 | ADO/VSO issue has an auto-close comment stating the issue must not be reopened | Engineering has permanently closed the issue and added an... | Open a new ADO issue instead of reopening the existing one. Reference the ori... | 🟢 8.5 | [ADO Wiki] |
| 4 | MDO issue incorrectly routed to EEE ADO area paths — EEE triage is delayed or... | EEEs only handle IP Engineering\Customer Escalations\Data... | Re-route: Spam Analyst FP/FN non-configuration issues → aka.ms/fpfn; MDO esca... | 🟢 8.5 | [ADO Wiki] |
| 5 | Support case about to close with RED flag risk indicators: issue resolved by ... |  | Do NOT close the case yet even if customer authorized closure. Review case hi... | 🟢 8.5 | [ADO Wiki] |
| 6 | Unable to access DfM EU (Dynamics for Microsoft EU instance) after EU Data Bo... | AMT user profile not updated for EUDB, or account locked ... | 1) User provisioning issue: Manager updates AMT User profile. 2) Inactivity l... | 🟢 8.5 | [ADO Wiki] |
| 7 | Customer unresponsive on Sev A / CritSit case for 120-180 minutes despite mul... | Customer unable or unwilling to maintain 24x7 engagement ... | 1) Verify expected response window passed, make multiple outreach attempts. 2... | 🟢 8.5 | [ADO Wiki] |
