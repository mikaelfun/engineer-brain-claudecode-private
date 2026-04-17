# EOP 合法邮件误判为垃圾邮件/钓鱼 (FP) - Quick Reference

**Entries**: 10 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Advanced Spam Filter (ASF) features causing false positives, especially SPF H... | ASF features are legacy and cause FPs. SPF Hard Fail disc... | Do NOT recommend ASF. Instead: proper SPF records with -all, DKIM for vanity ... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Legitimate email incorrectly classified as High Confidence Phishing (HPHISH) ... | EOP filtering engine misclassified the message as HPHISH;... | 1) Run MDO Message Explorer diagnostic in Assist 365 to identify HPHISH class... | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Email blocked or quarantined as malware by Common Attachment Filter detecting... | Security hardening change by Microsoft. Defender for Offi... | This is by design. Review and release blocked items through existing quaranti... | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Email delivered to Junk folder reported as FP, but X-Forefront-Antispam-Repor... | Inbox rules (user custom filters) moved the message to Ju... | Check X-Microsoft-Antispam-Mailbox-Delivery header for ucf:1/OFR:CustomRules.... | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | DocuSign emails are falsely flagged as malicious/phishing by Microsoft Defend... | EOP/MDO filtering engine incorrectly classifies legitimat... | 1. Follow standard FP/FN procedures; 2. If DocuSign provides samples, escalat... | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | Legitimate emails from China customers detected as malware due to URL scannin... | EOP URL scanning engine falsely flagged China-specific UR... | File FP escalation via Assist 365 > Exchange Online Analysts (FPFN) with Netw... | 🟢 8 | [OneNote] |
| 7 📋 | Legitimate emails blocked by domain blocklist (High confidence SPAM detection... | Sender domain incorrectly added to EOP domain blocklist c... | File FP escalation via Assist 365 > Exchange Online Analysts (FPFN); provide ... | 🟢 8 | [OneNote] |
| 8 📋 | Legitimate emails junked with spam verdict "detected as a Mail Bomb attack" (... | New Mail Bombing detection technology auto-tags subscript... | Use TABL Sender Allow for specific senders. To opt out entirely, escalate to ... | 🔵 7.5 | [ADO Wiki] |
| 9 📋 | 合法邮件被 EOP 错误标记为垃圾邮件（false positive），移至 Junk 文件夹或被隔离 | EOP anti-spam 过滤器误判，可能原因：1) SCL 评分过高; 2) BCL 阈值设置过低; 3) 反... | 1) 用户报告为 Not Junk，添加到 Safe Sender List; 2) 管理员从 Submissions 页面提交给 Microsoft 分... | 🔵 7.5 | [MS Learn] |
| 10 📋 | 启用 ASF (Advanced Spam Filter) 设置后，合法邮件被标记为 Spam 或 High confidence spam，出现意外的 ... | ASF 是 anti-spam policy 中的激进过滤设置，启用后会基于特定邮件属性（如 HTML 中的 if... | 1) 检查邮件 header 中的 X-CustomSpam 字段确认是哪个 ASF 设置触发; 2) 在 anti-spam policy 中将不需要的... | 🔵 7.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Do NOT recommend ASF. Instead: proper SPF records with -all, DKIM for vanity domains, DMARC policy.  `[ADO Wiki]`
2. 1) Run MDO Message Explorer diagnostic in Assist 365 to identify HPHISH classification reason. 2) Su `[ADO Wiki]`
3. This is by design. Review and release blocked items through existing quarantine workflows if appropr `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/false-positive-spam.md)
