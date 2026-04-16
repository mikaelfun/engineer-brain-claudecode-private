# Defender Defender for Office / 邮件安全 — 排查工作流

**来源草稿**: mslearn-mdo-false-positive-negative-handling.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: MDO False Positive + False Negative Handling
> 来源: mslearn-mdo-false-positive-negative-handling.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. End user: Report as **Not junk** via built-in Report button in Outlook
2. End user: Add sender to **Safe Sender List**
3. Admin: Triage from **User reported** tab on Submissions page
4. Admin: Submit to Microsoft for analysis to understand why blocked
5. Admin: Create **allow entry** for sender in Tenant Allow/Block List if needed
6. Admin: Read verdict to understand root cause and improve org config
7. End user receives email digest about quarantined messages
8. End user can: preview, block sender, release, submit to Microsoft, request release from admin
9. Admin: View quarantined emails from review page
10. Admin: Release message + submit to Microsoft for analysis
11. Admin: Create temporary allow entry in Tenant Allow/Block List
12. Read verdict:
13. **Note**: Similar quarantined messages must be manually released (not automatic)
14. End user: Report as **Phishing** or **Junk** via built-in Report button
15. End user: Add sender to **Blocked Senders List** in Outlook
16. Admin: Triage from User reported tab on Submissions page
17. Admin: Submit to Microsoft for analysis
18. Admin: Create **block entry** for sender in Tenant Allow/Block List
19. Read verdict to understand why allowed and improve config
20. End user: Report as **phishing** via Report button

---
