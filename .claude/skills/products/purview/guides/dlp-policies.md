# Purview DLP 策略与告警 -- Quick Reference

**Entries**: 3 | **21V**: partial | **Confidence**: high
**Last updated**: 2026-04-07

## Symptom Lookup
| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | DLP policy with China Resident Identity Card (PRC) SIT at High confidence does not trigger - only 18... | Built-in China Resident Identity Card SIT has two patterns: Pattern 1 (High conf... | Set DLP policy instance confidence level to Medium instead of High if you want to detect bare 18-dig... | 🔵 7.5 | MCVKB/Sensitive information type_ China Resident Identit.md |
| 2 📋 | DLP policy tips not showing in Outlook/OWA despite policy being configured | Multiple causes: policy status mismatch (shows Test it out first), duplicate rul... | 1) Ensure only one rule per SIT instance count. 2) Enable MailTips: Outlook > Options > Mail > MailT... | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/data-loss-prevention/data-loss-prevention-policy-tips) |
| 3 📋 | Endpoint DLP policy not syncing to device: configuration status shows Not updated or Not available | Microsoft Defender Antivirus always-on protection or behavior monitoring not ena... | 1) Check device configuration in Purview portal > Settings > Device onboarding > Devices. 2) Enable ... | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/purview/dlp-edlp-tshoot-sync) |

## Quick Troubleshooting Path

1. Set DLP policy instance confidence level to Medium instead of High if you want to detect bare 18-digit ID numbers without surrounding keywords. Or ins... `[source: onenote]`
2. 1) Ensure only one rule per SIT instance count. 2) Enable MailTips: Outlook > Options > Mail > MailTips Options > enable Policy tip notification. 3) U... `[source: mslearn]`
3. 1) Check device configuration in Purview portal > Settings > Device onboarding > Devices. 2) Enable Defender Antivirus always-on protection and behavi... `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Full troubleshooting workflow](details/dlp-policies.md#troubleshooting-workflow)