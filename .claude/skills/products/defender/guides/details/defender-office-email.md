# DEFENDER Defender for Office / 邮件安全 — Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: mslearn-mdo-false-positive-negative-handling.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Mdo
> Sources: mslearn

**1. External sender receives NDR 550 5.7.606-649 'Access denied, banned sending IP' when sending email to Microsoft 365 recipients**

- **Root Cause**: The sender's IP address has been blocked by Microsoft 365 due to previous spam or suspicious activity
- **Solution**: Use the delist portal at https://sender.office.com/ to request removal from the blocked senders list; review IP/domain sending reputation and email authentication (SPF/DKIM/DMARC)
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

**2. External sender receives NDR 451 4.7.550 'Access denied, please try again later' when sending email to Microsoft 365**

- **Root Cause**: Microsoft 365 detected suspicious activity from the source IP and temporarily throttled/restricted mail from it
- **Solution**: Wait for Microsoft evaluation to complete; the restriction is automatically removed after messages are verified as legitimate
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

### Phase 2: Virtool
> Sources: onenote

**1. Security alert VirTool:Win32/DefenderTamperingRestore triggered on VMs after Windows Defender security intelligence update 1.299.1479.0**

- **Root Cause**: Security intelligence update 1.299.1479.0 introduced checks for WD default scan options; sub-optimal scanning config detected on enterprise machines triggers false detection
- **Solution**: Update to security intelligence 1.299.1496.0+ which scopes the check to consumer machines only. No further action needed unless customer explicitly wants non-optimal scanning options.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

### Phase 3: Security Alerts
> Sources: ado-wiki

**1. Customer reports false positive or false negative security alert in Microsoft Defender for Cloud, or requests to suppress a specific alert, or needs to test alert generation**

- **Solution**: Use ICM templates for escalation to Alert Platform Engineering Team: False positive/negative -> template B261e2 (https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=B261e2). Suppress alert -> template 04d52A. Testing alerts -> template wN1H32. First identify the alert provider using Kusto queries, then check boundaries before escalating.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 4: Network Protection
> Sources: mslearn

**1. Network protection blocks a safe website (false positive) or fails to block a known malicious website (false negative)**

- **Root Cause**: Prerequisites not met: real-time protection, behavior monitoring, cloud protection, or cloud connectivity not enabled; or audit mode still active
- **Solution**: Verify prerequisites: Win10 Pro/Enterprise 1709+, MDAV sole AV, real-time/behavior/cloud protection enabled. Use Set-MpPreference -EnableNetworkProtection AuditMode to test. Add exclusions via custom allow indicators or IP exclusions for FP.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 5: Defender Antivirus
> Sources: mslearn

**1. Defender Antivirus: false positive quarantined file cannot be restored until device reboots**

- **Root Cause**: Microsoft Defender Antivirus remediation process requires a reboot to complete all remediation steps; restoring a quarantined file before reboot may fail or cause incomplete cleanup
- **Solution**: Complete the device reboot first even for false positives; after reboot, restore the file from quarantine; then add the file/path to exclusions to prevent future false positive detections
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Security alert VirTool:Win32/DefenderTamperingRestore triggered on VMs after Windows Defender sec... | Security intelligence update 1.299.1479.0 introduced checks for WD default scan options; sub-opti... | Update to security intelligence 1.299.1496.0+ which scopes the check to consumer machines only. N... | 🟢 9.0 | OneNote |
| 2 | Customer reports false positive or false negative security alert in Microsoft Defender for Cloud,... |  | Use ICM templates for escalation to Alert Platform Engineering Team: False positive/negative -> t... | 🟢 8.5 | ADO Wiki |
| 3 | External sender receives NDR 550 5.7.606-649 'Access denied, banned sending IP' when sending emai... | The sender's IP address has been blocked by Microsoft 365 due to previous spam or suspicious acti... | Use the delist portal at https://sender.office.com/ to request removal from the blocked senders l... | 🔵 7.5 | MS Learn |
| 4 | External sender receives NDR 451 4.7.550 'Access denied, please try again later' when sending ema... | Microsoft 365 detected suspicious activity from the source IP and temporarily throttled/restricte... | Wait for Microsoft evaluation to complete; the restriction is automatically removed after message... | 🔵 7.5 | MS Learn |
| 5 ⚠️ | Network protection blocks a safe website (false positive) or fails to block a known malicious web... | Prerequisites not met: real-time protection, behavior monitoring, cloud protection, or cloud conn... | Verify prerequisites: Win10 Pro/Enterprise 1709+, MDAV sole AV, real-time/behavior/cloud protecti... | 🔵 6.0 | MS Learn |
| 6 ⚠️ | Defender Antivirus: false positive quarantined file cannot be restored until device reboots | Microsoft Defender Antivirus remediation process requires a reboot to complete all remediation st... | Complete the device reboot first even for false positives; after reboot, restore the file from qu... | 🔵 5.0 | MS Learn |
