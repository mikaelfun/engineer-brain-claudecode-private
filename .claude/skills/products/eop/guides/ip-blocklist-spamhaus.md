# EOP 外部 IP 黑名单 (Spamhaus/DNSBL) 与 Delist - Quick Reference

**Entries**: 6 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Emails rejected because sender IP address is listed on Spamhaus blocklist (CS... | Sender IP flagged by Spamhaus CSS for suspicious behavior... | Contact Spamhaus CSS team: 1) Go to https://contact-center.spamhaus.org/ sele... | 🟢 9 | [OneNote] |
| 2 📋 | Sending IP blocked by Spamhaus due to DNS configuration issues - HELO greetin... | Mail server HELO domain A record does not resolve to the ... | Align HELO/EHLO hostname with DNS: 1) A record of HELO domain must point to s... | 🟢 9 | [OneNote] |
| 3 📋 | Outbound email from Microsoft/MDO servers blocked by recipient; SMTP rejectio... | Microsoft outbound IP address listed on a third-party DNS... | 1. Confirm block is for Microsoft IP from actual SMTP response (not MXToolbox... | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | IP on Allow List but still blocked by Spamhaus | IP Allow List does NOT override Spamhaus. Neither Allow L... | Customer must delist from Spamhaus directly. For critical enterprise, tempora... | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | IP on Allow List but rejected by Microsoft internal services block list | Connection Filter does not bypass internal block list eve... | Sender must delist via https://sender.office.com. | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | Outbound IPs repeatedly listed by Spamhaus daily despite delisting - multi-IP... | Macro-enabled Excel attachments (.xlsm) sent to large rec... | 1) Stop sending macro-enabled attachments externally (use compressed+password... | 🟢 8 | [OneNote] |

## Quick Troubleshooting Path

1. Contact Spamhaus CSS team: 1) Go to https://contact-center.spamhaus.org/ select Other questions `[OneNote]`
2. Align HELO/EHLO hostname with DNS: 1) A record of HELO domain must point to sending IP `[OneNote]`
3. 1. Confirm block is for Microsoft IP from actual SMTP response (not MXToolbox) `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/ip-blocklist-spamhaus.md)
