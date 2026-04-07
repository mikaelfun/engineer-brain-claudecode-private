# EOP MDO 门户权限与 UI 问题 - Quick Reference

**Entries**: 6 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | X-Forefront-Antispam-Report header missing from email message headers | Some email clients may not display all headers; the heade... | Confirm message was scanned by EOP (check for EOP server names or Authenticat... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Microsoft Entra ID Licenses page shows 0/0 MDO Plan 1 or Plan 2 licenses assi... | MDO is a tenant-level Microsoft 365 service plan, NOT an ... | Validate MDO coverage in Microsoft 365 Admin Center > Billing > Your Products... | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Defender portal permissions not effective after activating role via PIM for G... | Defender RBAC and Unified RBAC (URBAC) roles cannot be as... | Prefer PIM for Entra Roles (direct activation, ~10-15 min propagation) over P... | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Customer receives 400 or 403 error when trying to access https://security.mic... | The /alerts page requires Defender for Office 365 Plan 2 ... | For P1/E3 customers, use https://security.microsoft.com/viewAlerts instead. I... | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | Detonation tree is not showing data on the Email Entity page in Microsoft Def... | Detonation tree is only created when dynamic analysis act... | Verify if the URL/file went through dynamic analysis: check if Safe Links was... | 🔵 7.5 | [ADO Wiki] |
| 6 📋 | Take Action button/option is not available or missing in Advanced Hunting for... | Missing URBAC permissions. The Take Action option require... | Assign the required URBAC permissions: Security data basic (read), Response (... | 🔵 7.5 | [ADO Wiki] |

## Quick Troubleshooting Path

1. Confirm message was scanned by EOP (check for EOP server names or Authentication-Results headers). I `[ADO Wiki]`
2. Validate MDO coverage in Microsoft 365 Admin Center > Billing > Your Products (not Entra ID). Verify `[ADO Wiki]`
3. Prefer PIM for Entra Roles (direct activation, ~10-15 min propagation) over PIM for Groups. If group `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/mdo-portal-permissions.md)
