# EOP 21Vianet/Gallatin 功能差异与限制 - Quick Reference

**Entries**: 5 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Assist 365 Spam Verdict Reason diagnostic tool returns no results for 21v (Ga... | Feature gap: Assist 365 diagnostic tool and tenant explor... | Use alternative diagnostic methods for 21v: 1) EXO PowerShell (Connect-Exchan... | 🟢 9 | [OneNote] |
| 2 📋 | Assist 365 SPAM Verdict Reason diagnostic tool and tenant explorer not availa... | 21v/Gallatin environment does not support Assist 365 diag... | Manually inspect X-Forefront-Antispam-Report header from message headers to g... | 🟢 9 | [OneNote] |
| 3 📋 | User reported settings page visible in 21V SCC portal but backend infrastruct... | 21V Gallatin environment lacks backend infrastructure for... | Inform customer this is a known UI bug in 21V - the feature is not available;... | 🟢 8 | [OneNote] |
| 4 📋 | Cannot access quarantine messages via API in 21V (Gallatin) - Quarantine API ... | Quarantine API not supported in 21V environment (pending ... | Use MessageTrace Report API: 1) Register app in Azure AD, assign Exchange adm... | 🟢 8 | [OneNote] |
| 5 📋 | Report Message or Report Phishing button missing or not working in Outlook | Button availability depends on client type (Outlook Deskt... | 1) Confirm admin has configured Report Message correctly in admin center. 2) ... | 🔵 7.5 | [ADO Wiki] |

## Quick Troubleshooting Path

1. Use alternative diagnostic methods for 21v: 1) EXO PowerShell (Connect-ExchangeOnline -ExchangeEnvir `[OneNote]`
2. Manually inspect X-Forefront-Antispam-Report header from message headers to get SFS rule IDs `[OneNote]`
3. Inform customer this is a known UI bug in 21V - the feature is not available `[OneNote]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/21v-feature-gaps.md)
