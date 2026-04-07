# EOP Advanced Delivery 与钓鱼模拟 - Quick Reference

**Entries**: 5 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Third-party phishing simulation messages are being blocked or detonated by MD... | Third-party simulation tools are outside the scope of Mic... | Redirect to Advanced Delivery policy configuration. This is not an AST issue.... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Third-party phishing simulation emails still quarantined/junked despite Advan... | Multiple causes: 1) Sending IP AND P1/DKIM domain must BO... | Check Authentication-Results header for sending IP and P1/DKIM domain. Compar... | 🔵 7.5 | [ADO Wiki] |
| 3 📋 | Phishing simulation URLs still wrapped/rewritten by Safe Links despite Advanc... | Advanced Delivery prevents detonation but does NOT preven... | Do NOT use DoNotRewriteUrls with Advanced Delivery - incompatible. To prevent... | 🔵 7.5 | [ADO Wiki] |
| 4 📋 | IntraOrg email quarantined despite Advanced Delivery/SecOps config after enab... | Advanced Delivery only works for Inbound email. With intr... | Workarounds: 1) For SecOps: create separate anti-spam policy for SecOps mailb... | 🔵 7.5 | [ADO Wiki] |
| 5 📋 | Microsoft Attack Simulation Training simulation emails, training reminders, n... | Various potential causes depending on scenario (delivery ... | Collect minimum required logs before escalation per scenario: (1) Email/remin... | 🔵 7.5 | [ADO Wiki] |

## Quick Troubleshooting Path

1. Redirect to Advanced Delivery policy configuration. This is not an AST issue. Customer must configur `[ADO Wiki]`
2. Check Authentication-Results header for sending IP and P1/DKIM domain. Compare with Get-ExoPhishSimO `[ADO Wiki]`
3. Do NOT use DoNotRewriteUrls with Advanced Delivery - incompatible. To prevent wrapping, disable URL  `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/advanced-delivery-phishsim.md)
