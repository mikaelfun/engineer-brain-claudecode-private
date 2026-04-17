# EOP MDO 门户权限与 UI 问题 - Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 6 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-mdo-permissions-tsg.md, ado-wiki-a-how-to-check-user-permissions.md, ado-wiki-a-securitypermissionschecker-tool.md, ado-wiki-a-permissions-mapping.md, ado-wiki-a-get-rolesfromhar-script.md, ado-wiki-a-mdo-advanced-hunting.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Some email clients may not
> Source: ado-wiki

**Symptom**: X-Forefront-Antispam-Report header missing from email message headers
**Root Cause**: Some email clients may not display all headers; the header was stripped or message was not scanned by EOP

1. Confirm message was scanned by EOP (check for EOP server names or Authentication-Results headers). If header is missing, ask customer to use Outlook on the Web → three dots → View → View message details to get original headers.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: MDO is a tenant-level Microsoft
> Source: ado-wiki

**Symptom**: Microsoft Entra ID Licenses page shows 0/0 MDO Plan 1 or Plan 2 licenses assigned, admin concerned about licensing gap
**Root Cause**: MDO is a tenant-level Microsoft 365 service plan, NOT an Entra ID-assignable product. Per-user Entra assignment is not required; protections apply tenant-wide once subscription is active.

1. Validate MDO coverage in Microsoft 365 Admin Center > Billing > Your Products (not Entra ID). Verify Purchase Quantity covers all protected users. Quick checks: Safe Links/Anti-phishing policies editable = Plan 1 active
2. Threat Explorer available = Plan 2 active.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 3: Defender RBAC and Unified RBAC
> Source: ado-wiki

**Symptom**: Defender portal permissions not effective after activating role via PIM for Groups (indirect JIT); user cannot access expected features for up to 2 hours
**Root Cause**: Defender RBAC and Unified RBAC (URBAC) roles cannot be assigned directly through PIM. When using PIM for Groups as workaround, Defender may take up to 2 hours to detect new group members.

1. Prefer PIM for Entra Roles (direct activation, ~10-15 min propagation) over PIM for Groups. If group-scoped RBAC required, consider enrolling in preview feature 4581709 (reduces detection to ~5-15 min for legacy Defender RBAC). URBAC does not benefit from this preview.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 4: The /alerts page requires Defender
> Source: ado-wiki

**Symptom**: Customer receives 400 or 403 error when trying to access https://security.microsoft.com/alerts page in Microsoft Defender portal.
**Root Cause**: The /alerts page requires Defender for Office 365 Plan 2 (or E5) license, or another security product with E5/P2 license (e.g., MDE P2). Customers with P1/E3 license do not have access to this URL.

1. For P1/E3 customers, use https://security.microsoft.com/viewAlerts instead. If customer has P2/E5 and still gets 400/403, collect F12/HAR traces (must include TenantContext API call and Alerts page error request) plus PSR file, then open ICM to EOP/MDOCustomerEscalationsEEE (TIER 1).

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 5: Detonation tree is only created
> Source: ado-wiki

**Symptom**: Detonation tree is not showing data on the Email Entity page in Microsoft Defender portal for a URL or attachment analysis.
**Root Cause**: Detonation tree is only created when dynamic analysis actually occurs (Safe Links URL rewriting/click-time evaluation, active sandbox detonation). It is NOT created for: static-only verdicts (reput...

1. Verify if the URL/file went through dynamic analysis: check if Safe Links was enabled and if URL was clicked. For static verdicts or skipped analysis, no detonation tree is expected (by design). Check API endpoint /di/Find/OneCyberDetonationData for raw data if available.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 6: Missing URBAC permissions. The Take
> Source: ado-wiki

**Symptom**: Take Action button/option is not available or missing in Advanced Hunting for email remediation actions in Microsoft Defender portal.
**Root Cause**: Missing URBAC permissions. The Take Action option requires specific Defender XDR URBAC permissions: Security operations > Security data > Security data basic (read) > Response (manage) and Email & ...

1. Assign the required URBAC permissions: Security data basic (read), Response (manage), and Email & collaboration advanced actions (manage). Ensure user has MDO P2 license. If permissions are correctly assigned and Take Action still missing, verify URBAC is activated for MDO workload.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| X-Forefront-Antispam-Report header missing from email mes... | Some email clients may not | -> Phase 1 |
| Microsoft Entra ID Licenses page shows 0/0 MDO Plan 1 or ... | MDO is a tenant-level Microsoft | -> Phase 2 |
| Defender portal permissions not effective after activatin... | Defender RBAC and Unified RBAC | -> Phase 3 |
| Customer receives 400 or 403 error when trying to access ... | The /alerts page requires Defender | -> Phase 4 |
| Detonation tree is not showing data on the Email Entity p... | Detonation tree is only created | -> Phase 5 |
| Take Action button/option is not available or missing in ... | Missing URBAC permissions. The Take | -> Phase 6 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | X-Forefront-Antispam-Report header missing from email message headers | Some email clients may not display all headers; the heade... | Confirm message was scanned by EOP (check for EOP server names or Authenticat... | 🟢 8.5 | [ADO Wiki] |
| 2 | Microsoft Entra ID Licenses page shows 0/0 MDO Plan 1 or Plan 2 licenses assi... | MDO is a tenant-level Microsoft 365 service plan, NOT an ... | Validate MDO coverage in Microsoft 365 Admin Center > Billing > Your Products... | 🟢 8.5 | [ADO Wiki] |
| 3 | Defender portal permissions not effective after activating role via PIM for G... | Defender RBAC and Unified RBAC (URBAC) roles cannot be as... | Prefer PIM for Entra Roles (direct activation, ~10-15 min propagation) over P... | 🟢 8.5 | [ADO Wiki] |
| 4 | Customer receives 400 or 403 error when trying to access https://security.mic... | The /alerts page requires Defender for Office 365 Plan 2 ... | For P1/E3 customers, use https://security.microsoft.com/viewAlerts instead. I... | 🟢 8.5 | [ADO Wiki] |
| 5 | Detonation tree is not showing data on the Email Entity page in Microsoft Def... | Detonation tree is only created when dynamic analysis act... | Verify if the URL/file went through dynamic analysis: check if Safe Links was... | 🔵 7.5 | [ADO Wiki] |
| 6 | Take Action button/option is not available or missing in Advanced Hunting for... | Missing URBAC permissions. The Take Action option require... | Assign the required URBAC permissions: Security data basic (read), Response (... | 🔵 7.5 | [ADO Wiki] |
