# Defender Defender for Cloud Apps — 排查工作流

**来源草稿**: mslearn-cloud-apps-anomaly-detection-investigation.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Defender for Cloud Apps - Anomaly Detection Alert Investigation Guide
> 来源: mslearn-cloud-apps-anomaly-detection-investigation.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Review all user activities to understand potential threat scope
2. Compare device information with known devices (OS, browser, IP, location)
3. Check for other indicators of compromise (IoC)
4. Suspend user immediately
5. Mark as compromised
6. Reset password
7. Scan all devices for malware
8. Review all activity for IoC scope
9. Check for SMTP forwarding rules (including hidden ones)
10. Look for new inbox rules with names like "delete all", "...", or empty names
11. Check for increase in sent emails
12. Use MFCMAPI to find hidden rules if needed
13. Review permission levels requested
14. Check which users granted access
15. Consider banning the app
16. Investigate app store reputation (downloads, ratings, publisher)

---
