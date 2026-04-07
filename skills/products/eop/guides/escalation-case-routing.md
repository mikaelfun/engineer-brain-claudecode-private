# EOP 升级流程与案例路由 - Quick Reference

**Entries**: 7 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Need to determine which team owns NDR (Non-Delivery Report) cases - MDO vs Ex... |  | MDO-scoped NDRs: 5.1.8 (Sender Denied by Policy), 5.1.90 (Recipient Blocked b... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Need to reopen a closed ADO/VSO issue AND simultaneously escalate it to CFL o... | Reopened issues cannot have their severity directly chang... | Create a new item at CFL or PSI level via Assist (e.g. aka.ms/assist); refere... | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | ADO/VSO issue has an auto-close comment stating the issue must not be reopened | Engineering has permanently closed the issue and added an... | Open a new ADO issue instead of reopening the existing one. Reference the ori... | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | MDO issue incorrectly routed to EEE ADO area paths — EEE triage is delayed or... | EEEs only handle IP Engineering\Customer Escalations\Data... | Re-route: Spam Analyst FP/FN non-configuration issues → aka.ms/fpfn; MDO esca... | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | Support case about to close with RED flag risk indicators: issue resolved by ... |  | Do NOT close the case yet even if customer authorized closure. Review case hi... | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | Unable to access DfM EU (Dynamics for Microsoft EU instance) after EU Data Bo... | AMT user profile not updated for EUDB, or account locked ... | 1) User provisioning issue: Manager updates AMT User profile. 2) Inactivity l... | 🟢 8.5 | [ADO Wiki] |
| 7 📋 | Customer unresponsive on Sev A / CritSit case for 120-180 minutes despite mul... | Customer unable or unwilling to maintain 24x7 engagement ... | 1) Verify expected response window passed, make multiple outreach attempts. 2... | 🟢 8.5 | [ADO Wiki] |

## Quick Troubleshooting Path

1. MDO-scoped NDRs: 5.1.8 (Sender Denied by Policy), 5.1.90 (Recipient Blocked by Policy), 5.7.703 (Ten `[ADO Wiki]`
2. Create a new item at CFL or PSI level via Assist (e.g. aka.ms/assist) `[ADO Wiki]`
3. Open a new ADO issue instead of reopening the existing one. Reference the original item in the new i `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/escalation-case-routing.md)
