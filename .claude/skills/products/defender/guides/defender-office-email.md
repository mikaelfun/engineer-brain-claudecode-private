# DEFENDER Defender for Office / 邮件安全 — Troubleshooting Quick Reference

**Entries**: 6 | **21V**: 4/6 applicable
**Sources**: ado-wiki, mslearn, onenote | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/defender-office-email.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Security alert VirTool:Win32/DefenderTamperingRestore triggered on VMs after Windows Defender sec... | Security intelligence update 1.299.1479.0 introduced checks for WD default scan options; sub-opti... | Update to security intelligence 1.299.1496.0+ which scopes the check to consumer machines only. N... | 🟢 9.0 | OneNote |
| 2 | Customer reports false positive or false negative security alert in Microsoft Defender for Cloud,... |  | Use ICM templates for escalation to Alert Platform Engineering Team: False positive/negative -> t... | 🟢 8.5 | ADO Wiki |
| 3 | External sender receives NDR 550 5.7.606-649 'Access denied, banned sending IP' when sending emai... | The sender's IP address has been blocked by Microsoft 365 due to previous spam or suspicious acti... | Use the delist portal at https://sender.office.com/ to request removal from the blocked senders l... | 🔵 7.5 | MS Learn |
| 4 | External sender receives NDR 451 4.7.550 'Access denied, please try again later' when sending ema... | Microsoft 365 detected suspicious activity from the source IP and temporarily throttled/restricte... | Wait for Microsoft evaluation to complete; the restriction is automatically removed after message... | 🔵 7.5 | MS Learn |
| 5 | Network protection blocks a safe website (false positive) or fails to block a known malicious web... | Prerequisites not met: real-time protection, behavior monitoring, cloud protection, or cloud conn... | Verify prerequisites: Win10 Pro/Enterprise 1709+, MDAV sole AV, real-time/behavior/cloud protecti... | 🔵 6.0 | MS Learn |
| 6 | Defender Antivirus: false positive quarantined file cannot be restored until device reboots | Microsoft Defender Antivirus remediation process requires a reboot to complete all remediation st... | Complete the device reboot first even for false positives; after reboot, restore the file from qu... | 🔵 5.0 | MS Learn |

## Quick Troubleshooting Path

1. Update to security intelligence 1.299.1496.0+ which scopes the check to consumer machines only. No further action needed unless customer explicitly wants non-optimal scanning options. `[Source: OneNote]`
2. Use ICM templates for escalation to Alert Platform Engineering Team: False positive/negative -> template B261e2 (https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=B261e2). Suppress alert... `[Source: ADO Wiki]`
3. Use the delist portal at https://sender.office.com/ to request removal from the blocked senders list; review IP/domain sending reputation and email authentication (SPF/DKIM/DMARC) `[Source: MS Learn]`
4. Wait for Microsoft evaluation to complete; the restriction is automatically removed after messages are verified as legitimate `[Source: MS Learn]`
5. Verify prerequisites: Win10 Pro/Enterprise 1709+, MDAV sole AV, real-time/behavior/cloud protection enabled. Use Set-MpPreference -EnableNetworkProtection AuditMode to test. Add exclusions via cust... `[Source: MS Learn]`
